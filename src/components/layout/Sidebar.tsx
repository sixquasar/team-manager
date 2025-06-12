
import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  CreditCard, 
  FileText, 
  Home, 
  LucideIcon, 
  PackageOpen, 
  Settings, 
  SunMedium, 
  Users,
  Zap,
  Activity,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, href, isActive, isExpanded, onClick }: SidebarItemProps) => {
  const handleClick = () => {
    console.log(`Navigating to: ${href}`);
    if (onClick) onClick();
  };
  
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "apple-sidebar-item group",
        isExpanded ? "mx-3" : "mx-2 justify-center",
        isActive 
          ? "bg-primary/10 text-primary/90 font-medium" 
          : "text-foreground/60 hover:bg-secondary/80 hover:text-foreground/90"
      )}
    >
      <Icon className={cn("flex-shrink-0", isExpanded ? "h-[18px] w-[18px]" : "h-[18px] w-[18px]")} 
        strokeWidth={isActive ? 2.5 : 1.8} />
      {isExpanded && <span className="text-sm font-medium">{label}</span>}
      {!isExpanded && (
        <div className="absolute left-full ml-6 px-2 py-1 rounded-md bg-foreground/90 text-background text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none z-50 font-medium">
          {label}
        </div>
      )}
    </Link>
  );
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Fechar sidebar ao clicar fora dela em dispositivos móveis
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, sidebarOpen, setSidebarOpen]);
  
  const sidebarItems = [
    { icon: Home, label: 'Início', href: '/' },
    { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Leads', href: '/leads' },
    { icon: FileText, label: 'Propostas', href: '/proposals' },
    { icon: PackageOpen, label: 'Projetos', href: '/projects' },
    { icon: CreditCard, label: 'Financeiro', href: '/finance' },
    { icon: SunMedium, label: 'Instalações', href: '/installations' },
    { icon: Activity, label: 'Monitoramento', href: '/inverter-monitoring' },
    { icon: Zap, label: 'Marketplace', href: '/marketplace' },
    { icon: Settings, label: 'Configurações', href: '/settings' },
  ];

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Overlay para dispositivos móveis */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out transform bg-white/90 backdrop-blur-md border-r border-amber-100/60 dark:bg-amber-900/90 dark:border-amber-800/50",
          isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : (sidebarOpen ? "w-64" : "w-20"), 
          isMobile && "w-[80vw] max-w-[300px] shadow-xl"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-amber-100/60 dark:border-amber-800/50">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-white font-bold mr-2 shadow-sm">
              H
            </div>
            {(sidebarOpen || isMobile) && (
              <h1 className="text-lg font-semibold text-amber-900 dark:text-amber-100 tracking-tight animate-fade-in">
                Helio<span className="text-yellow-600 font-bold">Gen</span>
              </h1>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-1 py-4 overflow-y-auto h-[calc(100vh-4rem-5rem)]">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={location.pathname === item.href}
              isExpanded={sidebarOpen || isMobile}
              onClick={isMobile ? closeSidebar : undefined}
            />
          ))}
        </div>
        
        <div className="absolute bottom-5 left-0 right-0 mx-3">
          <div className={cn(
            "rounded-xl bg-amber-50/70 dark:bg-amber-800/30 p-3",
            !sidebarOpen && !isMobile && "p-2"
          )}>
            {(sidebarOpen || isMobile) ? (
              <div className="animate-fade-in">
                <h3 className="font-medium text-sm text-amber-900 dark:text-amber-400 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" strokeWidth={1.5} />
                  <span>Precisa de ajuda?</span>
                </h3>
                <p className="text-xs text-amber-700/90 dark:text-amber-300/90 mt-1.5 ml-6">Acesse nosso suporte para tirar dúvidas.</p>
                <Button variant="default" className="w-full mt-3 h-9 text-xs bg-amber-500/90 hover:bg-amber-500 hover:shadow-sm text-white rounded-xl transition-all duration-200">
                  Suporte
                </Button>
              </div>
            ) : (
              <div className="flex justify-center">
                <Button variant="default" size="icon" className="h-10 w-10 bg-amber-500/90 hover:bg-amber-500 hover:shadow-sm rounded-xl transition-all duration-200">
                  <HelpCircle className="h-5 w-5" strokeWidth={1.5} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
