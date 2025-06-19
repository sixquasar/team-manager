import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Folder,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  Target,
  Cpu,
  Zap,
  Globe,
  Brain,
  MessageSquare,
  Phone,
  Mail,
  Database,
  Cloud,
  Shield,
  Edit,
  Trash2,
  Eye,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { useProjects } from '@/hooks/use-projects';
import { NewProjectModal } from '@/components/projects/NewProjectModal';
import { ProjectDetailsModal } from '@/components/projects/ProjectDetailsModal';

interface Project {
  id: string;
  nome: string;
  descricao: string;
  status: 'planejamento' | 'em_progresso' | 'finalizado' | 'cancelado';
  responsavel: string;
  data_inicio: string;
  data_fim_prevista: string;
  progresso: number;
  orcamento: number;
  tecnologias: string[];
  equipe: string[];
  kpis: {
    usuarios_meta?: string;
    volume_meta?: string;
    economia?: string;
    roi?: string;
    disponibilidade?: string;
    satisfacao?: string;
  };
}

export function Projects() {
  const { equipe, usuario } = useAuth();
  const { loading, projects, refetch } = useProjects();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  // Debug: verificar dados do hook
  React.useEffect(() => {
    console.log('🔍 PROJECTS PAGE: Estado do hook');
    console.log('📊 Loading:', loading);
    console.log('📝 Projects array:', projects);
    console.log('🏢 Equipe:', equipe);
    console.log('👤 Usuario:', usuario);
  }, [loading, projects, equipe, usuario]);

  // Transformar dados do banco para interface local
  const projectsFormatted = projects.map(project => {
    // Mapear responsável baseado no responsavel_id
    let responsavelNome = 'Não atribuído';
    if (project.responsavel_id === '550e8400-e29b-41d4-a716-446655440001') {
      responsavelNome = 'Ricardo Landim';
    } else if (project.responsavel_id === '550e8400-e29b-41d4-a716-446655440002') {
      responsavelNome = 'Leonardo Candiani';
    } else if (project.responsavel_id === '550e8400-e29b-41d4-a716-446655440003') {
      responsavelNome = 'Rodrigo Marochi';
    }

    return {
      id: project.id,
      nome: project.nome,
      descricao: project.descricao || '',
      status: project.status,
      responsavel: responsavelNome,
      data_inicio: project.data_inicio || '',
      data_fim_prevista: project.data_fim_prevista || '',
      progresso: project.progresso || 0,
      orcamento: project.orcamento || 0,
      tecnologias: project.tecnologias || [],
      equipe: ['Ricardo Landim', 'Leonardo Candiani', 'Rodrigo Marochi'],
      kpis: {
        usuarios_meta: project.nome.includes('Palmas') ? '350.000 habitantes' : '50.000 usuários/dia',
        volume_meta: project.nome.includes('Palmas') ? '1M mensagens/mês' : '50.000 atendimentos/dia',
        economia: '30% custos operacionais',
        roi: project.nome.includes('Palmas') ? '30% no primeiro ano' : '25% no primeiro ano',
        disponibilidade: '99.9%',
        satisfacao: '85% satisfação'
      }
    };
  });

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planejamento': return 'bg-yellow-100 text-yellow-800';
      case 'em_progresso': return 'bg-blue-100 text-blue-800';
      case 'finalizado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Project['status']) => {
    switch (status) {
      case 'planejamento': return 'Planejamento';
      case 'em_progresso': return 'Em Progresso';
      case 'finalizado': return 'Finalizado';
      case 'cancelado': return 'Cancelado';
      default: return 'Desconhecido';
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

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTechIcon = (tech: string) => {
    const techLower = tech.toLowerCase();
    if (techLower.includes('openai') || techLower.includes('gpt') || techLower.includes('claude') || techLower.includes('gemini')) return Brain;
    if (techLower.includes('whatsapp') || techLower.includes('api')) return MessageSquare;
    if (techLower.includes('voip') || techLower.includes('phone')) return Phone;
    if (techLower.includes('postgresql') || techLower.includes('database')) return Database;
    if (techLower.includes('aws') || techLower.includes('gcp') || techLower.includes('cloud')) return Cloud;
    if (techLower.includes('kubernetes') || techLower.includes('docker')) return Cpu;
    if (techLower.includes('redis') || techLower.includes('cache')) return Zap;
    return Globe;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const calculateDaysRemaining = (endDate: string) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const totalBudget = projectsFormatted.reduce((acc, project) => acc + project.orcamento, 0);
  const averageProgress = projectsFormatted.length > 0 
    ? Math.round(projectsFormatted.reduce((acc, project) => acc + project.progresso, 0) / projectsFormatted.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projetos</h1>
          <p className="text-gray-600 mt-2">
            Acompanhe o progresso dos projetos da {equipe?.nome || 'SixQuasar'}
          </p>
        </div>
        
        <Button 
          className="bg-team-primary hover:bg-team-primary/90"
          onClick={() => setShowNewProject(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-team-primary"></div>
        </div>
      ) : (
        <>
          {/* Projects Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Folder className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Projetos</p>
                    <p className="text-2xl font-bold text-gray-900">{projectsFormatted.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Progresso Médio</p>
                    <p className="text-2xl font-bold text-gray-900">{averageProgress}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Orçamento Total</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Em Progresso</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {projectsFormatted.filter(p => p.status === 'em_progresso').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projectsFormatted.map(project => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{project.nome}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {project.descricao}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setShowProjectDetails(true);
                        }}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setShowProjectDetails(true);
                        }}
                        title="Editar projeto"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Status and Progress */}
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {project.progresso}% concluído
                    </span>
                  </div>

                  <Progress value={project.progresso} className="h-2" />

                  {/* Project Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Responsável:</span>
                      <p className="font-medium">{project.responsavel}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Orçamento:</span>
                      <p className="font-medium">{formatCurrency(project.orcamento)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Início:</span>
                      <p className="font-medium">{formatDate(project.data_inicio)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Previsão:</span>
                      <p className="font-medium">{formatDate(project.data_fim_prevista)}</p>
                    </div>
                  </div>

                  {/* Technologies */}
                  <div>
                    <span className="text-sm text-gray-500 mb-2 block">Tecnologias:</span>
                    <div className="flex flex-wrap gap-2">
                      {project.tecnologias.slice(0, 4).map((tech, index) => {
                        const IconComponent = getTechIcon(tech);
                        return (
                          <div key={index} className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                            <IconComponent className="h-3 w-3 mr-1" />
                            <span className="text-xs">{tech}</span>
                          </div>
                        );
                      })}
                      {project.tecnologias.length > 4 && (
                        <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-1">
                          +{project.tecnologias.length - 4} mais
                        </span>
                      )}
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="border-t pt-3">
                    <span className="text-sm text-gray-500 mb-2 block">KPIs:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Meta Usuários:</span>
                        <p className="font-medium">{project.kpis.usuarios_meta}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Volume:</span>
                        <p className="font-medium">{project.kpis.volume_meta}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">ROI:</span>
                        <p className="font-medium">{project.kpis.roi}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Disponibilidade:</span>
                        <p className="font-medium">{project.kpis.disponibilidade}</p>
                      </div>
                    </div>
                  </div>

                  {/* Days Remaining */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {calculateDaysRemaining(project.data_fim_prevista)} dias restantes
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      {project.equipe.length} membros
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {projectsFormatted.length === 0 && (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhum projeto encontrado</h3>
              <p className="text-gray-500 mb-4">Comece criando seu primeiro projeto.</p>
              <Button onClick={() => setShowNewProject(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Projeto
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <NewProjectModal
        isOpen={showNewProject}
        onClose={() => setShowNewProject(false)}
        onProjectCreated={() => {
          refetch();
          setShowNewProject(false);
        }}
      />

      <ProjectDetailsModal
        isOpen={showProjectDetails}
        onClose={() => {
          setShowProjectDetails(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onProjectUpdated={() => {
          refetch();
        }}
        onProjectDeleted={() => {
          refetch();
          setShowProjectDetails(false);
          setSelectedProject(null);
        }}
      />
    </div>
  );
}