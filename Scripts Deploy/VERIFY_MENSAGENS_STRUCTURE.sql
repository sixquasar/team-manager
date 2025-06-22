-- ================================================================
-- VERIFICAR ESTRUTURA EXATA DA TABELA MENSAGENS
-- ================================================================
-- Para entender os campos reais e ajustar o código
-- ================================================================

-- 1. Mostrar TODAS as colunas da tabela mensagens
SELECT 
    ordinal_position as ordem,
    column_name as coluna,
    data_type as tipo,
    is_nullable as permite_nulo,
    column_default as valor_padrao,
    character_maximum_length as tamanho_max
FROM information_schema.columns
WHERE table_name = 'mensagens'
ORDER BY ordinal_position;

-- 2. Verificar constraints
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'mensagens';

-- 3. Mostrar uma linha de exemplo (se existir)
SELECT * FROM mensagens LIMIT 1;

-- 4. Contar registros
SELECT COUNT(*) as total_mensagens FROM mensagens;

-- 5. Verificar valores únicos na coluna canal
SELECT DISTINCT canal, COUNT(*) as quantidade
FROM mensagens
GROUP BY canal
ORDER BY quantidade DESC;

-- 6. Testar insert com estrutura correta
-- IMPORTANTE: Ajuste os IDs conforme sua base
INSERT INTO mensagens (
    canal,  -- Usar 'canal' ao invés de 'canal_id'
    autor_id,
    equipe_id,
    conteudo
) VALUES (
    'general',
    (SELECT id FROM usuarios LIMIT 1),
    (SELECT id FROM equipes LIMIT 1),
    'Teste com campo canal correto - ' || NOW()::text
)
RETURNING *;

-- 7. Verificar últimas mensagens
SELECT 
    id,
    canal,
    conteudo,
    created_at
FROM mensagens
ORDER BY created_at DESC
LIMIT 5;