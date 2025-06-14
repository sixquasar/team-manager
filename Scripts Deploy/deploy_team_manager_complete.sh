#!/bin/bash

#################################################################
#                                                               #
#        SCRIPT DE DEPLOY COMPLETO - TEAM MANAGER               #
#        Baseado no deploy_heliogen_complete.sh                 #
#        Versão: 2.0.0                                          #
#        Data: 12/06/2025                                       #
#                                                               #
#################################################################

# Configurações do Team Manager
VERSION="2.0.0"
APP_NAME="Team Manager"
DOMAIN="admin.sixquasar.pro"
VPS_IP="96.43.96.30"
REPO_URL="https://github.com/sixquasar/team-manager.git"
BRANCH="main"
APP_DIR="/var/www/team-manager"
EMAIL="sixquasar07@gmail.com"
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
CHECKPOINT_FILE="/tmp/team_manager_deploy_checkpoint"
TOTAL_PHASES=12

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
    
    # Verificar sistema operacional
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        log "Sistema detectado: $NAME $VERSION" "info"
    else
        log "Sistema operacional não identificado" "warning"
    fi
    
    # Verificar conectividade
    log "Verificando conectividade..." "info"
    if ! ping -c 1 google.com &> /dev/null; then
        log "Sem conexão com a internet" "error"
        exit 1
    fi
    log "Conectividade OK" "success"
    
    create_checkpoint 1
}

# FASE 2: Atualização do sistema
atualizar_sistema() {
    log "Atualização do sistema" "phase" "2"
    show_progress 2
    
    # Detectar gerenciador de pacotes
    if command -v apt-get >/dev/null 2>&1; then
        PKG_MANAGER="apt-get"
        WEB_SERVER_USER="www-data"
    elif command -v yum >/dev/null 2>&1; then
        PKG_MANAGER="yum"
        WEB_SERVER_USER="nginx"
    else
        log "Gerenciador de pacotes não suportado" "error"
        exit 1
    fi
    
    log "Atualizando lista de pacotes..." "info"
    $PKG_MANAGER update -y
    check_error $? "Falha ao atualizar lista de pacotes"
    
    log "Sistema atualizado" "success"
    create_checkpoint 2
}

# FASE 3: Instalar dependências do sistema
instalar_dependencias() {
    log "Instalação de dependências do sistema" "phase" "3"
    show_progress 3
    
    log "Instalando pacotes necessários..." "info"
    
    if [ "$PKG_MANAGER" = "apt-get" ]; then
        export DEBIAN_FRONTEND=noninteractive
        apt-get install -y curl wget git nginx ufw software-properties-common \
            dnsutils build-essential certbot python3-certbot-nginx
    else
        yum install -y epel-release
        yum install -y curl wget git nginx firewalld bind-utils gcc gcc-c++ make \
            certbot python3-certbot-nginx
    fi
    
    check_error $? "Falha ao instalar dependências"
    
    log "Dependências instaladas" "success"
    create_checkpoint 3
}

# FASE 4: Instalar Node.js
instalar_nodejs() {
    log "Instalação do Node.js" "phase" "4"
    show_progress 4
    
    # Verificar se Node.js já está instalado
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        log "Node.js já instalado: $NODE_VERSION" "info"
        
        # Verificar se é versão adequada (>= 16)
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | cut -dv -f2)
        if [ "$NODE_MAJOR" -ge 16 ]; then
            log "Versão do Node.js adequada" "success"
            create_checkpoint 4
            return 0
        else
            log "Versão do Node.js muito antiga, atualizando..." "warning"
        fi
    fi
    
    # Instalar Node.js LTS
    log "Instalando Node.js LTS..." "info"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    $PKG_MANAGER install -y nodejs
    
    check_error $? "Falha ao instalar Node.js"
    
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    log "Node.js instalado: $NODE_VERSION" "success"
    log "NPM instalado: $NPM_VERSION" "success"
    
    create_checkpoint 4
}

