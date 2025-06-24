#!/bin/bash

# Atualizar configuração do Supabase com URLs corretos
SERVER="root@96.43.96.30"

echo "🔧 ATUALIZANDO CONFIGURAÇÃO DO SUPABASE"
echo "======================================"
echo ""

ssh $SERVER << 'ENDSSH'
set -e

# Novos valores corretos
NEW_SUPABASE_URL="https://cfvuldebsoxmhuarikdk.supabase.co"
NEW_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnVsZGVic294bWh1YXJpa2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTY0NjAsImV4cCI6MjA2NDgzMjQ2MH0.4MQTy_NcARiBm_vwUa05S8zyW0okBbc-vb_7mIfT0J8"
NEW_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnVsZGVic294bWh1YXJpa2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI1NjQ2MCwiZXhwIjoyMDY0ODMyNDYwfQ.tmkAszImh0G0TZaMBq1tXsCz0oDGtCHWcdxR4zdzFJM"

echo "═══════════════════════════════════════════════════"
echo "FASE 1: ATUALIZAR MICROSERVIÇO (.env)"
echo "═══════════════════════════════════════════════════"
cd /var/www/team-manager-ai

# Backup do .env atual
if [ -f .env ]; then
    cp .env .env.bak.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup criado"
fi

# Criar novo .env
cat > .env << EOF
# Supabase - Configuração Correta
SUPABASE_URL=$NEW_SUPABASE_URL
SUPABASE_SERVICE_KEY=$NEW_SERVICE_KEY
SUPABASE_SERVICE_ROLE_KEY=$NEW_SERVICE_KEY

# OpenAI (se você tiver)
OPENAI_API_KEY=

# Server
PORT=3001
EOF

echo "✅ Microserviço .env atualizado"

echo -e "\n═══════════════════════════════════════════════════"
echo "FASE 2: ATUALIZAR FRONTEND (.env)"
echo "═══════════════════════════════════════════════════"
cd /var/www/team-manager-sixquasar

# Backup do .env atual
if [ -f .env ]; then
    cp .env .env.bak.$(date +%Y%m%d_%H%M%S)
fi

# Criar novo .env
cat > .env << EOF
# Supabase - Configuração Correta
VITE_SUPABASE_URL=$NEW_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$NEW_ANON_KEY

# Outras configurações (se necessário)
VITE_APP_TITLE="Team Manager SixQuasar"
EOF

echo "✅ Frontend .env atualizado"

echo -e "\n═══════════════════════════════════════════════════"
echo "FASE 3: REBUILD DO FRONTEND"
echo "═══════════════════════════════════════════════════"
echo "Instalando dependências (se necessário)..."
[ ! -d "node_modules" ] && npm install --no-fund --no-audit

echo "Executando build..."
npm run build

if [ -d "dist" ]; then
    echo "✅ Build concluído com sucesso!"
    
    # Verificar se o novo URL está no build
    echo "Verificando novo URL no build:"
    grep -o "cfvuldebsoxmhuarikdk" dist/assets/index-*.js >/dev/null 2>&1 && echo "✅ Novo URL encontrado no build!" || echo "❌ URL não encontrado no build"
else
    echo "❌ Erro no build!"
fi

echo -e "\n═══════════════════════════════════════════════════"
echo "FASE 4: REINICIAR SERVIÇOS"
echo "═══════════════════════════════════════════════════"
echo "Reiniciando microserviço..."
systemctl restart team-manager-ai
sleep 3

echo "Recarregando nginx..."
nginx -s reload

echo -e "\n═══════════════════════════════════════════════════"
echo "FASE 5: VERIFICAÇÃO FINAL"
echo "═══════════════════════════════════════════════════"
echo "1. Testando resolução DNS do novo Supabase:"
nslookup cfvuldebsoxmhuarikdk.supabase.co >/dev/null 2>&1 && echo "✅ DNS resolvido!" || echo "❌ DNS não resolve"

echo -e "\n2. Testando conectividade com Supabase:"
curl -s -o /dev/null -w "HTTPS Status: %{http_code}\n" $NEW_SUPABASE_URL/rest/v1/

echo -e "\n3. Testando microserviço:"
curl -s http://localhost:3001/health | python3 -m json.tool || echo "❌ Microserviço não responde"

echo -e "\n4. Testando auth endpoint via nginx:"
curl -s -X POST https://admin.sixquasar.pro/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' \
  -k -w "\nHTTP Status: %{http_code}\n" | tail -2

echo -e "\n5. Verificando logs do microserviço:"
journalctl -u team-manager-ai -n 5 --no-pager | grep -E "error|Error|started|listening" || echo "Sem erros recentes"

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CONFIGURAÇÃO ATUALIZADA!"
echo ""
echo "🎯 TESTE O LOGIN AGORA:"
echo "   URL: https://admin.sixquasar.pro"
echo ""
echo "Se ainda não funcionar, verifique:"
echo "1. Console do navegador (F12)"
echo "2. journalctl -u team-manager-ai -f"
echo "3. Se as tabelas existem no Supabase"

ENDSSH

echo ""
echo "✅ Script concluído!"
echo "📌 O Supabase agora está configurado corretamente!"