-- ================================================================
-- SQL: CORREÇÃO DA ESTRUTURA EVENTOS_TIMELINE
-- Descrição: Verificar e corrigir colunas da tabela eventos_timeline
-- Data: 20/06/2025
-- Problema: ERROR: column "timestamp" does not exist
-- ================================================================

-- PRIMEIRA VERIFICAÇÃO: Ver estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'eventos_timeline'
ORDER BY ordinal_position;

-- ================================================================
-- CORREÇÃO 1: ADICIONAR/CORRIGIR COLUNAS NECESSÁRIAS
-- ================================================================

-- Se a tabela já existe mas sem as colunas corretas, adicionar:
ALTER TABLE eventos_timeline 
ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Ou usar created_at se for o padrão (mais provável):
ALTER TABLE eventos_timeline 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- ================================================================
-- CORREÇÃO 2: GARANTIR QUE TODAS AS COLUNAS EXISTEM
-- ================================================================

-- Verificar se todas as colunas necessárias existem
DO $$ 
BEGIN
    -- Adicionar colunas que podem estar faltando
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'type') THEN
        ALTER TABLE eventos_timeline ADD COLUMN type VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'title') THEN
        ALTER TABLE eventos_timeline ADD COLUMN title VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'description') THEN
        ALTER TABLE eventos_timeline ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'author') THEN
        ALTER TABLE eventos_timeline ADD COLUMN author VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'equipe_id') THEN
        ALTER TABLE eventos_timeline ADD COLUMN equipe_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'usuario_id') THEN
        ALTER TABLE eventos_timeline ADD COLUMN usuario_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'project') THEN
        ALTER TABLE eventos_timeline ADD COLUMN project VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'metadata') THEN
        ALTER TABLE eventos_timeline ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'timestamp') THEN
        ALTER TABLE eventos_timeline ADD COLUMN timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'created_at') THEN
        ALTER TABLE eventos_timeline ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_timeline' AND column_name = 'updated_at') THEN
        ALTER TABLE eventos_timeline ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- ================================================================
-- VERIFICAÇÃO FINAL: CONFIRMAR ESTRUTURA CORRIGIDA
-- ================================================================

-- Ver estrutura final da tabela
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
    type, title, description, author, equipe_id, usuario_id, project, metadata
) VALUES (
    'task',
    'Teste de Funcionalidade Timeline',
    'Teste para verificar se a criação de eventos está funcionando após correção de colunas',
    'Sistema',
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Teste',
    '{"priority": "medium", "taskStatus": "started"}'
) RETURNING id, type, title, created_at;