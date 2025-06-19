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
  DollarSign,
  Users,
  Target,
  Zap,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { supabase } from '@/lib/supabase';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

export function NewProjectModal({ isOpen, onClose, onProjectCreated }: NewProjectModalProps) {
  const { usuario, equipe } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    data_inicio: '',
    data_fim_prevista: '',
    orcamento: '',
    responsavel_id: usuario?.id || '',
    tecnologias: [] as string[],
    newTech: ''
  });

  const predefinedTechs = [
    'React', 'TypeScript', 'Python', 'Node.js', 'PostgreSQL', 'AWS',
    'OpenAI GPT-4', 'Claude 3', 'Gemini Pro', 'WhatsApp API', 'VoIP',
    'Kubernetes', 'Redis', 'Docker', 'LangChain', 'Supabase'
  ];

  const handleInputChange = (field: string, value: string) => {
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
    
    const dataInicio = new Date(formData.data_inicio);
    const dataFim = new Date(formData.data_fim_prevista);
    if (dataFim <= dataInicio) return 'Data de fim deve ser posterior à data de início';
    
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
      const projectData = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        data_inicio: formData.data_inicio,
        data_fim_prevista: formData.data_fim_prevista,
        orcamento: parseFloat(formData.orcamento),
        responsavel_id: formData.responsavel_id,
        equipe_id: equipe?.id || '650e8400-e29b-41d4-a716-446655440001',
        status: 'planejamento',
        progresso: 0,
        tecnologias: formData.tecnologias,
        data_fim_real: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('🚀 Criando projeto:', projectData);

      const { data, error: supabaseError } = await supabase
        .from('projetos')
        .insert([projectData])
        .select();

      if (supabaseError) {
        console.error('❌ Erro do Supabase:', supabaseError);
        throw new Error(`Erro ao criar projeto: ${supabaseError.message}`);
      }

      console.log('✅ Projeto criado:', data);
      setSuccess(true);

      // Feedback visual de sucesso
      setTimeout(() => {
        onProjectCreated();
        resetForm();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('❌ Erro ao criar projeto:', err);
      setError(err.message || 'Erro desconhecido ao criar projeto');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      data_inicio: '',
      data_fim_prevista: '',
      orcamento: '',
      responsavel_id: usuario?.id || '',
      tecnologias: [],
      newTech: ''
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
              Projeto Criado com Sucesso!
            </h3>
            <p className="text-gray-600">
              O projeto "{formData.nome}" foi adicionado ao sistema.
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
            Novo Projeto
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome do Projeto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Projeto *
            </label>
            <Input
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder="Ex: Sistema de IA para Atendimento"
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
              placeholder="Descreva os objetivos e escopo do projeto..."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Data de Início *
              </label>
              <Input
                type="date"
                value={formData.data_inicio}
                onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Data de Fim Prevista *
              </label>
              <Input
                type="date"
                value={formData.data_fim_prevista}
                onChange={(e) => handleInputChange('data_fim_prevista', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Orçamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Orçamento (R$) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.orcamento}
              onChange={(e) => handleInputChange('orcamento', e.target.value)}
              placeholder="Ex: 1500000.00"
              disabled={loading}
            />
          </div>

          {/* Responsável */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Responsável
            </label>
            <select
              value={formData.responsavel_id}
              onChange={(e) => handleInputChange('responsavel_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
              disabled={loading}
            >
              <option value="550e8400-e29b-41d4-a716-446655440001">Ricardo Landim</option>
              <option value="550e8400-e29b-41d4-a716-446655440002">Leonardo Candiani</option>
              <option value="550e8400-e29b-41d4-a716-446655440003">Rodrigo Marochi</option>
            </select>
          </div>

          {/* Tecnologias */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Zap className="inline h-4 w-4 mr-1" />
              Tecnologias
            </label>
            
            {/* Tecnologias Selecionadas */}
            {formData.tecnologias.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
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

            {/* Adicionar Nova Tecnologia */}
            <div className="flex gap-2 mb-3">
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
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Tecnologias Predefinidas */}
            <div className="flex flex-wrap gap-2">
              {predefinedTechs
                .filter(tech => !formData.tecnologias.includes(tech))
                .map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => addTechnology(tech)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    disabled={loading}
                  >
                    + {tech}
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
                  Criar Projeto
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}