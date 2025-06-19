-- =====================================================
-- CORRIGIR PROJETOS EXISTENTES - SEM DUPLICAÇÃO
-- =====================================================

-- Primeiro, vamos verificar o que já existe
SELECT 'Projetos atuais:' as info;
SELECT id, nome, progresso, orcamento FROM public.projetos;

-- Atualizar projetos existentes com dados corretos
UPDATE public.projetos SET 
    nome = 'Sistema Palmas IA',
    descricao = 'Sistema de Inteligência Artificial para gestão municipal de Palmas - TO. Atendimento automatizado para 350.000 habitantes com processamento de 1M mensagens/mês.',
    status = 'em_progresso',
    progresso = 25,
    orcamento = 2400000.00,
    tecnologias = ARRAY['React', 'TypeScript', 'Python', 'OpenAI GPT-4', 'Claude 3', 'WhatsApp API', 'PostgreSQL', 'AWS', 'Kubernetes'],
    data_inicio = '2024-11-01',
    data_fim_prevista = '2025-09-30',
    updated_at = NOW()
WHERE id = '750e8400-e29b-41d4-a716-446655440001';

UPDATE public.projetos SET 
    nome = 'Automação Jocum',
    descricao = 'SDK Multi-LLM para automação de processos da Jocum. Sistema inteligente com integração de múltiplos modelos de IA para otimização de workflows.',
    status = 'em_progresso',
    progresso = 15,
    orcamento = 625000.00,
    tecnologias = ARRAY['Python', 'LangChain', 'OpenAI GPT-4', 'Claude 3', 'Gemini Pro', 'Node.js', 'TypeScript', 'Redis', 'Docker'],
    data_inicio = '2024-12-01',
    data_fim_prevista = '2025-06-30',
    updated_at = NOW()
WHERE id = '750e8400-e29b-41d4-a716-446655440002';

-- Se não existir o segundo projeto, inserir
INSERT INTO public.projetos (id, nome, descricao, status, responsavel_id, equipe_id, data_inicio, data_fim_prevista, progresso, orcamento, tecnologias)
SELECT 
    '750e8400-e29b-41d4-a716-446655440002',
    'Automação Jocum',
    'SDK Multi-LLM para automação de processos da Jocum. Sistema inteligente com integração de múltiplos modelos de IA para otimização de workflows.',
    'em_progresso',
    '550e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440001',
    '2024-12-01',
    '2025-06-30',
    15,
    625000.00,
    ARRAY['Python', 'LangChain', 'OpenAI GPT-4', 'Claude 3', 'Gemini Pro', 'Node.js', 'TypeScript', 'Redis', 'Docker']
WHERE NOT EXISTS (
    SELECT 1 FROM public.projetos WHERE id = '750e8400-e29b-41d4-a716-446655440002'
);

-- Verificar resultado final
SELECT 'Projetos atualizados:' as info;
SELECT id, nome, progresso, orcamento, status FROM public.projetos;

SELECT 'Atualização concluída com sucesso!' as status;