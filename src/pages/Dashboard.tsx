import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Calendar,
  Target,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { useDashboard } from '@/hooks/use-dashboard';

export function Dashboard() {
  const { equipe, usuario } = useAuth();
  const { metrics, recentActivity, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-team-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bem-vindo de volta, {usuario?.nome}! Acompanhe o progresso da {equipe?.nome || 'SixQuasar'}.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tarefas Concluídas</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.tasksCompleted || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Progresso</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.tasksInProgress || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produtividade</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.productivity || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Membros Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.activeMembers || 3}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Projetos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
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
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Resumo Financeiro
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
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-start space-x-3">
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
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Próximos Marcos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">POC Palmas - Entrega</p>
                  <p className="text-xs text-gray-500">31 Jan 2025 - 5.000 cidadãos</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">POC Jocum - SDK Integration</p>
                  <p className="text-xs text-gray-500">31 Jan 2025 - Multi-LLM</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Go-live Palmas</p>
                  <p className="text-xs text-gray-500">Set 2025 - 350k habitantes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}