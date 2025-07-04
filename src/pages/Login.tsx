
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { validateEmail, sanitizeText } from '@/utils/validation';

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
    
    // Validação de email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Email inválido');
      return;
    }
    
    // Validação de senha (básica para login)
    if (!formData.senha) {
      setError('Senha é obrigatória');
      return;
    }
    
    if (formData.senha.length > 128) {
      setError('Senha muito longa');
      return;
    }
    
    try {
      const result = await login(emailValidation.sanitized, formData.senha);
      if (!result.success) {
        setError(result.error || 'Email ou senha incorretos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Sanitiza input conforme o campo
    let sanitizedValue = value;
    
    if (name === 'email') {
      // Remove espaços extras
      sanitizedValue = value.trim();
    } else if (name === 'senha') {
      // Senha não deve ser trimmed (espaços podem ser parte da senha)
      sanitizedValue = value;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
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
                <p>ricardo@sixquasar.pro / senha123 (Ricardo Landim)</p>
                <p>leonardo@sixquasar.pro / senha123 (Leonardo Candiani)</p>
                <p>rodrigo@sixquasar.pro / senha123 (Rodrigo Marochi)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
