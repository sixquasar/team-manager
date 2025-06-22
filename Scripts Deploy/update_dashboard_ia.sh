#!/bin/bash

#################################################################
#                                                               #
#        UPDATE DASHBOARD IA - SCRIPT COMPLETO                  #
#        Atualiza o Team Manager com Dashboard IA               #
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
echo -e "${AZUL}🚀 UPDATE DASHBOARD IA - TEAM MANAGER${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# Função para exibir progresso
progress() {
    echo -e "${AMARELO}➤ $1${RESET}"
}

# Função para exibir sucesso
success() {
    echo -e "${VERDE}✅ $1${RESET}"
}

# Função para exibir erro
error() {
    echo -e "${VERMELHO}❌ $1${RESET}"
}

# 1. Conectar ao servidor e atualizar código
progress "Conectando ao servidor e atualizando código..."

ssh $SERVER << 'ENDSSH'
set -e

cd /var/www/team-manager

echo "📥 Fazendo pull das últimas alterações..."
git pull origin main

echo "📦 Instalando dependências se necessário..."
npm install --legacy-peer-deps

echo "🔨 Fazendo build do projeto..."
npm run build

echo "🔄 Recarregando nginx..."
systemctl reload nginx

echo "✅ Código atualizado com sucesso!"

# Verificar se o Dashboard IA existe
if [ -f "src/pages/DashboardAI.tsx" ]; then
    echo "✅ Dashboard IA encontrado no código!"
else
    echo "⚠️  Dashboard IA não encontrado. Pode ser necessário executar scripts adicionais."
fi

ENDSSH

if [ $? -eq 0 ]; then
    success "Atualização concluída com sucesso!"
else
    error "Erro durante a atualização"
    exit 1
fi

echo ""
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}📊 PRÓXIMOS PASSOS${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo "1. Acesse: https://admin.sixquasar.pro"
echo "2. Faça login normalmente"
echo "3. No menu lateral, procure por 'Dashboard IA' 🧠"
echo "4. Clique para ver o novo dashboard inteligente!"
echo ""
echo -e "${AMARELO}Nota: Se o Dashboard IA não aparecer:${RESET}"
echo "- Limpe o cache do navegador (CTRL+F5)"
echo "- Verifique se o microserviço IA está rodando:"
echo "  ssh $SERVER 'systemctl status team-manager-ai'"
echo ""
echo -e "${VERDE}Dashboard IA Features:${RESET}"
echo "• Análise preditiva com IA"
echo "• Métricas em tempo real"
echo "• Gráficos avançados (Radar, Area, Pie)"
echo "• Insights e recomendações"
echo "• Detecção de anomalias"
echo "• Auto-refresh a cada 5 minutos"
echo ""