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