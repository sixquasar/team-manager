#!/bin/bash

#################################################################
#                                                               #
#        FIX AUTH URL - SOLUÇÃO DIRETA                          #
#        Corrige erro de URL do Supabase                        #
#        Versão: 2.0 - SSH DIRETO                               #
#                                                               #
#################################################################

SERVER="root@96.43.96.30"

# Cores
VERDE='\033[0;32m'
AMARELO='\033[1;33m' 
AZUL='\033[0;34m'
VERMELHO='\033[0;31m'
RESET='\033[0m'

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}🔧 FIX AUTH URL - SOLUÇÃO DIRETA${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${VERMELHO}ERRO DETECTADO:${RESET} cfvuldebsoxmhuarikdk.ate_user_password:1"
echo -e "${VERDE}CAUSA:${RESET} Frontend tentando usar Supabase Auth ao invés da API"
echo ""
echo -e "${AMARELO}Conectando ao servidor (digite a senha quando solicitado)...${RESET}"
echo ""

ssh $SERVER << 'ENDSSH'
set -e

# Cores
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
VERMELHO='\033[0;31m'
RESET='\033[0m'

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL} 1. CORRIGINDO ARQUIVO .ENV DO FRONTEND${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

cd /var/www/team-manager

# Backup
cp .env .env.bak.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Criar .env correto
cat > .env << 'EOF'
# Supabase - URLs CORRETAS (SEM ESPAÇOS, SEM QUEBRAS)
VITE_SUPABASE_URL=https://cfvuldebsoxmhuarikdk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnVsZGVic294bWh1YXJpa2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTY0NjAsImV4cCI6MjA2NDgzMjQ2MH0.4MQTy_NcARiBm_vwUa05S8zyW0okBbc-vb_7mIfT0J8

# API Local
VITE_API_URL=/api

# App
VITE_APP_TITLE=Team Manager
EOF

echo -e "${VERDE}✅ .env corrigido!${RESET}"

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL} 2. PROCURANDO CÓDIGO PROBLEMÁTICO${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

echo ""
echo "Buscando por 'create_user_password' ou 'supabase.auth':"
echo ""

# Buscar arquivos problemáticos
FILES=$(grep -r -l "supabase\.auth\|create_user_password" src/ 2>/dev/null || true)

if [ -n "$FILES" ]; then
    echo -e "${VERMELHO}ENCONTRADOS ARQUIVOS USANDO SUPABASE AUTH:${RESET}"
    echo "$FILES"
    echo ""
    
    # Mostrar as linhas problemáticas
    for file in $FILES; do
        echo -e "${AMARELO}=== $file ===${RESET}"
        grep -n "supabase\.auth\|create_user_password" "$file" | head -5
        echo ""
    done
    
    echo -e "${VERMELHO}⚠️  ESTES ARQUIVOS PRECISAM SER CORRIGIDOS!${RESET}"
    echo "Devem usar fetch('/api/auth/...') ao invés de supabase.auth"
else
    echo -e "${VERDE}✅ Nenhum arquivo usando Supabase Auth encontrado${RESET}"
fi

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL} 3. VERIFICANDO CONFIGURAÇÃO DO SUPABASE${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# Verificar se existe arquivo de config
if [ -f "src/config/supabase.ts" ]; then
    echo "Arquivo src/config/supabase.ts existe"
    
    # Corrigir para garantir que não tem problemas
    cat > src/config/supabase.ts << 'EOF'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

// Debug para verificar URL
console.log('Supabase URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});
EOF
    echo -e "${VERDE}✅ Configuração do Supabase corrigida${RESET}"
fi

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL} 4. REBUILD LIMPO${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# Limpar caches
rm -rf node_modules/.vite
rm -rf dist

# Build
echo "Fazendo build..."
npm run build

if [ -d "dist" ]; then
    echo -e "${VERDE}✅ Build concluído!${RESET}"
    
    # Verificar se o erro persiste
    if grep -r "ate_user_password" dist/ 2>/dev/null; then
        echo -e "${VERMELHO}❌ ERRO AINDA PRESENTE NO BUILD!${RESET}"
        echo "O código fonte precisa ser corrigido!"
    else
        echo -e "${VERDE}✅ Erro não encontrado no build${RESET}"
    fi
else
    echo -e "${VERMELHO}❌ Build falhou!${RESET}"
fi

# Recarregar nginx
nginx -s reload

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL} 5. VERIFICAÇÃO FINAL${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# Testar microserviço
echo ""
echo "Testando microserviço:"
if curl -s http://localhost:3001/health | grep -q "ok"; then
    echo -e "${VERDE}✅ Microserviço respondendo${RESET}"
else
    echo -e "${VERMELHO}❌ Microserviço não responde${RESET}"
fi

# Verificar se nginx tem proxy configurado
echo ""
echo "Verificando proxy nginx:"
if grep -q "location /api/" /etc/nginx/sites-available/* 2>/dev/null; then
    echo -e "${VERDE}✅ Proxy /api/ configurado${RESET}"
else
    echo -e "${VERMELHO}❌ Proxy /api/ NÃO configurado${RESET}"
    echo "Execute: fix_nginx_api_final.sh"
fi

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE} RESUMO${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

echo ""
echo "🔍 DIAGNÓSTICO:"
echo "   O erro 'cfvuldebsoxmhuarikdk.ate_user_password:1' ocorre porque:"
echo "   1. O frontend está tentando usar supabase.auth.signUp()"
echo "   2. Mas o sistema usa autenticação customizada via /api/auth/login"
echo ""
echo "✅ O QUE FOI FEITO:"
echo "   1. Arquivo .env corrigido com URLs corretas"
echo "   2. Build limpo realizado"
echo "   3. Arquivos problemáticos identificados"
echo ""
echo "⚠️  AÇÃO NECESSÁRIA:"
if [ -n "$FILES" ]; then
    echo "   Os arquivos listados acima precisam ser corrigidos para"
    echo "   usar fetch('/api/auth/...') ao invés de supabase.auth"
else
    echo "   Limpe o cache do navegador (Ctrl+Shift+R)"
    echo "   Ou teste em aba anônima"
fi

ENDSSH

echo ""
echo -e "${VERDE}✅ Script concluído!${RESET}"
echo ""
echo "Se o erro persistir, precisamos corrigir o código fonte"
echo "que está tentando usar Supabase Auth ao invés da API."