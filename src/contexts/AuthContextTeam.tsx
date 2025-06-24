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

      // Sistema de autenticação via Supabase apenas
      // REMOVIDO: Fallback com senhas hardcoded por questões de segurança

      // Autenticação via Supabase com validação segura
      console.log('🌐 Conectando ao Supabase...');
      
      // Primeiro verificar se o usuário existe
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email.trim())
        .single();

      if (userError || !userData) {
        console.error('❌ AUTH: Usuário não encontrado');
        return { success: false, error: 'Email ou senha incorretos' };
      }

      // Validar senha via função RPC segura no Supabase
      const { data: isValid, error: validateError } = await supabase
        .rpc('validate_user_password', {
          user_email: email,
          user_password: password
        });

      if (validateError || !isValid) {
        console.error('❌ AUTH: Senha inválida');
        return { success: false, error: 'Email ou senha incorretos' };
      }

      console.log('✅ AUTH: Usuário autenticado:', userData.nome);
      
      const usuarioData = {
        id: userData.id,
        email: userData.email,
        nome: userData.nome,
        cargo: userData.cargo,
        tipo: userData.tipo,
        avatar_url: userData.avatar_url
      };

      // Buscar equipe do usuário
      const { data: equipeData } = await supabase
        .from('equipes')
        .select('*')
        .eq('id', userData.equipe_id)
        .single();

      const equipe = equipeData || {
        id: userData.equipe_id || '650e8400-e29b-41d4-a716-446655440001',
        nome: 'SixQuasar',
        descricao: 'Equipe de desenvolvimento',
        created_at: new Date().toISOString()
      };

      setUsuario(usuarioData);
      setEquipe(equipe);

      localStorage.setItem('team_session', JSON.stringify({
        usuario: usuarioData,
        equipe: equipe
      }));

      console.log('✅ AUTH: Login realizado com sucesso');
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