import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Calendar,
  Target,
  DollarSign,
  Plus,
  ArrowRight,
  RefreshCw,
  FileText,
  MessageSquare,
  BarChart3,
  ListTodo,
  FolderOpen,
  BellPlus,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { useDashboard } from '@/hooks/use-dashboard';
import { DocumentUpload } from '@/components/dashboard/DocumentUpload';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export function Dashboard() {
  const { equipe, usuario } = useAuth();
  const { metrics, recentActivity, loading, refetch } = useDashboard();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast({
      title: "Atualizando dashboard...",
      description: "Buscando dados mais recentes",
    });
    
    try {
      await refetch();
      toast({
        title: "Dashboard atualizado!",
        description: "Dados atualizados com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const quickActions = [
    { 
      label: 'Nova Tarefa', 
      icon: ListTodo, 
      onClick: () => navigate('/tasks'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      label: 'Novo Projeto', 
      icon: FolderOpen, 
      onClick: () => navigate('/projects'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    { 
      label: 'Enviar Mensagem', 
      icon: MessageSquare, 
      onClick: () => navigate('/messages'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      label: 'Ver Relatórios', 
      icon: BarChart3, 
      onClick: () => navigate('/reports'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-team-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo de volta, {usuario?.nome}! Acompanhe o progresso da {equipe?.nome || 'SixQuasar'}.
          </p>
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
            Atualizar
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/timeline')}
            className="flex items-center gap-2"
          >
            <BellPlus className="h-4 w-4" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`${action.color} text-white p-4 rounded-lg transition-all hover:shadow-lg transform hover:-translate-y-1 flex flex-col items-center gap-2`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/tasks')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tarefas Concluídas</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.tasksCompleted || 0}</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/tasks')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Em Progresso</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.tasksInProgress || 0}</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/reports')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Produtividade</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.productivity || 0}%</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/team')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Membros Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.activeMembers || 3}</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Projetos Ativos
              </span>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => navigate('/projects')}
                className="flex items-center gap-1"
              >
                Ver todos
                <ExternalLink className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div 
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => navigate('/projects')}
              >
                <div>
                  <p className="font-medium text-gray-900">Sistema Palmas IA</p>
                  <p className="text-sm text-gray-600">Prefeitura Municipal</p>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">25%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">R$ 2.4M</p>
                  <p className="text-sm text-gray-600">Nov 2024 - Set 2025</p>
                </div>
              </div>
              
              <div 
                className="flex items-center justify-between p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                onClick={() => navigate('/projects')}
              >
                <div>
                  <p className="font-medium text-gray-900">Automação Jocum</p>
                  <p className="text-sm text-gray-600">SDK Multi-LLM</p>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">15%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">R$ 625K</p>
                  <p className="text-sm text-gray-600">Dez 2024 - Jun 2025</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate('/projects')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Resumo Financeiro
              </span>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => navigate('/reports')}
                className="flex items-center gap-1"
              >
                Detalhes
                <ExternalLink className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Contratos Ativos</span>
                <span className="text-xl font-bold text-gray-900">R$ 3.025M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Faturamento Esperado</span>
                <span className="text-lg text-green-600">R$ 1.2M (2025)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ROI Médio</span>
                <span className="text-lg text-blue-600">27.5%</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-medium">Projetos Ativos</span>
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate('/reports')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Análise Completa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Upload - AI Integration */}
      <div className="w-full">
        <DocumentUpload />
      </div>

      {/* Recent Activity and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Atividade Recente
              </span>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => navigate('/timeline')}
                className="flex items-center gap-1"
              >
                Ver timeline
                <ExternalLink className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div 
                    key={activity.id || index} 
                    className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate('/timeline')}
                  >
                    <div className="w-8 h-8 bg-team-primary text-white rounded-full flex items-center justify-center text-sm">
                      {activity.author?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => navigate('/timeline')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Evento
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Próximos Marcos
              </span>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => navigate('/tasks')}
                className="flex items-center gap-1"
              >
                Gerenciar
                <ExternalLink className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div 
                className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => navigate('/tasks')}
              >
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">POC Palmas - Entrega</p>
                  <p className="text-xs text-gray-500">31 Jan 2025 - 5.000 cidadãos</p>
                </div>
              </div>
              
              <div 
                className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                onClick={() => navigate('/tasks')}
              >
                <AlertTriangle className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">POC Jocum - SDK Integration</p>
                  <p className="text-xs text-gray-500">31 Jan 2025 - Multi-LLM</p>
                </div>
              </div>
              
              <div 
                className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                onClick={() => navigate('/projects')}
              >
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Go-live Palmas</p>
                  <p className="text-xs text-gray-500">Set 2025 - 350k habitantes</p>
                </div>
              </div>
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/tasks')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Marco
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}