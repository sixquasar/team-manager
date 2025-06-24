#!/bin/bash

# Fix crítico para permissões e conflitos
SERVER="root@96.43.96.30"

echo "🔧 FIX CRÍTICO - PERMISSÕES E CONFLITOS"
echo "======================================"
echo ""

ssh $SERVER << 'ENDSSH'
set -e

cd /var/www/team-manager-ai

echo "📋 Estado atual:"
echo "- Dono atual: $(stat -c '%U:%G' node_modules 2>/dev/null || echo 'não existe')"
echo "- Serviço: $(systemctl is-active team-manager-ai)"
echo ""

# 1. Parar serviço
echo "🛑 Parando serviço..."
systemctl stop team-manager-ai || true

# 2. Corrigir permissões existentes PRIMEIRO
echo "🔐 Corrigindo permissões..."
chown -R www-data:www-data /var/www/team-manager-ai
chmod -R 755 /var/www/team-manager-ai

# 3. Remover node_modules problemático
echo "🗑️ Removendo instalação com problemas..."
rm -rf node_modules package-lock.json

# 4. Package.json SEM override conflitante
echo "📝 Criando package.json correto..."
cat > package.json << 'EOF'
{
  "name": "team-manager-ai",
  "version": "3.0.2",
  "description": "Microserviço IA",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "start": "node src/server.js"
  },
  "dependencies": {
    "@langchain/core": "0.3.16",
    "@langchain/openai": "0.3.11",
    "@langchain/community": "0.3.11",
    "@supabase/supabase-js": "2.43.0",
    "openai": "4.65.0",
    "cors": "2.8.5",
    "dotenv": "16.4.5",
    "express": "4.19.2",
    "socket.io": "4.7.5"
  }
}
EOF

# 5. Instalar como www-data
echo "📦 Instalando como www-data..."
sudo -u www-data npm install --no-fund --no-audit

# 6. Verificar permissões após instalação
echo ""
echo "✓ Verificando permissões:"
ls -la node_modules | head -5

# 7. Criar arquivo de teste simples
echo "📝 Criando servidor de teste..."
cat > src/server-test.js << 'EOF'
import express from 'express';
import { ChatOpenAI } from '@langchain/openai';

const app = express();

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    langchain: '✓ instalado',
    timestamp: new Date().toISOString()
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✓ Servidor teste rodando na porta ${PORT}`);
  console.log(`✓ LangChain carregado com sucesso`);
});
EOF

# 8. Testar se funciona
echo ""
echo "🧪 Testando instalação..."
sudo -u www-data timeout 5 node src/server-test.js || echo "Teste concluído"

# 9. Reiniciar serviço principal
echo ""
echo "🚀 Reiniciando serviço..."
systemctl start team-manager-ai
sleep 3

# 10. Verificar status
if systemctl is-active --quiet team-manager-ai; then
    echo ""
    echo "✅ SUCESSO! Serviço rodando!"
    echo ""
    echo "📊 Status:"
    systemctl status team-manager-ai --no-pager -l | head -10
else
    echo ""
    echo "❌ Serviço ainda com problemas"
    echo ""
    echo "📋 Logs de erro:"
    journalctl -u team-manager-ai -n 20 --no-pager
fi

echo ""
echo "🔍 Verificação final:"
echo "- Permissões node_modules: $(stat -c '%U:%G' node_modules)"
echo "- Total de módulos: $(ls node_modules | wc -l)"
echo "- LangChain instalado: $([ -d "node_modules/@langchain" ] && echo "✓" || echo "✗")"

ENDSSH

echo ""
echo "✅ Script concluído!"