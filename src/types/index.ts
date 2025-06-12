// Tipos fundamentais para o Team Manager

export interface User {
  id: string;
  email: string;
  nome: string;
  cargo?: string;
  avatar_url?: string;
  tipo: 'admin' | 'member';
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  nome: string;
  descricao?: string;
  created_at: string;
  updated_at: string;
}

export interface UserTeam {
  id: string;
  user_id: string;
  team_id: string;
  role: 'leader' | 'member';
  created_at: string;
}

export interface Task {
  id: string;
  titulo: string;
  descricao?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  prioridade: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string;
  created_by: string;
  team_id: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  assignee?: User;
  creator?: User;
}

export interface Message {
  id: string;
  conteudo: string;
  user_id: string;
  team_id: string;
  tipo: 'text' | 'image' | 'file';
  reply_to?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  user?: User;
  reply?: Message;
}

export interface Timeline {
  id: string;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim?: string;
  tipo: 'milestone' | 'event' | 'deadline';
  team_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  creator?: User;
}

export interface Report {
  id: string;
  titulo: string;
  tipo: 'productivity' | 'tasks' | 'timeline' | 'general';
  data_inicio: string;
  data_fim: string;
  conteudo: any; // JSON com dados do relatório
  created_by: string;
  team_id: string;
  created_at: string;
  // Relacionamentos
  creator?: User;
}

// Enums e constantes
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done'
} as const;

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export const USER_ROLE = {
  LEADER: 'leader',
  MEMBER: 'member'
} as const;

export const MESSAGE_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file'
} as const;

export const TIMELINE_TYPE = {
  MILESTONE: 'milestone',
  EVENT: 'event',
  DEADLINE: 'deadline'
} as const;

// Tipos para dashboards e estatísticas
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  teamProductivity: number;
  upcomingDeadlines: Timeline[];
  recentActivity: (Task | Message | Timeline)[];
}

// Tipos para API responses
export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}