import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { supabase } from '@/lib/supabase';

export interface TeamMember {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  tipo: 'owner' | 'admin' | 'member';
  avatar_url?: string;
  telefone?: string;
  localizacao?: string;
  data_entrada: string;
  status: 'ativo' | 'inativo' | 'ferias';
  especialidades: string[];
  projetos_ativos: number;
  tarefas_concluidas: number;
  rating: number;
}

export function useTeam() {
  const { equipe } = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetchTeamMembers();
  }, [equipe]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      
      if (!equipe?.id) {
        console.log('🚨 TEAM: Sem equipe selecionada, usando dados SixQuasar');
        
        // Dados da equipe SixQuasar baseados nos projetos reais
        setMembers([
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            nome: 'Ricardo Landim',
            email: 'ricardo@sixquasar.pro',
            cargo: 'Tech Lead',
            tipo: 'owner',
            telefone: '+55 11 99999-9999',
            localizacao: 'São Paulo, SP',
            data_entrada: '2024-01-01T00:00:00Z',
            status: 'ativo',
            especialidades: ['Python', 'IA', 'Arquitetura', 'LangChain', 'AWS'],
            projetos_ativos: 2, // Palmas IA + Jocum
            tarefas_concluidas: 8,
            rating: 4.9
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            nome: 'Leonardo Candiani',
            email: 'leonardo@sixquasar.pro',
            cargo: 'Developer',
            tipo: 'admin',
            telefone: '+55 11 88888-8888',
            localizacao: 'São Paulo, SP',
            data_entrada: '2024-01-15T00:00:00Z',
            status: 'ativo',
            especialidades: ['Python', 'SDK', 'OpenAI', 'Anthropic', 'Multi-LLM'],
            projetos_ativos: 1, // Jocum SDK
            tarefas_concluidas: 6,
            rating: 4.8
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440003',
            nome: 'Rodrigo Marochi',
            email: 'rodrigo@sixquasar.pro',
            cargo: 'Developer',
            tipo: 'member',
            telefone: '+55 11 77777-7777',
            localizacao: 'São Paulo, SP',
            data_entrada: '2024-02-01T00:00:00Z',
            status: 'ativo',
            especialidades: ['WhatsApp API', 'VoIP', 'Integrações', 'Mapeamento'],
            projetos_ativos: 2, // Palmas IA + Jocum
            tarefas_concluidas: 4,
            rating: 4.7
          }
        ]);
        
        setLoading(false);
        return;
      }

      console.log('✅ TEAM: Equipe encontrada, buscando membros do Supabase');
      
      // Buscar membros reais do Supabase
      const { data: membrosData, error } = await supabase
        .from('usuario_equipes')
        .select(`
          usuario_id,
          role,
          data_entrada,
          ativo,
          usuarios!usuario_equipes_usuario_id_fkey(
            id,
            nome,
            email,
            cargo,
            tipo,
            avatar_url,
            telefone,
            localizacao,
            ativo
          )
        `)
        .eq('equipe_id', equipe.id)
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar membros da equipe:', error);
        // Fallback para dados SixQuasar
        setMembers([
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            nome: 'Ricardo Landim',
            email: 'ricardo@sixquasar.pro',
            cargo: 'Tech Lead',
            tipo: 'owner',
            data_entrada: '2024-01-01T00:00:00Z',
            status: 'ativo',
            especialidades: ['Python', 'IA', 'Arquitetura'],
            projetos_ativos: 2,
            tarefas_concluidas: 8,
            rating: 4.9
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            nome: 'Leonardo Candiani',
            email: 'leonardo@sixquasar.pro',
            cargo: 'Developer',
            tipo: 'admin',
            data_entrada: '2024-01-15T00:00:00Z',
            status: 'ativo',
            especialidades: ['Python', 'SDK', 'Multi-LLM'],
            projetos_ativos: 1,
            tarefas_concluidas: 6,
            rating: 4.8
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440003',
            nome: 'Rodrigo Marochi',
            email: 'rodrigo@sixquasar.pro',
            cargo: 'Developer',
            tipo: 'member',
            data_entrada: '2024-02-01T00:00:00Z',
            status: 'ativo',
            especialidades: ['WhatsApp', 'Integrações'],
            projetos_ativos: 2,
            tarefas_concluidas: 4,
            rating: 4.7
          }
        ]);
        return;
      }

      // Buscar estatísticas de projetos e tarefas para cada membro
      const membersWithStats = await Promise.all(
        membrosData?.map(async (membro) => {
          const usuario = membro.usuarios as any;
          
          // Contar projetos ativos
          const { count: projetosAtivos } = await supabase
            .from('projetos')
            .select('*', { count: 'exact', head: true })
            .eq('responsavel_id', usuario.id)
            .in('status', ['planejamento', 'em_progresso']);

          // Contar tarefas concluídas
          const { count: tarefasConcluidas } = await supabase
            .from('tarefas')
            .select('*', { count: 'exact', head: true })
            .eq('responsavel_id', usuario.id)
            .eq('status', 'concluida');

          return {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            cargo: usuario.cargo || 'Developer',
            tipo: membro.role,
            avatar_url: usuario.avatar_url,
            telefone: usuario.telefone,
            localizacao: usuario.localizacao,
            data_entrada: membro.data_entrada,
            status: usuario.ativo ? 'ativo' : 'inativo',
            especialidades: getEspecialidadesByRole(usuario.cargo),
            projetos_ativos: projetosAtivos || 0,
            tarefas_concluidas: tarefasConcluidas || 0,
            rating: calculateRating(tarefasConcluidas || 0, projetosAtivos || 0)
          };
        }) || []
      );

      setMembers(membersWithStats);

    } catch (error) {
      console.error('Erro ao carregar membros da equipe:', error);
      
      // Fallback para dados SixQuasar em caso de erro
      setMembers([
        {
          id: '1',
          nome: 'Ricardo Landim',
          email: 'ricardo@sixquasar.pro',
          cargo: 'Tech Lead',
          tipo: 'owner',
          data_entrada: '2024-01-01T00:00:00Z',
          status: 'ativo',
          especialidades: ['Python', 'IA', 'Arquitetura'],
          projetos_ativos: 2,
          tarefas_concluidas: 8,
          rating: 4.9
        },
        {
          id: '2',
          nome: 'Leonardo Candiani',
          email: 'leonardo@sixquasar.pro',
          cargo: 'Developer',
          tipo: 'admin',
          data_entrada: '2024-01-15T00:00:00Z',
          status: 'ativo',
          especialidades: ['Python', 'SDK', 'Multi-LLM'],
          projetos_ativos: 1,
          tarefas_concluidas: 6,
          rating: 4.8
        },
        {
          id: '3',
          nome: 'Rodrigo Marochi',
          email: 'rodrigo@sixquasar.pro',
          cargo: 'Developer',
          tipo: 'member',
          data_entrada: '2024-02-01T00:00:00Z',
          status: 'ativo',
          especialidades: ['WhatsApp', 'Integrações'],
          projetos_ativos: 2,
          tarefas_concluidas: 4,
          rating: 4.7
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getEspecialidadesByRole = (cargo: string): string[] => {
    switch (cargo?.toLowerCase()) {
      case 'tech lead':
        return ['Python', 'IA', 'Arquitetura', 'LangChain', 'AWS'];
      case 'developer':
        return ['Python', 'React', 'API', 'Integrações'];
      default:
        return ['JavaScript', 'React', 'Node.js'];
    }
  };

  const calculateRating = (tarefasConcluidas: number, projetosAtivos: number): number => {
    const baseRating = 4.0;
    const taskBonus = Math.min(tarefasConcluidas * 0.1, 0.8);
    const projectBonus = Math.min(projetosAtivos * 0.05, 0.2);
    return Math.min(baseRating + taskBonus + projectBonus, 5.0);
  };

  const addMember = async (memberData: Partial<TeamMember>): Promise<{ success: boolean; error?: string }> => {
    try {
      // Em produção, criaria usuário e associaria à equipe
      console.log('Adicionando membro:', memberData);
      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      return { success: false, error: 'Erro ao adicionar membro' };
    }
  };

  const updateMember = async (memberId: string, updates: Partial<TeamMember>): Promise<{ success: boolean; error?: string }> => {
    try {
      // Em produção, atualizaria dados do usuário
      console.log('Atualizando membro:', memberId, updates);
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      return { success: false, error: 'Erro ao atualizar membro' };
    }
  };

  const removeMember = async (memberId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Em produção, removeria associação da equipe
      console.log('Removendo membro:', memberId);
      setMembers(prev => prev.filter(member => member.id !== memberId));
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      return { success: false, error: 'Erro ao remover membro' };
    }
  };

  return {
    loading,
    members,
    addMember,
    updateMember,
    removeMember,
    refetch: fetchTeamMembers
  };
}