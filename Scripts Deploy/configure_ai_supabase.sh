#!/bin/bash

#################################################################
#                                                               #
#        CONFIGURAR SUPABASE NO MICROSERVIÇO IA               #
#        Adiciona variáveis de ambiente necessárias            #
#        Versão: 1.0.0                                          #
#        Data: 22/06/2025                                       #
#                                                               #
#################################################################

# Cores
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
VERMELHO='\033[0;31m'
RESET='\033[0m'

SERVER="root@96.43.96.30"

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}🔧 CONFIGURANDO SUPABASE NO MICROSERVIÇO IA${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

echo -e "${AMARELO}Primeiro, preciso das suas credenciais do Supabase.${RESET}"
echo -e "${AMARELO}Você pode encontrar em: Settings > API no dashboard do Supabase${RESET}"
echo ""

# Solicitar URL do Supabase
read -p "Digite a URL do seu projeto Supabase (ex: https://xxxxx.supabase.co): " SUPABASE_URL
if [ -z "$SUPABASE_URL" ]; then
    echo -e "${VERMELHO}URL não pode ser vazia!${RESET}"
    exit 1
fi

# Solicitar Anon Key
echo ""
echo -e "${AMARELO}A anon key é a chave pública (geralmente começa com 'eyJ')${RESET}"
read -p "Digite a ANON KEY do Supabase: " SUPABASE_ANON_KEY
if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo -e "${VERMELHO}Anon Key não pode ser vazia!${RESET}"
    exit 1
fi

echo ""
echo -e "${AZUL}Configurando no servidor...${RESET}"

ssh $SERVER << ENDSSH
cd /var/www/team-manager-ai

echo -e "\033[1;33m1. Verificando .env existente...\033[0m"
if [ -f .env ]; then
    echo "Arquivo .env encontrado"
    # Fazer backup
    cp .env .env.bak
else
    echo "Criando novo arquivo .env"
    touch .env
fi

echo -e "\033[1;33m2. Adicionando variáveis do Supabase...\033[0m"

# Remover variáveis antigas se existirem
sed -i '/^SUPABASE_URL=/d' .env
sed -i '/^SUPABASE_ANON_KEY=/d' .env

# Adicionar novas variáveis
echo "" >> .env
echo "# Supabase Configuration" >> .env
echo "SUPABASE_URL=$SUPABASE_URL" >> .env
echo "SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> .env

echo -e "\033[1;33m3. Verificando se OpenAI key existe...\033[0m"
if ! grep -q "OPENAI_API_KEY" .env; then
    echo "⚠️  OPENAI_API_KEY não encontrada no .env"
    echo "Copiando do .env principal se existir..."
    
    if [ -f /var/www/team-manager/.env ]; then
        OPENAI_KEY=\$(grep "OPENAI_API_KEY" /var/www/team-manager/.env | cut -d '=' -f2)
        if [ ! -z "\$OPENAI_KEY" ]; then
            echo "OPENAI_API_KEY=\$OPENAI_KEY" >> .env
            echo "✅ OpenAI key copiada"
        fi
    fi
else
    echo "✅ OpenAI key já configurada"
fi

echo -e "\033[1;33m4. Mostrando configuração final (sem mostrar keys completas)...\033[0m"
echo "SUPABASE_URL: \$(grep SUPABASE_URL .env | cut -d '=' -f2 | sed 's/\(.\{20\}\).*/\1.../')"
echo "SUPABASE_ANON_KEY: \$(grep SUPABASE_ANON_KEY .env | cut -d '=' -f2 | sed 's/\(.\{20\}\).*/\1.../')"
echo "OPENAI_API_KEY: \$(grep OPENAI_API_KEY .env | cut -d '=' -f2 | sed 's/\(.\{20\}\).*/\1.../')"

echo -e "\033[1;33m5. Reiniciando microserviço IA...\033[0m"
systemctl restart team-manager-ai

echo -e "\033[1;33m6. Aguardando inicialização...\033[0m"
sleep 5

echo -e "\033[1;33m7. Verificando status...\033[0m"
if systemctl is-active --quiet team-manager-ai; then
    echo -e "\033[0;32m✅ Microserviço rodando\033[0m"
    
    # Verificar logs
    echo -e "\033[1;33m8. Últimos logs...\033[0m"
    journalctl -u team-manager-ai -n 20 --no-pager | tail -10
else
    echo -e "\033[0;31m❌ Microserviço não está rodando!\033[0m"
    echo "Logs de erro:"
    journalctl -u team-manager-ai -n 30 --no-pager | grep -i error
fi

ENDSSH

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ CONFIGURAÇÃO CONCLUÍDA!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${AZUL}Agora execute novamente o teste:${RESET}"
echo "./Scripts\\ Deploy/test_dashboard_ai_endpoint.sh"
echo ""