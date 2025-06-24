#!/bin/bash

# Corrigir proxy do nginx para API
SERVER="root@96.43.96.30"

echo "🔧 CORREÇÃO DO PROXY NGINX PARA API"
echo "==================================="
echo ""

ssh $SERVER << 'ENDSSH'
set -e

echo "1. Fazendo backup da configuração atual:"
cp /etc/nginx/sites-available/sixquasar /etc/nginx/sites-available/sixquasar.bak.$(date +%Y%m%d_%H%M%S)

echo -e "\n2. Verificando se já existe configuração /api:"
if grep -q "location /api" /etc/nginx/sites-available/sixquasar; then
    echo "✅ Configuração /api existe, vamos atualizar..."
    # Remover configuração antiga de /api
    sed -i '/location \/api/,/^[[:space:]]*}/d' /etc/nginx/sites-available/sixquasar
else
    echo "⚠️  Configuração /api não existe, vamos adicionar..."
fi

echo -e "\n3. Adicionando configuração de proxy para API:"
# Adicionar antes do último } do server block
sed -i '/^[[:space:]]*location \/ {/i\
    # Proxy para microserviço API\
    location /api/ {\
        proxy_pass http://localhost:3001/api/;\
        proxy_http_version 1.1;\
        proxy_set_header Upgrade $http_upgrade;\
        proxy_set_header Connection '"'"'upgrade'"'"';\
        proxy_set_header Host $host;\
        proxy_cache_bypass $http_upgrade;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        \
        # Timeout aumentado para operações longas\
        proxy_connect_timeout 60s;\
        proxy_send_timeout 60s;\
        proxy_read_timeout 60s;\
    }\
' /etc/nginx/sites-available/sixquasar

echo -e "\n4. Testando configuração do nginx:"
nginx -t

echo -e "\n5. Recarregando nginx:"
systemctl reload nginx

echo -e "\n6. Verificando se microserviço está rodando:"
if systemctl is-active --quiet team-manager-ai; then
    echo "✅ Microserviço está ativo"
    curl -s http://localhost:3001/health | grep -o '"mode":"[^"]*"' || echo "Modo não identificado"
else
    echo "❌ Microserviço não está ativo! Iniciando..."
    systemctl start team-manager-ai
    sleep 3
fi

echo -e "\n7. Testando proxy (nginx -> microserviço):"
echo "----------------------------------------------"
echo "Teste 1 - Health via proxy:"
curl -s https://admin.sixquasar.pro/api/health -k | python3 -m json.tool || echo "❌ Falhou"

echo -e "\nTeste 2 - Login via proxy:"
curl -s -X POST https://admin.sixquasar.pro/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' \
  -k -w "\nStatus HTTP: %{http_code}\n"

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PROXY CONFIGURADO!"
echo ""
echo "Agora teste o login em: https://admin.sixquasar.pro"
echo ""
echo "Se ainda não funcionar, verifique:"
echo "1. Console do navegador (F12) para erros"
echo "2. Se o frontend está chamando /api/auth/login corretamente"
echo "3. journalctl -u team-manager-ai -f (para logs em tempo real)"

ENDSSH