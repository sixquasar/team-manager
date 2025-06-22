#!/bin/bash

#################################################################
#                                                               #
#        SCRIPT DE CORREÇÃO DO MICROSERVIÇO IA                 #
#        Corrige problemas de dependências LangChain           #
#        Versão: 1.0.0                                          #
#        Data: 22/06/2025                                       #
#                                                               #
#################################################################

# Cores para output
VERMELHO='\033[0;31m'
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
RESET='\033[0m'

AI_DIR="/var/www/team-manager-ai"

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}🔧 CORREÇÃO DO MICROSERVIÇO IA${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${VERMELHO}❌ Este script precisa ser executado como root (sudo)${RESET}"
    exit 1
fi

# Parar o serviço
echo -e "${AMARELO}⏹️  Parando serviço team-manager-ai...${RESET}"
systemctl stop team-manager-ai

# Navegar para o diretório
cd "$AI_DIR" || exit 1

# Limpar tudo
echo -e "${AMARELO}🧹 Limpando instalação anterior...${RESET}"
rm -rf node_modules package-lock.json
npm cache clean --force

# Criar package.json corrigido
echo -e "${AMARELO}📝 Criando package.json corrigido...${RESET}"
cat > package.json << 'EOF'
{
  "name": "team-manager-ai",
  "version": "1.0.0",
  "description": "AI Microservice for Team Manager",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "socket.io": "^4.7.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "redis": "^4.6.13",
    "bull": "^4.12.2",
    "winston": "^3.13.0",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.2.0",
    "openai": "^4.38.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
EOF

# Instalar dependências básicas primeiro
echo -e "${AMARELO}📦 Instalando dependências básicas...${RESET}"
npm install

# Instalar LangChain separadamente com versões específicas
echo -e "${AMARELO}🤖 Instalando LangChain com versões específicas...${RESET}"
npm install langchain@0.2.3 --save --legacy-peer-deps
npm install @langchain/core@0.2.9 --save --legacy-peer-deps
npm install @langchain/openai@0.1.3 --save --legacy-peer-deps
npm install @langchain/community@0.2.13 --save --legacy-peer-deps

# Verificar instalação
echo -e "${AMARELO}🔍 Verificando instalação...${RESET}"
if [ -d "node_modules/langchain" ] && [ -d "node_modules/@langchain/core" ] && [ -d "node_modules/@langchain/openai" ]; then
    echo -e "${VERDE}✅ Dependências instaladas com sucesso!${RESET}"
else
    echo -e "${VERMELHO}❌ Algumas dependências não foram instaladas${RESET}"
    echo -e "${AMARELO}Tentando instalação alternativa...${RESET}"
    
    # Tentar com yarn se disponível
    if command -v yarn >/dev/null 2>&1; then
        echo -e "${AMARELO}Usando yarn...${RESET}"
        yarn add langchain@0.2.3 @langchain/core@0.2.9 @langchain/openai@0.1.3 @langchain/community@0.2.13
    fi
fi

# Restaurar serviço para usar index.js normal
echo -e "${AMARELO}🔧 Restaurando configuração do serviço...${RESET}"
if grep -q "index-minimal.js" /etc/systemd/system/team-manager-ai.service; then
    sed -i 's|index-minimal.js|index.js|' /etc/systemd/system/team-manager-ai.service
    systemctl daemon-reload
fi

# Reiniciar serviço
echo -e "${AMARELO}🚀 Iniciando serviço...${RESET}"
systemctl start team-manager-ai

# Aguardar
sleep 5

# Verificar status
if systemctl is-active --quiet team-manager-ai; then
    echo -e "${VERDE}✅ Microserviço IA está rodando!${RESET}"
    echo -e "${AZUL}Teste com: curl http://localhost:3002/health${RESET}"
else
    echo -e "${VERMELHO}❌ Microserviço IA não está rodando${RESET}"
    echo -e "${AMARELO}Verificando logs...${RESET}"
    journalctl -u team-manager-ai --no-pager -n 30
    
    echo ""
    echo -e "${AMARELO}💡 Sugestões:${RESET}"
    echo -e "1. Verifique se a porta 3002 está livre: ${AZUL}netstat -tlnp | grep 3002${RESET}"
    echo -e "2. Verifique a API key: ${AZUL}cat $AI_DIR/.env | grep OPENAI${RESET}"
    echo -e "3. Tente modo mínimo: ${AZUL}systemctl stop team-manager-ai${RESET}"
    echo -e "   ${AZUL}cd $AI_DIR && node src/index-minimal.js${RESET}"
fi

echo ""
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"