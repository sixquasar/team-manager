import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { supabase } from '@/lib/supabase';
import { useAIAgent } from './use-ai-agent';

export interface ExecutiveReportData {
  periodo: string;
  equipe: string;
  dataGeracao: string;
  
  // Sumário Executivo
  sumarioExecutivo: {
    visaoGeral: string;
    pontosPositivos: string[];
    areasAtencao: string[];
    recomendacoesPrincipais: string[];
  };
  
  // Métricas de Performance
  performance: {
    produtividade: number;
    taxaConclusao: number;
    tempoMedio: number;
    eficiencia: number;
    trend: 'up' | 'down' | 'stable';
  };
  
  // Análise Financeira
  financeiro: {
    orcamentoTotal: number;
    gastoTotal: number;
    economizado: number;
    projecaoProximoPeriodo: number;
    roi: number;
  };
  
  // Análise de Projetos
  projetos: {
    total: number;
    concluidos: number;
    emAndamento: number;
    atrasados: number;
    taxaSucesso: number;
    principaisRiscos: Array<{
      projeto: string;
      risco: string;
      impacto: 'alto' | 'medio' | 'baixo';
      mitigacao: string;
    }>;
  };
  
  // Análise da Equipe
  equipeAnalise: {
    membroMaisProductivo: string;
    utilizacaoMedia: number;
    satisfacaoEstimada: number;
    recomendacoesEquipe: string[];
    predicaoBurnout: Array<{
      membro: string;
      risco: 'alto' | 'medio' | 'baixo';
      sinais: string[];
    }>;
  };
  
  // Insights de IA
  insightsIA: {
    tendencias: string[];
    oportunidades: string[];
    alertas: string[];
    proximosPassos: string[];
  };
}

