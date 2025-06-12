
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserMenu } from './UserMenu';
import { CompanySelector } from './CompanySelector';
import { useAuth } from '@/contexts/AuthContextProprio';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Navbar = ({ sidebarOpen, setSidebarOpen }: NavbarProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const { usuario } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && searchOpen) {
        setSearchOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [searchOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-20 border-b border-amber-100 dark:border-amber-800 bg-white/70 dark:bg-amber-950/70 backdrop-blur-md">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          {!searchOpen && (
            <>
              <Link to="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-white font-bold">
                  H
                </div>
                <span className="font-semibold hidden md:block">HelioGen</span>
              </Link>
            </>
          )}
          
          {searchOpen ? (
            <div className="w-full mx-4 flex items-center gap-2">
              <Input
                placeholder="Pesquisar..."
                className="h-9"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {!searchOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          <div className="hidden lg:flex items-center bg-gray-100 dark:bg-amber-900/40 rounded-md px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <input
              placeholder="Pesquisar..."
              className="bg-transparent border-none outline-none text-sm w-40 placeholder:text-muted-foreground"
            />
          </div>

          {usuario && (
            <>
              <CompanySelector />
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </>
          )}
          
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
