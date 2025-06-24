#!/bin/bash

# Fix definitivo para cache npm e instalação
SERVER="root@96.43.96.30"

echo "🔧 FIX DEFINITIVO - CACHE NPM E INSTALAÇÃO"
echo "========================================="
echo ""

ssh $SERVER << 'ENDSSH'
set -e

cd /var/www/team-manager-ai

echo "📋 Diagnóstico do problema:"
echo "- Cache npm: $(ls -la /var/www/.npm 2>/dev/null | head -1 || echo 'não existe')"
echo "- UID www-data: $(id -u www-data)"
echo ""

# 1. Parar serviço
echo "🛑 Parando serviço..."
systemctl stop team-manager-ai || true

# 2. Corrigir permissões do cache npm (33 é o UID do www-data)
echo "🔐 Corrigindo cache npm..."
if [ -d "/var/www/.npm" ]; then
    echo "  - Alterando dono do cache npm..."
    chown -R 33:33 "/var/www/.npm"
else
    echo "  - Criando cache npm com permissões corretas..."
    mkdir -p /var/www/.npm
    chown -R 33:33 /var/www/.npm
fi

# 3. Limpar completamente
echo "🧹 Limpeza completa..."
rm -rf node_modules package-lock.json
rm -rf /tmp/npm-*

# 4. Configurar npm para www-data
echo "⚙️ Configurando npm para www-data..."
sudo -u www-data npm config set cache /var/www/.npm

# 5. Package.json simplificado
echo "📝 Criando package.json otimizado..."
cat > package.json << 'EOF'
{
  "name": "team-manager-ai",
  "version": "3.0.3",
  "description": "Microserviço IA",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "start": "node src/server.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "2.43.0",
    "cors": "2.8.5",
    "dotenv": "16.4.5",
    "express": "4.19.2",
    "openai": "4.65.0",
    "@langchain/openai": "0.3.11",
    "@langchain/core": "0.3.16"
  }
}
EOF

# 6. Ajustar permissões do diretório
echo "📁 Ajustando permissões do projeto..."
chown -R www-data:www-data /var/www/team-manager-ai

# 7. Instalar passo a passo
echo "📦 Instalando dependências base..."
sudo -u www-data npm install express cors dotenv @supabase/supabase-js openai --no-fund --no-audit

echo "📦 Instalando LangChain..."
sudo -u www-data npm install @langchain/core@0.3.16 @langchain/openai@0.3.11 --no-fund --no-audit

# 8. Verificar instalação
echo ""
echo "✅ Verificando instalação:"
echo "- Módulos instalados: $(ls node_modules 2>/dev/null | wc -l)"
echo "- Permissões: $(stat -c '%U:%G' node_modules)"
echo "- LangChain: $([ -d "node_modules/@langchain" ] && echo "✓ Instalado" || echo "✗ Não instalado")"

# 9. Criar servidor mínimo se não existir
if [ ! -f "src/server.js" ]; then
    echo "📝 Criando servidor básico..."
    mkdir -p src
    cat > src/server.js << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'team-manager-ai',
    langchain: true,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/dashboard/analyze', async (req, res) => {
  res.json({
    success: true,
    analysis: {
      metrics: { status: 'operational' },
      insights: { message: 'Sistema operacional' }
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ Servidor IA rodando na porta ${PORT}`);
});
EOF
fi

# 10. Reiniciar serviço
echo ""
echo "🚀 Reiniciando serviço..."
systemctl start team-manager-ai
sleep 3

# 11. Verificar status final
if systemctl is-active --quiet team-manager-ai; then
    echo ""
    echo "✅ SUCESSO TOTAL! Serviço rodando!"
    systemctl status team-manager-ai --no-pager | head -15
    
    # Testar endpoint
    echo ""
    echo "🧪 Testando endpoint:"
    curl -s http://localhost:3001/health | grep -o '"status":"ok"' && echo "✓ API respondendo!"
else
    echo ""
    echo "❌ Ainda com problemas. Logs:"
    journalctl -u team-manager-ai -n 30 --no-pager
fi

echo ""
echo "📊 Resumo final:"
echo "- Cache npm: $(stat -c '%U:%G' /var/www/.npm)"
echo "- Projeto: $(stat -c '%U:%G' /var/www/team-manager-ai)"
echo "- Módulos: $(stat -c '%U:%G' /var/www/team-manager-ai/node_modules 2>/dev/null || echo 'erro')"

ENDSSH

echo ""
echo "✅ Script concluído!"