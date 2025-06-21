-- ================================================================
-- VERIFICAÇÃO COMPLETA DE ALINHAMENTO SUPABASE vs CÓDIGO
-- Conforme seção "ALINHAMENTO OBRIGATÓRIO" do CLAUDE.md
-- ================================================================

-- 🔍 VERIFICAR ESTRUTURA DE TODAS AS TABELAS USADAS PELOS HOOKS

-- ===============================
-- 1. VERIFICAR TABELA: usuarios
-- ===============================
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===============================
-- 2. VERIFICAR TABELA: equipes  
-- ===============================
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'equipes' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===============================
-- 3. VERIFICAR TABELA: tarefas
-- ===============================
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'tarefas' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===============================
-- 4. VERIFICAR TABELA: projetos
-- ===============================
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'projetos' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===============================
-- 5. VERIFICAR TABELA: eventos_timeline
-- ===============================
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'eventos_timeline' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===============================
-- 6. VERIFICAR TABELA: mensagens
-- ===============================
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'mensagens' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===============================
-- 7. VERIFICAR TABELA: usuario_equipes
-- ===============================
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuario_equipes' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===============================
-- 8. VERIFICAR FOREIGN KEYS
-- ===============================
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ===============================
-- 9. VERIFICAR DADOS DE EXEMPLO
-- ===============================

-- Contar registros em cada tabela
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'equipes' as tabela, COUNT(*) as total FROM equipes  
UNION ALL
SELECT 'tarefas' as tabela, COUNT(*) as total FROM tarefas
UNION ALL
SELECT 'projetos' as tabela, COUNT(*) as total FROM projetos
UNION ALL
SELECT 'eventos_timeline' as tabela, COUNT(*) as total FROM eventos_timeline
UNION ALL
SELECT 'mensagens' as tabela, COUNT(*) as total FROM mensagens
UNION ALL
SELECT 'usuario_equipes' as tabela, COUNT(*) as total FROM usuario_equipes
ORDER BY tabela;

-- ===============================
-- 10. VERIFICAR CONSISTÊNCIA DOS HOOKS
-- ===============================

-- Verificar se use-tasks.ts está alinhado com tabela tarefas
-- Campos esperados: id, titulo, descricao, status, prioridade, responsavel_id, data_vencimento, data_conclusao, tags, created_at

-- Verificar se use-projects.ts está alinhado com tabela projetos  
-- Campos esperados: id, nome, descricao, status, responsavel_id, data_inicio, data_fim_prevista, orcamento, progresso, tecnologias, equipe_id, created_at

-- Verificar se use-timeline.ts está alinhado com tabela eventos_timeline
-- Campos esperados: id, tipo, titulo, descricao, autor_id, equipe_id, timestamp, projeto, metadata, created_at

-- ===============================
-- 11. STATUS FINAL
-- ===============================
SELECT 
  'VERIFICAÇÃO COMPLETA EXECUTADA' as status,
  NOW() as timestamp,
  'Verificar output acima para identificar desalinhamentos' as instrucoes;