# FASE 5: Clonar repositório
clonar_repositorio() {
    log "Clonagem do repositório" "phase" "5"
    show_progress 5
    
    # Configurar Git
    log "Configurando Git..." "info"
    git config --global user.name "$GIT_USER"
    git config --global user.email "$GIT_EMAIL"
    
    # Verificar se diretório existe
    if [ -d "$APP_DIR" ]; then
        log "Diretório $APP_DIR já existe" "warning"
        
        if [ -d "$APP_DIR/.git" ]; then
            log "Atualizando repositório existente..." "info"
            cd "$APP_DIR"
            git fetch origin
            git reset --hard origin/$BRANCH
            git pull origin $BRANCH
            check_error $? "Falha ao atualizar repositório"
            log "Repositório atualizado" "success"
        else
            log "Removendo diretório antigo..." "info"
            rm -rf "$APP_DIR"
            
            log "Clonando repositório..." "info"
            git clone -b $BRANCH $REPO_URL $APP_DIR
            check_error $? "Falha ao clonar repositório"
        fi
    else
        log "Clonando repositório..." "info"
        mkdir -p $(dirname "$APP_DIR")
        git clone -b $BRANCH $REPO_URL $APP_DIR
        check_error $? "Falha ao clonar repositório"
    fi
    
    # Verificar se clone foi bem sucedido
    if [ ! -f "$APP_DIR/package.json" ]; then
        log "Repositório clonado não contém package.json" "error"
        exit 1
    fi
    
    log "Repositório clonado com sucesso" "success"
    create_checkpoint 5
}

# FASE 6: Instalar dependências do projeto
instalar_dependencias_projeto() {
    log "Instalação de dependências do projeto" "phase" "6"
    show_progress 6
    
    cd "$APP_DIR"
    
    # Limpar instalações anteriores
    if [ -d "node_modules" ]; then
        log "Removendo node_modules anterior..." "info"
        rm -rf node_modules package-lock.json
    fi
    
    # Instalar dependências
    log "Instalando dependências NPM..." "info"
    npm install
    check_error $? "Falha ao instalar dependências NPM"
    
    # Verificar instalação
    if [ ! -d "node_modules" ]; then
        log "Falha na instalação das dependências" "error"
        exit 1
    fi
    
    DEPS_COUNT=$(ls node_modules | wc -l)
    log "Dependências instaladas: $DEPS_COUNT pacotes" "success"
    
    create_checkpoint 6
}

# FASE 7: Configurar variáveis de ambiente
configurar_env() {
    log "Configuração de variáveis de ambiente" "phase" "7"
    show_progress 7
    
    cd "$APP_DIR"
    
    # Criar arquivo .env se não existir
    if [ ! -f ".env" ]; then
        log "Criando arquivo .env..." "info"
        
        cat > .env << EOF
# Configurações do Team Manager
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
EOF
        
        log "Arquivo .env criado" "success"
        log "IMPORTANTE: Configure as variáveis do Supabase no arquivo .env" "warning"
    else
        log "Arquivo .env já existe" "info"
    fi
    
    create_checkpoint 7
}

# FASE 8: Build do projeto
build_projeto() {
    log "Build do projeto" "phase" "8"
    show_progress 8
    
    cd "$APP_DIR"
    
    # Limpar build anterior
    if [ -d "dist" ]; then
        log "Removendo build anterior..." "info"
        rm -rf dist
    fi
    
    # Executar build
    log "Executando build de produção..." "info"
    npm run build
    check_error $? "Falha no build do projeto"
    
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
    
    create_checkpoint 8
}

