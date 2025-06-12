
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';

export function Login() {
  const { usuario, login, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (usuario) {
      navigate('/dashboard');
    }
  }, [usuario, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(formData.email, formData.senha);
    } catch (err) {
      setError('Email ou senha incorretos');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-team-primary/10 via-white to-team-primary/5 flex flex-col justify-center items-center p-4">
      <div className="mb-8 flex justify-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-team-primary to-team-primary/80 flex items-center justify-center text-white shadow-lg">
          <Users className="h-8 w-8" />
        </div>
      </div>
      
      <h1 className="text-4xl font-bold tracking-tight mb-4 text-gray-900">
        Team Manager
      </h1>
      
      <p className="text-lg text-gray-600 mb-8 max-w-md text-center">
        Acesse a plataforma de gestão de equipe
      </p>
      
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-xl">Fazer Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                required
                className="focus:ring-team-primary focus:border-team-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  name="senha"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.senha}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className="focus:ring-team-primary focus:border-team-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-team-primary hover:bg-team-primary/90"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600 text-center">
              <p className="font-semibold mb-2">Usuários de teste:</p>
              <div className="space-y-1 text-xs">
                <p>ricardo@techsquad.com / senha123</p>
                <p>ana@techsquad.com / senha123</p>
                <p>carlos@techsquad.com / senha123</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
