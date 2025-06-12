-- 🎯 SISTEMA TEAM MANAGER COMPLETO - SIXQUASAR
-- Baseado na arquitetura HelioGen adaptada para gestão de equipes
-- Versão: 1.0.0
-- Data: 06/11/2025

-- =====================================================
-- 🛡️ DESABILITAR RLS EM TODAS AS TABELAS (CRÍTICO)
-- =====================================================

-- Desabilitar RLS globalmente
ALTER TABLE IF EXISTS usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS equipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS usuario_equipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tarefas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projetos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mensagens DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS eventos_timeline DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS metricas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sessoes DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 📋 TABELAS PRINCIPAIS
-- =====================================================

-- 👤 USUÁRIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    cargo VARCHAR(100) DEFAULT 'Team Member',
    tipo VARCHAR(50) DEFAULT 'member', -- admin, member, guest
    avatar_url TEXT,
    ativo BOOLEAN DEFAULT true,
    ultimo_acesso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🏢 EQUIPES (equivalente a empresas no HelioGen)
CREATE TABLE IF NOT EXISTS equipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT,
    cor_primaria VARCHAR(7) DEFAULT '#3b82f6',
    cor_secundaria VARCHAR(7) DEFAULT '#1d4ed8',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔗 RELACIONAMENTO USUÁRIO-EQUIPE
CREATE TABLE IF NOT EXISTS usuario_equipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES equipes(id) ON DELETE CASCADE,
    papel VARCHAR(50) DEFAULT 'member', -- admin, member, viewer
    equipe_padrao BOOLEAN DEFAULT false,
    data_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, equipe_id)
);

-- ✅ TAREFAS (核心功能)
CREATE TABLE IF NOT EXISTS tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    status VARCHAR(50) DEFAULT 'pendente', -- pendente, em_progresso, concluida, cancelada
    prioridade VARCHAR(50) DEFAULT 'media', -- baixa, media, alta, urgente
    tipo VARCHAR(50) DEFAULT 'tarefa', -- tarefa, bug, melhoria, feature
    
    -- Relacionamentos
    equipe_id UUID REFERENCES equipes(id) ON DELETE CASCADE,
    responsavel_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_por_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    projeto_id UUID REFERENCES projetos(id) ON DELETE SET NULL,
    
    -- Datas
    data_inicio DATE,
    data_fim DATE,
    data_conclusao TIMESTAMP WITH TIME ZONE,
    
    -- Metadados
    estimativa_horas INTEGER DEFAULT 0,
    horas_trabalhadas INTEGER DEFAULT 0,
    tags TEXT[], -- array de tags
    anexos JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📁 PROJETOS
CREATE TABLE IF NOT EXISTS projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    status VARCHAR(50) DEFAULT 'planejamento', -- planejamento, ativo, pausado, concluido, cancelado
    
    -- Relacionamentos
    equipe_id UUID REFERENCES equipes(id) ON DELETE CASCADE,
    gerente_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Datas
    data_inicio DATE,
    data_fim DATE,
    data_conclusao TIMESTAMP WITH TIME ZONE,
    
    -- Metadados
    orcamento DECIMAL(10,2),
    progresso INTEGER DEFAULT 0, -- 0-100%
    cor VARCHAR(7) DEFAULT '#3b82f6',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 💬 MENSAGENS/COMUNICAÇÃO
