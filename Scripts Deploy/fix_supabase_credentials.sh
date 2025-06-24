#!/bin/bash

# Corrigir credenciais do Supabase
SERVER="root@96.43.96.30"

echo "🔧 CORREÇÃO DAS CREDENCIAIS DO SUPABASE"
echo "======================================"
echo ""

ssh $SERVER << 'ENDSSH'
set -e

cd /var/www/team-manager-ai

echo "1. Credenciais atuais (ERRADAS):"
echo "--------------------------------"
grep -E "SUPABASE_URL|SUPABASE_SERVICE_KEY" .env | head -2

echo -e "\n2. Fazendo backup do .env:"
echo "--------------------------"
cp .env .env.bak.wrong_url.$(date +%Y%m%d_%H%M%S)

echo -e "\n3. Atualizando para credenciais CORRETAS:"
echo "-----------------------------------------"
# Remover linhas antigas
sed -i '/SUPABASE_URL=/d' .env
sed -i '/SUPABASE_SERVICE_KEY=/d' .env
sed -i '/SUPABASE_SERVICE_ROLE_KEY=/d' .env

# Adicionar credenciais corretas
cat >> .env << 'EOF'

# Supabase - CREDENCIAIS CORRETAS
SUPABASE_URL=https://cfvuldebsoxmhuarikdk.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnVsZGVic294bWh1YXJpa2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI1NjQ2MCwiZXhwIjoyMDY0ODMyNDYwfQ.tmkAszImh0G0TZaMBq1tXsCz0oDGtCHWcdxR4zdzFJM
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnVsZGVic294bWh1YXJpa2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTY0NjAsImV4cCI6MjA2NDgzMjQ2MH0.4MQTy_NcARiBm_vwUa05S8zyW0okBbc-vb_7mIfT0J8
EOF

echo -e "\n4. Verificando novo .env:"
echo "------------------------"
echo "Novas credenciais:"
grep -E "SUPABASE_URL|SUPABASE_SERVICE_KEY" .env

echo -e "\n5. Testando conexão com novo URL:"
echo "---------------------------------"
cat > test-new-connection.js << 'EOF'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cfvuldebsoxmhuarikdk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnVsZGVic294bWh1YXJpa2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI1NjQ2MCwiZXhwIjoyMDY0ODMyNDYwfQ.tmkAszImh0G0TZaMBq1tXsCz0oDGtCHWcdxR4zdzFJM';

console.log('Testando conexão com URL CORRETO...');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
    const { data, error } = await supabase
        .from('usuarios')
        .select('email, nome')
        .limit(3);
    
    if (error) {
        console.error('❌ Erro:', error);
    } else {
        console.log('✅ Conexão OK! Usuários:', data);
    }
    process.exit(0);
}

test();
EOF

node test-new-connection.js

echo -e "\n6. Reiniciando microserviço com credenciais corretas:"
echo "-----------------------------------------------------"
systemctl restart team-manager-ai
sleep 3

echo -e "\n7. Testando login com credenciais corretas:"
echo "-------------------------------------------"
echo "Teste 1 - Health check:"
curl -s http://localhost:3001/health | python3 -m json.tool | grep -E "status|authType"

echo -e "\nTeste 2 - Login:"
curl -s -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"ricardo@sixquasar.pro","password":"senha123"}' | \
    python3 -m json.tool | head -20

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CREDENCIAIS CORRIGIDAS!"
echo ""
echo "URL antigo (ERRADO): kfghzgpwewfaeoazmkdv.supabase.co"
echo "URL novo (CORRETO): cfvuldebsoxmhuarikdk.supabase.co"
echo ""
echo "🎯 TESTE O LOGIN AGORA!"

ENDSSH