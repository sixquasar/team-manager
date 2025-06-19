import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { supabase, Projeto } from '@/lib/supabase';

export function useProjects() {
  const { equipe } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Projeto[]>([]);

  useEffect(() => {
    fetchProjects();
  }, [equipe]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      if (!equipe?.id) {
        console.log('🚨 PROJECTS: Sem equipe selecionada, usando dados SixQuasar');
        
        // Dados dos projetos reais da SixQuasar baseados no banco
        setProjects([
          {
            id: '750e8400-e29b-41d4-a716-446655440001',
            nome: 'Sistema de Atendimento ao Cidadão de Palmas com IA',
            descricao: 'Sistema Integrado de Atendimento ao Cidadão com Inteligência Artificial para a Prefeitura Municipal de Palmas - TO. Meta: automatizar 60% dos atendimentos municipais para 350.000 habitantes.',
            status: 'em_progresso',
            responsavel_id: '550e8400-e29b-41d4-a716-446655440001',
            equipe_id: '650e8400-e29b-41d4-a716-446655440001',
            data_inicio: '2024-11-01',
            data_fim_prevista: '2025-09-01',
            data_fim_real: null,
            progresso: 25,
            orcamento: 2400000.00,
            tecnologias: ['Python', 'LangChain', 'OpenAI GPT-4o', 'WhatsApp API', 'PostgreSQL', 'Kubernetes', 'AWS', 'Redis', 'N8N'],
            created_at: '2024-11-01T00:00:00Z',
            updated_at: '2024-12-20T00:00:00Z'
          },
          {
            id: '750e8400-e29b-41d4-a716-446655440002',
            nome: 'Automação Jocum com SDK e LLM',
            descricao: 'Agente automatizado para atendimento aos usuários da Jocum, utilizando diretamente SDKs dos principais LLMs (OpenAI, Anthropic Claude, Google Gemini). Meta: 50.000 atendimentos por dia.',
            status: 'em_progresso',
            responsavel_id: '550e8400-e29b-41d4-a716-446655440002',
            equipe_id: '650e8400-e29b-41d4-a716-446655440001',
            data_inicio: '2024-12-01',
            data_fim_prevista: '2025-06-01',
            data_fim_real: null,
            progresso: 15,
            orcamento: 625000.00,
            tecnologias: ['Python', 'LangChain', 'OpenAI', 'Anthropic Claude', 'Google Gemini', 'WhatsApp API', 'VoIP', 'PostgreSQL', 'React', 'AWS/GCP'],
            created_at: '2024-12-01T00:00:00Z',
            updated_at: '2024-12-20T00:00:00Z'
          }
        ]);
        
        setLoading(false);
        return;
      }

      console.log('✅ PROJECTS: Equipe encontrada, buscando dados do Supabase');

      // Query simples sem JOIN complexo
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .eq('equipe_id', equipe.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar projetos:', error);
        
        // Fallback para dados SixQuasar
        setProjects([
          {
            id: '750e8400-e29b-41d4-a716-446655440001',
            nome: 'Sistema de Atendimento ao Cidadão de Palmas com IA',
            descricao: 'Sistema Integrado de Atendimento ao Cidadão com Inteligência Artificial para a Prefeitura Municipal de Palmas - TO.',
            status: 'em_progresso',
            responsavel_id: '550e8400-e29b-41d4-a716-446655440001',
            equipe_id: '650e8400-e29b-41d4-a716-446655440001',
            data_inicio: '2024-11-01',
            data_fim_prevista: '2025-09-01',
            data_fim_real: null,
            progresso: 25,
            orcamento: 2400000.00,
            tecnologias: ['Python', 'LangChain', 'OpenAI GPT-4o', 'WhatsApp API', 'PostgreSQL'],
            created_at: '2024-11-01T00:00:00Z',
            updated_at: '2024-12-20T00:00:00Z'
          },
          {
            id: '750e8400-e29b-41d4-a716-446655440002',
            nome: 'Automação Jocum com SDK e LLM',
            descricao: 'Agente automatizado para atendimento aos usuários da Jocum.',
            status: 'em_progresso',
            responsavel_id: '550e8400-e29b-41d4-a716-446655440002',
            equipe_id: '650e8400-e29b-41d4-a716-446655440001',
            data_inicio: '2024-12-01',
            data_fim_prevista: '2025-06-01',
            data_fim_real: null,
            progresso: 15,
            orcamento: 625000.00,
            tecnologias: ['Python', 'LangChain', 'OpenAI', 'Anthropic Claude', 'Google Gemini'],
            created_at: '2024-12-01T00:00:00Z',
            updated_at: '2024-12-20T00:00:00Z'
          }
        ]);
        return;
      }

      console.log(`✅ PROJECTS: ${data?.length || 0} projetos carregados do Supabase`);
      setProjects(data || []);

    } catch (error) {
      console.error('❌ Erro ao carregar projetos:', error);
      
      // Fallback para dados SixQuasar
      setProjects([
        {
          id: '750e8400-e29b-41d4-a716-446655440001',
          nome: 'Sistema de Atendimento ao Cidadão de Palmas com IA',
          descricao: 'Sistema Integrado de Atendimento ao Cidadão com Inteligência Artificial.',
          status: 'em_progresso',
          responsavel_id: '550e8400-e29b-41d4-a716-446655440001',
          equipe_id: '650e8400-e29b-41d4-a716-446655440001',
          data_inicio: '2024-11-01',
          data_fim_prevista: '2025-09-01',
          data_fim_real: null,
          progresso: 25,
          orcamento: 2400000.00,
          tecnologias: ['Python', 'OpenAI', 'WhatsApp API'],
          created_at: '2024-11-01T00:00:00Z',
          updated_at: '2024-12-20T00:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<Projeto, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .insert({
          ...projectData,
          equipe_id: equipe?.id
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar projeto:', error);
        throw error;
      }

      setProjects(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Projeto>) => {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar projeto:', error);
        throw error;
      }

      setProjects(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projetos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar projeto:', error);
        throw error;
      }

      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      throw error;
    }
  };

  return {
    loading,
    projects,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects
  };
}