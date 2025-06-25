import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Target,
  Users,
  Activity,
  BarChart3,
  Lightbulb,
  ChevronRight,
  RefreshCw,
  Zap,
  ShieldCheck,
  CircleDot,
  ArrowUpRight,
  ArrowDownRight,
  Gauge,
  BrainCircuit,
  LineChart,
  PieChart,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { useAIDashboard } from '@/hooks/use-ai-dashboard';
import { useAIAnalysis } from '@/hooks/use-ai-analysis';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart
} from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardAI() {
  const { equipe, usuario } = useAuth();
  const { analysis, loading, error, refresh } = useAIDashboard();
  const { analyzeData } = useAIAnalysis();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast({
      title: "🤖 Atualizando análise IA...",
      description: "Processando dados com inteligência artificial",
    });
    
    try {
      await refresh();
      toast({
        title: "✨ Análise atualizada!",
        description: "Novos insights disponíveis",
      });
    } catch (error) {
      toast({
        title: "Erro na análise IA",
        description: "Não foi possível processar os dados",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return AlertCircle;
    return XCircle;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
          <BrainCircuit className="absolute inset-0 m-auto h-8 w-8 text-purple-600 animate-pulse" />
        </div>
        <p className="mt-4 text-gray-600">Analisando dados com IA...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-gray-600">Erro ao carregar análise IA</p>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const metrics = analysis?.analysis?.metrics || {};
  const insights = analysis?.analysis?.insights || {};
  const visualizations = analysis?.analysis?.visualizations || {};
  const predictions = analysis?.analysis?.predictions || {};
  const anomalies = analysis?.analysis?.anomalies || [];

  return (
    <div className="space-y-6">
      {/* Header with AI Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Dashboard IA
              <Sparkles className="h-6 w-6 text-purple-600" />
            </h1>
            <p className="text-gray-600 mt-1">
              Análise inteligente em tempo real para {equipe?.nome || 'sua equipe'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar IA
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="flex items-center gap-2"
          >
            Modo Clássico
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Company Health Score */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="h-6 w-6" />
                Health Score da Empresa
              </h2>
              <p className="text-purple-100 mt-1">
                Análise completa baseada em {analysis?.rawCounts?.projects || 0} projetos e {analysis?.rawCounts?.tasks || 0} tarefas
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold">
                {metrics.companyHealthScore || 0}%
              </div>
              <div className="flex items-center gap-2 mt-2">
                {metrics.companyHealthScore >= 80 ? (
                  <>
                    <TrendingUp className="h-5 w-5" />
                    <span>Excelente</span>
                  </>
                ) : metrics.companyHealthScore >= 60 ? (
                  <>
                    <Activity className="h-5 w-5" />
                    <span>Bom</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5" />
                    <span>Atenção</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/projects')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold text-red-600">
                {metrics.projectsAtRisk || 0}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700">Projetos em Risco</p>
            <p className="text-xs text-gray-500 mt-1">Requerem atenção imediata</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/team')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Gauge className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">
                {metrics.teamProductivityIndex || 0}%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700">Produtividade da Equipe</p>
            <p className="text-xs text-gray-500 mt-1">Índice de eficiência</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/reports')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold text-green-600">
                {metrics.estimatedROI || '0%'}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700">ROI Estimado</p>
            <p className="text-xs text-gray-500 mt-1">Baseado em tendências</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Zap className="h-8 w-8 text-purple-500" />
              <span className="text-2xl font-bold text-purple-600">
                {metrics.completionRate || 0}%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700">Taxa de Conclusão</p>
            <p className="text-xs text-gray-500 mt-1">Projetos finalizados</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Insights Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights?.opportunitiesFound && Array.isArray(insights.opportunitiesFound) && insights.opportunitiesFound.map((opportunity: string, index: number) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    selectedInsight === index ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
                  )}
                  onClick={() => setSelectedInsight(index)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded">
                      <ArrowUpRight className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-700 flex-1">{opportunity}</p>
                  </div>
                </div>
              ))}
              
              {insights?.risksIdentified && Array.isArray(insights.risksIdentified) && insights.risksIdentified.map((risk: string, index: number) => (
                <div
                  key={`risk-${index}`}
                  className="p-3 rounded-lg border hover:bg-red-50 cursor-pointer transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-red-100 rounded">
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    </div>
                    <p className="text-sm text-gray-700 flex-1">{risk}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-500" />
              Recomendações IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights?.recommendations && Array.isArray(insights.recommendations) && insights.recommendations.map((recommendation: string, index: number) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-purple-50 border border-purple-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-purple-100 rounded-full">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{recommendation}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 text-purple-600 hover:text-purple-700"
                        onClick={() => {
                          toast({
                            title: "Implementando recomendação",
                            description: "A IA está processando sua solicitação",
                          });
                        }}
                      >
                        Aplicar
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visualizations?.trendChart && Array.isArray(visualizations.trendChart) && visualizations.trendChart.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-500" />
                Tendências de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={visualizations.trendChart}>
                  <defs>
                    <linearGradient id="colorProjetos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTarefas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="projetos" 
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#colorProjetos)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tarefas" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorTarefas)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Anomalies Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Detecção de Anomalias
              {anomalies && Array.isArray(anomalies) && anomalies.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                  {anomalies.length} detectadas
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {anomalies && Array.isArray(anomalies) && anomalies.length > 0 ? (
                anomalies.map((anomaly: any, index: number) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border",
                      getSeverityColor(anomaly.severity)
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{anomaly.type}</p>
                        <p className="text-xs mt-1">{anomaly.description}</p>
                      </div>
                      <span className="text-xs opacity-75">
                        {new Date(anomaly.detected_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Nenhuma anomalia detectada</p>
                  <p className="text-xs text-gray-500 mt-1">Sistema operando normalmente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Predictions */}
      {predictions && Object.keys(predictions).length > 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Previsões Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {predictions.nextMonth && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-medium text-sm text-gray-700 mb-2">Próximo Mês</h3>
                  <p className="text-sm text-gray-600">{predictions.nextMonth}</p>
                </div>
              )}
              {predictions.quarterlyOutlook && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-medium text-sm text-gray-700 mb-2">Perspectiva Trimestral</h3>
                  <p className="text-sm text-gray-600">{predictions.quarterlyOutlook}</p>
                </div>
              )}
              {predictions.recommendations && predictions.recommendations.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-medium text-sm text-gray-700 mb-2">Ações Recomendadas</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {predictions.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Status Footer */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Clock className="h-4 w-4" />
        <span>Última análise: {analysis?.timestamp ? new Date(analysis.timestamp).toLocaleString() : 'Aguardando'}</span>
        <span className="mx-2">•</span>
        <span>Modelo: {analysis?.model || 'GPT-4'}</span>
        <span className="mx-2">•</span>
        <span className="flex items-center gap-1">
          <Activity className="h-4 w-4" />
          IA Ativa
        </span>
      </div>
    </div>
  );
}