import { useState, useEffect } from 'react';

interface AIMetrics {
  companyHealthScore: number;
  projectsAtRisk: number;
  teamProductivityIndex: number;
  estimatedROI: string;
  completionRate: number;
  qualityScore?: number;
  velocityScore?: number;
  collaborationScore?: number;
  innovationScore?: number;
  projectGrowth?: number;
  taskVelocity?: number;
  userEngagement?: number;
  teamCollaboration?: number;
}

interface AIInsights {
  opportunitiesFound: string[];
  risksIdentified: string[];
  recommendations: string[];
}

interface AIPredictions {
  nextMonth?: string;
  quarterlyOutlook?: string;
  recommendations?: string[];
}

interface AIAnomaly {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  detected_at: string;
}

interface AIVisualization {
  projectsChart?: Array<{ name: string; value: number }>;
  productivityChart?: Array<{ month: string; completed: number }>;
  trendChart?: Array<{ month: string; projetos: number; tarefas: number; conclusao: number }>;
}

interface AIAnalysis {
  success: boolean;
  timestamp: string;
  model: string;
  analysis: {
    metrics: AIMetrics;
    insights: AIInsights;
    visualizations: AIVisualization;
    predictions: AIPredictions;
    anomalies: AIAnomaly[];
  };
  rawCounts: {
    projects: number;
    tasks: number;
    users: number;
    teams: number;
  };
}

export function useAIDashboard() {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/ai/api/dashboard/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setAnalysis(data);
      } else {
        throw new Error(data.error || 'Erro ao processar análise');
      }
    } catch (err: any) {
      console.error('Erro ao buscar análise:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  return {
    analysis,
    loading,
    error,
    refresh: fetchAnalysis
  };
}