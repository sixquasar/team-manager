#!/bin/bash

#################################################################
#                    ATUALIZAÇÃO RÁPIDA                         #
#                     TEAM MANAGER                              #
#                    Versão: 2.0.0                              #
#################################################################

# Configurações
APP_DIR="/var/www/team-manager"
BRANCH="main"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função de log simples
log() {
    case $2 in
        error) echo -e "${RED}❌ $1${NC}" && exit 1 ;;
        success) echo -e "${GREEN}✅ $1${NC}" ;;
        info) echo -e "${BLUE}➜ $1${NC}" ;;
        warning) echo -e "${YELLOW}⚠️  $1${NC}" ;;
        *) echo -e "  $1" ;;
    esac
}

# Header
echo -e "\n${BLUE}🚀 ATUALIZAÇÃO RÁPIDA - TEAM MANAGER${NC}\n"

# Verificações essenciais
[ "$EUID" -ne 0 ] && log "Execute com sudo" error
[ ! -d "$APP_DIR/.git" ] && log "Diretório $APP_DIR inválido" error

cd "$APP_DIR" || exit 1

# 1. ATUALIZAR CÓDIGO
log "Buscando atualizações..." info
BEFORE_PULL=$(git rev-parse HEAD)
git pull origin $BRANCH --quiet

if [ $? -ne 0 ]; then
    log "Falha ao atualizar código" error
fi

AFTER_PULL=$(git rev-parse HEAD)

if [ "$BEFORE_PULL" = "$AFTER_PULL" ]; then
    log "Nenhuma atualização disponível" warning
    echo -e "\n${GREEN}✨ Sistema já está atualizado!${NC}\n"
    exit 0
fi

# Mostrar commits novos
echo -e "\n${BLUE}📋 Atualizações aplicadas:${NC}"
git log --oneline $BEFORE_PULL..$AFTER_PULL | head -10

# 2. VERIFICAR DEPENDÊNCIAS
if git diff $BEFORE_PULL $AFTER_PULL --name-only | grep -q "package.json"; then
    log "\nAtualizando dependências..." info
    npm ci --silent || npm install --silent
    [ $? -ne 0 ] && log "Falha ao instalar dependências" error
    log "Dependências atualizadas" success
fi

# 3. BUILD DA APLICAÇÃO
log "\nGerando build de produção..." info
npm run build --silent
[ $? -ne 0 ] && log "Falha no build" error

# Ajustar permissões
chown -R www-data:www-data dist
log "Build concluído" success

# 4. REINICIAR SERVIÇOS
log "\nReiniciando serviços..." info

# Backend (se existir)
if systemctl list-unit-files | grep -q "team-manager-backend.service"; then
    systemctl restart team-manager-backend
    sleep 2
    
    if systemctl is-active --quiet team-manager-backend; then
        log "Backend reiniciado" success
    else
        log "Backend com problemas - verifique: journalctl -u team-manager-backend -n 20" warning
    fi
fi

# Nginx
systemctl reload nginx
[ $? -eq 0 ] && log "Nginx recarregado" success || log "Falha ao recarregar Nginx" error

# 5. STATUS FINAL
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n📊 Resumo:"
echo -e "  • Commit: $(git log --oneline -1)"
echo -e "  • Build: $(find dist -type f | wc -l) arquivos"
echo -e "  • URL: https://admin.sixquasar.pro"

# Comandos úteis
echo -e "\n💡 Comandos úteis:"
echo -e "  • Logs backend: ${BLUE}journalctl -u team-manager-backend -f${NC}"
echo -e "  • Status: ${BLUE}systemctl status team-manager-backend${NC}"
echo -e "  • Logs nginx: ${BLUE}tail -f /var/log/nginx/team-manager.error.log${NC}"

echo "" # Linha em branco final