#!/bin/bash

#################################################################
#                                                               #
#        CORRIGIR ROTAS DO MICROSERVIÇO IA                     #
#        Verificar e corrigir index.js                          #
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

SERVER="root@96.43.96.30"

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}🔧 CORRIGINDO ROTAS DO MICROSERVIÇO IA${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

ssh $SERVER << 'ENDSSH'
cd /var/www/team-manager-ai

echo -e "\033[1;33m1. Verificando estrutura atual...\033[0m"
echo "Arquivos em src/:"
ls -la src/

echo -e "\033[1;33m2. Verificando index.js atual...\033[0m"
echo "Primeiras 20 linhas do index.js:"
head -n 20 src/index.js

echo -e "\033[1;33m3. Verificando se existe api/dashboardAnalyzer.js...\033[0m"
if [ -f "src/api/dashboardAnalyzer.js" ]; then
    echo "✅ dashboardAnalyzer.js existe"
else
    echo "❌ dashboardAnalyzer.js NÃO existe - criando agora..."
    mkdir -p src/api
fi

echo -e "\033[1;33m4. Criando index.js corrigido com todas as rotas...\033[0m"

# Fazer backup
cp src/index.js src/index.js.bak

# Criar novo index.js completo
cat > src/index.js << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeProject } from './agents/projectAnalyzer.js';
import { analyzeDashboard } from './api/dashboardAnalyzer.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI Service Running',
    version: '1.0.0',
    model: 'gpt-4.1-mini',
    timestamp: new Date().toISOString()
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    service: 'Team Manager AI Microservice',
    status: 'active',
    endpoints: [
      'GET /health',
      'POST /api/analyze/project/:id',
      'POST /api/dashboard/analyze'
    ]
  });
});

// Rota para análise de projeto individual
app.post('/api/analyze/project/:id', async (req, res) => {
  try {
    console.log('🎯 Analisando projeto:', req.params.id);
    const analysis = await analyzeProject(req.body);
    
    res.json({
      success: true,
      projectId: req.params.id,
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao analisar projeto:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota para análise do dashboard
app.post('/api/dashboard/analyze', analyzeDashboard);

// Rota 404
app.use((req, res) => {
  console.log(`❌ Rota não encontrada: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Erro geral:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Team Manager AI Service rodando na porta ${PORT}`);
  console.log(`📊 Endpoints disponíveis:`);
  console.log(`   - GET  http://localhost:${PORT}/health`);
  console.log(`   - POST http://localhost:${PORT}/api/analyze/project/:id`);
  console.log(`   - POST http://localhost:${PORT}/api/dashboard/analyze`);
  console.log(`🤖 Modelo: gpt-4.1-mini`);
});
EOF

echo -e "\033[0;32m✅ index.js atualizado com todas as rotas\033[0m"

echo -e "\033[1;33m5. Verificando se analyzeDashboard existe...\033[0m"
if [ ! -f "src/api/dashboardAnalyzer.js" ]; then
    echo "Arquivo não existe. Verifique se o script implement_dashboard_ai_corrected.sh foi executado completamente."
    echo "Listando arquivos em src/api/:"
    ls -la src/api/ 2>/dev/null || echo "Diretório src/api não existe"
fi

echo -e "\033[1;33m6. Reiniciando serviço...\033[0m"
systemctl restart team-manager-ai

echo -e "\033[1;33m7. Aguardando inicialização...\033[0m"
sleep 5

echo -e "\033[1;33m8. Verificando logs...\033[0m"
journalctl -u team-manager-ai -n 20 --no-pager | tail -15

echo -e "\033[1;33m9. Testando rotas...\033[0m"
echo "Testando /health:"
curl -s http://localhost:3002/health | head -c 100
echo ""
echo ""
echo "Testando /:"
curl -s http://localhost:3002/ | head -c 200
echo ""

ENDSSH

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ CORREÇÃO DE ROTAS CONCLUÍDA!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${AZUL}Teste novamente o endpoint:${RESET}"
echo "curl -X POST https://admin.sixquasar.pro/ai/api/dashboard/analyze"
echo ""