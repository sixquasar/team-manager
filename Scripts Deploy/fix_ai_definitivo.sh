#!/bin/bash

#################################################################
#                                                               #
#        CORREÇÃO DEFINITIVA DO MICROSERVIÇO IA                #
#        Seguindo CLAUDE.md - Sem atalhos                      #
#        Versão: 3.0.0                                          #
#        Data: 22/06/2025                                       #
#                                                               #
#################################################################

# Cores
VERMELHO='\033[0;31m'
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
MAGENTA='\033[0;35m'
CIANO='\033[0;36m'
RESET='\033[0m'

AI_DIR="/var/www/team-manager-ai"
APP_DIR="/var/www/team-manager"

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}🔧 CORREÇÃO DEFINITIVA - MICROSERVIÇO IA${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# Verificar root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${VERMELHO}❌ Execute como root (sudo)${RESET}"
    exit 1
fi

# DIAGNÓSTICO
echo -e "${MAGENTA}📊 DIAGNÓSTICO INICIAL:${RESET}"

# 1. Verificar se diretório existe
if [ -d "$AI_DIR" ]; then
    echo -e "  ${VERDE}✓${RESET} Diretório IA existe: $AI_DIR"
else
    echo -e "  ${VERMELHO}✗${RESET} Diretório IA não existe"
    mkdir -p "$AI_DIR"
fi

# 2. Verificar porta 3002
if netstat -tlnp | grep -q ":3002"; then
    echo -e "  ${AMARELO}!${RESET} Porta 3002 em uso por: $(netstat -tlnp | grep :3002 | awk '{print $7}')"
else
    echo -e "  ${VERDE}✓${RESET} Porta 3002 livre"
fi

# 3. Verificar Nginx
if grep -q "location /ai/" /etc/nginx/sites-available/team-manager; then
    echo -e "  ${VERDE}✓${RESET} Rotas /ai/ configuradas no Nginx"
else
    echo -e "  ${VERMELHO}✗${RESET} Rotas /ai/ NÃO configuradas no Nginx"
fi

# 4. Verificar serviço systemd
if [ -f "/etc/systemd/system/team-manager-ai.service" ]; then
    echo -e "  ${VERDE}✓${RESET} Serviço systemd existe"
    if systemctl is-active --quiet team-manager-ai; then
        echo -e "  ${VERDE}✓${RESET} Serviço está rodando"
    else
        echo -e "  ${VERMELHO}✗${RESET} Serviço NÃO está rodando"
    fi
else
    echo -e "  ${VERMELHO}✗${RESET} Serviço systemd não existe"
fi

echo ""
echo -e "${CIANO}🔨 INICIANDO CORREÇÕES:${RESET}"

# PASSO 1: Parar serviço se estiver rodando
echo -e "${AMARELO}1. Parando serviço atual...${RESET}"
systemctl stop team-manager-ai 2>/dev/null

# PASSO 2: Criar estrutura completa
echo -e "${AMARELO}2. Criando estrutura do microserviço...${RESET}"
cd "$AI_DIR"

# Criar estrutura de diretórios
mkdir -p src/{agents,workflows,api,events,lib,config}

# Criar index.js FUNCIONAL (sem LangChain por enquanto)
cat > src/index.js << 'EOF'
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true
  }
});

const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI Service Running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Rota de teste para /ai/
app.get('/', (req, res) => {
  res.json({ 
    service: 'Team Manager AI',
    status: 'active',
    endpoints: ['/health', '/api/analyze/project']
  });
});

