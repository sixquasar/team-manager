import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  Users,
  Clock,
  Target,
  CheckCircle2,
  AlertTriangle,
  PieChart,
  LineChart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';

export function Reports() {
  const { equipe } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedReport, setSelectedReport] = useState<'productivity' | 'tasks' | 'team' | 'time'>('productivity');

  // Mock data - em produção viria dos hooks useReports
  const reportData = {
    productivity: {
      title: 'Relatório de Produtividade',
      metrics: [
        { label: 'Tarefas Concluídas', value: 47, change: '+12%', color: 'text-green-600' },
        { label: 'Eficiência da Equipe', value: 85, change: '+5%', color: 'text-green-600' },
        { label: 'Tempo Médio por Tarefa', value: '4.2h', change: '-8%', color: 'text-green-600' },
        { label: 'Sprint Velocity', value: 23, change: '+15%', color: 'text-green-600' }
      ],
      chartData: [
        { period: 'Sem 1', completed: 8, planned: 10 },
        { period: 'Sem 2', completed: 12, planned: 12 },
        { period: 'Sem 3', completed: 15, planned: 14 },
        { period: 'Sem 4', completed: 12, planned: 13 }
      ]
    },
    tasks: {
      title: 'Relatório de Tarefas',
      metrics: [
        { label: 'Total de Tarefas', value: 156, change: '+23%', color: 'text-blue-600' },
        { label: 'Em Andamento', value: 12, change: '+2', color: 'text-orange-600' },
        { label: 'Atrasadas', value: 3, change: '-2', color: 'text-red-600' },
        { label: 'Taxa de Conclusão', value: '92%', change: '+3%', color: 'text-green-600' }
      ],
      distribution: [
        { status: 'Concluídas', count: 124, percentage: 79.5, color: 'bg-green-500' },
        { status: 'Em Progresso', count: 12, percentage: 7.7, color: 'bg-blue-500' },
        { status: 'Pendentes', count: 17, percentage: 10.9, color: 'bg-gray-500' },
        { status: 'Atrasadas', count: 3, percentage: 1.9, color: 'bg-red-500' }
      ]
    },
    team: {
      title: 'Relatório da Equipe',
      members: [
        {
          name: 'Ricardo Landim',
          role: 'Tech Lead',
          tasksCompleted: 18,
          hoursWorked: 156,
          efficiency: 94,
          avatar: 'R'
        },
        {
          name: 'Ana Silva',
          role: 'Designer',
          tasksCompleted: 15,
          hoursWorked: 142,
          efficiency: 88,
          avatar: 'A'
        },
        {
          name: 'Carlos Santos',
          role: 'Developer',
          tasksCompleted: 14,
          hoursWorked: 138,
          efficiency: 91,
          avatar: 'C'
        }
      ]
    },
    time: {
      title: 'Relatório de Tempo',
      totalHours: 436,
      billableHours: 392,
      overtime: 12,
      timeByProject: [
        { project: 'Team Manager', hours: 180, percentage: 41.3 },
        { project: 'Dashboard', hours: 120, percentage: 27.5 },
        { project: 'API Backend', hours: 96, percentage: 22.0 },
        { project: 'Mobile App', hours: 40, percentage: 9.2 }
      ]
    }
  };

  const currentData = reportData[selectedReport];

  const exportReport = () => {
    // Simulação de exportação
    console.log(`Exportando relatório: ${currentData.title} - Período: ${selectedPeriod}`);
    alert('Relatório exportado com sucesso!');
  };

  const MetricCard = ({ label, value, change, color }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`text-sm font-medium ${color}`}>
            {change}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProductivityChart = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="mr-2 h-5 w-5" />
          Tarefas Concluídas vs Planejadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reportData.productivity.chartData.map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-16 text-sm text-gray-600">{item.period}</div>
              <div className="flex-1">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Concluídas: {item.completed}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(item.completed / Math.max(item.planned, item.completed)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Planejadas: {item.planned}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(item.planned / Math.max(item.planned, item.completed)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const TaskDistribution = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PieChart className="mr-2 h-5 w-5" />
          Distribuição de Tarefas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reportData.tasks.distribution.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded ${item.color}`}></div>
                <span className="text-sm text-gray-700">{item.status}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{item.count}</span>
                <span className="text-xs text-gray-500">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const TeamPerformance = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Performance da Equipe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reportData.team.members.map((member, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-team-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {member.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex space-x-4 text-sm">
                  <div>
                    <p className="text-gray-500">Tarefas</p>
                    <p className="font-medium">{member.tasksCompleted}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Horas</p>
                    <p className="font-medium">{member.hoursWorked}h</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Eficiência</p>
                    <p className="font-medium text-green-600">{member.efficiency}%</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const TimeTracking = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Resumo de Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total de Horas</span>
              <span className="font-medium">{reportData.time.totalHours}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Horas Faturáveis</span>
              <span className="font-medium text-green-600">{reportData.time.billableHours}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hora Extra</span>
              <span className="font-medium text-orange-600">{reportData.time.overtime}h</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Taxa de Utilização</span>
              <span className="font-medium">
                {Math.round((reportData.time.billableHours / reportData.time.totalHours) * 100)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tempo por Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData.time.timeByProject.map((project, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{project.project}</span>
                  <span className="text-gray-500">{project.hours}h ({project.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-team-primary h-2 rounded-full" 
                    style={{ width: `${project.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-2">
            Análises e métricas da {equipe?.nome || 'equipe'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={exportReport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Report Type */}
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
          >
            <option value="productivity">Produtividade</option>
            <option value="tasks">Tarefas</option>
            <option value="team">Equipe</option>
            <option value="time">Tempo</option>
          </select>

          {/* Period */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mês</option>
            <option value="quarter">Este trimestre</option>
          </select>

          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Atualizado: {new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      {/* Report Content */}
      <div className="space-y-6">
        {/* Metrics Grid */}
        {(selectedReport === 'productivity' || selectedReport === 'tasks') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentData.metrics.map((metric: any, index: number) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>
        )}

        {/* Charts and Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {selectedReport === 'productivity' && (
            <>
              <ProductivityChart />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Tendência de Produtividade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <LineChart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Gráfico de tendência será implementado</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {selectedReport === 'tasks' && (
            <>
              <TaskDistribution />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Metas vs Realizado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Meta Mensal</span>
                      <span className="font-medium">50 tarefas</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Realizado</span>
                      <span className="font-medium text-green-600">47 tarefas</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                    <div className="text-center text-sm text-gray-500">94% da meta atingida</div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {selectedReport === 'team' && <TeamPerformance />}
        {selectedReport === 'time' && <TimeTracking />}
      </div>
    </div>
  );
}