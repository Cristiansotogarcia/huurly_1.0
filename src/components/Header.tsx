
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { LoginForm } from './auth/LoginForm';
import { Logo } from './Logo';
import { useAuthStore } from '@/store/authStore';

export const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <header className="w-full flex items-center justify-between px-4 py-4">
      <Logo />
      {!isAuthenticated && (
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
      )}
    </header>
  );
};
