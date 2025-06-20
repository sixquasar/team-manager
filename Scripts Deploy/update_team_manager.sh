#!/bin/bash

#################################################################
#                                                               #
#        SCRIPT DE ATUALIZAÇÃO - TEAM MANAGER                  #
#        Baseado no deploy_team_manager_complete.sh            #
#        Versão: 1.0.0                                         #
#        Data: 20/06/2025                                      #
#                                                               #
#################################################################

# Configurações do Team Manager
VERSION="1.0.0"
APP_NAME="Team Manager"
DOMAIN="admin.sixquasar.pro"
REPO_URL="https://github.com/sixquasar/team-manager.git"
BRANCH="main"
APP_DIR="/var/www/team-manager"
GIT_USER="sixquasar"
GIT_EMAIL="sixquasar07@gmail.com"

# Cores para output
VERMELHO='\033[0;31m'
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
MAGENTA='\033[0;35m'
CIANO='\033[0;36m'
RESET='\033[0m'
NEGRITO='\033[1m'

# Arquivo de checkpoint
CHECKPOINT_FILE="/tmp/team_manager_update_checkpoint"
TOTAL_PHASES=6

# Função para logs
log() {
    local message=$1
    local type=${2:-"info"}
    local phase=${3:-""}
    
    case $type in
        "success")
            echo -e "${VERDE}✅ $message${RESET}"
            ;;
        "error")
            echo -e "${VERMELHO}❌ $message${RESET}"
            ;;
        "warning")
            echo -e "${AMARELO}⚠️  $message${RESET}"
            ;;
        "phase")
            echo ""
            echo -e "${AZUL}${NEGRITO}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
            echo -e "${AZUL}${NEGRITO}📌 FASE $phase: $message${RESET}"
            echo -e "${AZUL}${NEGRITO}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
            ;;
        *)
            echo -e "${CIANO}ℹ️  $message${RESET}"
            ;;
    esac
}

# Função para mostrar progresso
show_progress() {
    local current=$1
    local total=$TOTAL_PHASES
    local percent=$((current * 100 / total))
    local filled=$((percent / 5))
    
    echo -ne "\r${AZUL}Progresso: ["
    for ((i=0; i<20; i++)); do
        if [ $i -lt $filled ]; then
            echo -ne "█"
        else
            echo -ne "░"
        fi
    done
    echo -ne "] $percent% (Fase $current de $total)${RESET}"
}

# Função para salvar checkpoint
create_checkpoint() {
    echo $1 > $CHECKPOINT_FILE
    log "Checkpoint salvo: Fase $1" "info"
}

# Função para verificar checkpoint
check_checkpoint() {
    if [ -f "$CHECKPOINT_FILE" ]; then
        cat "$CHECKPOINT_FILE"
    else
        echo "0"
    fi
}

# Função para limpar checkpoint
clear_checkpoint() {
    rm -f $CHECKPOINT_FILE
}

# Função para verificar erro
check_error() {
    if [ $1 -ne 0 ]; then
        log "$2" "error"
        exit 1
    fi
}

# Função para confirmar ação
confirm_action() {
    local message=$1
    echo -e "${AMARELO}$message (s/N):${RESET} "
    read -r response
    case "$response" in
        [sS][iI][mM]|[sS]|[yY][eE][sS]|[yY]) 
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# FASE 1: Verificação inicial
verificacao_inicial() {
    log "Verificação inicial do sistema" "phase" "1"
    show_progress 1
    
    # Verificar se está rodando como root
    if [ "$EUID" -ne 0 ]; then 
        log "Este script precisa ser executado como root (use sudo)" "error"
        exit 1
    fi
    
    # Verificar se diretório da aplicação existe
    if [ ! -d "$APP_DIR" ]; then
        log "Diretório da aplicação não encontrado: $APP_DIR" "error"
        log "Execute primeiro o script de deploy completo" "error"
        exit 1
    fi
    
    # Verificar se é um repositório git
    if [ ! -d "$APP_DIR/.git" ]; then
        log "Diretório não é um repositório git válido" "error"
        exit 1
    fi
    
    # Verificar conectividade
    log "Verificando conectividade..." "info"
    if ! ping -c 1 google.com &> /dev/null; then
        log "Sem conexão com a internet" "error"
        exit 1
    fi
    log "Conectividade OK" "success"
    
    # Verificar se Nginx está rodando
    if ! systemctl is-active --quiet nginx; then
        log "Nginx não está rodando" "warning"
        log "Tentando iniciar Nginx..." "info"
        systemctl start nginx
        if ! systemctl is-active --quiet nginx; then
            log "Falha ao iniciar Nginx" "error"
            exit 1
        fi
    fi
    log "Nginx está rodando" "success"
    
    create_checkpoint 1
}

