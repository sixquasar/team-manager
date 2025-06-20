-- ================================================================
-- SQL: TAREFAS A PARTIR DE HOJE COM PROJETOS ATIVOS
-- Descrição: Busca todas as tarefas de hoje em diante vinculadas 
--           a projetos com status ativo (em_progresso)
-- Data: 20/06/2025
-- Projeto: Team Manager SixQuasar
-- ================================================================

-- Consulta principal: Tarefas de hoje em diante com projetos ativos
SELECT 
    -- Informações da Tarefa
    t.id as tarefa_id,
    t.titulo as tarefa_titulo,
    t.descricao as tarefa_descricao,
    t.status as tarefa_status,
    t.prioridade as tarefa_prioridade,
    t.data_inicio as tarefa_data_inicio,
    t.data_fim_prevista as tarefa_data_fim_prevista,
    t.data_conclusao as tarefa_data_conclusao,
    t.progresso as tarefa_progresso,
    t.horas_estimadas as tarefa_horas_estimadas,
    t.horas_trabalhadas as tarefa_horas_trabalhadas,
    
    -- Informações do Projeto
    p.id as projeto_id,
    p.nome as projeto_nome,
    p.descricao as projeto_descricao,
    p.status as projeto_status,
    p.data_inicio as projeto_data_inicio,
    p.data_fim_prevista as projeto_data_fim_prevista,
    p.orcamento as projeto_orcamento,
    p.progresso as projeto_progresso,
    
    -- Informações do Responsável da Tarefa
    u_tarefa.nome as responsavel_tarefa_nome,
    u_tarefa.email as responsavel_tarefa_email,
    u_tarefa.cargo as responsavel_tarefa_cargo,
    
    -- Informações do Responsável do Projeto
    u_projeto.nome as responsavel_projeto_nome,
    u_projeto.email as responsavel_projeto_email,
    u_projeto.cargo as responsavel_projeto_cargo,
    
    -- Informações da Equipe
    e.nome as equipe_nome,
    e.descricao as equipe_descricao,
    
    -- Métricas e Cálculos
    CASE 
        WHEN t.data_fim_prevista < CURRENT_DATE THEN 'ATRASADA'
        WHEN t.data_fim_prevista = CURRENT_DATE THEN 'VENCE_HOJE'
        WHEN t.data_fim_prevista <= CURRENT_DATE + INTERVAL '7 days' THEN 'PROXIMA_SEMANA'
        ELSE 'NO_PRAZO'
    END as situacao_prazo,
    
    -- Dias restantes (negativo se atrasado)
    (t.data_fim_prevista - CURRENT_DATE) as dias_restantes,
    
    -- Tempo criado
    DATE_PART('day', CURRENT_TIMESTAMP - t.created_at) as dias_desde_criacao,
    
    -- Timestamps
    t.created_at as tarefa_criada_em,
    t.updated_at as tarefa_atualizada_em,
    p.created_at as projeto_criado_em

FROM tarefas t
INNER JOIN projetos p ON t.projeto_id = p.id
INNER JOIN usuarios u_tarefa ON t.responsavel_id = u_tarefa.id
INNER JOIN usuarios u_projeto ON p.responsavel_id = u_projeto.id
INNER JOIN equipes e ON p.equipe_id = e.id

WHERE 
    -- Filtros de Data: Tarefas a partir de hoje
    (
        t.data_inicio >= CURRENT_DATE 
        OR t.data_fim_prevista >= CURRENT_DATE
        OR t.status NOT IN ('concluida', 'cancelada')
    )
    
    -- Filtros de Status: Apenas projetos ativos
    AND p.status IN ('em_progresso', 'planejamento')
    
    -- Filtros de Status: Tarefas não concluídas/canceladas
    AND t.status NOT IN ('concluida', 'cancelada')
    
    -- Filtros de Validação: Dados não nulos
    AND t.titulo IS NOT NULL
    AND p.nome IS NOT NULL

ORDER BY 
    -- Ordenação por prioridade e prazo
    CASE t.prioridade 
        WHEN 'urgente' THEN 1
        WHEN 'alta' THEN 2  
        WHEN 'media' THEN 3
        WHEN 'baixa' THEN 4
        ELSE 5
    END,
    t.data_fim_prevista ASC,
    p.nome,
    t.titulo;

-- ================================================================
-- CONSULTA RESUMIDA: CONTADORES POR STATUS E PRIORIDADE
-- ================================================================

