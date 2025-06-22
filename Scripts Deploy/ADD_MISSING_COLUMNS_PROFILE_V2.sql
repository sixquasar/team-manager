-- ================================================================
-- ADICIONAR COLUNAS FALTANTES PARA PÁGINA PROFILE - VERSÃO SEGURA
-- ================================================================
-- Erro: Could not find the 'bio' column of 'usuarios' in the schema cache
-- Solução: Adicionar colunas uma por vez com verificação
-- ================================================================

-- PASSO 1: Adicionar colunas uma por vez
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS localizacao VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cargo VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- PASSO 2: Criar função para trigger (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- PASSO 3: Aplicar trigger
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- PASSO 4: Valores padrão simples (sem dependências)
UPDATE usuarios 
SET bio = 'Membro da equipe'
WHERE bio IS NULL;

UPDATE usuarios 
SET localizacao = 'Brasil'
WHERE localizacao IS NULL;

UPDATE usuarios 
SET cargo = 'Desenvolvedor'
WHERE cargo IS NULL;

-- PASSO 5: Verificar resultado
SELECT 
    'Colunas adicionadas com sucesso!' as status,
    COUNT(*) as total_usuarios,
    COUNT(bio) as usuarios_com_bio,
    COUNT(telefone) as usuarios_com_telefone,
    COUNT(localizacao) as usuarios_com_localizacao,
    COUNT(cargo) as usuarios_com_cargo
FROM usuarios;

-- Mostrar estrutura final
SELECT 
    column_name as coluna,
    data_type as tipo,
    is_nullable as permite_nulo
FROM information_schema.columns
WHERE table_name = 'usuarios'
AND column_name IN ('bio', 'telefone', 'localizacao', 'cargo', 'updated_at')
ORDER BY column_name;