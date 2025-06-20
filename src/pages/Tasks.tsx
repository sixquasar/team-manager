import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Calendar, User, CheckCircle2, Clock, AlertTriangle, Edit, Eye, X } from 'lucide-react';
import { useTasks, Task } from '@/hooks/use-tasks';
import { NewTaskModal } from '@/components/tasks/NewTaskModal';
import { TaskDetailsModal } from '@/components/tasks/TaskDetailsModal';

const statusColumns = [
  { id: 'pendente', title: 'Pendentes', color: 'bg-gray-100' },
  { id: 'em_progresso', title: 'Em Progresso', color: 'bg-blue-100' },
  { id: 'concluida', title: 'Concluídas', color: 'bg-green-100' },
  { id: 'cancelada', title: 'Canceladas', color: 'bg-red-100' }
];

const priorityColors = {
  baixa: 'bg-gray-500',
  media: 'bg-yellow-500',
  alta: 'bg-orange-500',
  urgente: 'bg-red-500'
};

export function Tasks() {
  const { tasks, loading, updateTask, getTasksByStatus, getTasksByPriority, refetch } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Task['status']>('pendente');
  const [searchInput, setSearchInput] = useState('');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || task.prioridade === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.style.opacity = '1';
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      console.log(`🔄 Movendo tarefa "${draggedTask.titulo}" de ${draggedTask.status} para ${newStatus}`);
      const result = await updateTask(draggedTask.id, { status: newStatus });
      if (result.success) {
        console.log('✅ Status da tarefa atualizado com sucesso');
      } else {
        console.error('❌ Erro ao atualizar status:', result.error);
      }
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleNewTask = (status?: Task['status']) => {
    setCurrentStatus(status || 'pendente');
    setShowNewTask(true);
  };

  const refetchTasks = () => {
    console.log('🔄 Recarregando tarefas...');
    refetch();
  };

  const handleSearch = () => {
    console.log('🔍 Executando busca:', searchInput);
    setSearchTerm(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    console.log('🗑️ Limpando busca');
    setSearchInput('');
    setSearchTerm('');
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      onDragEnd={handleDragEnd}
      className="bg-white rounded-lg border shadow-sm p-4 mb-3 cursor-move hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 text-sm flex-1 mr-2">{task.titulo}</h3>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${priorityColors[task.prioridade]}`} title={task.prioridade} />
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTaskClick(task);
              }}
              className="p-1 hover:bg-gray-100 rounded"
              title="Ver detalhes"
            >
              <Eye className="h-3 w-3 text-gray-500" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTaskClick(task);
              }}
              className="p-1 hover:bg-gray-100 rounded"
              title="Editar tarefa"
            >
              <Edit className="h-3 w-3 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
      
      {task.descricao && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {task.descricao}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <User className="h-3 w-3 mr-1" />
          {task.responsavel_nome}
        </div>
        {task.data_vencimento && (
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(task.data_vencimento).toLocaleDateString('pt-BR')}
          </div>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.slice(0, 2).map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs px-1 py-0">
              {tag}
            </Badge>
          ))}
          {task.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              +{task.tags.length - 2}
            </Badge>
          )}
        </div>
      )}
    </div>
  );

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-600 mt-2">Gerencie as tarefas da equipe</p>
        </div>
        
        <Button 
          className="bg-team-primary hover:bg-team-primary/90"
          onClick={() => handleNewTask()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer hover:text-team-primary transition-colors" 
            onClick={handleSearch}
            title="Buscar tarefas"
          />
          <input
            type="text"
            placeholder="Buscar tarefas... (Enter para buscar)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
          />
          {(searchInput || searchTerm) && (
            <X 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer hover:text-red-500 transition-colors" 
              onClick={clearSearch}
              title="Limpar busca"
            />
          )}
        </div>

        <Button 
          onClick={handleSearch}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
          disabled={!searchInput.trim()}
        >
          <Search className="h-4 w-4" />
          <span>Buscar</span>
        </Button>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
        >
          <option value="all">Todas as prioridades</option>
          <option value="urgente">Urgente</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>

        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Mais filtros
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map(column => {
          const columnTasks = filteredTasks.filter(task => task.status === column.id);
          
          return (
            <div key={column.id} className="flex flex-col">
              <div className={`${column.color} rounded-lg p-3 mb-4 flex items-center justify-between`}>
                <h2 className="font-semibold text-gray-800 text-sm">
                  {column.title} ({columnTasks.length})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNewTask(column.id as Task['status'])}
                  className="h-6 w-6 p-0 hover:bg-white/50"
                  title={`Adicionar tarefa em ${column.title}`}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id as Task['status'])}
                className="flex-1 min-h-[400px] rounded-lg p-2 border-2 border-dashed border-transparent transition-colors duration-200 data-[drag-over=true]:border-team-primary data-[drag-over=true]:bg-team-primary/5"
              >
                {columnTasks.map((task) => (
                  <div key={task.id} onClick={() => handleTaskClick(task)}>
                    <TaskCard task={task} />
                  </div>
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-8">
                    Nenhuma tarefa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getTasksByStatus('concluida').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Progresso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getTasksByStatus('em_progresso').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getTasksByPriority('urgente').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <NewTaskModal
        isOpen={showNewTask}
        onClose={() => setShowNewTask(false)}
        onTaskCreated={() => {
          refetchTasks();
          setShowNewTask(false);
        }}
        initialStatus={currentStatus}
      />

      <TaskDetailsModal
        isOpen={showTaskDetails}
        onClose={() => {
          setShowTaskDetails(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onTaskUpdated={() => {
          refetchTasks();
        }}
        onTaskDeleted={() => {
          refetchTasks();
          setShowTaskDetails(false);
          setSelectedTask(null);
        }}
      />
    </div>
  );
}