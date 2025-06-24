#!/bin/bash

# Verificar configuração do nginx e proxy
SERVER="root@96.43.96.30"

echo "🔍 VERIFICAÇÃO DO NGINX E PROXY"
echo "================================"
echo ""

ssh $SERVER << 'ENDSSH'
echo "1. Verificando configuração do nginx para /api:"
echo "----------------------------------------------"
grep -A 5 -B 2 "location /api" /etc/nginx/sites-available/sixquasar || echo "❌ Não encontrei configuração /api"

echo -e "\n2. Testando microserviço diretamente:"
echo "----------------------------------------------"
echo "Health check direto na porta 3001:"
curl -s http://localhost:3001/health | python3 -m json.tool || curl -s http://localhost:3001/health || echo "❌ Microserviço não responde"

echo -e "\n3. Testando através do nginx (proxy):"
echo "----------------------------------------------"
echo "Tentando acessar via nginx:"
curl -s https://admin.sixquasar.pro/api/health -k | python3 -m json.tool || echo "❌ Proxy nginx não funciona"

echo -e "\n4. Verificando se o nginx está redirecionando corretamente:"
echo "----------------------------------------------"
curl -I https://admin.sixquasar.pro/api/health -k 2>&1 | grep -E "HTTP|Location" || echo "❌ Sem resposta"

echo -e "\n5. Logs de erro do nginx (últimas 10 linhas):"
echo "----------------------------------------------"
tail -10 /var/log/nginx/error.log | grep -v "SSL_do_handshake" || echo "Sem erros recentes"

echo -e "\n6. Verificando se a rota /api está sendo capturada:"
echo "----------------------------------------------"
nginx -T 2>/dev/null | grep -A 10 "location /api" | head -15 || echo "❌ Configuração não carregada"

echo -e "\n7. Testando login direto no microserviço:"
echo "----------------------------------------------"
RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' \
  -w "\nStatus: %{http_code}")
echo "$RESPONSE"

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "POSSÍVEIS PROBLEMAS:"
echo ""
if ! curl -s http://localhost:3001/health >/dev/null 2>&1; then
    echo "❌ Microserviço não está rodando na porta 3001"
    echo "   Solução: systemctl restart team-manager-ai"
elif ! grep -q "proxy_pass.*3001" /etc/nginx/sites-available/sixquasar 2>/dev/null; then
    echo "❌ Nginx não está configurado para fazer proxy para porta 3001"
    echo "   Solução: Adicionar configuração de proxy_pass"
elif ! curl -s https://admin.sixquasar.pro/api/health -k >/dev/null 2>&1; then
    echo "❌ Proxy do nginx não está funcionando"
    echo "   Solução: Verificar configuração e recarregar nginx"
else
    echo "✅ Configuração parece OK"
    echo "   Verifique: Console do navegador para mais detalhes"
fi

echo -e "\n📋 CONFIGURAÇÃO NGINX NECESSÁRIA:"
echo "----------------------------------------------"
cat << 'EOF'
location /api/ {
    proxy_pass http://localhost:3001/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
EOF

ENDSSH