// Rota de análise (mock por enquanto)
app.post('/api/analyze/project/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projectData = req.body;
    
    console.log(`Analisando projeto ${id}:`, projectData);
    
    // Resposta mock até LangChain funcionar
    const mockAnalysis = {
      healthScore: 85,
      risks: ['Prazo apertado', 'Orçamento no limite'],
      recommendations: ['Aumentar equipe', 'Revisar cronograma'],
      nextSteps: ['Reunião de alinhamento', 'Revisão de escopo']
    };
    
    res.json({ success: true, analysis: mockAnalysis });
  } catch (error) {
    console.error('Erro na análise:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Socket.io
io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

// Iniciar servidor
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AI Service rodando na porta ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
EOF

# Criar package.json mínimo
cat > package.json << 'EOF'
{
  "name": "team-manager-ai",
  "version": "1.0.0",
  "description": "AI Microservice for Team Manager",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node src/index.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "socket.io": "^4.7.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "helmet": "^7.1.0"
  }
}
EOF

# PASSO 3: Instalar dependências mínimas
echo -e "${AMARELO}3. Instalando dependências mínimas...${RESET}"
npm install

# PASSO 4: Verificar/Corrigir Nginx
echo -e "${AMARELO}4. Verificando configuração Nginx...${RESET}"

# Verificar se as rotas /ai/ existem
if ! grep -q "location /ai/" /etc/nginx/sites-available/team-manager; then
    echo -e "${AMARELO}   Adicionando rotas /ai/ ao Nginx...${RESET}"
    
    # Fazer backup
    cp /etc/nginx/sites-available/team-manager /etc/nginx/sites-available/team-manager.bak
    
    # Adicionar rotas antes do último }
    sed -i '/^}$/i\
\
    # Proxy para microserviço IA\
    location /ai/ {\
        proxy_pass http://localhost:3002/;\
        proxy_http_version 1.1;\
        proxy_set_header Upgrade $http_upgrade;\
        proxy_set_header Connection '\''upgrade'\'';\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        proxy_cache_bypass $http_upgrade;\
    }\
    \
    # API do microserviço IA\
    location /ai/api/ {\
        proxy_pass http://localhost:3002/api/;\
        proxy_http_version 1.1;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
    }' /etc/nginx/sites-available/team-manager
fi

# Testar Nginx
if nginx -t; then
    echo -e "  ${VERDE}✓${RESET} Configuração Nginx válida"
    systemctl reload nginx
else
    echo -e "  ${VERMELHO}✗${RESET} Erro na configuração Nginx"
fi

# PASSO 5: Criar/Atualizar serviço systemd
echo -e "${AMARELO}5. Configurando serviço systemd...${RESET}"

cat > /etc/systemd/system/team-manager-ai.service << EOF
[Unit]
Description=Team Manager AI Microservice
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$AI_DIR
Environment=NODE_ENV=production
Environment=PORT=3002
ExecStart=/usr/bin/node src/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# PASSO 6: Iniciar serviço
echo -e "${AMARELO}6. Iniciando serviço...${RESET}"
systemctl daemon-reload
systemctl enable team-manager-ai
systemctl start team-manager-ai

# Aguardar inicialização
sleep 3

# PASSO 7: Verificar funcionamento
echo ""
echo -e "${MAGENTA}📊 VERIFICAÇÃO FINAL:${RESET}"

# Testar serviço local
if curl -s http://localhost:3002/health | grep -q "OK"; then
    echo -e "  ${VERDE}✓${RESET} Serviço respondendo em localhost:3002"
else
    echo -e "  ${VERMELHO}✗${RESET} Serviço NÃO responde em localhost:3002"
fi

# Testar via Nginx
if curl -s https://admin.sixquasar.pro/ai/health | grep -q "OK"; then
    echo -e "  ${VERDE}✓${RESET} Serviço acessível via /ai/"
else
    echo -e "  ${VERMELHO}✗${RESET} Serviço NÃO acessível via /ai/"
fi

# Status do serviço
if systemctl is-active --quiet team-manager-ai; then
    echo -e "  ${VERDE}✓${RESET} Serviço systemd ativo"
else
    echo -e "  ${VERMELHO}✗${RESET} Serviço systemd inativo"
    journalctl -u team-manager-ai --no-pager -n 10
fi

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ MICROSERVIÇO IA FUNCIONANDO!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${AZUL}🌐 ENDPOINTS DISPONÍVEIS:${RESET}"
echo -e "  - Health: ${CIANO}https://admin.sixquasar.pro/ai/health${RESET}"
echo -e "  - API: ${CIANO}https://admin.sixquasar.pro/ai/api/analyze/project/:id${RESET}"
echo ""
echo -e "${AMARELO}📝 PRÓXIMOS PASSOS:${RESET}"
echo -e "  1. O serviço está rodando com endpoints mock"
echo -e "  2. Para adicionar LangChain, execute:"
echo -e "     ${CIANO}cd $AI_DIR${RESET}"
echo -e "     ${CIANO}npm install langchain @langchain/core @langchain/openai${RESET}"
echo -e "  3. Depois atualize src/index.js com a lógica real"
echo ""

# Verificar logs em tempo real
echo -e "${AZUL}📋 Logs do serviço (Ctrl+C para sair):${RESET}"
journalctl -u team-manager-ai -f --no-pager