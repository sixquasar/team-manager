-- ================================================================
-- CRIAR TABELA CONFIGURACOES_USUARIO PARA PÁGINA SETTINGS
-- ================================================================
-- Erro: relation "public.configuracoes_usuario" does not exist
-- Solução: Criar tabela que armazena configurações do usuário
-- ================================================================

-- Criar tabela configuracoes_usuario
CREATE TABLE IF NOT EXISTS configuracoes_usuario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL,
    configuracoes JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que cada usuário tenha apenas uma entrada de configurações
    CONSTRAINT unique_usuario_configuracoes UNIQUE (usuario_id)
);

-- Criar índice para busca rápida por usuário
CREATE INDEX IF NOT EXISTS idx_configuracoes_usuario_id ON configuracoes_usuario(usuario_id);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_configuracoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger na tabela
DROP TRIGGER IF EXISTS update_configuracoes_usuario_updated_at ON configuracoes_usuario;
CREATE TRIGGER update_configuracoes_usuario_updated_at 
    BEFORE UPDATE ON configuracoes_usuario 
    FOR EACH ROW 
    EXECUTE FUNCTION update_configuracoes_updated_at();

-- Popular com configurações padrão para usuários existentes
INSERT INTO configuracoes_usuario (usuario_id, configuracoes)
SELECT 
    id as usuario_id,
    jsonb_build_object(
        'theme', 'system',
        'language', 'pt-BR',
        'timezone', 'America/Sao_Paulo',
        'emailNotifications', true,
        'pushNotifications', true,
        'soundEnabled', true,
        'taskNotifications', true,
        'projectNotifications', true,
        'projectUpdates', true,
        'mentions', true,
        'deadlines', true,
        'digestFrequency', 'daily',
        'showOfflineMembers', true,
        'compactMode', false,
        'showTaskLabels', true,
        'autoPlayVideos', false,
        'highContrast', false,
        'twoFactorEnabled', false,
        'sessionTimeout', 30,
        'passwordExpiry', 90,
        'dataRetention', 365,
        'allowAnalytics', true,
        'shareUsageData', false,
        'exportFormat', 'xlsx'
    ) as configuracoes
FROM usuarios
WHERE NOT EXISTS (
    SELECT 1 FROM configuracoes_usuario 
    WHERE configuracoes_usuario.usuario_id = usuarios.id
);

-- Desabilitar RLS para evitar problemas de acesso
ALTER TABLE configuracoes_usuario DISABLE ROW LEVEL SECURITY;

-- Verificar criação
SELECT 
    'Tabela configuracoes_usuario criada com sucesso!' as status,
    COUNT(*) as total_configuracoes,
    COUNT(DISTINCT usuario_id) as usuarios_com_configuracoes
FROM configuracoes_usuario;

-- Mostrar estrutura da tabela
SELECT 
    column_name as coluna,
    data_type as tipo,
    is_nullable as permite_nulo,
    column_default as valor_padrao
FROM information_schema.columns
WHERE table_name = 'configuracoes_usuario'
ORDER BY ordinal_position;