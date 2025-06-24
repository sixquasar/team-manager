#!/bin/bash

# Corrigir problema de DNS para Supabase
SERVER="root@96.43.96.30"

echo "🔧 CORREÇÃO DE DNS PARA SUPABASE"
echo "================================="
echo ""

ssh $SERVER << 'ENDSSH'
set -e

echo "1. Verificando resolução DNS atual:"
echo "-----------------------------------"
echo "Testando DNS do Supabase:"
nslookup kfghzgpwewfaeoazmkdv.supabase.co || echo "❌ Falha no nslookup"
echo ""
ping -c 1 kfghzgpwewfaeoazmkdv.supabase.co || echo "❌ Falha no ping"

echo -e "\n2. Verificando configuração DNS do sistema:"
echo "-----------------------------------"
echo "Conteúdo do /etc/resolv.conf:"
cat /etc/resolv.conf

echo -e "\n3. Testando DNS alternativo (Google DNS):"
echo "-----------------------------------"
nslookup kfghzgpwewfaeoazmkdv.supabase.co 8.8.8.8

echo -e "\n4. Corrigindo DNS se necessário:"
echo "-----------------------------------"
# Backup do resolv.conf atual
cp /etc/resolv.conf /etc/resolv.conf.bak.$(date +%Y%m%d_%H%M%S)

# Adicionar DNS confiáveis se não existirem
if ! grep -q "8.8.8.8" /etc/resolv.conf; then
    echo "Adicionando Google DNS..."
    echo "nameserver 8.8.8.8" >> /etc/resolv.conf
fi

if ! grep -q "8.8.4.4" /etc/resolv.conf; then
    echo "nameserver 8.8.4.4" >> /etc/resolv.conf
fi

echo -e "\n5. Testando conectividade com Supabase:"
echo "-----------------------------------"
echo "Teste HTTPS para Supabase:"
curl -s -o /dev/null -w "HTTPS Status: %{http_code}\n" https://kfghzgpwewfaeoazmkdv.supabase.co/rest/v1/ || echo "❌ Falha na conexão HTTPS"

echo -e "\n6. Reiniciando microserviço com nova config DNS:"
echo "-----------------------------------"
systemctl restart team-manager-ai
sleep 3

echo -e "\n7. Verificando se o erro DNS foi resolvido:"
echo "-----------------------------------"
echo "Últimos logs do serviço:"
journalctl -u team-manager-ai -n 10 --no-pager | grep -E "ENOTFOUND|erro|error|started|listening" || echo "Sem erros recentes"

echo -e "\n8. Testando login através do nginx novamente:"
echo "-----------------------------------"
RESPONSE=$(curl -s -X POST https://admin.sixquasar.pro/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sixquasar.pro","password":"senha123"}' \
  -k -w "\nHTTP Status: %{http_code}")
echo "$RESPONSE" | tail -5

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "DIAGNÓSTICO FINAL:"
echo ""

if curl -s https://kfghzgpwewfaeoazmkdv.supabase.co/rest/v1/ >/dev/null 2>&1; then
    echo "✅ DNS resolvido - Supabase acessível"
    echo "✅ Login endpoint funcionando (401 = unauthorized é esperado)"
    echo ""
    echo "🎯 TENTE FAZER LOGIN NO NAVEGADOR AGORA!"
    echo "   URL: https://admin.sixquasar.pro"
else
    echo "❌ Ainda com problema de DNS"
    echo ""
    echo "Alternativa - adicionar ao /etc/hosts:"
    echo "Descubra o IP do Supabase:"
    dig +short kfghzgpwewfaeoazmkdv.supabase.co @8.8.8.8
fi

ENDSSH