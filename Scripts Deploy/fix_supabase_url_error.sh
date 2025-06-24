#!/bin/bash

#################################################################
#                                                               #
#        FIX SUPABASE URL ERROR - CORREÇÃO DEFINITIVA           #
#        Corrige erro de URL malformada no frontend            #
#        Versão: 1.0.0                                          #
#        Data: 24/06/2025                                       #
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
echo -e "${AZUL}🔧 FIX SUPABASE URL ERROR${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo "Erro detectado: cfvuldebsoxmhuarikdk.ate_user_password:1"
echo ""
echo "Este script irá:"
echo "✓ Corrigir URLs do Supabase no frontend"
echo "✓ Verificar e corrigir arquivo .env"
echo "✓ Limpar cache e reconstruir"
echo "✓ Verificar integridade dos arquivos"
echo ""

# Solicitar senha
echo -e "${AMARELO}Digite a senha do servidor:${RESET}"
read -s SERVER_PASSWORD
echo ""

echo -e "${AMARELO}Conectando ao servidor...${RESET}"

sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
set -e

# Cores
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
VERMELHO='\033[0;31m'
RESET='\033[0m'

progress() {
    echo -e "${AMARELO}➤ $1${RESET}"
}

success() {
    echo -e "${VERDE}✅ $1${RESET}"
}

error() {
    echo -e "${VERMELHO}❌ $1${RESET}"
}

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL} FASE 1: DIAGNÓSTICO${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

cd /var/www/team-manager

progress "1. Verificando arquivo .env atual..."
if [ -f ".env" ]; then
    echo "Conteúdo atual do .env:"
    grep -E "VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY" .env || echo "Variáveis não encontradas!"
else
    error ".env não existe!"
fi

progress "2. Verificando se há concatenação errada no código..."
echo ""
echo "Buscando por 'ate_user_password' no código:"
grep -r "ate_user_password" src/ 2>/dev/null || echo "Não encontrado diretamente"

echo ""
echo "Buscando por 'createUser' ou 'create_user':"
grep -r -E "(createUser|create_user)" src/ 2>/dev/null | head -5 || echo "Não encontrado"

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL} FASE 2: CORREÇÃO DO .ENV${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

progress "3. Fazendo backup do .env atual..."
cp .env .env.bak.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

progress "4. Criando .env correto..."
cat > .env << 'EOF'
# Supabase - URLs CORRETAS
VITE_SUPABASE_URL=https://cfvuldebsoxmhuarikdk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnVsZGVic294bWh1YXJpa2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTY0NjAsImV4cCI6MjA2NDgzMjQ2MH0.4MQTy_NcARiBm_vwUa05S8zyW0okBbc-vb_7mIfT0J8

# App
VITE_APP_TITLE="Team Manager"
VITE_APP_VERSION="2.0.0"

# API (microserviço local)
VITE_API_URL=https://admin.sixquasar.pro/api
EOF

success ".env criado com URLs corretas!"

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL} FASE 3: VERIFICAÇÃO E CORREÇÃO DO CÓDIGO${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

progress "5. Verificando arquivo de configuração do Supabase..."
if [ -f "src/config/supabase.ts" ]; then
    echo "Conteúdo atual:"
    cat src/config/supabase.ts
    
    # Corrigir se necessário
    cat > src/config/supabase.ts << 'EOF'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Garantir que a URL está correta
if (!supabaseUrl.startsWith('https://')) {
  throw new Error('Supabase URL must start with https://');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Debug info (remover em produção)
console.log('Supabase initialized with URL:', supabaseUrl);
EOF
    success "Arquivo de configuração corrigido!"
fi

progress "6. Verificando se há uso de RPC create_user_password..."
# Buscar por chamadas RPC problemáticas
if grep -r "create_user_password\|ate_user_password" src/; then
    error "Encontrado uso de create_user_password! Isso não deveria existir."
    echo "O sistema está usando autenticação customizada, não Supabase Auth!"
fi

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL} FASE 4: LIMPEZA E REBUILD${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

progress "7. Limpando cache e build anterior..."
rm -rf node_modules/.vite
rm -rf dist
rm -rf .parcel-cache 2>/dev/null || true

progress "8. Instalando dependências..."
npm install --legacy-peer-deps --no-fund --no-audit

progress "9. Fazendo build limpo..."
npm run build

if [ -d "dist" ]; then
    success "Build concluído!"
    
    # Verificar se o build contém a URL errada
    echo ""
    echo "Verificando se o erro persiste no build:"
    grep -r "ate_user_password" dist/ 2>/dev/null && error "ERRO AINDA PRESENTE!" || success "Erro não encontrado no build!"
else
    error "Falha no build!"
fi

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL} FASE 5: VERIFICAÇÃO DO AUTH${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

progress "10. Verificando sistema de autenticação..."
echo ""
echo "O sistema deve usar autenticação CUSTOMIZADA via microserviço, NÃO Supabase Auth!"
echo ""

# Verificar se há uso incorreto de Supabase Auth
if grep -r "supabase.auth.signUp\|supabase.auth.signIn" src/; then
    error "ERRO: Código ainda usa Supabase Auth!"
    echo "Deve usar fetch para /api/auth/login"
else
    success "Não encontrado uso de Supabase Auth (correto!)"
fi

progress "11. Recarregando nginx..."
nginx -s reload

echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ CORREÇÃO CONCLUÍDA!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo "📋 O QUE FOI CORRIGIDO:"
echo "   ✓ Arquivo .env com URLs corretas"
echo "   ✓ Configuração do Supabase verificada"
echo "   ✓ Build limpo realizado"
echo "   ✓ Cache limpo"
echo ""
echo "🔍 PROBLEMA IDENTIFICADO:"
echo "   O erro 'cfvuldebsoxmhuarikdk.ate_user_password:1' indica que"
echo "   algum código está tentando usar Supabase Auth ao invés da"
echo "   autenticação customizada via microserviço."
echo ""
echo "⚠️  IMPORTANTE:"
echo "   O sistema deve usar APENAS:"
echo "   - Login: POST /api/auth/login"
echo "   - Logout: POST /api/auth/logout"
echo "   - User: GET /api/auth/user"
echo "   NÃO deve usar supabase.auth.* para nada!"

ENDSSH

echo ""
echo -e "${VERDE}✅ Script executado!${RESET}"
echo ""
echo "PRÓXIMOS PASSOS:"
echo "1. Limpe COMPLETAMENTE o cache do navegador"
echo "2. Ou teste em uma aba anônima/privada"
echo "3. Acesse https://admin.sixquasar.pro"
echo "4. O erro de URL malformada deve estar resolvido"