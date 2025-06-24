-- ================================================================
-- SCRIPT COMPLETO: CRIAR E PADRONIZAR TABELAS
-- Team Manager - SixQuasar
-- Data: 23/06/2025
-- ================================================================

-- IMPORTANTE: Este script CRIA as tabelas que não existem
-- e depois padroniza os nomes de campos

BEGIN;

-- ================================================================
-- 1. CRIAR TABELAS QUE NÃO EXISTEM
-- ================================================================

-- Criar tabela PROPOSTAS se não existir
CREATE TABLE IF NOT EXISTS propostas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    cliente_nome VARCHAR(255) NOT NULL,
    valor_total DECIMAL(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'rascunho',
    responsavel_id UUID,
    equipe_id UUID,
    projeto_id UUID,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_validade DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Criar tabela LEADS se não existir
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(50),
    empresa VARCHAR(255),
    cargo VARCHAR(100),
    origem VARCHAR(100),
    status VARCHAR(50) DEFAULT 'novo',
    score INTEGER DEFAULT 0,
    responsavel_id UUID,
    equipe_id UUID,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Criar tabela INSTALLATIONS se não existir (para monitoramento)
CREATE TABLE IF NOT EXISTS installations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cliente_nome VARCHAR(255),
    location VARCHAR(255),
    tipo VARCHAR(100),
    potencia_kwp DECIMAL(10,2),
    data_instalacao DATE,
    status VARCHAR(50) DEFAULT 'ativo',
    responsavel_id UUID,
    equipe_id UUID,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Criar tabela FINANCE se não existir
CREATE TABLE IF NOT EXISTS finance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- 'receita' ou 'despesa'
    categoria VARCHAR(100),
    descricao TEXT,
    valor DECIMAL(15,2) NOT NULL,
    data_vencimento DATE,
    data_pagamento DATE,
    status VARCHAR(50) DEFAULT 'pendente',
    projeto_id UUID,
    responsavel_id UUID,
    equipe_id UUID,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Criar tabela INVOICES se não existir
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero VARCHAR(50) UNIQUE,
    cliente_nome VARCHAR(255) NOT NULL,
    projeto_id UUID,
    valor_total DECIMAL(15,2) NOT NULL,
    data_emissao DATE DEFAULT CURRENT_DATE,
    data_vencimento DATE,
    data_pagamento DATE,
    status VARCHAR(50) DEFAULT 'pendente',
    descricao TEXT,
    responsavel_id UUID,
    equipe_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Criar tabela REPORTS se não existir
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    periodo_inicio DATE,
    periodo_fim DATE,
    dados JSONB,
    responsavel_id UUID,
    equipe_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Criar tabela TIMELINE_EVENTS se não existir
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(100),
    projeto VARCHAR(255),
    autor_id UUID,
    equipe_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    prioridade VARCHAR(50) DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ================================================================
-- 2. VERIFICAR E CRIAR COLUNAS FALTANTES EM TABELAS EXISTENTES
-- ================================================================

-- Adicionar colunas faltantes na tabela PROJETOS
DO $$ 
BEGIN
    -- Verificar e adicionar colunas que podem estar faltando
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projetos' AND column_name = 'cliente') THEN
        ALTER TABLE projetos ADD COLUMN cliente VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projetos' AND column_name = 'tecnologias') THEN
        ALTER TABLE projetos ADD COLUMN tecnologias TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projetos' AND column_name = 'progresso') THEN
        ALTER TABLE projetos ADD COLUMN progresso INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projetos' AND column_name = 'orcamento') THEN
        ALTER TABLE projetos ADD COLUMN orcamento DECIMAL(15,2) DEFAULT 0;
    END IF;
END $$;

-- Adicionar colunas faltantes na tabela TAREFAS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tarefas' AND column_name = 'tags') THEN
        ALTER TABLE tarefas ADD COLUMN tags TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tarefas' AND column_name = 'prioridade') THEN
        ALTER TABLE tarefas ADD COLUMN prioridade VARCHAR(50) DEFAULT 'media';
    END IF;
END $$;

-- ================================================================
-- 3. PADRONIZAR NOMES DE COLUNAS (mesmas do script anterior)
-- ================================================================

-- Padronizar tabela PROJETOS
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

-- Padronizar tabela TAREFAS
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

-- Padronizar tabela USUARIOS
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
-- 4. CRIAR FUNÇÃO DE VALIDAÇÃO DE SENHA (SEGURANÇA)
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
    -- NOTA: Em produção, use bcrypt ou argon2
    RETURN stored_hash = crypt(user_password, stored_hash);
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 5. ADICIONAR COLUNAS DE SEGURANÇA
-- ================================================================

-- Adicionar coluna de hash de senha se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'senha_hash') THEN
        ALTER TABLE usuarios ADD COLUMN senha_hash TEXT;
    END IF;
    
    -- Adicionar outras colunas de segurança
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'ultimo_login') THEN
        ALTER TABLE usuarios ADD COLUMN ultimo_login TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'tentativas_login') THEN
        ALTER TABLE usuarios ADD COLUMN tentativas_login INTEGER DEFAULT 0;
    END IF;
