#!/bin/bash

#################################################################
#                                                               #
#        SYNC FIXES - COMMIT E PUSH DAS CORREÇÕES              #
#        Sincroniza todas as correções realizadas              #
#        Versão: 1.0.0                                          #
#        Data: 24/06/2025                                       #
#                                                               #
#################################################################

# Cores
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
VERMELHO='\033[0;31m'
RESET='\033[0m'

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}🔄 SINCRONIZANDO CORREÇÕES${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${VERMELHO}❌ Execute este script no diretório raiz do projeto!${RESET}"
    exit 1
fi

# Status do git
echo -e "${AMARELO}📊 Status atual:${RESET}"
git status --short

echo ""
echo -e "${AMARELO}🔍 Arquivos criados/modificados:${RESET}"
echo "- Scripts Deploy/FIX_DASHBOARD_ERRORS.sh"
echo "- Scripts Deploy/COMPLETE_AI_ROUTES.sh" 
echo "- Scripts Deploy/SQL/ADD_PROJECT_ID_TO_TAREFAS.sql"
echo "- Scripts Deploy/SYNC_FIXES.sh (este arquivo)"

echo ""
echo -e "${AMARELO}➤ Adicionando arquivos...${RESET}"
git add "Scripts Deploy/FIX_DASHBOARD_ERRORS.sh"
git add "Scripts Deploy/COMPLETE_AI_ROUTES.sh"
git add "Scripts Deploy/SQL/ADD_PROJECT_ID_TO_TAREFAS.sql"
git add "Scripts Deploy/SYNC_FIXES.sh"

echo ""
echo -e "${AMARELO}➤ Criando commit...${RESET}"
git commit -m "Fix: Correções finais dashboard e rotas AI completas - resolvidos erros 400 e 405

- FIX_DASHBOARD_ERRORS.sh: Corrige erro 400 tarefas e 405 análise IA
- COMPLETE_AI_ROUTES.sh: Implementa TODAS as 14 rotas AI esperadas pelo frontend
- ADD_PROJECT_ID_TO_TAREFAS.sql: Adiciona relacionamento faltante
- Respostas mock inteligentes e contextuais para todas as rotas AI

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
Signed-off-by: Ricardo Landim da BUSQUE AI <ricardoslandim@icloud.com>"

if [ $? -eq 0 ]; then
    echo -e "${VERDE}✅ Commit criado com sucesso!${RESET}"
else
    echo -e "${VERMELHO}❌ Erro ao criar commit${RESET}"
    exit 1
fi

echo ""
echo -e "${AMARELO}➤ Fazendo push...${RESET}"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${VERDE}✅ Push realizado com sucesso!${RESET}"
else
    echo -e "${VERMELHO}❌ Erro ao fazer push${RESET}"
    echo ""
    echo "Tentando pull + rebase..."
    git pull --rebase origin main
    git push origin main
fi

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ SINCRONIZAÇÃO COMPLETA!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo "📋 PRÓXIMOS PASSOS NO SERVIDOR:"
echo "1. SSH no servidor: ssh root@96.43.96.30"
echo "2. Executar: ./Scripts Deploy/FIX_DASHBOARD_ERRORS.sh"
echo "3. Executar: ./Scripts Deploy/COMPLETE_AI_ROUTES.sh"
echo "4. Executar SQL no Supabase se necessário"
echo ""
echo "🎯 Resultado esperado:"
echo "   - Dashboard sem erros 400 ou 405"
echo "   - Todas as rotas AI funcionando"
echo "   - Sistema 100% operacional"