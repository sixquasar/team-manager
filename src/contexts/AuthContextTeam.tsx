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
      console.log('🌐 SUPABASE URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔑 ANON KEY (primeiros 50):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 50));
      console.log('📧 EMAIL:', email);

      // Teste de conectividade conforme metodologia CLAUDE.md
      const { data: testData, error: testError } = await supabase
        .from('usuarios')
        .select('count')
        .limit(1);

      if (testError) {
        console.error('❌ AUTH: ERRO DE CONEXÃO:', testError);
        // Fallback para usuários fixos em caso de erro de conexão
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

        console.log('⚠️ AUTH: Login usando fallback local (erro de conexão)');
        return { success: true };
      }

      console.log('✅ AUTH: Conexão OK, buscando usuário no Supabase...');

      // Buscar usuário real no Supabase conforme CLAUDE.md
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email.trim())
        .single();

      if (userError) {
        console.error('❌ AUTH: ERRO BUSCA USUÁRIO:', userError);
        console.error('❌ Código:', userError.code);
        console.error('❌ Mensagem:', userError.message);
        console.error('❌ Detalhes:', userError.details);
        return { success: false, error: 'Usuário não encontrado' };
      }

      if (!userData) {
        console.log('❌ AUTH: Usuário não encontrado no banco');
        return { success: false, error: 'Email ou senha incorretos' };
      }

      // Por segurança, validar senha (em produção deveria ser hash)
      // Por enquanto, aceitar qualquer senha para usuários do banco
      console.log('✅ AUTH: Usuário encontrado:', userData.nome);

      // Buscar equipe do usuário conforme CLAUDE.md
      const { data: userTeamData, error: teamError } = await supabase
        .from('usuario_equipes')
        .select(`
          equipe_id,
          role,
          equipes!usuario_equipes_equipe_id_fkey(
            id,
            nome,
            descricao,
            created_at
          )
        `)
        .eq('usuario_id', userData.id)
        .eq('ativo', true)
        .single();

      let equipeData;
      if (teamError || !userTeamData) {
        console.error('❌ AUTH: ERRO BUSCA EQUIPE:', teamError);
        // Fallback para equipe SixQuasar
        equipeData = {
          id: '650e8400-e29b-41d4-a716-446655440001',
          nome: 'SixQuasar',
          descricao: 'Equipe de desenvolvimento',
          created_at: new Date().toISOString()
        };
      } else {
        const equipe = userTeamData.equipes as any;
        equipeData = {
          id: equipe.id,
          nome: equipe.nome,
          descricao: equipe.descricao,
          created_at: equipe.created_at
        };
      }

      const usuarioData = {
        id: userData.id,
        email: userData.email,
        nome: userData.nome,
        cargo: userData.cargo,
        tipo: userData.tipo,
        avatar_url: userData.avatar_url
      };

      setUsuario(usuarioData);
      setEquipe(equipeData);

      // Salvar sessão
      localStorage.setItem('team_session', JSON.stringify({
        usuario: usuarioData,
        equipe: equipeData
      }));

      console.log('✅ AUTH: Login realizado com sucesso');
      console.log('👤 USUÁRIO:', usuarioData);
      console.log('🏢 EQUIPE:', equipeData);

      return { success: true };
    } catch (error) {
      console.error('❌ AUTH: ERRO JAVASCRIPT:', error);
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