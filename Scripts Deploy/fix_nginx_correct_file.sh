#!/bin/bash

# Corrigir nginx encontrando o arquivo correto
SERVER="root@96.43.96.30"

echo "🔧 CORREÇÃO DEFINITIVA DO NGINX PROXY"
echo "===================================="
echo ""

ssh $SERVER << 'ENDSSH'
set -e

echo "1. Descobrindo arquivo de configuração correto:"
echo "----------------------------------------------"
NGINX_SITES="/etc/nginx/sites-available/"
NGINX_ENABLED="/etc/nginx/sites-enabled/"

echo "Sites disponíveis:"
ls -la $NGINX_SITES

echo -e "\nSites habilitados:"
ls -la $NGINX_ENABLED

# Descobrir qual arquivo tem admin.sixquasar.pro
echo -e "\n2. Procurando arquivo com admin.sixquasar.pro:"
echo "----------------------------------------------"
CONFIG_FILE=$(grep -l "admin.sixquasar.pro" $NGINX_SITES* 2>/dev/null | head -1)

if [ -z "$CONFIG_FILE" ]; then
    CONFIG_FILE=$(grep -l "admin.sixquasar.pro" $NGINX_ENABLED* 2>/dev/null | head -1)
fi

if [ -z "$CONFIG_FILE" ]; then
    echo "❌ Não encontrei arquivo com admin.sixquasar.pro!"
    echo "Procurando por qualquer arquivo com server_name..."
    CONFIG_FILE=$(grep -l "server_name" $NGINX_SITES* | head -1)
fi

echo "Arquivo encontrado: $CONFIG_FILE"

if [ -n "$CONFIG_FILE" ]; then
    echo -e "\n3. Verificando configuração atual:"
    echo "----------------------------------------------"
    echo "Server name:"
    grep "server_name" "$CONFIG_FILE" | head -2
    
    echo -e "\nProcurando location /api:"
    grep -A 5 "location /api" "$CONFIG_FILE" 2>/dev/null || echo "❌ Não tem location /api"
    
    echo -e "\n4. Fazendo backup:"
    cp "$CONFIG_FILE" "${CONFIG_FILE}.bak.$(date +%Y%m%d_%H%M%S)"
    
    echo -e "\n5. Corrigindo configuração:"
    echo "----------------------------------------------"
    
    # Verificar se já existe location /api
    if grep -q "location /api" "$CONFIG_FILE"; then
        echo "Removendo configuração /api antiga..."
        # Usar perl para remover bloco location /api completo
        perl -i -0pe 's/\s*location\s+\/api[^{]*\{[^}]*\}//gs' "$CONFIG_FILE"
    fi
    
    # Adicionar nova configuração antes do location /
    # Usar perl para inserir antes do location /
    perl -i -pe 'if (/location\s+\/\s*\{/) {
        print "    # Proxy para microserviço API\n";
        print "    location /api/ {\n";
        print "        proxy_pass http://localhost:3001/api/;\n";
        print "        proxy_http_version 1.1;\n";
        print "        proxy_set_header Upgrade \$http_upgrade;\n";
        print "        proxy_set_header Connection '\''upgrade'\'';\n";
        print "        proxy_set_header Host \$host;\n";
        print "        proxy_cache_bypass \$http_upgrade;\n";
        print "        proxy_set_header X-Real-IP \$remote_addr;\n";
        print "        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\n";
        print "        proxy_set_header X-Forwarded-Proto \$scheme;\n";
        print "        proxy_connect_timeout 60s;\n";
        print "        proxy_send_timeout 60s;\n";
        print "        proxy_read_timeout 60s;\n";
        print "    }\n\n";
    }' "$CONFIG_FILE"
    
    echo -e "\n6. Verificando nova configuração:"
    grep -A 10 "location /api" "$CONFIG_FILE"
    
    echo -e "\n7. Testando configuração nginx:"
    nginx -t
    
    echo -e "\n8. Recarregando nginx:"
    systemctl reload nginx
    
    echo -e "\n9. Testando proxy funcionando:"
    echo "----------------------------------------------"
    sleep 1
    
    echo "Teste 1 - Health check via nginx:"
    curl -s https://admin.sixquasar.pro/api/health -k | python3 -m json.tool && echo "✅ Proxy funcionando!" || echo "❌ Ainda com problema"
    
    echo -e "\nTeste 2 - Endpoint auth via nginx:"
    curl -s -X POST https://admin.sixquasar.pro/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"invalid","password":"invalid"}' \
      -k -w "\nHTTP Status: %{http_code}\n" | tail -2
    
else
    echo "❌ ERRO: Não consegui encontrar arquivo de configuração do nginx!"
    echo "Por favor, verifique manualmente em /etc/nginx/"
fi

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PROCESSO CONCLUÍDO!"
echo ""
echo "Se o proxy está funcionando (status 200 ou 401), teste o login agora!"
echo "URL: https://admin.sixquasar.pro"

ENDSSH