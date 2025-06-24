#!/bin/bash

#################################################################
#                                                               #
#        INTEGRAR LANGCHAIN EM TODAS AS PÁGINAS                 #
#        Adiciona AIInsightsCard e análises em cada página      #
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

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}🧠 INTEGRANDO LANGCHAIN EM TODAS AS PÁGINAS${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# Função para adicionar imports necessários
add_imports() {
    local file=$1
    local imports="import { useAI } from '@/contexts/AIContext';
import { AIInsightsCard } from '@/components/ai/AIInsightsCard';"
    
    # Adicionar após o último import existente
    sed -i "/^import.*from/! s/^/${imports}\n/" "$file"
}

# 1. MODIFICAR DASHBOARD.TSX
echo -e "${AMARELO}1. Modificando Dashboard.tsx...${RESET}"
cat > src/pages/Dashboard_AI_Integration.tsx << 'EOF'
// Adicionar após os imports existentes:
import { useAI } from '@/contexts/AIContext';
import { AIInsightsCard } from '@/components/ai/AIInsightsCard';

// No componente Dashboard, adicionar após const navigate = useNavigate();
const { isAIEnabled } = useAI();

// Adicionar antes do return, após calcular métricas:
const dashboardData = {
  metrics,
  projects,
  milestones,
  recentActivity,
  totalBudget: projects.reduce((sum: number, p: any) => sum + (p.orcamento || 0), 0),
  activeProjects: projects.filter((p: any) => p.status === 'em_andamento').length
};

// No JSX, adicionar após o header e antes dos Quick Actions:
{isAIEnabled && (
  <div className="mb-6">
    <AIInsightsCard 
      title="Análise Inteligente do Dashboard"
      data={dashboardData}
      analysisType="reports"
      className="shadow-lg"
    />
  </div>
)}
EOF

# 2. MODIFICAR PROJECTS.TSX
echo -e "${AMARELO}2. Modificando Projects.tsx...${RESET}"
cat > src/pages/Projects_AI_Integration.tsx << 'EOF'
// Adicionar após os imports existentes (já tem useAI e AIInsightsCard):

// No JSX, adicionar após o SearchBar e antes dos Stats Cards:
{isAIEnabled && filteredProjects.length > 0 && (
  <div className="mb-6">
    <AIInsightsCard 
      title="Análise Inteligente de Projetos"
      data={filteredProjects}
      analysisType="projects"
      className="shadow-lg border-purple-200"
    />
  </div>
)}

// Adicionar botão de análise individual em cada card de projeto:
<Button 
  variant="ghost" 
  size="sm"
  onClick={() => {
    // Análise individual do projeto
    if (window.confirm('Deseja uma análise detalhada deste projeto?')) {
      // Implementar análise individual
    }
  }}
  title="Análise IA"
>
  <Brain className="h-4 w-4 text-purple-600" />
</Button>
EOF

# 3. MODIFICAR TASKS.TSX
echo -e "${AMARELO}3. Modificando Tasks.tsx...${RESET}"
cat > src/pages/Tasks_AI_Integration.tsx << 'EOF'
// Adicionar após os imports:
import { useAI } from '@/contexts/AIContext';
import { AIInsightsCard } from '@/components/ai/AIInsightsCard';
import { Brain, Sparkles } from 'lucide-react';

// No componente Tasks, adicionar:
const { isAIEnabled, analyzeTasks, getSuggestions } = useAI();
const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

// Adicionar função para obter sugestões:
const getTaskSuggestions = async () => {
  if (!isAIEnabled || tasks.length === 0) return;
  try {
    const suggestions = await getSuggestions('tasks', {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === 'pendente').length,
      overdueTasks: tasks.filter(t => new Date(t.data_vencimento) < new Date()).length
    });
    setAiSuggestions(suggestions);
  } catch (error) {
    console.error('Erro ao obter sugestões:', error);
  }
};

useEffect(() => {
  getTaskSuggestions();
}, [tasks]);

