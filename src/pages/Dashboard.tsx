
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Calendar,
  MessageSquare 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { useDashboard } from '@/hooks/use-dashboard';

export function Dashboard() {
  const { equipe, usuario } = useAuth();
  const { metrics, recentActivity, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-team-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bem-vindo de volta, {usuario?.nome}! Acompanhe o progresso da {equipe?.nome || 'equipe'}.
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
                <p className="text-2xl font-bold text-gray-900">{metrics?.tasksCompleted || 47}</p>
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
                <p className="text-2xl font-bold text-gray-900">{metrics?.tasksInProgress || 12}</p>
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
                <p className="text-2xl font-bold text-gray-900">{metrics?.productivity || 85}%</p>
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

      {/* Recent Activity */}
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
              {recentActivity?.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-team-primary text-white rounded-full flex items-center justify-center text-sm">
                    {activity.author?.charAt(0) || 'T'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title || 'Atividade da equipe'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.description || 'Progresso nas tarefas do projeto'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.timestamp || '2h atrás'}
                    </p>
                  </div>
                </div>
              )) || (
                // Fallback data
                <>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-team-primary text-white rounded-full flex items-center justify-center text-sm">R</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Ricardo completou tarefa</p>
                      <p className="text-sm text-gray-500">Sistema de autenticação finalizado</p>
                      <p className="text-xs text-gray-400 mt-1">2h atrás</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-team-primary text-white rounded-full flex items-center justify-center text-sm">L</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Leonardo iniciou nova tarefa</p>
                      <p className="text-sm text-gray-500">Implementação da API de dados</p>
                      <p className="text-xs text-gray-400 mt-1">4h atrás</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-team-primary text-white rounded-full flex items-center justify-center text-sm">R</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Rodrigo atualizou design</p>
                      <p className="text-sm text-gray-500">Nova interface do dashboard</p>
                      <p className="text-xs text-gray-400 mt-1">6h atrás</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Daily Standup</p>
                  <p className="text-xs text-gray-500">Hoje às 09:00</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Sprint Review</p>
                  <p className="text-xs text-gray-500">Sexta às 14:00</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Entrega do Projeto</p>
                  <p className="text-xs text-gray-500">Próxima semana</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
