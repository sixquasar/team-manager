#!/bin/bash

#################################################################
#                                                               #
#        VERIFICAR DASHBOARD IA COMPLETO                        #
#        Checa se tudo está funcionando                        #
#        Versão: 1.0.0                                          #
#        Data: 22/06/2025                                       #
#                                                               #
#################################################################

# Cores
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
VERMELHO='\033[0;31m'
RESET='\033[0m'

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}🔍 VERIFICANDO DASHBOARD IA COMPLETO${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# 1. Testar endpoint backend
echo -e "${AMARELO}1. Testando endpoint Dashboard IA...${RESET}"
RESPONSE=$(curl -s -X POST https://admin.sixquasar.pro/ai/api/dashboard/analyze)

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${VERDE}✅ Backend respondendo corretamente${RESET}"
    
    # Mostrar métricas
    if echo "$RESPONSE" | grep -q "companyHealthScore"; then
        HEALTH=$(echo "$RESPONSE" | grep -o '"companyHealthScore":[0-9]*' | cut -d: -f2)
        PROJECTS_RISK=$(echo "$RESPONSE" | grep -o '"projectsAtRisk":[0-9]*' | cut -d: -f2)
        echo "  • Health Score: ${HEALTH}%"
        echo "  • Projetos em Risco: ${PROJECTS_RISK}"
    fi
else
    echo -e "${VERMELHO}❌ Backend com problema${RESET}"
    echo "$RESPONSE" | head -n 5
fi

echo ""

# 2. Verificar frontend
echo -e "${AMARELO}2. Verificando arquivos do frontend...${RESET}"

ssh root@96.43.96.30 << 'ENDSSH'
cd /var/www/team-manager

echo "Verificando DashboardAI.tsx..."
if [ -f "src/pages/DashboardAI.tsx" ]; then
    echo -e "\033[0;32m✅ DashboardAI.tsx existe\033[0m"
    echo "  Tamanho: $(wc -l src/pages/DashboardAI.tsx | awk '{print $1}') linhas"
else
    echo -e "\033[0;31m❌ DashboardAI.tsx NÃO existe!\033[0m"
fi

echo ""
echo "Verificando hook useAIDashboard..."
if [ -f "src/hooks/use-ai-dashboard.ts" ]; then
    echo -e "\033[0;32m✅ use-ai-dashboard.ts existe\033[0m"
else
    echo -e "\033[0;31m❌ use-ai-dashboard.ts NÃO existe!\033[0m"
fi

echo ""
echo "Verificando rota no App.tsx..."
if grep -q "dashboard-ai" src/App.tsx; then
    echo -e "\033[0;32m✅ Rota /dashboard-ai configurada\033[0m"
    grep -n "dashboard-ai" src/App.tsx | head -n 2
else
    echo -e "\033[0;31m❌ Rota /dashboard-ai NÃO encontrada!\033[0m"
fi

echo ""
echo "Verificando menu no Sidebar..."
if grep -q "Dashboard IA" src/components/layout/Sidebar.tsx; then
    echo -e "\033[0;32m✅ Menu 'Dashboard IA' existe\033[0m"
    grep -n "Dashboard IA" src/components/layout/Sidebar.tsx | head -n 2
else
    echo -e "\033[0;31m❌ Menu 'Dashboard IA' NÃO encontrado!\033[0m"
fi

echo ""
echo "Verificando se Recharts está instalado..."
if grep -q "recharts" package.json; then
    echo -e "\033[0;32m✅ Recharts instalado\033[0m"
else
    echo -e "\033[0;31m❌ Recharts NÃO instalado!\033[0m"
fi

echo ""
echo "Última build do frontend:"
ls -la dist/ | head -n 5

ENDSSH

echo ""
echo -e "${AMARELO}3. URLs para testar:${RESET}"
echo -e "${VERDE}Backend (API):${RESET}"
echo "curl -X POST https://admin.sixquasar.pro/ai/api/dashboard/analyze"
echo ""
echo -e "${VERDE}Frontend (Browser):${RESET}"
echo "https://admin.sixquasar.pro/dashboard-ai"
echo ""

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}📊 RESUMO${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo "Se tudo estiver ✅, acesse:"
echo -e "${VERDE}https://admin.sixquasar.pro${RESET}"
echo "1. Faça login"
echo "2. Procure 'Dashboard IA' no menu lateral"
echo "3. Clique para ver as análises inteligentes!"
echo ""
echo "Se algo estiver ❌, me avise qual parte falhou."
echo ""