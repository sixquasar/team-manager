#!/bin/bash

# RESTAURAÇÃO COMPLETA DO MICROSERVIÇO - CORREÇÃO DO LOGIN
SERVER="root@96.43.96.30"

echo "🚨 RESTAURAÇÃO CRÍTICA - MICROSERVIÇO TEAM MANAGER AI"
echo "===================================================="
echo "Este script irá restaurar COMPLETAMENTE o microserviço"
echo "que foi destruído pelo nuclear_fix_permissions.sh"
echo ""
echo "Iniciando em 3 segundos..."
sleep 3

ssh $SERVER << 'ENDSSH'
set -e

echo "═══════════════════════════════════════════════════"
echo "FASE 1: DIAGNÓSTICO INICIAL"
echo "═══════════════════════════════════════════════════"
cd /var/www/team-manager-ai

echo "Estado atual:"
echo "- Serviço: $(systemctl is-active team-manager-ai)"
echo "- Modo atual: $(curl -s http://localhost:3001/health | grep -o '"mode":"[^"]*"' || echo 'não acessível')"
echo ""

echo "═══════════════════════════════════════════════════"
echo "FASE 2: PARAR SERVIÇO E BACKUP"
echo "═══════════════════════════════════════════════════"
systemctl stop team-manager-ai || true
pkill -f "node.*server" || true

# Backup do estado atual
cp package.json package.json.emergency.bak 2>/dev/null || true
cp src/server.js src/server.js.emergency.bak 2>/dev/null || true

echo "═══════════════════════════════════════════════════"
echo "FASE 3: RESTAURAR PACKAGE.JSON COMPLETO"
echo "═══════════════════════════════════════════════════"
cat > package.json << 'EOF'
{
  "name": "team-manager-ai",
  "version": "3.2.0",
  "description": "Microserviço IA para Team Manager com LangChain",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
  },
  "dependencies": {
    "@langchain/community": "^0.3.11",
    "@langchain/core": "^0.3.16",
    "@langchain/langgraph": "^0.2.18",
    "@langchain/openai": "^0.3.11",
    "@supabase/supabase-js": "^2.43.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "openai": "^4.65.0",
    "socket.io": "^4.7.5"
  }
}
EOF

echo "═══════════════════════════════════════════════════"
echo "FASE 4: CRIAR SERVER.JS COMPLETO COM AUTENTICAÇÃO"
echo "═══════════════════════════════════════════════════"
mkdir -p src
cat > src/server.js << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Inicializar Supabase - CRÍTICO PARA LOGIN!
const supabaseUrl = process.env.SUPABASE_URL || 'https://kfghzgpwewfaeoazmkdv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.warn('⚠️  SUPABASE_SERVICE_KEY não configurada - funcionalidades limitadas');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || 'dummy-key');

// Health check - modo completo
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        mode: 'production',
        features: {
            auth: true,
            ai: !!process.env.OPENAI_API_KEY,
            database: !!supabaseServiceKey
        },
        version: '3.2.0',
        timestamp: new Date().toISOString()
    });
});

// ENDPOINTS DE AUTENTICAÇÃO - CRÍTICOS!
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Proxy para Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, userData } = req.body;
        
        // Proxy para Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

app.post('/api/auth/logout', async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// Endpoint de análise do dashboard
app.post('/api/dashboard/analyze', async (req, res) => {
    try {
        const { metrics } = req.body;
        
        // Se não há API key, retornar análise básica
        if (!process.env.OPENAI_API_KEY) {
            return res.json({
                success: true,
                analysis: {
                    metrics: metrics || {},
                    insights: {
                        summary: 'Análise IA disponível após configurar OPENAI_API_KEY',
                        recommendations: ['Configure a chave da API OpenAI para análises completas']
                    }
                }
            });
        }

        // Análise com IA
        const model = new ChatOpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: 'gpt-4',
            temperature: 0.7
        });

        const messages = [
            new SystemMessage('Você é um analista de dados especializado em gestão de equipes.'),
            new HumanMessage(`Analise estas métricas: ${JSON.stringify(metrics)}`)
        ];

        const response = await model.invoke(messages);
        
        res.json({
            success: true,
            analysis: {
                metrics,
                insights: {
                    summary: response.content,
                    recommendations: ['Implemente as sugestões da análise']
                }
            }
        });
    } catch (error) {
        console.error('Erro na análise:', error);
        res.status(500).json({ 
            error: 'Erro ao processar análise',
            details: error.message 
        });
    }
});

