-- ================================================================
-- SQL: CORREÇÃO ESPECÍFICA TABELA EVENTOS_TIMELINE - COLUNAS PORTUGUÊS
-- Descrição: Ajustar tabela para ter colunas em português conforme hook corrigido
-- Data: 20/06/2025
-- Problema: ERROR 23502 null value in column "tipo" violates not-null constraint
-- ================================================================

-- VERIFICAR ESTRUTURA ATUAL
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'eventos_timeline'
ORDER BY ordinal_position;

-- ================================================================
-- CORREÇÃO: GARANTIR QUE TODAS AS COLUNAS EM PORTUGUÊS EXISTEM
-- ================================================================

DO $$ 
BEGIN
    -- Verificar e adicionar colunas em português se não existirem
    
    -- Coluna tipo (obrigatória)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'tipo') THEN
        ALTER TABLE eventos_timeline ADD COLUMN tipo VARCHAR(50) NOT NULL DEFAULT 'task' CHECK (tipo IN ('task', 'message', 'milestone', 'meeting', 'deadline'));
    END IF;
    
    -- Coluna titulo (obrigatória)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'titulo') THEN
        ALTER TABLE eventos_timeline ADD COLUMN titulo VARCHAR(255) NOT NULL DEFAULT 'Evento';
    END IF;
    
    -- Coluna descricao (obrigatória)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'descricao') THEN
        ALTER TABLE eventos_timeline ADD COLUMN descricao TEXT NOT NULL DEFAULT 'Descrição do evento';
    END IF;
    
    -- Coluna autor (obrigatória)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'autor') THEN
        ALTER TABLE eventos_timeline ADD COLUMN autor VARCHAR(255) NOT NULL DEFAULT 'Sistema';
    END IF;
    
    -- Coluna projeto (opcional)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'projeto') THEN
        ALTER TABLE eventos_timeline ADD COLUMN projeto VARCHAR(255);
    END IF;
    
    -- Verificar se as colunas obrigatórias já existem mas são nullable - tornar NOT NULL se necessário
    
    -- Verificar e corrigir constraints
    BEGIN
        -- Tentar tornar tipo NOT NULL se ainda não for
        ALTER TABLE eventos_timeline ALTER COLUMN tipo SET NOT NULL;
    EXCEPTION WHEN others THEN
        -- Se der erro (por ter valores null), atualizar primeiro
        UPDATE eventos_timeline SET tipo = 'task' WHERE tipo IS NULL;
        ALTER TABLE eventos_timeline ALTER COLUMN tipo SET NOT NULL;
    END;
    
    BEGIN
        -- Tentar tornar titulo NOT NULL se ainda não for
        ALTER TABLE eventos_timeline ALTER COLUMN titulo SET NOT NULL;
    EXCEPTION WHEN others THEN
        -- Se der erro (por ter valores null), atualizar primeiro
        UPDATE eventos_timeline SET titulo = 'Evento' WHERE titulo IS NULL;
        ALTER TABLE eventos_timeline ALTER COLUMN titulo SET NOT NULL;
    END;
    
    BEGIN
        -- Tentar tornar descricao NOT NULL se ainda não for
        ALTER TABLE eventos_timeline ALTER COLUMN descricao SET NOT NULL;
    EXCEPTION WHEN others THEN
        -- Se der erro (por ter valores null), atualizar primeiro
        UPDATE eventos_timeline SET descricao = 'Descrição do evento' WHERE descricao IS NULL;
        ALTER TABLE eventos_timeline ALTER COLUMN descricao SET NOT NULL;
    END;
    
    BEGIN
        -- Tentar tornar autor NOT NULL se ainda não for
        ALTER TABLE eventos_timeline ALTER COLUMN autor SET NOT NULL;
    EXCEPTION WHEN others THEN
        -- Se der erro (por ter valores null), atualizar primeiro
        UPDATE eventos_timeline SET autor = 'Sistema' WHERE autor IS NULL;
        ALTER TABLE eventos_timeline ALTER COLUMN autor SET NOT NULL;
    END;
END $$;

-- ================================================================
-- ADICIONAR CONSTRAINTS E VALIDAÇÕES
-- ================================================================

-- Constraint para tipo válido
DO $$
BEGIN
    ALTER TABLE eventos_timeline ADD CONSTRAINT check_tipo_valido 
    CHECK (tipo IN ('task', 'message', 'milestone', 'meeting', 'deadline'));
EXCEPTION WHEN duplicate_object THEN
    -- Constraint já existe, ignorar
    NULL;
END $$;

-- Constraint para título mínimo
DO $$
BEGIN
    ALTER TABLE eventos_timeline ADD CONSTRAINT check_titulo_minimo 
    CHECK (LENGTH(titulo) >= 3);
EXCEPTION WHEN duplicate_object THEN
    -- Constraint já existe, ignorar
    NULL;
END $$;

-- Constraint para descrição mínima
DO $$
BEGIN
    ALTER TABLE eventos_timeline ADD CONSTRAINT check_descricao_minima 
    CHECK (LENGTH(descricao) >= 5);
EXCEPTION WHEN duplicate_object THEN
    -- Constraint já existe, ignorar
    NULL;
END $$;

-- ================================================================
-- ÍNDICES PARA PERFORMANCE
-- ================================================================

-- Índice principal por equipe e created_at
CREATE INDEX IF NOT EXISTS idx_eventos_timeline_equipe_created_at 
ON eventos_timeline(equipe_id, created_at DESC);

-- Índice por tipo
CREATE INDEX IF NOT EXISTS idx_eventos_timeline_tipo 
ON eventos_timeline(tipo);

-- Índice por usuário
CREATE INDEX IF NOT EXISTS idx_eventos_timeline_usuario 
ON eventos_timeline(usuario_id);

-- Índice por projeto (onde não é null)
CREATE INDEX IF NOT EXISTS idx_eventos_timeline_projeto 
ON eventos_timeline(projeto) WHERE projeto IS NOT NULL;

-- ================================================================
-- VERIFICAÇÃO FINAL
-- ================================================================

-- Ver estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'eventos_timeline'
ORDER BY ordinal_position;

-- Teste de inserção com dados válidos
INSERT INTO eventos_timeline (
    tipo, titulo, descricao, autor, equipe_id, usuario_id, projeto, metadata
) VALUES (
    'milestone',
    'Teste Correção Timeline',
    'Teste após correção das colunas em português para verificar funcionamento',
    'Sistema de Correção',
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Correção Timeline',
    '{"priority": "high", "taskStatus": "completed"}'
) RETURNING id, tipo, titulo, created_at;

-- Verificar se o registro foi inserido corretamente
SELECT 
    COUNT(*) as total_eventos,
    COUNT(CASE WHEN tipo = 'milestone' THEN 1 END) as milestones,
    COUNT(CASE WHEN tipo = 'task' THEN 1 END) as tasks,
    MAX(created_at) as ultimo_evento
FROM eventos_timeline;