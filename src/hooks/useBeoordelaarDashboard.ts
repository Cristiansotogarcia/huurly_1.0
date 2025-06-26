import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { documentService } from '@/services/DocumentService';
import { Document } from '@/types'; // Assuming a Document type exists
import { logger } from '@/utils/logger';

export const useBeoordelaarDashboard = () => {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDocuments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await documentService.getDocumentsForReview();
      if (response.success) {
        setDocuments(response.data || []);
      } else {
        logger.error('Failed to fetch document queue:', response.error);
      }
    } catch (error) {
      logger.error('An unexpected error occurred while fetching the document queue:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [user]);

  return { documents, loading, refresh: loadDocuments };
};
