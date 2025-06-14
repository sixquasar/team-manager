#!/bin/bash

echo "🔧 Corrigindo erro do Nginx - Team Manager"
echo "========================================="

# Remove qualquer configuração antiga
echo "1. Removendo configurações antigas..."
sudo rm -f /etc/nginx/sites-enabled/admin.sixquasar.pro
sudo rm -f /etc/nginx/sites-available/admin.sixquasar.pro
sudo rm -f /etc/nginx/sites-enabled/team-manager
sudo rm -f /etc/nginx/sites-available/team-manager

# Procura e remove qualquer arquivo com must-revalidate
echo "2. Procurando arquivos com 'must-revalidate'..."
sudo grep -l "must-revalidate" /etc/nginx/sites-enabled/* 2>/dev/null | xargs -r sudo rm -f
sudo grep -l "must-revalidate" /etc/nginx/sites-available/* 2>/dev/null | xargs -r sudo rm -f

# Cria nova configuração mínima e funcional
echo "3. Criando nova configuração..."
sudo tee /etc/nginx/sites-available/team-manager > /dev/null << 'NGINX_CONFIG'
server {
    listen 80;
    server_name admin.sixquasar.pro;
    
    root /var/www/team-manager/dist;
    index index.html;
    
    # Logs
    access_log /var/log/nginx/team-manager.access.log;
    error_log /var/log/nginx/team-manager.error.log;
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache para assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public";
    }
}
NGINX_CONFIG

# Cria link simbólico
echo "4. Ativando site..."
sudo ln -sf /etc/nginx/sites-available/team-manager /etc/nginx/sites-enabled/team-manager

# Testa configuração
echo "5. Testando configuração..."
if sudo nginx -t; then
    echo "✅ Configuração válida!"
    
    # Recarrega Nginx
    echo "6. Recarregando Nginx..."
    sudo systemctl reload nginx
    
    echo "✅ Nginx configurado com sucesso!"
    echo ""
    echo "🌐 Acesse: http://admin.sixquasar.pro"
    echo ""
    
    # Verifica status
    if curl -s -o /dev/null -w "%{http_code}" http://admin.sixquasar.pro | grep -q "200\|301\|302"; then
        echo "✅ Site respondendo!"
    else
        echo "⚠️  Site pode levar alguns segundos para ficar disponível"
    fi
else
    echo "❌ Erro na configuração do Nginx"
    echo "Verifique os logs: sudo journalctl -xe"
fi