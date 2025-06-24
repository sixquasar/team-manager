-- ================================================================
-- SCRIPT DE PADRONIZAÇÃO DEFINITIVA DO BANCO DE DADOS
-- Team Manager - SixQuasar
-- Data: 23/06/2025
-- ================================================================

-- IMPORTANTE: Este script padroniza TODOS os nomes de campos
-- Escolha: PORTUGUÊS para manter consistência com código existente

BEGIN;

-- ================================================================
-- 1. PADRONIZAR TABELA PROJETOS
-- ================================================================

-- Verificar e renomear colunas para padrão português
DO $$ 
BEGIN
    -- Renomear colunas em inglês para português se existirem
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projetos' AND column_name = 'name') THEN
        ALTER TABLE projetos RENAME COLUMN name TO nome;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projetos' AND column_name = 'description') THEN
        ALTER TABLE projetos RENAME COLUMN description TO descricao;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projetos' AND column_name = 'budget') THEN
        ALTER TABLE projetos RENAME COLUMN budget TO orcamento;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projetos' AND column_name = 'start_date') THEN
        ALTER TABLE projetos RENAME COLUMN start_date TO data_inicio;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projetos' AND column_name = 'end_date') THEN
        ALTER TABLE projetos RENAME COLUMN end_date TO data_fim_prevista;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projetos' AND column_name = 'progress') THEN
        ALTER TABLE projetos RENAME COLUMN progress TO progresso;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projetos' AND column_name = 'technologies') THEN
        ALTER TABLE projetos RENAME COLUMN technologies TO tecnologias;
    END IF;
    
    -- Corrigir possíveis variações de nomes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projetos' AND column_name = 'datainicio') THEN
        ALTER TABLE projetos RENAME COLUMN datainicio TO data_inicio;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projetos' AND column_name = 'datafimprevista') THEN
        ALTER TABLE projetos RENAME COLUMN datafimprevista TO data_fim_prevista;
    END IF;
END $$;

-- ================================================================
-- 2. PADRONIZAR TABELA TAREFAS
-- ================================================================

DO $$ 
BEGIN
    -- Renomear colunas em inglês para português
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tarefas' AND column_name = 'title') THEN
        ALTER TABLE tarefas RENAME COLUMN title TO titulo;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tarefas' AND column_name = 'description') THEN
        ALTER TABLE tarefas RENAME COLUMN description TO descricao;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tarefas' AND column_name = 'priority') THEN
        ALTER TABLE tarefas RENAME COLUMN priority TO prioridade;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tarefas' AND column_name = 'due_date') THEN
        ALTER TABLE tarefas RENAME COLUMN due_date TO data_vencimento;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tarefas' AND column_name = 'assignee_id') THEN
        ALTER TABLE tarefas RENAME COLUMN assignee_id TO responsavel_id;
    END IF;
END $$;

-- ================================================================
-- 3. PADRONIZAR TABELA USUARIOS
-- ================================================================

DO $$ 
BEGIN
    -- Renomear colunas em inglês para português
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'name') THEN
        ALTER TABLE usuarios RENAME COLUMN name TO nome;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'position') THEN
        ALTER TABLE usuarios RENAME COLUMN position TO cargo;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'type') THEN
        ALTER TABLE usuarios RENAME COLUMN type TO tipo;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'phone') THEN
        ALTER TABLE usuarios RENAME COLUMN phone TO telefone;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'location') THEN
        ALTER TABLE usuarios RENAME COLUMN location TO localizacao;
    END IF;
END $$;

-- ================================================================
-- 4. PADRONIZAR TABELA PROPOSTAS
-- ================================================================

DO $$ 
BEGIN
    -- Renomear campos específicos
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'propostas' AND column_name = 'cliente') THEN
        ALTER TABLE propostas RENAME COLUMN cliente TO cliente_nome;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'propostas' AND column_name = 'valor') THEN
        ALTER TABLE propostas RENAME COLUMN valor TO valor_total;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'propostas' AND column_name = 'value') THEN
        ALTER TABLE propostas RENAME COLUMN value TO valor_total;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'propostas' AND column_name = 'client') THEN
        ALTER TABLE propostas RENAME COLUMN client TO cliente_nome;
    END IF;
END $$;

-- ================================================================
-- 5. PADRONIZAR TABELA LEADS
-- ================================================================

DO $$ 
BEGIN
    -- Padronizar campos de data
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'data_criacao') THEN
        ALTER TABLE leads RENAME COLUMN data_criacao TO created_at;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'data_atualizacao') THEN
        ALTER TABLE leads RENAME COLUMN data_atualizacao TO updated_at;
    END IF;
    
    -- Remover campos que não existem no banco mas são usados no código
    -- (estes devem ser tratados no código com valores default)
END $$;

-- ================================================================
-- 6. CRIAR FUNÇÃO DE VALIDAÇÃO DE SENHA (SEGURANÇA)
-- ================================================================

CREATE OR REPLACE FUNCTION validate_user_password(
    user_email TEXT,
    user_password TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    stored_hash TEXT;
BEGIN
    -- Buscar o hash da senha armazenada
    SELECT senha_hash INTO stored_hash
    FROM usuarios
    WHERE email = user_email;
    
    -- Se não encontrar o usuário, retorna false
    IF stored_hash IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Validar a senha usando crypt
    RETURN stored_hash = crypt(user_password, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 7. ADICIONAR COLUNAS FALTANTES PARA SEGURANÇA
-- ================================================================

-- Adicionar coluna de hash de senha se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'senha_hash') THEN
        ALTER TABLE usuarios ADD COLUMN senha_hash TEXT;
    END IF;
END $$;

-- ================================================================
-- 8. CRIAR ÍNDICES PARA PERFORMANCE
-- ================================================================

-- Índices para queries comuns
CREATE INDEX IF NOT EXISTS idx_projetos_equipe_id ON projetos(equipe_id);
CREATE INDEX IF NOT EXISTS idx_projetos_status ON projetos(status);
CREATE INDEX IF NOT EXISTS idx_projetos_responsavel_id ON projetos(responsavel_id);

CREATE INDEX IF NOT EXISTS idx_tarefas_projeto_id ON tarefas(projeto_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_responsavel_id ON tarefas(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status);

CREATE INDEX IF NOT EXISTS idx_propostas_equipe_id ON propostas(equipe_id);
CREATE INDEX IF NOT EXISTS idx_propostas_status ON propostas(status);

CREATE INDEX IF NOT EXISTS idx_leads_equipe_id ON leads(equipe_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- ================================================================
-- 9. VALIDAÇÃO FINAL
-- ================================================================

-- Criar view para verificar estrutura padronizada
CREATE OR REPLACE VIEW v_estrutura_padronizada AS
SELECT 
    t.table_name,
    array_agg(c.column_name ORDER BY c.ordinal_position) as colunas
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
    AND t.table_name IN ('projetos', 'tarefas', 'usuarios', 'propostas', 'leads', 'equipes')
GROUP BY t.table_name
ORDER BY t.table_name;

-- Verificar a estrutura
SELECT * FROM v_estrutura_padronizada;

COMMIT;

-- ================================================================
-- NOTAS IMPORTANTES:
-- 
-- 1. Este script padroniza TODOS os campos para PORTUGUÊS
-- 2. Campos como created_at/updated_at são mantidos em inglês (padrão)
-- 3. Execute este script ANTES de fazer deploy da aplicação
-- 4. Faça backup do banco antes de executar
-- 5. Após executar, o código funcionará sem erros de campos
-- ================================================================