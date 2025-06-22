-- ================================================================
-- ADICIONAR CAMPOS PARA AUTENTICAÇÃO DE DOIS FATORES
-- ================================================================
-- Adiciona campos necessários para suportar 2FA na tabela usuarios
-- ================================================================

-- Adicionar campos 2FA na tabela usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS two_factor_backup_codes TEXT[];
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS two_factor_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar tabela para log de atividades de segurança
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    INDEX idx_security_logs_usuario (usuario_id),
    INDEX idx_security_logs_action (action),
    INDEX idx_security_logs_created (created_at DESC)
);

-- Criar tabela para sessões ativas (para gerenciamento de dispositivos)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    INDEX idx_user_sessions_usuario (usuario_id),
    INDEX idx_user_sessions_token (session_token),
    INDEX idx_user_sessions_expires (expires_at)
);

-- Adicionar configurações de segurança ao JSONB de configuracoes_usuario
UPDATE configuracoes_usuario
SET configuracoes = configuracoes || jsonb_build_object(
    'security', jsonb_build_object(
        'twoFactorEnabled', false,
        'sessionTimeout', 30,
        'passwordExpiry', 90,
        'requireStrongPassword', true,
        'loginNotifications', true,
        'suspiciousActivityAlerts', true
    )
)
WHERE configuracoes->>'security' IS NULL;

-- Desabilitar RLS nas novas tabelas
ALTER TABLE security_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;

-- Criar função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Verificar resultado
SELECT 
    'Campos 2FA adicionados com sucesso!' as status,
    COUNT(*) as total_usuarios,
    COUNT(two_factor_enabled) as usuarios_com_campo_2fa
FROM usuarios;

-- Mostrar estrutura atualizada
SELECT 
    column_name as coluna,
    data_type as tipo,
    is_nullable as permite_nulo
FROM information_schema.columns
WHERE table_name = 'usuarios'
AND column_name IN (
    'two_factor_enabled', 
    'two_factor_secret', 
    'two_factor_backup_codes',
    'two_factor_verified_at',
    'last_password_change'
)
ORDER BY column_name;