# FASE 9: Configurar Nginx
configurar_nginx() {
    log "Configuração do Nginx" "phase" "9"
    show_progress 9
    
    # Parar Nginx
    systemctl stop nginx 2>/dev/null || true
    
    # Limpar configurações antigas
    log "Limpando configurações antigas..." "info"
    rm -f /etc/nginx/sites-enabled/team-manager* 
    rm -f /etc/nginx/sites-enabled/admin.sixquasar.pro
    rm -f /etc/nginx/sites-available/team-manager*
    rm -f /etc/nginx/sites-available/admin.sixquasar.pro
    
    # Criar configuração
    log "Criando configuração do Nginx..." "info"
    
    cat > /etc/nginx/sites-available/team-manager << 'NGINX_CONF'
# Configuração Nginx para Team Manager
server {
    listen 80;
    server_name admin.sixquasar.pro;
    
    root /var/www/team-manager/dist;
    index index.html;
    
    # Logs
    access_log /var/log/nginx/team-manager.access.log;
    error_log /var/log/nginx/team-manager.error.log;
    
    # Configuração SPA - Estilo HelioGen
    location / {
        try_files $uri $uri/ @fallback;
        
        # Headers de segurança
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    }
    
    # Fallback para SPA
    location @fallback {
        rewrite ^.*$ /index.html last;
    }
    
    # Cache para assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }
    
    # Compressão
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/json application/xml+rss;
}
NGINX_CONF
    
    # Ativar site
    ln -sf /etc/nginx/sites-available/team-manager /etc/nginx/sites-enabled/
    
    # Criar diretórios de log
    mkdir -p /var/log/nginx
    touch /var/log/nginx/team-manager.access.log
    touch /var/log/nginx/team-manager.error.log
    
    # Ajustar permissões
    chown -R $WEB_SERVER_USER:$WEB_SERVER_USER $APP_DIR/dist
    chmod -R 755 $APP_DIR/dist
    
    # Testar configuração
    log "Testando configuração do Nginx..." "info"
    nginx -t
    check_error $? "Configuração do Nginx inválida"
    
    log "Nginx configurado com sucesso" "success"
    create_checkpoint 9
}

# FASE 10: Configurar SSL
configurar_ssl() {
    log "Configuração SSL" "phase" "10"
    show_progress 10
    
    # Iniciar Nginx temporariamente para validação
    systemctl start nginx
    
    if confirm_action "Deseja configurar SSL com Let's Encrypt?"; then
        log "Obtendo certificado SSL..." "info"
        
        certbot --nginx -d $DOMAIN --non-interactive --agree-tos \
            --email $EMAIL --redirect --expand
        
        if [ $? -eq 0 ]; then
            log "Certificado SSL instalado com sucesso" "success"
        else
            log "Falha ao obter certificado SSL" "warning"
            log "Você pode configurar SSL manualmente mais tarde" "info"
        fi
    else
        log "Pulando configuração SSL" "info"
    fi
    
    create_checkpoint 10
}

# FASE 11: Configurar firewall
configurar_firewall() {
    log "Configuração do firewall" "phase" "11"
    show_progress 11
    
    if command -v ufw >/dev/null 2>&1; then
        log "Configurando UFW..." "info"
        
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 'Nginx Full'
        
        # Ativar firewall se não estiver ativo
        if ! ufw status | grep -q "Status: active"; then
            echo "y" | ufw enable
        fi
        
        log "Firewall configurado" "success"
        
    elif command -v firewall-cmd >/dev/null 2>&1; then
        log "Configurando Firewalld..." "info"
        
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --reload
        
        log "Firewall configurado" "success"
    else
        log "Nenhum firewall detectado" "warning"
    fi
    
    create_checkpoint 11
}

# FASE 12: Iniciar serviços
iniciar_servicos() {
    log "Iniciando serviços" "phase" "12"
    show_progress 12
    
    # Reiniciar Nginx
    log "Reiniciando Nginx..." "info"
    systemctl restart nginx
    systemctl enable nginx
    check_error $? "Falha ao iniciar Nginx"
    
    # Verificar status
    if systemctl is-active --quiet nginx; then
        log "Nginx está rodando" "success"
    else
        log "Nginx não está rodando" "error"
        exit 1
    fi
    
    create_checkpoint 12
}

