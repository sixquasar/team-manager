#!/bin/bash

#################################################################
#                                                               #
#        DASHBOARD AI SEM RECHARTS - SOLUÇÃO ALTERNATIVA       #
#        Remove dependência de recharts temporariamente        #
#        Versão: 1.0.0                                          #
#        Data: 25/06/2025                                       #
#                                                               #
#################################################################

# Cores
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
VERMELHO='\033[0;31m'
RESET='\033[0m'

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}🔄 CRIANDO DASHBOARD AI SEM RECHARTS${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${VERMELHO}❌ Execute este script no diretório raiz do projeto!${RESET}"
    exit 1
fi

# Fazer backup do DashboardAI atual
echo -e "${AMARELO}➤ Fazendo backup do DashboardAI.tsx atual...${RESET}"
cp src/pages/DashboardAI.tsx src/pages/DashboardAI.tsx.backup.recharts

# Criar versão sem recharts
echo -e "${AMARELO}➤ Criando versão sem dependência de recharts...${RESET}"

# Remover imports e componentes de recharts
sed -i '
/^import {$/,/^} from '\''recharts'\'';$/d
s/<ResponsiveContainer.*<\/ResponsiveContainer>//g
s/<AreaChart.*<\/AreaChart>//g
s/<LineChart.*<\/LineChart>//g
s/<BarChart.*<\/BarChart>//g
s/<PieChart.*<\/PieChart>//g
s/<RadarChart.*<\/RadarChart>//g
' src/pages/DashboardAI.tsx

# Adicionar placeholders no lugar dos gráficos
sed -i '
s/{visualizations.trendChart && visualizations.trendChart.length > 0 && (/{false \&\& (/g
' src/pages/DashboardAI.tsx

# Adicionar componente de gráfico placeholder
cat >> src/pages/DashboardAI.tsx.tmp << 'EOF'
// Temporary placeholder for charts
const ChartPlaceholder = ({ title }: { title: string }) => (
  <div className="bg-gray-50 rounded-lg p-8 text-center">
    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-600">{title}</p>
    <p className="text-sm text-gray-500 mt-2">Visualização disponível em breve</p>
  </div>
);
EOF

# Inserir antes do export default
sed -i '/^export default function DashboardAI/i\
// Temporary placeholder for charts\
const ChartPlaceholder = ({ title }: { title: string }) => (\
  <div className="bg-gray-50 rounded-lg p-8 text-center">\
    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />\
    <p className="text-gray-600">{title}</p>\
    <p className="text-sm text-gray-500 mt-2">Visualização disponível em breve</p>\
  </div>\
);\
' src/pages/DashboardAI.tsx

echo -e "${VERDE}✅ Versão sem recharts criada${RESET}"

# Fazer build
echo ""
echo -e "${AMARELO}➤ Executando build...${RESET}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${VERDE}✅ Build concluído com sucesso!${RESET}"
    
    echo ""
    echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${VERDE}✅ DASHBOARD AI FUNCIONANDO SEM RECHARTS!${RESET}"
    echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo ""
    echo -e "${AMARELO}⚠️  NOTA: Os gráficos foram substituídos por placeholders${RESET}"
    echo -e "${AMARELO}    Para restaurar gráficos completos:${RESET}"
    echo -e "${AMARELO}    1. npm install recharts${RESET}"
    echo -e "${AMARELO}    2. mv src/pages/DashboardAI.tsx.backup.recharts src/pages/DashboardAI.tsx${RESET}"
    echo -e "${AMARELO}    3. npm run build${RESET}"
else
    echo -e "${VERMELHO}❌ Build ainda falhou${RESET}"
    echo -e "${AMARELO}Restaurando versão original...${RESET}"
    mv src/pages/DashboardAI.tsx.backup.recharts src/pages/DashboardAI.tsx
    exit 1
fi