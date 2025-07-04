import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContextTeam';
import { AIProvider } from '@/contexts/AIContext';
import { Layout } from '@/components/layout/Layout';
import { AIAssistantButton } from '@/components/ai/AIAssistantButton';

// Pages
import DashboardAI from '@/pages/DashboardAI';
import { Login } from '@/pages/Login';
import { Projects } from '@/pages/Projects';
import { Tasks } from '@/pages/Tasks';
import { Timeline } from '@/pages/Timeline';
import { Messages } from '@/pages/Messages';
import { Reports } from '@/pages/Reports';
import { Team } from '@/pages/Team';
import { Profile } from '@/pages/Profile';
import { Settings } from '@/pages/Settings';
import { SprintWorkflow } from '@/pages/SprintWorkflow';
import { CommunicationWorkflow } from '@/pages/CommunicationWorkflow';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-team-primary"></div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

// Coming Soon Component
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="text-6xl mb-4">🚧</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600">Esta página está em desenvolvimento</p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AIProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              } 
            />
            
            {/* Dashboard IA é o único dashboard agora */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardAI />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/tasks" 
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/timeline" 
              element={
                <ProtectedRoute>
                  <Timeline />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/team" 
              element={
                <ProtectedRoute>
                  <Team />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/sprint-workflow" 
              element={
                <ProtectedRoute>
                  <SprintWorkflow />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/communication-workflow" 
              element={
                <ProtectedRoute>
                  <CommunicationWorkflow />
                </ProtectedRoute>
              } 
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <AIAssistantButton />
        </Router>
      </AIProvider>
    </AuthProvider>
  );
}

export default App;