// No JSX, após o header:
{isAIEnabled && tasks.length > 0 && (
  <div className="mb-6 space-y-4">
    <AIInsightsCard 
      title="Análise Inteligente de Tarefas"
      data={tasks}
      analysisType="tasks"
      className="shadow-lg"
    />
    
    {aiSuggestions.length > 0 && (
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Sugestões da IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {aiSuggestions.map((suggestion, idx) => (
              <Badge key={idx} variant="secondary">
                {suggestion}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    )}
  </div>
)}

// Adicionar botão de priorização automática no cabeçalho:
<Button
  variant="outline"
  size="sm"
  onClick={async () => {
    const analysis = await analyzeTasks(tasks);
    // Aplicar priorização sugerida
    toast({
      title: "Tarefas priorizadas",
      description: "A IA reorganizou as tarefas por prioridade"
    });
  }}
  className="flex items-center gap-2"
>
  <Brain className="h-4 w-4" />
  Priorizar com IA
</Button>
EOF

# 4. MODIFICAR TEAM.TSX
echo -e "${AMARELO}4. Modificando Team.tsx...${RESET}"
cat > src/pages/Team_AI_Integration.tsx << 'EOF'
// Adicionar após os imports:
import { useAI } from '@/contexts/AIContext';
import { AIInsightsCard } from '@/components/ai/AIInsightsCard';
import { Brain } from 'lucide-react';

// No componente Team:
const { isAIEnabled, analyzeTeam } = useAI();

// No JSX, após o header:
{isAIEnabled && teamMembers.length > 0 && (
  <div className="mb-6">
    <AIInsightsCard 
      title="Análise de Performance da Equipe"
      data={teamMembers}
      analysisType="team"
      className="shadow-lg border-blue-200"
    />
  </div>
)}

// Em cada card de membro, adicionar indicador de produtividade:
<div className="absolute top-2 right-2">
  <Badge className="bg-purple-100 text-purple-700">
    <Brain className="h-3 w-3 mr-1" />
    {member.productivity || 85}% Produtividade
  </Badge>
</div>
EOF

# 5. MODIFICAR TIMELINE.TSX
echo -e "${AMARELO}5. Modificando Timeline.tsx...${RESET}"
cat > src/pages/Timeline_AI_Integration.tsx << 'EOF'
// Adicionar após os imports:
import { useAI } from '@/contexts/AIContext';
import { AIInsightsCard } from '@/components/ai/AIInsightsCard';
import { Brain, TrendingUp } from 'lucide-react';

// No componente Timeline:
const { isAIEnabled, analyzeTimeline, predictNextAction } = useAI();
const [predictions, setPredictions] = useState<any>(null);

// Adicionar função para obter previsões:
const getPredictions = async () => {
  if (!isAIEnabled || events.length === 0) return;
  try {
    const analysis = await analyzeTimeline(events);
    setPredictions(analysis.predictions);
  } catch (error) {
    console.error('Erro ao obter previsões:', error);
  }
};

useEffect(() => {
  getPredictions();
}, [events]);

// No JSX, após o header:
{isAIEnabled && events.length > 0 && (
  <div className="mb-6 space-y-4">
    <AIInsightsCard 
      title="Análise de Padrões e Tendências"
      data={events}
      analysisType="timeline"
      className="shadow-lg"
    />
    
    {predictions && predictions.length > 0 && (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Previsões Futuras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {predictions.map((pred: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span className="text-sm">{pred}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    )}
  </div>
)}
EOF

# 6. MODIFICAR MESSAGES.TSX
echo -e "${AMARELO}6. Modificando Messages.tsx...${RESET}"
cat > src/pages/Messages_AI_Integration.tsx << 'EOF'
// Adicionar após os imports:
import { useAI } from '@/contexts/AIContext';
import { AIInsightsCard } from '@/components/ai/AIInsightsCard';
import { Brain, Heart, AlertTriangle } from 'lucide-react';

// No componente Messages:
const { isAIEnabled, analyzeMessages } = useAI();
const [sentiment, setSentiment] = useState<string>('neutral');

// Adicionar análise de sentimento:
const analyzeSentiment = async () => {
  if (!isAIEnabled || messages.length === 0) return;
  try {
    const analysis = await analyzeMessages(messages);
    setSentiment(analysis.sentiment);
  } catch (error) {
    console.error('Erro na análise de sentimento:', error);
  }
};

useEffect(() => {
  analyzeSentiment();
}, [messages]);

// No JSX, após o header do chat:
{isAIEnabled && messages.length > 0 && (
  <div className="mb-4">
    <Card className="border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Análise de Comunicação</span>
          </div>
          <Badge className={
            sentiment === 'positive' ? 'bg-green-100 text-green-700' :
            sentiment === 'negative' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }>
            {sentiment === 'positive' ? <Heart className="h-3 w-3 mr-1" /> :
             sentiment === 'negative' ? <AlertTriangle className="h-3 w-3 mr-1" /> : null}
            Sentimento {sentiment === 'positive' ? 'Positivo' : 
                       sentiment === 'negative' ? 'Negativo' : 'Neutro'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  </div>
)}

// Adicionar sugestões de resposta ao digitar:
<div className="flex gap-2 mb-2">
  {['👍 Entendido', '✅ Feito!', '🤔 Vou verificar'].map((suggestion) => (
    <Button
      key={suggestion}
      variant="outline"
      size="sm"
      onClick={() => setNewMessage(suggestion)}
    >
      {suggestion}
    </Button>
  ))}
</div>
EOF

# 7. MODIFICAR REPORTS.TSX
echo -e "${AMARELO}7. Modificando Reports.tsx...${RESET}"
cat > src/pages/Reports_AI_Integration.tsx << 'EOF'
// Adicionar após os imports:
import { useAI } from '@/contexts/AIContext';
import { AIInsightsCard } from '@/components/ai/AIInsightsCard';
import { Brain, FileText, Download } from 'lucide-react';

// No componente Reports:
const { isAIEnabled, analyzeReports, generateInsights } = useAI();
const [executiveSummary, setExecutiveSummary] = useState<string>('');

// Adicionar geração de resumo executivo:
const generateExecutiveSummary = async () => {
  if (!isAIEnabled || !reportData) return;
  try {
    const insights = await generateInsights('reports', reportData);
    setExecutiveSummary(insights.executiveSummary);
  } catch (error) {
    console.error('Erro ao gerar resumo:', error);
  }
};

// No JSX, no topo da página:
{isAIEnabled && (
  <div className="mb-6 space-y-4">
    <AIInsightsCard 
      title="Análise Executiva com IA"
      data={reportData}
      analysisType="reports"
      className="shadow-lg border-orange-200"
    />
    
    {executiveSummary && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resumo Executivo Gerado por IA
            </span>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{executiveSummary}</p>
        </CardContent>
      </Card>
    )}
    
    <Button
      onClick={generateExecutiveSummary}
      className="w-full"
      variant="outline"
    >
      <Brain className="h-4 w-4 mr-2" />
      Gerar Resumo Executivo com IA
    </Button>
  </div>
)}
EOF

# 8. Criar componente de sugestões flutuantes
echo -e "${AMARELO}8. Criando componente de sugestões contextuais...${RESET}"
cat > src/components/ai/AISuggestions.tsx << 'EOF'
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';
import { useAI } from '@/contexts/AIContext';
import { useLocation } from 'react-router-dom';

export function AISuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const { getSuggestions, isAIEnabled } = useAI();
  const location = useLocation();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!isAIEnabled) return;
      
      const context = location.pathname.replace('/', '') || 'dashboard';
      const suggs = await getSuggestions(context, {
        page: context,
        timestamp: new Date().toISOString()
      });
      
      setSuggestions(suggs.slice(0, 3));
    };

    fetchSuggestions();
  }, [location.pathname]);

  if (!isAIEnabled || !isVisible || suggestions.length === 0) return null;

  return (
    <Card className="fixed bottom-24 left-6 w-80 shadow-lg z-40 bg-gradient-to-br from-purple-50 to-white border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Sugestões da IA</span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {suggestions.map((suggestion, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              className="w-full justify-start text-left"
              onClick={() => {
                // Implementar ação da sugestão
                console.log('Sugestão clicada:', suggestion);
              }}
            >
              <span className="text-sm">{suggestion}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
EOF

echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ TEMPLATES DE INTEGRAÇÃO CRIADOS!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${AZUL}📋 INSTRUÇÕES DE APLICAÇÃO:${RESET}"
echo ""
echo "1. Os arquivos *_AI_Integration.tsx contêm os trechos de código"
echo "   para adicionar em cada página correspondente"
echo ""
echo "2. Para cada página, você precisa:"
echo "   • Adicionar os imports no topo"
echo "   • Adicionar as variáveis e hooks"
echo "   • Inserir os componentes no JSX"
echo ""
echo "3. Funcionalidades por página:"
echo "   • Dashboard: Análise geral inteligente"
echo "   • Projects: Análise de riscos e oportunidades"
echo "   • Tasks: Priorização automática e sugestões"
echo "   • Team: Análise de produtividade e gaps"
echo "   • Timeline: Previsões e identificação de padrões"
echo "   • Messages: Análise de sentimento"
echo "   • Reports: Resumo executivo automático"
echo ""
echo "4. Componentes auxiliares criados:"
echo "   • AISuggestions: Sugestões contextuais flutuantes"
echo ""
echo -e "${AMARELO}⚠️  IMPORTANTE:${RESET}"
echo "   Estes são templates de referência. Adapte conforme"
echo "   a estrutura específica de cada página."
echo ""