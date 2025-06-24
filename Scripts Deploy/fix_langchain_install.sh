#!/bin/bash

#################################################################
#                                                               #
#        FIX LANGCHAIN INSTALLATION - VERSÃO SIMPLIFICADA      #
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
echo -e "${AZUL}🔧 FIX LANGCHAIN INSTALLATION${RESET}"
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

progress "1. Parando serviço..."
systemctl stop team-manager-ai || true

progress "2. Limpando instalação anterior..."
rm -rf node_modules package-lock.json .openai-* || true

progress "3. Criando package.json simplificado..."
cat > package.json << 'EOF'
{
  "name": "team-manager-ai",
  "version": "3.0.0",
  "description": "Microserviço IA com LangChain",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "start": "node src/server.js"
  },
  "dependencies": {
    "@langchain/openai": "^0.3.0",
    "@langchain/core": "^0.3.0",
    "@supabase/supabase-js": "^2.43.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "socket.io": "^4.7.5"
  }
}
EOF

progress "4. Instalando dependências base..."
npm install

progress "5. Instalando LangChain separadamente..."
npm install @langchain/community@latest @langchain/langgraph@latest zod@latest --save

progress "6. Verificando instalação..."
npm list @langchain/core @langchain/openai

progress "7. Criando estrutura se não existir..."
mkdir -p src/{agents,workflows,memory,utils,routes,config} logs

progress "8. Ajustando permissões..."
chown -R www-data:www-data /var/www/team-manager-ai
chmod -R 755 /var/www/team-manager-ai
chmod 600 /var/www/team-manager-ai/.env || true

progress "9. Reiniciando serviço..."
systemctl start team-manager-ai

sleep 3

if systemctl is-active --quiet team-manager-ai; then
    success "Microserviço IA rodando com sucesso!"
    systemctl status team-manager-ai --no-pager -l
else
    error "Erro ao iniciar microserviço IA"
    journalctl -u team-manager-ai -n 50 --no-pager
fi

echo ""
echo "📦 Pacotes instalados:"
npm list --depth=0

ENDSSH

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ FIX CONCLUÍDO!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""