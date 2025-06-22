#!/bin/bash

#################################################################
#                                                               #
#        CORRIGIR EXIBIÇÃO DO MODELO GPT-4.1-MINI             #
#        Atualiza componente para mostrar modelo correto       #
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

SERVER="root@96.43.96.30"

echo -e "${VERMELHO}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERMELHO}🔧 CORRIGINDO EXIBIÇÃO DO MODELO GPT-4.1-MINI${RESET}"
echo -e "${VERMELHO}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

ssh $SERVER << 'ENDSSH'
cd /var/www/team-manager

echo -e "\033[1;33m1. Atualizando ProjectAIAnalysis.tsx para mostrar GPT-4.1-mini...\033[0m"

# Fazer backup
cp src/components/projects/ProjectAIAnalysis.tsx src/components/projects/ProjectAIAnalysis.tsx.bak

# Atualizar o componente para mostrar o modelo correto
sed -i 's/Powered by GPT-4/Powered by GPT-4.1-mini/g' src/components/projects/ProjectAIAnalysis.tsx
sed -i 's/<span className="font-semibold">GPT-4<\/span>/<span className="font-semibold text-purple-600">GPT-4.1-mini<\/span>/g' src/components/projects/ProjectAIAnalysis.tsx

# Adicionar também informação do modelo usado se vier da API
sed -i '/Powered by <span className="font-semibold text-purple-600">GPT-4.1-mini<\/span>/a\            {analysis.model_used && <span className="text-xs text-gray-400 ml-2">({analysis.model_used})</span>}' src/components/projects/ProjectAIAnalysis.tsx

echo -e "\033[1;33m2. Atualizando hook use-ai-analysis.ts para passar modelo...\033[0m"

# Atualizar o hook se existir
if [ -f "src/hooks/use-ai-analysis.ts" ]; then
    sed -i 's/ai_powered: boolean;/ai_powered: boolean;\n  model_used?: string;/g' src/hooks/use-ai-analysis.ts
fi

echo -e "\033[1;33m3. Verificando mudanças...\033[0m"
echo "Procurando por GPT-4.1-mini no componente:"
grep -n "GPT-4.1-mini" src/components/projects/ProjectAIAnalysis.tsx || echo "Não encontrado!"

echo -e "\033[1;33m4. Parando backend...\033[0m"
systemctl stop team-manager-backend

echo -e "\033[1;33m5. Executando build...\033[0m"
npm run build

echo -e "\033[1;33m6. Iniciando backend...\033[0m"
systemctl start team-manager-backend

echo -e "\033[1;33m7. Recarregando nginx...\033[0m"
systemctl reload nginx

echo -e "\033[0;32m✅ Componente atualizado para mostrar GPT-4.1-mini!\033[0m"

# Verificar também o microserviço
echo -e "\033[1;33m8. Verificando se microserviço está usando GPT-4.1-mini...\033[0m"
if [ -f "/var/www/team-manager-ai/src/agents/projectAnalyzer.js" ]; then
    echo "Modelo configurado no projectAnalyzer.js:"
    grep -n "modelName:" /var/www/team-manager-ai/src/agents/projectAnalyzer.js
fi

ENDSSH

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ EXIBIÇÃO CORRIGIDA!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${VERMELHO}🔄 AGORA DEVE MOSTRAR:${RESET}"
echo -e "${AZUL}  'Powered by GPT-4.1-mini'${RESET}"
echo ""
echo -e "${AMARELO}⚠️  IMPORTANTE:${RESET}"
echo -e "  1. Dê F5 para recarregar a página"
echo -e "  2. Limpe o cache se necessário (Ctrl+Shift+Del)"
echo -e "  3. Abra o projeto novamente"
echo ""