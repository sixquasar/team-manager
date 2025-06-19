import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interfaces para tipagem dos dados
export interface Usuario {
  id: string;
  email: string;
  nome: string;
  cargo: string | null;
  tipo: 'owner' | 'admin' | 'member';
  avatar_url: string | null;
  telefone: string | null;
  localizacao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Equipe {
  id: string;
  nome: string;
  descricao: string | null;
  owner_id: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface Projeto {
  id: string;
  nome: string;
  descricao: string | null;
  status: 'planejamento' | 'em_progresso' | 'finalizado' | 'cancelado';
  responsavel_id: string | null;
  equipe_id: string;
  data_inicio: string | null;
  data_fim_prevista: string | null;
  data_fim_real: string | null;
  progresso: number;
  orcamento: number | null;
  tecnologias: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string | null;
  status: 'pendente' | 'em_progresso' | 'concluida' | 'cancelada';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  responsavel_id: string | null;
  equipe_id: string;
  projeto_id: string | null;
  data_vencimento: string | null;
  data_conclusao: string | null;
  tags: string[] | null;
  anexos: any;
  created_at: string;
  updated_at: string;
}

export interface EventoTimeline {
  id: string;
  tipo: 'task' | 'message' | 'milestone' | 'meeting' | 'deadline';
  titulo: string;
  descricao: string | null;
  autor_id: string | null;
  equipe_id: string;
  metadata: any;
  created_at: string;
}

export interface Metrica {
  id: string;
  equipe_id: string;
  usuario_id: string | null;
  tipo: string;
  data_referencia: string;
  tarefas_concluidas: number;
  horas_trabalhadas: number;
  eficiencia: number;
  projetos_ativos: number;
  dados_extras: any;
  created_at: string;
}