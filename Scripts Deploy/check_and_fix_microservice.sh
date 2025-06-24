#!/bin/bash

# Verificar e corrigir microserviço
SERVER="root@96.43.96.30"

echo "🔧 VERIFICANDO E CORRIGINDO MICROSERVIÇO"
echo "========================================"
echo ""

ssh $SERVER << 'ENDSSH'
set -e

echo "1. Status do microserviço:"
echo "-------------------------"
systemctl status team-manager-ai --no-pager | head -15

echo -e "\n2. Verificando se está escutando na porta 3001:"
echo "-----------------------------------------------"
netstat -tlnp | grep 3001 || ss -tlnp | grep 3001 || echo "❌ Não está escutando na porta 3001"

echo -e "\n3. Logs recentes do serviço:"
echo "-----------------------------"
journalctl -u team-manager-ai -n 30 --no-pager

echo -e "\n4. Verificando arquivo .env do microserviço:"
echo "--------------------------------------------"
if [ -f /var/www/team-manager-ai/.env ]; then
    echo "✅ .env existe"
    grep -E "SUPABASE_URL|PORT" /var/www/team-manager-ai/.env
else
    echo "❌ .env não existe!"
fi

echo -e "\n5. Tentando iniciar manualmente para debug:"
echo "-------------------------------------------"
cd /var/www/team-manager-ai
echo "Conteúdo do diretório:"
ls -la

echo -e "\nVerificando package.json:"
if [ -f package.json ]; then
    cat package.json | grep -A 5 '"scripts"'
else
    echo "❌ package.json não existe!"
fi

echo -e "\n6. Reiniciando o serviço:"
echo "-------------------------"
systemctl restart team-manager-ai
sleep 5

echo -e "\n7. Verificação após restart:"
echo "----------------------------"
if systemctl is-active --quiet team-manager-ai; then
    echo "✅ Serviço está ativo"
    
    # Testar health endpoint
    echo "Testando health endpoint:"
    curl -s http://localhost:3001/health | python3 -m json.tool || echo "❌ Health endpoint não responde"
    
    # Testar via nginx
    echo -e "\nTestando via nginx:"
    curl -s https://admin.sixquasar.pro/api/health -k | python3 -m json.tool || echo "❌ Proxy nginx não funciona"
else
    echo "❌ Serviço não está ativo"
    echo "Últimos logs de erro:"
    journalctl -u team-manager-ai -n 20 --no-pager | grep -E "error|Error|fatal|Failed"
fi

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "DIAGNÓSTICO:"
if ! systemctl is-active --quiet team-manager-ai; then
    echo "❌ Microserviço não está rodando"
    echo "   Possíveis causas:"
    echo "   - Erro de sintaxe no código"
    echo "   - Porta 3001 já em uso"
    echo "   - Dependências faltando"
elif ! curl -s http://localhost:3001/health >/dev/null 2>&1; then
    echo "❌ Microserviço rodando mas não responde"
    echo "   Verificar logs para erros"
else
    echo "✅ Microserviço OK - verificar configuração nginx"
fi

ENDSSH