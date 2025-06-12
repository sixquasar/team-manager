import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Circle,
  PlayCircle,
  XCircle
} from 'lucide-react';
import { useTasks } from '@/hooks/use-tasks';
import { useAuth } from '@/contexts/AuthContextTeam';

type TaskStatus = 'pendente' | 'em_progresso' | 'concluida' | 'cancelada';
type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';

const statusConfig = {
  pendente: {
    label: 'Pendente',
    icon: Circle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200'
  },
  em_progresso: {
    label: 'Em Progresso',
    icon: PlayCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200'
  },
  concluida: {
    label: 'Concluída',
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200'
  },
  cancelada: {
    label: 'Cancelada',
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200'
  }
};

const priorityConfig = {
  baixa: { label: 'Baixa', color: 'bg-gray-100 text-gray-800' },
  media: { label: 'Média', color: 'bg-blue-100 text-blue-800' },
  alta: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  urgente: { label: 'Urgente', color: 'bg-red-100 text-red-800' }
};

export function Tasks() {
  const { equipe } = useAuth();
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');

  // Filtrar tarefas
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || task.prioridade === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  // Agrupar tarefas por status para o Kanban
  const tasksByStatus = {
    pendente: filteredTasks.filter(task => task.status === 'pendente'),
    em_progresso: filteredTasks.filter(task => task.status === 'em_progresso'),
    concluida: filteredTasks.filter(task => task.status === 'concluida'),
    cancelada: filteredTasks.filter(task => task.status === 'cancelada')
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const TaskCard = ({ task }: { task: any }) => {
    const StatusIcon = statusConfig[task.status as TaskStatus].icon;
    const isOverdue = task.data_fim && new Date(task.data_fim) < new Date() && task.status !== 'concluida';

    return (
      <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-sm">{task.titulo}</h4>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          
          {task.descricao && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {task.descricao}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Priority Badge */}
              <span className={`px-2 py-1 rounded-full text-xs ${priorityConfig[task.prioridade as TaskPriority].color}`}>
                {priorityConfig[task.prioridade as TaskPriority].label}
              </span>
              
              {/* Overdue indicator */}
              {isOverdue && (
                <span className="flex items-center text-red-500 text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Atrasada
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Due date */}
              {task.data_fim && (
                <span className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(task.data_fim).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </span>
              )}
              
              {/* Assignee */}
              {task.responsavel_nome && (
                <span className="flex items-center text-xs text-gray-500">
                  <User className="h-3 w-3 mr-1" />
                  {task.responsavel_nome.split(' ')[0]}
                </span>
              )}
            </div>
          </div>

          {/* Status change buttons */}
          <div className="mt-3 flex gap-1">
            {Object.entries(statusConfig).map(([status, config]) => (
              <button
                key={status}
                onClick={() => handleStatusChange(task.id, status as TaskStatus)}
                className={`flex items-center px-2 py-1 rounded text-xs transition-colors ${
                  task.status === status
                    ? `${config.bgColor} ${config.color}`
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
                disabled={task.status === status}
              >
                <config.icon className="h-3 w-3 mr-1" />
                {config.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const KanbanColumn = ({ status, tasks }: { status: TaskStatus; tasks: any[] }) => {
    const config = statusConfig[status];
    
    return (
      <div className="flex-1 min-w-80">
        <div className={`rounded-lg border-2 ${config.borderColor} bg-white h-full`}>
          <div className={`${config.bgColor} px-4 py-3 rounded-t-lg border-b ${config.borderColor}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <config.icon className={`h-5 w-5 mr-2 ${config.color}`} />
                <h3 className="font-semibold text-gray-900">{config.label}</h3>
                <span className="ml-2 bg-white px-2 py-1 rounded-full text-xs font-medium">
                  {tasks.length}
                </span>
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="p-4 space-y-3 min-h-96 max-h-96 overflow-y-auto">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            
            {tasks.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma tarefa</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-team-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-600 mt-2">
            Gerencie as tarefas da {equipe?.nome || 'equipe'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                view === 'kanban' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                view === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lista
            </button>
          </div>

          <button className="flex items-center px-4 py-2 bg-team-primary text-white rounded-lg hover:bg-team-primary/90 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
          />
        </div>

        {/* Priority Filter */}
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value as TaskPriority | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
        >
          <option value="all">Todas as prioridades</option>
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
          <option value="urgente">Urgente</option>
        </select>

        <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => (
          <Card key={status}>
            <CardContent className="p-4">
              <div className="flex items-center">
                <config.icon className={`h-8 w-8 ${config.color}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{config.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasksByStatus[status as TaskStatus].length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      {view === 'kanban' && (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {Object.entries(tasksByStatus).map(([status, tasks]) => (
            <KanbanColumn 
              key={status} 
              status={status as TaskStatus} 
              tasks={tasks} 
            />
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Todas as Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
              
              {filteredTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma tarefa encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}