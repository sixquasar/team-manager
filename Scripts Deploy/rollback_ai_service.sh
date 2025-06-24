#!/bin/bash

# Rollback para versão anterior sem LangChain
SERVER="root@96.43.96.30"

echo "🔄 ROLLBACK - MICROSERVIÇO IA"
echo "============================="
echo "⚠️  Remove LangChain e volta para OpenAI puro"
echo ""

ssh $SERVER << 'ENDSSH'
cd /var/www/team-manager-ai

# 1. Parar serviço
systemctl stop team-manager-ai

# 2. Package.json sem LangChain
cat > package.json << 'EOF'
{
  "name": "team-manager-ai",
  "version": "2.9.0",
  "type": "module",
  "scripts": {
    "start": "node src/server.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.43.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "openai": "^4.65.0"
  }
}
EOF

# 3. Servidor mínimo funcional
cat > src/server.js << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key'
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    version: '2.9.0',
    mode: 'fallback-openai'
  });
});

// Análise básica
app.post('/api/dashboard/analyze', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        success: true,
        analysis: {
          metrics: { placeholder: true },
          insights: { message: 'Configure OPENAI_API_KEY para análises reais' }
        }
      });
    }
    
    // Análise simples com OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Você é um analista de projetos." },
        { role: "user", content: "Analise: " + JSON.stringify(req.body) }
      ],
      max_tokens: 200
    });
    
    res.json({
      success: true,
      analysis: {
        metrics: req.body,
        insights: { ai_response: completion.choices[0].message.content }
      }
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      error: 'Erro na análise'
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} (modo fallback)`);
});
EOF

# 4. Reinstalar limpo
rm -rf node_modules package-lock.json
npm install

# 5. Reiniciar
systemctl start team-manager-ai

echo "✅ Rollback concluído - OpenAI puro sem LangChain"
ENDSSH