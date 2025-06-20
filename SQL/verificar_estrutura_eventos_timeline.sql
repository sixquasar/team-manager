-- ================================================================
-- SQL: VERIFICAÇÃO E CORREÇÃO ESTRUTURA EVENTOS_TIMELINE
-- Descrição: Verificar estrutura real e corrigir colunas de usuário
-- Data: 20/06/2025  
-- Problema: ERROR 42703 column "usuario_id" does not exist
-- ================================================================

-- VERIFICAÇÃO 1: Ver TODA a estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'eventos_timeline'
ORDER BY ordinal_position;

-- VERIFICAÇÃO 2: Ver se existe alguma variação de coluna de usuário
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'eventos_timeline' 
AND (
    column_name ILIKE '%usuario%' 
    OR column_name ILIKE '%user%' 
    OR column_name ILIKE '%autor%'
);

-- ================================================================
-- CORREÇÃO: ADICIONAR COLUNA AUTOR_ID SE NÃO EXISTIR
-- ================================================================

DO $$ 
BEGIN
    -- Verificar se autor_id existe, se não, criar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'autor_id') THEN
        ALTER TABLE eventos_timeline ADD COLUMN autor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE;
        
        -- Se existe uma coluna usuario_id, copiar dados
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'usuario_id') THEN
            UPDATE eventos_timeline SET autor_id = usuario_id WHERE usuario_id IS NOT NULL;
        END IF;
    END IF;
    
    -- Verificar se equipe_id existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'equipe_id') THEN
        ALTER TABLE eventos_timeline ADD COLUMN equipe_id UUID REFERENCES equipes(id) ON DELETE CASCADE;
    END IF;
    
    -- Garantir que outras colunas essenciais existem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'tipo') THEN
        ALTER TABLE eventos_timeline ADD COLUMN tipo VARCHAR(50) DEFAULT 'task';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'titulo') THEN
        ALTER TABLE eventos_timeline ADD COLUMN titulo VARCHAR(255) DEFAULT 'Evento';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'descricao') THEN
        ALTER TABLE eventos_timeline ADD COLUMN descricao TEXT DEFAULT 'Descrição';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'autor') THEN
        ALTER TABLE eventos_timeline ADD COLUMN autor VARCHAR(255) DEFAULT 'Sistema';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'projeto') THEN
        ALTER TABLE eventos_timeline ADD COLUMN projeto VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'metadata') THEN
        ALTER TABLE eventos_timeline ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'created_at') THEN
        ALTER TABLE eventos_timeline ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'updated_at') THEN
        ALTER TABLE eventos_timeline ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
END $$;

-- ================================================================
-- APLICAR CONSTRAINTS E VALIDAÇÕES
-- ================================================================

-- Tornar campos obrigatórios NOT NULL (com valores padrão antes)
UPDATE eventos_timeline SET tipo = 'task' WHERE tipo IS NULL;
UPDATE eventos_timeline SET titulo = 'Evento' WHERE titulo IS NULL;
UPDATE eventos_timeline SET descricao = 'Descrição' WHERE descricao IS NULL;
UPDATE eventos_timeline SET autor = 'Sistema' WHERE autor IS NULL;

-- Aplicar NOT NULL após preencher valores
ALTER TABLE eventos_timeline ALTER COLUMN tipo SET NOT NULL;
ALTER TABLE eventos_timeline ALTER COLUMN titulo SET NOT NULL;
ALTER TABLE eventos_timeline ALTER COLUMN descricao SET NOT NULL;
ALTER TABLE eventos_timeline ALTER COLUMN autor SET NOT NULL;

-- Adicionar constraints de validação
DO $$
BEGIN
    -- Constraint para tipo válido
    BEGIN
        ALTER TABLE eventos_timeline ADD CONSTRAINT check_eventos_tipo_valido 
        CHECK (tipo IN ('task', 'message', 'milestone', 'meeting', 'deadline'));
    EXCEPTION WHEN duplicate_object THEN
        NULL; -- Constraint já existe
    END;
    
    -- Constraint para título mínimo
    BEGIN
        ALTER TABLE eventos_timeline ADD CONSTRAINT check_eventos_titulo_minimo 
        CHECK (LENGTH(titulo) >= 3);
    EXCEPTION WHEN duplicate_object THEN
        NULL; -- Constraint já existe
    END;
    
    -- Constraint para descrição mínima
    BEGIN
        ALTER TABLE eventos_timeline ADD CONSTRAINT check_eventos_descricao_minima 
        CHECK (LENGTH(descricao) >= 5);
    EXCEPTION WHEN duplicate_object THEN
        NULL; -- Constraint já existe
    END;
END $$;

-- ================================================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- ================================================================

-- Índice principal por equipe e data
CREATE INDEX IF NOT EXISTS idx_eventos_timeline_equipe_data 
ON eventos_timeline(equipe_id, created_at DESC);

-- Índice por autor
CREATE INDEX IF NOT EXISTS idx_eventos_timeline_autor_id 
ON eventos_timeline(autor_id);

-- Índice por tipo
CREATE INDEX IF NOT EXISTS idx_eventos_timeline_tipo_idx 
ON eventos_timeline(tipo);

-- ================================================================
-- VERIFICAÇÃO FINAL E TESTE
-- ================================================================

-- Ver estrutura final corrigida
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'eventos_timeline'
ORDER BY ordinal_position;

-- Teste de inserção para verificar se funciona
INSERT INTO eventos_timeline (
    tipo, titulo, descricao, autor, autor_id, equipe_id, projeto, metadata
) VALUES (
    'milestone',
    'Teste Estrutura Corrigida',
    'Teste após correção da estrutura da tabela eventos_timeline',
    'Sistema Teste',
    '550e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440001',
    'Teste Correção',
    '{"priority": "high", "taskStatus": "completed"}'
) RETURNING id, tipo, titulo, autor, created_at;

-- Verificar registros
SELECT 
    COUNT(*) as total_eventos,
    COUNT(DISTINCT autor_id) as autores_distintos,
    COUNT(DISTINCT equipe_id) as equipes_distintas,
    MAX(created_at) as ultimo_evento
FROM eventos_timeline;