SELECT 
    'RESUMO GERAL' as tipo_relatorio,
    
    -- Contadores por Status da Tarefa
    COUNT(*) as total_tarefas,
    COUNT(CASE WHEN t.status = 'pendente' THEN 1 END) as tarefas_pendentes,
    COUNT(CASE WHEN t.status = 'em_andamento' THEN 1 END) as tarefas_em_andamento,
    COUNT(CASE WHEN t.status = 'aguardando' THEN 1 END) as tarefas_aguardando,
    COUNT(CASE WHEN t.status = 'revisao' THEN 1 END) as tarefas_em_revisao,
    
    -- Contadores por Prioridade
    COUNT(CASE WHEN t.prioridade = 'urgente' THEN 1 END) as tarefas_urgentes,
    COUNT(CASE WHEN t.prioridade = 'alta' THEN 1 END) as tarefas_alta_prioridade,
    COUNT(CASE WHEN t.prioridade = 'media' THEN 1 END) as tarefas_media_prioridade,
    COUNT(CASE WHEN t.prioridade = 'baixa' THEN 1 END) as tarefas_baixa_prioridade,
    
    -- Contadores por Situação de Prazo
    COUNT(CASE WHEN t.data_fim_prevista < CURRENT_DATE THEN 1 END) as tarefas_atrasadas,
    COUNT(CASE WHEN t.data_fim_prevista = CURRENT_DATE THEN 1 END) as tarefas_vencem_hoje,
    COUNT(CASE WHEN t.data_fim_prevista <= CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as tarefas_proxima_semana,
    
    -- Métricas de Progresso
    ROUND(AVG(t.progresso), 2) as progresso_medio_tarefas,
    ROUND(AVG(p.progresso), 2) as progresso_medio_projetos,
    
    -- Contadores por Projeto
    COUNT(DISTINCT p.id) as projetos_com_tarefas_ativas

FROM tarefas t
INNER JOIN projetos p ON t.projeto_id = p.id
WHERE 
    (
        t.data_inicio >= CURRENT_DATE 
        OR t.data_fim_prevista >= CURRENT_DATE
        OR t.status NOT IN ('concluida', 'cancelada')
    )
    AND p.status IN ('em_progresso', 'planejamento')
    AND t.status NOT IN ('concluida', 'cancelada');

-- ================================================================
-- CONSULTA POR EQUIPE: BREAKDOWN POR EQUIPE
-- ================================================================

SELECT 
    e.nome as equipe,
    COUNT(*) as total_tarefas_equipe,
    COUNT(DISTINCT p.id) as projetos_ativos_equipe,
    COUNT(DISTINCT u_tarefa.id) as usuarios_com_tarefas,
    
    -- Tarefas por prioridade
    COUNT(CASE WHEN t.prioridade = 'urgente' THEN 1 END) as urgentes,
    COUNT(CASE WHEN t.prioridade = 'alta' THEN 1 END) as altas,
    COUNT(CASE WHEN t.prioridade = 'media' THEN 1 END) as medias,
    COUNT(CASE WHEN t.prioridade = 'baixa' THEN 1 END) as baixas,
    
    -- Métricas
    ROUND(AVG(t.progresso), 2) as progresso_medio,
    SUM(t.horas_estimadas) as total_horas_estimadas,
    SUM(t.horas_trabalhadas) as total_horas_trabalhadas

FROM tarefas t
INNER JOIN projetos p ON t.projeto_id = p.id
INNER JOIN usuarios u_tarefa ON t.responsavel_id = u_tarefa.id
INNER JOIN equipes e ON p.equipe_id = e.id

WHERE 
    (
        t.data_inicio >= CURRENT_DATE 
        OR t.data_fim_prevista >= CURRENT_DATE
        OR t.status NOT IN ('concluida', 'cancelada')
    )
    AND p.status IN ('em_progresso', 'planejamento')
    AND t.status NOT IN ('concluida', 'cancelada')

GROUP BY e.id, e.nome
ORDER BY total_tarefas_equipe DESC;

-- ================================================================
-- CONSULTA DE ALERTAS: TAREFAS CRÍTICAS
-- ================================================================

SELECT 
    'ALERTA' as tipo,
    t.titulo as tarefa,
    p.nome as projeto,
    u_tarefa.nome as responsavel,
    t.data_fim_prevista as prazo,
    (t.data_fim_prevista - CURRENT_DATE) as dias_restantes,
    t.prioridade,
    t.progresso,
    
    CASE 
        WHEN t.data_fim_prevista < CURRENT_DATE THEN '🚨 ATRASADA'
        WHEN t.data_fim_prevista = CURRENT_DATE THEN '⚠️ VENCE HOJE'
        WHEN t.data_fim_prevista <= CURRENT_DATE + INTERVAL '3 days' AND t.prioridade = 'urgente' THEN '🔥 URGENTE - 3 DIAS'
        WHEN t.progresso < 50 AND t.data_fim_prevista <= CURRENT_DATE + INTERVAL '7 days' THEN '📈 PROGRESSO BAIXO'
        ELSE '✅ OK'
    END as alerta

FROM tarefas t
INNER JOIN projetos p ON t.projeto_id = p.id
INNER JOIN usuarios u_tarefa ON t.responsavel_id = u_tarefa.id

WHERE 
    p.status IN ('em_progresso', 'planejamento')
    AND t.status NOT IN ('concluida', 'cancelada')
    AND (
        t.data_fim_prevista <= CURRENT_DATE + INTERVAL '7 days'
        OR t.prioridade = 'urgente'
        OR (t.progresso < 50 AND t.data_fim_prevista <= CURRENT_DATE + INTERVAL '14 days')
    )

ORDER BY 
    CASE 
        WHEN t.data_fim_prevista < CURRENT_DATE THEN 1
        WHEN t.data_fim_prevista = CURRENT_DATE THEN 2
        WHEN t.prioridade = 'urgente' THEN 3
        ELSE 4
    END,
    t.data_fim_prevista ASC;