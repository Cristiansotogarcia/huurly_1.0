
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

export const useBeheerderActions = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast({
        title: 'Uitgelogd',
        description: 'U bent succesvol uitgelogd.',
      });
    } catch (error) {
      logger.error('Logout failed:', error);
      toast({
        title: 'Fout bij uitloggen',
        description: 'Er is een fout opgetreden. Probeer het opnieuw.',
        variant: 'destructive',
      });
    }
  };

  // Placeholder for future admin actions
  const handleManageUsers = () => {
    logger.log('Navigate to user management page');
    // navigate('/admin/users');
  };

  return {
    handleLogout,
    handleManageUsers,
  };
};
