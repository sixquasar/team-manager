import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  FileText,
  User,
  Calendar,
  Filter,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';

interface TimelineEvent {
  id: string;
  type: 'task' | 'message' | 'milestone' | 'meeting' | 'deadline';
  title: string;
  description: string;
  author: string;
  timestamp: string;
  metadata?: {
    taskStatus?: 'completed' | 'started' | 'delayed';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    participants?: string[];
  };
}

const eventTypeConfig = {
  task: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    label: 'Tarefa'
  },
  message: {
    icon: MessageSquare,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    label: 'Mensagem'
  },
  milestone: {
    icon: AlertTriangle,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    label: 'Marco'
  },
  meeting: {
    icon: User,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    label: 'Reunião'
  },
  deadline: {
    icon: Clock,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    label: 'Prazo'
  }
};

export function Timeline() {
  const { equipe } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'task' | 'message' | 'milestone' | 'meeting' | 'deadline'>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  // Mock data - em produção viria do hook useTimeline
  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      type: 'task',
      title: 'Dashboard implementado com sucesso',
      description: 'Ana Silva finalizou a implementação do dashboard principal com todas as métricas da equipe.',
      author: 'Ana Silva',
      timestamp: '2024-11-06T14:30:00Z',
      metadata: { taskStatus: 'completed', priority: 'high' }
    },
    {
      id: '2',
      type: 'message',
      title: 'Discussão sobre arquitetura do sistema',
      description: 'Ricardo iniciou uma discussão sobre a melhor arquitetura para o sistema de notificações.',
      author: 'Ricardo Landim',
      timestamp: '2024-11-06T12:15:00Z'
    },
    {
      id: '3',
      type: 'milestone',
      title: 'Sprint 2 - Meta de 75% atingida',
      description: 'A equipe atingiu 75% das metas estabelecidas para a Sprint 2, superando as expectativas.',
      author: 'Sistema',
      timestamp: '2024-11-06T10:00:00Z'
    },
    {
      id: '4',
      type: 'meeting',
      title: 'Daily Standup Meeting',
      description: 'Reunião diária da equipe para alinhamento das atividades e blockers.',
      author: 'Ricardo Landim',
      timestamp: '2024-11-06T09:00:00Z',
      metadata: { participants: ['Ricardo Landim', 'Ana Silva', 'Carlos Santos'] }
    },
    {
      id: '5',
      type: 'task',
      title: 'Correção de bug no sistema de login',
      description: 'Carlos Santos iniciou a correção do bug reportado no Safari para o sistema de login.',
      author: 'Carlos Santos',
      timestamp: '2024-11-05T16:45:00Z',
      metadata: { taskStatus: 'started', priority: 'urgent' }
    },
    {
      id: '6',
      type: 'deadline',
      title: 'Prazo para entrega da API de usuários',
      description: 'Lembrete: prazo para finalização da API de gerenciamento de usuários é amanhã.',
      author: 'Sistema',
      timestamp: '2024-11-05T14:00:00Z',
      metadata: { priority: 'high' }
    }
  ];

  const filteredEvents = timelineEvents.filter(event => {
    if (selectedFilter === 'all') return true;
    return event.type === selectedFilter;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Agora há pouco';
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const TimelineItem = ({ event }: { event: TimelineEvent }) => {
    const config = eventTypeConfig[event.type];
    const IconComponent = config.icon;

    return (
      <div className="relative flex items-start space-x-4 pb-6">
        {/* Timeline line */}
        <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-gray-200"></div>
        
        {/* Icon */}
        <div className={`flex-shrink-0 w-12 h-12 ${config.bgColor} rounded-full flex items-center justify-center z-10`}>
          <IconComponent className={`h-6 w-6 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.color}`}>
                      {config.label}
                    </span>
                    {event.metadata?.priority && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.metadata.priority === 'urgent' 
                          ? 'bg-red-100 text-red-800'
                          : event.metadata.priority === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {event.metadata.priority === 'urgent' ? 'Urgente' : 
                         event.metadata.priority === 'high' ? 'Alta' : 
                         event.metadata.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {event.author}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>

                  {/* Additional metadata */}
                  {event.metadata?.participants && (
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <User className="h-3 w-3 mr-1" />
                      Participantes: {event.metadata.participants.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timeline</h1>
          <p className="text-gray-600 mt-2">
            Acompanhe todas as atividades da {equipe?.nome || 'equipe'}
          </p>
        </div>
        
        <button className="flex items-center px-4 py-2 bg-team-primary text-white rounded-lg hover:bg-team-primary/90 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Evento
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        {/* Event Type Filter */}
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
        >
          <option value="all">Todos os eventos</option>
          <option value="task">Tarefas</option>
          <option value="message">Mensagens</option>
          <option value="milestone">Marcos</option>
          <option value="meeting">Reuniões</option>
          <option value="deadline">Prazos</option>
        </select>

        {/* Time Range Filter */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
        >
          <option value="today">Hoje</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mês</option>
        </select>

        <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="h-4 w-4 mr-2" />
          Mais filtros
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(eventTypeConfig).map(([type, config]) => {
          const count = timelineEvents.filter(e => e.type === type).length;
          return (
            <Card key={type}>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <config.icon className={`h-8 w-8 ${config.color}`} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{config.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Linha do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {filteredEvents.map((event, index) => (
              <div key={event.id}>
                <TimelineItem event={event} />
                {/* Remove line from last item */}
                {index === filteredEvents.length - 1 && (
                  <style>{`.relative:last-child .absolute { display: none; }`}</style>
                )}
              </div>
            ))}
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum evento encontrado</p>
                <p className="text-sm">Tente ajustar os filtros ou adicionar novos eventos</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}