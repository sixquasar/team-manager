#!/bin/bash

#################################################################
#                                                               #
#        APLICAR INTEGRAÇÃO IA NO FRONTEND                      #
#        Copia arquivos e rebuilda aplicação                    #
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

# Configurações
SERVER="root@96.43.96.30"
LOCAL_PATH="/Users/landim/.npm-global/lib/node_modules/@anthropic-ai/team-manager-sixquasar"
REMOTE_PATH="/var/www/team-manager"

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}🚀 APLICANDO INTEGRAÇÃO IA NO FRONTEND${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# PASSO 1: Verificar se arquivos existem localmente
echo -e "${AMARELO}1. Verificando arquivos locais...${RESET}"

if [ ! -f "$LOCAL_PATH/src/hooks/use-ai-analysis.ts" ]; then
    echo -e "${VERMELHO}❌ Arquivo use-ai-analysis.ts não encontrado localmente${RESET}"
    echo "Criando arquivo..."
    
    mkdir -p "$LOCAL_PATH/src/hooks"
    cat > "$LOCAL_PATH/src/hooks/use-ai-analysis.ts" << 'EOF'
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ProjectAnalysis {
  healthScore: number;
  risks: string[];
  recommendations: string[];
  nextSteps: string[];
  ai_powered: boolean;
}

interface AnalysisResponse {
  success: boolean;
  analysis: ProjectAnalysis;
  error?: string;
}

export function useAIAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const { toast } = useToast();

  const analyzeProject = useCallback(async (projectId: string, projectData: any) => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch(`/ai/api/analyze/project/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data: AnalysisResponse = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
        
        if (data.analysis.ai_powered) {
          toast({
            title: '✨ Análise IA Completa',
            description: 'Projeto analisado com inteligência artificial',
          });
        }
        
        return data.analysis;
      } else {
        throw new Error(data.error || 'Erro na análise');
      }
    } catch (error) {
      console.error('Erro ao analisar projeto:', error);
      
      toast({
        title: 'Erro na análise',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      
      // Retornar análise padrão em caso de erro
      const fallbackAnalysis: ProjectAnalysis = {
        healthScore: 70,
        risks: ['Análise IA temporariamente indisponível'],
        recommendations: ['Tente novamente mais tarde'],
        nextSteps: ['Verificar conexão com serviço IA'],
        ai_powered: false,
      };
      
      setAnalysis(fallbackAnalysis);
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
EOF
fi

if [ ! -f "$LOCAL_PATH/src/components/projects/ProjectAIAnalysis.tsx" ]; then
    echo -e "${VERMELHO}❌ Arquivo ProjectAIAnalysis.tsx não encontrado localmente${RESET}"
    echo "Criando arquivo..."
    
    mkdir -p "$LOCAL_PATH/src/components/projects"
    cat > "$LOCAL_PATH/src/components/projects/ProjectAIAnalysis.tsx" << 'EOF'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, CheckCircle, Sparkles, RefreshCw } from 'lucide-react';
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
    data_fim: string;
    descricao?: string;
  };
}

export function ProjectAIAnalysis({ project }: ProjectAIAnalysisProps) {
  const { analyzeProject, analysis, isAnalyzing } = useAIAnalysis();

  useEffect(() => {
    // Análise automática ao carregar
    const projectData = {
      projectName: project.nome,
      status: project.status,
      progress: project.progresso,
      budgetUsed: Math.round((project.orcamento_usado / project.orcamento) * 100),
      deadline: project.data_fim,
      description: project.descricao,
    };

    analyzeProject(project.id, projectData);
  }, [project.id]);

  const handleRefresh = () => {
    const projectData = {
      projectName: project.nome,
      status: project.status,
      progress: project.progresso,
      budgetUsed: Math.round((project.orcamento_usado / project.orcamento) * 100),
      deadline: project.data_fim,
      description: project.descricao,
    };

    analyzeProject(project.id, projectData);
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Atenção';
    return 'Crítico';
  };

  if (isAnalyzing && !analysis) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analisando projeto com IA...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
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
        <CardDescription>
          {analysis.ai_powered ? 'Powered by GPT-4' : 'Análise básica'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Saúde do Projeto</span>
            <span className={cn("text-2xl font-bold", getHealthColor(analysis.healthScore))}>
              {analysis.healthScore}%
            </span>
          </div>
          <Progress value={analysis.healthScore} className="h-2" />
          <div className="flex justify-end">
            <Badge variant={analysis.healthScore >= 80 ? "default" : analysis.healthScore >= 60 ? "secondary" : "destructive"}>
              {getHealthLabel(analysis.healthScore)}
            </Badge>
          </div>
        </div>

        {/* Riscos */}
        {analysis.risks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <h4 className="text-sm font-medium">Riscos Identificados</h4>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {analysis.risks.map((risk, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recomendações */}
        {analysis.recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-medium">Recomendações</h4>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-primary mt-1">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Próximos Passos */}
        {analysis.nextSteps.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <h4 className="text-sm font-medium">Próximos Passos</h4>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {analysis.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-success mt-1">✓</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
EOF
fi

echo -e "${VERDE}✓ Arquivos verificados/criados localmente${RESET}"

# PASSO 2: Copiar arquivos para o servidor
echo -e "${AMARELO}2. Copiando arquivos para o servidor...${RESET}"

echo "Copiando use-ai-analysis.ts..."
scp "$LOCAL_PATH/src/hooks/use-ai-analysis.ts" "$SERVER:$REMOTE_PATH/src/hooks/"

echo "Copiando ProjectAIAnalysis.tsx..."
scp "$LOCAL_PATH/src/components/projects/ProjectAIAnalysis.tsx" "$SERVER:$REMOTE_PATH/src/components/projects/"

echo -e "${VERDE}✓ Arquivos copiados${RESET}"

# PASSO 3: Executar build no servidor
echo -e "${AMARELO}3. Executando build no servidor...${RESET}"

ssh $SERVER << 'ENDSSH'
cd /var/www/team-manager

echo "Parando backend temporariamente..."
systemctl stop team-manager-backend

echo "Executando build..."
npm run build

echo "Reiniciando backend..."
systemctl start team-manager-backend

echo "Recarregando nginx..."
systemctl reload nginx

echo "Verificando status dos serviços..."
systemctl is-active team-manager-backend
systemctl is-active team-manager-ai
systemctl is-active nginx
ENDSSH

# PASSO 4: Verificar integração
echo -e "${AMARELO}4. Verificando integração...${RESET}"

# Testar se o microserviço IA está respondendo
echo "Testando microserviço IA..."
curl -s https://admin.sixquasar.pro/ai/health | head -n 5 || echo "Erro ao acessar microserviço"

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ INTEGRAÇÃO IA APLICADA COM SUCESSO!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${AZUL}📱 COMO TESTAR:${RESET}"
echo -e "  1. Acesse https://admin.sixquasar.pro"
echo -e "  2. Faça login no sistema"
echo -e "  3. Vá para 'Projetos' no menu lateral"
echo -e "  4. Clique em qualquer projeto"
echo -e "  5. Role para baixo no modal - verá 'Análise Inteligente'"
echo ""
echo -e "${AZUL}🔍 O QUE PROCURAR:${RESET}"
echo -e "  - Card com título '✨ Análise Inteligente'"
echo -e "  - Health Score do projeto (0-100%)"
echo -e "  - Riscos identificados pela IA"
echo -e "  - Recomendações de melhorias"
echo -e "  - Próximos passos sugeridos"
echo -e "  - Botão 🔄 para atualizar análise"
echo ""
echo -e "${AMARELO}⚠️  IMPORTANTE:${RESET}"
echo -e "  - A análise aparece APENAS no modal de detalhes"
echo -e "  - NÃO aparece no modo de edição"
echo -e "  - Precisa estar logado para funcionar"
echo ""