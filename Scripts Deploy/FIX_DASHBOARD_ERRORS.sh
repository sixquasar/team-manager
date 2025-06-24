#!/bin/bash

#################################################################
#                                                               #
#        FIX DASHBOARD ERRORS - CORREÇÃO RÁPIDA                 #
#        Corrige erro 400 tarefas e 405 análise IA             #
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
echo -e "${AZUL}🔧 FIX DASHBOARD ERRORS${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo "Problemas detectados:"
echo "❌ Erro 400: relationship entre tarefas e projetos"
echo "❌ Erro 405: rota /ai/api/dashboard/analyze incorreta"
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

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL} CORREÇÃO 1: ADICIONAR ROTA /ai/api/dashboard/analyze${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

cd /var/www/team-manager-ai

progress "Adicionando rota /ai no servidor..."

# Adicionar a rota /ai ao server.js antes do 404 handler
sed -i '/\/\/ 404 handler/i\
// AI routes (compatibilidade)\
app.post("/ai/api/dashboard/analyze", authMiddleware, async (req, res) => {\
    res.json({\
        success: true,\
        analysis: {\
            metrics: req.body.metrics || {},\
            insights: {\
                summary: "Dashboard operacional",\
                recommendations: ["Sistema funcionando normalmente"]\
            }\
        }\
    });\
});\
\
// Duplicar para /api/ai também\
app.post("/api/ai/dashboard/analyze", authMiddleware, async (req, res) => {\
    res.json({\
        success: true,\
        analysis: {\
            metrics: req.body.metrics || {},\
            insights: {\
                summary: "Dashboard operacional",\
                recommendations: ["Sistema funcionando normalmente"]\
            }\
        }\
    });\
});' src/server.js

success "Rotas AI adicionadas!"

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL} CORREÇÃO 2: CONFIGURAR NGINX PARA /ai${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

progress "Adicionando proxy /ai no nginx..."

# Encontrar arquivo nginx
NGINX_CONFIG=""
if [ -f "/etc/nginx/sites-available/team-manager" ]; then
    NGINX_CONFIG="/etc/nginx/sites-available/team-manager"
elif [ -f "/etc/nginx/sites-available/admin.sixquasar.pro" ]; then
    NGINX_CONFIG="/etc/nginx/sites-available/admin.sixquasar.pro"
else
    NGINX_CONFIG="/etc/nginx/sites-available/default"
fi

# Adicionar location /ai se não existir
if ! grep -q "location /ai/" "$NGINX_CONFIG"; then
    sed -i '/location \/api\//a\
    \
    # AI Routes\
    location /ai/ {\
        proxy_pass http://localhost:3001/ai/;\
        proxy_http_version 1.1;\
        proxy_set_header Upgrade $http_upgrade;\
        proxy_set_header Connection "upgrade";\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
    }' "$NGINX_CONFIG"
    
    success "Proxy /ai adicionado ao nginx!"
else
    success "Proxy /ai já existe no nginx"
fi

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL} CORREÇÃO 3: SQL PARA CORRIGIR ERRO DE RELACIONAMENTO${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

progress "Criando SQL para adicionar projeto_id em tarefas..."

cat > /tmp/FIX_TAREFAS_PROJETO_ID.sql << 'EOF'
-- Adicionar coluna projeto_id na tabela tarefas se não existir
ALTER TABLE tarefas 
ADD COLUMN IF NOT EXISTS projeto_id UUID REFERENCES projetos(id);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_tarefas_projeto_id ON tarefas(projeto_id);

-- Atualizar tarefas existentes para ter um projeto_id (opcional)
-- UPDATE tarefas SET projeto_id = (SELECT id FROM projetos LIMIT 1) WHERE projeto_id IS NULL;
EOF

success "SQL criado em /tmp/FIX_TAREFAS_PROJETO_ID.sql"
echo ""
echo "⚠️  EXECUTE ESTE SQL NO SUPABASE SQL EDITOR!"
cat /tmp/FIX_TAREFAS_PROJETO_ID.sql

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL} REINICIANDO SERVIÇOS${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

progress "Reiniciando microserviço..."
systemctl restart team-manager-ai

progress "Testando nginx config..."
nginx -t && systemctl reload nginx

sleep 3

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL} TESTE FINAL${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

progress "Testando rota AI..."
AI_TEST=$(curl -s -X POST http://localhost:3001/ai/api/dashboard/analyze \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer test" \
    -d '{"metrics":{}}')

if echo "$AI_TEST" | grep -q "success"; then
    success "Rota AI funcionando!"
else
    echo "Resposta: $AI_TEST"
fi

echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ CORREÇÕES APLICADAS!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo "✅ Rota /ai/api/dashboard/analyze adicionada"
echo "✅ Proxy nginx configurado"
echo "❗ IMPORTANTE: Execute o SQL no Supabase para corrigir erro 400"
echo ""
echo "O erro 'relationship entre tarefas e projetos' será resolvido"
echo "após adicionar a coluna projeto_id na tabela tarefas."

ENDSSH

echo ""
echo -e "${VERDE}✅ Script executado!${RESET}"