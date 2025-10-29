
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { LoginForm } from './auth/LoginForm';
import { Logo } from './Logo';
import { useAuthStore } from '@/store/authStore';

interface HeaderProps {}

export const Header = ({}: HeaderProps) => {
  const [showLogin, setShowLogin] = useState(false);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          <Logo />

          {!isAuthenticated && (
            <div className="flex items-center">
              <Dialog open={showLogin} onOpenChange={setShowLogin}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white min-h-[44px] px-6 text-base font-semibold"
                  >
                    Inloggen
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white mx-4 max-h-[90vh] overflow-y-auto">
                  <LoginForm onClose={() => setShowLogin(false)} />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
