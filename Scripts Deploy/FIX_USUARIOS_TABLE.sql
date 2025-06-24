-- ================================================================
-- SCRIPT DE CORREÇÃO: TABELA USUARIOS
-- Team Manager - SixQuasar
-- Data: 23/06/2025
-- ================================================================

-- Este script corrige a estrutura da tabela usuarios
-- e adiciona colunas faltantes antes de inserir dados

BEGIN;

-- ================================================================
-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA USUARIOS
-- ================================================================

-- Mostrar estrutura atual (para debug)
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- ================================================================
-- 2. ADICIONAR COLUNAS FALTANTES NA TABELA USUARIOS
-- ================================================================

DO $$ 
BEGIN
    -- Adicionar equipe_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'equipe_id') THEN
        ALTER TABLE usuarios ADD COLUMN equipe_id UUID;
        RAISE NOTICE 'Coluna equipe_id adicionada à tabela usuarios';
    END IF;
    
    -- Adicionar nome se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'nome') THEN
        ALTER TABLE usuarios ADD COLUMN nome VARCHAR(255);
        RAISE NOTICE 'Coluna nome adicionada à tabela usuarios';
    END IF;
    
    -- Adicionar cargo se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'cargo') THEN
        ALTER TABLE usuarios ADD COLUMN cargo VARCHAR(100);
        RAISE NOTICE 'Coluna cargo adicionada à tabela usuarios';
    END IF;
    
    -- Adicionar tipo se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'tipo') THEN
        ALTER TABLE usuarios ADD COLUMN tipo VARCHAR(50) DEFAULT 'member';
        RAISE NOTICE 'Coluna tipo adicionada à tabela usuarios';
    END IF;
    
    -- Adicionar avatar_url se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'avatar_url') THEN
        ALTER TABLE usuarios ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Coluna avatar_url adicionada à tabela usuarios';
    END IF;
    
    -- Adicionar timestamps se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'created_at') THEN
        ALTER TABLE usuarios ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
        RAISE NOTICE 'Coluna created_at adicionada à tabela usuarios';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'updated_at') THEN
        ALTER TABLE usuarios ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
        RAISE NOTICE 'Coluna updated_at adicionada à tabela usuarios';
    END IF;
    
    -- Adicionar colunas de perfil (necessárias para a página Profile)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'bio') THEN
        ALTER TABLE usuarios ADD COLUMN bio TEXT;
        RAISE NOTICE 'Coluna bio adicionada à tabela usuarios';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'telefone') THEN
        ALTER TABLE usuarios ADD COLUMN telefone VARCHAR(50);
        RAISE NOTICE 'Coluna telefone adicionada à tabela usuarios';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'localizacao') THEN
        ALTER TABLE usuarios ADD COLUMN localizacao VARCHAR(255);
        RAISE NOTICE 'Coluna localizacao adicionada à tabela usuarios';
    END IF;
END $$;

-- ================================================================
-- 3. CRIAR TABELA EQUIPES SE NÃO EXISTIR
-- ================================================================

CREATE TABLE IF NOT EXISTS equipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ================================================================
-- 4. INSERIR EQUIPE PADRÃO
-- ================================================================

INSERT INTO equipes (id, nome, descricao)
VALUES ('650e8400-e29b-41d4-a716-446655440001', 'SixQuasar', 'Equipe de desenvolvimento')
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao;

-- ================================================================
-- 5. INSERIR/ATUALIZAR USUÁRIOS
-- ================================================================

-- Primeiro, verificar se os usuários já existem pelo email
DO $$
DECLARE
    ricardo_exists BOOLEAN;
    leonardo_exists BOOLEAN;
    rodrigo_exists BOOLEAN;
