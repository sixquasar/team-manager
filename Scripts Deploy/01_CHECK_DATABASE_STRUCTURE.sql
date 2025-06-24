-- ================================================================
-- SCRIPT 1: VERIFICAR ESTRUTURA DO BANCO
-- Execute este PRIMEIRO para entender o estado atual
-- ================================================================

-- 1. Listar todas as tabelas existentes
SELECT 
    tablename as "Tabela",
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as "Tamanho"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Verificar estrutura da tabela usuarios (se existir)
SELECT 
    '=== ESTRUTURA DA TABELA USUARIOS ===' as info;
    
SELECT 
    column_name as "Coluna",
    data_type as "Tipo",
    character_maximum_length as "Tamanho",
    is_nullable as "Pode ser NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- 3. Verificar se tabela equipes existe
SELECT 
    '=== TABELA EQUIPES ===' as info;
    
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'equipes')
        THEN 'Tabela equipes EXISTE'
        ELSE 'Tabela equipes NÃO EXISTE - precisa ser criada'
    END as status;

-- 4. Verificar se tabela projetos existe
SELECT 
    '=== TABELA PROJETOS ===' as info;
    
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projetos')
        THEN 'Tabela projetos EXISTE'
        ELSE 'Tabela projetos NÃO EXISTE - precisa ser criada'
    END as status;

-- 5. Verificar se tabela propostas existe
SELECT 
    '=== TABELA PROPOSTAS ===' as info;
    
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'propostas')
        THEN 'Tabela propostas EXISTE'
        ELSE 'Tabela propostas NÃO EXISTE - precisa ser criada'
    END as status;

-- 6. Verificar usuários existentes
SELECT 
    '=== USUÁRIOS CADASTRADOS ===' as info;
    
SELECT 
    id,
    email,
    COALESCE(nome, 'SEM NOME') as nome,
    COALESCE(tipo, 'SEM TIPO') as tipo
FROM usuarios
ORDER BY email;

-- ================================================================
-- RESULTADO: 
-- Este script mostra o estado atual do banco
-- Use estas informações para decidir qual script executar depois
-- ================================================================