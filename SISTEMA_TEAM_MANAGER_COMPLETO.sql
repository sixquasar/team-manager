-- =====================================================
-- TEAM MANAGER - SISTEMA COMPLETO DE GESTÃO DE EQUIPE
-- =====================================================
-- Criado para: admin.sixquasar.pro
-- Equipe: TechSquad (3 pessoas)
-- =====================================================

-- Limpeza inicial
DROP TABLE IF EXISTS public.eventos_timeline CASCADE;
DROP TABLE IF EXISTS public.mensagens CASCADE;
DROP TABLE IF EXISTS public.tarefas CASCADE;
DROP TABLE IF EXISTS public.projetos CASCADE;
DROP TABLE IF EXISTS public.metricas CASCADE;
DROP TABLE IF EXISTS public.usuario_equipes CASCADE;
DROP TABLE IF EXISTS public.equipes CASCADE;
DROP TABLE IF EXISTS public.sessoes CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;

-- =====================================================
-- 1. TABELA DE USUÁRIOS
-- =====================================================
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cargo VARCHAR(255),
    tipo VARCHAR(50) DEFAULT 'member' CHECK (tipo IN ('owner', 'admin', 'member')),
    avatar_url TEXT,
    telefone VARCHAR(20),
    localizacao VARCHAR(255),
    senha_hash VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABELA DE EQUIPES
-- =====================================================
CREATE TABLE public.equipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    owner_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. RELACIONAMENTO USUÁRIO-EQUIPES
-- =====================================================
CREATE TABLE public.usuario_equipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES public.equipes(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    data_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ativo BOOLEAN DEFAULT true,
    UNIQUE(usuario_id, equipe_id)
);

-- =====================================================
-- 4. TABELA DE TAREFAS
-- =====================================================
CREATE TABLE public.tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_progresso', 'concluida', 'cancelada')),
    prioridade VARCHAR(50) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
    responsavel_id UUID REFERENCES public.usuarios(id),
    equipe_id UUID REFERENCES public.equipes(id) ON DELETE CASCADE,
    projeto_id UUID,
    data_vencimento TIMESTAMP WITH TIME ZONE,
    data_conclusao TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    anexos JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABELA DE PROJETOS
-- =====================================================
CREATE TABLE public.projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    status VARCHAR(50) DEFAULT 'planejamento' CHECK (status IN ('planejamento', 'em_progresso', 'finalizado', 'cancelado')),
    responsavel_id UUID REFERENCES public.usuarios(id),
    equipe_id UUID REFERENCES public.equipes(id) ON DELETE CASCADE,
    data_inicio DATE,
    data_fim_prevista DATE,
    data_fim_real DATE,
    progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
    orcamento DECIMAL(10,2),
    tecnologias TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TABELA DE MENSAGENS
-- =====================================================
CREATE TABLE public.mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canal VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'public' CHECK (tipo IN ('public', 'private', 'direct')),
    autor_id UUID REFERENCES public.usuarios(id),
    destinatario_id UUID REFERENCES public.usuarios(id), -- Para mensagens diretas
    equipe_id UUID REFERENCES public.equipes(id) ON DELETE CASCADE,
    conteudo TEXT NOT NULL,
    editado BOOLEAN DEFAULT false,
    fixado BOOLEAN DEFAULT false,
    anexos JSONB DEFAULT '[]',
    reacoes JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. TABELA DE EVENTOS DA TIMELINE
