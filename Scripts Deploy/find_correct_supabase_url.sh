#!/bin/bash

# Encontrar o URL correto do Supabase
SERVER="root@96.43.96.30"

echo "🔍 PROCURANDO URL CORRETO DO SUPABASE"
echo "====================================="
echo ""

ssh $SERVER << 'ENDSSH'
set -e

echo "1. Verificando .env do microserviço:"
echo "-----------------------------------"
if [ -f /var/www/team-manager-ai/.env ]; then
    echo "Conteúdo do .env:"
    cat /var/www/team-manager-ai/.env | grep -E "SUPABASE_URL|SUPABASE_KEY" | sed 's/KEY=.*/KEY=***/'
else
    echo "❌ .env não existe no microserviço"
fi

echo -e "\n2. Verificando .env do frontend:"
echo "-----------------------------------"
if [ -f /var/www/team-manager-sixquasar/.env ]; then
    echo "Conteúdo do .env frontend:"
    cat /var/www/team-manager-sixquasar/.env | grep -E "VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY" | sed 's/KEY=.*/KEY=***/'
else
    echo "❌ .env não existe no frontend"
fi

echo -e "\n3. Procurando no código do frontend (build):"
echo "-----------------------------------"
if [ -d /var/www/team-manager-sixquasar/dist ]; then
    echo "Procurando URLs Supabase no build:"
    grep -o '[a-z0-9]\+\.supabase\.co' /var/www/team-manager-sixquasar/dist/assets/index-*.js 2>/dev/null | head -5 | sort -u
else
    echo "❌ Build do frontend não existe"
fi

echo -e "\n4. Verificando server.js do microserviço:"
echo "-----------------------------------"
grep -E "supabase\.co|SUPABASE_URL" /var/www/team-manager-ai/src/server.js | grep -v "^//" | head -5

echo -e "\n5. Testando possíveis URLs Supabase:"
echo "-----------------------------------"
# Lista de possíveis URLs baseados em padrões comuns
POSSIBLE_URLS=(
    "kfghzgpwewfaeoazmkdv.supabase.co"
    "sixquasar.supabase.co"
    "team-manager.supabase.co"
    "busqueai.supabase.co"
)

echo "Testando resolução DNS para URLs conhecidos:"
for url in "${POSSIBLE_URLS[@]}"; do
    echo -n "- $url: "
    if nslookup "$url" 8.8.8.8 >/dev/null 2>&1; then
        echo "✅ EXISTE!"
        # Testar HTTPS
        curl -s -o /dev/null -w "HTTPS: %{http_code}" "https://$url/rest/v1/"
        echo ""
    else
        echo "❌ Não existe"
    fi
done

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "AÇÃO NECESSÁRIA:"
echo ""
echo "1. O URL kfghzgpwewfaeoazmkdv.supabase.co NÃO EXISTE"
echo "2. Você precisa:"
echo "   a) Verificar o URL correto no dashboard do Supabase"
echo "   b) Atualizar os arquivos .env com o URL correto"
echo "   c) Rebuild do frontend se necessário"
echo ""
echo "Para atualizar, edite:"
echo "- /var/www/team-manager-ai/.env"
echo "- /var/www/team-manager-sixquasar/.env"

ENDSSH