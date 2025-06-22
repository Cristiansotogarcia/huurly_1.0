import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { DashboardDataService } from '@/services/DashboardDataService';
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
      // This service method needs to be created
      const response = await DashboardDataService.getReviewQueue();
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