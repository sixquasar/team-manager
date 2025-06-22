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