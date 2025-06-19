import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Star,
  Activity,
  Clock,
  Target,
  Award,
  Users,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { useProfile } from '@/hooks/use-profile';
import { supabase } from '@/lib/supabase';

export function Profile() {
  const { usuario, equipe } = useAuth();
  const { stats, loading, refetch } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
    telefone: usuario?.telefone || '',
    cargo: usuario?.cargo || '',
    bio: usuario?.bio || '',
    localizacao: usuario?.localizacao || 'São Paulo, Brasil'
  });

  const handleSave = async () => {
    if (!usuario?.id) {
      setError('Usuário não identificado');
      return;
    }

    // Validação básica
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (!formData.cargo.trim()) {
      setError('Cargo é obrigatório');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      console.log('💾 Salvando perfil do usuário:', usuario.id);

      const updateData = {
        nome: formData.nome.trim(),
        cargo: formData.cargo.trim(),
        telefone: formData.telefone.trim() || null,
        localizacao: formData.localizacao.trim() || null,
        bio: formData.bio.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { error: supabaseError } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', usuario.id);

      if (supabaseError) {
        console.error('❌ Erro do Supabase:', supabaseError);
        throw new Error(`Erro ao atualizar perfil: ${supabaseError.message}`);
      }

      console.log('✅ Perfil atualizado com sucesso');
      setSuccess(true);
      setIsEditing(false);
      
      // Recarregar dados
      refetch();

      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err: any) {
      console.error('❌ Erro ao salvar perfil:', err);
      setError(err.message || 'Erro desconhecido ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nome: usuario?.nome || '',
      email: usuario?.email || '',
      telefone: usuario?.telefone || '',
      cargo: usuario?.cargo || '',
      bio: usuario?.bio || '',
      localizacao: usuario?.localizacao || 'São Paulo, Brasil'
    });
    setError(null);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null); // Limpar erro ao digitar
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-team-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>
        
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                className="bg-team-primary hover:bg-team-primary/90"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)} 
              className="bg-team-primary hover:bg-team-primary/90"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          )}
        </div>
      </div>

      {/* Mensagens de Feedback */}
      {success && (
        <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg mb-6">
          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
          <span className="text-sm text-green-700">Perfil atualizado com sucesso!</span>
        </div>
      )}

      {error && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
          <X className="h-4 w-4 text-red-500 mr-2" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-team-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                    {usuario?.nome?.charAt(0) || 'U'}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border">
                      <Camera className="h-4 w-4 text-gray-600" />
                    </button>
                  )}
                </div>

                <h2 className="text-xl font-semibold text-gray-900">{usuario?.nome}</h2>
                <p className="text-gray-600">{usuario?.cargo}</p>
                <div className="flex items-center justify-center mt-2">
                  <Building className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600">{equipe?.nome}</span>
                </div>

                {/* Status Badge */}
                <div className="mt-4">
                  <Badge className="bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Online
                  </Badge>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{stats?.projectsActive || 0}</p>
                    <p className="text-xs text-gray-600">Projetos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{stats?.tasksCompleted || 0}</p>
                    <p className="text-xs text-gray-600">Tarefas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(stats?.achievements || []).map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{achievement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                      disabled={saving}
                    />
                  ) : (
                    <p className="text-gray-900">{usuario?.nome}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{usuario?.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.cargo}
                      onChange={(e) => handleInputChange('cargo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                      disabled={saving}
                    />
                  ) : (
                    <p className="text-gray-900">{usuario?.cargo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Usuário
                  </label>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-gray-400 mr-2" />
                    <Badge className={
                      usuario?.tipo === 'owner' ? 'bg-purple-100 text-purple-800' :
                      usuario?.tipo === 'admin' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {usuario?.tipo === 'owner' ? 'Proprietário' :
                       usuario?.tipo === 'admin' ? 'Administrador' : 'Membro'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                      placeholder="(11) 99999-9999"
                      disabled={saving}
                    />
                  ) : (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{formData.telefone || 'Não informado'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localização
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.localizacao}
                      onChange={(e) => handleInputChange('localizacao', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                      disabled={saving}
                    />
                  ) : (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{formData.localizacao}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biografia
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                    placeholder="Conte um pouco sobre você..."
                    disabled={saving}
                  />
                ) : (
                  <p className="text-gray-900">{formData.bio || 'Nenhuma biografia adicionada.'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Métricas de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.teamCollaboration || 0}%</p>
                  <p className="text-sm text-gray-600">Colaboração</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.averageRating || 0}</p>
                  <p className="text-sm text-gray-600">Avaliação Média</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.hoursLogged || 0}h</p>
                  <p className="text-sm text-gray-600">Horas Trabalhadas</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.projectsActive || 0}</p>
                  <p className="text-sm text-gray-600">Projetos Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID do Usuário
                  </label>
                  <p className="text-gray-900 font-mono text-sm">{usuario?.id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membro desde
                  </label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{formatDate(usuario?.created_at || '')}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Última atualização
                  </label>
                  <p className="text-gray-900">{formatDate(usuario?.updated_at || '')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipe
                  </label>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{equipe?.nome}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}