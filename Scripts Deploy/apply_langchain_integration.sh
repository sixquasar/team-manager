#!/bin/bash

#################################################################
#                                                               #
#        APLICAR INTEGRAÇÃO LANGCHAIN EM TODAS AS PÁGINAS       #
#        Versão: 1.0.0                                          #
#        Data: 23/06/2025                                       #
#                                                               #
#################################################################

# Cores
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
VERMELHO='\033[0;31m'
RESET='\033[0m'

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}🧠 APLICANDO INTEGRAÇÃO LANGCHAIN${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# Diretório base
BASE_DIR="/Users/landim/.npm-global/lib/node_modules/@anthropic-ai/team-manager-sixquasar"
cd "$BASE_DIR"

# Função para sucesso
success() {
    echo -e "${VERDE}✅ $1${RESET}"
}

# Função para erro
error() {
    echo -e "${VERMELHO}❌ $1${RESET}"
}

# Função para progresso
progress() {
    echo -e "${AMARELO}➤ $1${RESET}"
}

echo ""
progress "Verificando arquivos existentes..."

# Verificar se arquivos principais existem
if [ ! -f "src/contexts/AIContext.tsx" ]; then
    error "AIContext.tsx não encontrado!"
    exit 1
fi

if [ ! -f "src/components/ai/AIInsightsCard.tsx" ]; then
    error "AIInsightsCard.tsx não encontrado!"
    exit 1
fi

if [ ! -f "src/components/ai/AIAssistantButton.tsx" ]; then
    error "AIAssistantButton.tsx não encontrado!"
    exit 1
fi

success "Arquivos de IA encontrados!"

echo ""
progress "Aplicando integração nas páginas..."

# 1. Dashboard.tsx
echo -e "${AMARELO}1. Integrando Dashboard...${RESET}"
if [ -f "src/pages/Dashboard.tsx" ]; then
    # Fazer backup
    cp src/pages/Dashboard.tsx src/pages/Dashboard.tsx.backup
    
    # Adicionar imports se não existirem
    if ! grep -q "useAI" src/pages/Dashboard.tsx; then
        sed -i '' '1s/^/import { useAI } from "@\/contexts\/AIContext";\nimport { AIInsightsCard } from "@\/components\/ai\/AIInsightsCard";\n/' src/pages/Dashboard.tsx
    fi
    
    success "Dashboard integrado!"
else
    error "Dashboard.tsx não encontrado"
fi

# 2. Tasks.tsx  
echo -e "${AMARELO}2. Integrando Tasks...${RESET}"
if [ -f "src/pages/Tasks.tsx" ]; then
    cp src/pages/Tasks.tsx src/pages/Tasks.tsx.backup
    
    if ! grep -q "useAI" src/pages/Tasks.tsx; then
        sed -i '' '1s/^/import { useAI } from "@\/contexts\/AIContext";\nimport { AIInsightsCard } from "@\/components\/ai\/AIInsightsCard";\n/' src/pages/Tasks.tsx
    fi
    
    success "Tasks integrado!"
else
    error "Tasks.tsx não encontrado"
fi

# 3. Team.tsx
echo -e "${AMARELO}3. Integrando Team...${RESET}"
if [ -f "src/pages/Team.tsx" ]; then
    cp src/pages/Team.tsx src/pages/Team.tsx.backup
    
    if ! grep -q "useAI" src/pages/Team.tsx; then
        sed -i '' '1s/^/import { useAI } from "@\/contexts\/AIContext";\nimport { AIInsightsCard } from "@\/components\/ai\/AIInsightsCard";\n/' src/pages/Team.tsx
    fi
    
    success "Team integrado!"
else
    error "Team.tsx não encontrado"
fi

# 4. Timeline.tsx
echo -e "${AMARELO}4. Integrando Timeline...${RESET}"
if [ -f "src/pages/Timeline.tsx" ]; then
    cp src/pages/Timeline.tsx src/pages/Timeline.tsx.backup
    
    if ! grep -q "useAI" src/pages/Timeline.tsx; then
        sed -i '' '1s/^/import { useAI } from "@\/contexts\/AIContext";\nimport { AIInsightsCard } from "@\/components\/ai\/AIInsightsCard";\n/' src/pages/Timeline.tsx
    fi
    
    success "Timeline integrado!"
else
    error "Timeline.tsx não encontrado"
fi

# 5. Messages.tsx
echo -e "${AMARELO}5. Integrando Messages...${RESET}"
if [ -f "src/pages/Messages.tsx" ]; then
    cp src/pages/Messages.tsx src/pages/Messages.tsx.backup
    
    if ! grep -q "useAI" src/pages/Messages.tsx; then
        sed -i '' '1s/^/import { useAI } from "@\/contexts\/AIContext";\nimport { AIInsightsCard } from "@\/components\/ai\/AIInsightsCard";\n/' src/pages/Messages.tsx
    fi
    
    success "Messages integrado!"
else
    error "Messages.tsx não encontrado"
fi

# 6. Reports.tsx
echo -e "${AMARELO}6. Integrando Reports...${RESET}"
if [ -f "src/pages/Reports.tsx" ]; then
    cp src/pages/Reports.tsx src/pages/Reports.tsx.backup
    
    if ! grep -q "useAI" src/pages/Reports.tsx; then
        sed -i '' '1s/^/import { useAI } from "@\/contexts\/AIContext";\nimport { AIInsightsCard } from "@\/components\/ai\/AIInsightsCard";\n/' src/pages/Reports.tsx
    fi
    
    success "Reports integrado!"
else
    error "Reports.tsx não encontrado"
fi

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ INTEGRAÇÃO APLICADA!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${AZUL}📋 RESUMO:${RESET}"
echo ""
echo "✓ AIContext criado e configurado"
echo "✓ AIInsightsCard disponível para todas as páginas"
echo "✓ AIAssistantButton flutuante ativo"
echo "✓ Imports adicionados em todas as páginas"
echo ""
echo -e "${AMARELO}⚠️  PRÓXIMOS PASSOS:${RESET}"
echo ""
echo "1. Editar cada página para adicionar o componente AIInsightsCard"
echo "2. Passar os dados corretos para cada análise"
echo "3. Configurar OPENAI_API_KEY no servidor"
echo "4. Executar npm run build"
echo ""
echo -e "${AZUL}💡 EXEMPLO DE USO:${RESET}"
echo ""
echo "const { isAIEnabled } = useAI();"
echo ""
echo "{isAIEnabled && data.length > 0 && ("
echo "  <AIInsightsCard"
echo "    title=\"Análise Inteligente\""
echo "    data={data}"
echo "    analysisType=\"tasks\""
echo "    className=\"shadow-lg\""
echo "  />"
echo ")}"
echo ""

# Criar arquivo de exemplo de integração completa
cat > src/examples/IntegrationExample.tsx << 'EOF'
// EXEMPLO DE INTEGRAÇÃO COMPLETA EM UMA PÁGINA

import React, { useState, useEffect } from 'react';
import { useAI } from '@/contexts/AIContext';
import { AIInsightsCard } from '@/components/ai/AIInsightsCard';
import { Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ExamplePage() {
  const { 
    isAIEnabled, 
    analyzeTasks, 
    getSuggestions,
    aiModel
  } = useAI();
  
  const [data, setData] = useState([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Buscar sugestões quando a página carrega
  useEffect(() => {
    const loadSuggestions = async () => {
      if (isAIEnabled) {
        const suggs = await getSuggestions('example', { page: 'example' });
        setSuggestions(suggs);
      }
    };
    loadSuggestions();
  }, [isAIEnabled]);
  
  // Análise manual
  const handleAnalyze = async () => {
    const analysis = await analyzeTasks(data);
    console.log('Análise:', analysis);
  };
  
  return (
    <div className="space-y-6">
      {/* Header com indicador de IA */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Página de Exemplo</h1>
        {isAIEnabled && (
          <Badge className="bg-purple-100 text-purple-700">
            <Brain className="h-3 w-3 mr-1" />
            IA Ativa ({aiModel})
          </Badge>
        )}
      </div>
      
      {/* Card de Análise IA */}
      {isAIEnabled && data.length > 0 && (
        <AIInsightsCard
          title="Análise Inteligente"
          data={data}
          analysisType="tasks"
          className="shadow-lg"
        />
      )}
      
      {/* Sugestões da IA */}
      {isAIEnabled && suggestions.length > 0 && (
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-medium flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            Sugestões da IA
          </h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((sug, idx) => (
              <Badge key={idx} variant="secondary">
                {sug}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Botão de análise manual */}
      <Button onClick={handleAnalyze} variant="outline">
        <Brain className="h-4 w-4 mr-2" />
        Analisar com IA
      </Button>
      
      {/* Resto do conteúdo da página */}
      <div>
        {/* Seu conteúdo aqui */}
      </div>
    </div>
  );
}
EOF

success "Arquivo de exemplo criado em src/examples/IntegrationExample.tsx"
echo ""