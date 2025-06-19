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
      console.log('🔍 PROJECTS: Iniciando busca na tabela projetos...');
      console.log('🏢 EQUIPE ID:', equipe?.id);

      // Query direta da tabela projetos REAL
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ ERRO SUPABASE ao buscar projetos:', error);
        console.error('❌ Código do erro:', error.code);
        console.error('❌ Mensagem:', error.message);
        console.error('❌ Detalhes:', error.details);
        setProjects([]);
      } else {
        console.log('✅ PROJECTS: Query executada com sucesso!');
        console.log('📊 PROJECTS: Dados retornados:', data);
        console.log('📝 PROJECTS: Total de projetos:', data?.length || 0);
        
        if (data && data.length > 0) {
          console.log('🎯 PROJECTS: Primeiro projeto:', data[0]);
        } else {
          console.log('⚠️ PROJECTS: Nenhum projeto encontrado na tabela');
        }
        
        setProjects(data || []);
      }
      
    } catch (error) {
      console.error('❌ PROJECTS: Erro JavaScript na busca:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<Projeto, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('📝 PROJECTS: Criando novo projeto...');
      console.log('📊 PROJECTS: Dados do projeto:', projectData);
      console.log('🏢 PROJECTS: Equipe ID:', equipe?.id);

      const insertData = {
        ...projectData,
        equipe_id: equipe?.id
      };
      
      console.log('📤 PROJECTS: Dados para inserção:', insertData);

      const { data, error } = await supabase
        .from('projetos')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ ERRO SUPABASE ao criar projeto:', error);
        console.error('❌ Código do erro:', error.code);
        console.error('❌ Mensagem:', error.message);
        console.error('❌ Detalhes:', error.details);
        throw error;
      }

      console.log('✅ PROJECTS: Projeto criado com sucesso!');
      console.log('🎯 PROJECTS: Dados do projeto criado:', data);

      setProjects(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('❌ PROJECTS: Erro JavaScript ao criar projeto:', error);
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