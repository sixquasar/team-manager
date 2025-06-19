import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Plus,
  Calendar,
  Users,
  Target,
  Zap,
  AlertCircle,
  CheckCircle2,
  Flag
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { supabase } from '@/lib/supabase';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  initialStatus?: 'pendente' | 'em_progresso' | 'concluida' | 'cancelada';
}

export function NewTaskModal({ isOpen, onClose, onTaskCreated, initialStatus = 'pendente' }: NewTaskModalProps) {
  const { usuario, equipe } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    status: initialStatus,
    prioridade: 'media' as 'baixa' | 'media' | 'alta' | 'urgente',
    responsavel_id: usuario?.id || '',
    projeto_id: '',
    data_vencimento: '',
    tags: [] as string[],
    newTag: ''
  });

  const statusOptions = [
    { value: 'pendente', label: 'Pendente', color: 'bg-gray-100 text-gray-800' },
    { value: 'em_progresso', label: 'Em Progresso', color: 'bg-blue-100 text-blue-800' },
    { value: 'concluida', label: 'Concluída', color: 'bg-green-100 text-green-800' },
    { value: 'cancelada', label: 'Cancelada', color: 'bg-red-100 text-red-800' }
  ];

  const priorityOptions = [
    { value: 'baixa', label: 'Baixa', color: 'bg-gray-500' },
    { value: 'media', label: 'Média', color: 'bg-yellow-500' },
    { value: 'alta', label: 'Alta', color: 'bg-orange-500' },
    { value: 'urgente', label: 'Urgente', color: 'bg-red-500' }
  ];

  const responsavelOptions = [
    { id: '550e8400-e29b-41d4-a716-446655440001', nome: 'Ricardo Landim' },
    { id: '550e8400-e29b-41d4-a716-446655440002', nome: 'Leonardo Candiani' },
    { id: '550e8400-e29b-41d4-a716-446655440003', nome: 'Rodrigo Marochi' }
  ];

  // Projetos disponíveis (deveriam vir de um hook, mas usando dados conhecidos)
  const projectOptions = [
    { id: '750e8400-e29b-41d4-a716-446655440001', nome: 'Sistema Palmas IA' },
    { id: '750e8400-e29b-41d4-a716-446655440002', nome: 'Automação Jocum' }
  ];

  const predefinedTags = [
    'frontend', 'backend', 'database', 'api', 'ui/ux', 'testing',
    'deployment', 'documentation', 'security', 'performance',
    'bug', 'feature', 'enhancement', 'critical'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        newTag: ''
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const validateForm = () => {
    if (!formData.titulo.trim()) return 'Título da tarefa é obrigatório';
    if (!formData.descricao.trim()) return 'Descrição é obrigatória';
    if (!formData.responsavel_id) return 'Responsável deve ser selecionado';
    
    if (formData.data_vencimento) {
      const dataVencimento = new Date(formData.data_vencimento);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      if (dataVencimento < hoje) return 'Data de vencimento não pode ser no passado';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const taskData = {
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        status: formData.status,
        prioridade: formData.prioridade,
        responsavel_id: formData.responsavel_id,
        equipe_id: equipe?.id || '650e8400-e29b-41d4-a716-446655440001',
        projeto_id: formData.projeto_id || null,
        data_vencimento: formData.data_vencimento || null,
        tags: formData.tags,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('🚀 Criando tarefa:', taskData);

      const { data, error: supabaseError } = await supabase
        .from('tarefas')
        .insert([taskData])
        .select();

      if (supabaseError) {
        console.error('❌ Erro do Supabase:', supabaseError);
        throw new Error(`Erro ao criar tarefa: ${supabaseError.message}`);
      }

      console.log('✅ Tarefa criada:', data);
      setSuccess(true);

      // Feedback visual de sucesso
      setTimeout(() => {
        onTaskCreated();
        resetForm();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('❌ Erro ao criar tarefa:', err);
      setError(err.message || 'Erro desconhecido ao criar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      status: initialStatus,
      prioridade: 'media',
      responsavel_id: usuario?.id || '',
      projeto_id: '',
      data_vencimento: '',
      tags: [],
      newTag: ''
    });
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center py-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tarefa Criada com Sucesso!
            </h3>
            <p className="text-gray-600">
              A tarefa "{formData.titulo}" foi adicionada ao Kanban.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Nova Tarefa
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título da Tarefa *
            </label>
            <Input
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
              placeholder="Ex: Implementar autenticação de usuários"
              disabled={loading}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Descreva os detalhes da tarefa..."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Status e Prioridade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                disabled={loading}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Flag className="inline h-4 w-4 mr-1" />
                Prioridade
              </label>
              <select
                value={formData.prioridade}
                onChange={(e) => handleInputChange('prioridade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                disabled={loading}
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Responsável e Projeto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline h-4 w-4 mr-1" />
                Responsável *
              </label>
              <select
                value={formData.responsavel_id}
                onChange={(e) => handleInputChange('responsavel_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                disabled={loading}
              >
                <option value="">Selecionar responsável</option>
                {responsavelOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projeto (Opcional)
              </label>
              <select
                value={formData.projeto_id}
                onChange={(e) => handleInputChange('projeto_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                disabled={loading}
              >
                <option value="">Nenhum projeto</option>
                {projectOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data de Vencimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Data de Vencimento (Opcional)
            </label>
            <Input
              type="date"
              value={formData.data_vencimento}
              onChange={(e) => handleInputChange('data_vencimento', e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Zap className="inline h-4 w-4 mr-1" />
              Tags
            </label>
            
            {/* Tags Selecionadas */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Adicionar Nova Tag */}
            <div className="flex gap-2 mb-3">
              <Input
                value={formData.newTag}
                onChange={(e) => handleInputChange('newTag', e.target.value)}
                placeholder="Adicionar tag..."
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(formData.newTag);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addTag(formData.newTag)}
                disabled={loading || !formData.newTag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Tags Predefinidas */}
            <div className="flex flex-wrap gap-2">
              {predefinedTags
                .filter(tag => !formData.tags.includes(tag))
                .map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    disabled={loading}
                  >
                    + {tag}
                  </button>
                ))}
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-team-primary hover:bg-team-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Tarefa
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}