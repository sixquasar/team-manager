import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useAI } from '@/contexts/AIContext';

interface AIInsightsCardProps {
  title: string;
  data: any;
  analysisType: 'projects' | 'tasks' | 'team' | 'timeline' | 'messages' | 'reports' | 'dashboard';
  className?: string;
}

export function AIInsightsCard({ title, data, analysisType, className = '' }: AIInsightsCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { aiModel, isAIEnabled } = useAI();
  
  // Import análise específica baseada no tipo
  const ai = useAI();
  const analyzeFunction = {
    projects: ai.analyzeProjects,
    tasks: ai.analyzeTasks,
    team: ai.analyzeTeam,
    timeline: ai.analyzeTimeline,
    messages: ai.analyzeMessages,
    reports: ai.analyzeReports,
    dashboard: ai.analyzeDashboard
  }[analysisType];

  useEffect(() => {
    if (isAIEnabled && data) {
      performAnalysis();
    }
  }, [data, isAIEnabled]);

  const performAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeFunction(data);
      setAnalysis(result);
    } catch (error) {
      console.error('Erro na análise:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAIEnabled || !analysis) return null;

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'insight': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      default: return <Brain className="h-4 w-4 text-purple-500" />;
    }
  };

  const renderContent = () => {
    switch (analysisType) {
      case 'projects':
        return (
          <div className="space-y-3">
            {analysis.risksIdentified > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm">{analysis.risksIdentified} projetos em risco identificados</span>
              </div>
            )}
            {analysis.opportunitiesFound > 0 && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">{analysis.opportunitiesFound} oportunidades de otimização</span>
              </div>
            )}
            {isExpanded && analysis.recommendations && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-medium mb-2">Recomendações:</p>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'tasks':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span className="text-sm">
                {analysis.bottlenecks > 0 
                  ? `${analysis.bottlenecks} gargalos identificados`
                  : 'Fluxo de tarefas otimizado'}
              </span>
            </div>
            {isExpanded && analysis.suggestions && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-medium mb-2">Sugestões de IA:</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.suggestions.map((sug: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {sug}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'team':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Índice de Produtividade:</span>
              <Badge className="bg-green-100 text-green-700">
                {analysis.productivityIndex}%
              </Badge>
            </div>
            {isExpanded && (
              <>
                {analysis.skillGaps && analysis.skillGaps.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium mb-2">Gaps de Habilidades:</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skillGaps.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.recommendations && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-2">Recomendações:</p>
                    <ul className="space-y-1">
                      {analysis.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-600">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-3">
            {analysis.metrics && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-gray-500">Saúde Geral:</span>
                  <p className="font-bold text-lg">{analysis.metrics.companyHealthScore}%</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">ROI Estimado:</span>
                  <p className="font-bold text-lg">{analysis.metrics.estimatedROI}</p>
                </div>
              </div>
            )}
            {isExpanded && analysis.insights && (
              <div className="mt-3 pt-3 border-t space-y-2">
                {analysis.insights.opportunitiesFound && analysis.insights.opportunitiesFound.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1 text-green-700">Oportunidades:</p>
                    {analysis.insights.opportunitiesFound.map((opp: string, idx: number) => (
                      <p key={idx} className="text-sm text-gray-600">• {opp}</p>
                    ))}
                  </div>
                )}
                {analysis.insights.risksIdentified && analysis.insights.risksIdentified.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1 text-red-700">Riscos:</p>
                    {analysis.insights.risksIdentified.map((risk: string, idx: number) => (
                      <p key={idx} className="text-sm text-gray-600">• {risk}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-600">
            Análise de {analysisType} processada com sucesso.
          </div>
        );
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {aiModel}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              onClick={performAnalysis}
              disabled={isLoading}
              className="h-8 w-8"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 animate-pulse text-purple-500" />
              <span className="text-sm text-gray-500">Analisando dados...</span>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </CardContent>
    </Card>
  );
}