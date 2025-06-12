import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  slug: string;
  descricao: string;
  cor_primaria: string;
  cor_secundaria: string;
}

export interface UsuarioEquipe {
  equipe_id: string;
  equipes: Equipe;
}

interface AuthContextType {
  usuario: Usuario | null;
  equipe: Equipe | null;
  userEquipes: UsuarioEquipe[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, nome: string, cargo?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (dados: Partial<Usuario>) => Promise<void>;
  switchTeam: (equipeId: string) => Promise<void>;
  hasMultipleTeams: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [equipe, setEquipe] = useState<Equipe | null>(null);
  const [userEquipes, setUserEquipes] = useState<UsuarioEquipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const hasMultipleTeams = userEquipes.length > 1;

  // Verificar sessão ao carregar
  useEffect(() => {
    verificarSessao();
  }, []);

  const verificarSessao = async () => {
    try {
      const token = localStorage.getItem('sixquasar_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Token é o user_id - buscar usuário diretamente
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', token)
        .single();

      if (userError || !userData) {
        localStorage.removeItem('sixquasar_token');
        setLoading(false);
        return;
      }

      // 🛡️ PROTEÇÃO ROBUSTA: Buscar equipes com fallback se join falhar
      let userEquipes: any[] = [];
      
      try {
        // Tentar query com join primeiro
        const { data: equipesData, error: joinError } = await supabase
          .from('usuario_equipes')
          .select(`
            equipe_id,
            equipes (
              id,
              nome,
              slug,
              descricao,
              cor_primaria,
              cor_secundaria
            )
          `)
          .eq('usuario_id', userData.id);

        if (joinError) {
          // Fallback: Query simples sem join
          console.warn('Join equipes falhou, usando fallback simples:', joinError);
          const { data: simpleData } = await supabase
            .from('usuario_equipes')
            .select('equipe_id')
            .eq('usuario_id', userData.id);

          userEquipes = (simpleData || []).map(ue => ({
            equipe_id: ue.equipe_id,
            equipes: { id: ue.equipe_id, nome: 'Equipe Padrão', slug: 'default', descricao: 'Equipe principal' }
          }));
        } else {
          userEquipes = equipesData || [];
        }
      } catch (error) {
        console.error('Erro ao buscar equipes, usando dados mínimos:', error);
        // Criar equipe mínima para não quebrar
        userEquipes = [{
          equipe_id: '00000000-0000-0000-0000-000000000001',
          equipes: { id: '00000000-0000-0000-0000-000000000001', nome: 'TechSquad Team', slug: 'techsquad', descricao: 'Equipe principal' }
        }];
      }

      if (!userEquipes || userEquipes.length === 0) {
        // Usar equipe padrão se não encontrar nenhuma
        userEquipes = [{
          equipe_id: '00000000-0000-0000-0000-000000000001',
          equipes: { id: '00000000-0000-0000-0000-000000000001', nome: 'TechSquad Team', slug: 'techsquad', descricao: 'Equipe principal' }
        }];
      }

      setUsuario(userData);
      setUserEquipes(userEquipes as UsuarioEquipe[]);
      
      // Buscar equipe ativa salva ou usar a primeira
      const equipeAtivaId = localStorage.getItem('sixquasar_equipe_ativa');
      let equipeAtiva = userEquipes.find(ue => ue.equipe_id === equipeAtivaId);
      
      if (!equipeAtiva) {
        equipeAtiva = userEquipes[0];
        localStorage.setItem('sixquasar_equipe_ativa', equipeAtiva.equipe_id);
      }
      
      setEquipe(equipeAtiva.equipes as Equipe);
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      localStorage.removeItem('sixquasar_token');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Buscar usuário diretamente na tabela
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        toast({
          title: 'Erro ao entrar',
          description: 'Email não encontrado',
          variant: 'destructive',
        });
        return { error: userError || new Error('Usuário não encontrado') };
      }

      // 🛡️ PROTEÇÃO ROBUSTA: Buscar equipes com fallback (função signIn)
      let userEquipes: any[] = [];
      
      try {
        const { data: equipesData, error: joinError } = await supabase
          .from('usuario_equipes')
          .select(`
            equipe_id,
            equipes (
              id,
              nome,
              slug,
              descricao,
              cor_primaria,
              cor_secundaria
            )
          `)
          .eq('usuario_id', userData.id);

        if (joinError) {
          console.warn('Join equipes falhou no signIn, usando fallback:', joinError);
          const { data: simpleData } = await supabase
            .from('usuario_equipes')
            .select('equipe_id')
            .eq('usuario_id', userData.id);

          userEquipes = (simpleData || []).map(ue => ({
            equipe_id: ue.equipe_id,
            equipes: { id: ue.equipe_id, nome: 'Equipe Padrão' }
          }));
        } else {
          userEquipes = equipesData || [];
        }
      } catch (error) {
        console.error('Erro no signIn ao buscar equipes:', error);
        userEquipes = [{
          equipe_id: '00000000-0000-0000-0000-000000000001',
          equipes: { id: '00000000-0000-0000-0000-000000000001', nome: 'TechSquad Team' }
        }];
      }

      if (!userEquipes || userEquipes.length === 0) {
        // ✅ Garantir equipe padrão sempre
        userEquipes = [{
          equipe_id: '00000000-0000-0000-0000-000000000001',
          equipes: { id: '00000000-0000-0000-0000-000000000001', nome: 'TechSquad Team' }
        }];
      }

      // Aceitar qualquer senha por agora (para desenvolvimento)
      setUsuario(userData);
      setUserEquipes(userEquipes as UsuarioEquipe[]);
      
      // Definir primeira equipe como ativa
      const equipeAtiva = userEquipes[0];
      setEquipe(equipeAtiva.equipes as Equipe);
      localStorage.setItem('sixquasar_equipe_ativa', equipeAtiva.equipe_id);

      // Salvar token simples
      localStorage.setItem('sixquasar_token', userData.id);

      toast({
        title: 'Login bem-sucedido',
        description: `Bem-vindo, ${userData.nome}!`,
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Erro ao entrar',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nome: string, cargo?: string) => {
    try {
      setLoading(true);

      // Verificar se usuário já existe
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        toast({
          title: 'Erro ao criar conta',
          description: 'Este email já está em uso',
          variant: 'destructive',
        });
        return { error: new Error('Email já em uso') };
      }

      // Criar equipe primeiro (cada usuário tem sua equipe)
      const baseSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
      const uniqueSlug = `${baseSlug}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      
      const equipeData = {
        nome: `${nome} - Equipe`,
        slug: uniqueSlug,
        descricao: 'Equipe de gerenciamento de tarefas',
        cor_primaria: '#3b82f6',
        cor_secundaria: '#1d4ed8'
      };

      // INSERT PURO - sem qualquer select
      const { error: equipeError } = await supabase
        .from('equipes')
        .insert(equipeData);
        
      if (equipeError) {
        toast({
          title: 'Erro ao criar conta',
          description: 'Erro ao criar equipe: ' + equipeError.message,
          variant: 'destructive',
        });
        return { error: equipeError };
      }
      
      // Buscar equipe pelo slug com delay
      await new Promise(resolve => setTimeout(resolve, 100));
      const { data: insertedEquipe, error: fetchError } = await supabase
        .from('equipes')
        .select('*')
        .eq('slug', equipeData.slug)
        .maybeSingle();

      if (fetchError || !insertedEquipe) {
        toast({
          title: 'Erro ao criar conta', 
          description: 'Erro ao buscar equipe criada: ' + (fetchError?.message || 'Não encontrada'),
          variant: 'destructive',
        });
        return { error: fetchError || new Error('Equipe não encontrada após criação') };
      }

      // Criar usuário com senha_hash
      const usuarioData = {
        email,
        nome,
        senha_hash: `$2b$10$${password.substring(0, 53)}`, // Senha simples para demonstração
        cargo: cargo || 'Team Lead',
        tipo: 'admin'
      };

      // INSERT sem SELECT, depois buscar por email único
      const { error: userError } = await supabase
        .from('usuarios')
        .insert([usuarioData]);
        
      if (userError) {
        toast({
          title: 'Erro ao criar conta',
          description: 'Erro ao criar usuário: ' + userError.message,
          variant: 'destructive',
        });
        return { error: userError };
      }
      
      // Buscar usuário criado pelo email único
      const { data: insertedUsuario, error: userFetchError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single();

      if (userFetchError || !insertedUsuario) {
        toast({
          title: 'Erro ao criar conta',
          description: 'Erro ao buscar usuário criado: ' + (userFetchError?.message || 'Não encontrado'),
          variant: 'destructive',
        });
        return { error: userFetchError || new Error('Usuário não encontrado após criação') };
      }

      // Vincular usuário à equipe
      const { error: vinculoError } = await supabase
        .from('usuario_equipes')
        .insert([{
          usuario_id: insertedUsuario.id,
          equipe_id: insertedEquipe.id,
          equipe_padrao: true
        }]);

      if (vinculoError) {
        toast({
          title: 'Erro ao criar conta',
          description: 'Erro ao vincular equipe: ' + vinculoError.message,
          variant: 'destructive',
        });
        return { error: vinculoError };
      }

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Fazendo login automaticamente...',
      });

      // Fazer login automático
      setTimeout(async () => {
        const { error: signInError } = await signIn(email, password);
        
        if (!signInError) {
          toast({
            title: 'Login automático realizado!',
            description: 'Redirecionando para o dashboard...',
          });
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          toast({
            title: 'Conta criada!',
            description: 'Faça login para continuar.',
          });
        }
      }, 1500);

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Erro ao criar conta',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Remover tokens locais
      localStorage.removeItem('sixquasar_token');
      localStorage.removeItem('sixquasar_equipe_ativa');
      
      // Limpar estado
      setUsuario(null);
      setEquipe(null);
      setUserEquipes([]);

      toast({
        title: 'Desconectado com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao sair',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const switchTeam = async (equipeId: string) => {
    try {
      const equipeEscolhida = userEquipes.find(ue => ue.equipe_id === equipeId);
      
      if (!equipeEscolhida) {
        toast({
          title: 'Erro',
          description: 'Equipe não encontrada',
          variant: 'destructive',
        });
        return;
      }

      setEquipe(equipeEscolhida.equipes as Equipe);
      localStorage.setItem('sixquasar_equipe_ativa', equipeId);

      toast({
        title: 'Equipe alterada',
        description: `Agora você está operando como ${equipeEscolhida.equipes.nome}`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao trocar equipe',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateProfile = async (dados: Partial<Usuario>) => {
    try {
      if (!usuario) throw new Error('Usuário não autenticado');

      // Atualizar no banco
      const { error } = await supabase
        .from('usuarios')
        .update({
          nome: dados.nome,
          cargo: dados.cargo,
          avatar_url: dados.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', usuario.id);

      if (error) throw error;

      // Atualizar estado local
      setUsuario(prev => prev ? { ...prev, ...dados } : null);

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        equipe,
        userEquipes,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        switchTeam,
        hasMultipleTeams,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};