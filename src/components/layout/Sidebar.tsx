import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  CheckSquare,
  Timeline,
  MessageSquare,
  BarChart3,
  Users,
  Settings,
  User
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Tarefas', href: '/tasks', icon: CheckSquare },
  { name: 'Timeline', href: '/timeline', icon: Timeline },
  { name: 'Mensagens', href: '/messages', icon: MessageSquare },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Equipe', href: '/team', icon: Users },
  { name: 'Perfil', href: '/profile', icon: User },
  { name: 'Configurações', href: '/settings', icon: Settings }
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg border-r border-gray-200 pt-16">
      <div className="flex flex-col h-full">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-team-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <item.icon
                  className={`
                    mr-3 flex-shrink-0 h-5 w-5
                    ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}
                  `}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Team Manager v1.0
          </div>
        </div>
      </div>
    </div>
  );
}