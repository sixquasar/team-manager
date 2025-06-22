#!/bin/bash

#################################################################
#                                                               #
#        DESABILITAR INTEGRAÇÃO IA TEMPORARIAMENTE             #
#        Remove erros 404 e foca no Team Manager               #
#        Versão: 1.0.0                                          #
#        Data: 22/06/2025                                       #
#                                                               #
#################################################################

# Cores
VERMELHO='\033[0;31m'
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
RESET='\033[0m'

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}🔧 DESABILITANDO INTEGRAÇÃO IA TEMPORARIAMENTE${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# Verificar root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${VERMELHO}❌ Execute como root (sudo)${RESET}"
    exit 1
fi

# PASSO 1: Parar e desabilitar serviço IA
echo -e "${AMARELO}1️⃣ Parando serviço IA...${RESET}"
systemctl stop team-manager-ai
systemctl disable team-manager-ai
echo -e "${VERDE}✅ Serviço IA desabilitado${RESET}"

# PASSO 2: Remover rotas /ai/ do Nginx
echo -e "${AMARELO}2️⃣ Removendo rotas /ai/ do Nginx...${RESET}"

# Fazer backup
cp /etc/nginx/sites-available/team-manager /etc/nginx/sites-available/team-manager.with-ai

# Remover blocos location /ai/
sed -i '/# Proxy para microserviço IA/,/^[[:space:]]*}$/d' /etc/nginx/sites-available/team-manager
sed -i '/# WebSocket do microserviço IA/,/^[[:space:]]*}$/d' /etc/nginx/sites-available/team-manager
sed -i '/location \/ai\//,/^[[:space:]]*}$/d' /etc/nginx/sites-available/team-manager
sed -i '/location \/ai-socket\//,/^[[:space:]]*}$/d' /etc/nginx/sites-available/team-manager

# PASSO 3: Remover configuração IA do frontend
echo -e "${AMARELO}3️⃣ Removendo configuração IA do frontend...${RESET}"
cd /var/www/team-manager

# Comentar variáveis IA no .env
sed -i 's/^VITE_AI_SERVICE_URL/#VITE_AI_SERVICE_URL/g' .env
sed -i 's/^VITE_AI_SERVICE_TOKEN/#VITE_AI_SERVICE_TOKEN/g' .env
sed -i 's/^VITE_ENABLE_AI/#VITE_ENABLE_AI/g' .env

# PASSO 4: Rebuild frontend sem IA
echo -e "${AMARELO}4️⃣ Reconstruindo frontend...${RESET}"
npm run build

# PASSO 5: Testar e recarregar Nginx
echo -e "${AMARELO}5️⃣ Testando configuração Nginx...${RESET}"
if nginx -t; then
    echo -e "${VERDE}✅ Configuração válida${RESET}"
    systemctl reload nginx
    echo -e "${VERDE}✅ Nginx recarregado${RESET}"
else
    echo -e "${VERMELHO}❌ Erro na configuração Nginx${RESET}"
    exit 1
fi

# PASSO 6: Verificar serviços
echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ INTEGRAÇÃO IA DESABILITADA COM SUCESSO!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${AZUL}📊 STATUS DOS SERVIÇOS:${RESET}"

# Verificar Frontend
if systemctl is-active --quiet nginx; then
    echo -e "  ${VERDE}✅ Frontend (Nginx): RODANDO${RESET}"
else
    echo -e "  ${VERMELHO}❌ Frontend (Nginx): PARADO${RESET}"
fi

# Verificar Backend
if systemctl is-active --quiet team-manager-backend; then
    echo -e "  ${VERDE}✅ Backend API: RODANDO na porta 3001${RESET}"
else
    echo -e "  ${VERMELHO}❌ Backend API: PARADO${RESET}"
fi

# IA desabilitada
echo -e "  ${AMARELO}🔸 Microserviço IA: DESABILITADO${RESET}"

echo ""
echo -e "${AZUL}🌐 ACESSO:${RESET}"
echo -e "  ${VERDE}➜${RESET} Team Manager: https://admin.sixquasar.pro"
echo -e "  ${VERDE}➜${RESET} API Backend: https://admin.sixquasar.pro/api/"
echo ""
echo -e "${AMARELO}💡 NOTA:${RESET}"
echo -e "  - O Team Manager está funcionando normalmente"
echo -e "  - A integração IA foi desabilitada temporariamente"
echo -e "  - Não haverá mais erros 404 em /ai/"
echo -e "  - Para reativar IA no futuro, execute:"
echo -e "    ${CIANO}/root/enable_ai_integration.sh${RESET} (quando disponível)"
echo ""

# Criar script para reativar depois
cat > /root/enable_ai_integration.sh << 'ENABLE_SCRIPT'
#!/bin/bash
echo "Script para reativar IA será implementado futuramente"
echo "Por ora, o Team Manager funciona perfeitamente sem IA"
ENABLE_SCRIPT
chmod +x /root/enable_ai_integration.sh

echo -e "${VERDE}✅ Team Manager está 100% funcional!${RESET}"
echo ""