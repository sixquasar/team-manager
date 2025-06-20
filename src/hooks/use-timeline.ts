import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { supabase } from '@/lib/supabase';

export interface TimelineEvent {
  id: string;
  type: 'task' | 'message' | 'milestone' | 'meeting' | 'deadline';
  title: string;
  description: string;
  author: string;
  timestamp: string;
  project?: string;
  metadata?: {
    taskStatus?: 'completed' | 'started' | 'delayed';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    participants?: string[];
  };
}

export function useTimeline() {
  const { equipe, usuario } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    fetchTimelineEvents();
  }, [equipe]);

  const fetchTimelineEvents = async () => {
    try {
      setLoading(true);
      console.log('🔍 TIMELINE: Iniciando busca...');
      console.log('🌐 SUPABASE URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔑 ANON KEY (primeiros 50):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 50));
      console.log('🏢 EQUIPE:', equipe);
      console.log('👤 USUARIO:', usuario);

      // Teste de conectividade
      const { data: testData, error: testError } = await supabase
        .from('usuarios')
        .select('count')
        .limit(1);

      if (testError) {
        console.error('❌ TIMELINE: ERRO DE CONEXÃO:', testError);
        setEvents([]);
        setLoading(false);
        return;
      }

      console.log('✅ TIMELINE: Conexão OK, buscando eventos...');

      if (!equipe?.id) {
        console.log('⚠️ TIMELINE: Sem equipe selecionada');
        console.log('🔍 TIMELINE: Dados de equipe:', equipe);
        setEvents([]);
        setLoading(false);
        return;
      }

      console.log('🎯 TIMELINE: Buscando eventos para equipe_id:', equipe.id);
      console.log('👤 TIMELINE: Usuario atual:', usuario);

      // TESTE: Verificar se existem eventos na tabela (sem filtro)
      const { data: allEvents, error: testError } = await supabase
        .from('eventos_timeline')
        .select('id, equipe_id, tipo, titulo')
        .limit(10);

      if (testError) {
        console.error('❌ TIMELINE TEST: Erro ao buscar todos eventos:', testError);
      } else {
        console.log('🧪 TIMELINE TEST: Total eventos na tabela:', allEvents?.length || 0);
        console.log('🧪 TIMELINE TEST: Eventos encontrados:', allEvents);
      }

      // Buscar eventos reais do Supabase
      const { data, error } = await supabase
        .from('eventos_timeline')
        .select(`
          id,
          tipo,
          titulo,
          descricao,
          autor,
          projeto,
          metadata,
          created_at
        `)
        .eq('equipe_id', equipe.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ TIMELINE: ERRO SUPABASE:', error);
        console.error('❌ Código:', error.code);
        console.error('❌ Mensagem:', error.message);
        console.error('❌ Detalhes:', error.details);
        console.error('❌ Query que falhou: SELECT FROM eventos_timeline WHERE equipe_id =', equipe.id);
        
        // Fallback para array vazio - SEM MOCK DATA
        console.log('🔄 TIMELINE: Erro no Supabase, retornando lista vazia');
        setEvents([]);
      } else {
        console.log('✅ TIMELINE: Query executada com sucesso');
        console.log('📊 TIMELINE: Eventos encontrados:', data?.length || 0);
        console.log('🗃️ TIMELINE: Dados brutos completos:', JSON.stringify(data, null, 2));
        console.log('🎯 TIMELINE: Equipe filtrada:', equipe.id);
        
        // Transformar dados do banco para interface local
        const eventsFormatted = data?.map(event => ({
          id: event.id,
          type: event.tipo,
          title: event.titulo,
          description: event.descricao || '',
          author: event.autor || 'Sistema',
          timestamp: event.created_at, // Usar created_at como timestamp
          project: event.projeto,
          metadata: event.metadata || {}
        })) || [];

        setEvents(eventsFormatted);
      }
      
    } catch (error) {
      console.error('❌ TIMELINE: ERRO JAVASCRIPT:', error);
      // Fallback para array vazio - SEM MOCK DATA
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<TimelineEvent, 'id'>): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔍 TIMELINE CREATE: Iniciando criação...');
      console.log('📝 Event Data:', eventData);

      if (!equipe?.id || !usuario?.id) {
        return { success: false, error: 'Equipe ou usuário não identificados' };
      }

      // Teste de conectividade
      const { data: testData, error: testError } = await supabase
        .from('usuarios')
        .select('count')
        .limit(1);

      if (testError) {
        console.error('❌ TIMELINE CREATE: ERRO DE CONEXÃO:', testError);
        return { success: false, error: 'Erro de conexão com banco de dados' };
      }

      console.log('✅ TIMELINE CREATE: Conexão OK, criando evento...');

      const { data, error } = await supabase
        .from('eventos_timeline')
        .insert({
          tipo: eventData.type,
          titulo: eventData.title,
          descricao: eventData.description,
          autor: usuario.nome,
          autor_id: usuario.id,
          equipe_id: equipe.id,
          projeto: eventData.project,
          metadata: eventData.metadata || {}
        })
        .select(`
          id,
          tipo,
          titulo,
          descricao,
          autor,
          projeto,
          metadata,
          created_at
        `)
        .single();

      if (error) {
        console.error('❌ TIMELINE CREATE: ERRO SUPABASE:', error);
        console.error('❌ Código:', error.code);
        console.error('❌ Mensagem:', error.message);
        console.error('❌ Detalhes:', error.details);
        return { success: false, error: 'Erro ao criar evento' };
      }

      console.log('✅ TIMELINE CREATE: Evento criado no Supabase');

      // Adicionar à lista local
      const newEvent: TimelineEvent = {
        id: data.id,
        type: data.tipo,
        title: data.titulo,
        description: data.descricao || '',
        author: data.autor || usuario.nome,
        timestamp: data.created_at, // Usar created_at como timestamp
        project: data.projeto,
        metadata: data.metadata || {}
      };

      setEvents(prev => [newEvent, ...prev]);
      console.log('✅ TIMELINE CREATE: Lista local atualizada');
      
      return { success: true };
    } catch (error) {
      console.error('❌ TIMELINE CREATE: ERRO JAVASCRIPT:', error);
      return { success: false, error: 'Erro ao criar evento' };
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<TimelineEvent>): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔍 TIMELINE UPDATE: Iniciando atualização...');
      console.log('🎯 Event ID:', eventId);
      console.log('📝 Updates:', updates);

      if (!equipe?.id) {
        return { success: false, error: 'Equipe não identificada' };
      }

      // Teste de conectividade
      const { data: testData, error: testError } = await supabase
        .from('usuarios')
        .select('count')
        .limit(1);

      if (testError) {
        console.error('❌ TIMELINE UPDATE: ERRO DE CONEXÃO:', testError);
        return { success: false, error: 'Erro de conexão com banco de dados' };
      }

      console.log('✅ TIMELINE UPDATE: Conexão OK, atualizando evento...');

      const updateData: any = {};
      if (updates.type) updateData.tipo = updates.type;
      if (updates.title) updateData.titulo = updates.title;
      if (updates.description) updateData.descricao = updates.description;
      if (updates.project) updateData.projeto = updates.project;
      if (updates.metadata) updateData.metadata = updates.metadata;
      // Note: timestamp é read-only, usa created_at automaticamente

      console.log('📊 TIMELINE UPDATE: Dados para update:', updateData);

      const { error } = await supabase
        .from('eventos_timeline')
        .update(updateData)
        .eq('id', eventId);

      if (error) {
        console.error('❌ TIMELINE UPDATE: ERRO SUPABASE:', error);
        console.error('❌ Código:', error.code);
        console.error('❌ Mensagem:', error.message);
        console.error('❌ Detalhes:', error.details);
        return { success: false, error: 'Erro ao atualizar evento' };
      }

      console.log('✅ TIMELINE UPDATE: Atualizado no Supabase com sucesso');

      // Atualizar lista local
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, ...updates }
          : event
      ));

      console.log('✅ TIMELINE UPDATE: Lista local atualizada');
      
      return { success: true };
    } catch (error) {
      console.error('❌ TIMELINE UPDATE: ERRO JAVASCRIPT:', error);
      return { success: false, error: 'Erro ao atualizar evento' };
    }
  };

  const deleteEvent = async (eventId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔍 TIMELINE DELETE: Iniciando exclusão...');
      console.log('🎯 Event ID:', eventId);

      // Teste de conectividade
      const { data: testData, error: testError } = await supabase
        .from('usuarios')
        .select('count')
        .limit(1);

      if (testError) {
        console.error('❌ TIMELINE DELETE: ERRO DE CONEXÃO:', testError);
        return { success: false, error: 'Erro de conexão com banco de dados' };
      }

      console.log('✅ TIMELINE DELETE: Conexão OK, excluindo evento...');

      const { error } = await supabase
        .from('eventos_timeline')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('❌ TIMELINE DELETE: ERRO SUPABASE:', error);
        console.error('❌ Código:', error.code);
        console.error('❌ Mensagem:', error.message);
        console.error('❌ Detalhes:', error.details);
        return { success: false, error: 'Erro ao excluir evento' };
      }

      console.log('✅ TIMELINE DELETE: Excluído do Supabase com sucesso');

      // Remover da lista local
      setEvents(prev => prev.filter(event => event.id !== eventId));

      console.log('✅ TIMELINE DELETE: Lista local atualizada');
      
      return { success: true };
    } catch (error) {
      console.error('❌ TIMELINE DELETE: ERRO JAVASCRIPT:', error);
      return { success: false, error: 'Erro ao excluir evento' };
    }
  };

  return {
    loading,
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchTimelineEvents
  };
}