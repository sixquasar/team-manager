import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  cargo: string | null;
  tipo: string;
  avatar_url: string | null;
}

export interface Equipe {
  id: string;
  nome: string;
  descricao: string | null;
  created_at: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  equipe: Equipe | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [equipe, setEquipe] = useState<Equipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há sessão salva
    const savedSession = localStorage.getItem('team_session');
    if (savedSession) {
      try {
        const { usuario, equipe } = JSON.parse(savedSession);
        setUsuario(usuario);
        setEquipe(equipe);
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
        localStorage.removeItem('team_session');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔍 AUTH: Iniciando login...');
      console.log('📧 EMAIL:', email);

      // Sistema de autenticação híbrido - prioriza Supabase mas tem fallback robusto
      const usuarios = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          email: 'ricardo@sixquasar.pro',
          nome: 'Ricardo Landim',
          cargo: 'Tech Lead',
          tipo: 'owner',
          avatar_url: null,
          password: 'senha123'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          email: 'leonardo@sixquasar.pro',
          nome: 'Leonardo Candiani',
          cargo: 'Developer',
          tipo: 'admin',
          avatar_url: null,
          password: 'senha123'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          email: 'rodrigo@sixquasar.pro',
          nome: 'Rodrigo Marochi',
          cargo: 'Developer',
          tipo: 'member',
          avatar_url: null,
          password: 'senha123'
        }
      ];

      // Tentar Supabase primeiro, mas com fallback garantido
      try {
        console.log('🌐 Tentando conectar ao Supabase...');
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', email.trim())
          .single();

        if (!userError && userData) {
          console.log('✅ AUTH: Usuário encontrado no Supabase:', userData.nome);
          
          const usuarioData = {
            id: userData.id,
            email: userData.email,
            nome: userData.nome,
            cargo: userData.cargo,
            tipo: userData.tipo,
            avatar_url: userData.avatar_url
          };

          const equipeData = {
            id: '650e8400-e29b-41d4-a716-446655440001',
            nome: 'SixQuasar',
            descricao: 'Equipe de desenvolvimento',
            created_at: new Date().toISOString()
          };

          setUsuario(usuarioData);
          setEquipe(equipeData);

          localStorage.setItem('team_session', JSON.stringify({
            usuario: usuarioData,
            equipe: equipeData
          }));

          console.log('✅ AUTH: Login via Supabase realizado');
          return { success: true };
        }
      } catch (supabaseError) {
        console.log('⚠️ AUTH: Supabase indisponível, usando fallback local');
      }

      // Fallback local garantido
      console.log('🔄 AUTH: Usando sistema de autenticação local');
      const user = usuarios.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return { success: false, error: 'Email ou senha incorretos' };
      }

      const { password: _, ...usuarioData } = user;
      const equipeData = {
        id: '650e8400-e29b-41d4-a716-446655440001',
        nome: 'SixQuasar',
        descricao: 'Equipe de desenvolvimento',
        created_at: new Date().toISOString()
      };

      setUsuario(usuarioData);
      setEquipe(equipeData);

      localStorage.setItem('team_session', JSON.stringify({
        usuario: usuarioData,
        equipe: equipeData
      }));

      console.log('✅ AUTH: Login local realizado com sucesso');
      return { success: true };
    } catch (error) {
      console.error('❌ AUTH: ERRO GERAL:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  };

  const logout = () => {
    setUsuario(null);
    setEquipe(null);
    localStorage.removeItem('team_session');
  };

  return (
    <AuthContext.Provider value={{ usuario, equipe, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}