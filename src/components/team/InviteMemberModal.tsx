import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  UserPlus,
  Mail,
  Users,
  Shield,
  Crown,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { TeamMember } from '@/hooks/use-team';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteMember: (email: string, role: TeamMember['tipo']) => Promise<{ success: boolean; error?: string }>;
  onAddMember: (memberData: Partial<TeamMember>) => Promise<{ success: boolean; error?: string }>;
}

export function InviteMemberModal({ isOpen, onClose, onInviteMember, onAddMember }: InviteMemberModalProps) {
  const [mode, setMode] = useState<'invite' | 'create'>('invite');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'member' as TeamMember['tipo']
  });

  const [createData, setCreateData] = useState({
    nome: '',
    email: '',
    cargo: '',
    telefone: '',
    localizacao: '',
    tipo: 'member' as TeamMember['tipo']
  });

  const roleOptions = [
    { 
      value: 'member', 
      label: 'Membro', 
      icon: Users,
      description: 'Acesso padrão a projetos e tarefas' 
    },
    { 
      value: 'admin', 
      label: 'Administrador', 
      icon: Shield,
      description: 'Pode gerenciar membros e configurações' 
    },
    { 
      value: 'owner', 
      label: 'Proprietário', 
      icon: Crown,
      description: 'Controle total da equipe' 
    }
  ];

  const handleInviteInputChange = (field: string, value: string) => {
    setInviteData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleCreateInputChange = (field: string, value: string) => {
    setCreateData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validateInvite = () => {
    if (!inviteData.email.trim()) return 'Email é obrigatório';
    if (!inviteData.email.includes('@')) return 'Email deve ter formato válido';
    return null;
  };

  const validateCreate = () => {
    if (!createData.nome.trim()) return 'Nome é obrigatório';
    if (!createData.email.trim()) return 'Email é obrigatório';
    if (!createData.email.includes('@')) return 'Email deve ter formato válido';
    if (!createData.cargo.trim()) return 'Cargo é obrigatório';
    return null;
  };

  const handleInvite = async () => {
    const validationError = validateInvite();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📧 Enviando convite:', inviteData);

      const result = await onInviteMember(inviteData.email.trim(), inviteData.role);

      if (result.success) {
        console.log('✅ Convite enviado com sucesso');
        setSuccess(true);

        setTimeout(() => {
          resetForms();
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Erro ao enviar convite');
      }

    } catch (err: any) {
      console.error('❌ Erro ao enviar convite:', err);
      setError(err.message || 'Erro desconhecido ao enviar convite');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const validationError = validateCreate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('👤 Criando novo membro:', createData);

      const result = await onAddMember({
        nome: createData.nome.trim(),
        email: createData.email.trim(),
        cargo: createData.cargo.trim(),
        telefone: createData.telefone.trim() || undefined,
        localizacao: createData.localizacao.trim() || undefined,
        tipo: createData.tipo
      });

      if (result.success) {
        console.log('✅ Membro criado com sucesso');
        setSuccess(true);

        setTimeout(() => {
          resetForms();
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Erro ao criar membro');
      }

    } catch (err: any) {
      console.error('❌ Erro ao criar membro:', err);
      setError(err.message || 'Erro desconhecido ao criar membro');
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setInviteData({
      email: '',
      role: 'member'
    });
    setCreateData({
      nome: '',
      email: '',
      cargo: '',
      telefone: '',
      localizacao: '',
      tipo: 'member'
    });
    setError(null);
    setSuccess(false);
    setMode('invite');
  };

  const handleClose = () => {
    if (!loading) {
      resetForms();
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
              {mode === 'invite' ? 'Convite Enviado!' : 'Membro Adicionado!'}
            </h3>
            <p className="text-gray-600">
              {mode === 'invite' 
                ? `Convite enviado para ${inviteData.email}. Eles receberão um email para se juntar à equipe.`
                : `${createData.nome} foi adicionado à equipe com sucesso.`
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
            <UserPlus className="mr-2 h-5 w-5" />
            {mode === 'invite' ? 'Convidar Membro' : 'Adicionar Membro'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção do Modo */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setMode('invite')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'invite'
                  ? 'bg-white text-team-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="h-4 w-4 mr-2 inline" />
              Enviar Convite
            </button>
            <button
              onClick={() => setMode('create')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'create'
                  ? 'bg-white text-team-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserPlus className="h-4 w-4 mr-2 inline" />
              Criar Diretamente
            </button>
          </div>

          {/* Modo: Enviar Convite */}
          {mode === 'invite' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email do Membro *
                </label>
                <Input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => handleInviteInputChange('email', e.target.value)}
                  placeholder="exemplo@email.com"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Um convite será enviado para este email
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Função na Equipe
                </label>
                <div className="space-y-2">
                  {roleOptions.map((role) => {
                    const IconComponent = role.icon;
                    return (
                      <label
                        key={role.value}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                          inviteData.role === role.value
                            ? 'border-team-primary bg-team-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="inviteRole"
                          value={role.value}
                          checked={inviteData.role === role.value}
                          onChange={(e) => handleInviteInputChange('role', e.target.value)}
                          className="sr-only"
                          disabled={loading}
                        />
                        <IconComponent className={`h-5 w-5 mt-0.5 mr-3 ${
                          inviteData.role === role.value ? 'text-team-primary' : 'text-gray-400'
                        }`} />
                        <div>
                          <div className={`font-medium ${
                            inviteData.role === role.value ? 'text-team-primary' : 'text-gray-900'
                          }`}>
                            {role.label}
                          </div>
                          <div className="text-sm text-gray-500">
                            {role.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modo: Criar Diretamente */}
          {mode === 'create' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <Input
                    value={createData.nome}
                    onChange={(e) => handleCreateInputChange('nome', e.target.value)}
                    placeholder="João Silva"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={createData.email}
                    onChange={(e) => handleCreateInputChange('email', e.target.value)}
                    placeholder="joao@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo *
                </label>
                <Input
                  value={createData.cargo}
                  onChange={(e) => handleCreateInputChange('cargo', e.target.value)}
                  placeholder="Developer, Designer, Product Manager..."
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone (Opcional)
                  </label>
                  <Input
                    value={createData.telefone}
                    onChange={(e) => handleCreateInputChange('telefone', e.target.value)}
                    placeholder="+55 11 99999-9999"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localização (Opcional)
                  </label>
                  <Input
                    value={createData.localizacao}
                    onChange={(e) => handleCreateInputChange('localizacao', e.target.value)}
                    placeholder="São Paulo, SP"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuário
                </label>
                <select
                  value={createData.tipo}
                  onChange={(e) => handleCreateInputChange('tipo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                  disabled={loading}
                >
                  {roleOptions.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
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
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={mode === 'invite' ? handleInvite : handleCreate}
              className="bg-team-primary hover:bg-team-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {mode === 'invite' ? 'Enviando...' : 'Criando...'}
                </>
              ) : (
                <>
                  {mode === 'invite' ? (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar Convite
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar Membro
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}