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

      // Sistema de autenticação via API customizada
      console.log('🌐 Conectando à API...');
      
      // Fazer login via API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('❌ AUTH: Login falhou', data.error);
        return { success: false, error: data.error || 'Email ou senha incorretos' };
      }

      console.log('✅ AUTH: Usuário autenticado:', data.data.user.user_metadata.nome);
      
      // Extrair dados do formato da API
      const userData = data.data.user;
      const usuarioData = {
        id: userData.id,
        email: userData.email,
        nome: userData.user_metadata.nome,
        cargo: userData.user_metadata.cargo,
        tipo: userData.user_metadata.tipo,
        avatar_url: userData.user_metadata.avatar_url
      };

      const equipe = data.data.equipe || {
        id: userData.user_metadata.equipe_id || '650e8400-e29b-41d4-a716-446655440001',
        nome: 'SixQuasar',
        descricao: 'Equipe de desenvolvimento',
        created_at: new Date().toISOString()
      };

      // Salvar token
      if (data.data.session?.access_token) {
        localStorage.setItem('token', data.data.session.access_token);
      }

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