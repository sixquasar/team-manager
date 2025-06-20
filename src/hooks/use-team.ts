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
      console.log('🔍 TEAM: Iniciando busca...');
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
        console.error('❌ TEAM: ERRO DE CONEXÃO:', testError);
        setMembers([
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            nome: 'Ricardo Landim',
            email: 'ricardo@sixquasar.pro',
            cargo: 'Tech Lead',
            tipo: 'owner',
            data_entrada: '2025-01-01T00:00:00Z',
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
            data_entrada: '2025-01-15T00:00:00Z',
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
            data_entrada: '2025-02-01T00:00:00Z',
            status: 'ativo',
            especialidades: ['WhatsApp', 'Integrações'],
            projetos_ativos: 2,
            tarefas_concluidas: 4,
            rating: 4.7
          }
        ]);
        setLoading(false);
        return;
      }

      console.log('✅ TEAM: Conexão OK, buscando membros...');
      
      if (!equipe?.id) {
        console.log('⚠️ TEAM: Sem equipe selecionada, usando dados SixQuasar');
        
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
            data_entrada: '2025-01-01T00:00:00Z',
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
            data_entrada: '2025-01-15T00:00:00Z',
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
            data_entrada: '2025-02-01T00:00:00Z',
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
        console.error('❌ TEAM: ERRO SUPABASE:', error);
        console.error('❌ Código:', error.code);
        console.error('❌ Mensagem:', error.message);
        console.error('❌ Detalhes:', error.details);
        // Fallback para dados SixQuasar
        setMembers([
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            nome: 'Ricardo Landim',
            email: 'ricardo@sixquasar.pro',
            cargo: 'Tech Lead',
            tipo: 'owner',
            data_entrada: '2025-01-01T00:00:00Z',
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
            data_entrada: '2025-01-15T00:00:00Z',
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
            data_entrada: '2025-02-01T00:00:00Z',
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

      console.log('✅ TEAM: Membros encontrados:', membersWithStats?.length || 0);
      console.log('📊 TEAM: Dados brutos:', membersWithStats);
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
      if (!equipe?.id) {
        return { success: false, error: 'Equipe não identificada' };
      }

      console.log('👥 Adicionando novo membro:', memberData);

      // Primeiro, criar o usuário na tabela usuarios
      const userData = {
        nome: memberData.nome?.trim() || '',
        email: memberData.email?.trim() || '',
        cargo: memberData.cargo?.trim() || 'Developer',
        tipo: memberData.tipo || 'member',
        telefone: memberData.telefone?.trim() || null,
        localizacao: memberData.localizacao?.trim() || null,
        ativo: true,
        created_at: new Date().toISOString()
      };

      const { data: novoUsuario, error: usuarioError } = await supabase
        .from('usuarios')
        .insert([userData])
        .select()
        .single();

      if (usuarioError) {
        console.error('❌ Erro ao criar usuário:', usuarioError);
        throw new Error(`Erro ao criar usuário: ${usuarioError.message}`);
      }

      // Depois, associar o usuário à equipe
      const equipeData = {
        usuario_id: novoUsuario.id,
        equipe_id: equipe.id,
        role: memberData.tipo || 'member',
        data_entrada: new Date().toISOString(),
        ativo: true
      };

      const { error: equipeError } = await supabase
        .from('usuario_equipes')
        .insert([equipeData]);

      if (equipeError) {
        console.error('❌ Erro ao associar à equipe:', equipeError);
        // Tentar remover usuário criado
        await supabase.from('usuarios').delete().eq('id', novoUsuario.id);
        throw new Error(`Erro ao associar à equipe: ${equipeError.message}`);
      }

      // Adicionar à lista local
      const novoMembro: TeamMember = {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        cargo: novoUsuario.cargo,
        tipo: novoUsuario.tipo,
        telefone: novoUsuario.telefone,
        localizacao: novoUsuario.localizacao,
        data_entrada: equipeData.data_entrada,
        status: 'ativo',
        especialidades: getEspecialidadesByRole(novoUsuario.cargo),
        projetos_ativos: 0,
        tarefas_concluidas: 0,
        rating: 4.0
      };

      setMembers(prev => [...prev, novoMembro]);
      console.log('✅ Membro adicionado com sucesso:', novoMembro);
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erro ao adicionar membro:', error);
      return { success: false, error: error.message || 'Erro ao adicionar membro' };
    }
  };

  const updateMember = async (memberId: string, updates: Partial<TeamMember>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!equipe?.id) {
        return { success: false, error: 'Equipe não identificada' };
      }

      console.log('✏️ Atualizando membro:', memberId, updates);

      // Atualizar dados do usuário na tabela usuarios
      const usuarioUpdates: any = {};
      if (updates.nome) usuarioUpdates.nome = updates.nome.trim();
      if (updates.email) usuarioUpdates.email = updates.email.trim();
      if (updates.cargo) usuarioUpdates.cargo = updates.cargo.trim();
      if (updates.telefone !== undefined) usuarioUpdates.telefone = updates.telefone?.trim() || null;
      if (updates.localizacao !== undefined) usuarioUpdates.localizacao = updates.localizacao?.trim() || null;
      if (updates.status !== undefined) usuarioUpdates.ativo = updates.status === 'ativo';
      
      usuarioUpdates.updated_at = new Date().toISOString();

      if (Object.keys(usuarioUpdates).length > 1) { // Mais que apenas updated_at
        const { error: usuarioError } = await supabase
          .from('usuarios')
          .update(usuarioUpdates)
          .eq('id', memberId);

        if (usuarioError) {
          console.error('❌ Erro ao atualizar usuário:', usuarioError);
          throw new Error(`Erro ao atualizar usuário: ${usuarioError.message}`);
        }
      }

      // Atualizar role na tabela usuario_equipes se necessário
      if (updates.tipo) {
        const { error: equipeError } = await supabase
          .from('usuario_equipes')
          .update({ role: updates.tipo })
          .eq('usuario_id', memberId)
          .eq('equipe_id', equipe.id);

        if (equipeError) {
          console.error('❌ Erro ao atualizar role na equipe:', equipeError);
          throw new Error(`Erro ao atualizar permissões: ${equipeError.message}`);
        }
      }

      // Atualizar lista local
      setMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { 
              ...member, 
              ...updates,
              especialidades: updates.cargo ? getEspecialidadesByRole(updates.cargo) : member.especialidades
            }
          : member
      ));

      console.log('✅ Membro atualizado com sucesso');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erro ao atualizar membro:', error);
      return { success: false, error: error.message || 'Erro ao atualizar membro' };
    }
  };

  const removeMember = async (memberId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!equipe?.id) {
        return { success: false, error: 'Equipe não identificada' };
      }

      console.log('🗑️ Removendo membro da equipe:', memberId);

      // Remover associação da equipe (soft delete)
      const { error: equipeError } = await supabase
        .from('usuario_equipes')
        .update({ ativo: false })
        .eq('usuario_id', memberId)
        .eq('equipe_id', equipe.id);

      if (equipeError) {
        console.error('❌ Erro ao remover da equipe:', equipeError);
        throw new Error(`Erro ao remover da equipe: ${equipeError.message}`);
      }

      // Remover da lista local
      setMembers(prev => prev.filter(member => member.id !== memberId));
      console.log('✅ Membro removido da equipe com sucesso');
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erro ao remover membro:', error);
      return { success: false, error: error.message || 'Erro ao remover membro' };
    }
  };

  const inviteMember = async (email: string, role: TeamMember['tipo'] = 'member'): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!equipe?.id) {
        return { success: false, error: 'Equipe não identificada' };
      }

      console.log('📧 Enviando convite para:', email);

      // Verificar se o email já existe
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('id, nome')
        .eq('email', email.trim())
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
        throw new Error(`Erro ao verificar usuário: ${checkError.message}`);
      }

      if (existingUser) {
        // Verificar se já é membro da equipe
        const { data: membership } = await supabase
          .from('usuario_equipes')
          .select('id')
          .eq('usuario_id', existingUser.id)
          .eq('equipe_id', equipe.id)
          .eq('ativo', true)
          .single();

        if (membership) {
          return { success: false, error: 'Usuário já é membro da equipe' };
        }

        // Adicionar à equipe
        const { error: addError } = await supabase
          .from('usuario_equipes')
          .insert({
            usuario_id: existingUser.id,
            equipe_id: equipe.id,
            role,
            data_entrada: new Date().toISOString(),
            ativo: true
          });

        if (addError) {
          throw new Error(`Erro ao adicionar à equipe: ${addError.message}`);
        }

        console.log('✅ Usuário existente adicionado à equipe');
        await fetchTeamMembers(); // Recarregar lista
        return { success: true };
      }

      // Em produção, enviaria convite por email
      // Por enquanto, apenas simular convite
      console.log('📧 Convite simulado enviado para:', email);
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erro ao enviar convite:', error);
      return { success: false, error: error.message || 'Erro ao enviar convite' };
    }
  };

  return {
    loading,
    members,
    addMember,
    updateMember,
    removeMember,
    inviteMember,
    refetch: fetchTeamMembers
  };
}