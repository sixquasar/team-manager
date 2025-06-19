-- =====================================================
-- TEAM MANAGER - PROJETOS REAIS SIXQUASAR
-- =====================================================
-- Baseado nos arquivos .docx fornecidos:
-- 1. Sistema de Atendimento ao Cidadão de Palmas com IA
-- 2. SDK Jocum com LLM
-- =====================================================

-- Limpar projetos e tarefas mockadas (só se as tabelas existirem)
DO $$
BEGIN
    -- Verificar se tabela tarefas existe antes de deletar
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tarefas') THEN
        DELETE FROM public.tarefas WHERE projeto_id IN (
            SELECT id FROM public.projetos WHERE nome IN ('Team Manager', 'Mobile App')
        );
    END IF;
    
    -- Verificar se tabela projetos existe antes de deletar
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projetos') THEN
        DELETE FROM public.projetos WHERE nome IN ('Team Manager', 'Mobile App');
    END IF;
    
    -- Verificar se tabela eventos_timeline existe antes de deletar
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'eventos_timeline') THEN
        DELETE FROM public.eventos_timeline WHERE tipo = 'task' OR tipo = 'milestone';
    END IF;
END
$$;

-- =====================================================
-- VERIFICAR E CRIAR ESTRUTURA SE NECESSÁRIO
-- =====================================================

