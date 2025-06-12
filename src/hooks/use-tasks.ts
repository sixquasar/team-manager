import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextTeam';

export interface Task {
  id: string;
  titulo: string;
  descricao: string;
  status: 'pendente' | 'em_progresso' | 'concluida' | 'cancelada';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  responsavel_id: string;
  responsavel_nome: string;
  equipe_id: string;
  data_criacao: string;
  data_vencimento?: string;
  data_conclusao?: string;
  tags?: string[];
}

export function useTasks() {
  const { equipe } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data para desenvolvimento
  const mockTasks: Task[] = [
    {
      id: '1',
      titulo: 'Implementar sistema de login',
      descricao: 'Criar tela de login com validação de credenciais',
      status: 'concluida',
      prioridade: 'alta',
      responsavel_id: '1',
      responsavel_nome: 'Ricardo Landim',
      equipe_id: '1',
      data_criacao: '2024-11-01T10:00:00Z',
      data_vencimento: '2024-11-05T17:00:00Z',
      data_conclusao: '2024-11-04T16:30:00Z',
      tags: ['frontend', 'auth']
    },
    {
      id: '2',
      titulo: 'Design do dashboard principal',
      descricao: 'Criar layout e componentes do dashboard',
      status: 'em_progresso',
      prioridade: 'alta',
      responsavel_id: '2',
      responsavel_nome: 'Ana Silva',
      equipe_id: '1',
      data_criacao: '2024-11-02T09:00:00Z',
      data_vencimento: '2024-11-08T17:00:00Z',
      tags: ['design', 'ui/ux']
    },
    {
      id: '3',
      titulo: 'API de gerenciamento de tarefas',
      descricao: 'Implementar CRUD completo para tarefas',
      status: 'pendente',
      prioridade: 'media',
      responsavel_id: '3',
      responsavel_nome: 'Carlos Santos',
      equipe_id: '1',
      data_criacao: '2024-11-03T14:00:00Z',
      data_vencimento: '2024-11-10T17:00:00Z',
      tags: ['backend', 'api']
    },
    {
      id: '4',
      titulo: 'Configurar CI/CD',
      descricao: 'Setup de pipeline de deploy automático',
      status: 'pendente',
      prioridade: 'baixa',
      responsavel_id: '1',
      responsavel_nome: 'Ricardo Landim',
      equipe_id: '1',
      data_criacao: '2024-11-04T11:00:00Z',
      data_vencimento: '2024-11-15T17:00:00Z',
      tags: ['devops', 'automation']
    }
  ];

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // Em produção, faria requisição para Supabase
        // const { data } = await supabase.from('tarefas').select('*').eq('equipe_id', equipe?.id);
        
        // Por enquanto, usar dados mock
        await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay da API
        setTasks(mockTasks);
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        setTasks(mockTasks); // Fallback para dados mock
      } finally {
        setLoading(false);
      }
    };

    if (equipe) {
      fetchTasks();
    }
  }, [equipe]);

  const createTask = async (taskData: Partial<Task>): Promise<{ success: boolean; error?: string }> => {
    try {
      const newTask: Task = {
        id: Date.now().toString(),
        titulo: taskData.titulo || '',
        descricao: taskData.descricao || '',
        status: 'pendente',
        prioridade: taskData.prioridade || 'media',
        responsavel_id: taskData.responsavel_id || '',
        responsavel_nome: taskData.responsavel_nome || '',
        equipe_id: equipe?.id || '',
        data_criacao: new Date().toISOString(),
        data_vencimento: taskData.data_vencimento,
        tags: taskData.tags || []
      };

      // Em produção, faria insert no Supabase
      setTasks(prev => [newTask, ...prev]);
      return { success: true };
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      return { success: false, error: 'Erro ao criar tarefa' };
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<{ success: boolean; error?: string }> => {
    try {
      // Em produção, faria update no Supabase
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              ...updates,
              data_conclusao: updates.status === 'concluida' ? new Date().toISOString() : task.data_conclusao
            }
          : task
      ));
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      return { success: false, error: 'Erro ao atualizar tarefa' };
    }
  };

  const deleteTask = async (taskId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Em produção, faria delete no Supabase
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      return { success: false, error: 'Erro ao deletar tarefa' };
    }
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const getTasksByPriority = (prioridade: Task['prioridade']) => {
    return tasks.filter(task => task.prioridade === prioridade);
  };

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    getTasksByStatus,
    getTasksByPriority
  };
}