
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContextTeam';
import { User, Settings, LogOut, UserCircle } from 'lucide-react';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  if (!usuario) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
          Entrar
        </Button>
        <Button size="sm" onClick={() => navigate('/register')}>
          Registrar
        </Button>
      </div>
    );
  }

  // Gerar iniciais para o avatar
  const getInitials = () => {
    if (usuario?.nome) {
      const names = usuario.nome.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return usuario.nome.substring(0, 2).toUpperCase();
    }
    return usuario?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={usuario?.avatar_url || ''} alt={usuario?.nome || 'User'} />
            <AvatarFallback className="bg-amber-100 text-amber-800">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{usuario?.nome || 'Usuário'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {usuario?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <UserCircle className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          logout();
          setOpen(false);
          navigate('/');
        }}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
