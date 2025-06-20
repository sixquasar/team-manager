import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  X,
  Calendar,
  Clock,
  User,
  Target,
  MessageSquare,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { TimelineEvent } from '@/hooks/use-timeline';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: Omit<TimelineEvent, 'id'>) => Promise<{ success: boolean; error?: string }>;
}

const eventTypeConfig = {
  task: {
    icon: CheckCircle2,
    label: 'Tarefa',
    color: 'text-green-500'
  },
  message: {
    icon: MessageSquare,
    label: 'Mensagem',
    color: 'text-blue-500'
  },
  milestone: {
    icon: Target,
    label: 'Marco',
    color: 'text-purple-500'
  },
  meeting: {
    icon: User,
    label: 'Reunião',
    color: 'text-orange-500'
  },
  deadline: {
    icon: AlertTriangle,
    label: 'Prazo',
    color: 'text-red-500'
  }
};

const priorityOptions = [
  { value: 'low', label: 'Baixa', color: 'bg-gray-500' },
  { value: 'medium', label: 'Média', color: 'bg-yellow-500' },
  { value: 'high', label: 'Alta', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-500' }
];

export function NewEventModal({ isOpen, onClose, onEventCreated }: NewEventModalProps) {
  const [formData, setFormData] = useState({
    type: 'task' as TimelineEvent['type'],
    title: '',
    description: '',
    project: '',
    priority: 'medium',
    participants: '',
    taskStatus: 'started'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validações
      if (!formData.title.trim()) {
        setError('Título é obrigatório');
        setIsSubmitting(false);
        return;
      }

      if (!formData.description.trim()) {
        setError('Descrição é obrigatória');
        setIsSubmitting(false);
        return;
      }

      // Preparar dados do evento
      const eventData: Omit<TimelineEvent, 'id'> = {
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim(),
        author: 'Sistema', // Será definido pelo hook baseado no usuário logado
        timestamp: new Date().toISOString(),
        project: formData.project.trim() || undefined,
        metadata: {
          priority: formData.priority as any,
          taskStatus: formData.type === 'task' ? formData.taskStatus as any : undefined,
          participants: formData.participants.trim() 
            ? formData.participants.split(',').map(p => p.trim()).filter(p => p)
            : undefined
        }
      };

      console.log('📝 NEW EVENT MODAL: Criando evento:', eventData);

      // Criar evento via hook
      const result = await onEventCreated(eventData);

      if (result.success) {
        console.log('✅ NEW EVENT MODAL: Evento criado com sucesso');
        
        // Resetar formulário
        setFormData({
          type: 'task',
          title: '',
          description: '',
          project: '',
          priority: 'medium',
          participants: '',
          taskStatus: 'started'
        });
        
        onClose();
      } else {
        console.error('❌ NEW EVENT MODAL: Erro ao criar evento:', result.error);
        setError(result.error || 'Erro ao criar evento');
      }
    } catch (error) {
      console.error('❌ NEW EVENT MODAL: Erro JavaScript:', error);
      setError('Erro inesperado ao criar evento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        type: 'task',
        title: '',
        description: '',
        project: '',
        priority: 'medium',
        participants: '',
        taskStatus: 'started'
      });
      setError('');
      onClose();
    }
  };

  const selectedTypeConfig = eventTypeConfig[formData.type];
  const IconComponent = selectedTypeConfig.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full bg-gray-100`}>
              <IconComponent className={`h-5 w-5 ${selectedTypeConfig.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Novo Evento</h2>
              <p className="text-sm text-gray-600">Criar evento na timeline da equipe</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo do Evento */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Evento</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(eventTypeConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Digite o título do evento..."
              disabled={isSubmitting}
              className="w-full"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva os detalhes do evento..."
              disabled={isSubmitting}
              className="w-full min-h-[100px]"
            />
          </div>

          {/* Projeto (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="project">Projeto (opcional)</Label>
            <Input
              id="project"
              value={formData.project}
              onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
              placeholder="Nome do projeto relacionado..."
              disabled={isSubmitting}
              className="w-full"
            />
          </div>

          {/* Grid para Prioridade e Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prioridade */}
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status da Tarefa (apenas para tarefas) */}
            {formData.type === 'task' && (
              <div className="space-y-2">
                <Label htmlFor="taskStatus">Status da Tarefa</Label>
                <Select 
                  value={formData.taskStatus} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, taskStatus: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="started">Em andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="delayed">Atrasada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Participantes (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="participants">Participantes (opcional)</Label>
            <Input
              id="participants"
              value={formData.participants}
              onChange={(e) => setFormData(prev => ({ ...prev, participants: e.target.value }))}
              placeholder="Nomes separados por vírgula: João, Maria, Pedro..."
              disabled={isSubmitting}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Separe os nomes dos participantes por vírgula
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
              className="bg-team-primary hover:bg-team-primary/90"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Criando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Criar Evento</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}