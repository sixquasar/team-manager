#!/bin/bash

#################################################################
#                                                               #
#        FIX PRODUCTION ERROR - LANGCHAIN INSTALLATION          #
#        Solução para ENOTEMPTY e conflitos de versão          #
#        Data: 24/06/2025                                       #
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
echo -e "${AZUL}🔧 FIX PRODUCTION ERROR - LANGCHAIN${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

ssh $SERVER << 'ENDSSH'
set -e

# Função para exibir progresso
progress() {
    echo -e "\033[1;33m➤ $1\033[0m"
}

# Função para exibir sucesso
success() {
    echo -e "\033[0;32m✅ $1\033[0m"
}

# Função para exibir erro
error() {
    echo -e "\033[0;31m❌ $1\033[0m"
}

cd /var/www/team-manager-ai

echo -e "\033[0;34m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
echo -e "\033[0;34m FASE 1: DIAGNÓSTICO E LIMPEZA PROFUNDA\033[0m"
echo -e "\033[0;34m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"

progress "1.1. Parando serviço para evitar locks..."
systemctl stop team-manager-ai || true
sleep 2

progress "1.2. Verificando processos node ativos..."
pkill -f "node.*team-manager-ai" || true
sleep 1

progress "1.3. Limpeza profunda de arquivos npm..."
# Remove TODOS os arquivos temporários e cache
rm -rf node_modules package-lock.json .npm npm-debug.log* || true
rm -rf /root/.npm/_cacache || true
rm -rf /root/.npm/_logs || true
rm -rf .openai-* || true

progress "1.4. Limpando cache npm global..."
npm cache clean --force

progress "1.5. Verificando se diretório está limpo..."
if [ -d "node_modules" ]; then
    error "node_modules ainda existe! Forçando remoção..."
    rm -rf node_modules || {
        error "Não foi possível remover node_modules. Verificando permissões..."
        ls -la node_modules/
        exit 1
    }
fi

success "Limpeza completa realizada!"

echo -e "\033[0;34m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
echo -e "\033[0;34m FASE 2: INSTALAÇÃO CORRETA\033[0m"
echo -e "\033[0;34m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"

progress "2.1. Criando package.json com versões compatíveis..."
cat > package.json << 'EOF'
{
  "name": "team-manager-ai",
  "version": "3.0.1",
  "description": "Microserviço IA com LangChain + LangGraph",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "@langchain/core": "^0.3.0",
    "@langchain/openai": "^0.3.0",
    "@langchain/community": "^0.3.0",
    "@langchain/langgraph": "^0.2.0",
    "@supabase/supabase-js": "^2.43.0",
    "openai": "^4.65.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "socket.io": "^4.7.5",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  },
  "overrides": {
    "@langchain/core": "^0.3.0"
  }
}
EOF

progress "2.2. Instalando dependências uma por vez..."
# Instala core primeiro
npm install @langchain/core@^0.3.0

# Depois as outras dependências LangChain
npm install @langchain/openai@^0.3.0 @langchain/community@^0.3.0 @langchain/langgraph@^0.2.0

# Finalmente o resto
npm install

progress "2.3. Verificando instalação..."
npm list @langchain/core @langchain/openai openai || true

echo -e "\033[0;34m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
echo -e "\033[0;34m FASE 3: VALIDAÇÃO E REINICIALIZAÇÃO\033[0m"
echo -e "\033[0;34m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"

progress "3.1. Verificando estrutura de diretórios..."
mkdir -p src/{agents,workflows,memory,utils,routes,config} logs || true

progress "3.2. Ajustando permissões..."
chown -R www-data:www-data /var/www/team-manager-ai
chmod -R 755 /var/www/team-manager-ai
chmod 600 /var/www/team-manager-ai/.env || true

progress "3.3. Testando sintaxe do servidor..."
node -c src/server.js || {
    error "Erro de sintaxe no servidor!"
    exit 1
}

progress "3.4. Reiniciando serviço..."
systemctl start team-manager-ai

sleep 3

if systemctl is-active --quiet team-manager-ai; then
    success "Microserviço IA rodando com sucesso!"
    echo ""
    echo "📊 Status do serviço:"
    systemctl status team-manager-ai --no-pager -l
else
    error "Erro ao iniciar microserviço IA"
    echo ""
    echo "📋 Logs de erro:"
    journalctl -u team-manager-ai -n 50 --no-pager
fi

echo ""
echo "📦 Versões instaladas:"
npm list --depth=0

echo ""
echo "🔍 Verificação final:"
echo -n "OpenAI instalado: "
[ -d "node_modules/openai" ] && echo -e "\033[0;32m✓\033[0m" || echo -e "\033[0;31m✗\033[0m"
echo -n "LangChain Core: "
[ -d "node_modules/@langchain/core" ] && echo -e "\033[0;32m✓\033[0m" || echo -e "\033[0;31m✗\033[0m"

ENDSSH

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ SCRIPT DE CORREÇÃO CONCLUÍDO!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo "Se ainda houver problemas, verifique:"
echo "1. Espaço em disco: df -h"
echo "2. Processos travados: ps aux | grep node"
echo "3. Permissões: ls -la /var/www/team-manager-ai/node_modules/"
echo ""