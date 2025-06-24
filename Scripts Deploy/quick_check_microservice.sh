#!/bin/bash

# Verificação rápida do estado do microserviço
SERVER="root@96.43.96.30"

echo "🔍 VERIFICAÇÃO RÁPIDA - MICROSERVIÇO"
echo "====================================="
echo ""

ssh $SERVER << 'ENDSSH'
echo "1. Testando endpoint direto do microserviço:"
echo "----------------------------------------"
curl -v http://localhost:3001/health 2>&1 | grep -E "HTTP|mode|status|< " || echo "❌ Microserviço não responde"

echo -e "\n2. Verificando se o serviço está rodando:"
echo "----------------------------------------"
ps aux | grep -E "node.*server" | grep -v grep || echo "❌ Nenhum processo node rodando"

echo -e "\n3. Verificando porta 3001:"
echo "----------------------------------------"
netstat -tlnp | grep 3001 || ss -tlnp | grep 3001 || echo "❌ Porta 3001 não está escutando"

echo -e "\n4. Últimos logs do serviço:"
echo "----------------------------------------"
journalctl -u team-manager-ai -n 20 --no-pager | tail -10

echo -e "\n5. Verificando arquivo server.js:"
echo "----------------------------------------"
if [ -f /var/www/team-manager-ai/src/server.js ]; then
    echo "Verificando conteúdo (primeiras linhas):"
    head -5 /var/www/team-manager-ai/src/server.js
    echo "..."
    echo "Tem endpoint de auth? $(grep -c '/api/auth' /var/www/team-manager-ai/src/server.js) ocorrências"
else
    echo "❌ server.js não existe!"
fi

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "DIAGNÓSTICO RÁPIDO:"
if ! netstat -tlnp 2>/dev/null | grep -q 3001 && ! ss -tlnp 2>/dev/null | grep -q 3001; then
    echo "❌ MICROSERVIÇO NÃO ESTÁ RODANDO!"
    echo "   Execute: ./RESTORE_MICROSERVICE_COMPLETE.sh"
elif ! grep -q '/api/auth' /var/www/team-manager-ai/src/server.js 2>/dev/null; then
    echo "❌ MICROSERVIÇO EM MODO EMERGÊNCIA!"
    echo "   Execute: ./RESTORE_MICROSERVICE_COMPLETE.sh"
else
    echo "✅ Microserviço parece estar OK"
    echo "   Verifique o nginx proxy_pass"
fi
ENDSSH