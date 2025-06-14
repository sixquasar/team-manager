#!/bin/bash

echo "🔧 Corrigindo Nginx Team Manager - Estilo HelioGen"
echo "================================================"

# Criar configuração do Nginx baseada no HelioGen
sudo tee /etc/nginx/sites-available/team-manager > /dev/null << 'EOF'
# Configuração Nginx para Team Manager
server {
    listen 80;
    server_name admin.sixquasar.pro;
    
    root /var/www/team-manager/dist;
    index index.html;
    
    # Logs específicos do Team Manager
    access_log /var/log/nginx/team-manager.access.log;
    error_log /var/log/nginx/team-manager.error.log;
    
    # Configuração SPA para Team Manager - Previne redirecionamento cíclico
    location / {
        try_files $uri $uri/ @fallback;
        
        # Headers de segurança para Team Manager
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    }
    
    # Fallback para SPA - Evita ciclo de redirecionamento
    location @fallback {
        rewrite ^.*$ /index.html last;
    }
    
    # Assets do Team Manager com cache longo
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }
    
    # Compressão para Team Manager
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
EOF

# Remover configurações antigas
echo "Removendo configurações antigas..."
sudo rm -f /etc/nginx/sites-enabled/admin.sixquasar.pro
sudo rm -f /etc/nginx/sites-enabled/team-manager

# Ativar nova configuração
echo "Ativando nova configuração..."
sudo ln -sf /etc/nginx/sites-available/team-manager /etc/nginx/sites-enabled/team-manager

# Testar configuração
echo "Testando configuração..."
if sudo nginx -t; then
    echo "✅ Configuração válida!"
    
    # Recarregar Nginx
    sudo systemctl reload nginx
    echo "✅ Nginx recarregado com sucesso!"
    
    # Verificar se está funcionando
    echo ""
    echo "🌐 Site disponível em: http://admin.sixquasar.pro"
    echo ""
    
    # Verificar resposta
    if curl -I -s http://admin.sixquasar.pro | grep -q "200\|301\|302"; then
        echo "✅ Site respondendo corretamente!"
    else
        echo "⚠️  Aguarde alguns segundos para o site ficar disponível"
    fi
else
    echo "❌ Erro na configuração do Nginx!"
    echo "Verifique o erro acima e corrija manualmente"
fi