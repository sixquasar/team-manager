import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContextTeam';
import { Layout } from '@/components/layout/Layout';

// Pages
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { Tasks } from '@/pages/Tasks';
import { Timeline } from '@/pages/Timeline';
import { Messages } from '@/pages/Messages';
import { Reports } from '@/pages/Reports';
import { Team } from '@/pages/Team';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-team-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

// Public Route Component (redirects if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-team-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Placeholder components for routes that don't exist yet
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="text-center py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600 mb-8">Esta página está em desenvolvimento.</p>
      <div className="bg-team-primary/10 border border-team-primary/20 rounded-lg p-8 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-team-primary mb-2">Em breve!</h3>
        <p className="text-sm text-gray-600">
          Estamos trabalhando para trazer esta funcionalidade para você.
        </p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
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
            <ComingSoon title="Perfil" />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <ComingSoon title="Configurações" />
          </ProtectedRoute>
        } 
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;