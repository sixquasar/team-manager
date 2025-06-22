import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Users, DollarSign, Target, RefreshCw, Sparkles, Activity, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIDashboard } from '@/hooks/use-ai-dashboard';

export default function DashboardAI() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);

  const fetchAnalysis = async () => {
    try {
      setError('');
      const response = await fetch('/ai/api/dashboard/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar análise');
      }

      const data = await response.json();
      if (data.success) {
        setAnalysis(data);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
    // Auto-refresh a cada 5 minutos
    const interval = setInterval(fetchAnalysis, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalysis();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const metrics = analysis?.analysis?.metrics || {};
  const insights = analysis?.analysis?.insights || {};
  const charts = analysis?.analysis?.visualizations || {};
  const rawData = analysis?.rawCounts || {};
  const predictions = analysis?.analysis?.predictions || {};
  const anomalies = analysis?.analysis?.anomalies || [];

  // Cores para gráficos
  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  // Dados para o gráfico de radar (Team Performance)
  const radarData = [
    { subject: 'Produtividade', A: metrics.teamProductivityIndex || 0, fullMark: 100 },
    { subject: 'Qualidade', A: metrics.qualityScore || 85, fullMark: 100 },
    { subject: 'Velocidade', A: metrics.velocityScore || 75, fullMark: 100 },
    { subject: 'Colaboração', A: metrics.collaborationScore || 90, fullMark: 100 },
    { subject: 'Inovação', A: metrics.innovationScore || 70, fullMark: 100 },
  ];

  // Trend data para o gráfico de área
  const trendData = charts.trendChart || [
    { month: 'Jan', projetos: 4, tarefas: 20, conclusao: 85 },
    { month: 'Fev', projetos: 5, tarefas: 25, conclusao: 88 },
    { month: 'Mar', projetos: 6, tarefas: 30, conclusao: 92 },
    { month: 'Abr', projetos: 8, tarefas: 40, conclusao: 90 },
    { month: 'Mai', projetos: 10, tarefas: 50, conclusao: 94 },
    { month: 'Jun', projetos: 12, tarefas: 60, conclusao: 96 },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            Dashboard Inteligente com IA
          </h1>
          <p className="text-gray-600 mt-2">
            Análise preditiva e insights em tempo real - Powered by GPT-4.1-mini & LangGraph
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* AI Health Score Card */}
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Score de Saúde da Empresa</h3>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold">{metrics.companyHealthScore || 0}%</div>
                <Progress value={metrics.companyHealthScore || 0} className="w-32 h-3 bg-purple-300" />
              </div>
              <p className="mt-2 text-purple-100">
                {metrics.companyHealthScore >= 80 ? 'Excelente performance!' : 
                 metrics.companyHealthScore >= 60 ? 'Boa performance, com espaço para melhorias' :
                 'Atenção necessária em algumas áreas'}
              </p>
            </div>
            <Sparkles className="h-24 w-24 text-purple-200 opacity-50" />
          </div>
        </CardContent>
      </Card>

      {/* Insights Tabs */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Métricas Principais</TabsTrigger>
          <TabsTrigger value="insights">Insights da IA</TabsTrigger>
          <TabsTrigger value="predictions">Previsões</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalias</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Projetos em Risco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-red-600">
                    {metrics.projectsAtRisk || 0}
                  </span>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {metrics.projectsAtRisk > 0 ? 'Requerem atenção imediata' : 'Todos os projetos estão saudáveis'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Produtividade da Equipe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {metrics.teamProductivityIndex || 0}%
                  </span>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <Progress value={metrics.teamProductivityIndex || 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  ROI Estimado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    {metrics.estimatedROI || '0'}%
                  </span>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Baseado em projetos atuais
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Taxa de Conclusão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {metrics.completionRate || 0}%
                  </span>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <Progress value={metrics.completionRate || 0} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status dos Projetos */}
            {charts.projectsChart && (
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Projetos por Status</CardTitle>
                  <CardDescription>
                    Total de {rawData.projects || 0} projetos analisados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={charts.projectsChart}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {charts.projectsChart.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Team Performance Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Performance da Equipe</CardTitle>
                <CardDescription>
                  Análise multidimensional baseada em IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Análise de Tendências</CardTitle>
              <CardDescription>
                Evolução de projetos, tarefas e taxa de conclusão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="projetos" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" />
                  <Area type="monotone" dataKey="tarefas" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                  <Area type="monotone" dataKey="conclusao" stackId="1" stroke="#10B981" fill="#10B981" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Oportunidades */}
            {insights.opportunitiesFound?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Oportunidades Identificadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {insights.opportunitiesFound.map((opp: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-1.5 flex-shrink-0" />
                        <span className="text-sm">{opp}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Riscos */}
            {insights.risksIdentified?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    Riscos Detectados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {insights.risksIdentified.map((risk: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full mt-1.5 flex-shrink-0" />
                        <span className="text-sm">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recomendações */}
          {insights.recommendations?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Recomendações da IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <Badge className="bg-purple-600 text-white">{idx + 1}</Badge>
                      <p className="text-sm flex-1">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Previsões Baseadas em IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {predictions.nextMonth && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Previsão para o Próximo Mês</h4>
                  <p className="text-sm text-gray-600">{predictions.nextMonth}</p>
                </div>
              )}
              
              {predictions.quarterlyOutlook && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2">Perspectiva Trimestral</h4>
                  <p className="text-sm text-gray-600">{predictions.quarterlyOutlook}</p>
                </div>
              )}

              {predictions.recommendations && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium mb-2">Ações Recomendadas</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {predictions.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-600">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Anomalias Detectadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {anomalies.length > 0 ? (
                <div className="space-y-3">
                  {anomalies.map((anomaly: any, idx: number) => (
                    <Alert key={idx} variant={anomaly.severity === 'high' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{anomaly.type}:</strong> {anomaly.description}
                        <br />
                        <span className="text-xs text-gray-500">
                          Detectado em: {new Date(anomaly.detected_at).toLocaleString('pt-BR')}
                        </span>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma anomalia detectada. Todos os indicadores estão dentro dos padrões esperados.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Real-time Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estatísticas em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Projetos Ativos</p>
              <p className="text-3xl font-bold text-purple-600">{rawData.projects || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.projectGrowth > 0 ? '+' : ''}{metrics.projectGrowth || 0}% este mês
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Tarefas em Andamento</p>
              <p className="text-3xl font-bold text-blue-600">{rawData.tasks || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.taskVelocity || 0} tarefas/dia
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Usuários Ativos</p>
              <p className="text-3xl font-bold text-green-600">{rawData.users || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.userEngagement || 0}% engajamento
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Equipes Colaborando</p>
              <p className="text-3xl font-bold text-orange-600">{rawData.teams || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.teamCollaboration || 0}% colaboração
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timestamp and Model Info */}
      <div className="text-center text-sm text-gray-500">
        <p>Última análise: {analysis?.timestamp ? new Date(analysis.timestamp).toLocaleString('pt-BR') : 'N/A'}</p>
        <p className="mt-1">Powered by GPT-4.1-mini & LangGraph • Atualização automática a cada 5 minutos</p>
      </div>
    </div>
  );
}