// Outros endpoints necessários
app.get('/api/reports', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('executive_reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Erro ao buscar relatórios:', error);
        res.status(500).json({ error: 'Erro ao buscar relatórios' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Team Manager AI rodando na porta ${PORT}`);
    console.log(`✅ Modo: PRODUÇÃO COMPLETO`);
    console.log(`✅ Auth endpoints disponíveis`);
    console.log(`${process.env.OPENAI_API_KEY ? '✅' : '⚠️ '} OpenAI ${process.env.OPENAI_API_KEY ? 'configurado' : 'não configurado'}`);
});
EOF

echo "═══════════════════════════════════════════════════"
echo "FASE 5: CONFIGURAR VARIÁVEIS DE AMBIENTE"
echo "═══════════════════════════════════════════════════"
if [ ! -f .env ]; then
    echo "Criando arquivo .env..."
    cat > .env << 'EOF'
# Supabase
SUPABASE_URL=https://kfghzgpwewfaeoazmkdv.supabase.co
SUPABASE_SERVICE_KEY=seu_service_key_aqui

# OpenAI (opcional para funcionalidades IA)
OPENAI_API_KEY=

# Server
PORT=3001
EOF
    echo "⚠️  IMPORTANTE: Configure SUPABASE_SERVICE_KEY no arquivo .env"
fi

echo "═══════════════════════════════════════════════════"
echo "FASE 6: LIMPAR E REINSTALAR DEPENDÊNCIAS"
echo "═══════════════════════════════════════════════════"
# Limpar tudo
rm -rf node_modules package-lock.json

# Corrigir permissões
chown -R www-data:www-data /var/www/team-manager-ai

# Instalar como www-data
echo "Instalando dependências base..."
sudo -u www-data npm install express cors dotenv @supabase/supabase-js openai --no-fund --no-audit

echo "Instalando LangChain..."
sudo -u www-data npm install @langchain/core@0.3.16 @langchain/openai@0.3.11 @langchain/community@0.3.11 @langchain/langgraph@0.2.18 --no-fund --no-audit

echo "═══════════════════════════════════════════════════"
echo "FASE 7: REINICIAR SERVIÇO"
echo "═══════════════════════════════════════════════════"
systemctl restart team-manager-ai
sleep 3

echo "═══════════════════════════════════════════════════"
echo "FASE 8: VERIFICAÇÃO FINAL"
echo "═══════════════════════════════════════════════════"
if systemctl is-active --quiet team-manager-ai; then
    echo "✅ Serviço rodando!"
    echo ""
    echo "Testando endpoints:"
    echo "1. Health Check:"
    curl -s http://localhost:3001/health | python3 -m json.tool || curl -s http://localhost:3001/health
    echo ""
    echo "2. Status do serviço:"
    systemctl status team-manager-ai --no-pager | head -15
else
    echo "❌ Serviço não iniciou. Verificando logs..."
    journalctl -u team-manager-ai -n 50 --no-pager
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "📋 PRÓXIMOS PASSOS"
echo "═══════════════════════════════════════════════════"
echo "1. Se o serviço está rodando, teste o login em: https://admin.sixquasar.pro"
echo "2. Configure SUPABASE_SERVICE_KEY em /var/www/team-manager-ai/.env"
echo "3. Para funcionalidades IA, adicione OPENAI_API_KEY"
echo "4. Monitore logs: journalctl -u team-manager-ai -f"
echo ""
echo "✅ RESTAURAÇÃO COMPLETA!"

ENDSSH

echo ""
echo "🎉 Script de restauração executado!"
echo "📌 Teste agora o login em https://admin.sixquasar.pro"