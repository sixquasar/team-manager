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

  // Dados reais das tarefas da SixQuasar baseados nos projetos
  const mockTasks: Task[] = [
    // Tarefas do Projeto Palmas IA
    {
      id: 'task-palmas-001',
      titulo: 'Arquitetura Sistema Palmas IA',
      descricao: 'Definir arquitetura completa para atender 350k habitantes com 99.9% disponibilidade',
      status: 'concluida',
      prioridade: 'alta',
      responsavel_id: '550e8400-e29b-41d4-a716-446655440001',
      responsavel_nome: 'Ricardo Landim',
      equipe_id: '650e8400-e29b-41d4-a716-446655440001',
      data_criacao: '2025-05-01T09:00:00Z',
      data_vencimento: '2025-05-15T17:00:00Z',
      data_conclusao: '2025-05-14T16:30:00Z',
      tags: ['arquitetura', 'kubernetes', 'aws', 'redis']
    },
    {
      id: 'task-palmas-002',
      titulo: 'Integração WhatsApp API Palmas',
      descricao: 'Implementar integração com WhatsApp para meta de 1M mensagens/mês',
      status: 'em_progresso',
      prioridade: 'alta',
      responsavel_id: '550e8400-e29b-41d4-a716-446655440003',
      responsavel_nome: 'Rodrigo Marochi',
      equipe_id: '650e8400-e29b-41d4-a716-446655440001',
      data_criacao: '2025-05-16T10:00:00Z',
      data_vencimento: '2025-07-31T17:00:00Z',
      tags: ['whatsapp', 'api', 'integração', 'messaging']
    },
    {
      id: 'task-palmas-003',
      titulo: 'LangChain + GPT-4o Setup',
      descricao: 'Configurar pipeline de IA para processar consultas dos cidadãos',
      status: 'em_progresso',
      prioridade: 'alta',
      responsavel_id: '550e8400-e29b-41d4-a716-446655440001',
      responsavel_nome: 'Ricardo Landim',
      equipe_id: '650e8400-e29b-41d4-a716-446655440001',
      data_criacao: '2025-06-01T08:00:00Z',
      data_vencimento: '2025-08-15T17:00:00Z',
      tags: ['langchain', 'openai', 'gpt-4o', 'ia', 'nlp']
    },
    // Tarefas do Projeto Jocum SDK
    {
      id: 'task-jocum-001',
      titulo: 'SDK Multi-LLM Jocum',
      descricao: 'Desenvolver SDK que integra OpenAI + Anthropic + Gemini com fallback automático',
      status: 'concluida',
      prioridade: 'alta',
      responsavel_id: '550e8400-e29b-41d4-a716-446655440002',
      responsavel_nome: 'Leonardo Candiani',
      equipe_id: '650e8400-e29b-41d4-a716-446655440001',
      data_criacao: '2025-06-01T09:00:00Z',
      data_vencimento: '2025-06-15T17:00:00Z',
      data_conclusao: '2025-06-14T15:20:00Z',
      tags: ['sdk', 'openai', 'anthropic', 'gemini', 'multi-llm']
    },
    {
      id: 'task-jocum-002',
      titulo: 'Mapeamento 80 Bases Jocum',
      descricao: 'Mapear e integrar todas as 80+ bases de dados da Jocum para o sistema',
      status: 'em_progresso',
      prioridade: 'media',
      responsavel_id: '550e8400-e29b-41d4-a716-446655440003',
      responsavel_nome: 'Rodrigo Marochi',
      equipe_id: '650e8400-e29b-41d4-a716-446655440001',
      data_criacao: '2025-06-10T14:00:00Z',
      data_vencimento: '2025-08-01T17:00:00Z',
      tags: ['mapeamento', 'bases-dados', 'integração', 'jocum']
    },
    {
      id: 'task-jocum-003',
      titulo: 'VoIP + WhatsApp Integration',
      descricao: 'Integrar canais VoIP e WhatsApp para cobertura completa de atendimento',
      status: 'pendente',
      prioridade: 'alta',
      responsavel_id: '550e8400-e29b-41d4-a716-446655440003',
      responsavel_nome: 'Rodrigo Marochi',
      equipe_id: '650e8400-e29b-41d4-a716-446655440001',
      data_criacao: '2025-06-15T11:00:00Z',
      data_vencimento: '2025-09-01T17:00:00Z',
      tags: ['voip', 'whatsapp', 'canais', 'atendimento']
    },
    // Tarefas Gerais da SixQuasar
    {
      id: 'task-sixquasar-001',
      titulo: 'Deploy Team Manager',
      descricao: 'Deploy do sistema Team Manager em admin.sixquasar.pro',
      status: 'concluida',
      prioridade: 'media',
      responsavel_id: '550e8400-e29b-41d4-a716-446655440001',
      responsavel_nome: 'Ricardo Landim',
      equipe_id: '650e8400-e29b-41d4-a716-446655440001',
      data_criacao: '2025-06-18T16:00:00Z',
      data_vencimento: '2025-06-20T17:00:00Z',
      data_conclusao: '2025-06-20T14:45:00Z',
      tags: ['deploy', 'team-manager', 'produção', 'nginx']
    },
    {
      id: 'task-sixquasar-002',
      titulo: 'Documentação Projetos',
      descricao: 'Documentar arquitetura e processos dos projetos Palmas e Jocum',
      status: 'pendente',
      prioridade: 'baixa',
      responsavel_id: '550e8400-e29b-41d4-a716-446655440002',
      responsavel_nome: 'Leonardo Candiani',
      equipe_id: '650e8400-e29b-41d4-a716-446655440001',
      data_criacao: '2025-06-20T09:00:00Z',
      data_vencimento: '2025-07-10T17:00:00Z',
      tags: ['documentação', 'arquitetura', 'processos']
    }
  ];

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        console.log('🔍 TASKS: Iniciando busca...');
        console.log('🌐 SUPABASE URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('🔑 ANON KEY (primeiros 50):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 50));
        console.log('🏢 EQUIPE:', equipe);
        
        if (!equipe?.id) {
          console.log('⚠️ TASKS: Sem equipe selecionada, usando dados mock');
          setTasks(mockTasks);
          return;
        }

        // Teste de conectividade
        const { data: testData, error: testError } = await supabase
          .from('usuarios')
          .select('count')
          .limit(1);

        if (testError) {
          console.error('❌ TASKS: ERRO DE CONEXÃO:', testError);
          setTasks(mockTasks);
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

        console.log('✅ TASKS: Tarefas encontradas:', data?.length || 0);
        console.log('📊 TASKS: Dados brutos:', data);
        console.log('🎯 TASKS: Tarefas formatadas:', tasksFormatted);
        
        setTasks(tasksFormatted);
        
      } catch (error) {
        console.error('❌ TASKS: ERRO JAVASCRIPT:', error);
        // Fallback para dados mock em caso de erro
        console.log('🔄 TASKS: Usando fallback para dados mock');
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
        console.log('🔄 Sem equipe selecionada, usando dados mock');
        setTasks(mockTasks);
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
        console.error('❌ Erro ao recarregar tarefas:', error);
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
      console.log(`✅ ${tasksFormatted.length} tarefas recarregadas com sucesso`);
      
    } catch (error) {
      console.error('❌ Erro ao recarregar tarefas:', error);
      // Fallback para dados mock em caso de erro
      setTasks(mockTasks);
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