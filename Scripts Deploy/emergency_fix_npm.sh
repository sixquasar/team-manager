#!/bin/bash

# Correção de emergência para produção
SERVER="root@96.43.96.30"

echo "🚨 CORREÇÃO DE EMERGÊNCIA - NPM/LANGCHAIN"
echo "========================================"
echo "⚠️  Este script fará downtime de ~3 minutos"
echo ""
read -p "Continuar? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    exit 1
fi

ssh $SERVER << 'ENDSSH'
set -x  # Debug mode

cd /var/www/team-manager-ai

# 1. Backup crítico
echo "📦 Fazendo backup..."
cp .env .env.backup.$(date +%s) 2>/dev/null || true
cp -r src src.backup.$(date +%s) 2>/dev/null || true

# 2. Parar tudo
echo "🛑 Parando serviços..."
systemctl stop team-manager-ai
pkill -f node || true
sleep 2

# 3. Limpeza forçada
echo "🧹 Limpeza forçada..."
rm -rf node_modules
rm -rf package-lock.json
rm -rf ~/.npm
rm -rf /tmp/npm-*

# 4. Package.json mínimo funcional
echo "📝 Criando configuração mínima..."
cat > package.json << 'EOF'
{
  "name": "team-manager-ai",
  "version": "3.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/server.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "2.43.0",
    "cors": "2.8.5",
    "dotenv": "16.4.5",
    "express": "4.19.2",
    "openai": "4.65.0"
  }
}
EOF

# 5. Instalar apenas essencial
echo "📥 Instalando dependências essenciais..."
npm install --no-optional --no-audit

# 6. Adicionar LangChain incrementalmente
echo "🔧 Adicionando LangChain..."
npm install @langchain/openai@0.3.0 --no-optional
npm install @langchain/core@0.3.0 --no-optional

# 7. Reiniciar
echo "🚀 Reiniciando serviço..."
systemctl start team-manager-ai

# 8. Verificar
sleep 3
if systemctl is-active --quiet team-manager-ai; then
    echo "✅ Serviço rodando!"
else
    echo "❌ Falha ao iniciar!"
    journalctl -u team-manager-ai -n 30
fi
ENDSSH