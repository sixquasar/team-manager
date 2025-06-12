import React from 'react';
import { Bell, Search, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { Button } from '@/components/ui/button';
import { initials } from '@/lib/utils';

export function Navbar() {
  const { usuario, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-team-primary">Team Manager</h1>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar tarefas, mensagens..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-team-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-team-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                {usuario ? initials(usuario.nome) : 'TM'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">
                  {usuario?.nome || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500">
                  {usuario?.cargo || 'Membro da equipe'}
                </p>
              </div>
            </div>

            {/* User dropdown */}
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}