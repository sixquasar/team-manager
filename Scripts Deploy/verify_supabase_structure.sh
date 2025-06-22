#!/bin/bash

#################################################################
#                                                               #
#        VERIFICAR ESTRUTURA DO SUPABASE                       #
#        Verifica tabelas e campos antes de implementar IA     #
#        Versão: 1.0.0                                          #
#        Data: 22/06/2025                                       #
#                                                               #
#################################################################

# Cores
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
VERMELHO='\033[0;31m'
RESET='\033[0m'

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}🔍 VERIFICANDO ESTRUTURA DO SUPABASE${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

cat > /tmp/check_structure.sql << 'EOF'
-- Verificar estrutura completa para Dashboard IA

-- 1. TABELA PROJETOS
SELECT '=== TABELA PROJETOS ===' as info;
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'projetos' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. TABELA USUARIOS (para equipes)
SELECT '=== TABELA USUARIOS ===' as info;
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. TABELA TAREFAS (se existir)
SELECT '=== TABELA TAREFAS ===' as info;
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tarefas' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. TABELA FINANCEIRO (se existir)
SELECT '=== TABELAS FINANCEIRAS ===' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name LIKE '%financ%' 
    OR table_name LIKE '%invoice%' 
    OR table_name LIKE '%payment%'
    OR table_name LIKE '%receita%'
    OR table_name LIKE '%despesa%';

-- 5. CONTAGEM DE REGISTROS
SELECT '=== CONTAGEM DE REGISTROS ===' as info;
SELECT 
    'projetos' as tabela, 
    COUNT(*) as total 
FROM projetos
UNION ALL
SELECT 
    'usuarios' as tabela, 
    COUNT(*) as total 
FROM usuarios
UNION ALL
SELECT 
    'equipes' as tabela, 
    COUNT(*) as total 
FROM equipes;

-- 6. EXEMPLO DE DADOS PROJETOS
SELECT '=== EXEMPLO PROJETOS (3 registros) ===' as info;
SELECT * FROM projetos LIMIT 3;

-- 7. STATUS DOS PROJETOS
SELECT '=== STATUS DOS PROJETOS ===' as info;
SELECT 
    status, 
    COUNT(*) as total 
FROM projetos 
GROUP BY status;

-- 8. VERIFICAR SE EXISTE TABELA DE MÉTRICAS
SELECT '=== TABELAS DE MÉTRICAS/ANALYTICS ===' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND (table_name LIKE '%metric%' 
    OR table_name LIKE '%analytic%'
    OR table_name LIKE '%dashboard%');
EOF

echo -e "${AMARELO}SQL de verificação criado em: /tmp/check_structure.sql${RESET}"
echo ""
echo -e "${VERDE}INSTRUÇÕES:${RESET}"
echo -e "1. Copie e execute este SQL no Supabase SQL Editor"
echo -e "2. Analise os resultados para entender:"
echo -e "   - Nomes exatos dos campos"
echo -e "   - Tipos de dados"
echo -e "   - Tabelas disponíveis"
echo -e "   - Volume de dados"
echo ""
echo -e "${VERMELHO}IMPORTANTE:${RESET}"
echo -e "Execute este SQL ANTES de rodar os scripts de implementação!"
echo -e "Isso garante alinhamento perfeito entre código e banco."
echo ""