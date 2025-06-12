-- Sistema de Autenticação e Banco de Dados para Team Manager
-- Baseado na arquitetura robusta do HelioGen
-- Adaptado para gestão de equipe de 3 pessoas

-- =====================================================
-- STEP 1: CRIAR TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de usuários (sistema próprio de autenticação)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cargo VARCHAR(100),
    avatar_url TEXT,
    tipo VARCHAR(20) DEFAULT 'member' CHECK (tipo IN ('admin', 'member')),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de equipes
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento usuário-equipe
CREATE TABLE IF NOT EXISTS public.user_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, team_id)
);

-- Tabela de sessões (controle de autenticação)
CREATE TABLE IF NOT EXISTS public.sessoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tarefas
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    prioridade VARCHAR(20) DEFAULT 'medium' CHECK (prioridade IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES public.usuarios(id),
    created_by UUID REFERENCES public.usuarios(id) NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conteudo TEXT NOT NULL,
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    tipo VARCHAR(20) DEFAULT 'text' CHECK (tipo IN ('text', 'image', 'file')),
    reply_to UUID REFERENCES public.messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de timeline/marcos
CREATE TABLE IF NOT EXISTS public.timeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE,
    tipo VARCHAR(20) DEFAULT 'milestone' CHECK (tipo IN ('milestone', 'event', 'deadline')),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.usuarios(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relatórios
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'general' CHECK (tipo IN ('productivity', 'tasks', 'timeline', 'general')),
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    conteudo JSONB,
    created_by UUID REFERENCES public.usuarios(id) NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: FUNÇÕES RPC PARA AUTENTICAÇÃO
-- =====================================================

-- Função para registrar usuário
CREATE OR REPLACE FUNCTION public.register_user(
    user_email TEXT,
    user_password TEXT,
    user_nome TEXT,
    user_cargo TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
    password_hash TEXT;
BEGIN
    -- Verificar se email já existe
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE email = user_email) THEN
        RETURN json_build_object('success', false, 'error', 'Email já está em uso');
    END IF;

    -- Gerar hash da senha
    password_hash := crypt(user_password, gen_salt('bf'));

    -- Inserir usuário
    INSERT INTO public.usuarios (email, senha_hash, nome, cargo)
    VALUES (user_email, password_hash, user_nome, user_cargo)
    RETURNING id INTO user_id;

    RETURN json_build_object('success', true, 'user_id', user_id);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Função para login
CREATE OR REPLACE FUNCTION public.login_user(
    user_email TEXT,
    user_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    session_token TEXT;
    expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Buscar usuário e verificar senha
    SELECT * INTO user_record
    FROM public.usuarios
    WHERE email = user_email AND ativo = true;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Email ou senha incorretos');
    END IF;

    -- Verificar senha
    IF user_record.senha_hash != crypt(user_password, user_record.senha_hash) THEN
        RETURN json_build_object('success', false, 'error', 'Email ou senha incorretos');
    END IF;

    -- Gerar token de sessão
    session_token := encode(gen_random_bytes(32), 'base64');
    expires_at := NOW() + INTERVAL '7 days';

    -- Limpar sessões antigas do usuário
    DELETE FROM public.sessoes WHERE user_id = user_record.id;

    -- Criar nova sessão
    INSERT INTO public.sessoes (user_id, session_token, expires_at)
    VALUES (user_record.id, session_token, expires_at);

    RETURN json_build_object(
        'success', true,
        'user_id', user_record.id,
        'session_token', session_token,
        'expires_at', expires_at
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Função para validar sessão
CREATE OR REPLACE FUNCTION public.validate_session(session_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    session_record RECORD;
BEGIN
    -- Buscar sessão válida
    SELECT s.*, u.id as user_id, u.email, u.nome
    INTO session_record
    FROM public.sessoes s
    JOIN public.usuarios u ON s.user_id = u.id
    WHERE s.session_token = validate_session.session_token
    AND s.expires_at > NOW()
    AND u.ativo = true;

    IF NOT FOUND THEN
        RETURN json_build_object('valid', false);
    END IF;

    RETURN json_build_object(
        'valid', true,
        'user_id', session_record.user_id,
        'email', session_record.email,
        'nome', session_record.nome
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('valid', false, 'error', SQLERRM);
END;
$$;

-- Função para logout
CREATE OR REPLACE FUNCTION public.logout_user(session_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.sessoes WHERE session_token = logout_user.session_token;
    RETURN json_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- =====================================================
-- STEP 3: TRIGGERS E ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas relevantes
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timeline_updated_at
    BEFORE UPDATE ON public.timeline
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- STEP 4: CONFIGURAÇÕES DE SEGURANÇA
-- =====================================================

-- Desabilitar RLS para evitar problemas de acesso
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: DADOS INICIAIS DE DEMONSTRAÇÃO
-- =====================================================

-- Inserir equipe principal
INSERT INTO public.teams (id, nome, descricao) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Equipe Principal',
    'Equipe de desenvolvimento do Team Manager'
) ON CONFLICT DO NOTHING;

-- Inserir usuários de demonstração
INSERT INTO public.usuarios (id, email, senha_hash, nome, cargo, tipo) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'admin@teammanager.com',
    crypt('admin123', gen_salt('bf')),
    'Admin Sistema',
    'Administrador',
    'admin'
),
(
    '22222222-2222-2222-2222-222222222222',
    'ricardo@teammanager.com',
    crypt('ricardo123', gen_salt('bf')),
    'Ricardo Landim',
    'Tech Lead',
    'member'
),
(
    '33333333-3333-3333-3333-333333333333',
    'ana@teammanager.com',
    crypt('ana123', gen_salt('bf')),
    'Ana Silva',
    'Designer',
    'member'
),
(
    '44444444-4444-4444-4444-444444444444',
    'carlos@teammanager.com',
    crypt('carlos123', gen_salt('bf')),
    'Carlos Santos',
    'Developer',
    'member'
),
(
    '55555555-5555-5555-5555-555555555555',
    'member@teammanager.com',
    crypt('member123', gen_salt('bf')),
    'Membro Demo',
    'Membro da equipe',
    'member'
)
ON CONFLICT DO NOTHING;

-- Associar usuários à equipe
INSERT INTO public.user_teams (user_id, team_id, role) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'leader'),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'leader'),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'member'),
('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'member'),
('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'member')
ON CONFLICT DO NOTHING;

-- Inserir tarefas de demonstração
INSERT INTO public.tasks (titulo, descricao, status, prioridade, assigned_to, created_by, team_id, due_date) VALUES
('Configurar ambiente de desenvolvimento', 'Configurar Vite, TypeScript e TailwindCSS', 'done', 'high', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', NOW() + INTERVAL '2 days'),
('Design do sistema', 'Criar mockups e protótipos das principais telas', 'in_progress', 'high', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', NOW() + INTERVAL '3 days'),
('Implementar autenticação', 'Sistema de login e registro de usuários', 'in_progress', 'urgent', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', NOW() + INTERVAL '1 day'),
('Criar componentes base', 'Botões, inputs, cards e outros componentes UI', 'review', 'medium', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', NOW() + INTERVAL '4 days'),
('Testes unitários', 'Implementar testes para principais componentes', 'todo', 'medium', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', NOW() + INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- Inserir marcos da timeline
INSERT INTO public.timeline (titulo, descricao, data_inicio, data_fim, tipo, team_id, created_by) VALUES
('Início do projeto', 'Kickoff do projeto Team Manager', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', 'milestone', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222'),
('Sprint 1', 'Primeira sprint de desenvolvimento', NOW() - INTERVAL '5 days', NOW() + INTERVAL '2 days', 'event', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222'),
('Demo para stakeholders', 'Apresentação do MVP', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days', 'deadline', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- Inserir mensagens de exemplo
INSERT INTO public.messages (conteudo, user_id, team_id, tipo) VALUES
('Bem-vindos ao Team Manager! 🎉', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'text'),
('O design está ficando ótimo! Parabéns Ana 👏', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'text'),
('Obrigada Carlos! Vou finalizar os mockups hoje.', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'text')
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 6: ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para otimizar consultas frequentes
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_sessoes_token ON public.sessoes(session_token);
CREATE INDEX IF NOT EXISTS idx_sessoes_user_id ON public.sessoes(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON public.tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_messages_team_id ON public.messages(team_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_team_id ON public.timeline(team_id);
CREATE INDEX IF NOT EXISTS idx_user_teams_user_id ON public.user_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_user_teams_team_id ON public.user_teams(team_id);

-- =====================================================
-- INSTALAÇÃO COMPLETA!
-- =====================================================

-- Verificação final
SELECT 
    'Team Manager Database Setup Complete!' as status,
    COUNT(*) as total_users
FROM public.usuarios;