-- ================================================================
-- CRIAÇÃO DE USUÁRIOS NO SUPABASE AUTH
-- Team Manager - SixQuasar
-- 
-- ATENÇÃO: Execute este SQL no Supabase SQL Editor
-- ================================================================

-- 1. Verificar usuários existentes na tabela customizada
SELECT 
    id,
    email,
    nome,
    cargo,
    tipo,
    equipe_id
FROM usuarios
ORDER BY created_at;

-- ================================================================
-- IMPORTANTE: Usuários devem ser criados via Dashboard!
-- ================================================================
-- 
-- Por segurança, o Supabase não permite criar usuários diretamente
-- via SQL no auth.users. Você deve:
--
-- 1. Acessar: Authentication > Users
-- 2. Clicar em "Invite User" para cada usuário
-- 3. Usar os emails da query acima
-- 4. Definir senhas temporárias
--
-- Emails para criar:
-- - ricardo@sixquasar.pro (owner)
-- - leonardo@sixquasar.pro (admin)
-- - rodrigo@sixquasar.pro (member)
-- - bruno@busque.ai (se existir)
--
-- ================================================================

-- 2. Após criar os usuários no Dashboard, execute isto para 
-- vincular os IDs (se necessário):
-- UPDATE usuarios 
-- SET auth_user_id = (
--     SELECT id FROM auth.users 
--     WHERE auth.users.email = usuarios.email
-- )
-- WHERE EXISTS (
--     SELECT 1 FROM auth.users 
--     WHERE auth.users.email = usuarios.email
-- );

-- 3. Verificar se todos foram vinculados:
SELECT 
    u.email,
    u.nome,
    CASE 
        WHEN au.id IS NOT NULL THEN '✅ Criado no Auth'
        ELSE '❌ Falta criar'
    END as status_auth
FROM usuarios u
LEFT JOIN auth.users au ON au.email = u.email
ORDER BY u.email;

-- ================================================================
-- CONFIGURAÇÃO DE RLS (Row Level Security)
-- ================================================================

-- Garantir que RLS está desabilitado para facilitar:
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE projetos DISABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- TESTE DE LOGIN
-- ================================================================
-- Após criar os usuários, teste o login com:
-- Email: ricardo@sixquasar.pro
-- Senha: [a senha que você definiu]
--
-- O sistema irá:
-- 1. Autenticar via auth.users
-- 2. Buscar dados complementares em usuarios
-- 3. Carregar o dashboard
-- ================================================================