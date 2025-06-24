#!/bin/bash

# Verificar configuração do frontend após fix nuclear
SERVER="root@96.43.96.30"

echo "🔍 VERIFICAÇÃO DE CONFIGURAÇÃO DO FRONTEND"
echo "=========================================="
echo ""

ssh $SERVER << 'ENDSSH'
set -e

echo "1. VERIFICANDO ESTRUTURA DO FRONTEND"
echo "====================================="
echo "Diretório principal:"
ls -la /var/www/team-manager-sixquasar/ | head -10

echo -e "\n2. VERIFICANDO ARQUIVO .ENV"
echo "====================================="
if [ -f "/var/www/team-manager-sixquasar/.env" ]; then
    echo "✅ Arquivo .env existe"
    echo ""
    echo "Conteúdo (ocultando valores sensíveis):"
    cat /var/www/team-manager-sixquasar/.env | sed -E 's/(=)(.+)/\1***/'
    echo ""
    echo "Permissões do .env:"
    ls -la /var/www/team-manager-sixquasar/.env
else
    echo "❌ Arquivo .env NÃO ENCONTRADO!"
    echo ""
    echo "Procurando .env.example:"
    if [ -f "/var/www/team-manager-sixquasar/.env.example" ]; then
        echo "✅ .env.example encontrado"
        echo "Copiando .env.example para .env..."
        cp /var/www/team-manager-sixquasar/.env.example /var/www/team-manager-sixquasar/.env
        echo "Por favor, configure as variáveis no .env!"
    fi
fi

echo -e "\n3. VERIFICANDO BUILD DO FRONTEND"
echo "====================================="
if [ -d "/var/www/team-manager-sixquasar/dist" ]; then
    echo "✅ Diretório dist existe"
    echo "Data da última build:"
    stat -c "Build: %y" /var/www/team-manager-sixquasar/dist/index.html 2>/dev/null || echo "index.html não encontrado"
    echo ""
    echo "Arquivos principais:"
    ls -la /var/www/team-manager-sixquasar/dist/ | grep -E "index.html|assets" | head -5
else
    echo "❌ Diretório dist NÃO existe!"
    echo "O frontend precisa ser buildado"
fi

echo -e "\n4. VERIFICANDO NGINX CONFIG"
echo "====================================="
echo "Site habilitado:"
ls -la /etc/nginx/sites-enabled/ | grep sixquasar || echo "Nenhum site sixquasar habilitado"

echo -e "\nÚltimas linhas da config:"
if [ -f "/etc/nginx/sites-available/sixquasar" ]; then
    tail -20 /etc/nginx/sites-available/sixquasar
fi

echo -e "\n5. TESTANDO ENDPOINTS CRÍTICOS"
echo "====================================="
echo "Testando rotas do frontend:"
for route in "/" "/login" "/api/health"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://admin.sixquasar.pro$route)
    echo "- https://admin.sixquasar.pro$route: $STATUS"
done

echo -e "\n6. VERIFICANDO CONEXÃO COM SUPABASE NO BUILD"
echo "====================================="
if [ -f "/var/www/team-manager-sixquasar/dist/assets/index-"*.js ]; then
    echo "Procurando URL do Supabase no build:"
    grep -o "supabase.co" /var/www/team-manager-sixquasar/dist/assets/index-*.js | head -1 && echo "✅ Supabase URL encontrada no build" || echo "❌ Supabase URL não encontrada"
fi

echo -e "\n7. AÇÕES CORRETIVAS SUGERIDAS"
echo "====================================="
echo "Se o login não está funcionando:"
echo ""
echo "1. Verificar .env:"
echo "   nano /var/www/team-manager-sixquasar/.env"
echo ""
echo "2. Rebuild do frontend (se necessário):"
echo "   cd /var/www/team-manager-sixquasar"
echo "   npm run build"
echo ""
echo "3. Limpar cache do navegador:"
echo "   - Abrir em aba anônima/privada"
echo "   - Ou limpar dados do site"
echo ""
echo "4. Verificar console do navegador (F12):"
echo "   - Procurar por erros de CORS"
echo "   - Verificar se Supabase está sendo chamado"

ENDSSH

echo ""
echo "✅ Verificação concluída!"