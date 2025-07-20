
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { LoginForm } from './auth/LoginForm';
import { MultiStepSignupModal } from './auth/MultiStepSignupModal';
import { Logo } from './Logo';
import { useAuthStore } from '@/store/authStore';

interface HeaderProps {
  onShowSignup?: () => void;
}

export const Header = ({ onShowSignup }: HeaderProps) => {
  const [showLogin, setShowLogin] = useState(false);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      setShowLogin(false);
    }
  }, [isAuthenticated]);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />

          <div className="flex items-center space-x-2 sm:space-x-4">
            <Dialog open={showLogin} onOpenChange={setShowLogin}>
              <DialogTrigger asChild>
                <Button variant="default" className="bg-dutch-orange hover:bg-orange-600 text-white text-sm sm:text-base px-3 sm:px-4">
                  Inloggen
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <LoginForm onClose={() => setShowLogin(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </header>
  );
};
