#!/bin/bash

# Diagnóstico completo do problema de autenticação
SERVER="root@96.43.96.30"

echo "🔍 DIAGNÓSTICO COMPLETO - PROBLEMA DE AUTENTICAÇÃO"
echo "================================================="
echo "Data: $(date)"
echo ""

ssh $SERVER << 'ENDSSH'
set -e

echo "═══════════════════════════════════════════════════"
echo "1. VERIFICAÇÃO DE SERVIÇOS"
echo "═══════════════════════════════════════════════════"
echo "- Nginx: $(systemctl is-active nginx)"
echo "- Team Manager AI: $(systemctl is-active team-manager-ai)"
echo "- PostgreSQL: $(systemctl is-active postgresql)"

echo -e "\n═══════════════════════════════════════════════════"
echo "2. TESTE DE CONECTIVIDADE SUPABASE"
echo "═══════════════════════════════════════════════════"
# Testar endpoint de health do Supabase
echo "Testando Supabase REST API:"
curl -s -o /dev/null -w "- REST API Status: %{http_code}\n" \
  https://kfghzgpwewfaeoazmkdv.supabase.co/rest/v1/ \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmZ2h6Z3B3ZXdmYWVvYXpta2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5ODgzODYsImV4cCI6MjA0ODU2NDM4Nn0.rIEd2LsC9xKMmVCdB9DNb0D5A8xbKB7YrL-T2hFiSYg"

echo -e "\n═══════════════════════════════════════════════════"
echo "3. LOGS RECENTES DO NGINX (últimos 10 erros)"
echo "═══════════════════════════════════════════════════"
tail -n 100 /var/log/nginx/access.log | grep -E " (4[0-9]{2}|5[0-9]{2}) " | tail -10 || echo "Nenhum erro recente"

echo -e "\n═══════════════════════════════════════════════════"
echo "4. TESTE ESPECÍFICO DE AUTH"
echo "═══════════════════════════════════════════════════"
echo "Tentando autenticação de teste:"
RESPONSE=$(curl -s -X POST \
  https://kfghzgpwewfaeoazmkdv.supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmZ2h6Z3B3ZXdmYWVvYXpta2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5ODgzODYsImV4cCI6MjA0ODU2NDM4Nn0.rIEd2LsC9xKMmVCdB9DNb0D5A8xbKB7YrL-T2hFiSYg" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' \
  -w "\nHTTP Status: %{http_code}")

echo "$RESPONSE" | tail -3

echo -e "\n═══════════════════════════════════════════════════"
echo "5. VERIFICAR CONFIGURAÇÃO DO FRONTEND"
echo "═══════════════════════════════════════════════════"
echo "Verificando arquivo de configuração do frontend:"
if [ -f "/var/www/team-manager-sixquasar/.env" ]; then
    echo "- .env existe"
    grep -E "VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY" /var/www/team-manager-sixquasar/.env | sed 's/=.*/=***/'
else
    echo "- .env NÃO existe!"
fi

echo -e "\n═══════════════════════════════════════════════════"
echo "6. VERIFICAR SE O FRONTEND ESTÁ SERVINDO CORRETAMENTE"
echo "═══════════════════════════════════════════════════"
curl -s -o /dev/null -w "- Frontend Status: %{http_code}\n" https://admin.sixquasar.pro
curl -s -o /dev/null -w "- Login Page Status: %{http_code}\n" https://admin.sixquasar.pro/login

echo -e "\n═══════════════════════════════════════════════════"
echo "7. VERIFICAR ESTRUTURA DAS TABELAS AUTH"
echo "═══════════════════════════════════════════════════"
echo "Por favor, execute no Supabase SQL Editor:"
echo ""
echo "-- Verificar se tabelas auth existem"
echo "SELECT tablename FROM pg_tables WHERE schemaname = 'auth' ORDER BY tablename;"
echo ""
echo "-- Verificar se há usuários"
echo "SELECT COUNT(*) as total_users FROM auth.users;"
echo ""
echo "-- Verificar configuração de auth"
echo "SELECT * FROM auth.schema_migrations ORDER BY version DESC LIMIT 5;"

echo -e "\n═══════════════════════════════════════════════════"
echo "8. LOGS DO MICROSERVIÇO IA (se relacionado)"
echo "═══════════════════════════════════════════════════"
if systemctl is-active --quiet team-manager-ai; then
    echo "Últimos logs do microserviço:"
    journalctl -u team-manager-ai -n 10 --no-pager
else
    echo "Microserviço não está rodando"
fi

echo -e "\n═══════════════════════════════════════════════════"
echo "9. VERIFICAR SE HÁ CONFLITO DE PORTAS"
echo "═══════════════════════════════════════════════════"
echo "Portas em uso:"
netstat -tlnp | grep -E ":80|:443|:3000|:3001" || ss -tlnp | grep -E ":80|:443|:3000|:3001"

echo -e "\n═══════════════════════════════════════════════════"
echo "10. RESUMO DE DIAGNÓSTICO"
echo "═══════════════════════════════════════════════════"
echo "✓ Checklist de verificação:"
echo "  - [ ] Nginx está rodando e servindo o frontend"
echo "  - [ ] Supabase está acessível"
echo "  - [ ] Configurações de ambiente estão corretas"
echo "  - [ ] Não há erros 500 no nginx"
echo "  - [ ] Auth endpoint está respondendo"
echo ""
echo "⚠️  IMPORTANTE: O CREATE_AI_TABLES.sql NÃO modifica tabelas de auth"
echo "    O problema pode estar relacionado a:"
echo "    1. Permissões alteradas durante o fix nuclear"
echo "    2. Configuração de ambiente perdida"
echo "    3. Cache do navegador"
echo "    4. Token expirado"

ENDSSH

echo ""
echo "✅ Diagnóstico concluído!"
echo ""
echo "PRÓXIMOS PASSOS:"
echo "1. Verifique os resultados acima"
echo "2. Execute as queries SQL no Supabase"
echo "3. Teste login em aba anônima/privada"
echo "4. Se persistir, compartilhe os logs do Console (F12)"