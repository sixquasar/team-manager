#!/bin/bash

# ============================================================================
# TEAM MANAGER - DEPLOY COMPLETO COM TODAS AS NUANCES
# Script robusto com sistema de checkpoints, logs detalhados e recuperação de falhas
# Baseado na estrutura do deploy_heliogen_complete.sh mas 100% adaptado para Team Manager
# ============================================================================

# Versão do script
VERSION="1.0.0"

# Cores para formatação do terminal
VERDE='\033[0;32m'
VERMELHO='\033[0;31m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
MAGENTA='\033[0;35m'
RESET='\033[0m'
NEGRITO='\033[1m'
SUBLINHADO='\033[4m'

# Diretório do script para arquivos de configuração
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHECKPOINT_FILE="${SCRIPT_DIR}/.deploy_team_manager_checkpoint"
LOG_FILE="${SCRIPT_DIR}/deploy_team_manager_$(date +%Y%m%d_%H%M%S).log"

# Inicializar variáveis de configuração
NON_INTERACTIVE=false
DEBUG=false

# Configurações padrão do Team Manager
DOMAIN="admin.sixquasar.pro"
VPS_IP="96.43.96.30"
APP_DIR="/var/www/team-manager"
REPO_URL="https://github.com/sixquasar/team-manager.git"
BRANCH="main"

# Arquivo SQL de configuração
SQL_FILE="${SCRIPT_DIR}/../SQL's - HelioGen/SISTEMA_TEAM_MANAGER_COMPLETO.sql"
EMAIL="sixquasar07@gmail.com"
SERVICE_NAME="team-manager-frontend"

# Configurações DNS Cloudflare (opcionais)
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-}"
CLOUDFLARE_ZONE_ID="${CLOUDFLARE_ZONE_ID:-}"

# Variável global para armazenar o domínio configurado
CONFIGURED_DOMAIN=""

# Função de log - DEVE estar no início do script
log() {
    local message="$1"
    local type="$2"
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    
    case $type in
        "info")
            echo -e "${AZUL}[INFO]${RESET} ${timestamp} - ${message}" | tee -a $LOG_FILE
            ;;
        "success")
            echo -e "${VERDE}[SUCESSO]${RESET} ${timestamp} - ${message}" | tee -a $LOG_FILE
            ;;
        "warning")
            echo -e "${AMARELO}[AVISO]${RESET} ${timestamp} - ${message}" | tee -a $LOG_FILE
            ;;
        "error")
            echo -e "${VERMELHO}[ERRO]${RESET} ${timestamp} - ${message}" | tee -a $LOG_FILE
            ;;
        "phase")
            echo -e "\n${MAGENTA}${NEGRITO}${SUBLINHADO}[FASE $3]${RESET} ${MAGENTA}${NEGRITO}${message}${RESET}" | tee -a $LOG_FILE
            echo -e "==========================================" | tee -a $LOG_FILE
            ;;
        *)
            echo -e "${timestamp} - ${message}" | tee -a $LOG_FILE
            ;;
    esac
}

# Função para criar checkpoint
create_checkpoint() {
    local phase="$1"
    echo "$phase" > $CHECKPOINT_FILE
    log "Checkpoint criado: Fase $phase" "info"
}

# Função para carregar checkpoint
load_checkpoint() {
    if [ -f $CHECKPOINT_FILE ]; then
        local phase=$(cat $CHECKPOINT_FILE)
        log "Checkpoint encontrado: Fase $phase" "info"
        echo $phase
    else
        log "Nenhum checkpoint encontrado. Iniciando do começo." "info"
        echo 0
    fi
}

# Função para solicitar confirmação do usuário
confirm_action() {
    local prompt="$1"
    local auto_confirm="${2:-false}"
    
    # Se auto_confirm estiver habilitado, confirmar automaticamente
    if [ "$auto_confirm" = "true" ] || [ "$NON_INTERACTIVE" = "true" ]; then
        log "Auto-confirmando: $prompt" "info"
        return 0
    fi
    
    # Caso contrário, pedir confirmação interativa
    read -p "$prompt (s/n): " choice
    
    case "$choice" in
        s|S|sim|SIM|Sim|y|Y|yes|YES|Yes)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Função para verificar erro e interromper em caso de falha
check_error() {
    local status=$1
    local message="$2"
    local is_critical="${3:-true}"
    
    if [ $status -ne 0 ]; then
        log "$message" "error"
        
        if [ "$is_critical" = "true" ]; then
            if confirm_action "ERRO CRÍTICO: $message. Este erro pode comprometer o funcionamento da aplicação. Deseja continuar mesmo assim?"; then
                log "Usuário optou por continuar após erro crítico" "warning"
                return 0
            else
                log "Deploy interrompido pelo usuário após erro" "error"
                exit 1
            fi
        else
            log "Erro não crítico detectado" "warning"
            return 0
        fi
    fi
    
    return 0
}

# Função para mostrar progresso
show_progress() {
    local phase="$1"
    local total="11"
    local percentage=$((phase * 100 / total))
    
    echo -e "${AZUL}Progresso do deploy: Fase $phase de $total ($percentage%)${RESET}"
    echo -e "[${VERDE}$(printf "%0.s#" $(seq 1 $phase))${RESET}$(printf "%0.s-" $(seq 1 $((total - phase))))] $percentage%"
}

# Função para resetar o checkpoint atual
reset_checkpoint() {
    log "Resetando checkpoint anterior..." "warning"
    if [ -f "$CHECKPOINT_FILE" ]; then
        rm -f "$CHECKPOINT_FILE"
        log "Checkpoint removido. O deploy começará do início na próxima execução." "success"
    else
        log "Nenhum checkpoint encontrado para resetar." "info"
    fi
}

# Processar argumentos imediatamente
if [ $# -gt 0 ]; then
    case "$1" in
        --help|-h)
            echo -e "${VERDE}${NEGRITO}Team Manager - Deploy Completo${RESET}"
            echo -e "Versão: ${VERSION}\n"
            echo -e "Uso: $0 [OPÇÃO]"
            echo -e "Opções:"
            echo -e "  -h, --help      Exibe esta ajuda"
            echo -e "  -v, --version   Exibe a versão do script"
            echo -e "  --reset         Reinicia o checkpoint de deploy"
            echo -e "  --non-interactive  Executa o script sem solicitar confirmações (usar com cuidado)"
            echo -e "  --debug         Ativa o modo de depuração (mostra comandos)"
            exit 0
            ;;
        --version|-v)
            echo -e "${VERDE}${NEGRITO}Team Manager - Deploy Completo${RESET}"
            echo -e "Versão: ${VERSION}"
            exit 0
            ;;
        --reset)
            echo -e "${AMARELO}${NEGRITO}[AVISO]${RESET} $(date +"%Y-%m-%d %H:%M:%S") - Resetando checkpoint anterior..."
            if [ -f "$CHECKPOINT_FILE" ]; then
                rm -f "$CHECKPOINT_FILE"
                echo -e "${VERDE}${NEGRITO}[SUCESSO]${RESET} $(date +"%Y-%m-%d %H:%M:%S") - Checkpoint removido. Deploy começará do início na próxima execução."
            else
                echo -e "${AZUL}${NEGRITO}[INFO]${RESET} $(date +"%Y-%m-%d %H:%M:%S") - Nenhum checkpoint encontrado para reset."
            fi
            exit 0
            ;;
        --non-interactive)
            NON_INTERACTIVE=true
            ;;
        --debug)
            DEBUG=true
            set -x  # Ativa o modo de depuração do bash
            ;;
        *)
            echo -e "${VERMELHO}${NEGRITO}[ERRO]${RESET} Opção desconhecida: $1"
            echo -e "Use $0 --help para ver as opções disponíveis."
            exit 1
            ;;
    esac
