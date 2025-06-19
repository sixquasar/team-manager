import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Edit2,
  Save,
  X,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Users,
  Shield,
  Crown,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { TeamMember } from '@/hooks/use-team';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onUpdateMember: (memberId: string, updates: Partial<TeamMember>) => Promise<{ success: boolean; error?: string }>;
  onRemoveMember: (memberId: string) => Promise<{ success: boolean; error?: string }>;
  currentUserType: TeamMember['tipo'];
}

export function EditMemberModal({ 
  isOpen, 
  onClose, 
  member, 
  onUpdateMember, 
  onRemoveMember,
  currentUserType 
}: EditMemberModalProps) {
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cargo: '',
    telefone: '',
    localizacao: '',
    tipo: 'member' as TeamMember['tipo'],
    status: 'ativo' as TeamMember['status']
  });

  const roleOptions = [
    { value: 'member', label: 'Membro', icon: Users, color: 'bg-gray-100 text-gray-800' },
    { value: 'admin', label: 'Administrador', icon: Shield, color: 'bg-blue-100 text-blue-800' },
    { value: 'owner', label: 'Proprietário', icon: Crown, color: 'bg-purple-100 text-purple-800' }
  ];

  const statusOptions = [
    { value: 'ativo', label: 'Ativo', color: 'bg-green-100 text-green-800' },
    { value: 'inativo', label: 'Inativo', color: 'bg-red-100 text-red-800' },
    { value: 'ferias', label: 'Férias', color: 'bg-yellow-100 text-yellow-800' }
  ];

  useEffect(() => {
    if (member) {
      setFormData({
        nome: member.nome,
        email: member.email,
        cargo: member.cargo,
        telefone: member.telefone || '',
        localizacao: member.localizacao || '',
        tipo: member.tipo,
        status: member.status
      });
      setMode('view');
      setError(null);
      setSuccess(false);
    }
  }, [member]);

  const canEdit = currentUserType === 'owner' || 
                 (currentUserType === 'admin' && member?.tipo !== 'owner');
  
  const canDelete = currentUserType === 'owner' || 
                   (currentUserType === 'admin' && member?.tipo === 'member');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.nome.trim()) return 'Nome é obrigatório';
    if (!formData.email.trim()) return 'Email é obrigatório';
    if (!formData.email.includes('@')) return 'Email deve ter formato válido';
    if (!formData.cargo.trim()) return 'Cargo é obrigatório';
    return null;
  };

  const handleSave = async () => {
    if (!member) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('💾 Salvando alterações do membro:', member.id);

      const updates: Partial<TeamMember> = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        cargo: formData.cargo.trim(),
        telefone: formData.telefone.trim() || undefined,
        localizacao: formData.localizacao.trim() || undefined,
        tipo: formData.tipo,
        status: formData.status
      };

      const result = await onUpdateMember(member.id, updates);

      if (result.success) {
        console.log('✅ Membro atualizado com sucesso');
        setSuccess(true);
        setMode('view');

        setTimeout(() => {
          setSuccess(false);
        }, 2000);
      } else {
        setError(result.error || 'Erro ao atualizar membro');
      }

    } catch (err: any) {
      console.error('❌ Erro ao atualizar membro:', err);
      setError(err.message || 'Erro desconhecido ao atualizar membro');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!member) return;

    const confirmDelete = confirm(
      `Tem certeza que deseja remover ${member.nome} da equipe?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmDelete) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🗑️ Removendo membro:', member.id);

      const result = await onRemoveMember(member.id);

      if (result.success) {
        console.log('✅ Membro removido com sucesso');
        setSuccess(true);

        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Erro ao remover membro');
      }

    } catch (err: any) {
      console.error('❌ Erro ao remover membro:', err);
      setError(err.message || 'Erro desconhecido ao remover membro');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setMode('view');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getRoleBadge = (tipo: TeamMember['tipo']) => {
    const role = roleOptions.find(r => r.value === tipo);
    const IconComponent = role?.icon || Users;
    return (
      <Badge className={role?.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        {role?.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: TeamMember['status']) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return (
      <Badge className={statusConfig?.color}>
        {statusConfig?.label}
      </Badge>
    );
  };

  if (!member) return null;

  if (success && mode === 'delete') {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center py-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Membro Removido!
            </h3>
            <p className="text-gray-600">
              {member.nome} foi removido da equipe com sucesso.
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
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Edit2 className="mr-2 h-5 w-5" />
              {mode === 'view' ? 'Detalhes do Membro' : 
               mode === 'edit' ? 'Editar Membro' : 'Remover Membro'}
            </div>
            {mode === 'view' && canEdit && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode('edit')}
                  disabled={loading}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                {canDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMode('delete')}
                    disabled={loading}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {success && mode === 'edit' && (
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm text-green-700">Membro atualizado com sucesso!</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Foto e Informações Básicas */}
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-team-primary text-white rounded-full flex items-center justify-center text-xl font-medium">
              {member.nome.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              {mode === 'view' ? (
                <>
                  <h3 className="text-xl font-semibold text-gray-900">{member.nome}</h3>
                  <p className="text-gray-600">{member.cargo}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {getRoleBadge(member.tipo)}
                    {getStatusBadge(member.status)}
                  </div>
                </>
              ) : mode === 'edit' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo
                      </label>
                      <Input
                        value={formData.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cargo
                      </label>
                      <Input
                        value={formData.cargo}
                        onChange={(e) => handleInputChange('cargo', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{member.nome}</h3>
                  <p className="text-gray-600">{member.cargo}</p>
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">
                          Confirmar Remoção
                        </h4>
                        <p className="text-sm text-red-700 mt-1">
                          Esta ação removerá permanentemente {member.nome} da equipe. 
                          Todas as atribuições de projetos e tarefas serão mantidas para histórico.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informações de Contato */}
          {mode !== 'delete' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email
                </label>
                {mode === 'edit' ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={loading}
                  />
                ) : (
                  <p className="text-gray-900">{member.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Telefone
                </label>
                {mode === 'edit' ? (
                  <Input
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    placeholder="Não informado"
                    disabled={loading}
                  />
                ) : (
                  <p className="text-gray-900">{member.telefone || 'Não informado'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Localização
                </label>
                {mode === 'edit' ? (
                  <Input
                    value={formData.localizacao}
                    onChange={(e) => handleInputChange('localizacao', e.target.value)}
                    placeholder="Não informado"
                    disabled={loading}
                  />
                ) : (
                  <p className="text-gray-900">{member.localizacao || 'Não informado'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Data de Entrada
                </label>
                <p className="text-gray-900">{formatDate(member.data_entrada)}</p>
              </div>
            </div>
          )}

          {/* Permissões e Status (apenas no modo de edição) */}
          {mode === 'edit' && canEdit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuário
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => handleInputChange('tipo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                  disabled={loading || (currentUserType !== 'owner' && member.tipo === 'owner')}
                >
                  {roleOptions.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

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
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Estatísticas */}
          {mode === 'view' && (
            <>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{member.projetos_ativos}</div>
                  <div className="text-sm text-blue-800">Projetos Ativos</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{member.tarefas_concluidas}</div>
                  <div className="text-sm text-green-800">Tarefas Concluídas</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{member.rating}</div>
                  <div className="text-sm text-yellow-800">Rating</div>
                </div>
              </div>

              {/* Especialidades */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Especialidades</h4>
                <div className="flex flex-wrap gap-2">
                  {member.especialidades.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
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
            {mode === 'view' && (
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
            )}

            {mode === 'edit' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setMode('view')}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
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
            )}

            {mode === 'delete' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setMode('view')}
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
                      Removendo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Confirmar Remoção
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