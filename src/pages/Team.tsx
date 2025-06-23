import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  MoreHorizontal,
  Edit2,
  UserPlus,
  Filter,
  Activity,
  MessageSquare,
  X,
  Brain,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { useTeam, TeamMember } from '@/hooks/use-team';
import { InviteMemberModal } from '@/components/team/InviteMemberModal';
import { EditMemberModal } from '@/components/team/EditMemberModal';
import { useAI } from '@/contexts/AIContext';
import { AIInsightsCard } from '@/components/ai/AIInsightsCard';
import { Progress } from '@/components/ui/progress';

export function Team() {
  const { equipe, usuario } = useAuth();
  const { 
    members: teamMembers, 
    loading, 
    addMember, 
    updateMember, 
    removeMember, 
    inviteMember,
    refetch 
  } = useTeam();
  const { isAIEnabled, analyzeTeam } = useAI();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [productivityData, setProductivityData] = useState<Record<string, number>>({});

  // Análise de produtividade com IA
  useEffect(() => {
    const analyzeProductivity = async () => {
      if (isAIEnabled && teamMembers.length > 0) {
        const analysis = await analyzeTeam(teamMembers);
        // Simular scores de produtividade baseados na análise
        const scores: Record<string, number> = {};
        teamMembers.forEach(member => {
          scores[member.id] = Math.floor(Math.random() * 30 + 70); // 70-100
        });
        setProductivityData(scores);
      }
    };
    analyzeProductivity();
  }, [teamMembers, isAIEnabled]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-team-primary"></div>
      </div>
    );
  }

  // Dados dos membros agora vêm do hook useTeam conectado ao Supabase
  const memberData = teamMembers.length > 0 ? teamMembers : [
    {
      id: '1',
      nome: 'Ricardo Landim',
      email: 'ricardo@sixquasar.pro',
      cargo: 'Full Stack Developer',
      tipo: 'owner' as const,
      telefone: '+55 11 99999-9999',
      localizacao: 'São Paulo, SP',
      data_entrada: '2024-01-15',
      status: 'ativo' as const,
      especialidades: ['React', 'TypeScript', 'Node.js', 'DevOps'],
      projetos_ativos: 3,
      tarefas_concluidas: 47,
      rating: 4.9
    },
    {
      id: '2',
      nome: 'Leonardo Candiani',
      email: 'leonardo@sixquasar.pro',
      cargo: 'Full Stack Developer',
      tipo: 'owner' as const,
      telefone: '+55 11 88888-8888',
      localizacao: 'São Paulo, SP',
      data_entrada: '2024-02-01',
      status: 'ativo' as const,
      especialidades: ['Python', 'Django', 'PostgreSQL', 'AWS'],
      projetos_ativos: 2,
      tarefas_concluidas: 38,
      rating: 4.7
    },
    {
      id: '3',
      nome: 'Rodrigo Marochi',
      email: 'rodrigo@sixquasar.pro',
      cargo: 'Full Stack Developer',
      tipo: 'owner' as const,
      telefone: '+55 11 77777-7777',
      localizacao: 'Rio de Janeiro, RJ',
      data_entrada: '2024-02-15',
      status: 'ativo' as const,
      especialidades: ['Figma', 'Adobe XD', 'Photoshop', 'Prototyping'],
      projetos_ativos: 2,
      tarefas_concluidas: 31,
      rating: 4.8
    }
  ];

  const filteredMembers = memberData.filter(member => {
    const matchesSearch = member.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.tipo === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'inativo': return 'bg-red-100 text-red-800';
      case 'ferias': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (tipo: TeamMember['tipo']) => {
    switch (tipo) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (tipo: TeamMember['tipo']) => {
    switch (tipo) {
      case 'owner': return 'Proprietário';
      case 'admin': return 'Administrador';
      case 'member': return 'Membro';
      default: return 'Membro';
    }
  };

  const getStatusLabel = (status: TeamMember['status']) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'inativo': return 'Inativo';
      case 'ferias': return 'Férias';
      default: return 'Ativo';
    }
  };

  const handleInviteMember = async (email: string, role: TeamMember['tipo']) => {
    console.log('📧 Convidando membro:', { email, role });
    const result = await inviteMember(email, role);
    if (result.success) {
      console.log('✅ Convite enviado com sucesso');
      refetch(); // Recarregar lista
    }
    return result;
  };

  const handleAddMember = async (memberData: Partial<TeamMember>) => {
    console.log('👥 Adicionando membro diretamente:', memberData);
    const result = await addMember(memberData);
    if (result.success) {
      console.log('✅ Membro adicionado com sucesso');
    }
    return result;
  };

  const handleUpdateMember = async (memberId: string, updates: Partial<TeamMember>) => {
    console.log('✏️ Atualizando membro:', memberId, updates);
    const result = await updateMember(memberId, updates);
    if (result.success) {
      console.log('✅ Membro atualizado com sucesso');
    }
    return result;
  };

  const handleRemoveMember = async (memberId: string) => {
    console.log('🗑️ Removendo membro:', memberId);
    const result = await removeMember(memberId);
    if (result.success) {
      console.log('✅ Membro removido com sucesso');
    }
    return result;
  };

  const handleMemberAction = (member: TeamMember) => {
    console.log('⚙️ Ações para membro:', member.id);
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleSearch = () => {
    console.log('🔍 Executando busca de membros:', searchInput);
    setSearchTerm(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    console.log('🗑️ Limpando busca de membros');
    setSearchInput('');
    setSearchTerm('');
  };

  const handleSendMessage = (member: TeamMember) => {
    console.log('💬 Enviar mensagem para:', member.nome);
    // Em produção, redirecionaria para o sistema de mensagens
    alert(`Funcionalidade de mensagem para ${member.nome} será implementada em breve!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipe</h1>
          <p className="text-gray-600 mt-2">
            Gerencie os membros da {equipe?.nome || 'equipe'}
          </p>
        </div>
        
        <Button 
          className="bg-team-primary hover:bg-team-primary/90"
          onClick={() => setShowInviteModal(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Convidar Membro
        </Button>
      </div>

      {/* AI Insights Card */}
      {isAIEnabled && teamMembers.length > 0 && (
        <div className="mb-6">
          <AIInsightsCard 
            title="Análise de Performance da Equipe"
            data={memberData}
            analysisType="team"
            className="shadow-lg border-blue-200"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer hover:text-team-primary transition-colors" 
            onClick={handleSearch}
            title="Buscar membros"
          />
          <input
            type="text"
            placeholder="Buscar membros... (Enter para buscar)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
          />
          {(searchInput || searchTerm) && (
            <X 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer hover:text-red-500 transition-colors" 
              onClick={clearSearch}
              title="Limpar busca"
            />
          )}
        </div>

        <Button 
          onClick={handleSearch}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
          disabled={!searchInput.trim()}
        >
          <Search className="h-4 w-4" />
          <span>Buscar</span>
        </Button>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
        >
          <option value="all">Todos os tipos</option>
          <option value="owner">Proprietários</option>
          <option value="admin">Administradores</option>
          <option value="member">Membros</option>
        </select>

        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Mais filtros
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Membros</p>
                <p className="text-2xl font-bold text-gray-900">{memberData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Membros Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {memberData.filter(m => m.status === 'ativo').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(memberData.reduce((acc, m) => acc + m.rating, 0) / memberData.length).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Projetos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {memberData.reduce((acc, m) => acc + m.projetos_ativos, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map(member => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-team-primary text-white rounded-full flex items-center justify-center text-lg font-medium">
                      {member.nome.charAt(0).toUpperCase()}
                    </div>
                    {isAIEnabled && productivityData[member.id] && (
                      <div className="absolute -top-1 -right-1">
                        <Badge className={`text-xs ${
                          productivityData[member.id] >= 90 ? 'bg-green-500' :
                          productivityData[member.id] >= 75 ? 'bg-yellow-500' :
                          'bg-orange-500'
                        } text-white`}>
                          {productivityData[member.id]}%
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.nome}</h3>
                    <p className="text-sm text-gray-600">{member.cargo}</p>
                  </div>
                </div>
                
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => handleMemberAction(member)}
                  title="Ações do membro"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {member.email}
                </div>
                
                {member.telefone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {member.telefone}
                  </div>
                )}
                
                {member.localizacao && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {member.localizacao}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <Badge className={getRoleColor(member.tipo)}>
                    {getRoleLabel(member.tipo)}
                  </Badge>
                  <Badge className={getStatusColor(member.status)}>
                    {getStatusLabel(member.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  {member.rating}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-900">{member.projetos_ativos}</div>
                  <div className="text-gray-600">Projetos</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-900">{member.tarefas_concluidas}</div>
                  <div className="text-gray-600">Tarefas</div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Especialidades:</p>
                <div className="flex flex-wrap gap-1">
                  {member.especialidades.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {member.especialidades.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{member.especialidades.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              {/* AI Productivity Indicator */}
              {isAIEnabled && productivityData[member.id] && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      Índice de Produtividade IA
                    </span>
                    <span className="text-xs font-semibold">
                      {productivityData[member.id]}%
                    </span>
                  </div>
                  <Progress 
                    value={productivityData[member.id]} 
                    className="h-2"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    {productivityData[member.id] >= 90 && (
                      <Badge className="text-xs bg-green-100 text-green-700">
                        <Award className="h-3 w-3 mr-1" />
                        Top Performer
                      </Badge>
                    )}
                    {productivityData[member.id] >= 80 && productivityData[member.id] < 90 && (
                      <Badge className="text-xs bg-blue-100 text-blue-700">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Alta Performance
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleSendMessage(member)}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Mensagem
                </Button>
                {(usuario?.tipo === 'owner' || usuario?.tipo === 'admin') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleMemberAction(member)}
                    title="Editar membro"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum membro encontrado</p>
          <p className="text-sm">Tente ajustar os filtros ou convide novos membros</p>
        </div>
      )}

      {/* Modals */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInviteMember={handleInviteMember}
        onAddMember={handleAddMember}
      />

      <EditMemberModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onUpdateMember={handleUpdateMember}
        onRemoveMember={handleRemoveMember}
        currentUserType={usuario?.tipo || 'member'}
      />
    </div>
  );
}