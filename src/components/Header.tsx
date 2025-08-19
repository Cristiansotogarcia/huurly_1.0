
import { useState } from 'react';
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
    <header className="flex justify-between items-center">
      <Logo />
      {!isAuthenticated && (
        <>
          <Dialog open={showLogin} onOpenChange={setShowLogin}>
            <DialogTrigger asChild>
              <button
                onClick={() => setShowLogin(true)}
                className="bg-dutch-orange text-white px-4 py-2 rounded-md"
              >
                Login
              </button>
            </DialogTrigger>
            <DialogContent>
              <LoginForm />
            </DialogContent>
          </Dialog>
          <MultiStepSignupModal onShowSignup={onShowSignup} />
        </>
      )}
    </header>
  );
};
