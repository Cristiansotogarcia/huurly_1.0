import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { User } from '@/types';

export const useHuurderActions = (user?: User) => {
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

  const handleSettings = () => {
    logger.info('Navigate to settings page');
    navigate('/settings');
  };

  const onStartSearch = () => {
    logger.info('Navigate to search page');
    navigate('/zoeken');
  };

  const handleReportIssue = () => {
    logger.info('Report issue');
    // Implement report issue functionality
    toast({
      title: 'Probleem melden',
      description: 'Deze functie is nog niet beschikbaar.',
    });
  };

  const handleHelpSupport = () => {
    logger.info('Help and support');
    // Implement help and support functionality
    toast({
      title: 'Help & Support',
      description: 'Deze functie is nog niet beschikbaar.',
    });
  };

  return {
    handleLogout,
    handleSettings,
    onStartSearch,
    handleReportIssue,
    handleHelpSupport,
  };
};