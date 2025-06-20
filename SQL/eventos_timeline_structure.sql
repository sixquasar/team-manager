-- ================================================================
-- SQL: ESTRUTURA COMPLETA TABELA EVENTOS_TIMELINE
-- Descrição: Criação da tabela para sistema de timeline/eventos
-- Data: 20/06/2025
-- Projeto: Team Manager SixQuasar
-- ================================================================

-- Criar tabela eventos_timeline
CREATE TABLE IF NOT EXISTS eventos_timeline (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Informações básicas do evento
    type VARCHAR(50) NOT NULL CHECK (type IN ('task', 'message', 'milestone', 'meeting', 'deadline')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    
    -- Relacionamentos
    equipe_id UUID NOT NULL REFERENCES equipes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Informações opcionais
    project VARCHAR(255),
    
    -- Timestamps
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadados em JSON
    metadata JSONB DEFAULT '{}',
    
    -- Índices para performance
    CONSTRAINT valid_title_length CHECK (LENGTH(title) >= 3),
    CONSTRAINT valid_description_length CHECK (LENGTH(description) >= 5)
);

-- ================================================================
-- ÍNDICES PARA PERFORMANCE
-- ================================================================

-- Índice principal por equipe e timestamp (query mais comum)
CREATE INDEX IF NOT EXISTS idx_eventos_timeline_equipe_timestamp 
ON eventos_timeline(equipe_id, timestamp DESC);

-- Índice por tipo de evento
CREATE INDEX IF NOT EXISTS idx_eventos_timeline_type 
ON eventos_timeline(type);

-- Índice por usuário
CREATE INDEX IF NOT EXISTS idx_eventos_timeline_usuario 
ON eventos_timeline(usuario_id);

-- Índice por projeto (para filtros)
CREATE INDEX IF NOT EXISTS idx_eventos_timeline_project 
ON eventos_timeline(project) WHERE project IS NOT NULL;

-- Índice GIN para metadados JSON
CREATE INDEX IF NOT EXISTS idx_eventos_timeline_metadata 
ON eventos_timeline USING GIN(metadata);

-- ================================================================
-- FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- ================================================================

CREATE OR REPLACE FUNCTION update_eventos_timeline_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_eventos_timeline_updated_at ON eventos_timeline;
CREATE TRIGGER trigger_update_eventos_timeline_updated_at
    BEFORE UPDATE ON eventos_timeline
    FOR EACH ROW
    EXECUTE FUNCTION update_eventos_timeline_updated_at();

-- ================================================================
-- POLÍTICAS RLS (DESABILITADAS PARA DESENVOLVIMENTO)
-- ================================================================

-- Desabilitar RLS por enquanto (seguindo padrão do projeto)
ALTER TABLE eventos_timeline DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- DADOS DE TESTE PARA VALIDAÇÃO
-- ================================================================

-- Inserir eventos de teste baseados nos projetos reais da SixQuasar
INSERT INTO eventos_timeline (
    type, title, description, author, equipe_id, usuario_id, project, metadata
) VALUES 
-- Eventos do Projeto Palmas IA
(
    'milestone',
    'Arquitetura Palmas IA Finalizada',
    'Arquitetura completa definida para atender 350k habitantes com 99.9% disponibilidade. Sistema preparado para Kubernetes + AWS + Redis.',
    'Ricardo Landim',
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Palmas IA',
    '{"priority": "high", "taskStatus": "completed", "participants": ["Ricardo Landim", "Leonardo Candiani"]}'
),
(
    'task',
    'Integração WhatsApp API em Progresso',
    'Implementação da integração com WhatsApp para meta de 1M mensagens/mês. Pipeline de mensagens sendo configurado.',
    'Rodrigo Marochi',
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440003',
    'Palmas IA',
    '{"priority": "high", "taskStatus": "started", "participants": ["Rodrigo Marochi", "Ricardo Landim"]}'
),
(
    'task',
    'LangChain + GPT-4o Setup Iniciado',
    'Configuração do pipeline de IA para processar consultas dos cidadãos. Integração com OpenAI em andamento.',
    'Ricardo Landim',
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Palmas IA',
    '{"priority": "high", "taskStatus": "started", "participants": ["Ricardo Landim"]}'
),

-- Eventos do Projeto Jocum SDK
(
    'milestone',
    'SDK Multi-LLM Jocum Concluído',
    'SDK que integra OpenAI + Anthropic + Gemini com fallback automático foi finalizado e testado com sucesso.',
    'Leonardo Candiani',
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    'Jocum SDK',
    '{"priority": "high", "taskStatus": "completed", "participants": ["Leonardo Candiani", "Ricardo Landim"]}'
),
(
    'task',
    'Mapeamento 80 Bases Jocum em Progresso',
    'Mapeamento e integração de todas as 80+ bases de dados da Jocum para o sistema. 25% concluído.',
    'Rodrigo Marochi',
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440003',
    'Jocum SDK',
    '{"priority": "medium", "taskStatus": "started", "participants": ["Rodrigo Marochi", "Leonardo Candiani"]}'
),
(
    'task',
    'VoIP + WhatsApp Integration Planejada',
    'Integração de canais VoIP e WhatsApp para cobertura completa de atendimento. Fase de planejamento.',
    'Rodrigo Marochi',
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440003',
    'Jocum SDK',
    '{"priority": "high", "taskStatus": "started", "participants": ["Rodrigo Marochi"]}'
),

-- Eventos Gerais SixQuasar
(
    'milestone',
    'Team Manager Deploy Concluído',
    'Deploy do sistema Team Manager em admin.sixquasar.pro foi realizado com sucesso. Sistema operacional.',
    'Ricardo Landim',
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Team Manager',
    '{"priority": "medium", "taskStatus": "completed", "participants": ["Ricardo Landim"]}'
),
(
    'task',
    'Documentação Projetos Pendente',
    'Documentação da arquitetura e processos dos projetos Palmas e Jocum ainda precisa ser criada.',
    'Leonardo Candiani',
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    'Documentação',
    '{"priority": "low", "taskStatus": "started", "participants": ["Leonardo Candiani"]}'
),

-- Reuniões e Deadlines
(
    'meeting',
    'Reunião Semanal SixQuasar',
    'Reunião de alinhamento da equipe para discutir progresso dos projetos Palmas IA e Jocum SDK.',
    'Ricardo Landim',
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Gestão',
    '{"priority": "medium", "participants": ["Ricardo Landim", "Leonardo Candiani", "Rodrigo Marochi"]}'
),
(
    'deadline',
    'Deadline Palmas IA - Agosto 2025',
    'Data limite para entrega da primeira versão funcional do sistema Palmas IA com todas as integrações.',
    'Ricardo Landim',
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Palmas IA',
    '{"priority": "urgent", "participants": ["Ricardo Landim", "Rodrigo Marochi"]}'
);

-- ================================================================
-- VERIFICAÇÕES DE INTEGRIDADE
-- ================================================================

-- Verificar se a tabela foi criada corretamente
SELECT 
    'eventos_timeline' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT equipe_id) as equipes_distintas,
    COUNT(DISTINCT usuario_id) as usuarios_distintos,
    COUNT(DISTINCT type) as tipos_distintos
FROM eventos_timeline;

-- Verificar tipos de evento
SELECT 
    type,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM eventos_timeline), 2) as percentual
FROM eventos_timeline 
GROUP BY type 
ORDER BY quantidade DESC;

-- Verificar eventos por projeto
SELECT 
    COALESCE(project, 'Sem Projeto') as projeto,
    COUNT(*) as quantidade
FROM eventos_timeline 
GROUP BY project 
ORDER BY quantidade DESC;

-- ================================================================
-- CONSULTA DE TESTE FINAL
-- ================================================================

-- Buscar eventos recentes ordenados por timestamp
SELECT 
    id,
    type,
    title,
    author,
    project,
    timestamp,
    metadata->>'priority' as priority,
    metadata->>'taskStatus' as task_status
FROM eventos_timeline 
ORDER BY timestamp DESC 
LIMIT 10;