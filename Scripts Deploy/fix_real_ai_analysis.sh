#!/bin/bash

#################################################################
#                                                               #
#        CORRIGIR PARA ANÁLISES REAIS POR PROJETO             #
#        Remove dados mockados e ativa IA real                 #
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

echo -e "${VERMELHO}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERMELHO}🤖 ATIVANDO ANÁLISES REAIS COM IA${RESET}"
echo -e "${VERMELHO}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

ssh $SERVER << 'ENDSSH'
cd /var/www/team-manager

echo -e "\033[1;33m1. Criando hook use-ai-analysis.ts funcional...\033[0m"

cat > src/hooks/use-ai-analysis.ts << 'EOFILE'
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ProjectAnalysis {
  healthScore: number;
  risks: string[];
  recommendations: string[];
  nextSteps: string[];
  ai_powered: boolean;
  model_used?: string;
}

export function useAIAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const { toast } = useToast();

  const analyzeProject = useCallback(async (projectId: string, projectData: any) => {
    setIsAnalyzing(true);
    console.log('🤖 Iniciando análise IA para projeto:', projectId, projectData);
    
    try {
      const response = await fetch(`/ai/api/analyze/project/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: projectData.nome || projectData.projectName,
          status: projectData.status,
          progress: projectData.progresso || projectData.progress,
          budgetUsed: projectData.orcamento_usado ? 
            Math.round((projectData.orcamento_usado / projectData.orcamento) * 100) : 
            projectData.budgetUsed || 50,
          deadline: projectData.data_fim || projectData.data_fim_prevista || projectData.deadline,
          description: projectData.descricao || projectData.description
        }),
      });

      console.log('📡 Resposta da API:', response.status);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Dados recebidos:', data);

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        
        if (data.analysis.ai_powered) {
          toast({
            title: '✨ Análise IA Completa',
            description: `Projeto analisado com ${data.analysis.model_used || 'GPT-4.1-mini'}`,
          });
        }
        
        return data.analysis;
      } else {
        throw new Error(data.error || 'Erro na análise');
      }
    } catch (error) {
      console.error('❌ Erro ao analisar projeto:', error);
      
      // Fallback com dados básicos baseados no projeto
      const fallbackAnalysis: ProjectAnalysis = {
        healthScore: Math.min(100, Math.max(0, projectData.progresso || 50)),
        risks: [
          `Projeto com ${projectData.progresso || 0}% concluído`,
          'Análise IA temporariamente indisponível'
        ],
        recommendations: [
          'Verificar conexão com serviço IA',
          'Tentar novamente em alguns instantes'
        ],
        nextSteps: [
          'Monitorar progresso manualmente',
          'Atualizar dados do projeto'
        ],
        ai_powered: false,
        model_used: 'fallback'
      };
      
      setAnalysis(fallbackAnalysis);
      
      toast({
        title: 'Análise IA indisponível',
        description: 'Usando análise básica temporária',
        variant: 'destructive',
      });
      
      return fallbackAnalysis;
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
  }, []);

  return {
    analyzeProject,
    analysis,
    isAnalyzing,
    clearAnalysis,
  };
}
EOFILE

echo -e "\033[1;33m2. Atualizando ProjectAIAnalysis.tsx para usar dados reais...\033[0m"

cat > src/components/projects/ProjectAIAnalysis.tsx << 'EOFILE'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, CheckCircle, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { useAIAnalysis } from '@/hooks/use-ai-analysis';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProjectAIAnalysisProps {
  project: {
    id: string;
    nome: string;
    status: string;
    progresso: number;
    orcamento: number;
    orcamento_usado: number;
    data_fim?: string;
    data_fim_prevista?: string;
    descricao?: string;
  };
}

export function ProjectAIAnalysis({ project }: ProjectAIAnalysisProps) {
  const { analyzeProject, analysis, isAnalyzing } = useAIAnalysis();

  useEffect(() => {
    // Análise automática ao carregar
    console.log('🚀 ProjectAIAnalysis montado para projeto:', project.nome);
    analyzeProject(project.id, project);
  }, [project.id]);

  const handleRefresh = () => {
    console.log('🔄 Refresh solicitado para projeto:', project.nome);
    analyzeProject(project.id, project);
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Atenção Necessária';
    return 'Crítico';
  };

  if (isAnalyzing && !analysis) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analisando projeto com IA...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Análise não disponível</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6 border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <CardTitle>Análise Inteligente</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isAnalyzing}
          >
            <RefreshCw className={cn("h-4 w-4", isAnalyzing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* Health Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Saúde do Projeto</span>
            <span className={cn("text-2xl font-bold", getHealthColor(analysis.healthScore))}>
              {analysis.healthScore}%
            </span>
          </div>
          <Progress value={analysis.healthScore} className="h-2" />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Baseado em progresso, prazo e orçamento
            </span>
            <Badge variant={analysis.healthScore >= 80 ? "default" : analysis.healthScore >= 60 ? "secondary" : "destructive"}>
              {getHealthLabel(analysis.healthScore)}
            </Badge>
          </div>
        </div>

        {/* Riscos */}
        {analysis.risks && analysis.risks.length > 0 && (
          <div className="space-y-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <h4 className="text-sm font-medium">Riscos Identificados</h4>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {analysis.risks.map((risk, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-destructive mt-0.5">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recomendações */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-medium">Recomendações</h4>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-primary mt-0.5">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Próximos Passos */}
        {analysis.nextSteps && analysis.nextSteps.length > 0 && (
          <div className="space-y-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <h4 className="text-sm font-medium">Próximos Passos</h4>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {analysis.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            {analysis.ai_powered ? (
              <>
                Análise gerada por <span className="font-semibold text-primary">{analysis.model_used || 'GPT-4.1-mini'}</span>
              </>
            ) : (
              'Análise básica (IA temporariamente indisponível)'
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Powered by LangChain + LangGraph
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
EOFILE

echo -e "\033[1;33m3. Verificando microserviço IA...\033[0m"
if systemctl is-active --quiet team-manager-ai; then
    echo -e "\033[0;32m✓ Microserviço IA está rodando\033[0m"
    
    # Testar endpoint
    echo "Testando endpoint de análise..."
    curl -s -X POST http://localhost:3002/api/analyze/project/test \
      -H "Content-Type: application/json" \
      -d '{"projectName":"Teste","status":"ativo","progress":50,"budgetUsed":30}' | head -n 5
else
    echo -e "\033[0;31m✗ Microserviço IA não está rodando!\033[0m"
    echo "Iniciando..."
    systemctl start team-manager-ai
fi

echo -e "\033[1;33m4. Parando backend...\033[0m"
systemctl stop team-manager-backend

echo -e "\033[1;33m5. Limpando cache e rebuild...\033[0m"
rm -rf node_modules/.vite
npm run build

echo -e "\033[1;33m6. Iniciando backend...\033[0m"
systemctl start team-manager-backend

echo -e "\033[1;33m7. Recarregando nginx...\033[0m"
systemctl reload nginx

echo -e "\033[0;32m✅ Sistema configurado para análises reais!\033[0m"

# Debug - mostrar se as rotas estão corretas
echo -e "\033[1;33m8. Verificando rotas nginx para /ai/...\033[0m"
grep -A 5 "location /ai/" /etc/nginx/sites-available/team-manager || echo "Rota /ai/ não encontrada!"

ENDSSH

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ ANÁLISES REAIS ATIVADAS!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${VERMELHO}🎯 AGORA CADA PROJETO TERÁ ANÁLISE ÚNICA:${RESET}"
echo ""
echo -e "${AZUL}Como funciona:${RESET}"
echo -e "  1. Ao abrir um projeto, faz análise REAL via API"
echo -e "  2. Considera: nome, status, progresso, orçamento, prazo"
echo -e "  3. GPT-4.1-mini analisa e retorna insights específicos"
echo -e "  4. Botão 🔄 para reanalisar quando quiser"
echo ""
echo -e "${AMARELO}⚠️  IMPORTANTE:${RESET}"
echo -e "  - Limpe o cache do navegador (Ctrl+Shift+Del)"
echo -e "  - Abra o Console (F12) para ver logs de debug"
echo -e "  - Cada projeto terá análise DIFERENTE agora"
echo ""
echo -e "${VERDE}Se ainda não funcionar, verifique:${RESET}"
echo -e "  - Microserviço IA rodando: systemctl status team-manager-ai"
echo -e "  - Logs: journalctl -u team-manager-ai -f"
echo ""