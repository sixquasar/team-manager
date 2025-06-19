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
      console.log('✅ PROJECTS: Buscando dados REAIS do Supabase');

      // Query direta da tabela projetos REAL
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar projetos:', error);
        setProjects([]);
      } else {
        console.log('✅ PROJECTS: Dados encontrados:', data?.length || 0);
        setProjects(data || []);
      }
      
    } catch (error) {
      console.error('❌ PROJECTS: Erro na busca:', error);
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