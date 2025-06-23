
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { documentService } from '@/services/DocumentService';
import { dashboardDataService } from '@/services/DashboardDataService';

export const useBeoordelaarActions = () => {
  const [isReviewing, setIsReviewing] = useState(false);
  const { toast } = useToast();

  const approveDocument = async (documentId: string) => {
    setIsReviewing(true);
    try {
      const result = await documentService.approveDocument(documentId);
      if (result.success) {
        toast({
          title: 'Document goedgekeurd',
          description: 'Het document is succesvol goedgekeurd.',
        });
        return true;
      } else {
        throw new Error(result.error?.message || 'Onbekende fout');
      }
    } catch (error) {
      toast({
        title: 'Fout bij goedkeuren',
        description: 'Er is een fout opgetreden bij het goedkeuren van het document.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsReviewing(false);
    }
  };

  const rejectDocument = async (documentId: string, reason: string) => {
    setIsReviewing(true);
    try {
      // Map English status to Dutch status for the service call
      const dutchStatus = 'afgewezen' as const;
      const result = await dashboardDataService.reviewDocument(documentId, dutchStatus, reason);
      if (result.success) {
        toast({
          title: 'Document afgewezen',
          description: 'Het document is afgewezen.',
        });
        return true;
      } else {
        throw new Error('Fout bij afwijzen document');
      }
    } catch (error) {
      toast({
        title: 'Fout bij afwijzen',
        description: 'Er is een fout opgetreden bij het afwijzen van het document.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsReviewing(false);
    }
  };

  return {
    approveDocument,
    rejectDocument,
    isReviewing,
  };
};
