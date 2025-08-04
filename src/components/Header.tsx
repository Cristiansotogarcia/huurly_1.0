
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
    <header>
      <Logo />
      {!isAuthenticated && (
        <>
          <Dialog open={showLogin} onOpenChange={setShowLogin}>
            <DialogTrigger asChild>
              <button onClick={() => setShowLogin(true)}>Login</button>
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
