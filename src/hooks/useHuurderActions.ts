
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { User } from '@/types';

export const useHuurderActions = (user: User | null) => {
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
    logger.log('Opening settings modal');
    // Add settings functionality here
  };

  const onStartSearch = () => {
    logger.log('Starting property search');
    // Add search functionality here
  };

  const handleReportIssue = () => {
    logger.log('Reporting an issue');
    toast({
      title: 'Issue Reported',
      description: 'Your issue has been reported successfully.',
    });
  };

  const handleHelpSupport = () => {
    logger.log('Opening help and support');
    toast({
      title: 'Help & Support',
      description: 'Opening help and support section.',
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
