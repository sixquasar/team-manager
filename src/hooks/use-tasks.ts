import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { supabase } from '@/lib/supabase';

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
        
        if (!equipe?.id) {
          console.log('Sem equipe selecionada, usando dados mock');
          setTasks(mockTasks);
          return;
        }

        // Buscar tarefas reais do Supabase
        const { data, error } = await supabase
          .from('tarefas')
          .select(`
            id,
            titulo,
            descricao,
            status,
            prioridade,
            responsavel_id,
            data_vencimento,
            data_conclusao,
            tags,
            created_at,
            usuarios!tarefas_responsavel_id_fkey(nome)
          `)
          .eq('equipe_id', equipe.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar tarefas:', error);
          // Fallback para dados mock
          setTasks(mockTasks);
          return;
        }

        // Transformar dados do banco para interface local
        const tasksFormatted = data?.map(task => ({
          id: task.id,
          titulo: task.titulo,
          descricao: task.descricao || '',
          status: task.status,
          prioridade: task.prioridade,
          responsavel_id: task.responsavel_id || '',
          responsavel_nome: (task.usuarios as any)?.nome || 'Não atribuído',
          equipe_id: equipe.id,
          data_criacao: task.created_at,
          data_vencimento: task.data_vencimento,
          data_conclusao: task.data_conclusao,
          tags: task.tags || []
        })) || [];

        setTasks(tasksFormatted);
        
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        // Fallback para dados mock em caso de erro
        setTasks(mockTasks);
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
      const { data, error } = await supabase
        .from('tarefas')
        .insert({
          titulo: taskData.titulo || '',
          descricao: taskData.descricao || '',
          status: 'pendente',
          prioridade: taskData.prioridade || 'media',
          responsavel_id: taskData.responsavel_id,
          equipe_id: equipe?.id,
          data_vencimento: taskData.data_vencimento,
          tags: taskData.tags || []
        })
        .select(`
          id,
          titulo,
          descricao,
          status,
          prioridade,
          responsavel_id,
          data_vencimento,
          data_conclusao,
          tags,
          created_at,
          usuarios!tarefas_responsavel_id_fkey(nome)
        `)
        .single();

      if (error) {
        console.error('Erro ao criar tarefa:', error);
        return { success: false, error: 'Erro ao criar tarefa' };
      }

      // Atualizar lista local
      const newTask = {
        id: data.id,
        titulo: data.titulo,
        descricao: data.descricao || '',
        status: data.status,
        prioridade: data.prioridade,
        responsavel_id: data.responsavel_id || '',
        responsavel_nome: (data.usuarios as any)?.nome || 'Não atribuído',
        equipe_id: equipe?.id || '',
        data_criacao: data.created_at,
        data_vencimento: data.data_vencimento,
        data_conclusao: data.data_conclusao,
        tags: data.tags || []
      };

      setTasks(prev => [newTask, ...prev]);
      return { success: true };
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      return { success: false, error: 'Erro ao criar tarefa' };
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<{ success: boolean; error?: string }> => {
    try {
      const updateData: any = {};
      if (updates.titulo) updateData.titulo = updates.titulo;
      if (updates.descricao) updateData.descricao = updates.descricao;
      if (updates.status) updateData.status = updates.status;
      if (updates.prioridade) updateData.prioridade = updates.prioridade;
      if (updates.responsavel_id) updateData.responsavel_id = updates.responsavel_id;
      if (updates.data_vencimento) updateData.data_vencimento = updates.data_vencimento;
      if (updates.tags) updateData.tags = updates.tags;
      
      // Se marcando como concluída, adicionar data de conclusão
      if (updates.status === 'concluida') {
        updateData.data_conclusao = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tarefas')
        .update(updateData)
        .eq('id', taskId);

      if (error) {
        console.error('Erro ao atualizar tarefa:', error);
        return { success: false, error: 'Erro ao atualizar tarefa' };
      }

      // Atualizar lista local
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
      const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Erro ao deletar tarefa:', error);
        return { success: false, error: 'Erro ao deletar tarefa' };
      }

      // Atualizar lista local
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