END $$;

-- ================================================================
-- 6. CRIAR ÍNDICES PARA PERFORMANCE
-- ================================================================

-- Índices para queries comuns
CREATE INDEX IF NOT EXISTS idx_projetos_equipe_id ON projetos(equipe_id);
CREATE INDEX IF NOT EXISTS idx_projetos_status ON projetos(status);
CREATE INDEX IF NOT EXISTS idx_projetos_responsavel_id ON projetos(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_projetos_created_at ON projetos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tarefas_projeto_id ON tarefas(projeto_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_responsavel_id ON tarefas(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_prioridade ON tarefas(prioridade);

CREATE INDEX IF NOT EXISTS idx_propostas_equipe_id ON propostas(equipe_id);
CREATE INDEX IF NOT EXISTS idx_propostas_status ON propostas(status);
CREATE INDEX IF NOT EXISTS idx_propostas_created_at ON propostas(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leads_equipe_id ON leads(equipe_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_responsavel_id ON leads(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);

CREATE INDEX IF NOT EXISTS idx_finance_equipe_id ON finance(equipe_id);
CREATE INDEX IF NOT EXISTS idx_finance_tipo ON finance(tipo);
CREATE INDEX IF NOT EXISTS idx_finance_status ON finance(status);
CREATE INDEX IF NOT EXISTS idx_finance_data_vencimento ON finance(data_vencimento);

-- ================================================================
-- 7. CRIAR TRIGGERS PARA UPDATED_AT
-- ================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- ================================================================
-- 8. DESABILITAR RLS EM TODAS AS TABELAS (TEMPORÁRIO)
-- ================================================================

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT IN ('schema_migrations', 'pg_stat_statements')
    LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- ================================================================
-- 9. POPULAR DADOS INICIAIS SE NECESSÁRIO
-- ================================================================

-- Inserir equipe padrão se não existir
INSERT INTO equipes (id, nome, descricao)
VALUES ('650e8400-e29b-41d4-a716-446655440001', 'SixQuasar', 'Equipe de desenvolvimento')
ON CONFLICT (id) DO NOTHING;

-- Inserir usuários padrão se não existirem
INSERT INTO usuarios (id, email, nome, cargo, tipo, equipe_id)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'ricardo@sixquasar.pro', 'Ricardo Landim', 'Tech Lead', 'owner', '650e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440002', 'leonardo@sixquasar.pro', 'Leonardo Candiani', 'Developer', 'admin', '650e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440003', 'rodrigo@sixquasar.pro', 'Rodrigo Marochi', 'Developer', 'member', '650e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 10. VALIDAÇÃO FINAL
-- ================================================================

-- Criar view para verificar estrutura final
CREATE OR REPLACE VIEW v_estrutura_sistema AS
SELECT 
    t.table_name,
    array_agg(c.column_name ORDER BY c.ordinal_position) as colunas,
    count(c.column_name) as total_colunas
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
    AND t.table_name IN ('projetos', 'tarefas', 'usuarios', 'propostas', 'leads', 'equipes', 'finance', 'invoices', 'installations', 'reports', 'timeline_events')
GROUP BY t.table_name
ORDER BY t.table_name;

-- Verificar a estrutura
SELECT * FROM v_estrutura_sistema;

COMMIT;

-- ================================================================
-- RESULTADO ESPERADO:
-- 
-- 1. Todas as tabelas necessárias criadas
-- 2. Campos padronizados em português
-- 3. Índices para performance
-- 4. Triggers para updated_at
-- 5. Função de validação de senha
-- 6. RLS desabilitado (temporário)
-- 7. Dados iniciais populados
-- ================================================================