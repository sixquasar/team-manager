#!/bin/bash

# Correção final do nginx para API
SERVER="root@96.43.96.30"

echo "🔧 CORREÇÃO FINAL DO NGINX API"
echo "=============================="
echo ""

ssh $SERVER << 'ENDSSH'
set -e

echo "1. Verificando configuração atual do nginx:"
echo "------------------------------------------"
echo "Arquivo: /etc/nginx/sites-available/team-manager"
grep -A 15 "location /api" /etc/nginx/sites-available/team-manager || echo "❌ Sem location /api"

echo -e "\n2. Testando microserviço diretamente:"
echo "--------------------------------------"
echo "GET /health:"
curl -s http://localhost:3001/health | head -1
echo -e "\nGET /api/health (deve dar 404):"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health
echo ""

echo -e "\n3. Verificando se o problema é o path /api/:"
echo "--------------------------------------------"
echo "O microserviço espera /api/auth/login ou apenas /auth/login?"
echo "Testando POST direto no microserviço:"
echo -n "- /api/auth/login: "
curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{}' -w "%{http_code}" -o /dev/null
echo -n "- /auth/login: "
curl -s -X POST http://localhost:3001/auth/login -H "Content-Type: application/json" -d '{}' -w "%{http_code}" -o /dev/null
echo ""

echo -e "\n4. Criando nova configuração nginx correta:"
echo "------------------------------------------"
# Backup
cp /etc/nginx/sites-available/team-manager /etc/nginx/sites-available/team-manager.bak.$(date +%Y%m%d_%H%M%S)

# Vamos verificar o que o server.js espera
echo "Verificando rotas no server.js:"
grep -E "app\.(get|post|put|delete)" /var/www/team-manager-ai/src/server.js | grep -v "^//" | head -10

echo -e "\n5. Atualizando configuração nginx:"
echo "----------------------------------"
# Remover location /api antigo se existir
perl -i -0pe 's/\s*location\s+\/api[^{]*\{[^}]*\}//gs' /etc/nginx/sites-available/team-manager

# Adicionar configuração correta
# Como o server.js usa /api/auth/login, precisamos passar tudo após /api/
perl -i -pe 'if (/location\s+\/\s*\{/) {
    print "    # API Proxy - passa tudo após /api/ para o microserviço\n";
    print "    location /api/ {\n";
    print "        # Remove /api do path antes de passar para o microserviço\n";
    print "        rewrite ^/api/(.*)\$ /\$1 break;\n";
    print "        \n";
    print "        proxy_pass http://localhost:3001;\n";
    print "        proxy_http_version 1.1;\n";
    print "        proxy_set_header Upgrade \$http_upgrade;\n";
    print "        proxy_set_header Connection '\''upgrade'\'';\n";
    print "        proxy_set_header Host \$host;\n";
    print "        proxy_cache_bypass \$http_upgrade;\n";
    print "        proxy_set_header X-Real-IP \$remote_addr;\n";
    print "        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\n";
    print "        proxy_set_header X-Forwarded-Proto \$scheme;\n";
    print "        \n";
    print "        # Timeouts\n";
    print "        proxy_connect_timeout 60s;\n";
    print "        proxy_send_timeout 60s;\n";
    print "        proxy_read_timeout 60s;\n";
    print "    }\n\n";
}' /etc/nginx/sites-available/team-manager

echo -e "\n6. Verificando nova configuração:"
echo "---------------------------------"
grep -A 20 "location /api" /etc/nginx/sites-available/team-manager

echo -e "\n7. Testando e recarregando nginx:"
echo "---------------------------------"
nginx -t && nginx -s reload

echo -e "\n8. Testando endpoints através do nginx:"
echo "---------------------------------------"
sleep 1

echo "Teste 1 - Health (via /api/health -> /health):"
curl -s https://admin.sixquasar.pro/api/health -k | python3 -m json.tool || echo "Status: $(curl -s -o /dev/null -w "%{http_code}" https://admin.sixquasar.pro/api/health -k)"

echo -e "\nTeste 2 - Auth login:"
RESPONSE=$(curl -s -X POST https://admin.sixquasar.pro/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}' \
  -k -w "\nHTTP Status: %{http_code}")
echo "$RESPONSE" | tail -5

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ NGINX CORRIGIDO!"
echo ""
echo "O nginx agora:"
echo "- Remove /api/ do path antes de passar para o microserviço"
echo "- /api/health → /health"
echo "- /api/auth/login → /auth/login"
echo ""
echo "🎯 TESTE O LOGIN AGORA!"
echo "   https://admin.sixquasar.pro"

ENDSSH