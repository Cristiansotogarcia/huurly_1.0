
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { LoginForm } from './auth/LoginForm';
import { MultiStepSignupModal } from '@/components/modals/MultiStepSignupModal';
import { Logo } from './Logo';

interface HeaderProps {
  onShowSignup?: () => void;
}

export const Header = ({ onShowSignup }: HeaderProps) => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />

          <div className="flex items-center space-x-4">
            <Dialog open={showLogin} onOpenChange={setShowLogin}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="text-dutch-blue hover:text-dutch-orange hover:bg-gray-50">
                  Inloggen
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <LoginForm onClose={() => setShowLogin(false)} />
              </DialogContent>
            </Dialog>

            <Button 
              className="bg-dutch-orange hover:bg-orange-600 text-white"
              onClick={onShowSignup}
            >
              Registreren
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
