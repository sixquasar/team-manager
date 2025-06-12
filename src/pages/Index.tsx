
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronRight, LayoutDashboard, LineChart, Search, Shield, Sun, Users, Zap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Announcement, AnnouncementTag, AnnouncementTitle } from '@/components/ui/announcement';
import { ArrowUpRightIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextProprio';

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { usuario } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-amber-900 dark:to-amber-950 flex flex-col justify-center items-center">
      {/* Announcement at the top of the page */}
      <div className="w-full flex justify-center py-4 px-4 bg-amber-100/50 dark:bg-amber-800/30 backdrop-blur-sm">
        <Announcement themed variant="success">
          <AnnouncementTag>Novidade</AnnouncementTag>
          <AnnouncementTitle>
            Sistema de monitoramento de inversores agora disponível!
            <ArrowUpRightIcon size={16} className="shrink-0 text-muted-foreground" />
          </AnnouncementTitle>
        </Announcement>
      </div>
      
      <div className="max-w-3xl mx-auto text-center px-4 py-8 md:py-16 animate-fade-in">
        <div className="mb-8 flex justify-center">
          <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-white font-bold text-xl md:text-2xl">
            H
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 md:mb-4">
          {usuario 
            ? `Bem-vindo, ${usuario.nome?.split(' ')[0] || 'ao HelioGen'}` 
            : 'Bem-vindo ao HelioGen'}
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
          Gestão completa para empresas de energia solar, desde a prospecção até a instalação e pós-venda em um único lugar.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8">
          {usuario ? (
            <Button size={isMobile ? "default" : "lg"} className="w-full sm:w-auto gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white" onClick={() => navigate('/dashboard')}>
              <LayoutDashboard className="h-4 w-4" />
              Acessar Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button size={isMobile ? "default" : "lg"} className="w-full sm:w-auto gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white" onClick={() => navigate('/login')}>
              <LayoutDashboard className="h-4 w-4" />
              Acessar Plataforma
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          
          <Button variant="outline" size={isMobile ? "default" : "lg"} className="w-full sm:w-auto gap-2 mt-2 sm:mt-0 border-amber-200 text-amber-700 hover:bg-amber-50" onClick={() => navigate('/marketplace')}>
            <Search className="h-4 w-4" />
            Explorar Marketplace
          </Button>
        </div>

        {usuario && (
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-10">
            <Button variant="secondary" size={isMobile ? "sm" : "default"} className="gap-2" onClick={() => navigate('/leads')}>
              <Users className="h-4 w-4" />
              Leads
            </Button>
            <Button variant="secondary" size={isMobile ? "sm" : "default"} className="gap-2" onClick={() => navigate('/proposals')}>
              <LineChart className="h-4 w-4" />
              Propostas
            </Button>
            <Button variant="secondary" size={isMobile ? "sm" : "default"} className="gap-2" onClick={() => navigate('/projects')}>
              <Sun className="h-4 w-4" />
              Projetos
            </Button>
            <Button variant="secondary" size={isMobile ? "sm" : "default"} className="gap-2" onClick={() => navigate('/installations')}>
              <Zap className="h-4 w-4" />
              Instalações
            </Button>
            <Button variant="secondary" size={isMobile ? "sm" : "default"} className="gap-2" onClick={() => navigate('/finance')}>
              <Shield className="h-4 w-4" />
              Financeiro
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
          <div className="bg-white dark:bg-amber-800/50 shadow-sm rounded-xl p-4 md:p-6 border border-amber-100 dark:border-amber-700/30 flex flex-col items-center text-center group hover:shadow-md transition-all">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3 md:mb-4 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <h3 className="text-base font-medium mb-1 md:mb-2">CRM Especializado</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Gerenciamento de leads e acompanhamento de clientes.</p>
          </div>
          
          <div className="bg-white dark:bg-amber-800/50 shadow-sm rounded-xl p-4 md:p-6 border border-amber-100 dark:border-amber-700/30 flex flex-col items-center text-center group hover:shadow-md transition-all">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 mb-3 md:mb-4 group-hover:scale-110 transition-transform">
              <LineChart className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <h3 className="text-base font-medium mb-1 md:mb-2">Propostas Inteligentes</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Simulações e orçamentos automáticos com IA.</p>
          </div>
          
          <div className="bg-white dark:bg-amber-800/50 shadow-sm rounded-xl p-4 md:p-6 border border-amber-100 dark:border-amber-700/30 flex flex-col items-center text-center group hover:shadow-md transition-all">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3 md:mb-4 group-hover:scale-110 transition-transform">
              <Sun className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <h3 className="text-base font-medium mb-1 md:mb-2">Gestão de Instalação</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Controle total do processo de implementação.</p>
          </div>
        </div>
      </div>
      
      {/* Seção de novidades e recursos recentes */}
      <div className="w-full max-w-3xl mx-auto mb-8">
        <h2 className="text-2xl font-bold text-center mb-6">Novidades na Plataforma</h2>
        <div className="bg-white dark:bg-amber-800/20 border border-amber-100 dark:border-amber-700/30 rounded-xl p-6 shadow-sm">
          <div className="space-y-4">
            <Announcement themed variant="success">
              <AnnouncementTag>Nova funcionalidade</AnnouncementTag>
              <AnnouncementTitle>
                Monitoramento de inversores em tempo real
                <ArrowUpRightIcon size={16} className="shrink-0 text-muted-foreground" />
              </AnnouncementTitle>
            </Announcement>
            
            <Announcement themed variant="secondary">
              <AnnouncementTag>Atualização</AnnouncementTag>
              <AnnouncementTitle>
                Integração com relatórios de manutenção preditiva
                <ArrowUpRightIcon size={16} className="shrink-0 text-muted-foreground" />
              </AnnouncementTitle>
            </Announcement>
            
            <Announcement>
              <AnnouncementTag>Em breve</AnnouncementTag>
              <AnnouncementTitle>
                Análise avançada de desempenho com inteligência artificial
                <ArrowUpRightIcon size={16} className="shrink-0 text-muted-foreground" />
              </AnnouncementTitle>
            </Announcement>
          </div>
        </div>
      </div>
      
      <div className="w-full border-t border-amber-200 dark:border-amber-800 py-4 md:py-6 bg-white/50 dark:bg-amber-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs md:text-sm text-muted-foreground">
            © 2025 HelioGen. Todos os direitos reservados.
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <a href="#" className="text-xs md:text-sm text-muted-foreground hover:text-foreground flex items-center">
              Sobre
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
            </a>
            <a href="#" className="text-xs md:text-sm text-muted-foreground hover:text-foreground flex items-center">
              Contato
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
            </a>
            <a href="#" className="text-xs md:text-sm text-muted-foreground hover:text-foreground flex items-center">
              Suporte
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
