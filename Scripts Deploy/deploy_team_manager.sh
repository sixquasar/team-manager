#!/bin/bash

# =====================================================
# TEAM MANAGER - DEPLOY SCRIPT
# =====================================================
# Domínio: admin.sixquasar.pro
# Servidor: 96.43.96.30
# Repositório: https://github.com/sixquasar/team-manager
# =====================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
RESET='\033[0m'
BOLD='\033[1m'

# ASCII Art do Team Manager
echo -e "${CYAN}${BOLD}"
cat << "EOF"
████████ ███████  █████  ███    ███     ███    ███  █████  ███    ██  █████   ██████  ███████ ██████  
   ██    ██      ██   ██ ████  ████     ████  ████ ██   ██ ████   ██ ██   ██ ██       ██      ██   ██ 
   ██    █████   ███████ ██ ████ ██     ██ ████ ██ ███████ ██ ██  ██ ███████ ██   ███ █████   ██████  
   ██    ██      ██   ██ ██  ██  ██     ██  ██  ██ ██   ██ ██  ██ ██ ██   ██ ██    ██ ██      ██   ██ 
   ██    ███████ ██   ██ ██      ██     ██      ██ ██   ██ ██   ████ ██   ██  ██████  ███████ ██   ██ 

                                 🚀 Sistema de Gestão de Equipe 🚀
                                      admin.sixquasar.pro
EOF
echo -e "${RESET}"

# Configurações
PROJECT_DIR="/var/www/team-manager"
DOMAIN="admin.sixquasar.pro"
REPO_URL="https://github.com/sixquasar/team-manager.git"
NODE_VERSION="18"

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${RESET}"
}

error() {
    echo -e "${RED}[ERROR] $1${RESET}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${RESET}"
}

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
    error "Este script deve ser executado como root (use sudo)"
fi

log "🚀 Iniciando deploy do Team Manager..."

# =====================================================
# FASE 1: PREPARAÇÃO DO SISTEMA
# =====================================================
log "📋 Fase 1: Preparação do sistema"

# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependências básicas
apt install -y curl wget git nginx certbot python3-certbot-nginx ufw

# Instalar Node.js
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
fi

log "✅ Node.js $(node --version) instalado"
log "✅ NPM $(npm --version) instalado"

# =====================================================
# FASE 2: CONFIGURAÇÃO DO FIREWALL
# =====================================================
log "🔥 Fase 2: Configuração do firewall"

ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

log "✅ Firewall configurado"

# =====================================================
# FASE 3: CLONE E BUILD DO PROJETO
# =====================================================
log "📦 Fase 3: Clone e build do projeto"

# Remover diretório existente se houver
if [ -d "$PROJECT_DIR" ]; then
    rm -rf "$PROJECT_DIR"
fi

# Clone do repositório
git clone "$REPO_URL" "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Criar arquivo .env para produção
cat > .env << EOF
VITE_APP_NAME=Team Manager
VITE_APP_VERSION=1.0.0
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOF

log "✅ Arquivo .env criado"

# Instalar dependências
npm install

# Build do projeto
npm run build

log "✅ Projeto buildado com sucesso"

# =====================================================
# FASE 4: CONFIGURAÇÃO DO NGINX
# =====================================================
log "🌐 Fase 4: Configuração do Nginx"

# Backup da configuração existente
if [ -f "/etc/nginx/sites-available/$DOMAIN" ]; then
    mv "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-available/$DOMAIN.backup.$(date +%s)"
fi

# Criar configuração do Nginx
cat > "/etc/nginx/sites-available/$DOMAIN" << EOF
server {
    listen 80;
    server_name $DOMAIN;
    root $PROJECT_DIR/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate pre-check=0 post-check=0 auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # SPA configuration
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API routes (se houver)
    location /api/ {
        # Configuração para API se necessário
    }

    # Block common exploit attempts
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Ativar site
ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"

# Remover site padrão
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t || error "Erro na configuração do Nginx"

# Recarregar Nginx
systemctl reload nginx

log "✅ Nginx configurado"

# =====================================================
# FASE 5: CONFIGURAÇÃO SSL
# =====================================================
log "🔒 Fase 5: Configuração SSL"

# Solicitar certificado SSL
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@sixquasar.pro --redirect

log "✅ SSL configurado"

# =====================================================
# FASE 6: PERMISSÕES E PROPRIEDADE
# =====================================================
log "🔐 Fase 6: Configuração de permissões"

# Definir propriedade correta
chown -R www-data:www-data "$PROJECT_DIR"
chmod -R 755 "$PROJECT_DIR"

log "✅ Permissões configuradas"

# =====================================================
# FASE 7: VERIFICAÇÕES FINAIS
# =====================================================
log "🔍 Fase 7: Verificações finais"

# Verificar se o Nginx está rodando
systemctl status nginx --no-pager

# Verificar se o site está acessível
if curl -f -s "http://$DOMAIN" > /dev/null; then
    log "✅ Site acessível via HTTP"
else
    warning "⚠️  Site pode não estar acessível via HTTP"
fi

if curl -f -s "https://$DOMAIN" > /dev/null; then
    log "✅ Site acessível via HTTPS"
else
    warning "⚠️  Site pode não estar acessível via HTTPS"
fi

# =====================================================
# FINALIZAÇÃO
# =====================================================
echo -e "\n${GREEN}${BOLD}🎉 DEPLOY CONCLUÍDO COM SUCESSO! 🎉${RESET}\n"

echo -e "${CYAN}${BOLD}📊 INFORMAÇÕES DO DEPLOY:${RESET}"
echo -e "${WHITE}Domínio: ${GREEN}https://$DOMAIN${RESET}"
echo -e "${WHITE}Diretório: ${GREEN}$PROJECT_DIR${RESET}"
echo -e "${WHITE}Nginx: ${GREEN}Configurado e rodando${RESET}"
echo -e "${WHITE}SSL: ${GREEN}Certificado ativo${RESET}"
echo -e "${WHITE}Firewall: ${GREEN}Configurado${RESET}"

echo -e "\n${YELLOW}${BOLD}📋 PRÓXIMOS PASSOS:${RESET}"
echo -e "${WHITE}1. Configure as variáveis do Supabase no arquivo .env${RESET}"
echo -e "${WHITE}2. Execute o SQL 'SISTEMA_TEAM_MANAGER_COMPLETO.sql' no Supabase${RESET}"
echo -e "${WHITE}3. Teste o login com os usuários padrão:${RESET}"
echo -e "${GREEN}   • ricardo@techsquad.com / senha123${RESET}"
echo -e "${GREEN}   • leonardo@techsquad.com / senha123${RESET}"
echo -e "${GREEN}   • rodrigo@techsquad.com / senha123${RESET}"

echo -e "\n${CYAN}${BOLD}🔧 COMANDOS ÚTEIS:${RESET}"
echo -e "${WHITE}Reiniciar Nginx: ${CYAN}sudo systemctl restart nginx${RESET}"
echo -e "${WHITE}Ver logs Nginx: ${CYAN}sudo tail -f /var/log/nginx/error.log${RESET}"
echo -e "${WHITE}Atualizar código: ${CYAN}cd $PROJECT_DIR && git pull && npm run build${RESET}"

echo -e "\n${GREEN}${BOLD}✨ Team Manager está online em: https://$DOMAIN ✨${RESET}\n"