# Função para mostrar status final
status_final() {
    echo ""
    echo -e "${VERDE}${NEGRITO}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${VERDE}${NEGRITO}✅ DEPLOY CONCLUÍDO COM SUCESSO!${RESET}"
    echo -e "${VERDE}${NEGRITO}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo ""
    echo -e "${AZUL}📋 RESUMO DA INSTALAÇÃO:${RESET}"
    echo -e "  ${VERDE}✓${RESET} Sistema: Team Manager v$VERSION"
    echo -e "  ${VERDE}✓${RESET} Domínio: $DOMAIN"
    echo -e "  ${VERDE}✓${RESET} Diretório: $APP_DIR"
    echo -e "  ${VERDE}✓${RESET} Build: $(find $APP_DIR/dist -type f | wc -l) arquivos"
    echo ""
    echo -e "${AZUL}🌐 ACESSO:${RESET}"
    echo -e "  ${VERDE}➜${RESET} HTTP: http://$DOMAIN"
    
    if [ -f "/etc/letsencrypt/live/$DOMAIN/cert.pem" ]; then
        echo -e "  ${VERDE}➜${RESET} HTTPS: https://$DOMAIN"
    fi
    
    echo ""
    echo -e "${AZUL}📝 PRÓXIMOS PASSOS:${RESET}"
    echo -e "  1. Configure as variáveis do Supabase em: $APP_DIR/.env"
    echo -e "  2. Execute o SQL schema no Supabase"
    echo -e "  3. Teste o login com os usuários padrão"
    echo ""
    echo -e "${AMARELO}⚠️  IMPORTANTE:${RESET}"
    echo -e "  - Usuários padrão: ricardo/ana/carlos@techsquad.com (senha: senha123)"
    echo -e "  - Logs do Nginx: /var/log/nginx/team-manager.*.log"
    echo ""
    
    # Limpar checkpoint
    clear_checkpoint
}

# Função para executar todas as fases
executar_deploy() {
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
    [ "$start_phase" -lt 2 ] && atualizar_sistema
    [ "$start_phase" -lt 3 ] && instalar_dependencias
    [ "$start_phase" -lt 4 ] && instalar_nodejs
    [ "$start_phase" -lt 5 ] && clonar_repositorio
    [ "$start_phase" -lt 6 ] && instalar_dependencias_projeto
    [ "$start_phase" -lt 7 ] && configurar_env
    [ "$start_phase" -lt 8 ] && build_projeto
    [ "$start_phase" -lt 9 ] && configurar_nginx
    [ "$start_phase" -lt 10 ] && configurar_ssl
    [ "$start_phase" -lt 11 ] && configurar_firewall
    [ "$start_phase" -lt 12 ] && iniciar_servicos
    
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
    echo -e "${AZUL}${NEGRITO}║          ${AMARELO}🚀 DEPLOY AUTOMATIZADO v$VERSION 🚀${AZUL}              ║${RESET}"
    echo -e "${AZUL}${NEGRITO}║                                                              ║${RESET}"
    echo -e "${AZUL}${NEGRITO}╚══════════════════════════════════════════════════════════════╝${RESET}"
    echo ""
    echo -e "${MAGENTA}📋 Configurações:${RESET}"
    echo -e "   ${CIANO}Domínio:${RESET} $DOMAIN"
    echo -e "   ${CIANO}IP:${RESET} $VPS_IP"
    echo -e "   ${CIANO}Diretório:${RESET} $APP_DIR"
    echo ""
    
    if confirm_action "Iniciar deploy do Team Manager?"; then
        executar_deploy
    else
        log "Deploy cancelado pelo usuário" "warning"
        exit 0
    fi
}

# Executar
main