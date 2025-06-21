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
      const { data: projetosData, error: projetosError } = await supabase
        .from('projetos')
        .select('*')
        .eq('equipe_id', equipe.id)
        .in('status', ['planejamento', 'em_progresso'])
        .order('created_at', { ascending: false });

      if (projetosError) {
        console.error('❌ DASHBOARD: Erro ao buscar projetos:', projetosError);
      } else if (projetosData) {
        setProjects(projetosData);
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