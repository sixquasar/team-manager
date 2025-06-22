#!/bin/bash

#################################################################
#                                                               #
#        CORRIGIR DEPENDÊNCIAS LANGCHAIN                       #
#        Atualiza versões para compatibilidade                 #
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

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}🔧 CORRIGINDO DEPENDÊNCIAS LANGCHAIN${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

ssh $SERVER << 'ENDSSH'
cd /var/www/team-manager-ai

echo -e "\033[1;33m1. Fazendo backup do package.json...\033[0m"
cp package.json package.json.bak

echo -e "\033[1;33m2. Removendo dependências conflitantes...\033[0m"
npm uninstall @langchain/core @langchain/langgraph

echo -e "\033[1;33m3. Instalando versões compatíveis...\033[0m"
# Instalar versão mais recente do core primeiro
npm install @langchain/core@latest --save

# Depois instalar langgraph
npm install @langchain/langgraph@latest --save

# Instalar outras dependências necessárias se não existirem
npm install @supabase/supabase-js --save

echo -e "\033[1;33m4. Verificando versões instaladas...\033[0m"
echo "Versões atuais:"
npm list @langchain/core @langchain/langgraph @langchain/openai

echo -e "\033[1;33m5. Testando imports...\033[0m"

# Criar teste rápido
cat > test-imports.js << 'EOF'
console.log('Testando imports...');
try {
  const { StateGraph } = require('@langchain/langgraph');
  console.log('✅ @langchain/langgraph importado com sucesso');
} catch (e) {
  console.error('❌ Erro ao importar @langchain/langgraph:', e.message);
}

try {
  const { ChatOpenAI } = require('@langchain/openai');
  console.log('✅ @langchain/openai importado com sucesso');
} catch (e) {
  console.error('❌ Erro ao importar @langchain/openai:', e.message);
}

try {
  const { PromptTemplate } = require('@langchain/core/prompts');
  console.log('✅ @langchain/core/prompts importado com sucesso');
} catch (e) {
  console.error('❌ Erro ao importar @langchain/core/prompts:', e.message);
}
EOF

node test-imports.js
rm test-imports.js

echo -e "\033[1;33m6. Reiniciando serviço...\033[0m"
systemctl restart team-manager-ai

echo -e "\033[1;33m7. Verificando logs...\033[0m"
sleep 3
journalctl -u team-manager-ai -n 20 --no-pager | grep -E "error|Error|started|Started"

echo -e "\033[0;32m✅ Dependências corrigidas!\033[0m"

ENDSSH

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ CORREÇÃO CONCLUÍDA!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${AZUL}Agora teste o endpoint do Dashboard IA:${RESET}"
echo -e "curl -X POST https://admin.sixquasar.pro/ai/api/dashboard/analyze"
echo ""