import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Users,
  Settings,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: Home,
    description: 'Visão geral da equipe'
  },
  { 
    name: 'Tarefas', 
    href: '/tasks', 
    icon: CheckSquare,
    description: 'Kanban e gestão de tarefas'
  },
  { 
    name: 'Timeline', 
    href: '/timeline', 
    icon: Calendar,
    description: 'Cronograma e marcos'
  },
  { 
    name: 'Mensagens', 
    href: '/messages', 
    icon: MessageSquare,
    description: 'Comunicação da equipe'
  },
  { 
    name: 'Relatórios', 
    href: '/reports', 
    icon: BarChart3,
    description: 'Análises e produtividade'
  },
  { 
    name: 'Equipe', 
    href: '/team', 
    icon: Users,
    description: 'Membros da equipe'
  }
];

const secondaryNavigation = [
  { 
    name: 'Perfil', 
    href: '/profile', 
    icon: User 
  },
  { 
    name: 'Configurações', 
    href: '/settings', 
    icon: Settings 
  }
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="bg-white w-64 min-h-screen border-r border-gray-200 flex flex-col">
      {/* Main Navigation */}
      <div className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group',
                  isActive
                    ? 'bg-team-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon 
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive 
                      ? 'text-white' 
                      : 'text-gray-400 group-hover:text-gray-500'
                  )} 
                />
                <div className="flex-1">
                  <div>{item.name}</div>
                  {!isActive && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </div>
                  )}
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Secondary Navigation */}
      <div className="border-t border-gray-200 p-4">
        <nav className="space-y-1">
          {secondaryNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Team Info */}
      <div className="border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500 mb-2">Equipe Atual</div>
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-1">
            <div className="w-6 h-6 bg-team-primary text-white rounded-full flex items-center justify-center text-xs">
              R
            </div>
            <div className="w-6 h-6 bg-team-secondary text-white rounded-full flex items-center justify-center text-xs">
              A
            </div>
            <div className="w-6 h-6 bg-team-accent text-white rounded-full flex items-center justify-center text-xs">
              C
            </div>
          </div>
          <div className="text-sm text-gray-700">3 membros</div>
        </div>
      </div>
    </div>
  );
}