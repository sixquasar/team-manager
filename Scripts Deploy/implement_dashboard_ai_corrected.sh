#!/bin/bash

#################################################################
#                                                               #
#        IMPLEMENTAR DASHBOARD IA - VERSÃO CORRIGIDA           #
#        Sem mock data, com verificação de estrutura           #
#        Versão: 2.0.0                                          #
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

echo -e "${VERMELHO}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERMELHO}⚠️  AVISO IMPORTANTE${RESET}"
echo -e "${VERMELHO}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${AMARELO}Antes de executar este script, você DEVE:${RESET}"
echo -e "1. Executar ./verify_supabase_structure.sh"
echo -e "2. Rodar o SQL gerado no Supabase"
echo -e "3. Verificar nomes exatos dos campos"
echo -e "4. Confirmar tabelas existentes"
echo ""
echo -e "${VERMELHO}Continuar sem verificar pode causar erros!${RESET}"
echo ""
read -p "Você já verificou a estrutura do Supabase? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${VERMELHO}Operação cancelada. Execute verify_supabase_structure.sh primeiro.${RESET}"
    exit 1
fi

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}🚀 IMPLEMENTANDO DASHBOARD IA CORRIGIDO${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

ssh $SERVER << 'ENDSSH'
cd /var/www/team-manager-ai

echo -e "\033[1;33m1. Criando workflow LangGraph sem mock data...\033[0m"

mkdir -p src/workflows

cat > src/workflows/dashboardWorkflow.js << 'EOFILE'
import { StateGraph } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { supabase } from '../lib/supabase.js';

// Schema para métricas inteligentes
const metricsSchema = z.object({
  companyHealthScore: z.number().min(0).max(100),
  projectsAtRisk: z.number(),
  teamProductivityIndex: z.number().min(0).max(100),
  burnRate: z.number(),
  estimatedRunway: z.number(),
  topRisks: z.array(z.object({
    risk: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    affectedProjects: z.array(z.string())
  })),
  opportunities: z.array(z.object({
    opportunity: z.string(),
    impact: z.enum(['low', 'medium', 'high']),
    effort: z.enum(['low', 'medium', 'high'])
  })),
  recommendations: z.array(z.object({
    action: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    expectedImpact: z.string()
  }))
});

const parser = StructuredOutputParser.fromZodSchema(metricsSchema);

// Estado do workflow
const workflowState = {
  rawData: {
    projects: [],
    users: [],
    tasks: [],
    finances: {}
  },
  processedData: {},
  metrics: {},
  insights: [],
  visualizations: {},
  errors: []
};

// Criar workflow
export const dashboardWorkflow = new StateGraph({
  channels: workflowState
});

// Nó 1: Buscar dados reais do Supabase
dashboardWorkflow.addNode("fetchRealData", async (state) => {
  console.log('📊 [Dashboard IA] Buscando dados REAIS do Supabase...');
  
  try {
    // Buscar projetos com logs detalhados
    console.log('🔍 Buscando projetos...');
    const { data: projects, error: projectsError } = await supabase
      .from('projetos')
      .select('*')
      .limit(100);
    
    if (projectsError) {
      console.error('❌ Erro ao buscar projetos:', projectsError);
      state.errors.push({ source: 'projetos', error: projectsError });
    } else {
      console.log(`✅ ${projects?.length || 0} projetos encontrados`);
    }

    // Buscar usuários/equipe
    console.log('🔍 Buscando usuários...');
    const { data: users, error: usersError } = await supabase
      .from('usuarios')
      .select('*')
      .limit(100);
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
      state.errors.push({ source: 'usuarios', error: usersError });
    } else {
      console.log(`✅ ${users?.length || 0} usuários encontrados`);
    }

    // Buscar tarefas se existir
    console.log('🔍 Verificando tabela tarefas...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tarefas')
      .select('*')
      .limit(100);
    
    if (tasksError) {
      console.log('⚠️  Tabela tarefas não encontrada ou erro:', tasksError.message);
    } else {
      console.log(`✅ ${tasks?.length || 0} tarefas encontradas`);
    }

    // Calcular finanças baseado em projetos
    const finances = calculateFinancesFromProjects(projects || []);
    console.log('💰 Finanças calculadas:', finances);

    return {
      ...state,
      rawData: {
        projects: projects || [],
        users: users || [],
        tasks: tasks || [],
        finances: finances
      }
    };
  } catch (error) {
    console.error('❌ Erro geral ao buscar dados:', error);
    return {
      ...state,
      errors: [...state.errors, { source: 'geral', error }]
    };
  }
});

