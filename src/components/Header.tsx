
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { LoginForm } from './auth/LoginForm';
import { MultiStepSignupModal } from './modals/MultiStepSignupModal';
import { Logo } from './Logo';
import { useAuthStore } from '@/store/authStore';

interface HeaderProps {
  onShowSignup?: () => void;
}

export const Header = ({ onShowSignup }: HeaderProps) => {
  const [showLogin, setShowLogin] = useState(false);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />

          {!isAuthenticated && (
            <div className="flex items-center space-x-4">
              <Dialog open={showLogin} onOpenChange={setShowLogin}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    Inloggen
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
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
