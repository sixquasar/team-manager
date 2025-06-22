import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Edit,
  Save,
  X,
  Calendar,
  DollarSign,
  Users,
  Target,
  Zap,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { supabase } from '@/lib/supabase';
import { ProjectAIAnalysis } from './ProjectAIAnalysis';

interface Project {
  id: string;
  nome: string;
  descricao: string;
  status: 'planejamento' | 'em_progresso' | 'finalizado' | 'cancelado';
  data_inicio: string;
  data_fim_prevista: string;
  data_fim_real?: string | null;
  progresso: number;
  orcamento: number;
  responsavel_id: string;
  equipe_id: string;
  tecnologias: string[];
  created_at: string;
  updated_at: string;
}

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onProjectUpdated: () => void;
  onProjectDeleted: () => void;
}

export function ProjectDetailsModal({ 
  isOpen, 
  onClose, 
  project, 
  onProjectUpdated,
  onProjectDeleted 
}: ProjectDetailsModalProps) {
  const { usuario } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    status: 'planejamento' as Project['status'],
    data_inicio: '',
    data_fim_prevista: '',
    progresso: 0,
    orcamento: '',
    responsavel_id: '',
    tecnologias: [] as string[],
    newTech: ''
  });

  const statusOptions = [
    { value: 'planejamento', label: 'Planejamento', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'em_progresso', label: 'Em Progresso', color: 'bg-blue-100 text-blue-800' },
    { value: 'finalizado', label: 'Finalizado', color: 'bg-green-100 text-green-800' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
  ];

  const responsavelOptions = [
    { id: '550e8400-e29b-41d4-a716-446655440001', nome: 'Ricardo Landim' },
    { id: '550e8400-e29b-41d4-a716-446655440002', nome: 'Leonardo Candiani' },
    { id: '550e8400-e29b-41d4-a716-446655440003', nome: 'Rodrigo Marochi' }
  ];

  useEffect(() => {
    if (project) {
      setFormData({
        nome: project.nome,
        descricao: project.descricao,
        status: project.status,
        data_inicio: project.data_inicio,
        data_fim_prevista: project.data_fim_prevista,
        progresso: project.progresso,
        orcamento: project.orcamento.toString(),
        responsavel_id: project.responsavel_id,
        tecnologias: project.tecnologias || [],
        newTech: ''
      });
    }
  }, [project]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const addTechnology = (tech: string) => {
    if (tech && !formData.tecnologias.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        tecnologias: [...prev.tecnologias, tech],
        newTech: ''
      }));
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tecnologias: prev.tecnologias.filter(t => t !== tech)
    }));
  };

  const validateForm = () => {
    if (!formData.nome.trim()) return 'Nome do projeto é obrigatório';
    if (!formData.descricao.trim()) return 'Descrição é obrigatória';
    if (!formData.data_inicio) return 'Data de início é obrigatória';
    if (!formData.data_fim_prevista) return 'Data de fim é obrigatória';
    if (!formData.orcamento || parseFloat(formData.orcamento) <= 0) return 'Orçamento deve ser maior que zero';
    if (formData.progresso < 0 || formData.progresso > 100) return 'Progresso deve estar entre 0 e 100';
    
    return null;
  };

  const handleSave = async () => {
    if (!project) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        status: formData.status,
        data_inicio: formData.data_inicio,
        data_fim_prevista: formData.data_fim_prevista,
        progresso: formData.progresso,
        orcamento: parseFloat(formData.orcamento),
        responsavel_id: formData.responsavel_id,
        tecnologias: formData.tecnologias,
        updated_at: new Date().toISOString()
      };

      console.log('🔄 Atualizando projeto:', updateData);

      const { data, error: supabaseError } = await supabase
        .from('projetos')
        .update(updateData)
        .eq('id', project.id)
        .select();

      if (supabaseError) {
        console.error('❌ Erro do Supabase:', supabaseError);
        throw new Error(`Erro ao atualizar projeto: ${supabaseError.message}`);
      }

      console.log('✅ Projeto atualizado:', data);
      setSuccess(true);
      setIsEditing(false);

      setTimeout(() => {
        onProjectUpdated();
        setSuccess(false);
      }, 1500);

    } catch (err: any) {
      console.error('❌ Erro ao atualizar projeto:', err);
      setError(err.message || 'Erro desconhecido ao atualizar projeto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;

    const confirmDelete = confirm(
      `Tem certeza que deseja excluir o projeto "${project.nome}"?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmDelete) return;

    setDeleting(true);
    setError(null);

    try {
      console.log('🗑️ Deletando projeto:', project.id);

      const { error: supabaseError } = await supabase
        .from('projetos')
        .delete()
        .eq('id', project.id);

      if (supabaseError) {
        console.error('❌ Erro do Supabase:', supabaseError);
        throw new Error(`Erro ao excluir projeto: ${supabaseError.message}`);
      }

      console.log('✅ Projeto excluído com sucesso');
      onProjectDeleted();
      onClose();

    } catch (err: any) {
      console.error('❌ Erro ao excluir projeto:', err);
      setError(err.message || 'Erro desconhecido ao excluir projeto');
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: Project['status']) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return (
      <Badge className={statusConfig?.color}>
        {statusConfig?.label}
      </Badge>
    );
  };

  const getResponsavelNome = (id: string) => {
    return responsavelOptions.find(r => r.id === id)?.nome || 'Não atribuído';
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              {isEditing ? 'Editar Projeto' : 'Detalhes do Projeto'}
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
            <span className="text-sm text-green-700">Projeto atualizado com sucesso!</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Nome e Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Projeto
              </label>
              {isEditing ? (
                <Input
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  disabled={loading}
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">{project.nome}</p>
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
                getStatusBadge(project.status)
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
              <p className="text-gray-700">{project.descricao}</p>
            )}
          </div>

          {/* Progresso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progresso: {isEditing ? formData.progresso : project.progresso}%
            </label>
            {isEditing ? (
              <div className="flex items-center space-x-4">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progresso}
                  onChange={(e) => handleInputChange('progresso', parseInt(e.target.value) || 0)}
                  disabled={loading}
                  className="w-20"
                />
                <Progress value={formData.progresso} className="flex-1" />
              </div>
            ) : (
              <Progress value={project.progresso} className="h-3" />
            )}
          </div>

          {/* Datas e Orçamento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Data de Início
              </label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                  disabled={loading}
                />
              ) : (
                <p className="text-gray-900">{formatDate(project.data_inicio)}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Data de Fim Prevista
              </label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.data_fim_prevista}
                  onChange={(e) => handleInputChange('data_fim_prevista', e.target.value)}
                  disabled={loading}
                />
              ) : (
                <p className="text-gray-900">{formatDate(project.data_fim_prevista)}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Orçamento
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.orcamento}
                  onChange={(e) => handleInputChange('orcamento', e.target.value)}
                  disabled={loading}
                />
              ) : (
                <p className="text-gray-900 font-medium">{formatCurrency(project.orcamento)}</p>
              )}
            </div>
          </div>

          {/* Responsável */}
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
              <p className="text-gray-900">{getResponsavelNome(project.responsavel_id)}</p>
            )}
          </div>

          {/* Tecnologias */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Zap className="inline h-4 w-4 mr-1" />
              Tecnologias
            </label>
            
            {isEditing ? (
              <div className="space-y-3">
                {/* Tecnologias Selecionadas */}
                {formData.tecnologias.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tecnologias.map((tech) => (
                      <Badge key={tech} variant="secondary" className="flex items-center">
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTechnology(tech)}
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
                    value={formData.newTech}
                    onChange={(e) => handleInputChange('newTech', e.target.value)}
                    placeholder="Adicionar tecnologia..."
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTechnology(formData.newTech);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addTechnology(formData.newTech)}
                    disabled={loading || !formData.newTech.trim()}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(project.tecnologias || []).map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
                {(!project.tecnologias || project.tecnologias.length === 0) && (
                  <p className="text-gray-500 text-sm">Nenhuma tecnologia definida</p>
                )}
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

          {/* Análise IA - Mostrar apenas quando não está editando */}
          {!isEditing && project && (
            <div className="mt-6 pt-6 border-t">
              <ProjectAIAnalysis 
                project={{
                  ...project,
                  orcamento_usado: project.orcamento * (project.progresso / 100)
                }} 
              />
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
                    if (project) {
                      setFormData({
                        nome: project.nome,
                        descricao: project.descricao,
                        status: project.status,
                        data_inicio: project.data_inicio,
                        data_fim_prevista: project.data_fim_prevista,
                        progresso: project.progresso,
                        orcamento: project.orcamento.toString(),
                        responsavel_id: project.responsavel_id,
                        tecnologias: project.tecnologias || [],
                        newTech: ''
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