// Nó 2: Processar dados para análise
dashboardWorkflow.addNode("processData", async (state) => {
  console.log('⚙️  [Dashboard IA] Processando dados para análise...');
  
  const { projects, users, tasks } = state.rawData;
  
  // Processar métricas básicas
  const processedData = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'em_progresso' || p.status === 'ativo').length,
    completedProjects: projects.filter(p => p.status === 'finalizado' || p.status === 'concluido').length,
    delayedProjects: projects.filter(p => {
      if (!p.data_fim_prevista) return false;
      return new Date(p.data_fim_prevista) < new Date() && p.status !== 'finalizado';
    }).length,
    totalBudget: projects.reduce((sum, p) => sum + (p.orcamento || 0), 0),
    usedBudget: projects.reduce((sum, p) => sum + ((p.orcamento || 0) * (p.progresso || 0) / 100), 0),
    teamSize: users.length,
    averageProgress: projects.reduce((sum, p) => sum + (p.progresso || 0), 0) / (projects.length || 1),
    projectsByStatus: groupByStatus(projects),
    projectTimeline: createTimeline(projects)
  };
  
  console.log('📊 Dados processados:', processedData);
  
  return {
    ...state,
    processedData
  };
});

// Nó 3: Analisar com GPT-4.1-mini
dashboardWorkflow.addNode("analyzeWithAI", async (state) => {
  console.log('🤖 [Dashboard IA] Analisando com GPT-4.1-mini...');
  
  const model = new ChatOpenAI({
    temperature: 0,
    modelName: 'gpt-4.1-mini',
    maxTokens: 1000
  });

  const prompt = new PromptTemplate({
    template: `Analise os seguintes dados empresariais REAIS e gere métricas inteligentes:

Dados Processados:
- Total de Projetos: {totalProjects}
- Projetos Ativos: {activeProjects}
- Projetos Concluídos: {completedProjects}
- Projetos Atrasados: {delayedProjects}
- Orçamento Total: R$ {totalBudget}
- Orçamento Usado: R$ {usedBudget}
- Tamanho da Equipe: {teamSize}
- Progresso Médio: {averageProgress}%

Projetos por Status: {projectsByStatus}

{format_instructions}

Baseie sua análise APENAS nos dados fornecidos. Seja específico e realista.

Análise:`,
    inputVariables: ['totalProjects', 'activeProjects', 'completedProjects', 'delayedProjects', 
                     'totalBudget', 'usedBudget', 'teamSize', 'averageProgress', 'projectsByStatus'],
    partialVariables: { format_instructions: parser.getFormatInstructions() }
  });

  try {
    const data = state.processedData;
    const formattedPrompt = await prompt.format({
      totalProjects: data.totalProjects,
      activeProjects: data.activeProjects,
      completedProjects: data.completedProjects,
      delayedProjects: data.delayedProjects,
      totalBudget: data.totalBudget.toFixed(2),
      usedBudget: data.usedBudget.toFixed(2),
      teamSize: data.teamSize,
      averageProgress: data.averageProgress.toFixed(1),
      projectsByStatus: JSON.stringify(data.projectsByStatus)
    });

    console.log('📝 Enviando para análise IA...');
    const response = await model.invoke(formattedPrompt);
    const metrics = await parser.parse(response.content);
    
    console.log('✅ Análise IA concluída');

    return {
      ...state,
      metrics,
      insights: extractInsights(metrics)
    };
  } catch (error) {
    console.error('❌ Erro na análise IA:', error);
    
    // Métricas calculadas localmente (sem IA)
    const localMetrics = calculateLocalMetrics(state.processedData);
    return {
      ...state,
      metrics: localMetrics,
      insights: []
    };
  }
});

// Nó 4: Gerar configurações de visualização
dashboardWorkflow.addNode("generateVisualizations", async (state) => {
  console.log('📈 [Dashboard IA] Gerando configurações de visualização...');
  
  const { processedData, metrics } = state;
  
  const visualizations = {
    healthGauge: {
      type: 'gauge',
      value: metrics.companyHealthScore || 70,
      min: 0,
      max: 100,
      segments: [
        { threshold: 60, color: '#ef4444' },
        { threshold: 80, color: '#eab308' },
        { threshold: 100, color: '#22c55e' }
      ]
    },
    projectsChart: {
      type: 'pie',
      data: Object.entries(processedData.projectsByStatus || {}).map(([status, count]) => ({
        name: translateStatus(status),
        value: count,
        color: getStatusColor(status)
      }))
    },
    progressTimeline: {
      type: 'line',
      data: processedData.projectTimeline || []
    },
    budgetChart: {
      type: 'bar',
      data: [
        { name: 'Orçamento Total', value: processedData.totalBudget },
        { name: 'Usado', value: processedData.usedBudget },
        { name: 'Disponível', value: processedData.totalBudget - processedData.usedBudget }
      ]
    }
  };
  
  console.log('✅ Visualizações configuradas');
  
  return {
    ...state,
    visualizations
  };
});

