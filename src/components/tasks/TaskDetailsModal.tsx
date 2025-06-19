import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Edit,
  Save,
  X,
  Calendar,
  Users,
  Target,
  Zap,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Eye,
  Flag,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { supabase } from '@/lib/supabase';

interface Task {
  id: string;
  titulo: string;
  descricao: string;
  status: 'pendente' | 'em_progresso' | 'concluida' | 'cancelada';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  responsavel_id: string;
  equipe_id: string;
  projeto_id?: string | null;
  data_vencimento?: string | null;
  data_conclusao?: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onTaskUpdated: () => void;
  onTaskDeleted: () => void;
}

export function TaskDetailsModal({ 
  isOpen, 
  onClose, 
  task, 
  onTaskUpdated,
  onTaskDeleted 
}: TaskDetailsModalProps) {
  const { usuario } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    status: 'pendente' as Task['status'],
    prioridade: 'media' as Task['prioridade'],
    responsavel_id: '',
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

  const projectOptions = [
    { id: '', nome: 'Nenhum projeto' },
    { id: '750e8400-e29b-41d4-a716-446655440001', nome: 'Sistema Palmas IA' },
    { id: '750e8400-e29b-41d4-a716-446655440002', nome: 'Automação Jocum' }
  ];

  useEffect(() => {
    if (task) {
      setFormData({
        titulo: task.titulo,
        descricao: task.descricao,
        status: task.status,
        prioridade: task.prioridade,
        responsavel_id: task.responsavel_id,
        projeto_id: task.projeto_id || '',
        data_vencimento: task.data_vencimento || '',
        tags: task.tags || [],
        newTag: ''
      });
    }
  }, [task]);

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
    return null;
  };

  const handleSave = async () => {
    if (!task) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData = {
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        status: formData.status,
        prioridade: formData.prioridade,
        responsavel_id: formData.responsavel_id,
        projeto_id: formData.projeto_id || null,
        data_vencimento: formData.data_vencimento || null,
        tags: formData.tags,
        data_conclusao: formData.status === 'concluida' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };

      console.log('🔄 Atualizando tarefa:', updateData);

      const { data, error: supabaseError } = await supabase
        .from('tarefas')
        .update(updateData)
        .eq('id', task.id)
        .select();

      if (supabaseError) {
        console.error('❌ Erro do Supabase:', supabaseError);
        throw new Error(`Erro ao atualizar tarefa: ${supabaseError.message}`);
      }

      console.log('✅ Tarefa atualizada:', data);
      setSuccess(true);
      setIsEditing(false);

      setTimeout(() => {
        onTaskUpdated();
        setSuccess(false);
      }, 1500);

    } catch (err: any) {
      console.error('❌ Erro ao atualizar tarefa:', err);
      setError(err.message || 'Erro desconhecido ao atualizar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    const confirmDelete = confirm(
      `Tem certeza que deseja excluir a tarefa "${task.titulo}"?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmDelete) return;

    setDeleting(true);
    setError(null);

    try {
      console.log('🗑️ Deletando tarefa:', task.id);

      const { error: supabaseError } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', task.id);

      if (supabaseError) {
        console.error('❌ Erro do Supabase:', supabaseError);
        throw new Error(`Erro ao excluir tarefa: ${supabaseError.message}`);
      }

      console.log('✅ Tarefa excluída com sucesso');
      onTaskDeleted();
      onClose();

    } catch (err: any) {
      console.error('❌ Erro ao excluir tarefa:', err);
      setError(err.message || 'Erro desconhecido ao excluir tarefa');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: Task['status']) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return (
      <Badge className={statusConfig?.color}>
        {statusConfig?.label}
      </Badge>
    );
  };

  const getPriorityBadge = (prioridade: Task['prioridade']) => {
    const priorityConfig = priorityOptions.find(p => p.value === prioridade);
    return (
      <div className={`w-3 h-3 rounded-full ${priorityConfig?.color}`} title={priorityConfig?.label} />
    );
  };

  const getResponsavelNome = (id: string) => {
    return responsavelOptions.find(r => r.id === id)?.nome || 'Não atribuído';
  };

  const getProjetoNome = (id: string | null) => {
    if (!id) return 'Nenhum projeto';
    return projectOptions.find(p => p.id === id)?.nome || 'Projeto desconhecido';
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              {isEditing ? 'Editar Tarefa' : 'Detalhes da Tarefa'}
            </div>
            {!isEditing && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  disabled={loading || deleting}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {(usuario?.tipo === 'owner' || usuario?.tipo === 'admin') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={loading || deleting}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {success && (
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm text-green-700">Tarefa atualizada com sucesso!</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Título e Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Tarefa
              </label>
              {isEditing ? (
                <Input
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  disabled={loading}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">{task.titulo}</h3>
                  {getPriorityBadge(task.prioridade)}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              {isEditing ? (
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
              ) : (
                getStatusBadge(task.status)
              )}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            {isEditing ? (
              <Textarea
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                rows={3}
                disabled={loading}
              />
            ) : (
              <p className="text-gray-700">{task.descricao}</p>
            )}
          </div>

          {/* Responsável, Prioridade e Projeto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline h-4 w-4 mr-1" />
                Responsável
              </label>
              {isEditing ? (
                <select
                  value={formData.responsavel_id}
                  onChange={(e) => handleInputChange('responsavel_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                  disabled={loading}
                >
                  {responsavelOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.nome}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900">{getResponsavelNome(task.responsavel_id)}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Flag className="inline h-4 w-4 mr-1" />
                Prioridade
              </label>
              {isEditing ? (
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
              ) : (
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(task.prioridade)}
                  <span className="text-gray-900 capitalize">{task.prioridade}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projeto
              </label>
              {isEditing ? (
                <select
                  value={formData.projeto_id}
                  onChange={(e) => handleInputChange('projeto_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                  disabled={loading}
                >
                  {projectOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.nome}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900">{getProjetoNome(task.projeto_id)}</p>
              )}
            </div>
          </div>

          {/* Data de Vencimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Data de Vencimento
            </label>
            {isEditing ? (
              <Input
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => handleInputChange('data_vencimento', e.target.value)}
                disabled={loading}
              />
            ) : (
              <p className="text-gray-900">{formatDate(task.data_vencimento || '')}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Zap className="inline h-4 w-4 mr-1" />
              Tags
            </label>
            
            {isEditing ? (
              <div className="space-y-3">
                {/* Tags Selecionadas */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
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

                {/* Adicionar Nova */}
                <div className="flex gap-2">
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
                    Adicionar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(task.tags || []).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                {(!task.tags || task.tags.length === 0) && (
                  <p className="text-gray-500 text-sm">Nenhuma tag definida</p>
                )}
              </div>
            )}
          </div>

          {/* Datas de Criação e Conclusão */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <Clock className="inline h-4 w-4 mr-1" />
              <strong>Criada em:</strong> {formatDate(task.created_at)}
            </div>
            {task.data_conclusao && (
              <div>
                <CheckCircle2 className="inline h-4 w-4 mr-1" />
                <strong>Concluída em:</strong> {formatDate(task.data_conclusao)}
              </div>
            )}
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
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setError(null);
                    // Resetar formData para valores originais
                    if (task) {
                      setFormData({
                        titulo: task.titulo,
                        descricao: task.descricao,
                        status: task.status,
                        prioridade: task.prioridade,
                        responsavel_id: task.responsavel_id,
                        projeto_id: task.projeto_id || '',
                        data_vencimento: task.data_vencimento || '',
                        tags: task.tags || [],
                        newTag: ''
                      });
                    }
                  }}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-team-primary hover:bg-team-primary/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={onClose}>
                <Eye className="h-4 w-4 mr-2" />
                Fechar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}