# FASE 2: Backup dos arquivos atuais
backup_atual() {
    log "Backup dos arquivos atuais" "phase" "2"
    show_progress 2
    
    cd "$APP_DIR"
    
    # Criar diretório de backup
    BACKUP_DIR="/tmp/team-manager-backup-$(date +%Y%m%d_%H%M%S)"
    log "Criando backup em: $BACKUP_DIR" "info"
    
    # Backup da aplicação atual
    if [ -d "dist" ]; then
        mkdir -p "$BACKUP_DIR"
        cp -r dist "$BACKUP_DIR/"
        log "Backup da aplicação criado" "success"
    else
        log "Nenhuma aplicação anterior encontrada para backup" "warning"
    fi
    
    # Backup do .env se existir
    if [ -f ".env" ]; then
        cp .env "$BACKUP_DIR/"
        log "Backup do .env criado" "success"
    fi
    
    create_checkpoint 2
}

# FASE 3: Atualizar repositório
atualizar_repositorio() {
    log "Atualização do repositório" "phase" "3"
    show_progress 3
    
    cd "$APP_DIR"
    
    # Configurar Git
    log "Configurando Git..." "info"
    git config user.name "$GIT_USER"
    git config user.email "$GIT_EMAIL"
    
    # Verificar status atual
    log "Verificando status do repositório..." "info"
    git status --porcelain
    
    # Salvar mudanças locais se existirem
    if [ -n "$(git status --porcelain)" ]; then
        log "Salvando mudanças locais..." "warning"
        git stash push -m "Auto-stash antes da atualização $(date +%Y%m%d_%H%M%S)"
    fi
    
    # Buscar atualizações
    log "Buscando atualizações..." "info"
    git fetch origin
    check_error $? "Falha ao buscar atualizações"
    
    # Verificar se há atualizações disponíveis
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/$BRANCH)
    
    if [ "$LOCAL" = "$REMOTE" ]; then
        log "Repositório já está atualizado" "success"
    else
        log "Novas atualizações encontradas" "info"
        
        # Mostrar mudanças
        log "Mudanças a serem aplicadas:" "info"
        git log --oneline $LOCAL..$REMOTE
        
        # Aplicar atualizações
        log "Aplicando atualizações..." "info"
        git reset --hard origin/$BRANCH
        check_error $? "Falha ao aplicar atualizações"
        
        log "Repositório atualizado com sucesso" "success"
    fi
    
    create_checkpoint 3
}

# FASE 4: Atualizar dependências
atualizar_dependencias() {
    log "Atualização de dependências" "phase" "4"
    show_progress 4
    
    cd "$APP_DIR"
    
    # Verificar se package.json existe
    if [ ! -f "package.json" ]; then
        log "package.json não encontrado" "error"
        exit 1
    fi
    
    # Limpar instalações anteriores para atualização limpa
    log "Limpando node_modules anterior..." "info"
    rm -rf node_modules package-lock.json
    
    # Instalar dependências atualizadas
    log "Instalando dependências..." "info"
    npm install
    check_error $? "Falha ao instalar dependências"
    
    # Verificar instalação
    if [ ! -d "node_modules" ]; then
        log "Falha na instalação das dependências" "error"
        exit 1
    fi
    
    DEPS_COUNT=$(ls node_modules | wc -l)
    log "Dependências atualizadas: $DEPS_COUNT pacotes" "success"
    
    create_checkpoint 4
}

