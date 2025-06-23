import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface AIContextState {
  isAIEnabled: boolean;
  aiModel: string;
  memory: Map<string, any>;
  
  // Funções de análise por tipo
  analyzeProjects: (projects: any[]) => Promise<any>;
  analyzeTasks: (tasks: any[]) => Promise<any>;
  analyzeTeam: (teamMembers: any[]) => Promise<any>;
  analyzeTimeline: (events: any[]) => Promise<any>;
  analyzeMessages: (messages: any[]) => Promise<any>;
  analyzeReports: (reportData: any) => Promise<any>;
  analyzeDashboard: (dashboardData: any) => Promise<any>;
  
  // Funções gerais
  getSuggestions: (context: string, data: any) => Promise<string[]>;
  generateInsights: (type: string, data: any) => Promise<any>;
  predictNextAction: (history: any[]) => Promise<string>;
  
  // Chat
  chatWithAI: (question: string, context?: any) => Promise<string>;
  
  // Controles
  toggleAI: () => void;
  setModel: (model: string) => void;
}

const AIContext = createContext<AIContextState | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [aiModel, setAiModel] = useState('gpt-4.1-mini');
  const [memory] = useState(new Map());

  // URL base para o microserviço AI
  const AI_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3002' 
    : '/ai';

  // Função genérica para fazer requests ao AI
  const makeAIRequest = async (endpoint: string, data: any) => {
    try {
      const response = await fetch(`${AI_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`AI request failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('AI request error:', error);
      // Retornar dados mock em caso de erro
      return {
        success: false,
        error: error.message,
        fallback: true,
        analysis: {
          insights: ['Análise temporariamente indisponível'],
          recommendations: ['Configure o microserviço AI para análises completas']
        }
      };
    }
  };

  const analyzeProjects = useCallback(async (projects: any[]) => {
    if (!isAIEnabled) return null;
    
    const result = await makeAIRequest('/api/analyze/projects', { projects });
    memory.set('lastProjectAnalysis', result);
    
    return result.analysis || {
      risksIdentified: projects.filter(p => p.progresso < 30).length,
      opportunitiesFound: projects.filter(p => p.progresso > 80).length,
      recommendations: [
        'Focar em projetos com prazo próximo',
        'Revisar orçamento de projetos em risco',
        'Celebrar conclusões recentes'
      ]
    };
  }, [isAIEnabled]);

  const analyzeTasks = useCallback(async (tasks: any[]) => {
    if (!isAIEnabled) return null;
    
    const result = await makeAIRequest('/api/analyze/tasks', { tasks });
    memory.set('lastTaskAnalysis', result);
    
    return result.analysis || {
      prioritization: tasks.sort((a, b) => {
        // Priorizar por urgência e importância
        const urgencyA = new Date(a.data_vencimento).getTime() - Date.now();
        const urgencyB = new Date(b.data_vencimento).getTime() - Date.now();
        return urgencyA - urgencyB;
      }),
      bottlenecks: tasks.filter(t => t.status === 'bloqueada').length,
      suggestions: [
        'Resolver tarefas bloqueadas primeiro',
        'Distribuir carga entre membros da equipe',
        'Definir prazos realistas'
      ]
    };
  }, [isAIEnabled]);

  const analyzeTeam = useCallback(async (teamMembers: any[]) => {
    if (!isAIEnabled) return null;
    
    const result = await makeAIRequest('/api/analyze/team', { teamMembers });
    
    return result.analysis || {
      productivityIndex: Math.round(Math.random() * 20 + 70),
      skillGaps: ['Machine Learning', 'DevOps'],
      recommendations: [
        'Investir em treinamento de ML',
        'Balancear distribuição de tarefas',
        'Implementar pair programming'
      ]
    };
  }, [isAIEnabled]);

  const analyzeTimeline = useCallback(async (events: any[]) => {
    if (!isAIEnabled) return null;
    
    const result = await makeAIRequest('/api/analyze/timeline', { events });
    
    return result.analysis || {
      patterns: ['Picos de atividade às segundas', 'Menos commits às sextas'],
      predictions: [
        'Próxima semana terá alta demanda',
        'Considerar sprint planning para quinta',
        'Possível gargalo em deployments'
      ],
      insights: 'Equipe mais produtiva no período da manhã'
    };
  }, [isAIEnabled]);

  const analyzeMessages = useCallback(async (messages: any[]) => {
    if (!isAIEnabled) return null;
    
    const result = await makeAIRequest('/api/analyze/messages', { messages });
    
    // Análise simples de sentimento
    const positiveWords = ['ótimo', 'excelente', 'parabéns', 'sucesso', 'legal'];
    const negativeWords = ['problema', 'erro', 'bug', 'difícil', 'complicado'];
    
    let sentiment = 'neutral';
    const messageText = messages.map(m => m.conteudo).join(' ').toLowerCase();
    
    const positiveCount = positiveWords.filter(word => messageText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => messageText.includes(word)).length;
    
    if (positiveCount > negativeCount) sentiment = 'positive';
    if (negativeCount > positiveCount) sentiment = 'negative';
    
    return result.analysis || {
      sentiment,
      topics: ['deployment', 'features', 'bugs'],
      engagement: messages.length > 10 ? 'high' : 'medium'
    };
  }, [isAIEnabled]);

  const analyzeReports = useCallback(async (reportData: any) => {
    if (!isAIEnabled) return null;
    
    const result = await makeAIRequest('/api/analyze/reports', { reportData });
    
    return result.analysis || {
      keyMetrics: {
        efficiency: '85%',
        growth: '+23%',
        satisfaction: '4.5/5'
      },
      trends: ['Crescimento constante', 'Melhoria em qualidade'],
      alerts: reportData.alerts || []
    };
  }, [isAIEnabled]);

  const analyzeDashboard = useCallback(async (dashboardData: any) => {
    if (!isAIEnabled) return null;
    
    const result = await makeAIRequest('/api/dashboard/analyze', { dashboardData });
    return result.analysis || {};
  }, [isAIEnabled]);

  const getSuggestions = useCallback(async (context: string, data: any) => {
    if (!isAIEnabled) return [];
    
    const result = await makeAIRequest('/api/suggestions', { context, data });
    
    return result.suggestions || [
      `Revisar ${context} pendentes`,
      `Otimizar fluxo de ${context}`,
      `Analisar métricas de ${context}`
    ];
  }, [isAIEnabled]);

  const generateInsights = useCallback(async (type: string, data: any) => {
    if (!isAIEnabled) return null;
    
    const result = await makeAIRequest('/api/insights', { type, data });
    
    return result.insights || {
      executiveSummary: `Análise ${type} mostra tendências positivas com oportunidades de melhoria em eficiência operacional.`,
      keyFindings: [
        'Performance acima da média',
        'Oportunidades de otimização identificadas',
        'Recomenda-se foco em automação'
      ]
    };
  }, [isAIEnabled]);

  const predictNextAction = useCallback(async (history: any[]) => {
    if (!isAIEnabled) return '';
    
    const result = await makeAIRequest('/api/predict', { history });
    
    return result.prediction || 'Revisar tarefas pendentes e atualizar status dos projetos';
  }, [isAIEnabled]);

  const chatWithAI = useCallback(async (question: string, context?: any) => {
    if (!isAIEnabled) return 'IA desabilitada';
    
    const result = await makeAIRequest('/api/chat', { question, context });
    
    return result.answer || 'Desculpe, não consegui processar sua pergunta no momento.';
  }, [isAIEnabled]);

  const toggleAI = useCallback(() => {
    setIsAIEnabled(!isAIEnabled);
    toast({
      title: isAIEnabled ? 'IA Desabilitada' : 'IA Habilitada',
      description: isAIEnabled 
        ? 'As funcionalidades de IA foram desabilitadas' 
        : 'As funcionalidades de IA foram habilitadas'
    });
  }, [isAIEnabled]);

  const setModel = useCallback((model: string) => {
    setAiModel(model);
    toast({
      title: 'Modelo Alterado',
      description: `Agora usando ${model}`
    });
  }, []);

  return (
    <AIContext.Provider value={{
      isAIEnabled,
      aiModel,
      memory,
      analyzeProjects,
      analyzeTasks,
      analyzeTeam,
      analyzeTimeline,
      analyzeMessages,
      analyzeReports,
      analyzeDashboard,
      getSuggestions,
      generateInsights,
      predictNextAction,
      chatWithAI,
      toggleAI,
      setModel
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
}