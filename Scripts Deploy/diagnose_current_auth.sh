#!/bin/bash

# Diagnosticar estado atual da autenticação
SERVER="root@96.43.96.30"

echo "🔍 DIAGNÓSTICO DO ESTADO ATUAL DA AUTENTICAÇÃO"
echo "=============================================="
echo ""

ssh $SERVER << 'ENDSSH'
set -e

echo "1. Verificando qual server.js está rodando:"
echo "-------------------------------------------"
cd /var/www/team-manager-ai
echo "Data de modificação do server.js:"
ls -la src/server.js

echo -e "\n2. Verificando se tem autenticação customizada:"
echo "-----------------------------------------------"
echo "Procurando por auth customizada no código:"
grep -n "senha123" src/server.js 2>/dev/null && echo "✅ Auth customizada encontrada" || echo "❌ Ainda usando Supabase Auth"

echo -e "\nPrimeiras linhas do endpoint de login:"
grep -A 5 "auth/login" src/server.js | head -10

echo -e "\n3. Verificando se bcryptjs está instalado:"
echo "------------------------------------------"
ls node_modules | grep -E "bcrypt|jsonwebtoken" || echo "❌ Módulos não instalados"

echo -e "\n4. Testando endpoints diretamente:"
echo "----------------------------------"
echo "Teste 1 - Login direto no microserviço (porta 3001):"
curl -s -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"ricardo@sixquasar.pro","password":"senha123"}' \
    -w "\nHTTP Status: %{http_code}\n" | tail -10

echo -e "\nTeste 2 - Login via nginx:"
curl -s -X POST https://admin.sixquasar.pro/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"ricardo@sixquasar.pro","password":"senha123"}' \
    -k -w "\nHTTP Status: %{http_code}\n" | tail -10

echo -e "\n5. Verificando logs do serviço:"
echo "-------------------------------"
journalctl -u team-manager-ai -n 20 --no-pager | grep -E "error|Error|senha|login|auth" | tail -10

echo -e "\n6. Verificando processo rodando:"
echo "--------------------------------"
ps aux | grep node | grep -v grep

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "DIAGNÓSTICO:"
echo ""
echo "Se ainda está usando Supabase Auth:"
echo "1. O script de auth customizada não foi executado, OU"
echo "2. O serviço não foi reiniciado após a mudança"
echo ""
echo "Execute: ./Scripts\\ Deploy/implement_custom_auth.sh"

ENDSSH