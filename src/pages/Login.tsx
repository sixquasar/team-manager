
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContextProprio';

const Login = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario) {
      navigate('/dashboard');
    }
  }, [usuario, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-amber-950 dark:to-amber-900 flex flex-col justify-center items-center p-4">
      <div className="mb-8 flex justify-center">
        <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-white font-bold text-xl md:text-2xl">
          H
        </div>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 md:mb-4">
        HelioGen
      </h1>
      
      <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-md text-center">
        Acesse a plataforma completa para gestão de energia solar
      </p>
      
      <LoginForm />
    </div>
  );
};

export default Login;