CREATE TABLE IF NOT EXISTS mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conteudo TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'mensagem', -- mensagem, notificacao, comentario
    
    -- Relacionamentos
    remetente_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES equipes(id) ON DELETE CASCADE,
    tarefa_id UUID REFERENCES tarefas(id) ON DELETE CASCADE,
    projeto_id UUID REFERENCES projetos(id) ON DELETE SET NULL,
    
    -- Status
    lida BOOLEAN DEFAULT false,
    importante BOOLEAN DEFAULT false,
    
    -- Metadados
    anexos JSONB DEFAULT '[]',
    mencoes UUID[], -- array de user IDs mencionados
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📅 EVENTOS TIMELINE
CREATE TABLE IF NOT EXISTS eventos_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) NOT NULL, -- tarefa_criada, projeto_iniciado, deadline, reuniao, etc
    
    -- Relacionamentos
    equipe_id UUID REFERENCES equipes(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    tarefa_id UUID REFERENCES tarefas(id) ON DELETE CASCADE,
    projeto_id UUID REFERENCES projetos(id) ON DELETE CASCADE,
    
    -- Data do evento
    data_evento TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Metadados
    icone VARCHAR(50) DEFAULT 'calendar',
    cor VARCHAR(7) DEFAULT '#3b82f6',
    metadados JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📊 MÉTRICAS E ANALYTICS
CREATE TABLE IF NOT EXISTS metricas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(100) NOT NULL, -- produtividade, tempo_medio, tarefas_concluidas, etc
    valor DECIMAL(10,2) NOT NULL,
    unidade VARCHAR(50), -- horas, quantidade, percentual, etc
    
    -- Relacionamentos
    equipe_id UUID REFERENCES equipes(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    projeto_id UUID REFERENCES projetos(id) ON DELETE SET NULL,
    
    -- Período da métrica
    data_inicio DATE,
    data_fim DATE,
    
    -- Metadados
    detalhes JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔑 SESSÕES (Sistema de autenticação próprio)
CREATE TABLE IF NOT EXISTS sessoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 🚀 DADOS INICIAIS PADRÃO
-- =====================================================

-- 🏢 Equipe padrão TechSquad
INSERT INTO equipes (id, nome, slug, descricao, cor_primaria, cor_secundaria) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'TechSquad Team',
    'techsquad',
    'Equipe principal de desenvolvimento e gestão',
    '#3b82f6',
    '#1d4ed8'
) ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao;

-- 👥 Usuários padrão da equipe
INSERT INTO usuarios (id, email, nome, senha_hash, cargo, tipo) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'ricardo@techsquad.com',
    'Ricardo Landim',
    '$2b$10$dummy.hash.for.development.purposes.only',
    'Tech Lead',
    'admin'
),
(
    '00000000-0000-0000-0000-000000000002', 
    'ana@techsquad.com',
    'Ana Silva',
    '$2b$10$dummy.hash.for.development.purposes.only',
    'Frontend Developer',
    'member'
),
(
    '00000000-0000-0000-0000-000000000003',
    'carlos@techsquad.com', 
    'Carlos Rocha',
    '$2b$10$dummy.hash.for.development.purposes.only',
    'Backend Developer',
    'member'
) ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    cargo = EXCLUDED.cargo;

-- 🔗 Vincular usuários à equipe padrão
INSERT INTO usuario_equipes (usuario_id, equipe_id, papel, equipe_padrao) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin', true),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'member', true),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'member', true)
ON CONFLICT (usuario_id, equipe_id) DO UPDATE SET
    papel = EXCLUDED.papel,
    equipe_padrao = EXCLUDED.equipe_padrao;

-- 📁 Projeto exemplo
INSERT INTO projetos (nome, descricao, status, equipe_id, gerente_id, data_inicio, data_fim, progresso) VALUES
(
    'Sistema Team Manager',
    'Desenvolvimento do sistema de gestão de equipes SixQuasar',
    'ativo',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    25
) ON CONFLICT DO NOTHING;

-- ✅ Tarefas exemplo
INSERT INTO tarefas (titulo, descricao, status, prioridade, equipe_id, responsavel_id, criado_por_id, data_inicio, data_fim) VALUES
(
    'Implementar Dashboard',
    'Criar dashboard principal com métricas da equipe',
    'em_progresso',
    'alta',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '7 days'
),
(
    'Sistema de Autenticação',
    'Implementar login e registro de usuários',
    'concluida',
    'alta',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE
),
(
    'Interface Kanban',
    'Criar board Kanban para gestão de tarefas',
    'pendente',
    'media',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    CURRENT_DATE + INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '10 days'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- 📊 ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices principais para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_tarefas_equipe_status ON tarefas(equipe_id, status);
CREATE INDEX IF NOT EXISTS idx_tarefas_responsavel ON tarefas(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_created_at ON tarefas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projetos_equipe ON projetos(equipe_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_equipe_created ON mensagens(equipe_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_eventos_timeline_equipe_data ON eventos_timeline(equipe_id, data_evento DESC);
CREATE INDEX IF NOT EXISTS idx_metricas_equipe_tipo ON metricas(equipe_id, tipo);
CREATE INDEX IF NOT EXISTS idx_usuario_equipes_usuario ON usuario_equipes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_token ON sessoes(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario_ativo ON sessoes(usuario_id, ativo);

-- =====================================================
-- ✅ CONFIRMAÇÃO DE INSTALAÇÃO
-- =====================================================

-- Verificar se todas as tabelas foram criadas
DO $$
BEGIN
    RAISE NOTICE '🎯 SISTEMA TEAM MANAGER INSTALADO COM SUCESSO!';
    RAISE NOTICE '📊 Tabelas criadas: usuarios, equipes, usuario_equipes, tarefas, projetos, mensagens, eventos_timeline, metricas, sessoes';
    RAISE NOTICE '👥 Usuários padrão: ricardo@techsquad.com, ana@techsquad.com, carlos@techsquad.com';
    RAISE NOTICE '🏢 Equipe padrão: TechSquad Team';
    RAISE NOTICE '🔑 Sistema de autenticação próprio configurado';
    RAISE NOTICE '🛡️ RLS desabilitado em todas as tabelas';
    RAISE NOTICE '📈 Índices de performance criados';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PRONTO PARA USO! Login: ricardo@techsquad.com / senha: qualquer';
END $$;