-- Criar tabela equipes se não existir
CREATE TABLE IF NOT EXISTS public.equipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    owner_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela projetos se não existir
CREATE TABLE IF NOT EXISTS public.projetos (
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

-- Criar tabela tarefas se não existir
CREATE TABLE IF NOT EXISTS public.tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_progresso', 'concluida', 'cancelada')),
    prioridade VARCHAR(50) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
    responsavel_id UUID REFERENCES public.usuarios(id),
    equipe_id UUID REFERENCES public.equipes(id) ON DELETE CASCADE,
    projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
    data_vencimento TIMESTAMP WITH TIME ZONE,
    data_conclusao TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    anexos JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela eventos_timeline se não existir
CREATE TABLE IF NOT EXISTS public.eventos_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('task', 'message', 'milestone', 'meeting', 'deadline')),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    autor_id UUID REFERENCES public.usuarios(id),
    equipe_id UUID REFERENCES public.equipes(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela metricas se não existir
CREATE TABLE IF NOT EXISTS public.metricas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipe_id UUID REFERENCES public.equipes(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id),
    tipo VARCHAR(50) NOT NULL,
    data_referencia DATE NOT NULL,
    tarefas_concluidas INTEGER DEFAULT 0,
    horas_trabalhadas DECIMAL(5,2) DEFAULT 0,
    eficiencia INTEGER DEFAULT 0 CHECK (eficiencia >= 0 AND eficiencia <= 100),
    projetos_ativos INTEGER DEFAULT 0,
    dados_extras JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Desabilitar RLS para desenvolvimento
ALTER TABLE public.equipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_timeline DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.metricas DISABLE ROW LEVEL SECURITY;

-- Conceder permissões
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Inserir equipe se não existir
INSERT INTO public.equipes (id, nome, descricao, owner_id) 
SELECT '650e8400-e29b-41d4-a716-446655440001', 'TechSquad', 'Equipe de desenvolvimento SixQuasar', '550e8400-e29b-41d4-a716-446655440001'
WHERE NOT EXISTS (SELECT 1 FROM public.equipes WHERE id = '650e8400-e29b-41d4-a716-446655440001');

-- =====================================================
-- PROJETO 1: SISTEMA DE ATENDIMENTO AO CIDADÃO DE PALMAS COM IA
-- =====================================================

INSERT INTO public.projetos (
    id, 
    nome, 
    descricao, 
    status, 
    responsavel_id, 
    equipe_id, 
    data_inicio, 
    data_fim_prevista, 
    progresso, 
    orcamento,
    tecnologias
) VALUES (
    '750e8400-e29b-41d4-a716-446655440001',
    'Sistema de Atendimento ao Cidadão de Palmas com IA',
    'Sistema Integrado de Atendimento ao Cidadão com Inteligência Artificial para a Prefeitura Municipal de Palmas - TO. Automatizar 60% dos atendimentos municipais, reduzir tempo de resposta de 48h para <5 minutos, economizar 30% nos custos operacionais e atingir 85% de satisfação cidadã. População atendida: 350.000 habitantes.',
    'em_progresso',
    '550e8400-e29b-41d4-a716-446655440001', -- Ricardo Landim
    '650e8400-e29b-41d4-a716-446655440001',
    '2024-11-01',
    '2025-09-01', -- 10 meses
    25, -- Fase de planejamento avançado
    2400000.00, -- R$ 2.4M de desenvolvimento
    ARRAY['Python', 'LangChain', 'OpenAI GPT-4o', 'WhatsApp API', 'PostgreSQL', 'Kubernetes', 'AWS', 'Redis', 'N8N']
);

-- =====================================================
-- PROJETO 2: SDK JOCUM COM LLM
-- =====================================================

INSERT INTO public.projetos (
    id, 
    nome, 
    descricao, 
    status, 
    responsavel_id, 
    equipe_id, 
    data_inicio, 
    data_fim_prevista, 
    progresso, 
    orcamento,
    tecnologias
) VALUES (
    '750e8400-e29b-41d4-a716-446655440002',
    'Automação Jocum com SDK e LLM',
    'Agente automatizado para atendimento aos usuários da Jocum, utilizando diretamente SDKs dos principais LLMs (OpenAI GPT-4.1mini, Anthropic Claude 3.7 Sonnet, Google Gemini Flash 2.5). Gestão de pré-inscrições, agendamento de reuniões, WhatsApp, VoIP e e-mail. Meta: 50.000 atendimentos/dia, 99.9% disponibilidade, 85% satisfação.',
    'em_progresso',
    '550e8400-e29b-41d4-a716-446655440002', -- Leonardo Candiani
    '650e8400-e29b-41d4-a716-446655440001',
    '2024-12-01',
    '2025-06-01', -- 6 meses
    15, -- Fase de POC
    625000.00, -- R$ 625K total
    ARRAY['Python', 'LangChain', 'OpenAI', 'Anthropic Claude', 'Google Gemini', 'WhatsApp API', 'VoIP', 'PostgreSQL', 'React', 'AWS/GCP']
);

-- =====================================================
-- TAREFAS DO PROJETO PALMAS (Principais marcos)
-- =====================================================

INSERT INTO public.tarefas (
    titulo, 
    descricao, 
    status, 
    prioridade, 
    responsavel_id, 
    equipe_id, 
    projeto_id, 
    data_vencimento, 
    tags
) VALUES 
-- FASE 1: Planejamento (Mês 1-2)
(
    'Análise de Requisitos e Planejamento Detalhado',
    'Estruturação do projeto, análise de stakeholders, definição do PMO municipal, aprovação orçamentária na Câmara. Análise de 4 cenários: Cloud Puro, Cloud+Prodata, On-Premises, Híbrido (Recomendado).',
    'concluida',
    'alta',
    '550e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440001',
    '750e8400-e29b-41d4-a716-446655440001',
    '2024-11-15 17:00:00+00',
    ARRAY['planejamento', 'análise', 'stakeholders']
),
(
    'Dimensionamento Técnico e Arquitetura',
    'Levantamento de requisitos funcionais (IPTU 35%, Alvará 15%, Creches 20%, Outros 30%). Análise de carga: 1M mensagens/mês, 33k/dia. Arquitetura de dados: 7TB inicial, 21TB com redundância.',
    'concluida',
    'alta',
    '550e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440001',
    '750e8400-e29b-41d4-a716-446655440001',
    '2024-11-30 17:00:00+00',
    ARRAY['arquitetura', 'requisitos', 'volumetria']
),

-- FASE 2: POC (Mês 3)
(
    'Prova de Conceito - 5.000 cidadãos',
    'Arquitetura simplificada N8N, 6 workflows, WhatsApp Business API, OpenAI GPT-4o-mini, PostgreSQL básico. Serviços piloto: IPTU simplificado e Protocolo básico. Meta: 70% resolução, <2min resposta.',
    'em_progresso',
    'alta',
    '550e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440001',
    '750e8400-e29b-41d4-a716-446655440001',
    '2025-01-31 17:00:00+00',
    ARRAY['poc', 'n8n', 'whatsapp', 'piloto']
),

-- FASE 3: Desenvolvimento (Mês 4-6)
(
    'Desenvolvimento em Escala - Microserviços',
    'Arquitetura de produção: API Gateway Kong, WhatsApp service, Motor IA LangChain, OCR Tesseract. Kubernetes 5-7 nodes, 40-112 vCPUs. Multi-LLM: GPT-4o, Claude 3.5, Gemini Flash.',
    'pendente',
    'alta',
    '550e8400-e29b-41d4-a716-446655440003',
    '650e8400-e29b-41d4-a716-446655440001',
    '750e8400-e29b-41d4-a716-446655440001',
    '2025-04-30 17:00:00+00',
    ARRAY['microserviços', 'kubernetes', 'llm', 'produção']
),
(
    'Segurança e Compliance LGPD',
    'Implementação completa: AES-256, TLS 1.3, privacidade by design, auditoria logs imutáveis, WAF, DDoS protection, rate limiting por CPF, 2FA, pentest trimestral.',
    'pendente',
    'urgente',
    '550e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440001',
    '750e8400-e29b-41d4-a716-446655440001',
    '2025-05-15 17:00:00+00',
    ARRAY['segurança', 'lgpd', 'compliance', 'auditoria']
),

-- FASE 4: Otimizações (Economia R$ 59k/mês)
(
    'Cache Inteligente Redis + IA Híbrida',
    'Cache L1/L2/L3, redução 60% chamadas OpenAI. Modelos locais: LLaMA 3 70B (30%), Mistral 7B (40%). Auto-scaling preditivo ML. ROI: 500% em cache, 350% em IA híbrida.',
    'pendente',
    'media',
    '550e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440001',
    '750e8400-e29b-41d4-a716-446655440001',
    '2025-06-30 17:00:00+00',
    ARRAY['otimização', 'cache', 'ai-local', 'economia']
);

-- =====================================================
-- TAREFAS DO PROJETO JOCUM (Principais marcos)
-- =====================================================

INSERT INTO public.tarefas (
    titulo, 
    descricao, 
    status, 
    prioridade, 
    responsavel_id, 
    equipe_id, 
    projeto_id, 
    data_vencimento, 
    tags
) VALUES 
-- FASE 1: Análise (2 semanas)
(
    'Levantamento de Requisitos Jocum',
    'Atendimento multicanal (WhatsApp, VoIP, e-mail), gestão de pré-inscrições, agendamento reuniões online, gestão salas virtuais. Mapeamento 80+ bases Jocum, PostgreSQL centralizado.',
    'concluida',
    'alta',
    '550e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440001',
    '750e8400-e29b-41d4-a716-446655440002',
    '2024-12-15 17:00:00+00',
    ARRAY['requisitos', 'multicanal', 'jocum', 'mapeamento']
),

-- FASE 2: POC (30 dias)
(
    'POC - Agente SDK-LLM Básico',
    'Fluxo triagem e atendimento inicial, integração WhatsApp API, sistema VoIP, e-mail. Gestão pré-inscrições beta com Google Sheets. Painel React para métricas básicas (tempo resposta, atendimentos).',
    'em_progresso',
    'alta',
    '550e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440001',
    '750e8400-e29b-41d4-a716-446655440002',
    '2025-01-31 17:00:00+00',
    ARRAY['poc', 'sdk-llm', 'whatsapp', 'voip', 'beta']
),

-- FASE 3: Implementação Completa (4 meses)
(
    'Agente IA Escala Completa com Multi-LLM',
    'SDKs OpenAI GPT-4.1mini, Anthropic Claude 3.7 Sonnet Think, Gemini Flash 2.5. Fluxo conversacional personalizado, recomendação bases Jocum, automação pagamentos/pré-inscrição.',
    'pendente',
    'alta',
    '550e8400-e29b-41d4-a716-446655440003',
    '650e8400-e29b-41d4-a716-446655440001',
    '750e8400-e29b-41d4-a716-446655440002',
    '2025-04-30 17:00:00+00',
    ARRAY['ai-escala', 'multi-llm', 'conversacional', 'automação']
),
(
    'Sistema Avançado de Agendamento',
    'Integração robusta Google Calendar + Zoom, gestão automática limite participantes, envio convites/confirmação automática. Esquema PostgreSQL completo, CRUD robusto, backup automatizado.',
    'pendente',
    'media',
    '550e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440001',
    '750e8400-e29b-41d4-a716-446655440002',
    '2025-05-31 17:00:00+00',
    ARRAY['agendamento', 'calendar', 'zoom', 'postgresql']
),

-- FASE 4: Testes e Otimização
(
    'Testes de Escalabilidade - 50k atendimentos/dia',
    'Validação fluxos SDK-LLM, testes automações. Teste operacional 50.000 atendimentos/dia, ajuste cache Redis. Meta: 99.9% disponibilidade, 85% satisfação, <3s resposta, 60% resolução automática.',
    'pendente',
    'alta',
    '550e8400-e29b-41d4-a716-446655440003',
    '650e8400-e29b-41d4-a716-446655440001',
    '750e8400-e29b-41d4-a716-446655440002',
    '2025-06-15 17:00:00+00',
    ARRAY['testes', 'escalabilidade', '50k-dia', 'performance']
),

-- FASE 5: Implantação
(
    'Implantação Produção + Monitoramento 24/7',
    'Infraestrutura AWS/GCP final, autoscaling, implantação fases (Beta → Roll-out → Go-live). Stack Prometheus+Grafana+Loki, alertas Slack/Teams, suporte técnico 24/7.',
    'pendente',
    'urgente',
    '550e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440001',
    '750e8400-e29b-41d4-a716-446655440002',
    '2025-06-30 17:00:00+00',
    ARRAY['implantação', 'monitoramento', 'produção', '24x7']
);

-- =====================================================
-- EVENTOS DA TIMELINE PARA OS PROJETOS REAIS
-- =====================================================

INSERT INTO public.eventos_timeline (tipo, titulo, descricao, autor_id, equipe_id, metadata) VALUES
-- Palmas
('milestone', 'Palmas: Planejamento Aprovado', 'Análise de cenários concluída. Cenário Híbrido aprovado: R$ 450k CAPEX + R$ 45k/mês OPEX. ROI 30% ano 1.', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '{"projeto": "palmas", "fase": "planejamento", "orcamento": 2400000, "roi": "30%"}'),
('task', 'Palmas: POC Iniciada', 'Prova de conceito iniciada com arquitetura N8N. Meta: 5.000 cidadãos, 70% resolução automática.', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', '{"projeto": "palmas", "fase": "poc", "usuarios_meta": 5000, "resolucao_meta": "70%"}'),

-- Jocum  
('milestone', 'Jocum: Requisitos Mapeados', 'Levantamento completo: 80+ bases Jocum mapeadas. Arquitetura multi-LLM definida com 3 providers principais.', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', '{"projeto": "jocum", "fase": "requisitos", "bases_mapeadas": 80, "llm_providers": 3}'),
('task', 'Jocum: POC SDK-LLM', 'POC iniciada com integração WhatsApp + VoIP. Fluxo básico de triagem funcionando com múltiplos SDKs.', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', '{"projeto": "jocum", "fase": "poc", "canais": ["whatsapp", "voip", "email"], "sdk_integrados": ["openai", "anthropic", "gemini"]}');

-- =====================================================
-- ATUALIZAR MÉTRICAS COM DADOS REAIS DOS PROJETOS
-- =====================================================

-- Limpar métricas antigas
DELETE FROM public.metricas WHERE equipe_id = '650e8400-e29b-41d4-a716-446655440001';

-- Inserir métricas baseadas nos projetos reais
INSERT INTO public.metricas (equipe_id, usuario_id, tipo, data_referencia, tarefas_concluidas, horas_trabalhadas, eficiencia, projetos_ativos) VALUES
-- Ricardo Landim (liderando Palmas)
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'weekly', '2024-12-16', 3, 45, 92, 2),
-- Leonardo Candiani (liderando Jocum)  
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'weekly', '2024-12-16', 2, 40, 88, 1),
-- Rodrigo Marochi (support ambos)
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'weekly', '2024-12-16', 4, 38, 90, 2);

-- =====================================================
-- FINALIZAÇÃO
-- =====================================================
SELECT 'Projetos reais SixQuasar integrados com sucesso!' as status,
       'Palmas IA: R$ 2.4M, 10 meses, 350k habitantes' as projeto1,
       'Jocum SDK: R$ 625K, 6 meses, 50k atendimentos/dia' as projeto2;