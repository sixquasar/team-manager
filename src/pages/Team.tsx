import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Award,
  Clock,
  CheckCircle2,
  TrendingUp,
  UserPlus,
  Settings,
  Shield,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';

interface TeamMember {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  tipo: 'owner' | 'admin' | 'member';
  avatar_url?: string;
  telefone?: string;
  localizacao?: string;
  data_entrada: string;
  ultimo_acesso: string;
  status: 'online' | 'away' | 'offline';
  estatisticas: {
    tarefas_concluidas: number;
    horas_trabalhadas: number;
    projetos_ativos: number;
    eficiencia: number;
  };
  skills: string[];
}

const statusConfig = {
  online: { label: 'Online', color: 'bg-green-500', textColor: 'text-green-600' },
  away: { label: 'Ausente', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  offline: { label: 'Offline', color: 'bg-gray-500', textColor: 'text-gray-600' }
};

const typeConfig = {
  owner: { label: 'Proprietário', icon: Star, color: 'text-purple-600' },
  admin: { label: 'Administrador', icon: Shield, color: 'text-blue-600' },
  member: { label: 'Membro', icon: Users, color: 'text-gray-600' }
};

export function Team() {
  const { equipe, usuario } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Mock data - em produção viria do hook useTeam
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      nome: 'Ricardo Landim',
      email: 'ricardo@techsquad.com',
      cargo: 'Tech Lead',
      tipo: 'owner',
      telefone: '+55 11 99999-9999',
      localizacao: 'São Paulo, SP',
      data_entrada: '2024-01-15',
      ultimo_acesso: '2024-11-06T14:30:00Z',
      status: 'online',
      estatisticas: {
        tarefas_concluidas: 18,
        horas_trabalhadas: 156,
        projetos_ativos: 3,
        eficiencia: 94
      },
      skills: ['React', 'TypeScript', 'Node.js', 'Leadership']
    },
    {
      id: '2',
      nome: 'Ana Silva',
      email: 'ana@techsquad.com',
      cargo: 'UX/UI Designer',
      tipo: 'admin',
      telefone: '+55 11 88888-8888',
      localizacao: 'São Paulo, SP',
      data_entrada: '2024-02-01',
      ultimo_acesso: '2024-11-06T13:45:00Z',
      status: 'online',
      estatisticas: {
        tarefas_concluidas: 15,
        horas_trabalhadas: 142,
        projetos_ativos: 2,
        eficiencia: 88
      },
      skills: ['Figma', 'Adobe Creative', 'Prototyping', 'User Research']
    },
    {
      id: '3',
      nome: 'Carlos Santos',
      email: 'carlos@techsquad.com',
      cargo: 'Full Stack Developer',
      tipo: 'member',
      telefone: '+55 11 77777-7777',
      localizacao: 'Rio de Janeiro, RJ',
      data_entrada: '2024-03-01',
      ultimo_acesso: '2024-11-06T10:20:00Z',
      status: 'away',
      estatisticas: {
        tarefas_concluidas: 14,
        horas_trabalhadas: 138,
        projetos_ativos: 2,
        eficiencia: 91
      },
      skills: ['JavaScript', 'Python', 'Vue.js', 'PostgreSQL']
    }
  ];

  const filteredMembers = teamMembers.filter(member =>
    member.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastAccess = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Agora há pouco';
    if (diffHours < 24) return `${diffHours}h atrás`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const MemberCard = ({ member }: { member: TeamMember }) => {
    const statusInfo = statusConfig[member.status];
    const typeInfo = typeConfig[member.tipo];
    const TypeIcon = typeInfo.icon;

    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedMember(member)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 bg-team-primary text-white rounded-full flex items-center justify-center text-lg font-semibold">
                  {member.nome.charAt(0).toUpperCase()}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusInfo.color} rounded-full border-2 border-white`}></div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">{member.nome}</h3>
                  <TypeIcon className={`h-4 w-4 ${typeInfo.color}`} />
                </div>
                <p className="text-sm text-gray-600">{member.cargo}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
                
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span className={`flex items-center ${statusInfo.textColor}`}>
                    <div className={`w-2 h-2 ${statusInfo.color} rounded-full mr-1`}></div>
                    {statusInfo.label}
                  </span>
                  <span>Último acesso: {formatLastAccess(member.ultimo_acesso)}</span>
                </div>
              </div>
            </div>

            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">{member.estatisticas.tarefas_concluidas}</p>
              <p className="text-xs text-gray-500">Tarefas</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">{member.estatisticas.horas_trabalhadas}h</p>
              <p className="text-xs text-gray-500">Horas</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">{member.estatisticas.projetos_ativos}</p>
              <p className="text-xs text-gray-500">Projetos</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-green-600">{member.estatisticas.eficiencia}%</p>
              <p className="text-xs text-gray-500">Eficiência</p>
            </div>
          </div>

          {/* Skills */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-1">
              {member.skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                  {skill}
                </span>
              ))}
              {member.skills.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-xs text-gray-500 rounded">
                  +{member.skills.length - 3} mais
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const MemberDetailModal = ({ member }: { member: TeamMember }) => {
    if (!member) return null;

    const statusInfo = statusConfig[member.status];
    const typeInfo = typeConfig[member.tipo];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedMember(null)}>
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-team-primary text-white rounded-full flex items-center justify-center text-xl font-semibold">
                  {member.nome.charAt(0).toUpperCase()}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${statusInfo.color} rounded-full border-2 border-white`}></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{member.nome}</h2>
                <p className="text-gray-600">{member.cargo}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.textColor} bg-gray-100 mt-1`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setSelectedMember(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{member.email}</span>
                </div>
                {member.telefone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{member.telefone}</span>
                  </div>
                )}
                {member.localizacao && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{member.localizacao}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Membro desde {new Date(member.data_entrada).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tarefas Concluídas</span>
                  <span className="font-medium">{member.estatisticas.tarefas_concluidas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Horas Trabalhadas</span>
                  <span className="font-medium">{member.estatisticas.horas_trabalhadas}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Projetos Ativos</span>
                  <span className="font-medium">{member.estatisticas.projetos_ativos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Eficiência</span>
                  <span className="font-medium text-green-600">{member.estatisticas.eficiencia}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Habilidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-team-primary/10 text-team-primary text-sm rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              Enviar Mensagem
            </button>
            <button className="px-4 py-2 bg-team-primary text-white rounded-lg hover:bg-team-primary/90">
              Ver Tarefas
            </button>
          </div>
        </div>
      </div>
    );
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
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowInviteModal(true)}
            className="flex items-center px-4 py-2 bg-team-primary text-white rounded-lg hover:bg-team-primary/90 transition-colors"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Convidar Membro
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar membros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
          />
        </div>

        <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Membros</p>
                <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Membros Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teamMembers.filter(m => m.status === 'online' || m.status === 'away').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Horas Trabalhadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teamMembers.reduce((total, member) => total + member.estatisticas.horas_trabalhadas, 0)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Eficiência Média</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(teamMembers.reduce((total, member) => total + member.estatisticas.eficiencia, 0) / teamMembers.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMembers.map(member => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum membro encontrado</p>
          <p className="text-sm">Tente ajustar os filtros de busca</p>
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && <MemberDetailModal member={selectedMember} />}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Convidar Novo Membro</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <input
                  type="text"
                  placeholder="Ex: Desenvolvedor Frontend"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Acesso</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent">
                  <option value="member">Membro</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button className="px-4 py-2 bg-team-primary text-white rounded-lg hover:bg-team-primary/90">
                Enviar Convite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}