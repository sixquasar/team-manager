import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/contexts/AuthContextTeam';

export function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const { equipe } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-xl font-bold text-team-primary">
              Team Manager
            </div>
            {equipe && (
              <div className="ml-4 text-sm text-gray-600">
                {equipe.nome}
              </div>
            )}
          </div>

          {/* Center - Search */}
          <div className="hidden md:flex flex-1 items-center justify-center px-4 lg:px-8">
            <div className="w-full max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar tarefas, projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-team-primary focus:border-team-primary"
                />
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
            </button>

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}