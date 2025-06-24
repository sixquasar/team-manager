#!/bin/bash

# Debug da tabela usuarios e conexão
SERVER="root@96.43.96.30"

echo "🔍 DEBUG DA TABELA USUARIOS E CONEXÃO"
echo "===================================="
echo ""

ssh $SERVER << 'ENDSSH'
set -e

cd /var/www/team-manager-ai

echo "1. Verificando arquivo .env:"
echo "----------------------------"
cat .env | grep -E "SUPABASE_URL|SUPABASE_SERVICE" || echo "❌ Variáveis não encontradas"

echo -e "\n2. Testando conexão direta com Supabase:"
echo "----------------------------------------"
cat > test-connection.js << 'EOF'
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://cfvuldebsoxmhuarikdk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnVsZGVic294bWh1YXJpa2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI1NjQ2MCwiZXhwIjoyMDY0ODMyNDYwfQ.tmkAszImh0G0TZaMBq1tXsCz0oDGtCHWcdxR4zdzFJM';

console.log('Conectando ao Supabase...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Testar query na tabela usuarios
async function testConnection() {
    try {
        console.log('\nBuscando usuários...');
        const { data, error } = await supabase
            .from('usuarios')
            .select('id, email, nome, ativo')
            .limit(5);
        
        if (error) {
            console.error('❌ Erro ao buscar usuários:', error);
            return;
        }
        
        console.log('✅ Usuários encontrados:', data?.length || 0);
        if (data && data.length > 0) {
            console.log('\nUsuários no banco:');
            data.forEach(u => {
                console.log(`- ${u.email} (${u.nome}) - Ativo: ${u.ativo}`);
            });
            
            // Testar busca específica
            console.log('\nTestando busca por ricardo@sixquasar.pro...');
            const { data: ricardo, error: ricardoError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('email', 'ricardo@sixquasar.pro')
                .single();
                
            if (ricardoError) {
                console.error('❌ Erro ao buscar ricardo:', ricardoError);
            } else {
                console.log('✅ Ricardo encontrado:', ricardo?.email, '- ID:', ricardo?.id);
            }
        }
    } catch (err) {
        console.error('❌ Erro geral:', err);
    }
    
    process.exit(0);
}

testConnection();
EOF

echo -e "\n3. Executando teste de conexão:"
echo "-------------------------------"
node test-connection.js

echo -e "\n4. Verificando logs do microserviço:"
echo "------------------------------------"
journalctl -u team-manager-ai -n 30 --no-pager | grep -E "Login attempt|Usuário não encontrado|error" | tail -15

echo -e "\n5. Atualizando server.js com mais debug:"
echo "----------------------------------------"
# Adicionar mais logs ao server.js
sed -i 's/console.log('\''Login attempt:'\''.*);/console.log('\''Login attempt:'\'', req.body);/' src/server.js
sed -i '/const { data: user, error } = await supabase/a\        console.log('\''Query result:'\'', { user, error });' src/server.js

echo -e "\n6. Reiniciando com mais logs:"
echo "-----------------------------"
systemctl restart team-manager-ai
sleep 3

echo -e "\n7. Testando login novamente com logs:"
echo "-------------------------------------"
curl -s -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"ricardo@sixquasar.pro","password":"senha123"}' | \
    python3 -m json.tool

echo -e "\n8. Verificando logs após teste:"
echo "-------------------------------"
journalctl -u team-manager-ai -n 20 --no-pager | grep -E "Login attempt|Query result|error"

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "DIAGNÓSTICO:"
echo ""
echo "Se a tabela usuarios não está acessível:"
echo "1. Verifique se o Supabase URL está correto"
echo "2. Verifique se a service key tem permissão"
echo "3. Verifique se a tabela existe no projeto correto"

ENDSSH