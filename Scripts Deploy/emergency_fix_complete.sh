#!/bin/bash

# Correção emergencial completa - Frontend + Supabase
SERVER="root@96.43.96.30"

echo "🚨 CORREÇÃO EMERGENCIAL COMPLETA"
echo "================================"
echo ""
echo "Este script irá:"
echo "1. Criar .env do frontend"
echo "2. Buildar o frontend"
echo "3. Configurar URL Supabase temporário"
echo ""

ssh $SERVER << 'ENDSSH'
set -e

echo "═══════════════════════════════════════════════════"
echo "FASE 1: VERIFICAR ESTRUTURA DO FRONTEND"
echo "═══════════════════════════════════════════════════"
cd /var/www/team-manager-sixquasar

if [ ! -f "package.json" ]; then
    echo "❌ ERRO CRÍTICO: Frontend não existe em /var/www/team-manager-sixquasar"
    echo "Verificando outros locais..."
    find /var/www -name "package.json" -type f 2>/dev/null | grep -v node_modules | grep -v team-manager-ai
    exit 1
fi

echo "✅ Frontend encontrado"
pwd
ls -la

echo -e "\n═══════════════════════════════════════════════════"
echo "FASE 2: CRIAR ARQUIVO .ENV"
echo "═══════════════════════════════════════════════════"
if [ ! -f ".env" ]; then
    echo "Criando .env do frontend..."
    cat > .env << 'EOF'
# ATENÇÃO: Este é um URL temporário que NÃO EXISTE
# Você DEVE substituir com seu URL real do Supabase
VITE_SUPABASE_URL=https://kfghzgpwewfaeoazmkdv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmZ2h6Z3B3ZXdmYWVvYXpta2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5ODgzODYsImV4cCI6MjA0ODU2NDM4Nn0.rIEd2LsC9xKMmVCdB9DNb0D5A8xbKB7YrL-T2hFiSYg
EOF
    echo "✅ .env criado (com valores temporários)"
else
    echo "✅ .env já existe"
    grep VITE_SUPABASE_URL .env || echo "⚠️  VITE_SUPABASE_URL não configurado!"
fi

echo -e "\n═══════════════════════════════════════════════════"
echo "FASE 3: INSTALAR DEPENDÊNCIAS (se necessário)"
echo "═══════════════════════════════════════════════════"
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install --no-fund --no-audit
else
    echo "✅ Dependências já instaladas"
fi

echo -e "\n═══════════════════════════════════════════════════"
echo "FASE 4: BUILDAR FRONTEND"
echo "═══════════════════════════════════════════════════"
echo "Executando build..."
npm run build

echo -e "\n═══════════════════════════════════════════════════"
echo "FASE 5: VERIFICAR BUILD"
echo "═══════════════════════════════════════════════════"
if [ -d "dist" ]; then
    echo "✅ Build criado com sucesso!"
    echo "Arquivos gerados:"
    ls -la dist/ | head -10
    
    # Verificar se o URL Supabase está no build
    echo -e "\nVerificando URL Supabase no build:"
    grep -o "supabase\.co" dist/assets/index-*.js | head -1 && echo "✅ URL encontrado no build" || echo "❌ URL não encontrado"
else
    echo "❌ Build falhou!"
fi

echo -e "\n═══════════════════════════════════════════════════"
echo "FASE 6: RECARREGAR NGINX"
echo "═══════════════════════════════════════════════════"
nginx -s reload
echo "✅ Nginx recarregado"

echo -e "\n═══════════════════════════════════════════════════"
echo "🚨 AÇÃO CRÍTICA NECESSÁRIA"
echo "═══════════════════════════════════════════════════"
echo ""
echo "O frontend foi buildado, MAS você PRECISA:"
echo ""
echo "1. Acessar https://app.supabase.com"
echo "2. Copiar o URL correto do seu projeto"
echo "3. Editar os arquivos:"
echo "   - /var/www/team-manager-sixquasar/.env"
echo "   - /var/www/team-manager-ai/.env"
echo "4. Substituir 'kfghzgpwewfaeoazmkdv' pelo ID correto"
echo "5. Executar novamente: npm run build"
echo "6. Reiniciar microserviço: systemctl restart team-manager-ai"
echo ""
echo "SEM O URL CORRETO DO SUPABASE, O LOGIN NÃO FUNCIONARÁ!"

ENDSSH

echo ""
echo "✅ Script concluído!"
echo ""
echo "⚠️  IMPORTANTE: O login ainda NÃO funcionará até você"
echo "   configurar o URL correto do Supabase!"