#!/bin/bash

# Diagnóstico rápido para erro npm em produção
SERVER="root@96.43.96.30"

echo "🔍 DIAGNÓSTICO RÁPIDO - NPM ERROR"
echo "================================"

ssh $SERVER << 'ENDSSH'
echo "1. Verificando espaço em disco:"
df -h /var/www/team-manager-ai

echo -e "\n2. Processos node ativos:"
ps aux | grep -E "node|npm" | grep -v grep

echo -e "\n3. Estado do diretório problemático:"
ls -la /var/www/team-manager-ai/node_modules/openai 2>/dev/null || echo "Diretório openai não existe"
ls -la /var/www/team-manager-ai/node_modules/.openai-* 2>/dev/null || echo "Sem arquivos temporários .openai-*"

echo -e "\n4. Permissões do diretório:"
ls -la /var/www/team-manager-ai/ | grep node_modules

echo -e "\n5. Versão do Node e npm:"
node --version
npm --version

echo -e "\n6. Status do serviço:"
systemctl is-active team-manager-ai || echo "Serviço inativo"

echo -e "\n7. Últimos logs de erro:"
tail -n 20 /root/.npm/_logs/*-debug*.log 2>/dev/null | grep -E "error|warn" | tail -10
ENDSSH