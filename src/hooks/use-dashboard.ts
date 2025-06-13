import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextTeam';

interface TeamMetrics {
  tasksCompleted: number;
  tasksInProgress: number;
  productivity: number;
  activeMembers: number;
}

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  author: string;
  timestamp: string;
}

export function useDashboard() {
  const { equipe, usuario } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<TeamMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [equipe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simular delay de carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data para demonstração
      setMetrics({
        tasksCompleted: 47,
        tasksInProgress: 12,
        productivity: 85,
        activeMembers: 3
      });

      setRecentActivity([
        {
          id: '1',
          title: 'Nova tarefa criada',
          description: 'Sistema de autenticação implementado',
          author: 'Ricardo Landim',
          timestamp: '2h atrás'
        },
        {
          id: '2', 
          title: 'Tarefa concluída',
          description: 'Design da interface finalizado',
          author: 'Leonardo Candiani',
          timestamp: '4h atrás'
        },
        {
          id: '3',
          title: 'Projeto atualizado',
          description: 'Documentação do projeto revisada',
          author: 'Rodrigo Marochi', 
          timestamp: '6h atrás'
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    metrics,
    recentActivity
  };
}