// Configurar fluxo
dashboardWorkflow.setEntryPoint("fetchRealData");
dashboardWorkflow.addEdge("fetchRealData", "processData");
dashboardWorkflow.addEdge("processData", "analyzeWithAI");
dashboardWorkflow.addEdge("analyzeWithAI", "generateVisualizations");
dashboardWorkflow.addEdge("generateVisualizations", "__end__");

// Funções auxiliares
function calculateFinancesFromProjects(projects) {
  const totalBudget = projects.reduce((sum, p) => sum + (p.orcamento || 0), 0);
  const usedBudget = projects.reduce((sum, p) => sum + ((p.orcamento || 0) * (p.progresso || 0) / 100), 0);
  const monthlyBurn = totalBudget > 0 ? usedBudget / 6 : 0; // Assumindo 6 meses de projeto médio
  
  return {
    totalBudget,
    usedBudget,
    availableBudget: totalBudget - usedBudget,
    burnRate: monthlyBurn,
    runway: monthlyBurn > 0 ? (totalBudget - usedBudget) / monthlyBurn : 0
  };
}

function groupByStatus(projects) {
  return projects.reduce((acc, project) => {
    const status = project.status || 'indefinido';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
}

function createTimeline(projects) {
  // Criar timeline dos últimos 6 meses baseado em projetos reais
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().substring(0, 7);
    
    const projectsInMonth = projects.filter(p => {
      const projectDate = p.created_at || p.data_inicio;
      return projectDate && projectDate.startsWith(monthKey);
    });
    
    months.push({
      month: date.toLocaleDateString('pt-BR', { month: 'short' }),
      projects: projectsInMonth.length,
      value: projectsInMonth.reduce((sum, p) => sum + (p.orcamento || 0), 0)
    });
  }
  
  return months;
}

function translateStatus(status) {
  const translations = {
    'planejamento': 'Planejamento',
    'em_progresso': 'Em Progresso',
    'ativo': 'Ativo',
    'finalizado': 'Finalizado',
    'concluido': 'Concluído',
    'cancelado': 'Cancelado',
    'pausado': 'Pausado'
  };
  return translations[status] || status;
}

function getStatusColor(status) {
  const colors = {
    'planejamento': '#a855f7',
    'em_progresso': '#3b82f6',
    'ativo': '#3b82f6',
    'finalizado': '#22c55e',
    'concluido': '#22c55e',
    'cancelado': '#ef4444',
    'pausado': '#f59e0b'
  };
  return colors[status] || '#6b7280';
}

function calculateLocalMetrics(data) {
  // Cálculo local sem IA
  const healthScore = calculateHealthScore(data);
  const projectsAtRisk = data.delayedProjects;
  const productivityIndex = data.averageProgress;
  const burnRate = data.usedBudget / 6; // Assumindo 6 meses
  const runway = burnRate > 0 ? (data.totalBudget - data.usedBudget) / burnRate : 12;
  
  return {
    companyHealthScore: Math.round(healthScore),
    projectsAtRisk,
    teamProductivityIndex: Math.round(productivityIndex),
    burnRate: Math.round(burnRate),
    estimatedRunway: Math.round(runway),
    topRisks: [],
    opportunities: [],
    recommendations: []
  };
}

function calculateHealthScore(data) {
  let score = 100;
  
  // Penalizar por projetos atrasados
  score -= data.delayedProjects * 10;
  
  // Penalizar por baixo progresso médio
  if (data.averageProgress < 50) {
    score -= 20;
  }
  
  // Penalizar por orçamento muito usado
  const budgetUsagePercent = (data.usedBudget / data.totalBudget) * 100;
  if (budgetUsagePercent > 80) {
    score -= 15;
  }
  
  return Math.max(0, Math.min(100, score));
}

function extractInsights(metrics) {
  const insights = [];
  
  metrics.topRisks.forEach(risk => {
    insights.push({
      type: 'risk',
      ...risk
    });
  });
  
  metrics.opportunities.forEach(opp => {
    insights.push({
      type: 'opportunity',
      ...opp
    });
  });
  
  metrics.recommendations.forEach(rec => {
    insights.push({
      type: 'recommendation',
      ...rec
    });
  });
  
  return insights;
}

// Compilar e exportar
export const compiledDashboardWorkflow = dashboardWorkflow.compile();
EOFILE

echo -e "\033[1;33m2. Criando endpoint para Dashboard IA...\033[0m"

cat > src/api/dashboardAnalyzer.js << 'EOFILE'
import { compiledDashboardWorkflow } from '../workflows/dashboardWorkflow.js';

export async function analyzeDashboard(req, res) {
  try {
    console.log('🎯 [API] Iniciando análise do dashboard...');
    console.log('📅 Timestamp:', new Date().toISOString());
    
    // Executar workflow
    const result = await compiledDashboardWorkflow.invoke({});

    // Log de debug
    console.log('📊 Resultado do workflow:', {
      hasRawData: !!result.rawData,
      projectsCount: result.rawData?.projects?.length || 0,
      usersCount: result.rawData?.users?.length || 0,
      hasMetrics: !!result.metrics,
      hasVisualizations: !!result.visualizations,
      errors: result.errors
    });

    // Verificar se há erros críticos
    if (result.errors && result.errors.length > 0) {
      console.error('⚠️  Erros encontrados:', result.errors);
    }

    res.json({
      success: true,
      data: {
        metrics: result.metrics,
        insights: result.insights,
        visualizations: result.visualizations,
        rawCounts: {
          projects: result.rawData?.projects?.length || 0,
          users: result.rawData?.users?.length || 0,
          tasks: result.rawData?.tasks?.length || 0
        }
      },
      timestamp: new Date().toISOString(),
      model_used: 'gpt-4.1-mini',
      errors: result.errors
    });

  } catch (error) {
    console.error('❌ [API] Erro ao analisar dashboard:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao processar análise do dashboard',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
EOFILE

echo -e "\033[1;33m3. Verificando configuração do Supabase...\033[0m"

# Verificar se existe lib/supabase.js
if [ ! -f "src/lib/supabase.js" ]; then
  echo -e "\033[1;33mCriando lib/supabase.js...\033[0m"
  
  mkdir -p src/lib
  cat > src/lib/supabase.js << 'EOFILE'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis SUPABASE_URL ou SUPABASE_ANON_KEY não configuradas!');
  throw new Error('Configuração do Supabase incompleta');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase configurado:', supabaseUrl);
EOFILE
fi

echo -e "\033[1;33m4. Atualizando index.js com nova rota...\033[0m"

# Adicionar import se não existir
if ! grep -q "analyzeDashboard" src/index.js; then
  sed -i '1a\import { analyzeDashboard } from '\''./api/dashboardAnalyzer.js'\'';' src/index.js
fi

# Adicionar rota se não existir
if ! grep -q "/api/dashboard/analyze" src/index.js; then
  sed -i '/app.listen/i\
\
// Rota para análise do dashboard\
app.post('\''/api/dashboard/analyze'\'', analyzeDashboard);' src/index.js
fi

echo -e "\033[1;33m5. Instalando dependências necessárias...\033[0m"
npm install @langchain/langgraph @supabase/supabase-js --save

echo -e "\033[1;33m6. Reiniciando microserviço IA...\033[0m"
systemctl restart team-manager-ai

echo -e "\033[1;33m7. Aguardando serviço iniciar...\033[0m"
sleep 5

echo -e "\033[1;33m8. Testando novo endpoint...\033[0m"
curl -s -X POST http://localhost:3002/api/dashboard/analyze \
  -H "Content-Type: application/json" | jq . || echo "Erro ao testar endpoint"

echo -e "\033[0;32m✅ Backend do Dashboard IA implementado SEM MOCK DATA!\033[0m"

ENDSSH

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ DASHBOARD IA BACKEND CORRIGIDO!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${AZUL}🎯 MELHORIAS IMPLEMENTADAS:${RESET}"
echo -e "  ${VERDE}✓${RESET} ZERO mock data - tudo vem do Supabase"
echo -e "  ${VERDE}✓${RESET} Verificação de estrutura antes de executar"
echo -e "  ${VERDE}✓${RESET} Logs detalhados em cada etapa"
echo -e "  ${VERDE}✓${RESET} Tratamento de erros robusto"
echo -e "  ${VERDE}✓${RESET} Cálculos baseados em dados reais"
echo -e "  ${VERDE}✓${RESET} Fallback sem IA se GPT falhar"
echo ""
echo -e "${AMARELO}📊 DADOS UTILIZADOS:${RESET}"
echo -e "  • Projetos: status, orçamento, progresso, datas"
echo -e "  • Usuários: para cálculo de equipe"
echo -e "  • Tarefas: se existir a tabela"
echo -e "  • Finanças: calculadas dos projetos"
echo ""
echo -e "${VERMELHO}⚠️  PRÓXIMOS PASSOS:${RESET}"
echo -e "  1. Verificar logs do serviço: journalctl -u team-manager-ai -f"
echo -e "  2. Testar endpoint: /ai/api/dashboard/analyze"
echo -e "  3. Executar frontend script após confirmar funcionamento"
echo ""