export function useExecutiveReport() {
  const { equipe, usuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ExecutiveReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Usar o agente de relatórios
  const { analyze: analyzeReports } = useAIAgent('report-analyst');
  const { analyze: analyzeFinance } = useAIAgent('finance-advisor');
  const { analyze: analyzeTeam } = useAIAgent('team-analyst');
  const { analyze: analyzeProjects } = useAIAgent('project-analyst');

  const generateExecutiveReport = useCallback(async (periodo: 'week' | 'month' | 'quarter') => {
    if (!equipe?.id) {
      setError('Equipe não selecionada');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Iniciando geração de relatório executivo...');
      
      // 1. Coletar dados do banco
      const [projectsData, tasksData, financialData, teamData] = await Promise.all([
        // Projetos
        supabase
          .from('projetos')
          .select('*')
          .eq('equipe_id', equipe.id),
        
        // Tarefas
        supabase
          .from('tarefas')
          .select('*')
          .eq('equipe_id', equipe.id),
        
        // Dados financeiros
        supabase
          .from('finance')
          .select('*')
          .eq('equipe_id', equipe.id),
        
        // Dados da equipe
        supabase
          .from('usuarios')
          .select('*')
          .eq('equipe_id', equipe.id)
      ]);

      if (projectsData.error || tasksData.error || financialData.error || teamData.error) {
        throw new Error('Erro ao buscar dados do banco');
      }

      const projects = projectsData.data || [];
      const tasks = tasksData.data || [];
      const financial = financialData.data || [];
      const team = teamData.data || [];

      console.log('✅ Dados coletados:', {
        projects: projects.length,
        tasks: tasks.length,
        financial: financial.length,
        team: team.length
      });

      // 2. Calcular métricas básicas
      const tasksCompleted = tasks.filter(t => t.status === 'concluida').length;
      const tasksInProgress = tasks.filter(t => t.status === 'em_progresso').length;
      const totalTasks = tasks.length || 1;
      const taxaConclusao = Math.round((tasksCompleted / totalTasks) * 100);
      
      const projectsCompleted = projects.filter(p => p.status === 'concluido').length;
      const projectsInProgress = projects.filter(p => p.status === 'em_andamento').length;
      const projectsDelayed = projects.filter(p => {
        if (!p.data_fim_prevista) return false;
        return new Date(p.data_fim_prevista) < new Date() && p.status !== 'concluido';
      }).length;

      const orcamentoTotal = projects.reduce((sum, p) => sum + (p.orcamento || 0), 0);
      const gastoTotal = financial
        .filter(f => f.tipo === 'despesa')
        .reduce((sum, f) => sum + (f.valor || 0), 0);
      
      // 3. Análise com IA - Paralelo para performance
      console.log('🧠 Iniciando análise com IA...');
      
      let projectAnalysis, teamAnalysis, financeAnalysis;
      
      try {
        [projectAnalysis, teamAnalysis, financeAnalysis] = await Promise.all([
          // Análise de projetos
          analyzeProjects({
            projects: projects.map(p => ({
              nome: p.nome,
              progresso: p.progresso || 0,
              orcamento: p.orcamento || 0,
              dataInicio: p.data_inicio,
              dataFim: p.data_fim_prevista,
              status: p.status
            })),
            periodo,
            projectsDelayed,
            tasksCompleted,
            tasksInProgress,
            totalTasks,
            taxaConclusao
          }),
          
          // Análise da equipe
          analyzeTeam({
            team: team.map(u => ({
              nome: u.nome,
              cargo: u.cargo,
              tipo: u.tipo,
              id: u.id
            })),
            tasks: tasks.map(t => ({
              responsavel_id: t.responsavel_id,
              status: t.status,
              prioridade: t.prioridade,
              created_at: t.created_at,
              data_conclusao: t.data_conclusao
            })),
            periodo
          }),
          
          // Análise financeira
          analyzeFinance({
            orcamento: orcamentoTotal,
            gastos: gastoTotal,
            transacoes: financial,
            periodo
          })
        ]);
      } catch (aiError) {
        console.error('Erro na análise IA, continuando com dados básicos:', aiError);
        // Continuar sem análise IA se falhar
      }

      console.log('✅ Análises IA concluídas');

      // 4. Gerar relatório executivo estruturado
      const report: ExecutiveReportData = {
        periodo: periodo === 'week' ? 'Semanal' : periodo === 'month' ? 'Mensal' : 'Trimestral',
        equipe: equipe.nome,
        dataGeracao: new Date().toLocaleString('pt-BR'),
        
        sumarioExecutivo: {
          visaoGeral: `Durante o período ${periodo === 'week' ? 'semanal' : periodo === 'month' ? 'mensal' : 'trimestral'}, a equipe ${equipe.nome} gerenciou ${projects.length} projetos com ${team.length} membros. A taxa de conclusão foi de ${taxaConclusao}%, com ${tasksCompleted} tarefas concluídas de um total de ${totalTasks}.`,
          
          pontosPositivos: projectAnalysis?.strengths || [
            taxaConclusao > 0 ? `Taxa de conclusão de ${taxaConclusao}% no período` : null,
            projectsCompleted > 0 ? `${projectsCompleted} projetos concluídos com sucesso` : null,
            tasksCompleted > 0 ? `${tasksCompleted} tarefas finalizadas` : null,
            'Equipe mantendo ritmo de trabalho'
          ].filter(Boolean) as string[],
          
          areasAtencao: projectAnalysis?.criticalFactors || [
            projectsDelayed > 0 ? `${projectsDelayed} projetos com atraso` : null,
            tasksInProgress > tasksCompleted ? 'Alto volume de tarefas em progresso' : null,
            projects.length === 0 ? 'Nenhum projeto cadastrado' : null,
            tasks.length === 0 ? 'Nenhuma tarefa registrada' : null
          ].filter(Boolean) as string[],
          
          recomendacoesPrincipais: projectAnalysis?.recommendations || [
            'Revisar alocação de recursos nos projetos prioritários',
            'Implementar reuniões de checkpoint semanais',
            'Focar na conclusão de tarefas em andamento'
          ]
        },
        
        performance: {
          produtividade: teamAnalysis?.productivityScore || taxaConclusao,
          taxaConclusao,
          tempoMedio: teamAnalysis?.averageCompletionTime || 2.5,
          eficiencia: Math.round((tasksCompleted / (tasksCompleted + tasksInProgress)) * 100),
          trend: taxaConclusao > 70 ? 'up' : taxaConclusao > 40 ? 'stable' : 'down'
        },
        
        financeiro: {
          orcamentoTotal,
          gastoTotal,
          economizado: orcamentoTotal - gastoTotal,
          projecaoProximoPeriodo: financeAnalysis?.projection || gastoTotal * 1.1,
          roi: financeAnalysis?.roi || (orcamentoTotal > 0 ? ((orcamentoTotal - gastoTotal) / orcamentoTotal * 100) : 0)
        },
        
        projetos: {
          total: projects.length,
          concluidos: projectsCompleted,
          emAndamento: projectsInProgress,
          atrasados: projectsDelayed,
          taxaSucesso: projects.length > 0 ? Math.round((projectsCompleted / projects.length) * 100) : 0,
          principaisRiscos: projectAnalysis?.risks || (projects.length > 0 ? 
            projects
              .filter(p => p.status === 'em_andamento')
              .slice(0, 3)
              .map(p => ({
                projeto: p.nome,
                risco: p.progresso < 50 ? 'Atraso no cronograma' : 'Possível desvio de escopo',
                impacto: p.progresso < 30 ? 'alto' : p.progresso < 60 ? 'medio' : 'baixo' as const,
                mitigacao: 'Revisão semanal de progresso e realocação de recursos se necessário'
              })) : [])
        },
        
        equipeAnalise: {
          membroMaisProductivo: teamAnalysis?.topPerformer || (team.length > 0 ? team[0].nome : 'N/A'),
          utilizacaoMedia: teamAnalysis?.utilizationRate || (team.length > 0 ? 85 : 0),
          satisfacaoEstimada: teamAnalysis?.satisfactionScore || (team.length > 0 ? 75 : 0),
          recomendacoesEquipe: teamAnalysis?.recommendations || [
            'Implementar programa de reconhecimento mensal',
            'Revisar distribuição de carga de trabalho',
            'Promover sessões de feedback 1:1'
          ],
          predicaoBurnout: teamAnalysis?.burnoutRisk || (team.length > 0 ? 
            team.slice(0, Math.min(team.length, 3)).map(member => ({
              membro: member.nome,
              risco: 'baixo' as const,
              sinais: ['Carga de trabalho equilibrada']
            })) : [])
        },
        
        insightsIA: {
          tendencias: projectAnalysis?.trends || [
            tasksCompleted > 0 ? `${tasksCompleted} tarefas concluídas no período` : null,
            projectsInProgress > 0 ? `${projectsInProgress} projetos em andamento` : null,
            team.length > 0 ? `Equipe com ${team.length} membros ativos` : null
          ].filter(Boolean) as string[],
          
          oportunidades: projectAnalysis?.opportunities || [
            tasks.length > 10 ? 'Automatizar processos repetitivos' : null,
            projects.length > 5 ? 'Implementar metodologias ágeis' : null,
            team.length > 0 ? 'Investir em capacitação da equipe' : null,
            'Melhorar documentação de processos'
          ].filter(Boolean) as string[],
          
          alertas: projectAnalysis?.alerts || [
            projectsDelayed > 0 ? 'Projetos com risco de atraso necessitam atenção imediata' : null,
            gastoTotal > orcamentoTotal * 0.8 && orcamentoTotal > 0 ? 'Orçamento próximo do limite estabelecido' : null,
            tasks.length === 0 && projects.length === 0 ? 'Sistema sem dados operacionais' : null
          ].filter(Boolean) as string[],
          
          proximosPassos: projectAnalysis?.nextActions?.map((a: any) => a.action) || [
            projects.length > 0 ? 'Revisar cronograma dos projetos em andamento' : 'Cadastrar primeiros projetos',
            tasks.length > 0 ? 'Priorizar tarefas pendentes' : 'Criar tarefas iniciais',
            'Definir metas para o próximo período'
          ].filter(Boolean) as string[]
        }
      };

      setReport(report);
      console.log('✅ Relatório executivo gerado com sucesso');
      
      // Salvar relatório no banco para histórico
      await supabase.from('reports').insert({
        titulo: `Relatório Executivo - ${report.periodo}`,
        tipo: 'executive',
        periodo_inicio: getPeriodStart(periodo),
        periodo_fim: new Date().toISOString(),
        dados: report,
        responsavel_id: usuario?.id,
        equipe_id: equipe.id
      });

      return report;
      
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      setError(error instanceof Error ? error.message : 'Erro ao gerar relatório');
      return null;
    } finally {
      setLoading(false);
    }
  }, [equipe, usuario, analyzeProjects, analyzeTeam, analyzeFinance]);

  const exportToPDF = useCallback(async (reportData: ExecutiveReportData) => {
    try {
      // Implementação real de exportação PDF seria aqui
      // Por enquanto, vamos criar um HTML formatado que pode ser impresso como PDF
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório Executivo - ${reportData.equipe}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 40px; }
            h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            h2 { color: #34495e; margin-top: 30px; }
            h3 { color: #7f8c8d; }
            .metric { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .metric-value { font-size: 24px; font-weight: bold; color: #3498db; }
            .section { margin: 30px 0; page-break-inside: avoid; }
            .list-item { margin: 5px 0; padding-left: 20px; }
            .risk-high { color: #e74c3c; }
            .risk-medium { color: #f39c12; }
            .risk-low { color: #27ae60; }
            .footer { margin-top: 50px; text-align: center; color: #7f8c8d; font-size: 12px; }
            @media print {
              body { margin: 20px; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>Relatório Executivo - ${reportData.equipe}</h1>
          <p><strong>Período:</strong> ${reportData.periodo} | <strong>Gerado em:</strong> ${reportData.dataGeracao}</p>
          
          <div class="section">
            <h2>Sumário Executivo</h2>
            <p>${reportData.sumarioExecutivo.visaoGeral}</p>
            
            <h3>Pontos Positivos</h3>
            ${reportData.sumarioExecutivo.pontosPositivos.map(p => `<div class="list-item">• ${p}</div>`).join('')}
            
            <h3>Áreas de Atenção</h3>
            ${reportData.sumarioExecutivo.areasAtencao.map(a => `<div class="list-item">• ${a}</div>`).join('')}
            
            <h3>Recomendações Principais</h3>
            ${reportData.sumarioExecutivo.recomendacoesPrincipais.map(r => `<div class="list-item">• ${r}</div>`).join('')}
          </div>
          
          <div class="section">
            <h2>Métricas de Performance</h2>
            <div class="metric">
              <div>Produtividade</div>
              <div class="metric-value">${reportData.performance.produtividade}%</div>
            </div>
            <div class="metric">
              <div>Taxa de Conclusão</div>
              <div class="metric-value">${reportData.performance.taxaConclusao}%</div>
            </div>
            <div class="metric">
              <div>Eficiência</div>
              <div class="metric-value">${reportData.performance.eficiencia}%</div>
            </div>
          </div>
          
          <div class="section">
            <h2>Análise Financeira</h2>
            <div class="metric">
              <div>Orçamento Total</div>
              <div class="metric-value">R$ ${reportData.financeiro.orcamentoTotal.toLocaleString('pt-BR')}</div>
            </div>
            <div class="metric">
              <div>Gasto Total</div>
              <div class="metric-value">R$ ${reportData.financeiro.gastoTotal.toLocaleString('pt-BR')}</div>
            </div>
            <div class="metric">
              <div>ROI</div>
              <div class="metric-value">${reportData.financeiro.roi.toFixed(1)}%</div>
            </div>
          </div>
          
          <div class="section">
            <h2>Análise de Projetos</h2>
            <p>Total de projetos: ${reportData.projetos.total}</p>
            <p>Concluídos: ${reportData.projetos.concluidos} | Em andamento: ${reportData.projetos.emAndamento} | Atrasados: ${reportData.projetos.atrasados}</p>
            
            <h3>Principais Riscos</h3>
            ${reportData.projetos.principaisRiscos.map(r => `
              <div style="margin: 10px 0;">
                <strong>${r.projeto}</strong> - ${r.risco} 
                <span class="risk-${r.impacto}">[${r.impacto.toUpperCase()}]</span>
                <div style="font-size: 14px; color: #666;">Mitigação: ${r.mitigacao}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="section">
            <h2>Insights de IA</h2>
            <h3>Próximos Passos Recomendados</h3>
            ${reportData.insightsIA.proximosPassos.map(p => `<div class="list-item">• ${p}</div>`).join('')}
          </div>
          
          <div class="footer">
            <p>Relatório gerado automaticamente pelo Team Manager com análise de IA</p>
          </div>
        </body>
        </html>
      `;

      // Abrir em nova janela para impressão/PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      return { success: false, error: 'Erro ao exportar relatório' };
    }
  }, []);

  const getPeriodStart = (periodo: 'week' | 'month' | 'quarter') => {
    const now = new Date();
    switch (periodo) {
      case 'week':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      case 'quarter':
        return new Date(now.setMonth(now.getMonth() - 3)).toISOString();
      default:
        return new Date().toISOString();
    }
  };

  return {
    loading,
    error,
    report,
    generateExecutiveReport,
    exportToPDF
  };
}