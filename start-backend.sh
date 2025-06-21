#!/bin/bash

# Script para iniciar o backend do Team Manager localmente

echo "🚀 Iniciando Team Manager Backend..."

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Criar arquivo .env se não existir
if [ ! -f ".env" ]; then
    echo "📝 Criando arquivo .env..."
    cat > .env << EOF
# Backend Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration (copie do seu frontend)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI Configuration (opcional)
# OPENAI_API_KEY=your-openai-api-key
EOF
    echo "⚠️  Por favor, edite o arquivo .env com suas configurações do Supabase"
    echo "⚠️  Copie VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY do seu frontend"
fi

# Verificar se as variáveis do Supabase estão configuradas
if grep -q "your-supabase-url" .env; then
    echo "❌ ERRO: Configure as variáveis do Supabase no arquivo .env primeiro!"
    echo "   Edite o arquivo .env e substitua:"
    echo "   - your-supabase-url pela sua URL do Supabase"
    echo "   - your-supabase-anon-key pela sua chave anon do Supabase"
    exit 1
fi

# Iniciar o backend
echo "🌐 Iniciando servidor na porta 3001..."
echo "📍 URL: http://localhost:3001"
echo "🔍 Health Check: http://localhost:3001/health"
echo "📄 Document API: http://localhost:3001/api/process-document"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo ""

# Executar o servidor
node server/index.js