fi

# Exibir configurações iniciais
echo -e "\n${AZUL}${NEGRITO}=== CONFIGURAÇÃO INICIAL DO TEAM MANAGER ===${RESET}\n"
echo -e "${AMARELO}Configuração do deploy:${RESET}"
echo -e "Domínio: ${VERDE}$DOMAIN${RESET}"
echo -e "IP VPS: ${VERDE}$VPS_IP${RESET}"
echo -e "Diretório: ${VERDE}$APP_DIR${RESET}"
echo -e "Repositório: ${VERDE}$REPO_URL${RESET}"
echo -e "Branch: ${VERDE}$BRANCH${RESET}"

# FASE 1: Verificar requisitos do sistema
requisitos_sistema() {
    log "Verificando requisitos do sistema Team Manager" "phase" "1"
    show_progress 1
    
    # Verificar se é root
    if [[ $EUID -ne 0 ]]; then
        log "Este script deve ser executado como root" "error"
        exit 1
    fi
    
    # Verificar a distribuição Linux
    local DISTRO=$(cat /etc/*-release | grep -E '^(ID|NAME)=' | head -n 1 2>/dev/null || echo "Não detectado")
    log "Sistema detectado: $DISTRO" "info"
    
    # Verificar espaço em disco
    local DISK_SPACE=$(df -h / | tail -n 1 | awk '{print $4}' 2>/dev/null || echo "Não detectado")
    log "Espaço em disco disponível: $DISK_SPACE" "info"
    
    # Verificar memória RAM
    local MEMORY=$(free -h | grep Mem | awk '{print $4}' 2>/dev/null || echo "Não detectado")
    log "Memória RAM disponível: $MEMORY" "info"
    
    # Verificar se Git está disponível
    local GIT_CHECK=$(command -v git 2>/dev/null || echo "Não detectado")
    if [[ "$GIT_CHECK" == *"Não detectado"* ]]; then
        log "Git não encontrado no sistema" "warning"
    else
        log "Git encontrado: $GIT_CHECK" "info"
    fi
    
    # Verificar se curl está disponível
    local CURL_CHECK=$(command -v curl 2>/dev/null || echo "Não detectado")
    if [[ "$CURL_CHECK" == *"Não detectado"* ]]; then
        log "Curl não encontrado no sistema" "warning"
    else
        log "Curl encontrado: $CURL_CHECK" "info"
    fi
    
    create_checkpoint 1
    return 0
}

# FASE 2: Configurar DNS do Team Manager
configurar_dns_team_manager() {
    log "Configurando DNS para Team Manager" "phase" "2"
    show_progress 2
    
    # Detectar IP do servidor
    local SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | grep -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}' | head -1)
    log "IP do servidor detectado: $SERVER_IP" "info"
    
    # Verificar nameservers do domínio sixquasar.pro
    local NAMESERVERS=$(dig +short $(echo $DOMAIN | sed 's/.*\.\([^.]*\.[^.]*\)$/\1/') NS 2>/dev/null)
    log "Nameservers detectados: $NAMESERVERS" "info"
    
    # Verificar se é Cloudflare
    if echo "$NAMESERVERS" | grep -q "cloudflare"; then
        log "Domínio usa Cloudflare DNS" "success"
        
        log "CONFIGURAÇÃO DNS OBRIGATÓRIA PARA TEAM MANAGER" "warning"
        echo ""
        echo "Para o Team Manager funcionar corretamente, o DNS deve estar configurado."
        echo "Opções disponíveis:"
        echo "1. Configurar automaticamente via Cloudflare API (recomendado)"
        echo "2. Configurar manualmente no painel Cloudflare"
        echo "3. Pular configuração DNS (apenas para testes locais)"
        echo ""
        
        # Solicitar opção se não estiver em modo não-interativo
        if [ "$NON_INTERACTIVE" = "false" ]; then
            read -p "Escolha uma opção (1-3): " dns_option
        else
            dns_option="3"  # Pular em modo não-interativo
        fi
        
        case $dns_option in
            1)
                echo ""
                echo "=== CONFIGURAÇÃO AUTOMÁTICA VIA CLOUDFLARE ==="
                echo "Você precisa:"
                echo "1. Token API: https://dash.cloudflare.com/profile/api-tokens"
                echo "2. Zone ID: Disponível no painel do domínio sixquasar.pro"
                echo ""
                
                if [[ -z "$CLOUDFLARE_API_TOKEN" ]] || [[ -z "$CLOUDFLARE_ZONE_ID" ]]; then
                    read -p "Digite seu Cloudflare API Token: " user_token
                    read -p "Digite o Zone ID do sixquasar.pro: " user_zone_id
                    
                    if [[ -n "$user_token" ]] && [[ -n "$user_zone_id" ]]; then
                        CLOUDFLARE_API_TOKEN="$user_token"
                        CLOUDFLARE_ZONE_ID="$user_zone_id"
                    else
                        log "Credenciais não fornecidas. Configuração manual necessária." "warning"
                        dns_option="2"
                    fi
                fi
                
                if [[ "$dns_option" == "1" ]]; then
                    configurar_dns_cloudflare_team_manager "$SERVER_IP"
                fi
                ;;
            2)
                echo ""
                echo "=== CONFIGURAÇÃO MANUAL PARA TEAM MANAGER ==="
                echo "Configure no seu painel Cloudflare:"
                echo "Tipo: A"
                echo "Nome: admin" 
                echo "Valor: $SERVER_IP"
                echo "TTL: 300 (ou Auto)"
                echo ""
                read -p "Pressione Enter após configurar o DNS para o Team Manager..."
                ;;
            3)
                log "DNS pulado - deploy apenas para testes locais" "warning"
                CONFIGURED_DOMAIN="$SERVER_IP"
                ;;
            *)
                log "Opção inválida! Configuração manual necessária." "error"
                dns_option="2"
                ;;
        esac
    else
        log "Domínio não usa Cloudflare. Configure manualmente:" "warning"
        log "Tipo: A | Nome: admin | Valor: $SERVER_IP | TTL: 300" "info"
    fi
    
    if [[ -z "$CONFIGURED_DOMAIN" ]]; then
        CONFIGURED_DOMAIN="$DOMAIN"
    fi
    
    create_checkpoint 2
    return 0
}

# Função auxiliar para configurar DNS via Cloudflare para Team Manager
configurar_dns_cloudflare_team_manager() {
    local server_ip="$1"
    
    log "Configurando DNS do Team Manager via Cloudflare API..." "info"
    
    # Verificar se o registro admin já existe
    local EXISTING_RECORD=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?name=$DOMAIN&type=A" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json")
    
    local RECORD_ID=$(echo "$EXISTING_RECORD" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
    
    if [[ -n "$RECORD_ID" ]]; then
        log "Atualizando registro DNS existente para Team Manager..." "info"
        
        local UPDATE_RESPONSE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$RECORD_ID" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            --data "{\"type\":\"A\",\"name\":\"$DOMAIN\",\"content\":\"$server_ip\",\"ttl\":300}")
        
        if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
            log "Registro DNS do Team Manager atualizado: $DOMAIN → $server_ip" "success"
        else
            log "Falha ao atualizar registro DNS do Team Manager" "error"
            return 1
        fi
    else
        log "Criando novo registro DNS para Team Manager..." "info"
        
        local CREATE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            --data "{\"type\":\"A\",\"name\":\"$DOMAIN\",\"content\":\"$server_ip\",\"ttl\":300}")
        
        if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
            log "Registro DNS do Team Manager criado: $DOMAIN → $server_ip" "success"
        else
            log "Falha ao criar registro DNS do Team Manager" "error"
            return 1
        fi
    fi
    
    # Testar propagação DNS do Team Manager
    testar_propagacao_dns_team_manager
}

# Função para testar propagação DNS do Team Manager
testar_propagacao_dns_team_manager() {
    log "Testando propagação DNS do Team Manager..." "info"
    
    for i in {1..6}; do
        log "Tentativa $i/6 para DNS do Team Manager..." "info"
        local RESOLVED_IP=$(dig +short $DOMAIN A @8.8.8.8 2>/dev/null | head -n1)
        
        if [[ "$RESOLVED_IP" == "$VPS_IP" ]]; then
            log "DNS do Team Manager propagado com sucesso! $DOMAIN → $RESOLVED_IP" "success"
            return 0
        elif [[ -n "$RESOLVED_IP" ]]; then
            log "DNS do Team Manager resolve para: $RESOLVED_IP (esperado: $VPS_IP)" "warning"
        else
            log "Aguardando propagação DNS do Team Manager..." "info"
        fi
        
        if [[ $i -lt 6 ]]; then
            sleep 30
        fi
    done
    
    log "DNS do Team Manager pode levar mais tempo para propagar globalmente" "warning"
    log "Continue o deploy - DNS funcionará em breve" "info"
    return 0
}

# FASE 3: Instalar dependências do sistema para Team Manager
dependencias_sistema_team_manager() {
    log "Instalando dependências do sistema para Team Manager" "phase" "3"
    show_progress 3
    
    # Verificar o gerenciador de pacotes correto
    local PKG_MANAGER=""
    if command -v apt-get >/dev/null 2>&1; then
        PKG_MANAGER="apt-get"
        OS_TYPE="ubuntu"
        WEB_SERVER_USER="www-data"
        log "Usando gerenciador de pacotes: apt-get (Ubuntu/Debian)" "info"
    elif command -v yum >/dev/null 2>&1; then
        PKG_MANAGER="yum"
        OS_TYPE="centos"
        WEB_SERVER_USER="nginx"
        log "Usando gerenciador de pacotes: yum (CentOS/RHEL)" "info"
    elif command -v dnf >/dev/null 2>&1; then
        PKG_MANAGER="dnf"
        OS_TYPE="fedora"
        WEB_SERVER_USER="nginx"
        log "Usando gerenciador de pacotes: dnf (Fedora)" "info"
    else
        PKG_MANAGER="apt-get" # fallback para Debian/Ubuntu
        OS_TYPE="ubuntu"
        WEB_SERVER_USER="www-data"
        log "Sistema não identificado, usando apt-get como fallback" "warning"
    fi
    
    # Atualizar a lista de pacotes
    log "Atualizando lista de pacotes..." "info"
    if [ "$PKG_MANAGER" = "apt-get" ]; then
        export DEBIAN_FRONTEND=noninteractive
        apt-get update -qq
        check_error $? "Falha ao atualizar lista de pacotes" false
        
        # Instalar dependências para Team Manager (frontend)
        log "Instalando dependências básicas para Team Manager..." "info"
        apt-get install -y curl wget git nginx ufw software-properties-common dnsutils build-essential
        check_error $? "Falha ao instalar dependências básicas"
        
    elif [ "$PKG_MANAGER" = "yum" ] || [ "$PKG_MANAGER" = "dnf" ]; then
        $PKG_MANAGER update -y -q
        check_error $? "Falha ao atualizar lista de pacotes" false
        
        # Instalar dependências para Team Manager (frontend)
        log "Instalando dependências básicas para Team Manager..." "info"
        if [ "$PKG_MANAGER" = "yum" ]; then
            yum install -y epel-release
            yum install -y curl wget git nginx firewalld bind-utils gcc gcc-c++ make
        else
            dnf install -y curl wget git nginx firewalld bind-utils gcc gcc-c++ make
        fi
        check_error $? "Falha ao instalar dependências básicas"
    fi
    
    log "Dependências do sistema instaladas com sucesso" "success"
    
    create_checkpoint 3
    return 0
}

# FASE 4: Instalar Node.js para Team Manager
instalar_nodejs_team_manager() {
    log "Instalando Node.js para Team Manager" "phase" "4"
    show_progress 4
    
    # Verificar se Node.js já está instalado
    local NODE_CURRENT=$(node --version 2>/dev/null || echo "não instalado")
    log "Node.js atual: $NODE_CURRENT" "info"
    
    # Instalar Node.js LTS via NodeSource
    log "Instalando Node.js LTS via NodeSource..." "info"
    
    if [[ "$OS_TYPE" == "ubuntu" ]]; then
        curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
        apt-get install -y nodejs
    elif [[ "$OS_TYPE" == "centos" ]]; then
        curl -fsSL https://rpm.nodesource.com/setup_lts.x | bash -
        yum install -y nodejs
    elif [[ "$OS_TYPE" == "fedora" ]]; then
        curl -fsSL https://rpm.nodesource.com/setup_lts.x | bash -
        dnf install -y nodejs
    fi
    
    check_error $? "Falha ao instalar Node.js para Team Manager"
    
    # Verificar instalação do Node.js
    local NODE_VERSION=$(node --version 2>/dev/null || echo "ERRO")
    local NPM_VERSION=$(npm --version 2>/dev/null || echo "ERRO")
    
    if [[ "$NODE_VERSION" == "ERRO" ]]; then
        log "ERRO: Node.js não foi instalado corretamente!" "error"
        exit 1
    fi
    
    log "Node.js instalado com sucesso: $NODE_VERSION" "success"
    log "NPM instalado com sucesso: $NPM_VERSION" "success"
    
    create_checkpoint 4
    return 0
}

# FASE 5: Clonar repositório do Team Manager
clonar_repositorio_team_manager() {
    log "Clonando repositório do Team Manager" "phase" "5"
    show_progress 5
    
    # Configurar Git para Team Manager
    log "Configurando Git para Team Manager..." "info"
    git config --global user.name "sixquasar"
    git config --global user.email "$EMAIL"
    
    # Verificar se o diretório de destino já existe
    if [ -d "$APP_DIR" ]; then
        log "Diretório de destino $APP_DIR já existe" "warning"
        if confirm_action "Deseja remover o diretório existente do Team Manager e clonar novamente?"; then
            rm -rf "$APP_DIR"
            log "Diretório do Team Manager removido" "info"
        else
            log "Mantendo diretório existente do Team Manager" "info"
            
            # Verificar se é um repositório Git válido
            if [ -d "$APP_DIR/.git" ]; then
                log "Repositório Git do Team Manager encontrado. Atualizando..." "info"
                cd "$APP_DIR" && git pull
                check_error $? "Falha ao atualizar repositório do Team Manager" false
                log "Repositório do Team Manager atualizado" "success"
                create_checkpoint 5
                return 0
            else
                log "O diretório não é um repositório Git válido do Team Manager" "warning"
                if confirm_action "Deseja remover e clonar novamente?"; then
                    rm -rf "$APP_DIR"
                    log "Diretório removido" "info"
                else
                    log "Abortando clonagem do Team Manager" "error"
                    exit 1
                fi
            fi
        fi
    fi
    
    # Criar pasta pai se necessário
    mkdir -p "$(dirname "$APP_DIR")" 2>/dev/null
    
    # Clonar o repositório do Team Manager
    log "Clonando o repositório do Team Manager via HTTPS..." "info"
    git clone --depth 1 -b "$BRANCH" "$REPO_URL" "$APP_DIR"
    check_error $? "Falha ao clonar repositório do Team Manager"
    
    # Verificar se o diretório foi criado e contém package.json
    if [ ! -f "$APP_DIR/package.json" ]; then
        log "Arquivo package.json do Team Manager não encontrado no repositório clonado" "error"
        if confirm_action "O repositório do Team Manager parece não ter sido clonado corretamente. Deseja continuar mesmo assim?"; then
            log "Continuando mesmo sem o arquivo package.json do Team Manager" "warning"
        else
            log "Abortando o deploy do Team Manager" "error"
            exit 1
        fi
    else
        log "Repositório do Team Manager verificado, arquivo package.json encontrado" "success"
    fi
    
    create_checkpoint 5
    return 0
}

# FASE 6: Instalar dependências do projeto Team Manager
dependencias_projeto_team_manager() {
    log "Instalando dependências do projeto Team Manager" "phase" "6"
    show_progress 6
    
    # Verificar se o diretório da aplicação existe
    if [ ! -d "$APP_DIR" ]; then
        log "Diretório da aplicação Team Manager não encontrado: $APP_DIR" "error"
        return 1
    fi
    
    # Verificar se package.json existe
    if [ ! -f "$APP_DIR/package.json" ]; then
        log "Arquivo package.json do Team Manager não encontrado" "error"
        return 1
    fi
    
    # Instalar dependências do Team Manager
    log "Instalando dependências NPM do Team Manager..." "info"
    cd "$APP_DIR"
    
    # Limpar node_modules anterior se existir
    if [ -d "node_modules" ]; then
        log "Removendo node_modules anterior..." "info"
        rm -rf node_modules
    fi
    
    # Instalar todas as dependências (incluindo Supabase que agora está em dependencies)
    npm ci --include=dev
    
    # Verificar se Supabase foi instalado corretamente
    if [ -d "node_modules/@supabase/supabase-js" ]; then
        log "✅ Supabase instalado corretamente" "info"
    else
        log "❌ Supabase não foi instalado! Tentando instalar manualmente..." "warning"
        npm install @supabase/supabase-js
    fi
    check_error $? "Falha ao instalar dependências do Team Manager"
    
    # Verificar se as dependências foram instaladas corretamente
    if [ ! -d "node_modules" ]; then
        log "Falha na instalação das dependências do Team Manager!" "error"
        if confirm_action "As dependências não foram instaladas corretamente. Deseja tentar novamente?"; then
            npm install --include=dev
            check_error $? "Falha persistente na instalação das dependências"
        else
            log "Pulando instalação de dependências do Team Manager" "warning"
        fi
    else
        local DEPS_COUNT=$(ls node_modules | wc -l)
        log "Dependências do Team Manager instaladas com sucesso: $DEPS_COUNT pacotes" "success"
    fi
    
    create_checkpoint 6
    return 0
}

# FASE 7: Configurar ambiente de produção do Team Manager
configurar_ambiente_team_manager() {
    log "Configurando ambiente de produção do Team Manager" "phase" "7"
    show_progress 7
    
    # Verificar se o diretório da aplicação existe
    if [ ! -d "$APP_DIR" ]; then
        log "Diretório da aplicação Team Manager não encontrado: $APP_DIR" "error"
        return 1
    fi
    
    cd "$APP_DIR"
    
    # Criar arquivo .env para o Team Manager
    log "Criando arquivo .env para Team Manager..." "info"
    cat > .env << EOF
# Configuração do Team Manager para Produção
VITE_APP_URL=https://$CONFIGURED_DOMAIN
VITE_API_URL=https://$CONFIGURED_DOMAIN/api
NODE_ENV=production

# Configurações específicas do Team Manager
VITE_APP_TITLE=Team Manager - SixQuasar
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
EOF
    
    # Configurar variáveis de ambiente para o build
    export NODE_ENV=production
    export VITE_APP_URL=https://$CONFIGURED_DOMAIN
    export VITE_API_URL=https://$CONFIGURED_DOMAIN/api
    
    log "Ambiente de produção do Team Manager configurado" "success"
    log "NODE_ENV: $NODE_ENV" "info"
    log "VITE_APP_URL: $VITE_APP_URL" "info"
    
    create_checkpoint 7
    return 0
}

# FASE 8: Executar build de produção do Team Manager
build_producao_team_manager() {
    log "Executando build de produção do Team Manager" "phase" "8"
    show_progress 8
    
    cd "$APP_DIR"
    
    # Limpar build anterior
    log "Limpando build anterior..." "info"
    rm -rf dist 2>/dev/null || true
    
    # Verificar se o script de build existe
    if ! npm run build --dry-run >/dev/null 2>&1; then
        log "Script de build não encontrado no package.json" "error"
        
        # Tentar build alternativo com Vite
        log "Tentando build alternativo com Vite..." "warning"
        if ! npx vite build --mode production; then
            log "Build alternativo também falhou!" "error"
            exit 1
        fi
    else
        # Executar build com timeout para Team Manager
        log "Iniciando build do Team Manager (máximo 10 minutos)..." "info"
        timeout 600 npm run build
        check_error $? "Falha no build de produção do Team Manager"
    fi
    
    # Verificações pós-build do Team Manager
    if [[ ! -d "dist" ]] || [[ ! -f "dist/index.html" ]]; then
        log "Build do Team Manager falhou! Arquivo dist/index.html não encontrado" "error"
        exit 1
    fi
    
    # Verificar se assets foram gerados
    local ASSETS_COUNT=$(find dist -name "*.js" -o -name "*.css" | wc -l)
    if [[ $ASSETS_COUNT -lt 2 ]]; then
        log "Poucos assets gerados no build do Team Manager ($ASSETS_COUNT)" "warning"
    fi
    
    local BUILD_SIZE=$(du -sh dist | cut -f1)
    log "Build do Team Manager criado com sucesso: $BUILD_SIZE" "success"
    log "Assets do Team Manager: $ASSETS_COUNT arquivos" "info"
    
    create_checkpoint 8
    return 0
}

# FASE 9: Configurar Nginx para Team Manager
configurar_nginx_team_manager() {
    log "Configurando Nginx para Team Manager" "phase" "9"
    show_progress 9
    
    # Parar Nginx se estiver rodando
    systemctl stop nginx 2>/dev/null || true
    
    # Limpeza de configurações anteriores do Team Manager
    log "Limpando configurações anteriores do Nginx..." "info"
    rm -f /etc/nginx/sites-enabled/team-manager* /etc/nginx/sites-available/team-manager* 2>/dev/null || true
    rm -f /etc/nginx/conf.d/team-manager* 2>/dev/null || true
    
    # Criar diretórios necessários
    mkdir -p /var/log/nginx 2>/dev/null
    mkdir -p /etc/nginx/sites-available 2>/dev/null
    mkdir -p /etc/nginx/sites-enabled 2>/dev/null
    
    # Detectar diretório de configuração do Nginx
    local NGINX_CONF_FILE=""
    if [[ -d "/etc/nginx/sites-available" ]]; then
        # Ubuntu/Debian
        NGINX_CONF_FILE="/etc/nginx/sites-available/team-manager"
        
        cat > $NGINX_CONF_FILE << EOF
# Configuração Nginx para Team Manager - SixQuasar
server {
    listen 80;
    server_name $CONFIGURED_DOMAIN;
    
    root $APP_DIR/dist;
    index index.html;
    
    # Logs específicos do Team Manager
    access_log /var/log/nginx/team-manager.access.log;
    error_log /var/log/nginx/team-manager.error.log;
    
    # Configuração SPA para Team Manager - Previne redirecionamento cíclico
    location / {
        try_files \$uri \$uri/ @fallback;
        
        # Headers de segurança para Team Manager
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    }
    
    # Fallback para SPA - Evita ciclo de redirecionamento
    location @fallback {
        rewrite ^.*\$ /index.html last;
    }
    
    # Assets do Team Manager com cache longo
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }
    
    # API proxy para Team Manager (se necessário)
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Compressão para Team Manager
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
EOF
        
        # Ativar configuração
        rm -f /etc/nginx/sites-enabled/default
        ln -sf $NGINX_CONF_FILE /etc/nginx/sites-enabled/
        
    else
        # CentOS/RHEL/Fedora
        NGINX_CONF_FILE="/etc/nginx/conf.d/team-manager.conf"
        
        cat > $NGINX_CONF_FILE << EOF
# Configuração Nginx para Team Manager - SixQuasar
server {
    listen 80;
    server_name $CONFIGURED_DOMAIN;
    
    root $APP_DIR/dist;
    index index.html;
    
    # Logs específicos do Team Manager
    access_log /var/log/nginx/team-manager.access.log;
    error_log /var/log/nginx/team-manager.error.log;
    
    # Configuração SPA para Team Manager - Previne redirecionamento cíclico
    location / {
        try_files \$uri \$uri/ @fallback;
        
        # Headers de segurança para Team Manager
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    }
    
    # Fallback para SPA - Evita ciclo de redirecionamento
    location @fallback {
        rewrite ^.*\$ /index.html last;
    }
    
    # Assets do Team Manager com cache longo
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }
    
    # API proxy para Team Manager (se necessário)
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Compressão para Team Manager
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
EOF

        # Remover configuração padrão
        rm -f /etc/nginx/conf.d/default.conf
    fi
    
    # Testar configuração do Nginx
    log "Testando configuração do Nginx para Team Manager..." "info"
    nginx -t
    check_error $? "Configuração do Nginx para Team Manager inválida"
    
    log "Nginx configurado com sucesso para Team Manager" "success"
    
    create_checkpoint 9
    return 0
}

# FASE 10: Configurar SSL/HTTPS para Team Manager
configurar_ssl_team_manager() {
    log "Configurando SSL/HTTPS para Team Manager" "phase" "10"
    show_progress 10
    
    # Verificar se certificado já existe
    if [[ -f "/etc/letsencrypt/live/$CONFIGURED_DOMAIN/fullchain.pem" ]]; then
        log "Certificado SSL já existe para $CONFIGURED_DOMAIN" "info"
    else
        log "Gerando certificado SSL para $CONFIGURED_DOMAIN..." "info"
        
        # Parar Nginx temporariamente para obter certificado
        systemctl stop nginx
        
        # Gerar certificado Let's Encrypt
        certbot certonly --standalone \
            -d "$CONFIGURED_DOMAIN" \
            --email "$EMAIL" \
            --agree-tos \
            --non-interactive \
            --force-renewal
        
        check_error $? "Falha ao gerar certificado SSL"
    fi
    
    # Atualizar configuração Nginx com HTTPS
    log "Atualizando configuração Nginx com HTTPS..." "info"
    
    if [[ -d "/etc/nginx/sites-available" ]]; then
        # Ubuntu/Debian
        cat > "/etc/nginx/sites-available/team-manager" << EOF
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $CONFIGURED_DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $CONFIGURED_DOMAIN;
    
    # SSL Configuration - Corrigida para resolver bad key share
    ssl_certificate /etc/letsencrypt/live/$CONFIGURED_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$CONFIGURED_DOMAIN/privkey.pem;
    
    # Protocolos SSL mais compatíveis
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # Ciphers CORRIGIDOS para resolver bad key share - máxima compatibilidade
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-GCM-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA';
    ssl_prefer_server_ciphers off;
    
    # Configuração adicional para resolver bad key share
    ssl_ecdh_curve secp384r1:prime256v1;
    
    # Configurações SSL otimizadas
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/$CONFIGURED_DOMAIN/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Root directory
    root $APP_DIR/dist;
    index index.html;
    
    # Logs específicos do SSL
    access_log /var/log/nginx/team-manager.access.log;
    error_log /var/log/nginx/team-manager.error.log warn;
    
    # Block malicious requests (previne ataques)
    location ~ ^/(api|vendor|wp-admin|wp-content|wp-includes|\.env|\.git) {
        deny all;
        return 404;
    }
    
    # Handle static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        try_files \$uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Handle favicon requests (evita 404s)
    location = /favicon.ico {
        try_files \$uri /favicon.ico =204;
        access_log off;
        log_not_found off;
    }
    
    location = /apple-touch-icon.png {
        try_files \$uri /favicon.ico =204;
        access_log off;
        log_not_found off;
    }
    
    location = /apple-touch-icon-precomposed.png {
        try_files \$uri /favicon.ico =204;
        access_log off;
        log_not_found off;
    }
    
    # SPA routing - CORRIGIDO para React funcionar
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
EOF
    fi
    
    # Configurar renovação automática
    log "Configurando renovação automática SSL..." "info"
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx") | crontab -
    
    # Testar configuração
    nginx -t
    check_error $? "Configuração SSL do Nginx inválida"
    
    log "SSL configurado com sucesso para Team Manager" "success"
    
    create_checkpoint 10
    return 0
}

# FASE 11: Configurar firewall e permissões para Team Manager
configurar_firewall_team_manager() {
    log "Configurando firewall e permissões para Team Manager" "phase" "11"
    show_progress 11
    
    # Configurar firewall baseado no sistema
    log "Configurando firewall..." "info"
    if [[ "$OS_TYPE" == "ubuntu" ]]; then
        # Ubuntu/Debian - UFW
        ufw --force reset
        ufw default deny incoming
        ufw default allow outgoing
        ufw allow ssh
        ufw allow 'Nginx Full'
        ufw --force enable
        log "UFW configurado para Team Manager" "success"
    else
        # CentOS/RHEL/Fedora - firewalld
        systemctl enable firewalld
        systemctl start firewalld
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
        log "Firewalld configurado para Team Manager" "success"
    fi
    
    # Configurar permissões do Team Manager
    log "Configurando permissões do Team Manager..." "info"
    
    # Criar diretórios necessários
    mkdir -p /var/log/nginx
    
    # Configurar permissões do diretório do Team Manager
    chown -R $WEB_SERVER_USER:$WEB_SERVER_USER "$APP_DIR" 2>/dev/null || {
        log "Ajustando permissões com método alternativo..." "warning"
        chown -R root:root "$APP_DIR"
        
        # Dar permissão de leitura para o nginx
        if [[ "$OS_TYPE" == "ubuntu" ]]; then
            usermod -a -G www-data root 2>/dev/null || true
        fi
    }
    
    chmod -R 755 "$APP_DIR"
    
    # Verificar se dist existe e tem o conteúdo correto
    if [[ -f "$APP_DIR/dist/index.html" ]]; then
        log "Diretório dist do Team Manager configurado corretamente" "success"
        
        # Verificar tamanho do index.html
        local INDEX_SIZE=$(stat -c%s "$APP_DIR/dist/index.html" 2>/dev/null || echo "0")
        if [[ $INDEX_SIZE -gt 100 ]]; then
            log "index.html do Team Manager tem conteúdo válido ($INDEX_SIZE bytes)" "info"
        else
            log "index.html do Team Manager parece vazio ou muito pequeno" "warning"
        fi
    else
        log "Problema com diretório dist do Team Manager" "error"
        exit 1
    fi
    
    log "Permissões do Team Manager configuradas com sucesso" "success"
    
    create_checkpoint 11
    return 0
}

# FASE 12: Iniciar serviços e configurar SSL para Team Manager
iniciar_servicos_team_manager() {
    log "Iniciando serviços e configurando SSL para Team Manager" "phase" "12"
    show_progress 12
    
    # Iniciar Nginx
    log "Iniciando Nginx para Team Manager..." "info"
    systemctl enable nginx
    systemctl restart nginx
    check_error $? "Falha ao iniciar Nginx para Team Manager"
    
    # Aguardar inicialização
    sleep 3
    
    # Verificar se Nginx está rodando
    if systemctl is-active --quiet nginx; then
        log "Nginx iniciado com sucesso para Team Manager" "success"
    else
        log "Falha ao iniciar Nginx para Team Manager!" "error"
        systemctl status nginx --no-pager -l
        exit 1
    fi
    
    # Instalar Certbot para SSL
    log "Instalando Certbot para SSL do Team Manager..." "info"
    if [[ "$OS_TYPE" == "ubuntu" ]]; then
        apt-get install -y certbot python3-certbot-nginx
    elif [[ "$OS_TYPE" == "centos" ]]; then
        yum install -y certbot python3-certbot-nginx
    elif [[ "$OS_TYPE" == "fedora" ]]; then
        dnf install -y certbot python3-certbot-nginx
    fi
    check_error $? "Falha ao instalar Certbot" false
    
    # Testar HTTP do Team Manager
    log "Testando HTTP do Team Manager..." "info"
    local HTTP_TEST=$(curl -s -o /dev/null -w "%{http_code}" "http://$CONFIGURED_DOMAIN/" 2>/dev/null || echo "000")
    
    if [[ "$HTTP_TEST" == "200" ]]; then
        log "HTTP do Team Manager funcionando (código: $HTTP_TEST)" "success"
        
        # Configurar SSL se não estiver usando IP direto
        if [[ "$CONFIGURED_DOMAIN" != *"."[0-9]* ]]; then
            if confirm_action "Deseja configurar SSL/HTTPS automaticamente para o Team Manager?"; then
                log "Configurando SSL para Team Manager..." "info"
                
                if certbot --nginx -d "$CONFIGURED_DOMAIN" \
                    --non-interactive \
                    --agree-tos \
                    --email "$EMAIL" \
                    --redirect \
                    --quiet; then
                    log "SSL configurado com sucesso para Team Manager" "success"
                else
                    log "SSL falhou. Configure manualmente: certbot --nginx -d $CONFIGURED_DOMAIN" "warning"
                fi
            fi
        else
            log "SSL pulado (usando IP direto)" "info"
        fi
    else
        log "HTTP do Team Manager não está funcionando (código: $HTTP_TEST)" "warning"
        
        # Tentar diagnóstico
        log "Executando diagnóstico do Team Manager..." "info"
        if [[ -f "$APP_DIR/dist/index.html" ]]; then
            log "Arquivo index.html existe" "info"
        else
            log "Arquivo index.html não encontrado!" "error"
        fi
        
        # Verificar logs do Nginx
        if [[ -f "/var/log/nginx/team-manager.error.log" ]]; then
            log "Últimas entradas do log de erro:" "info"
            tail -5 /var/log/nginx/team-manager.error.log
        fi
    fi
    
    create_checkpoint 12
    return 0
}

# Função para mostrar status final do Team Manager
status_final_team_manager() {
    log "Deploy do Team Manager concluído" "phase" "FINAL"
    
    # Verificar status final dos serviços
    local HTTP_TEST=$(curl -s -o /dev/null -w "%{http_code}" "http://$CONFIGURED_DOMAIN/" 2>/dev/null || echo "000")
    local HTTPS_TEST=$(curl -s -o /dev/null -w "%{http_code}" "https://$CONFIGURED_DOMAIN/" 2>/dev/null || echo "000")
    local NGINX_STATUS=$(systemctl is-active nginx 2>/dev/null || echo "inativo")
    
    # Verificar DNS atual
    local CURRENT_DNS=$(dig +short "$DOMAIN" @8.8.8.8 2>/dev/null | head -n1)
    
    echo -e "\n${VERDE}${NEGRITO}=== TEAM MANAGER DEPLOY CONCLUÍDO COM SUCESSO ===${RESET}"
    echo -e "\n${AZUL}🚀 APLICAÇÃO TEAM MANAGER:${RESET}"
    echo -e "   🌐 Domínio: ${VERDE}$DOMAIN${RESET}"
    echo -e "   🌍 IP VPS: ${VERDE}$VPS_IP${RESET}"
    echo -e "   📁 Diretório: ${VERDE}$APP_DIR${RESET}"
    echo -e "   🔗 Branch: ${VERDE}$BRANCH${RESET}"
    echo -e "   📦 Versão: ${VERDE}$(grep '"version"' $APP_DIR/package.json | cut -d'"' -f4 2>/dev/null || echo "N/A")${RESET}"
    
    echo -e "\n${AZUL}🔧 SERVIÇOS TEAM MANAGER:${RESET}"
    echo -e "   🌐 Nginx: $([ "$NGINX_STATUS" = "active" ] && echo "${VERDE}✅ ATIVO${RESET}" || echo "${VERMELHO}❌ INATIVO${RESET}")"
    echo -e "   🌍 HTTP: $([ "$HTTP_TEST" = "200" ] && echo "${VERDE}✅ OK ($HTTP_TEST)${RESET}" || echo "${AMARELO}⚠️  $HTTP_TEST${RESET}")"
    echo -e "   🔐 HTTPS: $([ "$HTTPS_TEST" = "200" ] && echo "${VERDE}✅ OK ($HTTPS_TEST)${RESET}" || echo "${AMARELO}⚠️  $HTTPS_TEST${RESET}")"
    
    echo -e "\n${AZUL}🌐 DNS TEAM MANAGER:${RESET}"
    echo -e "   🔍 DNS Atual: ${VERDE}$CURRENT_DNS${RESET}"
    echo -e "   $([ "$CURRENT_DNS" = "$VPS_IP" ] && echo "${VERDE}✅ DNS correto${RESET}" || echo "${AMARELO}⚠️  DNS pode estar propagando${RESET}")"
    
    echo -e "\n${AZUL}🎯 ACESSOS TEAM MANAGER:${RESET}"
    echo -e "   🌐 URL Principal: ${VERDE}https://$CONFIGURED_DOMAIN${RESET}"
    echo -e "   🔗 URL HTTP: ${VERDE}http://$CONFIGURED_DOMAIN${RESET}"
    
    echo -e "\n${AZUL}📝 COMANDOS ÚTEIS TEAM MANAGER:${RESET}"
    echo -e "   📊 Status Nginx: ${VERDE}systemctl status nginx${RESET}"
    echo -e "   📋 Logs Acesso: ${VERDE}tail -f /var/log/nginx/team-manager.access.log${RESET}"
    echo -e "   🔧 Logs Erro: ${VERDE}tail -f /var/log/nginx/team-manager.error.log${RESET}"
    echo -e "   🔄 Reiniciar: ${VERDE}systemctl restart nginx${RESET}"
    echo -e "   🔒 Renovar SSL: ${VERDE}certbot renew${RESET}"
    
    echo -e "\n${VERMELHO}🚨 PASSO CRÍTICO - CONFIGURAR BANCO DE DADOS:${RESET}"
    echo -e "   ${AMARELO}1.${RESET} Acesse: ${VERDE}https://supabase.com/dashboard${RESET}"
    echo -e "   ${AMARELO}2.${RESET} Vá para o projeto Team Manager → SQL Editor"
    echo -e "   ${AMARELO}3.${RESET} Execute o arquivo: ${VERDE}SISTEMA_TEAM_MANAGER_COMPLETO.sql${RESET}"
    echo -e "   ${AMARELO}4.${RESET} Configurar Authentication → Settings:"
    echo -e "      ${AZUL}• Enable signup: ON${RESET}"
    echo -e "      ${AZUL}• Confirm email: OFF${RESET}"
    echo -e "   ${AMARELO}5.${RESET} Teste criação de usuário: ${VERDE}https://$CONFIGURED_DOMAIN/register${RESET}"
    echo -e "   ${VERMELHO}⚠️  SEM ESTES PASSOS O SIGNUP NÃO FUNCIONARÁ!${RESET}"
    
    echo -e "\n${AZUL}👥 USUÁRIOS PADRÃO:${RESET}"
    echo -e "   ${VERDE}• ricardo@techsquad.com / senha123${RESET} (Tech Lead - Owner)"
    echo -e "   ${VERDE}• ana@techsquad.com / senha123${RESET} (Developer)"
    echo -e "   ${VERDE}• carlos@techsquad.com / senha123${RESET} (Designer)"
    
    echo -e "\n${AZUL}📂 ESTRUTURA TEAM MANAGER:${RESET}"
    if [[ -d "$APP_DIR/dist" ]]; then
        local BUILD_SIZE=$(du -sh "$APP_DIR/dist" | cut -f1)
        local ASSETS_COUNT=$(find "$APP_DIR/dist" -name "*.js" -o -name "*.css" | wc -l)
        echo -e "   📦 Build: ${VERDE}$BUILD_SIZE${RESET}"
        echo -e "   🎨 Assets: ${VERDE}$ASSETS_COUNT arquivos${RESET}"
    fi
    
    # Status final consolidado
    if [[ "$HTTP_TEST" == "200" ]] || [[ "$HTTPS_TEST" == "200" ]]; then
        echo -e "\n${VERDE}🎉 TEAM MANAGER ESTÁ ONLINE E FUNCIONANDO!${RESET}"
        log "Team Manager deploy concluído com sucesso!" "success"
    else
        echo -e "\n${AMARELO}⚠️  DEPLOY CONCLUÍDO COM AVISOS${RESET}"
        echo -e "Verifique os logs do Nginx para mais detalhes sobre o Team Manager."
        log "Team Manager deploy concluído com avisos" "warning"
    fi
    
    # Limpar checkpoint
    rm -f "$CHECKPOINT_FILE"
    
    log "Deploy do Team Manager finalizado em $(date)!" "success"
    echo ""
}

# Função para iniciar deploy do Team Manager do começo
start_from_beginning() {
    requisitos_sistema && \
    configurar_dns_team_manager && \
    dependencias_sistema_team_manager && \
    instalar_nodejs_team_manager && \
    clonar_repositorio_team_manager && \
    dependencias_projeto_team_manager && \
    configurar_ambiente_team_manager && \
    build_producao_team_manager && \
    configurar_nginx_team_manager && \
    configurar_ssl_team_manager && \
    configurar_firewall_team_manager && \
    iniciar_servicos_team_manager && \
    status_final_team_manager
}

# Função principal
main() {
    # Apresentação inicial com ASCII art do Team Manager
    clear
    echo ""
    echo -e "${AMARELO}${NEGRITO}╔══════════════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${AMARELO}${NEGRITO}║                                                                      ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║  ${VERDE}████████╗███████╗ █████╗ ███╗   ███╗${AMARELO}                               ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║  ${VERDE}╚══██╔══╝██╔════╝██╔══██╗████╗ ████║${AMARELO}                               ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║  ${VERDE}   ██║   █████╗  ███████║██╔████╔██║${AMARELO}                               ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║  ${VERDE}   ██║   ██╔══╝  ██╔══██║██║╚██╔╝██║${AMARELO}                               ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║  ${VERDE}   ██║   ███████╗██║  ██║██║ ╚═╝ ██║${AMARELO}                               ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║  ${VERDE}   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝${AMARELO}                               ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║                                                                      ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║  ${AZUL}███╗   ███╗ █████╗ ███╗   ██╗ █████╗  ██████╗ ███████╗██████╗${AMARELO}     ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║  ${AZUL}████╗ ████║██╔══██╗████╗  ██║██╔══██╗██╔════╝ ██╔════╝██╔══██╗${AMARELO}    ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║  ${AZUL}██╔████╔██║███████║██╔██╗ ██║███████║██║  ███╗█████╗  ██████╔╝${AMARELO}    ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║  ${AZUL}██║╚██╔╝██║██╔══██║██║╚██╗██║██╔══██║██║   ██║██╔══╝  ██╔══██╗${AMARELO}    ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║  ${AZUL}██║ ╚═╝ ██║██║  ██║██║ ╚████║██║  ██║╚██████╔╝███████╗██║  ██║${AMARELO}    ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║  ${AZUL}╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝${AMARELO}    ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║                                                                      ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║       ${MAGENTA}⚡ S I S T E M A   D E   G E S T Ã O   D E   E Q U I P E ⚡${AMARELO}   ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║                                                                      ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║ ${MAGENTA}🌟 DEPLOY AUTOMATIZADO PARA PRODUÇÃO VPS${AMARELO}                     ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║                                                                      ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║ ${AZUL}👥 Sistema de Gestão para 3 Pessoas${AMARELO}                          ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║ ${AZUL}📊 Kanban + Timeline + Mensagens${AMARELO}                             ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║ ${AZUL}⚙️  Supabase + React + TypeScript${AMARELO}                           ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║ ${AZUL}🚀 Deploy com Sistema de Checkpoints${AMARELO}                        ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║                                                                      ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║ ${VERDE}🔧 CONFIGURAÇÕES DE DEPLOY:${AMARELO}                                  ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║   ${VERDE}▸ Versão:${RESET} ${VERSION}                                         ${AMARELO}║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║   ${VERDE}▸ Domínio:${RESET} ${DOMAIN}                            ${AMARELO}║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║   ${VERDE}▸ Servidor:${RESET} ${VPS_IP}                                    ${AMARELO}║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║   ${VERDE}▸ Branch:${RESET} ${BRANCH}                                           ${AMARELO}║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║   ${VERDE}▸ Diretório:${RESET} ${APP_DIR}                            ${AMARELO}║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║                                                                      ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║ ${AZUL}🌐 FUNCIONALIDADES INCLUÍDAS:${AMARELO}                                ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║   ${AZUL}✓${RESET} Gestão de Tarefas com Kanban                             ${AMARELO}║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║   ${AZUL}✓${RESET} Timeline de Atividades                                   ${AMARELO}║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║   ${AZUL}✓${RESET} Sistema de Mensagens                                     ${AMARELO}║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║   ${AZUL}✓${RESET} Métricas de Produtividade                               ${AMARELO}║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║   ${AZUL}✓${RESET} Dashboard Analítico                                      ${AMARELO}║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║   ${AZUL}✓${RESET} Autenticação Própria                                     ${AMARELO}║${RESET}"
    echo -e "${AMARELO}${NEGRITO}║                                                                      ║${RESET}"
    echo -e "${AMARELO}${NEGRITO}╚══════════════════════════════════════════════════════════════════════╝${RESET}"
    echo ""
    echo -e "${VERDE}${NEGRITO}🚀 Iniciando processo de deploy automatizado...${RESET}"
    echo -e "${AZUL}   Aguarde enquanto configuramos seu Team Manager completo!${RESET}"
    echo ""
    sleep 2
    
    # Criar diretório de logs
    mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null
    
    # Verificar checkpoint anterior
    if [ -f "$CHECKPOINT_FILE" ]; then
        LAST_PHASE=$(cat "$CHECKPOINT_FILE")
        log "Checkpoint encontrado: Fase $LAST_PHASE" "info"
        echo -e "\n${AZUL}${NEGRITO}Checkpoint encontrado: Fase $LAST_PHASE${RESET}"
        echo -e "1. Continuar do checkpoint"
        echo -e "2. Reiniciar do início"
        read -p "Escolha uma opção (1-2): " opt
        
        case $opt in
            2) 
                reset_checkpoint
                start_from_beginning
                ;;
            *)
                # Continuar da fase salva
                case $LAST_PHASE in
                    1) configurar_dns_team_manager && dependencias_sistema_team_manager && instalar_nodejs_team_manager && clonar_repositorio_team_manager && dependencias_projeto_team_manager && configurar_ambiente_team_manager && build_producao_team_manager && configurar_nginx_team_manager && configurar_ssl_team_manager && configurar_firewall_team_manager && iniciar_servicos_team_manager && status_final_team_manager ;;
                    2) dependencias_sistema_team_manager && instalar_nodejs_team_manager && clonar_repositorio_team_manager && dependencias_projeto_team_manager && configurar_ambiente_team_manager && build_producao_team_manager && configurar_nginx_team_manager && configurar_ssl_team_manager && configurar_firewall_team_manager && iniciar_servicos_team_manager && status_final_team_manager ;;
                    3) instalar_nodejs_team_manager && clonar_repositorio_team_manager && dependencias_projeto_team_manager && configurar_ambiente_team_manager && build_producao_team_manager && configurar_nginx_team_manager && configurar_ssl_team_manager && configurar_firewall_team_manager && iniciar_servicos_team_manager && status_final_team_manager ;;
                    4) clonar_repositorio_team_manager && dependencias_projeto_team_manager && configurar_ambiente_team_manager && build_producao_team_manager && configurar_nginx_team_manager && configurar_ssl_team_manager && configurar_firewall_team_manager && iniciar_servicos_team_manager && status_final_team_manager ;;
                    5) dependencias_projeto_team_manager && configurar_ambiente_team_manager && build_producao_team_manager && configurar_nginx_team_manager && configurar_ssl_team_manager && configurar_firewall_team_manager && iniciar_servicos_team_manager && status_final_team_manager ;;
                    6) configurar_ambiente_team_manager && build_producao_team_manager && configurar_nginx_team_manager && configurar_ssl_team_manager && configurar_firewall_team_manager && iniciar_servicos_team_manager && status_final_team_manager ;;
                    7) build_producao_team_manager && configurar_nginx_team_manager && configurar_ssl_team_manager && configurar_firewall_team_manager && iniciar_servicos_team_manager && status_final_team_manager ;;
                    8) configurar_nginx_team_manager && configurar_ssl_team_manager && configurar_firewall_team_manager && iniciar_servicos_team_manager && status_final_team_manager ;;
                    9) configurar_ssl_team_manager && configurar_firewall_team_manager && iniciar_servicos_team_manager && status_final_team_manager ;;
                    10) configurar_firewall_team_manager && iniciar_servicos_team_manager && status_final_team_manager ;;
                    11) iniciar_servicos_team_manager && status_final_team_manager ;;
                    12) status_final_team_manager ;;
                    *)
                        echo -e "${VERMELHO}${NEGRITO}[ERRO]${RESET} Checkpoint inválido. Iniciando do começo."
                        reset_checkpoint
                        start_from_beginning
                        ;;
                esac
                ;;
        esac
    else
        # Não existe checkpoint, começar do início
        start_from_beginning
    fi
}

# Iniciar o script passando todos os argumentos
main "$@"