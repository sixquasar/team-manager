#!/bin/bash

# Encontrar e atualizar o frontend com configuração correta
SERVER="root@96.43.96.30"

echo "🔍 LOCALIZANDO E ATUALIZANDO FRONTEND"
echo "===================================="
echo ""

ssh $SERVER << 'ENDSSH'
set -e

# Novos valores corretos
NEW_SUPABASE_URL="https://cfvuldebsoxmhuarikdk.supabase.co"
NEW_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnVsZGVic294bWh1YXJpa2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTY0NjAsImV4cCI6MjA2NDgzMjQ2MH0.4MQTy_NcARiBm_vwUa05S8zyW0okBbc-vb_7mIfT0J8"

echo "1. Procurando diretório do frontend:"
echo "-----------------------------------"
# Procurar por package.json que tenha "vite" ou "react"
FRONTEND_DIRS=$(find /var/www -name "package.json" -type f 2>/dev/null | 
    xargs grep -l -E "vite|react" 2>/dev/null | 
    grep -v node_modules | 
    grep -v team-manager-ai | 
    xargs -I {} dirname {})

if [ -z "$FRONTEND_DIRS" ]; then
    echo "❌ Nenhum frontend encontrado!"
    echo "Procurando qualquer diretório com build/dist..."
    find /var/www -type d -name "dist" 2>/dev/null | grep -v node_modules
    exit 1
fi

echo "Diretórios encontrados:"
echo "$FRONTEND_DIRS"

# Usar o primeiro diretório encontrado
FRONTEND_DIR=$(echo "$FRONTEND_DIRS" | head -1)
echo -e "\nUsando: $FRONTEND_DIR"

cd "$FRONTEND_DIR"
pwd

echo -e "\n2. Verificando estrutura:"
echo "-----------------------------------"
ls -la

echo -e "\n3. Criando/Atualizando .env:"
echo "-----------------------------------"
# Backup se existir
[ -f .env ] && cp .env .env.bak.$(date +%Y%m%d_%H%M%S)

# Criar novo .env
cat > .env << EOF
# Supabase - Configuração Correta
VITE_SUPABASE_URL=$NEW_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$NEW_ANON_KEY

# Outras configurações
VITE_APP_TITLE="Team Manager"
EOF

echo "✅ .env criado/atualizado"
cat .env

echo -e "\n4. Instalando dependências (se necessário):"
echo "-----------------------------------"
if [ ! -d "node_modules" ]; then
    echo "Instalando..."
    npm install --no-fund --no-audit
else
    echo "✅ Dependências já instaladas"
fi

echo -e "\n5. Buildando frontend:"
echo "-----------------------------------"
npm run build

echo -e "\n6. Verificando build:"
echo "-----------------------------------"
if [ -d "dist" ]; then
    echo "✅ Build criado!"
    ls -la dist/ | head -5
    
    # Verificar novo URL no build
    echo -e "\nVerificando URL no build:"
    if grep -q "cfvuldebsoxmhuarikdk" dist/assets/index-*.js 2>/dev/null; then
        echo "✅ Novo URL Supabase encontrado no build!"
    else
        echo "❌ URL não encontrado - pode ser necessário limpar cache"
        echo "Tentando build limpo..."
        rm -rf dist
        npm run build
    fi
else
    echo "❌ Build falhou!"
fi

echo -e "\n7. Verificando nginx:"
echo "-----------------------------------"
# Descobrir qual arquivo nginx serve este frontend
NGINX_CONFIG=$(grep -l "$FRONTEND_DIR" /etc/nginx/sites-available/* 2>/dev/null | head -1)
if [ -n "$NGINX_CONFIG" ]; then
    echo "Configuração nginx: $NGINX_CONFIG"
    grep -E "root|server_name" "$NGINX_CONFIG" | head -5
else
    echo "Procurando por admin.sixquasar.pro..."
    grep -l "admin.sixquasar.pro" /etc/nginx/sites-available/* | head -1
fi

echo -e "\n8. Reiniciando serviços:"
echo "-----------------------------------"
systemctl restart team-manager-ai
nginx -s reload
echo "✅ Serviços reiniciados"

echo -e "\n9. Teste final:"
echo "-----------------------------------"
echo "Testando auth endpoint:"
curl -s -X POST https://admin.sixquasar.pro/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sixquasar.pro","password":"teste123"}' \
  -k -w "\nHTTP Status: %{http_code}\n" | tail -5

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PROCESSO CONCLUÍDO!"
echo ""
echo "Frontend em: $FRONTEND_DIR"
echo "Build em: $FRONTEND_DIR/dist"
echo ""
echo "🎯 TESTE O LOGIN AGORA!"
echo "   https://admin.sixquasar.pro"

ENDSSH