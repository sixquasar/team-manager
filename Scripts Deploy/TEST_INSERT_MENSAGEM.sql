-- ================================================================
-- TESTE DE INSERT NA TABELA MENSAGENS
-- ================================================================
-- Para verificar se a estrutura está correta e permite inserts
-- ================================================================

-- 1. Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'mensagens'
ORDER BY ordinal_position;

-- 2. Verificar se existem registros
SELECT COUNT(*) as total_mensagens FROM mensagens;

-- 3. Buscar IDs válidos para teste
SELECT 
    'IDs disponíveis para teste:' as info,
    (SELECT id FROM usuarios LIMIT 1) as usuario_id_exemplo,
    (SELECT id FROM equipes LIMIT 1) as equipe_id_exemplo;

-- 4. Fazer insert de teste (AJUSTE OS IDs CONFORME NECESSÁRIO)
INSERT INTO mensagens (
    canal_id,
    autor_id,
    equipe_id,
    conteudo,
    created_at
) VALUES (
    'general',
    (SELECT id FROM usuarios LIMIT 1), -- Pega primeiro usuário
    (SELECT id FROM equipes LIMIT 1),   -- Pega primeira equipe
    'Mensagem de teste inserida via SQL direto',
    NOW()
);

-- 5. Verificar se foi inserida
SELECT 
    id,
    canal_id,
    conteudo,
    created_at
FROM mensagens
ORDER BY created_at DESC
LIMIT 5;

-- 6. Testar query que o app usa
SELECT *
FROM mensagens
WHERE equipe_id = (SELECT id FROM equipes LIMIT 1)
ORDER BY created_at DESC
LIMIT 10;