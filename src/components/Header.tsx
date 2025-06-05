
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { LoginForm } from './auth/LoginForm';
import { SignupForm } from './auth/SignupForm';

export const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-dutch-blue to-dutch-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="ml-2 text-xl font-bold text-dutch-blue">Huurly</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Dialog open={showLogin} onOpenChange={setShowLogin}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="text-dutch-blue hover:text-dutch-orange">
                  Inloggen
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <LoginForm onClose={() => setShowLogin(false)} />
              </DialogContent>
            </Dialog>

            <Dialog open={showSignup} onOpenChange={setShowSignup}>
              <DialogTrigger asChild>
                <Button className="bg-dutch-orange hover:bg-orange-600 text-white">
                  Registreren
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <SignupForm onClose={() => setShowSignup(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </header>
  );
};
