import { Navigate } from 'react-router-dom';

// Dashboard IA removido - funcionalidade não implementada
// Redirecionando para Dashboard padrão
export default function DashboardAI() {
  return <Navigate to="/dashboard" replace />;
}