# FASE 5: Build da aplicação
build_aplicacao() {
    log "Build da aplicação" "phase" "5"
    show_progress 5
    
    cd "$APP_DIR"
    
    # Limpar build anterior
    if [ -d "dist" ]; then
        log "Removendo build anterior..." "info"
        rm -rf dist
    fi
    
    # Executar build
    log "Executando build de produção..." "info"
    npm run build
    check_error $? "Falha no build da aplicação"
    
    # Verificar se build foi criado
    if [ ! -d "dist" ]; then
        log "Diretório dist não foi criado" "error"
        exit 1
    fi
    
    if [ ! -f "dist/index.html" ]; then
        log "Arquivo index.html não encontrado no build" "error"
        exit 1
    fi
    
    # Contar arquivos no build
    BUILD_FILES=$(find dist -type f | wc -l)
    log "Build concluído: $BUILD_FILES arquivos gerados" "success"
    
    # Ajustar permissões
    log "Ajustando permissões..." "info"
    chown -R www-data:www-data dist
    chmod -R 755 dist
    
    create_checkpoint 5
}

# FASE 6: Reiniciar serviços
reiniciar_servicos() {
    log "Reiniciando serviços" "phase" "6"
    show_progress 6
    
    # Testar configuração do Nginx
    log "Testando configuração do Nginx..." "info"
    nginx -t
    check_error $? "Configuração do Nginx inválida"
    
    # Recarregar Nginx
    log "Recarregando Nginx..." "info"
    systemctl reload nginx
    check_error $? "Falha ao recarregar Nginx"
    
    # Verificar status
    if systemctl is-active --quiet nginx; then
        log "Nginx recarregado com sucesso" "success"
    else
        log "Nginx não está rodando corretamente" "error"
        exit 1
    fi
    
    create_checkpoint 6
}

# Função para mostrar status final
status_final() {
    echo ""
    echo -e "${VERDE}${NEGRITO}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${VERDE}${NEGRITO}✅ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!${RESET}"
    echo -e "${VERDE}${NEGRITO}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo ""
    echo -e "${AZUL}📋 RESUMO DA ATUALIZAÇÃO:${RESET}"
    echo -e "  ${VERDE}✓${RESET} Sistema: Team Manager v$VERSION"
    echo -e "  ${VERDE}✓${RESET} Domínio: $DOMAIN"
    echo -e "  ${VERDE}✓${RESET} Diretório: $APP_DIR"
    echo -e "  ${VERDE}✓${RESET} Build: $(find $APP_DIR/dist -type f | wc -l) arquivos"
    echo -e "  ${VERDE}✓${RESET} Commit atual: $(cd $APP_DIR && git log --oneline -1)"
    echo ""
    echo -e "${AZUL}🌐 ACESSO:${RESET}"
    echo -e "  ${VERDE}➜${RESET} HTTP: http://$DOMAIN"
    
    if [ -f "/etc/letsencrypt/live/$DOMAIN/cert.pem" ]; then
        echo -e "  ${VERDE}➜${RESET} HTTPS: https://$DOMAIN"
    fi
    
    echo ""
    echo -e "${AZUL}📝 INFORMAÇÕES:${RESET}"
    echo -e "  - Backup anterior salvo em: $(ls -t /tmp/team-manager-backup-* 2>/dev/null | head -1 || echo 'Nenhum backup')"
    echo -e "  - Logs do Nginx: /var/log/nginx/team-manager.*.log"
    echo ""
    
    # Limpar checkpoint
    clear_checkpoint
}

# Função para executar todas as fases
executar_atualizacao() {
    local start_phase=$(check_checkpoint)
    
    if [ "$start_phase" -gt 0 ] && [ "$start_phase" -lt $TOTAL_PHASES ]; then
        log "Checkpoint encontrado na fase $start_phase" "info"
        if confirm_action "Deseja continuar do checkpoint?"; then
            log "Continuando da fase $start_phase" "info"
        else
            start_phase=0
            clear_checkpoint
        fi
    fi
    
    # Executar fases
    [ "$start_phase" -lt 1 ] && verificacao_inicial
    [ "$start_phase" -lt 2 ] && backup_atual
    [ "$start_phase" -lt 3 ] && atualizar_repositorio
    [ "$start_phase" -lt 4 ] && atualizar_dependencias
    [ "$start_phase" -lt 5 ] && build_aplicacao
    [ "$start_phase" -lt 6 ] && reiniciar_servicos
    
    status_final
}

