import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus,
  Hash,
  Lock,
  MessageSquare,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface NewChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelCreated: (name: string, description: string, type: 'public' | 'private') => Promise<{ success: boolean; error?: string }>;
}

export function NewChannelModal({ isOpen, onClose, onChannelCreated }: NewChannelModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'public' as 'public' | 'private'
  });

  const channelTypes = [
    { 
      value: 'public', 
      label: 'Canal Público', 
      icon: Hash,
      description: 'Todos da equipe podem ver e participar' 
    },
    { 
      value: 'private', 
      label: 'Canal Privado', 
      icon: Lock,
      description: 'Apenas membros convidados podem participar' 
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Nome do canal é obrigatório';
    if (formData.name.trim().length < 3) return 'Nome deve ter pelo menos 3 caracteres';
    if (formData.name.includes(' ')) return 'Nome do canal não pode conter espaços';
    if (!formData.description.trim()) return 'Descrição é obrigatória';
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
      console.log('🎯 Criando novo canal:', formData);

      const result = await onChannelCreated(
        formData.name.trim().toLowerCase(),
        formData.description.trim(),
        formData.type
      );

      if (result.success) {
        console.log('✅ Canal criado com sucesso');
        setSuccess(true);

        // Feedback visual de sucesso
        setTimeout(() => {
          resetForm();
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Erro ao criar canal');
      }

    } catch (err: any) {
      console.error('❌ Erro ao criar canal:', err);
      setError(err.message || 'Erro desconhecido ao criar canal');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'public'
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
              Canal Criado com Sucesso!
            </h3>
            <p className="text-gray-600">
              O canal "#{formData.name}" foi criado e está pronto para usar.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Criar Novo Canal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome do Canal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Canal *
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="ex: marketing-team"
                className="pl-10"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use apenas letras minúsculas, números e hífens
            </p>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva o propósito deste canal..."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Tipo do Canal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Canal
            </label>
            <div className="space-y-3">
              {channelTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <label
                    key={type.value}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.type === type.value
                        ? 'border-team-primary bg-team-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="sr-only"
                      disabled={loading}
                    />
                    <IconComponent className={`h-5 w-5 mt-0.5 mr-3 ${
                      formData.type === type.value ? 'text-team-primary' : 'text-gray-400'
                    }`} />
                    <div>
                      <div className={`font-medium ${
                        formData.type === type.value ? 'text-team-primary' : 'text-gray-900'
                      }`}>
                        {type.label}
                      </div>
                      <div className="text-sm text-gray-500">
                        {type.description}
                      </div>
                    </div>
                  </label>
                );
              })}
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
                  Criar Canal
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}