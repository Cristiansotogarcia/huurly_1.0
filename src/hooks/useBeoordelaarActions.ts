import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';
import { DashboardDataService } from '@/services/DashboardDataService';

export const useBeoordelaarActions = () => {
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

  const handleReviewDocument = async (documentId: string, status: 'approved' | 'rejected', remarks?: string) => {
    try {
      // This service method needs to be created
      const response = await DashboardDataService.reviewDocument(documentId, status, remarks);
      if (response.success) {
        toast({
          title: 'Document beoordeeld',
          description: `Het document is ${status === 'approved' ? 'goedgekeurd' : 'afgekeurd'}.`,
        });
      } else {
        throw response.error;
      }
    } catch (error) {
      logger.error('Failed to review document:', error);
      toast({
        title: 'Fout bij beoordelen',
        description: 'Er is een fout opgetreden bij het beoordelen van het document.',
        variant: 'destructive',
      });
    }
  };

  return {
    handleLogout,
    handleReviewDocument,
  };
};