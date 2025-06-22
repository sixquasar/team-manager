#!/bin/bash

#################################################################
#                                                               #
#        TESTE COMPLETO DO MICROSERVIÇO IA                     #
#        Verifica todos os endpoints e funcionalidades          #
#        Versão: 1.0.0                                          #
#        Data: 22/06/2025                                       #
#                                                               #
#################################################################

# Cores
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
CIANO='\033[0;36m'
RESET='\033[0m'

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}🧪 TESTE COMPLETO DO MICROSERVIÇO IA${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# TESTE 1: Health Check Local
echo -e "${CIANO}1️⃣ Testando Health Check Local...${RESET}"
echo -e "${AMARELO}URL: http://localhost:3002/health${RESET}"
curl -s http://localhost:3002/health | python3 -m json.tool
echo ""

# TESTE 2: Health Check via Nginx
echo -e "${CIANO}2️⃣ Testando Health Check via Nginx...${RESET}"
echo -e "${AMARELO}URL: https://admin.sixquasar.pro/ai/health${RESET}"
curl -s https://admin.sixquasar.pro/ai/health | python3 -m json.tool
echo ""

# TESTE 3: Endpoint Raiz
echo -e "${CIANO}3️⃣ Testando Endpoint Raiz...${RESET}"
echo -e "${AMARELO}URL: https://admin.sixquasar.pro/ai/${RESET}"
curl -s https://admin.sixquasar.pro/ai/ | python3 -m json.tool
echo ""

# TESTE 4: Análise de Projeto (Mock)
echo -e "${CIANO}4️⃣ Testando Análise de Projeto (Dados Mock)...${RESET}"
echo -e "${AMARELO}URL: https://admin.sixquasar.pro/ai/api/analyze/project/123${RESET}"
curl -s -X POST https://admin.sixquasar.pro/ai/api/analyze/project/123 \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Teste Mock",
    "status": "planejamento",
    "progress": 10,
    "budgetUsed": 5,
    "deadline": "2025-06-30"
  }' | python3 -m json.tool
echo ""

# TESTE 5: Análise de Projeto Real
echo -e "${CIANO}5️⃣ Testando Análise de Projeto (IA Real)...${RESET}"
echo -e "${AMARELO}URL: https://admin.sixquasar.pro/ai/api/analyze/project/456${RESET}"
echo -e "${AMARELO}Enviando projeto complexo para análise...${RESET}"
curl -s -X POST https://admin.sixquasar.pro/ai/api/analyze/project/456 \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Sistema de Gestão ERP",
    "status": "em_progresso",
    "progress": 65,
    "budgetUsed": 78,
    "deadline": "2025-08-15",
    "description": "Implementação de sistema ERP completo com módulos de vendas, estoque e financeiro",
    "team_size": 5,
    "technologies": ["React", "Node.js", "PostgreSQL"],
    "current_phase": "Desenvolvimento dos módulos principais"
  }' | python3 -m json.tool
echo ""

# TESTE 6: Verificar Logs
echo -e "${CIANO}6️⃣ Últimos Logs do Serviço...${RESET}"
journalctl -u team-manager-ai --no-pager -n 10

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ TESTES CONCLUÍDOS!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${AZUL}📊 RESUMO:${RESET}"
echo -e "  - Se todos os testes retornaram JSON válido = ${VERDE}✅ SUCESSO${RESET}"
echo -e "  - Se 'ai_powered: true' apareceu = ${VERDE}✅ LANGCHAIN FUNCIONANDO${RESET}"
echo -e "  - Se análise tem scores e recomendações = ${VERDE}✅ IA ATIVA${RESET}"
echo ""
echo -e "${AZUL}🎯 PRÓXIMOS PASSOS:${RESET}"
echo -e "  1. Integrar com o frontend do Team Manager"
echo -e "  2. Adicionar mais tipos de análise"
echo -e "  3. Implementar cache para economizar API calls"
echo -e "  4. Adicionar rate limiting"
echo ""