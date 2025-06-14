#!/bin/bash

echo "🔧 CORREÇÃO DEFINITIVA DO NGINX - TEAM MANAGER"
echo "=============================================="
echo ""

# 1. PARAR NGINX
echo "1️⃣ Parando Nginx..."
sudo systemctl stop nginx

# 2. ENCONTRAR E REMOVER QUALQUER ARQUIVO COM must-revalidate
echo "2️⃣ Procurando e removendo TODOS os arquivos com 'must-revalidate'..."
echo ""

# Procurar em todo o sistema de configuração do Nginx
echo "Arquivos encontrados com 'must-revalidate':"
sudo find /etc/nginx -type f -exec grep -l "must-revalidate" {} \; 2>/dev/null

# Remover todos os arquivos que contêm must-revalidate
sudo find /etc/nginx -type f -exec grep -l "must-revalidate" {} \; 2>/dev/null | while read file; do
    echo "❌ Removendo: $file"
    sudo rm -f "$file"
done

# 3. LIMPAR TODAS AS CONFIGURAÇÕES DO TEAM MANAGER
echo ""
echo "3️⃣ Limpando TODAS as configurações antigas..."
sudo rm -f /etc/nginx/sites-enabled/team-manager*
sudo rm -f /etc/nginx/sites-enabled/admin.sixquasar.pro
sudo rm -f /etc/nginx/sites-available/team-manager*
sudo rm -f /etc/nginx/sites-available/admin.sixquasar.pro
sudo rm -f /etc/nginx/conf.d/team-manager*
sudo rm -f /etc/nginx/conf.d/admin.sixquasar.pro*

# 4. CRIAR CONFIGURAÇÃO MÍNIMA E FUNCIONAL
echo ""
echo "4️⃣ Criando configuração NOVA e LIMPA..."

sudo tee /etc/nginx/sites-available/teammanager > /dev/null << 'EOF'
server {
    listen 80;
    server_name admin.sixquasar.pro;
    
    root /var/www/team-manager/dist;
    index index.html;
    
    location / {
        try_files $uri /index.html;
    }
}
EOF

# 5. ATIVAR A CONFIGURAÇÃO
echo ""
echo "5️⃣ Ativando configuração..."
sudo ln -sf /etc/nginx/sites-available/teammanager /etc/nginx/sites-enabled/

# 6. VERIFICAR SE AINDA HÁ must-revalidate EM ALGUM LUGAR
echo ""
echo "6️⃣ Verificação final por 'must-revalidate'..."
if sudo grep -r "must-revalidate" /etc/nginx/ 2>/dev/null; then
    echo "❌ AINDA HÁ ARQUIVOS COM must-revalidate!"
    echo "Removendo manualmente..."
    sudo grep -r "must-revalidate" /etc/nginx/ 2>/dev/null | cut -d: -f1 | sort -u | while read file; do
        echo "Removendo: $file"
        sudo rm -f "$file"
    done
else
    echo "✅ Nenhum arquivo com must-revalidate encontrado!"
fi

# 7. TESTAR CONFIGURAÇÃO
echo ""
echo "7️⃣ Testando configuração..."
if sudo nginx -t; then
    echo "✅ Configuração válida!"
    
    # 8. INICIAR NGINX
    echo ""
    echo "8️⃣ Iniciando Nginx..."
    sudo systemctl start nginx
    sudo systemctl reload nginx
    
    echo ""
    echo "✅ NGINX CORRIGIDO COM SUCESSO!"
    echo ""
    echo "🌐 Acesse: http://admin.sixquasar.pro"
    echo ""
    
    # Verificar se está respondendo
    sleep 2
    if curl -I -s http://admin.sixquasar.pro | grep -q "200\|301\|302\|304"; then
        echo "✅ Site está respondendo!"
    else
        echo "⚠️  Site pode levar alguns segundos para ficar disponível"
    fi
else
    echo ""
    echo "❌ ERRO na configuração!"
    echo ""
    echo "📋 Verificando qual é o problema..."
    sudo nginx -T 2>&1 | grep -A5 -B5 "error\|emerg\|must-revalidate"
    
    echo ""
    echo "🔍 Listando TODOS os arquivos de configuração ativos:"
    sudo ls -la /etc/nginx/sites-enabled/
    sudo ls -la /etc/nginx/conf.d/
fi

echo ""
echo "📝 Para verificar logs:"
echo "sudo tail -f /var/log/nginx/error.log"