# Função principal
main() {
    clear
    echo ""
    echo -e "${AZUL}${NEGRITO}╔══════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${AZUL}${NEGRITO}║                                                              ║${RESET}"
    echo -e "${AZUL}${NEGRITO}║  ${VERDE}████████╗███████╗ █████╗ ███╗   ███╗${AZUL}                       ║${RESET}"
    echo -e "${AZUL}${NEGRITO}║  ${VERDE}╚══██╔══╝██╔════╝██╔══██╗████╗ ████║${AZUL}                       ║${RESET}"
    echo -e "${AZUL}${NEGRITO}║  ${VERDE}   ██║   █████╗  ███████║██╔████╔██║${AZUL}                       ║${RESET}"
    echo -e "${AZUL}${NEGRITO}║  ${VERDE}   ██║   ██╔══╝  ██╔══██║██║╚██╔╝██║${AZUL}                       ║${RESET}"
    echo -e "${AZUL}${NEGRITO}║  ${VERDE}   ██║   ███████╗██║  ██║██║ ╚═╝ ██║${AZUL}                       ║${RESET}"
    echo -e "${AZUL}${NEGRITO}║  ${VERDE}   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝${AZUL}                       ║${RESET}"
    echo -e "${AZUL}${NEGRITO}║                                                              ║${RESET}"
    echo -e "${AZUL}${NEGRITO}║  ${VERDE}███╗   ███╗ █████╗ ███╗   ██╗ █████╗  ██████╗ ███████╗██████╗${AZUL}║${RESET}"
    echo -e "${AZUL}${NEGRITO}║  ${VERDE}████╗ ████║██╔══██╗████╗  ██║██╔══██╗██╔════╝ ██╔════╝██╔══██╗${AZUL}║${RESET}"
    echo -e "${AZUL}${NEGRITO}║  ${VERDE}██╔████╔██║███████║██╔██╗ ██║███████║██║  ███╗█████╗  ██████╔╝${AZUL}║${RESET}"
    echo -e "${AZUL}${NEGRITO}║  ${VERDE}██║╚██╔╝██║██╔══██║██║╚██╗██║██╔══██║██║   ██║██╔══╝  ██╔══██╗${AZUL}║${RESET}"
    echo -e "${AZUL}${NEGRITO}║  ${VERDE}██║ ╚═╝ ██║██║  ██║██║ ╚████║██║  ██║╚██████╔╝███████╗██║  ██║${AZUL}║${RESET}"
    echo -e "${AZUL}${NEGRITO}║  ${VERDE}╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝${AZUL}║${RESET}"
    echo -e "${AZUL}${NEGRITO}║                                                              ║${RESET}"
    echo -e "${AZUL}${NEGRITO}║          ${AMARELO}🔄 SCRIPT DE ATUALIZAÇÃO v$VERSION 🔄${AZUL}           ║${RESET}"
    echo -e "${AZUL}${NEGRITO}║                                                              ║${RESET}"
    echo -e "${AZUL}${NEGRITO}╚══════════════════════════════════════════════════════════════╝${RESET}"
    echo ""
    echo -e "${MAGENTA}📋 Configurações:${RESET}"
    echo -e "   ${CIANO}Domínio:${RESET} $DOMAIN"
    echo -e "   ${CIANO}Diretório:${RESET} $APP_DIR"
    echo -e "   ${CIANO}Branch:${RESET} $BRANCH"
    echo ""
    echo -e "${AZUL}🔄 Este script irá:${RESET}"
    echo -e "   1. Verificar sistema e conectividade"
    echo -e "   2. Fazer backup da aplicação atual"
    echo -e "   3. Atualizar código do repositório"
    echo -e "   4. Atualizar dependências NPM"
    echo -e "   5. Gerar novo build de produção"
    echo -e "   6. Reiniciar serviços"
    echo ""
    
    if confirm_action "Iniciar atualização do Team Manager?"; then
        executar_atualizacao
    else
        log "Atualização cancelada pelo usuário" "warning"
        exit 0
    fi
}

# Executar
main