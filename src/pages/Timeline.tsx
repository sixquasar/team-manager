import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  FileText,
  User,
  Calendar,
  Filter,
  Plus,
  Target,
  TrendingUp,
  Code,
  Database
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { useTimeline, TimelineEvent } from '@/hooks/use-timeline';


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
    icon: Target,
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
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    label: 'Prazo'
  }
};

export function Timeline() {
  const { equipe, usuario } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  
  // Hook conectado ao Supabase - sem mock data
  const { 
    loading, 
    events: timelineEvents, 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    refetch 
  } = useTimeline();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-team-primary"></div>
      </div>
    );
  }

  const filteredEvents = selectedFilter === 'all' 
    ? timelineEvents 
    : timelineEvents.filter(event => event.type === selectedFilter);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `${days}d atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'started': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timeline</h1>
          <p className="text-gray-600 mt-2">
            Histórico completo das atividades da {equipe?.nome || 'SixQuasar'}
          </p>
        </div>
        
        <Button 
          className="bg-team-primary hover:bg-team-primary/90"
          onClick={() => {
            console.log('📝 Novo evento Timeline - funcionalidade será implementada');
            // TODO: Implementar modal de criação de evento
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Filter className="h-4 w-4 text-gray-500" />
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'task', label: 'Tarefas' },
                { value: 'milestone', label: 'Marcos' },
                { value: 'meeting', label: 'Reuniões' },
                { value: 'deadline', label: 'Prazos' }
              ].map(filter => (
                <Button
                  key={filter.value}
                  variant={selectedFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.value)}
                  className={selectedFilter === filter.value ? 'bg-team-primary' : ''}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Histórico de Atividades ({filteredEvents.length} eventos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredEvents.map((event, index) => {
              const config = eventTypeConfig[event.type];
              const IconComponent = config.icon;
              
              return (
                <div key={event.id} className="relative flex items-start space-x-4">
                  {/* Timeline line */}
                  {index < filteredEvents.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  
                  {/* Event icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center`}>
                    <IconComponent className={`h-6 w-6 ${config.color}`} />
                  </div>
                  
                  {/* Event content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {config.label}
                        </Badge>
                        {event.metadata?.priority && (
                          <Badge className={`text-xs ${getPriorityColor(event.metadata.priority)}`}>
                            {event.metadata.priority}
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(event.timestamp)}</span>
                    </div>
                    
                    <p className="text-gray-600 mt-1">{event.description}</p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          <User className="h-3 w-3 inline mr-1" />
                          {event.author}
                        </span>
                        {event.project && (
                          <span className="text-sm text-blue-600">
                            <Target className="h-3 w-3 inline mr-1" />
                            {event.project}
                          </span>
                        )}
                        {event.metadata?.taskStatus && (
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(event.metadata.taskStatus)}`}></div>
                            <span className="text-xs text-gray-500 capitalize">
                              {event.metadata.taskStatus === 'completed' ? 'Concluído' : 
                               event.metadata.taskStatus === 'started' ? 'Em andamento' : 'Atrasado'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {event.metadata?.participants && (
                        <div className="flex -space-x-2">
                          {event.metadata.participants.slice(0, 3).map((participant, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 bg-team-primary text-white rounded-full flex items-center justify-center text-xs border-2 border-white"
                              title={participant}
                            >
                              {participant.charAt(0)}
                            </div>
                          ))}
                          {event.metadata.participants.length > 3 && (
                            <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs border-2 border-white">
                              +{event.metadata.participants.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}