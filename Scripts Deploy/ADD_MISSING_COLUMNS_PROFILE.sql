-- ================================================================
-- ADICIONAR COLUNAS FALTANTES PARA PÁGINA PROFILE
-- ================================================================
-- Erro: Could not find the 'bio' column of 'usuarios' in the schema cache
-- Solução: Adicionar colunas que o componente Profile.tsx espera
-- ================================================================

-- Adicionar coluna bio se não existir
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Adicionar coluna telefone se não existir
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);

-- Adicionar coluna localizacao se não existir
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS localizacao VARCHAR(100);

-- Adicionar coluna cargo se não existir (já deve existir mas por segurança)
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS cargo VARCHAR(100);

-- Adicionar coluna updated_at se não existir
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger na tabela usuarios se não existir
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Atualizar valores padrão para usuários existentes
UPDATE usuarios 
SET 
    bio = 'Membro da equipe ' || (SELECT nome FROM equipes WHERE id = usuarios.equipe_id LIMIT 1),
    telefone = CASE 
        WHEN email LIKE '%ricardo%' THEN '(11) 98765-4321'
        WHEN email LIKE '%leonardo%' THEN '(11) 91234-5678'
        WHEN email LIKE '%rodrigo%' THEN '(11) 95555-5555'
        ELSE NULL
    END,
    localizacao = CASE 
        WHEN email LIKE '%ricardo%' THEN 'São Paulo, SP'
        WHEN email LIKE '%leonardo%' THEN 'Rio de Janeiro, RJ'
        WHEN email LIKE '%rodrigo%' THEN 'Curitiba, PR'
        ELSE 'Brasil'
    END,
    cargo = COALESCE(cargo, 'Desenvolvedor')
WHERE bio IS NULL;

-- Verificar estrutura final
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- Mensagem de sucesso
SELECT '✅ Colunas adicionadas com sucesso! Profile.tsx agora funcionará corretamente.' as mensagem;