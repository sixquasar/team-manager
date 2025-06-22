# 🛠️ Guia de Desenvolvimento - IA no Team Manager

## 📋 Para Desenvolvedores

Este guia mostra como estender e customizar as funcionalidades de IA do Team Manager.

---

## 🔌 Integração com LangChain

### 1. Estrutura do Microserviço IA

```
/var/www/team-manager-ai/
├── src/
│   ├── index.js           # Entry point
│   ├── agents/            # Agentes LangChain
│   │   └── projectAnalyzer.js
│   ├── workflows/         # LangGraph workflows
│   ├── api/              # Endpoints REST
│   └── lib/              # Utilities
├── .env                  # Configurações
└── package.json
```

### 2. Criar Novo Agente LangChain

```javascript
// src/agents/taskAnalyzer.js
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';

// Definir estrutura de saída
const parser = StructuredOutputParser.fromNamesAndDescriptions({
  priority: "Prioridade da tarefa (alta, média, baixa)",
  estimatedHours: "Horas estimadas para conclusão",
  dependencies: "Lista de dependências",
  suggestedAssignee: "Pessoa sugerida para a tarefa"
});

// Template do prompt
const promptTemplate = new PromptTemplate({
  template: `Analise a seguinte tarefa e forneça insights:

Tarefa: {taskName}
Descrição: {description}
Prazo: {deadline}
Tags: {tags}

{format_instructions}

Análise:`,
  inputVariables: ["taskName", "description", "deadline", "tags"],
  partialVariables: { 
    format_instructions: parser.getFormatInstructions() 
  }
});

// Função de análise
export async function analyzeTask(taskData) {
  const model = new ChatOpenAI({
    temperature: 0,
    modelName: 'gpt-4-turbo-preview'
  });
  
  const prompt = await promptTemplate.format(taskData);
  const response = await model.invoke(prompt);
  
  return parser.parse(response.content);
}
```

### 3. Criar Workflow com LangGraph

```javascript
// src/workflows/projectWorkflow.js
import { StateGraph } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';

// Definir estado do workflow
const workflowState = {
  project: null,
  risks: [],
  recommendations: [],
  timeline: null,
  resources: null
};

// Criar grafo
const workflow = new StateGraph({
  channels: workflowState
});

// Adicionar nós (etapas)
workflow.addNode("analyze_risks", async (state) => {
  // Análise de riscos
  const risks = await analyzeProjectRisks(state.project);
  return { ...state, risks };
});

workflow.addNode("generate_timeline", async (state) => {
  // Gerar timeline
  const timeline = await generateProjectTimeline(state.project);
  return { ...state, timeline };
});

workflow.addNode("recommend_actions", async (state) => {
  // Recomendar ações baseadas em riscos
  const recommendations = await generateRecommendations(state.risks);
  return { ...state, recommendations };
});

// Definir fluxo
workflow.addEdge("__start__", "analyze_risks");
workflow.addEdge("analyze_risks", "generate_timeline");
workflow.addEdge("generate_timeline", "recommend_actions");
workflow.addEdge("recommend_actions", "__end__");

// Compilar workflow
export const projectAnalysisWorkflow = workflow.compile();
```

---

## 🎨 Customização no Frontend

### 1. Criar Hook Customizado

