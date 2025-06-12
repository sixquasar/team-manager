
import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DashboardView from '@/components/dashboard/DashboardView';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardProps {
  showSidebar?: boolean;
}

const Dashboard = ({ showSidebar = true }: DashboardProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  
  // Adjust sidebar when showSidebar prop changes or on mobile
  useEffect(() => {
    if (isMobile || !showSidebar) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile, showSidebar]);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-amber-50 to-white dark:from-amber-950 dark:to-amber-900">
      {showSidebar && <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main 
        className={`transition-all duration-300 ease-in-out pt-16 h-screen overflow-y-auto ${
          showSidebar && sidebarOpen && !isMobile ? 'ml-64' : 'ml-0'
        } ${showSidebar && !isMobile ? (sidebarOpen ? '' : 'ml-20') : ''}`}
        style={{ 
          paddingLeft: '1rem',
          paddingRight: '1rem',
          paddingBottom: '1.5rem'
        }}
      >
        <PageHeader 
          title="Dashboard" 
          description="Visão geral do seu negócio" 
          icon={BarChart3} 
        />
        
        <div className="mx-auto max-w-full">
          <DashboardView />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
