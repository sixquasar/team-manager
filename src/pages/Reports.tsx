import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  PieChart,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Target,
  Brain,
  FileText,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { useReports } from '@/hooks/use-reports';
import { useAI } from '@/contexts/AIContext';
import { AIInsightsCard } from '@/components/ai/AIInsightsCard';
import { toast } from '@/hooks/use-toast';

interface Report {
  id: string;
  title: string;
  type: 'chart' | 'table' | 'summary';
  data: any[];
  lastUpdated: string;
}

export function Reports() {
  const { equipe } = useAuth();
  const { metrics, loading } = useReports();
  const { isAIEnabled, generateInsights, analyzeReports } = useAI();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedReport, setSelectedReport] = useState<string>('productivity');
  const [executiveSummary, setExecutiveSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Gerar resumo executivo com IA
  const generateExecutiveSummary = async () => {
    if (!isAIEnabled || !metrics) return;
    
    setIsGenerating(true);
    try {
      const reportData = {
        metrics,
        period: selectedPeriod,
        totalProjects: metrics.totalProjects || 0,
        completionRate: metrics.completionRate || 0,
        teamSize: metrics.teamSize || 0
      };
      
      const insights = await generateInsights('reports', reportData);
      setExecutiveSummary(insights.executiveSummary || 
        `Durante o período de ${selectedPeriod === 'week' ? 'uma semana' : selectedPeriod === 'month' ? 'um mês' : 'um trimestre'}, ` +
        `a equipe ${equipe?.nome || ''} demonstrou performance sólida com ${metrics.completionRate || 0}% de taxa de conclusão. ` +
        `Foram gerenciados ${metrics.totalProjects || 0} projetos com uma equipe de ${metrics.teamSize || 0} membros. ` +
        `Os indicadores sugerem oportunidades de otimização em processos e alocação de recursos.`
      );
      
      toast({
        title: "Resumo gerado com sucesso",
        description: "O resumo executivo foi criado pela IA"
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar resumo",
        description: "Não foi possível gerar o resumo executivo",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-team-primary"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Erro ao carregar relatórios</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const reports = [
    {
      id: 'productivity',
      title: 'Relatório de Produtividade',
      description: 'Análise detalhada da produtividade da equipe',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      id: 'tasks',
      title: 'Relatório de Tarefas',
      description: 'Status e distribuição das tarefas',
      icon: CheckCircle2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'time',
      title: 'Relatório de Tempo',
      description: 'Análise de tempo gasto por projeto',
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'performance',
      title: 'Relatório de Performance',
      description: 'Métricas de performance individual e da equipe',
      icon: BarChart3,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-2">
            Acompanhe a performance e produtividade da {equipe?.nome || 'equipe'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mês</option>
            <option value="quarter">Este trimestre</option>
          </select>
          
          <button className="flex items-center px-4 py-2 bg-team-primary text-white rounded-lg hover:bg-team-primary/90 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* AI Executive Summary */}
      {isAIEnabled && (
        <div className="mb-6 space-y-4">
          <AIInsightsCard 
            title="Análise Executiva com IA"
            data={metrics}
            analysisType="reports"
            className="shadow-lg border-orange-200"
          />
          
          {executiveSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Resumo Executivo Gerado por IA
                  </span>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{executiveSummary}</p>
              </CardContent>
            </Card>
          )}
          
          <Button
            onClick={generateExecutiveSummary}
            className="w-full"
            variant="outline"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Gerando resumo...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Gerar Resumo Executivo com IA
              </>
            )}
          </Button>
        </div>
      )}

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.tasksCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Progresso</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.tasksInProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.averageCompletionTime}d</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produtividade</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.productivityScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilização</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.teamUtilization}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Orçamento</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map(report => {
          const IconComponent = report.icon;
          const isSelected = selectedReport === report.id;
          
          return (
            <Card 
              key={report.id} 
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-team-primary shadow-lg' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${report.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${report.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{report.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{report.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Chart Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              {reports.find(r => r.id === selectedReport)?.title || 'Relatório'}
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <Filter className="h-4 w-4 mr-1" />
                Filtros
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mock Chart - em produção seria um gráfico real */}
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Gráfico de {reports.find(r => r.id === selectedReport)?.title}
              </h3>
              <p className="text-gray-600">
                Dados do período: {selectedPeriod === 'week' ? 'Esta semana' : 
                                   selectedPeriod === 'month' ? 'Este mês' : 'Este trimestre'}
              </p>
              <div className="mt-4 grid grid-cols-4 gap-4 max-w-md mx-auto text-sm">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Jun Sem 1</div>
                  <div className="font-semibold text-green-600">{Math.floor(metrics.tasksCompleted * 0.3)}</div>
                  <div className="text-xs text-gray-500">concluídas</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Jun Sem 2</div>
                  <div className="font-semibold text-green-600">{Math.floor(metrics.tasksCompleted * 0.4)}</div>
                  <div className="text-xs text-gray-500">concluídas</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Jun Sem 3</div>
                  <div className="font-semibold text-green-600">{Math.floor(metrics.tasksCompleted * 0.2)}</div>
                  <div className="text-xs text-gray-500">concluídas</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Jun Sem 4</div>
                  <div className="font-semibold text-green-600">{Math.floor(metrics.tasksCompleted * 0.1)}</div>
                  <div className="text-xs text-gray-500">concluídas</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Detalhados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Período</th>
                  <th className="text-left py-2">Concluídas</th>
                  <th className="text-left py-2">Em Progresso</th>
                  <th className="text-left py-2">Atrasadas</th>
                  <th className="text-left py-2">Taxa de Sucesso</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-2">Jun Sem 1</td>
                  <td className="py-2">
                    <span className="text-green-600 font-medium">{Math.floor(metrics.tasksCompleted * 0.3)}</span>
                  </td>
                  <td className="py-2">
                    <span className="text-blue-600 font-medium">{Math.floor(metrics.tasksInProgress * 0.4)}</span>
                  </td>
                  <td className="py-2">
                    <span className="text-red-600 font-medium">0</span>
                  </td>
                  <td className="py-2">
                    <span className="text-gray-900 font-medium">
                      {metrics.productivityScore}%
                    </span>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-2">Jun Sem 2</td>
                  <td className="py-2">
                    <span className="text-green-600 font-medium">{Math.floor(metrics.tasksCompleted * 0.4)}</span>
                  </td>
                  <td className="py-2">
                    <span className="text-blue-600 font-medium">{Math.floor(metrics.tasksInProgress * 0.3)}</span>
                  </td>
                  <td className="py-2">
                    <span className="text-red-600 font-medium">0</span>
                  </td>
                  <td className="py-2">
                    <span className="text-gray-900 font-medium">
                      {Math.min(metrics.productivityScore + 5, 100)}%
                    </span>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-2">Jun Sem 3</td>
                  <td className="py-2">
                    <span className="text-green-600 font-medium">{Math.floor(metrics.tasksCompleted * 0.2)}</span>
                  </td>
                  <td className="py-2">
                    <span className="text-blue-600 font-medium">{Math.floor(metrics.tasksInProgress * 0.2)}</span>
                  </td>
                  <td className="py-2">
                    <span className="text-red-600 font-medium">1</span>
                  </td>
                  <td className="py-2">
                    <span className="text-gray-900 font-medium">
                      {Math.max(metrics.productivityScore - 3, 0)}%
                    </span>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-2">Jun Sem 4</td>
                  <td className="py-2">
                    <span className="text-green-600 font-medium">{Math.floor(metrics.tasksCompleted * 0.1)}</span>
                  </td>
                  <td className="py-2">
                    <span className="text-blue-600 font-medium">{Math.floor(metrics.tasksInProgress * 0.1)}</span>
                  </td>
                  <td className="py-2">
                    <span className="text-red-600 font-medium">0</span>
                  </td>
                  <td className="py-2">
                    <span className="text-gray-900 font-medium">
                      {Math.min(metrics.productivityScore + 2, 100)}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}