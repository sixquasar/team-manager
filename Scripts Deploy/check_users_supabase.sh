#!/bin/bash

# Verificar usuários no Supabase
SERVER="root@96.43.96.30"

echo "🔍 VERIFICANDO USUÁRIOS NO SUPABASE"
echo "==================================="
echo ""

ssh $SERVER << 'ENDSSH'
echo "Por favor, execute estas queries no Supabase SQL Editor:"
echo ""
echo "-- 1. Verificar se existem usuários no auth.users"
echo "SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;"
echo ""
echo "-- 2. Verificar tabela usuarios customizada (se existir)"
echo "SELECT * FROM usuarios LIMIT 10;"
echo ""
echo "-- 3. Verificar se as tabelas do sistema existem"
echo "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
echo ""
echo "-- 4. Se não há usuários, criar um usuário de teste"
echo "-- Execute no Supabase Dashboard > Authentication > Users > Invite User"
echo "-- Ou use este SQL (substitua a senha):"
echo ""
cat << 'SQL'
-- Criar usuário admin direto no auth.users (NÃO RECOMENDADO em produção)
-- Use o Dashboard do Supabase para criar usuários!

-- Se precisar resetar senha de um usuário existente:
-- 1. Vá em Authentication > Users
-- 2. Clique nos 3 pontos do usuário
-- 3. Send Password Recovery
SQL

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "AÇÕES NECESSÁRIAS:"
echo ""
echo "1. Acesse https://supabase.com/dashboard/project/cfvuldebsoxmhuarikdk/auth/users"
echo "2. Verifique se existem usuários"
echo "3. Se não existem, clique em 'Invite User' e crie um"
echo "4. Use o email e senha criados para fazer login"
echo ""
echo "OU"
echo ""
echo "1. Vá em SQL Editor"
echo "2. Execute as queries acima para verificar"
echo "3. Crie usuários pelo Dashboard (mais seguro)"

ENDSSH