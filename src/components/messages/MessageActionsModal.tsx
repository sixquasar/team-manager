import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Edit3,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { Message } from '@/hooks/use-messages';

interface MessageActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  onEditMessage: (messageId: string, newContent: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteMessage: (messageId: string) => Promise<{ success: boolean; error?: string }>;
  currentUserId: string;
}

export function MessageActionsModal({ 
  isOpen, 
  onClose, 
  message, 
  onEditMessage, 
  onDeleteMessage,
  currentUserId 
}: MessageActionsModalProps) {
  const [mode, setMode] = useState<'actions' | 'edit' | 'delete'>('actions');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (message) {
      setEditContent(message.content);
      setMode('actions');
      setError(null);
      setSuccess(false);
    }
  }, [message]);

  const canEditDelete = message?.authorId === currentUserId;

  const handleEdit = async () => {
    if (!message || !editContent.trim()) {
      setError('Conteúdo da mensagem não pode estar vazio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('✏️ Editando mensagem:', message.id);

      const result = await onEditMessage(message.id, editContent.trim());

      if (result.success) {
        console.log('✅ Mensagem editada com sucesso');
        setSuccess(true);

        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Erro ao editar mensagem');
      }

    } catch (err: any) {
      console.error('❌ Erro ao editar mensagem:', err);
      setError(err.message || 'Erro desconhecido ao editar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!message) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🗑️ Deletando mensagem:', message.id);

      const result = await onDeleteMessage(message.id);

      if (result.success) {
        console.log('✅ Mensagem deletada com sucesso');
        setSuccess(true);

        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Erro ao deletar mensagem');
      }

    } catch (err: any) {
      console.error('❌ Erro ao deletar mensagem:', err);
      setError(err.message || 'Erro desconhecido ao deletar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setMode('actions');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  if (!message) return null;

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center py-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {mode === 'edit' ? 'Mensagem Editada!' : 'Mensagem Deletada!'}
            </h3>
            <p className="text-gray-600">
              {mode === 'edit' 
                ? 'Sua mensagem foi atualizada com sucesso.'
                : 'A mensagem foi removida do canal.'
              }
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
            {mode === 'actions' && 'Ações da Mensagem'}
            {mode === 'edit' && 'Editar Mensagem'}
            {mode === 'delete' && 'Confirmar Exclusão'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações da Mensagem */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm text-gray-900">
                {message.authorName}
              </span>
              <span className="text-xs text-gray-500">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
            <p className="text-sm text-gray-700">
              {message.content}
            </p>
          </div>

          {/* Modo: Seleção de Ações */}
          {mode === 'actions' && (
            <div className="space-y-3">
              {canEditDelete ? (
                <>
                  <Button
                    onClick={() => setMode('edit')}
                    variant="outline"
                    className="w-full justify-start"
                    disabled={loading}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar Mensagem
                  </Button>
                  <Button
                    onClick={() => setMode('delete')}
                    variant="outline"
                    className="w-full justify-start hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar Mensagem
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    Você só pode editar ou deletar suas próprias mensagens.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Modo: Editar */}
          {mode === 'edit' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo da Mensagem
                </label>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  disabled={loading}
                  placeholder="Digite o novo conteúdo da mensagem..."
                />
              </div>
            </div>
          )}

          {/* Modo: Confirmar Exclusão */}
          {mode === 'delete' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">
                      Atenção: Esta ação não pode ser desfeita
                    </h4>
                    <p className="text-sm text-red-700 mt-1">
                      A mensagem será removida permanentemente do canal e não poderá ser recuperada.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem de Erro */}
          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            {mode === 'actions' && (
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
            )}

            {mode === 'edit' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setMode('actions')}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleEdit}
                  className="bg-team-primary hover:bg-team-primary/90"
                  disabled={loading || !editContent.trim()}
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
            )}

            {mode === 'delete' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setMode('actions')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Deletando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Confirmar Exclusão
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}