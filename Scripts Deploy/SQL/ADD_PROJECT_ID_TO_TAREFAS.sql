-- ADD_PROJECT_ID_TO_TAREFAS.sql
-- Adiciona coluna projeto_id na tabela tarefas se não existir
-- Autor: Ricardo Landim da BUSQUE AI
-- Data: 24/06/2025

-- Verificar e adicionar coluna projeto_id
DO $$
BEGIN
    -- Verificar se a coluna já existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tarefas' 
        AND column_name = 'projeto_id'
    ) THEN
        -- Adicionar coluna com referência para projetos
        ALTER TABLE public.tarefas 
        ADD COLUMN projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE;
        
        -- Criar índice para melhorar performance de queries
        CREATE INDEX idx_tarefas_projeto_id ON public.tarefas(projeto_id);
        
        -- Criar índice composto para queries comuns
        CREATE INDEX idx_tarefas_projeto_status ON public.tarefas(projeto_id, status);
        
        RAISE NOTICE 'Coluna projeto_id adicionada com sucesso na tabela tarefas';
    ELSE
        RAISE NOTICE 'Coluna projeto_id já existe na tabela tarefas';
    END IF;
END $$;

-- Adicionar comentário à coluna
COMMENT ON COLUMN public.tarefas.projeto_id IS 'Referência ao projeto ao qual esta tarefa pertence';

-- Verificar estrutura final da tabela
SELECT 
    column_name AS "Coluna",
    data_type AS "Tipo",
    is_nullable AS "Permite NULL",
    column_default AS "Valor Padrão"
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'tarefas'
ORDER BY ordinal_position;

-- Verificar índices criados
SELECT 
    indexname AS "Índice",
    indexdef AS "Definição"
FROM pg_indexes
WHERE schemaname = 'public' 
AND tablename = 'tarefas'
AND indexname LIKE '%projeto%';

-- Estatísticas de tarefas por projeto (para validação)
SELECT 
    'Total de tarefas' AS metrica,
    COUNT(*) AS valor
FROM public.tarefas
UNION ALL
SELECT 
    'Tarefas com projeto_id' AS metrica,
    COUNT(projeto_id) AS valor
FROM public.tarefas
UNION ALL
SELECT 
    'Tarefas sem projeto_id' AS metrica,
    COUNT(*) AS valor
FROM public.tarefas
WHERE projeto_id IS NULL;