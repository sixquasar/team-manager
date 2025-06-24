#!/bin/bash

# Corrigir autenticação customizada
SERVER="root@96.43.96.30"

echo "🔧 CORREÇÃO DE AUTENTICAÇÃO CUSTOMIZADA"
echo "======================================"
echo ""

ssh $SERVER << 'ENDSSH'
set -e

echo "1. Verificando como o microserviço faz autenticação:"
echo "---------------------------------------------------"
cd /var/www/team-manager-ai
grep -A 10 -B 5 "signInWithPassword" src/server.js || echo "Não usa signInWithPassword"
echo ""
grep -A 10 -B 5 "/auth/login" src/server.js

echo -e "\n2. O sistema está usando auth.users ou tabela usuarios?"
echo "--------------------------------------------------------"
echo "Parece que temos uma tabela 'usuarios' customizada mas o código usa Supabase Auth padrão."
echo ""

echo "3. Opções para resolver:"
echo "------------------------"
echo ""
echo "OPÇÃO A - Migrar usuários para auth.users (RECOMENDADO):"
echo "Execute este SQL no Supabase SQL Editor:"
echo ""
cat << 'SQL'
-- IMPORTANTE: Execute no SQL Editor do Supabase

-- 1. Primeiro, veja os usuários existentes
SELECT id, email, nome, cargo FROM usuarios;

-- 2. Para cada usuário, crie no Dashboard:
-- Authentication > Users > Invite User
-- Use o email da tabela usuarios
-- Defina uma senha temporária

-- 3. Ou use a API Admin (requer service_role key):
-- Isso deve ser feito via Dashboard por segurança
SQL

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "OPÇÃO B - Implementar autenticação customizada:"
echo ""
echo "Precisaríamos modificar o microserviço para:"
echo "1. Verificar senha contra usuarios.senha_hash"
echo "2. Usar bcrypt para comparar"
echo "3. Gerar JWT próprio"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SOLUÇÃO RÁPIDA (Criar usuário no Supabase Auth):"
echo ""
echo "1. Acesse: https://supabase.com/dashboard/project/cfvuldebsoxmhuarikdk/auth/users"
echo "2. Clique em 'Invite User'"
echo "3. Email: ricardo@sixquasar.pro"
echo "4. Defina uma senha"
echo "5. Faça login com essa senha"
echo ""
echo "Os dados do perfil virão da tabela 'usuarios' após o login!"

ENDSSH