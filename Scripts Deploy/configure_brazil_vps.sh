#!/bin/bash

#################################################################
#              CONFIGURAÇÃO VPS BRASIL - FORTALEZA              #
#                     TEAM MANAGER                              #
#################################################################

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Função de log
log() {
    case $2 in
        error) echo -e "${RED}❌ $1${NC}" && exit 1 ;;
        success) echo -e "${GREEN}✅ $1${NC}" ;;
        info) echo -e "${BLUE}➜ $1${NC}" ;;
        warning) echo -e "${YELLOW}⚠️  $1${NC}" ;;
        *) echo -e "  $1" ;;
    esac
}

echo -e "\n${BLUE}🇧🇷 CONFIGURANDO VPS PARA BRASIL - FORTALEZA${NC}\n"

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
   log "Execute com sudo" error
fi

# 1. CONFIGURAR TIMEZONE
log "Configurando timezone para Fortaleza..." info
timedatectl set-timezone America/Fortaleza
if [ $? -eq 0 ]; then
    log "Timezone configurado: America/Fortaleza" success
    log "Horário atual: $(date '+%d/%m/%Y %H:%M:%S')" info
else
    log "Erro ao configurar timezone" error
fi

# 2. CONFIGURAR LOCALE PARA PORTUGUÊS BRASILEIRO
log "\nConfigurando locale para pt_BR.UTF-8..." info

# Gerar locale pt_BR.UTF-8
locale-gen pt_BR.UTF-8
update-locale LANG=pt_BR.UTF-8 LC_ALL=pt_BR.UTF-8

# Aplicar imediatamente
export LANG=pt_BR.UTF-8
export LC_ALL=pt_BR.UTF-8

log "Locale configurado para Português Brasileiro" success

# 3. CONFIGURAR NTP BRASILEIRO
log "\nConfigurando servidores NTP brasileiros..." info

# Fazer backup do arquivo NTP
cp /etc/systemd/timesyncd.conf /etc/systemd/timesyncd.conf.bak

# Configurar servidores NTP brasileiros
cat > /etc/systemd/timesyncd.conf << EOF
[Time]
NTP=a.st1.ntp.br b.st1.ntp.br c.st1.ntp.br
FallbackNTP=0.br.pool.ntp.org 1.br.pool.ntp.org 2.br.pool.ntp.org 3.br.pool.ntp.org
EOF

# Reiniciar serviço de sincronização de tempo
systemctl restart systemd-timesyncd
log "Servidores NTP brasileiros configurados" success

# 4. CONFIGURAR FORMATO DE DATA BRASILEIRO
log "\nConfigurando formato de data brasileiro..." info

# Criar arquivo de configuração para formato brasileiro
cat > /etc/profile.d/brazil-format.sh << 'EOF'
# Formato brasileiro de data e hora
export LC_TIME=pt_BR.UTF-8
export LC_NUMERIC=pt_BR.UTF-8
export LC_MONETARY=pt_BR.UTF-8
export LC_PAPER=pt_BR.UTF-8
export LC_MEASUREMENT=pt_BR.UTF-8
EOF

chmod +x /etc/profile.d/brazil-format.sh
source /etc/profile.d/brazil-format.sh

log "Formato de data/hora brasileiro configurado" success

# 5. CONFIGURAR CRON PARA HORÁRIO BRASILEIRO
log "\nAjustando CRON para horário brasileiro..." info

# Adicionar timezone ao crontab
if ! grep -q "TZ=America/Fortaleza" /etc/crontab; then
    sed -i '1i TZ=America/Fortaleza' /etc/crontab
    log "CRON configurado para timezone de Fortaleza" success
else
    log "CRON já está configurado" warning
fi

# 6. REINICIAR SERVIÇOS DO TEAM MANAGER (se existirem)
log "\nVerificando serviços do Team Manager..." info

if systemctl list-unit-files | grep -q "team-manager-backend.service"; then
    log "Reiniciando backend com novo horário..." info
    systemctl restart team-manager-backend
    log "Backend reiniciado" success
fi

# 7. MOSTRAR RESUMO
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ VPS CONFIGURADA PARA BRASIL!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}📊 Resumo das Configurações:${NC}"
echo -e "  ${GREEN}✓${NC} Timezone: $(timedatectl | grep 'Time zone' | awk '{print $3}')"
echo -e "  ${GREEN}✓${NC} Horário atual: $(date '+%d/%m/%Y %H:%M:%S')"
echo -e "  ${GREEN}✓${NC} Locale: $LANG"
echo -e "  ${GREEN}✓${NC} NTP: Servidores brasileiros configurados"
echo -e "  ${GREEN}✓${NC} Formato: DD/MM/AAAA - R$ (Real brasileiro)"

# Verificar sincronização NTP
echo -e "\n${BLUE}🕐 Status da sincronização de tempo:${NC}"
timedatectl status | grep -E "(Local time|Time zone|NTP|synchronized)" | sed 's/^/  /'

echo -e "\n${YELLOW}💡 Dicas:${NC}"
echo -e "  • Para verificar o horário: ${BLUE}date${NC}"
echo -e "  • Para ver status NTP: ${BLUE}timedatectl status${NC}"
echo -e "  • Para ver locale: ${BLUE}locale${NC}"
echo -e "  • Logs agora usarão horário de Fortaleza"

echo ""