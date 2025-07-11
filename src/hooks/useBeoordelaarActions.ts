
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { documentService } from '@/services/DocumentService';
import { useAuthStore } from '@/store/authStore';
import { enhancedLogger as logger } from '@/lib/logger';
import { useAuth } from '@/hooks/useAuth';

export const useBeoordelaarActions = () => {
  const [isReviewing, setIsReviewing] = useState(false);
  const { toast } = useToast();
  const { signOut } = useAuth();

  const approveDocument = async (documentId: string) => {
    setIsReviewing(true);
    try {
      const result = await documentService.reviewDocument(documentId, 'goedgekeurd');
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
      const result = await documentService.reviewDocument(documentId, 'afgekeurd', reason);
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

  const handleReviewDocument = async (documentId: string, status: 'approved' | 'rejected', notes?: string) => {
    if (status === 'approved') {
      return await approveDocument(documentId);
    } else if (status === 'rejected' && notes) {
      return await rejectDocument(documentId, notes);
    }
    return false;
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      logger.error('Logout failed:', error);
    }
  };

  return {
    approveDocument,
    rejectDocument,
    handleReviewDocument,
    handleLogout,
    isReviewing,
  };
};