-- =====================================================
CREATE TABLE public.eventos_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('task', 'message', 'milestone', 'meeting', 'deadline')),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    autor_id UUID REFERENCES public.usuarios(id),
    equipe_id UUID REFERENCES public.equipes(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. TABELA DE MÉTRICAS
-- =====================================================
CREATE TABLE public.metricas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipe_id UUID REFERENCES public.equipes(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id),
    tipo VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
    data_referencia DATE NOT NULL,
    tarefas_concluidas INTEGER DEFAULT 0,
    horas_trabalhadas DECIMAL(5,2) DEFAULT 0,
    eficiencia INTEGER DEFAULT 0 CHECK (eficiencia >= 0 AND eficiencia <= 100),
    projetos_ativos INTEGER DEFAULT 0,
    dados_extras JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. TABELA DE SESSÕES
-- =====================================================
CREATE TABLE public.sessoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX idx_usuarios_email ON public.usuarios(email);
CREATE INDEX idx_usuarios_ativo ON public.usuarios(ativo);
CREATE INDEX idx_tarefas_status ON public.tarefas(status);
CREATE INDEX idx_tarefas_responsavel ON public.tarefas(responsavel_id);
CREATE INDEX idx_tarefas_equipe ON public.tarefas(equipe_id);
CREATE INDEX idx_projetos_equipe ON public.projetos(equipe_id);
CREATE INDEX idx_mensagens_canal ON public.mensagens(canal);
CREATE INDEX idx_mensagens_equipe ON public.mensagens(equipe_id);
CREATE INDEX idx_timeline_equipe ON public.eventos_timeline(equipe_id);
CREATE INDEX idx_metricas_equipe_data ON public.metricas(equipe_id, data_referencia);
CREATE INDEX idx_sessoes_usuario ON public.sessoes(usuario_id);
CREATE INDEX idx_sessoes_token ON public.sessoes(token);

-- =====================================================
-- FUNCTIONS E TRIGGERS
-- =====================================================

-- Function para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipes_updated_at BEFORE UPDATE ON public.equipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tarefas_updated_at BEFORE UPDATE ON public.tarefas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projetos_updated_at BEFORE UPDATE ON public.projetos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mensagens_updated_at BEFORE UPDATE ON public.mensagens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS - TECHSQUAD
-- =====================================================

-- 1. Inserir usuários
INSERT INTO public.usuarios (id, email, nome, cargo, tipo, senha_hash) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ricardo@sixquasar.pro', 'Ricardo Landim', 'Tech Lead', 'owner', '$2b$10$hashedpassword123'),
('550e8400-e29b-41d4-a716-446655440002', 'leonardo@sixquasar.pro', 'Leonardo Candiani', 'Developer', 'admin', '$2b$10$hashedpassword123'),
('550e8400-e29b-41d4-a716-446655440003', 'rodrigo@sixquasar.pro', 'Rodrigo Marochi', 'Developer', 'member', '$2b$10$hashedpassword123');

-- 2. Criar equipe
INSERT INTO public.equipes (id, nome, descricao, owner_id) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'TechSquad', 'Equipe de desenvolvimento de software', '550e8400-e29b-41d4-a716-446655440001');

-- 3. Associar usuários à equipe
INSERT INTO public.usuario_equipes (usuario_id, equipe_id, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'owner'),
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'admin'),
('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'member');

-- 4. Inserir projetos exemplo
INSERT INTO public.projetos (id, nome, descricao, status, responsavel_id, equipe_id, data_inicio, data_fim_prevista, progresso, tecnologias) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'Team Manager', 'Sistema de gestão de equipe', 'em_progresso', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '2024-11-01', '2024-12-15', 75, ARRAY['React', 'TypeScript', 'Supabase']),
('750e8400-e29b-41d4-a716-446655440002', 'Mobile App', 'Aplicativo mobile complementar', 'planejamento', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', '2024-12-01', '2025-02-28', 10, ARRAY['React Native', 'Expo']);

-- 5. Inserir tarefas exemplo
INSERT INTO public.tarefas (titulo, descricao, status, prioridade, responsavel_id, equipe_id, projeto_id, data_vencimento, tags) VALUES
('Implementar sistema de login', 'Criar tela de login com validação de credenciais', 'concluida', 'alta', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '2024-11-05 17:00:00+00', ARRAY['frontend', 'auth']),
('Desenvolvimento do backend', 'Implementar APIs e integração com banco', 'em_progresso', 'alta', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '2024-11-08 17:00:00+00', ARRAY['backend', 'api']),
('Interface e experiência do usuário', 'Criar componentes e melhorar UX', 'pendente', 'media', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '2024-11-10 17:00:00+00', ARRAY['frontend', 'ux']);

-- 6. Inserir eventos da timeline
INSERT INTO public.eventos_timeline (tipo, titulo, descricao, autor_id, equipe_id, metadata) VALUES
('task', 'Tarefa concluída', 'Sistema de login implementado com sucesso', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '{"task_id": "1", "priority": "alta"}'),
('milestone', 'Marco atingido', 'Sprint 1 finalizada com 90% das metas', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '{"sprint": 1, "completion": 90}'),
('meeting', 'Daily Standup', 'Reunião diária da equipe realizada', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '{"participants": ["Ricardo", "Leonardo", "Rodrigo"]}');

-- 7. Inserir mensagens exemplo
INSERT INTO public.mensagens (canal, tipo, autor_id, equipe_id, conteudo) VALUES
('geral', 'public', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Bom dia pessoal! Como estão os projetos da sprint atual?'),
('geral', 'public', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'Oi Ricardo! O backend está progredindo bem. APIs principais já funcionando.'),
('desenvolvimento', 'public', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'Trabalhando na interface. UX está ficando muito boa!');

-- 8. Inserir métricas exemplo
INSERT INTO public.metricas (equipe_id, usuario_id, tipo, data_referencia, tarefas_concluidas, horas_trabalhadas, eficiencia, projetos_ativos) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'weekly', '2024-11-04', 5, 40, 95, 2),
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'weekly', '2024-11-04', 3, 35, 88, 1),
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'weekly', '2024-11-04', 4, 38, 92, 2);

-- =====================================================
-- DESABILITAR RLS PARA DESENVOLVIMENTO
-- =====================================================
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_equipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_timeline DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.metricas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- GRANTS DE PERMISSÃO
-- =====================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- =====================================================
-- FINALIZAÇÃO
-- =====================================================
SELECT 'Team Manager database setup completed successfully!' as status;