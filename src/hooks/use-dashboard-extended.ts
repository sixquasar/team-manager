import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { supabase } from '@/lib/supabase';

interface Project {
  id: string;
  nome: string;
  cliente: string;
  progresso: number;
  orcamento: number;
  data_inicio: string;
  data_fim_prevista: string;
}

interface Milestone {
  id: string;
  titulo: string;
  descricao: string;
  data_prevista: string;
  tipo: 'entrega' | 'marco' | 'reuniao';
  projeto_id?: string;
  projeto_nome?: string;
}

export function useDashboardExtended() {
  const { equipe } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExtendedData();
  }, [equipe]);

  const fetchExtendedData = async () => {
    try {
      setLoading(true);
      
      if (!equipe?.id) {
        setProjects([]);
        setMilestones([]);
        setLoading(false);
        return;
      }

      // Buscar projetos ativos
      console.log('🔍 DASHBOARD: Buscando projetos para equipe:', equipe.id);
      
      const { data: projetosData, error: projetosError } = await supabase
        .from('projetos')
        .select('*')
        .eq('equipe_id', equipe.id)
        .in('status', ['planejamento', 'em_progresso'])
        .order('created_at', { ascending: false });

      if (projetosError) {
        console.error('❌ DASHBOARD: Erro ao buscar projetos:', projetosError);
        console.error('❌ DASHBOARD: Detalhes do erro:', {
          message: projetosError.message,
          details: projetosError.details,
          hint: projetosError.hint,
          code: projetosError.code
        });
      } else if (projetosData) {
        console.log('✅ DASHBOARD: Projetos encontrados:', projetosData.length);
        if (projetosData.length > 0) {
          console.log('📊 DASHBOARD: Estrutura do primeiro projeto:', Object.keys(projetosData[0]));
          console.log('📊 DASHBOARD: Dados do primeiro projeto:', projetosData[0]);
        }
        // Mapear campos para garantir compatibilidade
        const projetosMapeados = projetosData.map(p => ({
          id: p.id,
          nome: p.nome || p.name || 'Projeto sem nome',
          cliente: p.cliente || p.cliente_nome || 'Cliente não definido',
          progresso: p.progresso || 0,
          orcamento: p.orcamento || 0,
          data_inicio: p.data_inicio || p.created_at || new Date().toISOString(),
          data_fim_prevista: p.data_fim_prevista || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        }));
        setProjects(projetosMapeados);
      } else {
        console.warn('⚠️ DASHBOARD: Nenhum projeto retornado, mas sem erro');
        setProjects([]);
      }
      
      // Se não encontrou projetos com status específicos, buscar todos
      if (!projetosData || projetosData.length === 0) {
        console.log('🔄 DASHBOARD: Buscando TODOS os projetos como fallback...');
        const { data: todosProjetosData, error: todosProjetosError } = await supabase
          .from('projetos')
          .select('*')
          .eq('equipe_id', equipe.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (todosProjetosError) {
          console.error('❌ DASHBOARD: Erro ao buscar todos projetos:', todosProjetosError);
        } else if (todosProjetosData && todosProjetosData.length > 0) {
          console.log('✅ DASHBOARD: Projetos encontrados no fallback:', todosProjetosData.length);
          console.log('📊 DASHBOARD: Status dos projetos:', todosProjetosData.map(p => p.status));
          // Mapear campos do fallback também
          const projetosFallbackMapeados = todosProjetosData.map(p => ({
            id: p.id,
            nome: p.nome || p.name || 'Projeto sem nome',
            cliente: p.cliente || p.cliente_nome || 'Cliente não definido',
            progresso: p.progresso || 0,
            orcamento: p.orcamento || 0,
            data_inicio: p.data_inicio || p.created_at || new Date().toISOString(),
            data_fim_prevista: p.data_fim_prevista || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
          }));
          setProjects(projetosFallbackMapeados);
        }
      }

      // Buscar marcos próximos (tarefas importantes)
      const { data: tarefasData, error: tarefasError } = await supabase
        .from('tarefas')
        .select(`
          id,
          titulo,
          descricao,
          data_vencimento,
          prioridade,
          projeto_id,
          projetos(nome)
        `)
        .eq('equipe_id', equipe.id)
        .in('prioridade', ['alta', 'urgente'])
        .gte('data_vencimento', new Date().toISOString())
        .order('data_vencimento', { ascending: true })
        .limit(3);

      if (tarefasError) {
        console.error('❌ DASHBOARD: Erro ao buscar marcos:', tarefasError);
      } else if (tarefasData) {
        const milestonesData = tarefasData.map(tarefa => ({
          id: tarefa.id,
          titulo: tarefa.titulo,
          descricao: tarefa.descricao || '',
          data_prevista: tarefa.data_vencimento,
          tipo: tarefa.prioridade === 'urgente' ? 'entrega' : 'marco' as const,
          projeto_id: tarefa.projeto_id,
          projeto_nome: (tarefa.projetos as any)?.nome
        }));
        setMilestones(milestonesData);
      }

    } catch (error) {
      console.error('❌ DASHBOARD: Erro ao buscar dados estendidos:', error);
      setProjects([]);
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatDateBR = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return {
    projects,
    milestones,
    loading,
    formatCurrency,
    formatDate,
    formatDateBR,
    formatDateRange,
    refetch: fetchExtendedData
  };
}