import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 ml-0 lg:ml-64 transition-all duration-300">
          <div className="lg:max-w-7xl mx-auto">
            {/* Espaçamento para o botão de menu mobile */}
            <div className="lg:hidden h-16"></div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}