import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Calendar,
  Target,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAI } from '@/contexts/AIContext';
import { toast } from '@/hooks/use-toast';

interface SprintPhase {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed';
  aiRecommendations?: string[];
  completedTasks?: number;
  totalTasks?: number;
}

export function SprintWorkflow() {
  const { isAIEnabled, analyzeProjects, analyzeTasks, predictNextAction } = useAI();
  const [currentPhase, setCurrentPhase] = useState<string>('planning');
  const [sprintGoal, setSprintGoal] = useState('');
  const [sprintDuration, setSprintDuration] = useState('2');
  const [teamCapacity, setTeamCapacity] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const phases: SprintPhase[] = [
    {
      id: 'planning',
      name: 'Sprint Planning',
      status: currentPhase === 'planning' ? 'active' : 
              ['daily', 'review', 'retrospective'].includes(currentPhase) ? 'completed' : 'pending',
      aiRecommendations: [
        'Definir objetivo claro e mensurável',
        'Estimar capacidade realista da equipe',
        'Priorizar tarefas por valor de negócio'
      ]
    },
    {
      id: 'daily',
      name: 'Daily Standups',
      status: currentPhase === 'daily' ? 'active' : 
              ['review', 'retrospective'].includes(currentPhase) ? 'completed' : 'pending',
      completedTasks: 12,
      totalTasks: 20
    },
    {
      id: 'review',
      name: 'Sprint Review',
      status: currentPhase === 'review' ? 'active' : 
              currentPhase === 'retrospective' ? 'completed' : 'pending'
    },
    {
      id: 'retrospective',
      name: 'Retrospectiva',
      status: currentPhase === 'retrospective' ? 'active' : 'pending'
    }
  ];

  const handlePhaseTransition = async (nextPhase: string) => {
    if (!isAIEnabled) {
      setCurrentPhase(nextPhase);
      return;
    }

    setIsProcessing(true);
    try {
      // Simular análise de IA para transição
      const prediction = await predictNextAction([
        { phase: currentPhase, timestamp: new Date() },
        { goal: sprintGoal, duration: sprintDuration }
      ]);

      toast({
        title: "Transição de Fase",
        description: `IA recomenda: ${prediction || 'Prosseguir para próxima fase'}`
      });

      setCurrentPhase(nextPhase);
    } catch (error) {
      toast({
        title: "Erro na transição",
        description: "Não foi possível processar com IA",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getPhaseIcon = (phaseId: string) => {
    switch (phaseId) {
      case 'planning': return Target;
      case 'daily': return Users;
      case 'review': return BarChart3;
      case 'retrospective': return MessageSquare;
      default: return Clock;
    }
  };

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 'planning':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Objetivo do Sprint</label>
              <Textarea
                value={sprintGoal}
                onChange={(e) => setSprintGoal(e.target.value)}
                placeholder="Ex: Implementar sistema de autenticação completo"
                className="w-full"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Duração (semanas)</label>
                <Input
                  type="number"
                  value={sprintDuration}
                  onChange={(e) => setSprintDuration(e.target.value)}
                  min="1"
                  max="4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Capacidade da Equipe (horas)</label>
                <Input
                  type="number"
                  value={teamCapacity}
                  onChange={(e) => setTeamCapacity(e.target.value)}
                  placeholder="Ex: 160"
                />
              </div>
            </div>
            {isAIEnabled && (
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-900 mb-2">Recomendações da IA:</p>
                      <ul className="space-y-1 text-sm text-purple-700">
                        <li>• Considere feriados no período: -16h de capacidade</li>
                        <li>• Histórico sugere 15% de buffer para imprevistos</li>
                        <li>• Velocidade média da equipe: 85% da capacidade nominal</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'daily':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progresso</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">60%</div>
                  <Progress value={60} className="mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Velocity</span>
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold">24 pts</div>
                  <p className="text-xs text-gray-500 mt-1">Média: 20 pts</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Bloqueios</span>
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-gray-500 mt-1">Requer atenção</p>
                </CardContent>
              </Card>
            </div>
            
            {isAIEnabled && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 mb-2">Insights do Daily:</p>
                      <ul className="space-y-1 text-sm text-blue-700">
                        <li>• Velocity 20% acima da média - equipe em alta performance</li>
                        <li>• 2 bloqueios técnicos podem impactar entrega final</li>
                        <li>• Sugestão: Pair programming para resolver bloqueios</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Entregáveis do Sprint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>Sistema de Login</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Entregue</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>API de Autenticação</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Entregue</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span>Testes E2E</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700">Parcial</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {isAIEnabled && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Brain className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900 mb-2">Análise de Entrega:</p>
                      <ul className="space-y-1 text-sm text-green-700">
                        <li>• 85% do objetivo do sprint foi alcançado</li>
                        <li>• Qualidade do código acima da média (score: 8.5/10)</li>
                        <li>• Débito técnico mínimo introduzido</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'retrospective':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg text-green-700">O que foi bem? 😊</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Comunicação clara durante dailies</li>
                    <li>• Entregas dentro do prazo</li>
                    <li>• Boa colaboração em pair programming</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-700">O que melhorar? 🤔</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Estimativas mais precisas</li>
                    <li>• Documentação durante desenvolvimento</li>
                    <li>• Resolver bloqueios mais rápido</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-700">Ações 🚀</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Planning poker para estimativas</li>
                    <li>• Doc-driven development</li>
                    <li>• SLA de 4h para bloqueios</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            {isAIEnabled && (
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-900 mb-2">Insights da Retrospectiva:</p>
                      <ul className="space-y-1 text-sm text-purple-700">
                        <li>• Padrão identificado: bloqueios sempre ocorrem em integrações</li>
                        <li>• Velocity aumentou 15% com pair programming</li>
                        <li>• Recomendação: Criar checklist de integração para próximo sprint</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          Sprint Workflow Inteligente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {phases.map((phase, index) => {
              const Icon = getPhaseIcon(phase.id);
              return (
                <div key={phase.id} className="flex items-center">
                  <div className={`flex flex-col items-center ${
                    phase.status === 'completed' ? 'text-green-600' :
                    phase.status === 'active' ? 'text-blue-600' :
                    'text-gray-400'
                  }`}>
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 ${
                      phase.status === 'completed' ? 'bg-green-100 border-green-600' :
                      phase.status === 'active' ? 'bg-blue-100 border-blue-600' :
                      'bg-gray-100 border-gray-300'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium">{phase.name}</span>
                  </div>
                  {index < phases.length - 1 && (
                    <ChevronRight className={`h-8 w-8 mx-4 ${
                      phases[index + 1].status !== 'pending' ? 'text-green-500' : 'text-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase Content */}
        <div className="mb-6">
          {renderPhaseContent()}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => {
              const currentIndex = phases.findIndex(p => p.id === currentPhase);
              if (currentIndex > 0) {
                handlePhaseTransition(phases[currentIndex - 1].id);
              }
            }}
            disabled={currentPhase === 'planning' || isProcessing}
          >
            Fase Anterior
          </Button>
          
          <div className="flex items-center gap-2">
            {isAIEnabled && (
              <Badge className="bg-purple-100 text-purple-700">
                <Brain className="h-3 w-3 mr-1" />
                IA Ativa
              </Badge>
            )}
          </div>
          
          <Button
            onClick={() => {
              const currentIndex = phases.findIndex(p => p.id === currentPhase);
              if (currentIndex < phases.length - 1) {
                handlePhaseTransition(phases[currentIndex + 1].id);
              }
            }}
            disabled={currentPhase === 'retrospective' || isProcessing}
            className="bg-team-primary hover:bg-team-primary/90"
          >
            {isProcessing ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Processando...
              </>
            ) : (
              <>
                Próxima Fase
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}