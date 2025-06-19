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
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';

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
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Dados dos projetos reais baseados nos .docx
  const projects: Project[] = [
    {
      id: '1',
      nome: 'Sistema de Atendimento ao Cidadão de Palmas com IA',
      descricao: 'Sistema Integrado de Atendimento ao Cidadão com Inteligência Artificial para a Prefeitura Municipal de Palmas - TO. Automatizar 60% dos atendimentos municipais.',
      status: 'em_progresso',
      responsavel: 'Ricardo Landim',
      data_inicio: '2024-11-01',
      data_fim_prevista: '2025-09-01',
      progresso: 25,
      orcamento: 2400000,
      tecnologias: ['Python', 'LangChain', 'OpenAI GPT-4o', 'WhatsApp API', 'PostgreSQL', 'Kubernetes', 'AWS', 'Redis', 'N8N'],
      equipe: ['Ricardo Landim', 'Leonardo Candiani', 'Rodrigo Marochi'],
      kpis: {
        usuarios_meta: '350.000 habitantes',
        volume_meta: '1M mensagens/mês',
        economia: '30% custos operacionais',
        roi: '30% no primeiro ano',
        disponibilidade: '99.9%',
        satisfacao: '85% satisfação cidadã'
      }
    },
    {
      id: '2',
      nome: 'Automação Jocum com SDK e LLM',
      descricao: 'Agente automatizado para atendimento aos usuários da Jocum, utilizando diretamente SDKs dos principais LLMs (OpenAI, Anthropic Claude, Google Gemini).',
      status: 'em_progresso',
      responsavel: 'Leonardo Candiani',
      data_inicio: '2024-12-01',
      data_fim_prevista: '2025-06-01',
      progresso: 15,
      orcamento: 625000,
      tecnologias: ['Python', 'LangChain', 'OpenAI', 'Anthropic Claude', 'Google Gemini', 'WhatsApp API', 'VoIP', 'PostgreSQL', 'React', 'AWS/GCP'],
      equipe: ['Leonardo Candiani', 'Ricardo Landim', 'Rodrigo Marochi'],
      kpis: {
        volume_meta: '50.000 atendimentos/dia',
        disponibilidade: '99.9%',
        satisfacao: '85% satisfação',
        economia: '30% redução atendimentos manuais'
      }
    }
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projetos</h1>
          <p className="text-gray-600 mt-2">
            Acompanhe o progresso dos projetos da {equipe?.nome || 'equipe'} SixQuasar
          </p>
        </div>
        
        <Button className="bg-team-primary hover:bg-team-primary/90">
          <Folder className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {/* Projects Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Folder className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Projetos</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Progresso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'em_progresso').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Orçamento Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(projects.reduce((sum, p) => sum + p.orcamento, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 gap-6">
        {projects.map(project => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl text-gray-900 mb-2">
                    {project.nome}
                  </CardTitle>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {project.descricao}
                  </p>
                </div>
                <Badge className={getStatusColor(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Project Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Responsável</p>
                    <p className="text-sm font-medium">{project.responsavel}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Prazo</p>
                    <p className="text-sm font-medium">
                      {new Date(project.data_fim_prevista).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Orçamento</p>
                    <p className="text-sm font-medium">{formatCurrency(project.orcamento)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Progresso</p>
                    <p className="text-sm font-medium">{project.progresso}%</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progresso do Projeto</span>
                  <span className="text-sm text-gray-500">{project.progresso}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progresso)}`}
                    style={{ width: `${project.progresso}%` }}
                  ></div>
                </div>
              </div>

              {/* KPIs */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Metas e KPIs</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(project.kpis).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 capitalize">{key.replace('_', ' ')}</p>
                      <p className="text-sm font-medium text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technologies */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Tecnologias</p>
                <div className="flex flex-wrap gap-2">
                  {project.tecnologias.slice(0, 8).map((tech, index) => {
                    const IconComponent = getTechIcon(tech);
                    return (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <IconComponent className="h-3 w-3" />
                        <span>{tech}</span>
                      </Badge>
                    );
                  })}
                  {project.tecnologias.length > 8 && (
                    <Badge variant="secondary">
                      +{project.tecnologias.length - 8} mais
                    </Badge>
                  )}
                </div>
              </div>

              {/* Team */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Equipe</p>
                <div className="flex space-x-2">
                  {project.equipe.map((member, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                      <div className="w-6 h-6 bg-team-primary text-white rounded-full flex items-center justify-center text-xs">
                        {member.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-700">{member.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Ver Timeline
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Target className="h-3 w-3 mr-1" />
                  Ver Tarefas
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Relatórios
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}