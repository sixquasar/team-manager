-- =====================================================
-- FIX TAREFAS PROJETO RELATION
-- Adiciona coluna projeto_id na tabela tarefas
-- Data: 25/06/2025
-- =====================================================

-- 1. Adicionar coluna projeto_id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tarefas' 
        AND column_name = 'projeto_id'
    ) THEN
        ALTER TABLE tarefas 
        ADD COLUMN projeto_id UUID;
        
        RAISE NOTICE 'Coluna projeto_id adicionada à tabela tarefas';
    ELSE
        RAISE NOTICE 'Coluna projeto_id já existe na tabela tarefas';
    END IF;
END $$;

-- 2. Adicionar foreign key para projetos se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'tarefas_projeto_id_fkey'
        AND table_name = 'tarefas'
    ) THEN
        ALTER TABLE tarefas
        ADD CONSTRAINT tarefas_projeto_id_fkey
        FOREIGN KEY (projeto_id) 
        REFERENCES projetos(id) 
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Foreign key para projeto_id criada';
    ELSE
        RAISE NOTICE 'Foreign key tarefas_projeto_id_fkey já existe';
    END IF;
END $$;

-- 3. Criar índice para performance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE indexname = 'idx_tarefas_projeto_id'
    ) THEN
        CREATE INDEX idx_tarefas_projeto_id ON tarefas(projeto_id);
        RAISE NOTICE 'Índice idx_tarefas_projeto_id criado';
    ELSE
        RAISE NOTICE 'Índice idx_tarefas_projeto_id já existe';
    END IF;
END $$;

-- 4. Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'tarefas'
ORDER BY ordinal_position;

-- 5. Verificar relacionamentos
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'tarefas'
    AND tc.constraint_type = 'FOREIGN KEY';

-- 6. Mensagem final
DO $$
BEGIN
    RAISE NOTICE '✅ Correção de relacionamento tarefas-projetos concluída!';
END $$;