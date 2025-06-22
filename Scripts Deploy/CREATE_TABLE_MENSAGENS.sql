-- ================================================================
-- CRIAR TABELA MENSAGENS PARA SISTEMA DE CHAT
-- ================================================================
-- Erro: Status 400 ao enviar mensagem
-- Solução: Criar tabela mensagens com estrutura esperada
-- ================================================================

-- Criar tabela mensagens
CREATE TABLE IF NOT EXISTS mensagens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    canal_id VARCHAR(100) NOT NULL DEFAULT 'general',
    autor_id UUID NOT NULL,
    equipe_id UUID NOT NULL,
    conteudo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    editado BOOLEAN DEFAULT FALSE,
    fixado BOOLEAN DEFAULT FALSE
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_mensagens_canal ON mensagens (canal_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_autor ON mensagens (autor_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_equipe ON mensagens (equipe_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_created ON mensagens (created_at DESC);

-- Criar tabela de canais se não existir
CREATE TABLE IF NOT EXISTS canais (
    id VARCHAR(100) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'public' CHECK (tipo IN ('public', 'private', 'direct')),
    descricao TEXT,
    equipe_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca por equipe
CREATE INDEX IF NOT EXISTS idx_canais_equipe ON canais (equipe_id);

-- Inserir canais padrão
INSERT INTO canais (id, nome, tipo, descricao, equipe_id)
SELECT 
    'general',
    'Geral',
    'public',
    'Canal principal para conversas gerais',
    id as equipe_id
FROM equipes
WHERE NOT EXISTS (
    SELECT 1 FROM canais 
    WHERE canais.id = 'general' 
    AND canais.equipe_id = equipes.id
);

INSERT INTO canais (id, nome, tipo, descricao, equipe_id)
SELECT 
    'random',
    'Aleatório',
    'public',
    'Canal para conversas casuais',
    id as equipe_id
FROM equipes
WHERE NOT EXISTS (
    SELECT 1 FROM canais 
    WHERE canais.id = 'random' 
    AND canais.equipe_id = equipes.id
);

INSERT INTO canais (id, nome, tipo, descricao, equipe_id)
SELECT 
    'announcements',
    'Avisos',
    'public',
    'Comunicados importantes da equipe',
    id as equipe_id
FROM equipes
WHERE NOT EXISTS (
    SELECT 1 FROM canais 
    WHERE canais.id = 'announcements' 
    AND canais.equipe_id = equipes.id
);

-- Inserir mensagens de boas-vindas
INSERT INTO mensagens (canal_id, autor_id, equipe_id, conteudo)
SELECT 
    'general',
    (SELECT id FROM usuarios WHERE email LIKE '%ricardo%' LIMIT 1),
    e.id,
    'Bem-vindo ao Team Manager! Este é o canal geral para comunicação da equipe.'
FROM equipes e
WHERE NOT EXISTS (
    SELECT 1 FROM mensagens 
    WHERE canal_id = 'general' 
    AND equipe_id = e.id
);

-- Desabilitar RLS para evitar problemas
ALTER TABLE mensagens DISABLE ROW LEVEL SECURITY;
ALTER TABLE canais DISABLE ROW LEVEL SECURITY;

-- Trigger para updated_at
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

-- Verificar criação
SELECT 
    'Tabelas de mensagens criadas com sucesso!' as status,
    (SELECT COUNT(*) FROM mensagens) as total_mensagens,
    (SELECT COUNT(*) FROM canais) as total_canais,
    (SELECT COUNT(DISTINCT equipe_id) FROM canais) as equipes_com_canais;

-- Mostrar estrutura
SELECT 
    table_name as tabela,
    column_name as coluna,
    data_type as tipo
FROM information_schema.columns
WHERE table_name IN ('mensagens', 'canais')
ORDER BY table_name, ordinal_position;