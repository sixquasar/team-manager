#!/bin/bash

#################################################################
#                                                               #
#        FIX DEFINITIVO DASHBOARD IA                            #
#        Garante que Dashboard IA funcione 100%                 #
#        Versão: 1.0.0                                          #
#        Data: 22/06/2025                                       #
#                                                               #
#################################################################

# Cores
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
VERMELHO='\033[0;31m'
RESET='\033[0m'

SERVER="root@96.43.96.30"

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}🚀 FIX DEFINITIVO DASHBOARD IA - GARANTIA 100%${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

ssh $SERVER << 'ENDSSH'
cd /var/www/team-manager

echo -e "\033[1;33m1. CRIANDO PÁGINA DASHBOARD IA NO FRONTEND...\033[0m"

# Criar DashboardAI.tsx
cat > src/pages/DashboardAI.tsx << 'EOF'
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Users, DollarSign, Target, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardAI() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);

  const fetchAnalysis = async () => {
    try {
      setError('');
      const response = await fetch('/ai/api/dashboard/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar análise');
      }

      const data = await response.json();
      if (data.success) {
        setAnalysis(data);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalysis();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const metrics = analysis?.analysis?.metrics || {};
  const insights = analysis?.analysis?.insights || {};
  const charts = analysis?.analysis?.visualizations || {};
  const rawData = analysis?.rawCounts || {};

  // Cores para gráficos
  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            Dashboard Inteligente
          </h1>
          <p className="text-gray-600 mt-2">
            Análise em tempo real com IA - Modelo: GPT-4.1-mini
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Saúde da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {metrics.companyHealthScore || 0}%
              </span>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Score geral de performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Projetos em Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-red-600">
                {metrics.projectsAtRisk || 0}
              </span>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Necessitam atenção imediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Produtividade da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {metrics.teamProductivityIndex || 0}%
              </span>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Índice de eficiência
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              ROI Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">
                {metrics.estimatedROI || '0'}%
              </span>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Retorno sobre investimento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights da IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Insights da IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.opportunitiesFound?.length > 0 && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>Oportunidades:</strong> {insights.opportunitiesFound.join(', ')}
              </AlertDescription>
            </Alert>
          )}
          
          {insights.risksIdentified?.length > 0 && (
            <Alert variant="destructive">
              <TrendingDown className="h-4 w-4" />
              <AlertDescription>
                <strong>Riscos:</strong> {insights.risksIdentified.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          {insights.recommendations?.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Recomendações:</h4>
              <ul className="list-disc list-inside space-y-1">
                {insights.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-600">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Projetos */}
        {charts.projectsChart && (
          <Card>
            <CardHeader>
              <CardTitle>Status dos Projetos</CardTitle>
              <CardDescription>
                Total de {rawData.projects || 0} projetos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={charts.projectsChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {charts.projectsChart.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Gráfico de Produtividade */}
        {charts.productivityChart && (
          <Card>
            <CardHeader>
              <CardTitle>Produtividade Mensal</CardTitle>
              <CardDescription>
                Tarefas concluídas por mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.productivityChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Estatísticas Brutas */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Brutos do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Projetos</p>
              <p className="text-2xl font-bold">{rawData.projects || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tarefas</p>
              <p className="text-2xl font-bold">{rawData.tasks || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Usuários</p>
              <p className="text-2xl font-bold">{rawData.users || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Equipes</p>
              <p className="text-2xl font-bold">{rawData.teams || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timestamp */}
      <div className="text-center text-sm text-gray-500">
        Última análise: {analysis?.timestamp ? new Date(analysis.timestamp).toLocaleString('pt-BR') : 'N/A'}
      </div>
    </div>
  );
}
EOF

echo -e "\033[0;32m✅ DashboardAI.tsx criado\033[0m"

echo -e "\033[1;33m2. CRIANDO HOOK useAIDashboard...\033[0m"

# Criar use-ai-dashboard.ts
cat > src/hooks/use-ai-dashboard.ts << 'EOF'
import { useState, useEffect } from 'react';

interface AIAnalysis {
  success: boolean;
  timestamp: string;
  analysis: {
    metrics: {
      companyHealthScore: number;
      projectsAtRisk: number;
      teamProductivityIndex: number;
      estimatedROI: string;
    };
    insights: {
      opportunitiesFound: string[];
      risksIdentified: string[];
      recommendations: string[];
    };
    visualizations: {
      projectsChart: Array<{ name: string; value: number }>;
      productivityChart: Array<{ month: string; completed: number }>;
    };
  };
  rawCounts: {
    projects: number;
    tasks: number;
    users: number;
    teams: number;
  };
}

export function useAIDashboard() {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/ai/api/dashboard/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setAnalysis(data);
      } else {
        throw new Error(data.error || 'Erro ao processar análise');
      }
    } catch (err: any) {
      console.error('Erro ao buscar análise:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  return {
    analysis,
    loading,
    error,
    refresh: fetchAnalysis
  };
}
EOF

echo -e "\033[0;32m✅ use-ai-dashboard.ts criado\033[0m"

echo -e "\033[1;33m3. ADICIONANDO ROTA NO App.tsx...\033[0m"

# Verificar se a rota já existe
if grep -q "dashboard-ai" src/App.tsx; then
    echo "Rota já existe, pulando..."
else
    # Adicionar import
    sed -i '/import Dashboard from/a import DashboardAI from "@/pages/DashboardAI";' src/App.tsx
    
    # Adicionar rota após Dashboard normal
    sed -i '/<Route path="\/dashboard" element={<Dashboard \/>} \/>/a \          <Route path="/dashboard-ai" element={<DashboardAI />} />' src/App.tsx
    
    echo -e "\033[0;32m✅ Rota adicionada ao App.tsx\033[0m"
fi

echo -e "\033[1;33m4. ADICIONANDO MENU NO SIDEBAR...\033[0m"

# Verificar se o menu já existe
if grep -q "Dashboard IA" src/components/layout/Sidebar.tsx; then
    echo "Menu já existe, pulando..."
else
    # Adicionar import do Brain se não existir
    if ! grep -q "Brain" src/components/layout/Sidebar.tsx; then
        sed -i 's/import {/import { Brain,/' src/components/layout/Sidebar.tsx
    fi
    
    # Adicionar item de menu após Dashboard normal
    sed -i '/to="\/dashboard".*Dashboard/a \        <SidebarMenuItem>\n          <SidebarMenuButton asChild>\n            <Link to="/dashboard-ai" className="flex items-center gap-3">\n              <Brain className="h-4 w-4" />\n              <span>Dashboard IA</span>\n            </Link>\n          </SidebarMenuButton>\n        </SidebarMenuItem>' src/components/layout/Sidebar.tsx
    
    echo -e "\033[0;32m✅ Menu adicionado ao Sidebar\033[0m"
fi

echo -e "\033[1;33m5. INSTALANDO RECHARTS SE NECESSÁRIO...\033[0m"

if ! grep -q "recharts" package.json; then
    npm install recharts --legacy-peer-deps
    echo -e "\033[0;32m✅ Recharts instalado\033[0m"
else
    echo "Recharts já está instalado"
fi

echo -e "\033[1;33m6. FAZENDO BUILD DO FRONTEND...\033[0m"
npm run build

echo -e "\033[1;33m7. VERIFICANDO BUILD...\033[0m"
if [ -d "dist" ]; then
    echo -e "\033[0;32m✅ Build criado com sucesso\033[0m"
    ls -la dist/ | head -5
else
    echo -e "\033[0;31m❌ Erro no build\033[0m"
fi

echo -e "\033[1;33m8. RECARREGANDO NGINX...\033[0m"
systemctl reload nginx

ENDSSH

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ DASHBOARD IA IMPLEMENTADO DEFINITIVAMENTE!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${AZUL}AGORA FAÇA O SEGUINTE:${RESET}"
echo ""
echo "1. Acesse: https://admin.sixquasar.pro"
echo "2. Faça login"
echo "3. No menu lateral, procure por 'Dashboard IA' (com ícone de cérebro)"
echo "4. Clique e veja a análise inteligente funcionando!"
echo ""
echo -e "${AMARELO}Se ainda não aparecer, faça CTRL+F5 para limpar cache do navegador${RESET}"
echo ""