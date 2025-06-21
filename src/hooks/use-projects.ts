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
      console.log('🔍 PROJECTS: Iniciando busca...');
      console.log('🌐 SUPABASE URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔑 ANON KEY (primeiros 50):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 50));
      console.log('🏢 EQUIPE:', equipe);
      console.log('👤 USUARIO:', import.meta.env.VITE_CURRENT_USER || 'não definido');

      // Teste de conexão básica
      const { data: testData, error: testError } = await supabase
        .from('usuarios')
        .select('count')
        .limit(1);

      if (testError) {
        console.error('❌ ERRO DE CONEXÃO:', testError);
        setProjects([]);
        return;
      }

      console.log('✅ CONEXÃO OK, buscando projetos...');

      if (!equipe?.id) {
        console.log('⚠️ PROJECTS: Sem equipe selecionada');
        setProjects([]);
        setLoading(false);
        return;
      }

      console.log('🎯 PROJECTS: Buscando projetos para equipe_id:', equipe.id);

      // Query direta da tabela projetos REAL com filtro por equipe
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .eq('equipe_id', equipe.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ ERRO PROJETOS:', error);
        console.error('❌ Código:', error.code);
        console.error('❌ Mensagem:', error.message);
        console.error('❌ Detalhes:', error.details);
        console.error('❌ Query que falhou: SELECT * FROM projetos WHERE equipe_id =', equipe.id);
        
        // Fallback para array vazio - SEM MOCK DATA conforme CLAUDE.md
        console.log('🔄 PROJECTS: Erro no Supabase, retornando lista vazia');
        setProjects([]);
      } else {
        console.log('✅ PROJECTS: Query executada com sucesso');
        console.log('📊 PROJECTS: Projetos encontrados:', data?.length || 0);
        console.log('🗃️ PROJECTS: Dados brutos completos:', JSON.stringify(data, null, 2));
        console.log('🎯 PROJECTS: Equipe filtrada:', equipe.id);
        
        // Processar dados sempre do Supabase - nunca mock data
        setProjects(data || []);
      }
      
    } catch (error) {
      console.error('❌ ERRO JAVASCRIPT:', error);
      setProjects([]);
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