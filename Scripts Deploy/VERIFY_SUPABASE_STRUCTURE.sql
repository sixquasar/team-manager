-- ================================================================
-- VERIFICAR ESTRUTURA DO SUPABASE PARA DASHBOARD IA
-- Execute este SQL no Supabase SQL Editor
-- Data: 22/06/2025
-- ================================================================

-- 1. VERIFICAR ESTRUTURA DA TABELA PROJETOS
-- ================================================================
SELECT '=== ESTRUTURA TABELA PROJETOS ===' as info;
SELECT 
    column_name as "Campo", 
    data_type as "Tipo",
    is_nullable as "Permite NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns 
WHERE table_name = 'projetos' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR ESTRUTURA DA TABELA USUARIOS
-- ================================================================
SELECT '=== ESTRUTURA TABELA USUARIOS ===' as info;
SELECT 
    column_name as "Campo", 
    data_type as "Tipo",
    is_nullable as "Permite NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VERIFICAR SE EXISTE TABELA TAREFAS
-- ================================================================
SELECT '=== VERIFICANDO TABELA TAREFAS ===' as info;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'tarefas' AND table_schema = 'public'
        ) 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as "Tabela Tarefas";

-- Se existir, mostrar estrutura
SELECT 
    column_name as "Campo", 
    data_type as "Tipo"
FROM information_schema.columns 
WHERE table_name = 'tarefas' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. VERIFICAR TABELAS FINANCEIRAS
-- ================================================================
SELECT '=== TABELAS FINANCEIRAS DISPONÍVEIS ===' as info;
SELECT table_name as "Tabela Financeira"
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND (
        table_name LIKE '%financ%' 
        OR table_name LIKE '%invoice%' 
        OR table_name LIKE '%payment%'
        OR table_name LIKE '%receita%'
        OR table_name LIKE '%despesa%'
        OR table_name LIKE '%fatura%'
        OR table_name LIKE '%pagamento%'
    )
ORDER BY table_name;

-- 5. CONTAGEM DE REGISTROS
-- ================================================================
SELECT '=== VOLUME DE DADOS ===' as info;
SELECT 
    'projetos' as "Tabela", 
    COUNT(*) as "Total de Registros"
FROM projetos
UNION ALL
SELECT 
    'usuarios' as "Tabela", 
    COUNT(*) as "Total de Registros"
FROM usuarios
UNION ALL
SELECT 
    'equipes' as "Tabela", 
    COUNT(*) as "Total de Registros"
FROM equipes;

-- 6. AMOSTRA DE DADOS - PROJETOS
-- ================================================================
SELECT '=== AMOSTRA DE 3 PROJETOS ===' as info;
SELECT 
    id,
    nome,
    status,
    progresso,
    orcamento,
    data_inicio,
    data_fim_prevista,
    created_at
FROM projetos 
LIMIT 3;

-- 7. DISTRIBUIÇÃO DE STATUS DOS PROJETOS
-- ================================================================
SELECT '=== PROJETOS POR STATUS ===' as info;
SELECT 
    COALESCE(status, 'sem_status') as "Status", 
    COUNT(*) as "Quantidade",
    ROUND(AVG(COALESCE(progresso, 0)), 2) as "Progresso Médio %"
FROM projetos 
GROUP BY status
ORDER BY COUNT(*) DESC;

-- 8. ANÁLISE DE DATAS DOS PROJETOS
-- ================================================================
SELECT '=== ANÁLISE DE DATAS ===' as info;
SELECT 
    COUNT(*) FILTER (WHERE data_fim_prevista < CURRENT_DATE AND status != 'finalizado') as "Projetos Atrasados",
    COUNT(*) FILTER (WHERE data_fim_prevista >= CURRENT_DATE AND data_fim_prevista <= CURRENT_DATE + INTERVAL '30 days') as "Vencem em 30 dias",
    COUNT(*) FILTER (WHERE data_inicio IS NULL) as "Sem Data Início",
    COUNT(*) FILTER (WHERE data_fim_prevista IS NULL) as "Sem Data Fim"
FROM projetos;

-- 9. ANÁLISE FINANCEIRA DOS PROJETOS
-- ================================================================
SELECT '=== ANÁLISE FINANCEIRA ===' as info;
SELECT 
    COUNT(*) as "Total Projetos com Orçamento",
    SUM(COALESCE(orcamento, 0))::money as "Orçamento Total",
    AVG(COALESCE(orcamento, 0))::money as "Orçamento Médio",
    MIN(COALESCE(orcamento, 0))::money as "Menor Orçamento",
    MAX(COALESCE(orcamento, 0))::money as "Maior Orçamento"
FROM projetos
WHERE orcamento IS NOT NULL AND orcamento > 0;

-- 10. VERIFICAR CAMPOS IMPORTANTES PARA DASHBOARD
-- ================================================================
SELECT '=== CAMPOS CRÍTICOS PARA DASHBOARD IA ===' as info;
SELECT 
    'projetos.status' as "Campo Necessário",
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projetos' AND column_name = 'status'
    ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as "Status"
UNION ALL
SELECT 
    'projetos.progresso' as "Campo Necessário",
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projetos' AND column_name = 'progresso'
    ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END
UNION ALL
SELECT 
    'projetos.orcamento' as "Campo Necessário",
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projetos' AND column_name = 'orcamento'
    ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END
UNION ALL
SELECT 
    'projetos.data_fim_prevista' as "Campo Necessário",
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projetos' AND column_name = 'data_fim_prevista'
    ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END;

-- ================================================================
-- FIM DA VERIFICAÇÃO
-- Analise os resultados acima antes de implementar o Dashboard IA
-- ================================================================