```typescript
// src/hooks/use-ai-insights.ts
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AIInsight {
  type: 'risk' | 'opportunity' | 'suggestion';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export function useAIInsights(entityType: 'project' | 'task' | 'team', entityId: string) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInsights();
  }, [entityType, entityId]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/ai/api/insights/${entityType}/${entityId}`);
      const data = await response.json();
      
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (error) {
      toast({
        title: 'Erro ao buscar insights',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const dismissInsight = (index: number) => {
    setInsights(prev => prev.filter((_, i) => i !== index));
  };

  return { insights, loading, dismissInsight, refetch: fetchInsights };
}
```

### 2. Componente de Insights

```tsx
// src/components/ai/InsightsPanel.tsx
import { useAIInsights } from '@/hooks/use-ai-insights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lightbulb, TrendingUp, X } from 'lucide-react';

interface InsightsPanelProps {
  entityType: 'project' | 'task' | 'team';
  entityId: string;
}

export function InsightsPanel({ entityType, entityId }: InsightsPanelProps) {
  const { insights, loading, dismissInsight } = useAIInsights(entityType, entityId);

  const getIcon = (type: string) => {
    switch (type) {
      case 'risk': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-success" />;
      default: return <Lightbulb className="h-4 w-4 text-primary" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div>Carregando insights...</div>;
  }

  return (
    <div className="space-y-3">
      {insights.map((insight, index) => (
        <Card key={index} className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => dismissInsight(index)}
          >
            <X className="h-3 w-3" />
          </Button>
          
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              {getIcon(insight.type)}
              <CardTitle className="text-sm">{insight.title}</CardTitle>
              <Badge variant={getPriorityColor(insight.priority)} className="ml-auto">
                {insight.priority}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-sm text-muted-foreground">{insight.description}</p>
            
            {insight.actionable && (
              <Button variant="link" className="mt-2 p-0 h-auto">
                Tomar ação →
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
      
      {insights.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Nenhum insight disponível no momento
        </p>
      )}
    </div>
  );
}
```

---

## 🔄 Integração com WebSocket

### 1. Cliente WebSocket

```typescript
// src/lib/ai-socket.ts
import { io, Socket } from 'socket.io-client';

class AISocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect() {
    this.socket = io('https://admin.sixquasar.pro', {
      path: '/ai-socket',
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('Conectado ao serviço IA');
    });

    this.socket.on('analysis-update', (data) => {
      this.emit('analysis-update', data);
    });

    this.socket.on('insight-generated', (data) => {
      this.emit('insight-generated', data);
    });
  }

  subscribe(projectId: string) {
    this.socket?.emit('subscribe', { 
      context: `project-${projectId}` 
    });
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export const aiSocket = new AISocketClient();
```

### 2. Hook para Updates em Tempo Real

```typescript
// src/hooks/use-ai-realtime.ts
import { useEffect, useState } from 'react';
import { aiSocket } from '@/lib/ai-socket';

export function useAIRealtime(projectId: string) {
  const [lastUpdate, setLastUpdate] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Conectar
    aiSocket.connect();
    aiSocket.subscribe(projectId);

    // Listeners
    const handleUpdate = (data: any) => {
      if (data.projectId === projectId) {
        setLastUpdate(data);
      }
    };

    aiSocket.on('analysis-update', handleUpdate);
    setIsConnected(true);

    // Cleanup
    return () => {
      aiSocket.disconnect();
      setIsConnected(false);
    };
  }, [projectId]);

  return { lastUpdate, isConnected };
}
```

---

## 📊 Métricas e Monitoramento

### 1. Dashboard de Uso da IA

```typescript
// src/pages/admin/AIUsageDashboard.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart } from '@/components/ui/charts';

export function AIUsageDashboard() {
  const [metrics, setMetrics] = useState({
    totalAnalyses: 0,
    averageResponseTime: 0,
    costThisMonth: 0,
    popularFeatures: []
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    const response = await fetch('/ai/api/metrics');
    const data = await response.json();
    setMetrics(data);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Análises Totais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalAnalyses}</div>
          <p className="text-xs text-muted-foreground">
            +20% em relação ao mês passado
          </p>
        </CardContent>
      </Card>
      
      {/* Mais cards de métricas... */}
    </div>
  );
}
```

---

## 🔐 Segurança e Rate Limiting

### 1. Middleware de Rate Limiting

```javascript
// src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../lib/redis.js';

export const aiRateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:ai:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por janela
  message: 'Muitas requisições. Tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Rate limit excedido',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// Rate limit específico para análises (mais restritivo)
export const analysisRateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:analysis:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 análises por hora
  skipSuccessfulRequests: false
});
```

### 2. Validação de Entrada

```javascript
// src/middleware/validation.js
import { z } from 'zod';

const projectAnalysisSchema = z.object({
  projectName: z.string().min(1).max(200),
  status: z.enum(['planejamento', 'em_progresso', 'concluido', 'cancelado']),
  progress: z.number().min(0).max(100),
  budgetUsed: z.number().min(0).max(100),
  deadline: z.string().datetime(),
  description: z.string().optional()
});

export function validateAnalysisRequest(req, res, next) {
  try {
    projectAnalysisSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: error.errors
    });
  }
}
```

---

## 🎯 Exemplos de Uso Avançado

### 1. Chain Complexa com LangChain

```javascript
// Análise multi-etapa de projeto
import { LLMChain } from 'langchain/chains';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';

const riskAnalysisPrompt = new PromptTemplate({
  template: `Analise os riscos do projeto:
  {projectContext}
  
  Liste os 5 principais riscos em ordem de severidade.`,
  inputVariables: ['projectContext']
});

const mitigationPrompt = new PromptTemplate({
  template: `Dados os seguintes riscos:
  {risks}
  
  Sugira estratégias de mitigação para cada um.`,
  inputVariables: ['risks']
});

export async function complexProjectAnalysis(project) {
  const model = new ChatOpenAI({ temperature: 0 });
  
  // Chain 1: Análise de riscos
  const riskChain = new LLMChain({
    llm: model,
    prompt: riskAnalysisPrompt
  });
  
  const risks = await riskChain.call({
    projectContext: JSON.stringify(project)
  });
  
  // Chain 2: Estratégias de mitigação
  const mitigationChain = new LLMChain({
    llm: model,
    prompt: mitigationPrompt
  });
  
  const mitigations = await mitigationChain.call({
    risks: risks.text
  });
  
  return {
    risks: risks.text,
    mitigations: mitigations.text
  };
}
```

### 2. Agente Autônomo com LangGraph

```javascript
// Agente que monitora projetos e toma ações
import { StateGraph } from '@langchain/langgraph';
import { sendNotification } from '../lib/notifications.js';

const monitoringAgent = new StateGraph({
  channels: {
    projects: [],
    alerts: [],
    actions: []
  }
});

monitoringAgent.addNode("check_health", async (state) => {
  const unhealthyProjects = state.projects.filter(p => p.healthScore < 60);
  return {
    ...state,
    alerts: unhealthyProjects.map(p => ({
      projectId: p.id,
      type: 'health',
      severity: p.healthScore < 30 ? 'critical' : 'warning'
    }))
  };
});

monitoringAgent.addNode("notify_managers", async (state) => {
  for (const alert of state.alerts) {
    if (alert.severity === 'critical') {
      await sendNotification({
        to: 'manager@company.com',
        subject: `Projeto ${alert.projectId} precisa atenção urgente`,
        priority: 'high'
      });
    }
  }
  return state;
});

monitoringAgent.addNode("suggest_actions", async (state) => {
  // IA sugere ações baseadas nos alertas
  const actions = await generateActionPlan(state.alerts);
  return { ...state, actions };
});

// Configurar fluxo
monitoringAgent.setEntryPoint("check_health");
monitoringAgent.addEdge("check_health", "notify_managers");
monitoringAgent.addEdge("notify_managers", "suggest_actions");

export const projectMonitor = monitoringAgent.compile();
```

---

## 🚀 Deploy e Scaling

### 1. Dockerfile para Microserviço IA

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Dependências
COPY package*.json ./
RUN npm ci --only=production

# Código
COPY . .

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "src/index.js"]
```

### 2. Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: team-manager-ai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: team-manager-ai
  template:
    metadata:
      labels:
        app: team-manager-ai
    spec:
      containers:
      - name: ai-service
        image: sixquasar/team-manager-ai:latest
        ports:
        - containerPort: 3002
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-secrets
              key: openai-key
        - name: REDIS_URL
          value: redis://redis-service:6379
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3002
          initialDelaySeconds: 30
          periodSeconds: 10
```

---

## 📚 Recursos Adicionais

### Documentação
- [LangChain Docs](https://python.langchain.com/docs/get_started/introduction)
- [LangGraph Guide](https://langchain-ai.github.io/langgraph/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

### Exemplos de Código
- [Repositório Team Manager AI](https://github.com/sixquasar/team-manager-ai)
- [LangChain Examples](https://github.com/langchain-ai/langchain/tree/master/examples)

### Comunidade
- [Discord LangChain](https://discord.gg/langchain)
- [Stack Overflow - Tag: langchain](https://stackoverflow.com/questions/tagged/langchain)

---

## 🎉 Conclusão

Este guia fornece a base para desenvolver e estender as capacidades de IA do Team Manager. Lembre-se de sempre:

1. **Testar localmente** antes de fazer deploy
2. **Monitorar custos** da API OpenAI
3. **Implementar cache** para requisições repetidas
4. **Documentar** novas funcionalidades
5. **Seguir boas práticas** de segurança

Happy coding! 🚀