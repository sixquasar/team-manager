import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar fixa no topo */}
      <Navbar />
      
      {/* Container principal com padding-top para compensar navbar fixa */}
      <div className="pt-16">
        <div className="flex">
          <Sidebar />
          
          {/* Área de conteúdo principal */}
          <main className="flex-1 min-h-[calc(100vh-4rem)]">
            <div className="p-4 sm:p-6 lg:p-8 ml-0 lg:ml-64 transition-all duration-300">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}