-- ================================================================
-- CORRIGIR ESTRUTURA DA TABELA MENSAGENS
-- ================================================================
-- Erro: column "canal_id" does not exist
-- Solução: Adicionar colunas faltantes se não existirem
-- ================================================================

-- PASSO 1: Verificar estrutura atual da tabela mensagens
SELECT 
    'Estrutura atual da tabela mensagens:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'mensagens'
ORDER BY ordinal_position;

-- PASSO 2: Adicionar colunas faltantes (se não existirem)
ALTER TABLE mensagens ADD COLUMN IF NOT EXISTS canal_id VARCHAR(100) DEFAULT 'general';
ALTER TABLE mensagens ADD COLUMN IF NOT EXISTS autor_id UUID;
ALTER TABLE mensagens ADD COLUMN IF NOT EXISTS equipe_id UUID;
ALTER TABLE mensagens ADD COLUMN IF NOT EXISTS conteudo TEXT;
ALTER TABLE mensagens ADD COLUMN IF NOT EXISTS editado BOOLEAN DEFAULT FALSE;
ALTER TABLE mensagens ADD COLUMN IF NOT EXISTS fixado BOOLEAN DEFAULT FALSE;
ALTER TABLE mensagens ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- PASSO 3: Criar índices (se não existirem)
CREATE INDEX IF NOT EXISTS idx_mensagens_canal ON mensagens (canal_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_autor ON mensagens (autor_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_equipe ON mensagens (equipe_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_created ON mensagens (created_at DESC);

-- PASSO 4: Criar tabela canais (se não existir)
CREATE TABLE IF NOT EXISTS canais (
    id VARCHAR(100) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'public' CHECK (tipo IN ('public', 'private', 'direct')),
    descricao TEXT,
    equipe_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 5: Criar índice para canais
CREATE INDEX IF NOT EXISTS idx_canais_equipe ON canais (equipe_id);

-- PASSO 6: Inserir canais padrão (se não existirem)
INSERT INTO canais (id, nome, tipo, descricao, equipe_id)
SELECT DISTINCT
    'general',
    'Geral',
    'public',
    'Canal principal para conversas gerais',
    equipe_id
FROM mensagens
WHERE equipe_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Se não houver equipes na tabela mensagens, usar tabela equipes
INSERT INTO canais (id, nome, tipo, descricao, equipe_id)
SELECT 
    'general',
    'Geral',
    'public',
    'Canal principal para conversas gerais',
    id as equipe_id
FROM equipes
WHERE NOT EXISTS (
    SELECT 1 FROM canais WHERE id = 'general'
);

-- PASSO 7: Atualizar mensagens existentes sem canal_id
UPDATE mensagens 
SET canal_id = 'general'
WHERE canal_id IS NULL;

-- PASSO 8: Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_mensagens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.editado = TRUE;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_mensagens_updated_at ON mensagens;
CREATE TRIGGER update_mensagens_updated_at 
    BEFORE UPDATE ON mensagens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_mensagens_updated_at();

-- PASSO 9: Desabilitar RLS
ALTER TABLE mensagens DISABLE ROW LEVEL SECURITY;
ALTER TABLE canais DISABLE ROW LEVEL SECURITY;

-- PASSO 10: Verificar resultado
SELECT 
    'Estrutura corrigida!' as status,
    COUNT(*) as total_mensagens,
    COUNT(DISTINCT canal_id) as canais_usados,
    COUNT(DISTINCT equipe_id) as equipes_com_mensagens
FROM mensagens;

-- Mostrar estrutura final
SELECT 
    'Estrutura final da tabela mensagens:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'mensagens'
ORDER BY ordinal_position;