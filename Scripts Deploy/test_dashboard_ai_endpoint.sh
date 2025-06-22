#!/bin/bash

#################################################################
#                                                               #
#        TESTAR ENDPOINT DASHBOARD IA                          #
#        Verifica se está funcionando corretamente             #
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
echo -e "${AZUL}🧪 TESTANDO ENDPOINT DASHBOARD IA${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# Teste 1: Health check do microserviço
echo -e "${AMARELO}1. Testando health check do microserviço...${RESET}"
HEALTH_RESPONSE=$(curl -s https://admin.sixquasar.pro/ai/health)
if [ $? -eq 0 ]; then
    echo -e "${VERDE}✅ Microserviço respondendo${RESET}"
    echo "Resposta: $HEALTH_RESPONSE"
else
    echo -e "${VERMELHO}❌ Microserviço não está respondendo${RESET}"
fi

echo ""

# Teste 2: Endpoint Dashboard Analyze
echo -e "${AMARELO}2. Testando endpoint /api/dashboard/analyze...${RESET}"
DASHBOARD_RESPONSE=$(curl -s -X POST https://admin.sixquasar.pro/ai/api/dashboard/analyze \
  -H "Content-Type: application/json" \
  -d '{}')

if [ $? -eq 0 ]; then
    echo -e "${VERDE}✅ Endpoint acessível${RESET}"
    
    # Verificar se tem success: true
    if echo "$DASHBOARD_RESPONSE" | grep -q '"success":true'; then
        echo -e "${VERDE}✅ Resposta com sucesso${RESET}"
        
        # Mostrar resumo da resposta
        echo ""
        echo -e "${AZUL}📊 RESUMO DA RESPOSTA:${RESET}"
        
        # Extrair algumas métricas usando grep e sed
        if echo "$DASHBOARD_RESPONSE" | grep -q "companyHealthScore"; then
            HEALTH_SCORE=$(echo "$DASHBOARD_RESPONSE" | grep -o '"companyHealthScore":[0-9]*' | cut -d: -f2)
            echo "• Company Health Score: ${HEALTH_SCORE}%"
        fi
        
        if echo "$DASHBOARD_RESPONSE" | grep -q "projectsAtRisk"; then
            PROJECTS_AT_RISK=$(echo "$DASHBOARD_RESPONSE" | grep -o '"projectsAtRisk":[0-9]*' | cut -d: -f2)
            echo "• Projetos em Risco: $PROJECTS_AT_RISK"
        fi
        
        if echo "$DASHBOARD_RESPONSE" | grep -q "teamProductivityIndex"; then
            PRODUCTIVITY=$(echo "$DASHBOARD_RESPONSE" | grep -o '"teamProductivityIndex":[0-9]*' | cut -d: -f2)
            echo "• Índice de Produtividade: ${PRODUCTIVITY}%"
        fi
        
        if echo "$DASHBOARD_RESPONSE" | grep -q "rawCounts"; then
            echo ""
            echo -e "${AZUL}📈 CONTAGEM DE DADOS:${RESET}"
            echo "$DASHBOARD_RESPONSE" | grep -A 5 "rawCounts"
        fi
        
        # Mostrar resposta completa formatada
        echo ""
        echo -e "${AZUL}📄 RESPOSTA COMPLETA (formatada):${RESET}"
        echo "$DASHBOARD_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$DASHBOARD_RESPONSE"
        
    else
        echo -e "${VERMELHO}❌ Resposta indica erro${RESET}"
        echo "Resposta: $DASHBOARD_RESPONSE"
    fi
else
    echo -e "${VERMELHO}❌ Erro ao acessar endpoint${RESET}"
fi

echo ""

# Teste 3: Verificar logs do serviço
echo -e "${AMARELO}3. Últimos logs do serviço (erros)...${RESET}"
ssh root@96.43.96.30 "journalctl -u team-manager-ai -n 30 --no-pager | grep -i error" || echo "Nenhum erro recente"

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ TESTE CONCLUÍDO!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${AZUL}Se tudo estiver funcionando, execute:${RESET}"
echo "./Scripts\\ Deploy/implement_dashboard_ai_frontend.sh"
echo ""