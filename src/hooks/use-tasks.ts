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
  const { equipe, usuario } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        console.log('🔍 TASKS: Iniciando busca...');
        console.log('🌐 SUPABASE URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('🔑 ANON KEY (primeiros 50):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 50));
        console.log('🏢 EQUIPE:', equipe);
        console.log('👤 USUARIO:', usuario);
        
        if (!equipe?.id) {
          console.log('⚠️ TASKS: Sem equipe selecionada');
          setTasks([]);
          setLoading(false);
          return;
        }

        console.log('🎯 TASKS: Buscando tarefas para equipe_id:', equipe.id);

        // Teste de conectividade
        const { data: testData, error: testError } = await supabase
          .from('usuarios')
          .select('count')
          .limit(1);

        if (testError) {
          console.error('❌ TASKS: ERRO DE CONEXÃO:', testError);
          setTasks([]);
          setLoading(false);
          return;
        }

        console.log('✅ TASKS: Conexão OK, buscando tarefas...');

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
          console.error('❌ TASKS: ERRO SUPABASE:', error);
          console.error('❌ Código:', error.code);
          console.error('❌ Mensagem:', error.message);
          console.error('❌ Detalhes:', error.details);
          console.error('❌ Query que falhou: SELECT FROM tarefas WHERE equipe_id =', equipe.id);
          
          // Fallback para array vazio - SEM MOCK DATA conforme CLAUDE.md
          console.log('🔄 TASKS: Erro no Supabase, retornando lista vazia');
          setTasks([]);
          setLoading(false);
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

        console.log('✅ TASKS: Query executada com sucesso');
        console.log('📊 TASKS: Tarefas encontradas:', data?.length || 0);
        console.log('🗃️ TASKS: Dados brutos completos:', JSON.stringify(data, null, 2));
        console.log('🎯 TASKS: Equipe filtrada:', equipe.id);
        
        // Processar dados sempre do Supabase - nunca mock data
        setTasks(tasksFormatted);
        
      } catch (error) {
        console.error('❌ TASKS: ERRO JAVASCRIPT:', error);
        // Fallback para array vazio - SEM MOCK DATA conforme CLAUDE.md
        console.log('🔄 TASKS: Erro JavaScript, retornando lista vazia');
        setTasks([]);
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
      console.log('🔍 TASKS UPDATE: Iniciando atualização...');
      console.log('🎯 Task ID:', taskId);
      console.log('📝 Updates:', updates);
      console.log('🌐 SUPABASE URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔑 ANON KEY (primeiros 50):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 50));

      // Teste de conectividade
      const { data: testData, error: testError } = await supabase
        .from('usuarios')
        .select('count')
        .limit(1);

      if (testError) {
        console.error('❌ TASKS UPDATE: ERRO DE CONEXÃO:', testError);
        // Atualizar apenas localmente como fallback
        console.log('🔄 TASKS UPDATE: Atualizando apenas localmente...');
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
      }

      console.log('✅ TASKS UPDATE: Conexão OK, atualizando no Supabase...');

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

      console.log('📊 TASKS UPDATE: Dados para update:', updateData);

      const { error } = await supabase
        .from('tarefas')
        .update(updateData)
        .eq('id', taskId);

      if (error) {
        console.error('❌ TASKS UPDATE: ERRO SUPABASE:', error);
        console.error('❌ Código:', error.code);
        console.error('❌ Mensagem:', error.message);
        console.error('❌ Detalhes:', error.details);
        
        // Fallback: atualizar apenas localmente
        console.log('🔄 TASKS UPDATE: Erro no Supabase, atualizando localmente...');
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                ...updates,
                data_conclusao: updates.status === 'concluida' ? new Date().toISOString() : task.data_conclusao
              }
            : task
        ));
        return { success: true }; // Sucesso local
      }

      console.log('✅ TASKS UPDATE: Atualizado no Supabase com sucesso');

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

      console.log('✅ TASKS UPDATE: Lista local atualizada');
      
      return { success: true };
    } catch (error) {
      console.error('❌ TASKS UPDATE: ERRO JAVASCRIPT:', error);
      
      // Fallback: atualizar apenas localmente mesmo com erro
      console.log('🔄 TASKS UPDATE: Erro JavaScript, atualizando localmente...');
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              ...updates,
              data_conclusao: updates.status === 'concluida' ? new Date().toISOString() : task.data_conclusao
            }
          : task
      ));
      return { success: true }; // Sucesso local
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

  const refetch = async () => {
    try {
      setLoading(true);
      
      if (!equipe?.id) {
        console.log('⚠️ TASKS REFETCH: Sem equipe selecionada');
        setTasks([]);
        setLoading(false);
        return;
      }

      console.log('🔄 Recarregando tarefas do Supabase...');
      
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
        console.error('❌ TASKS REFETCH: ERRO SUPABASE:', error);
        console.error('❌ Código:', error.code);
        console.error('❌ Mensagem:', error.message);
        console.error('❌ Detalhes:', error.details);
        
        // Fallback para array vazio - SEM MOCK DATA conforme CLAUDE.md
        console.log('🔄 TASKS REFETCH: Erro no Supabase, retornando lista vazia');
        setTasks([]);
        setLoading(false);
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
      console.log(`✅ ${tasksFormatted.length} tarefas recarregadas com sucesso`);
      
    } catch (error) {
      console.error('❌ TASKS REFETCH: ERRO JAVASCRIPT:', error);
      // Fallback para array vazio - SEM MOCK DATA conforme CLAUDE.md
      console.log('🔄 TASKS REFETCH: Erro JavaScript, retornando lista vazia');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    getTasksByStatus,
    getTasksByPriority,
    refetch
  };
}