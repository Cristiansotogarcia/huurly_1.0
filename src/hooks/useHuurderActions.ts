
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { User } from '@/types';
import { useState } from 'react';

export const useHuurderActions = (user: User | null) => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Modal states
  const [modals, setModals] = useState({
    settings: false,
    search: false,
    helpSupport: false,
    issueReport: false
  });

  const openModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

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
    openModal('settings');
  };

  const onStartSearch = () => {
    logger.log('Starting property search');
    openModal('search');
  };

  const handleReportIssue = () => {
    logger.log('Opening issue report modal');
    openModal('issueReport');
  };

  const handleHelpSupport = () => {
    logger.log('Opening help and support');
    openModal('helpSupport');
  };

  return {
    handleLogout,
    handleSettings,
    onStartSearch,
    handleReportIssue,
    handleHelpSupport,
    modals,
    openModal,
    closeModal,
  };
};
