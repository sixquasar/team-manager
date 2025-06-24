#!/bin/bash

# Debug detalhado do proxy API
SERVER="root@96.43.96.30"

echo "🔍 DEBUG DETALHADO - PROXY API"
echo "=============================="
echo ""

ssh $SERVER << 'ENDSSH'
set -e

echo "1. Verificando se há múltiplas configurações conflitantes:"
echo "--------------------------------------------------------"
echo "Arquivos com location /api:"
grep -l "location /api" /etc/nginx/sites-enabled/* 2>/dev/null

echo -e "\n2. Testando diferentes endpoints diretamente:"
echo "--------------------------------------------------------"
echo "Microserviço direto (porta 3001):"
echo -n "  /health: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health && echo " ✅" || echo " ❌"
echo -n "  /api/health: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health && echo " ✅" || echo " ❌"

echo -e "\n3. Testando através do nginx:"
echo "--------------------------------------------------------"
echo -n "Via nginx /api/health: "
RESPONSE=$(curl -s -w "\n%{http_code}" https://admin.sixquasar.pro/api/health -k)
echo "$RESPONSE" | tail -1

echo -e "\n4. Verificando resposta completa:"
echo "--------------------------------------------------------"
echo "Comando: curl -v https://admin.sixquasar.pro/api/health -k"
curl -v https://admin.sixquasar.pro/api/health -k 2>&1 | grep -E "< HTTP|< Location|< Content|Connected to|SSL connection"

echo -e "\n5. Verificando se microserviço recebe requisições:"
echo "--------------------------------------------------------"
echo "Logs do microserviço (últimas 5 linhas):"
journalctl -u team-manager-ai -n 5 --no-pager

echo -e "\n6. Testando com curl verbose o auth endpoint:"
echo "--------------------------------------------------------"
curl -v -X POST https://admin.sixquasar.pro/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -k 2>&1 | grep -E "< HTTP|< |> POST"

echo -e "\n7. Verificando configuração completa do location /api:"
echo "--------------------------------------------------------"
nginx -T 2>/dev/null | grep -A 20 "location /api" | head -25

echo -e "\n8. Testando se o problema é HTTPS vs HTTP:"
echo "--------------------------------------------------------"
echo "Tentando HTTP direto:"
curl -s http://admin.sixquasar.pro/api/health 2>&1 | head -5

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ANÁLISE:"
echo ""
if curl -s http://localhost:3001/health >/dev/null 2>&1; then
    echo "✅ Microserviço respondendo corretamente"
else
    echo "❌ Microserviço com problema"
fi

if curl -s -o /dev/null -w "%{http_code}" https://admin.sixquasar.pro/api/auth/login -k -X POST -H "Content-Type: application/json" -d '{}' 2>/dev/null | grep -q "401"; then
    echo "✅ Auth endpoint acessível (retorna 401 como esperado)"
    echo ""
    echo "🎯 LOGIN DEVE ESTAR FUNCIONANDO!"
    echo "   O erro 401 é esperado para credenciais inválidas"
    echo "   Teste com credenciais reais no navegador"
else
    echo "❌ Auth endpoint não acessível"
fi

ENDSSH