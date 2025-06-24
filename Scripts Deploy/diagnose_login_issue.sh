#!/bin/bash

# Diagnóstico rápido do problema de login
SERVER="root@96.43.96.30"

echo "🔍 DIAGNÓSTICO RÁPIDO - LOGIN ISSUE"
echo "===================================="
echo ""

ssh $SERVER << 'ENDSSH'
echo "1. Modo atual do microserviço:"
curl -s http://localhost:3001/health 2>/dev/null | grep -E "mode|status" || echo "❌ Microserviço não acessível"

echo -e "\n2. Verificando endpoints de auth:"
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}' \
  -w "\n- Login endpoint: %{http_code}\n" \
  -o /dev/null 2>/dev/null || echo "❌ Endpoint de login não existe"

echo -e "\n3. Conteúdo atual do server.js:"
if [ -f /var/www/team-manager-ai/src/server.js ]; then
    echo "Primeiras 20 linhas:"
    head -20 /var/www/team-manager-ai/src/server.js
    echo "..."
    echo "Verificando se tem auth endpoints:"
    grep -c "auth/login" /var/www/team-manager-ai/src/server.js && echo "✅ Auth endpoints encontrados" || echo "❌ SEM auth endpoints!"
else
    echo "❌ server.js não existe!"
fi

echo -e "\n4. Package.json atual:"
if [ -f /var/www/team-manager-ai/package.json ]; then
    echo "Dependências:"
    cat /var/www/team-manager-ai/package.json | grep -A 20 "dependencies"
else
    echo "❌ package.json não existe!"
fi

echo -e "\n5. Status do serviço:"
systemctl is-active team-manager-ai && echo "✅ Serviço ativo" || echo "❌ Serviço inativo"

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "DIAGNÓSTICO:"
if curl -s http://localhost:3001/health 2>/dev/null | grep -q "emergency"; then
    echo "🚨 SERVIDOR EM MODO EMERGÊNCIA!"
    echo "   O nuclear_fix_permissions.sh destruiu o microserviço"
    echo "   Execute: ./RESTORE_MICROSERVICE_COMPLETE.sh"
else
    echo "✅ Servidor em modo produção"
fi
ENDSSH