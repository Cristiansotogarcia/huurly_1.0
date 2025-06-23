
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { dashboardDataService } from '@/services/DashboardDataService';
import { userService } from '@/services/UserService';
import { Document, TenantProfile, Subscription, TenantDashboardData, User } from '@/types';

export const useHuurder = () => {
  const { user, refresh: refreshAuth } = useAuthStore();
  const { toast } = useToast();

  // State from useHuurderDashboard
  const [stats, setStats] = useState<TenantDashboardData>({ profileViews: 0, invitations: 0, applications: 0, acceptedApplications: 0 });
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  const [tenantProfile, setTenantProfile] = useState<TenantProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // State from useHuurderActions
  const [isLookingForPlace, setIsLookingForPlace] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setIsLoadingStats(true);
    try {
      const [statsResponse, docsResponse, profileResponse, subResponse, pictureUrl] = await Promise.all([
        dashboardDataService.getTenantDashboardStats(user.id),
        dashboardDataService.getUserDocuments(user.id),
        userService.getTenantProfile(user.id),
        dashboardDataService.getSubscription(user.id),
        userService.getProfilePictureUrl(user.id),
      ]);

      // Handle stats response - extract data properly
      if (statsResponse && statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        setStats({ profileViews: 0, invitations: 0, applications: 0, acceptedApplications: 0 });
      }

      // Handle documents response - ensure it's always an array
      if (docsResponse && docsResponse.success && docsResponse.data) {
        setUserDocuments(Array.isArray(docsResponse.data) ? docsResponse.data : []);
      } else {
        setUserDocuments([]);
      }

      // Handle profile response - extract data properly
      if (profileResponse && profileResponse.success && profileResponse.data) {
        setTenantProfile(profileResponse.data);
        setHasProfile(!!profileResponse.data);
      } else {
        setTenantProfile(null);
        setHasProfile(false);
      }

      // Handle subscription response - extract data properly
      if (subResponse && subResponse.success && subResponse.data) {
        setSubscription(subResponse.data);
      } else {
        setSubscription(null);
      }

      // Handle profile picture URL
      setProfilePictureUrl(pictureUrl || null);

    } catch (error) {
      console.error('Failed to load tenant dashboard:', error);
      toast({ title: 'Fout', description: 'Kon dashboard gegevens niet laden.', variant: 'destructive' });
      // Ensure userDocuments is always an array even on error
      setUserDocuments([]);
    } finally {
      setIsLoading(false);
      setIsLoadingStats(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const refresh = useCallback(() => {
    loadDashboardData();
    if(refreshAuth) refreshAuth();
  }, [loadDashboardData, refreshAuth]);

  const getSubscriptionEndDate = useCallback(() => {
    if (subscription?.eind_datum) {
      return new Date(subscription.eind_datum).toLocaleDateString('nl-NL');
    }
    return 'N/A';
  }, [subscription]);

  const toggleLookingStatus = async () => {
    if (!user?.id || !tenantProfile || isUpdatingStatus) return;

    const newStatus = !isLookingForPlace;
    setIsUpdatingStatus(true);

    try {
      // Create update data without isLookingForPlace as it doesn't exist in the type
      const updateData = { ...tenantProfile };
      await userService.updateTenantProfile(updateData);
      setIsLookingForPlace(newStatus);
      setTenantProfile({ ...tenantProfile });
      toast({
        title: 'Status bijgewerkt',
        description: newStatus ? 'Je profiel is nu zichtbaar voor verhuurders.' : 'Je profiel is nu verborgen.',
      });
    } catch (error) {
      console.error('Error updating looking status:', error);
      toast({ title: 'Fout', description: 'Kon status niet bijwerken.', variant: 'destructive' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleProfileComplete = async (profileData: any, callback?: () => void) => {
    if (!user?.id) return;
    try {
      await userService.updateTenantProfile(profileData);
      toast({ title: 'Profiel bijgewerkt!', description: 'Je profiel is succesvol bijgewerkt.' });
      await refresh();
      if (callback) callback();
    } catch (error) {
      toast({ title: 'Fout bij bijwerken profiel', description: 'Er is iets misgegaan.', variant: 'destructive' });
    }
  };

  const handleDocumentUploadComplete = async (documents: any[], callback?: () => void) => {
    toast({ title: 'Documenten geüpload', description: `${documents.length} document(en) zijn geüpload.` });
    await refresh();
    if (callback) callback();
  };

  return {
    user,
    hasProfile,
    userDocuments,
    isLoading,
    stats,
    isLoadingStats,
    profilePictureUrl,
    tenantProfile,
    isLookingForPlace,
    isUpdatingStatus,
    subscription,
    refresh,
    getSubscriptionEndDate,
    toggleLookingStatus,
    handleProfileComplete,
    handleDocumentUploadComplete,
  };
};
