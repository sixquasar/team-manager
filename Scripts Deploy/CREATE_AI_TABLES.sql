-- ================================================================
-- TABELAS PARA SISTEMA IA - RELATÓRIOS EXECUTIVOS
-- Team Manager - SixQuasar
-- Data: 24/06/2025
-- ================================================================

BEGIN;

-- Tabela para armazenar relatórios executivos gerados
CREATE TABLE IF NOT EXISTS executive_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    periodo VARCHAR(50) NOT NULL, -- week, month, quarter
    periodo_inicio TIMESTAMP WITH TIME ZONE,
    periodo_fim TIMESTAMP WITH TIME ZONE,
    equipe_id UUID REFERENCES equipes(id),
    responsavel_id UUID REFERENCES usuarios(id),
    dados JSONB NOT NULL, -- Relatório completo em JSON
    analise_ia JSONB, -- Análises específicas da IA
    status VARCHAR(50) DEFAULT 'gerado', -- gerado, exportado, arquivado
    formato_exportacao VARCHAR(50), -- pdf, excel, word
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Tabela para análises de IA salvas
CREATE TABLE IF NOT EXISTS ai_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- project, lead, task, team, finance, report
    entity_id UUID, -- ID da entidade analisada (projeto, lead, etc)
    analysis JSONB NOT NULL, -- Análise completa
    agent_type VARCHAR(50), -- Tipo do agente usado
    user_id UUID REFERENCES usuarios(id),
    equipe_id UUID REFERENCES equipes(id),
    confidence_score DECIMAL(5,2), -- Score de confiança da análise
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Tabela para workflows executados
CREATE TABLE IF NOT EXISTS ai_workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_type VARCHAR(50) NOT NULL, -- sprint, communication, financial
    initial_state JSONB,
    final_state JSONB,
    execution_time INTEGER, -- em milissegundos
    steps_completed INTEGER,
    total_steps INTEGER,
    user_id UUID REFERENCES usuarios(id),
    equipe_id UUID REFERENCES equipes(id),
    status VARCHAR(50) DEFAULT 'completed', -- running, completed, failed
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_executive_reports_equipe_id ON executive_reports(equipe_id);
CREATE INDEX IF NOT EXISTS idx_executive_reports_periodo ON executive_reports(periodo);
CREATE INDEX IF NOT EXISTS idx_executive_reports_created_at ON executive_reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_type ON ai_analyses(type);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_equipe_id ON ai_analyses(equipe_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_at ON ai_analyses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_workflows_type ON ai_workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_ai_workflows_status ON ai_workflows(status);
CREATE INDEX IF NOT EXISTS idx_ai_workflows_equipe_id ON ai_workflows(equipe_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger na tabela executive_reports
DROP TRIGGER IF EXISTS update_executive_reports_updated_at ON executive_reports;
CREATE TRIGGER update_executive_reports_updated_at 
    BEFORE UPDATE ON executive_reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Desabilitar RLS (temporário para evitar problemas)
ALTER TABLE executive_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workflows DISABLE ROW LEVEL SECURITY;

COMMIT;

-- ================================================================
-- RESULTADO ESPERADO:
-- 
-- 1. Tabela executive_reports para armazenar relatórios
-- 2. Tabela ai_analyses para análises de IA
-- 3. Tabela ai_workflows para workflows executados
-- 4. Índices para performance
-- 5. Trigger para updated_at
-- 6. RLS desabilitado
-- ================================================================