BEGIN
    -- Verificar existência
    SELECT EXISTS(SELECT 1 FROM usuarios WHERE email = 'ricardo@sixquasar.pro') INTO ricardo_exists;
    SELECT EXISTS(SELECT 1 FROM usuarios WHERE email = 'leonardo@sixquasar.pro') INTO leonardo_exists;
    SELECT EXISTS(SELECT 1 FROM usuarios WHERE email = 'rodrigo@sixquasar.pro') INTO rodrigo_exists;
    
    -- Inserir ou atualizar Ricardo
    IF NOT ricardo_exists THEN
        INSERT INTO usuarios (id, email, nome, cargo, tipo, equipe_id)
        VALUES ('550e8400-e29b-41d4-a716-446655440001', 'ricardo@sixquasar.pro', 'Ricardo Landim', 'Tech Lead', 'owner', '650e8400-e29b-41d4-a716-446655440001');
        RAISE NOTICE 'Usuário Ricardo Landim inserido';
    ELSE
        UPDATE usuarios 
        SET nome = 'Ricardo Landim', 
            cargo = 'Tech Lead', 
            tipo = 'owner', 
            equipe_id = '650e8400-e29b-41d4-a716-446655440001'
        WHERE email = 'ricardo@sixquasar.pro';
        RAISE NOTICE 'Usuário Ricardo Landim atualizado';
    END IF;
    
    -- Inserir ou atualizar Leonardo
    IF NOT leonardo_exists THEN
        INSERT INTO usuarios (id, email, nome, cargo, tipo, equipe_id)
        VALUES ('550e8400-e29b-41d4-a716-446655440002', 'leonardo@sixquasar.pro', 'Leonardo Candiani', 'Developer', 'admin', '650e8400-e29b-41d4-a716-446655440001');
        RAISE NOTICE 'Usuário Leonardo Candiani inserido';
    ELSE
        UPDATE usuarios 
        SET nome = 'Leonardo Candiani', 
            cargo = 'Developer', 
            tipo = 'admin', 
            equipe_id = '650e8400-e29b-41d4-a716-446655440001'
        WHERE email = 'leonardo@sixquasar.pro';
        RAISE NOTICE 'Usuário Leonardo Candiani atualizado';
    END IF;
    
    -- Inserir ou atualizar Rodrigo
    IF NOT rodrigo_exists THEN
        INSERT INTO usuarios (id, email, nome, cargo, tipo, equipe_id)
        VALUES ('550e8400-e29b-41d4-a716-446655440003', 'rodrigo@sixquasar.pro', 'Rodrigo Marochi', 'Developer', 'member', '650e8400-e29b-41d4-a716-446655440001');
        RAISE NOTICE 'Usuário Rodrigo Marochi inserido';
    ELSE
        UPDATE usuarios 
        SET nome = 'Rodrigo Marochi', 
            cargo = 'Developer', 
            tipo = 'member', 
            equipe_id = '650e8400-e29b-41d4-a716-446655440001'
        WHERE email = 'rodrigo@sixquasar.pro';
        RAISE NOTICE 'Usuário Rodrigo Marochi atualizado';
    END IF;
END $$;

-- ================================================================
-- 6. CRIAR FOREIGN KEY SE NÃO EXISTIR
-- ================================================================

DO $$
BEGIN
    -- Adicionar foreign key para equipe_id se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'usuarios_equipe_id_fkey'
    ) THEN
        ALTER TABLE usuarios 
        ADD CONSTRAINT usuarios_equipe_id_fkey 
        FOREIGN KEY (equipe_id) 
        REFERENCES equipes(id) 
        ON DELETE SET NULL;
        RAISE NOTICE 'Foreign key usuarios_equipe_id_fkey criada';
    END IF;
END $$;

-- ================================================================
-- 7. VERIFICAR RESULTADO FINAL
-- ================================================================

-- Mostrar estrutura final da tabela usuarios
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- Mostrar usuários inseridos/atualizados
SELECT id, email, nome, cargo, tipo, equipe_id 
FROM usuarios 
WHERE email IN ('ricardo@sixquasar.pro', 'leonardo@sixquasar.pro', 'rodrigo@sixquasar.pro');

COMMIT;

-- ================================================================
-- RESULTADO ESPERADO:
-- 
-- 1. Tabela usuarios com todas as colunas necessárias
-- 2. Tabela equipes criada (se não existia)
-- 3. Equipe SixQuasar inserida
-- 4. Três usuários principais configurados
-- 5. Foreign key equipe_id funcionando
-- ================================================================