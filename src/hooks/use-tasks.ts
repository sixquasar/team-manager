import { useState, useEffect } from 'react';
import { supabase, supabaseUtils } from '@/lib/supabase';
import { Task } from '@/types';
import { useAuth } from '@/contexts/AuthContextTeam';

export function useTasks() {
  const { team } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks
  const fetchTasks = async () => {
    if (!team) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabaseUtils.safeQuery<Task>(
        'tasks',
        (query) => query
          .select(`
            *,
            assignee:assigned_to(id, nome, email, cargo),
            creator:created_by(id, nome, email)
          `)
          .eq('team_id', team.id)
          .order('created_at', { ascending: false })
      );

      if (fetchError) {
        throw new Error(fetchError);
      }

      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas');
      
      // Fallback to mock data
      setTasks([
        {
          id: '1',
          titulo: 'Configurar ambiente',
          descricao: 'Configurar Vite e TypeScript',
          status: 'done',
          prioridade: 'high',
          assigned_to: '22222222-2222-2222-2222-222222222222',
          created_by: '22222222-2222-2222-2222-222222222222',
          team_id: team.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          titulo: 'Design do sistema',
          descricao: 'Criar mockups das telas',
          status: 'in_progress',
          prioridade: 'high',
          assigned_to: '33333333-3333-3333-3333-333333333333',
          created_by: '22222222-2222-2222-2222-222222222222',
          team_id: team.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Create task
  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (!team) {
      throw new Error('Equipe não encontrada');
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, team_id: team.id }])
        .select(`
          *,
          assignee:assigned_to(id, nome, email, cargo),
          creator:created_by(id, nome, email)
        `)
        .single();

      if (error) throw error;

      setTasks(prev => [data, ...prev]);
      return { success: true, data };
    } catch (error) {
      console.error('Error creating task:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao criar tarefa' 
      };
    }
  };

  // Update task
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select(`
          *,
          assignee:assigned_to(id, nome, email, cargo),
          creator:created_by(id, nome, email)
        `)
        .single();

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? data : task
      ));

      return { success: true, data };
    } catch (error) {
      console.error('Error updating task:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao atualizar tarefa' 
      };
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao deletar tarefa' 
      };
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    const updates: Partial<Task> = { status };
    
    // Set completed_at when task is marked as done
    if (status === 'done') {
      updates.completed_at = new Date().toISOString();
    } else if (status !== 'done') {
      updates.completed_at = undefined;
    }

    return updateTask(taskId, updates);
  };

  // Get tasks by status
  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  // Get tasks by assignee
  const getTasksByAssignee = (userId: string) => {
    return tasks.filter(task => task.assigned_to === userId);
  };

  // Get overdue tasks
  const getOverdueTasks = () => {
    const now = new Date();
    return tasks.filter(task => 
      task.due_date && 
      new Date(task.due_date) < now && 
      task.status !== 'done'
    );
  };

  useEffect(() => {
    fetchTasks();
  }, [team]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getTasksByStatus,
    getTasksByAssignee,
    getOverdueTasks
  };
}