
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { consolidatedDashboardService } from '@/services/ConsolidatedDashboardService';
import { optimizedSubscriptionService } from '@/services/OptimizedSubscriptionService';
import { userService } from '@/services/UserService';
import { TenantProfile, Subscription, TenantDashboardData, User } from '@/types';
import { Document } from '@/types/documents';

export const useHuurder = () => {
  const { user, refresh: refreshAuth, setLoadingSubscription } = useAuthStore();
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
    setLoadingSubscription(true);
    
    try {
      // Single API call to get all dashboard data
      const response = await consolidatedDashboardService.getHuurderDashboardData(user.id);
      
      if (response.success && response.data) {
        const { stats, documents, tenantProfile: mappedProfile, subscription, profilePictureUrl, hasProfile } = response.data;
        
        setStats(stats);
        setUserDocuments(Array.isArray(documents) ? documents : []);
        setTenantProfile(mappedProfile);
        setSubscription(subscription);
        setProfilePictureUrl(profilePictureUrl);
        setHasProfile(hasProfile);

        // Fetch latest expiration date if subscription is active
        if (subscription && subscription.status === 'active') {
          const expiration = await optimizedSubscriptionService.getSubscriptionExpiration(user.id);
          if (expiration.success && expiration.data?.expiresAt) {
            setSubscription(prev => prev ? { ...prev, end_date: expiration.data.expiresAt } : {
              id: subscription.id || '',
              user_id: user.id,
              status: 'active',
              start_date: subscription.start_date || new Date().toISOString(),
              end_date: expiration.data.expiresAt,
              stripe_subscription_id: subscription.stripe_subscription_id || ''
            } as Subscription);
          }
        }
      } else {
        // Set default values on error
        setStats({ profileViews: 0, invitations: 0, applications: 0, acceptedApplications: 0 });
        setUserDocuments([]);
        setTenantProfile(null);
        setSubscription(null);
        setProfilePictureUrl(null);
        setHasProfile(false);
        
        toast({ 
          title: 'Fout', 
          description: 'Kon dashboard gegevens niet laden.', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: 'Fout', 
        description: 'Kon dashboard gegevens niet laden.', 
        variant: 'destructive' 
      });
      
      // Set safe defaults
      setStats({ profileViews: 0, invitations: 0, applications: 0, acceptedApplications: 0 });
      setUserDocuments([]);
      setTenantProfile(null);
      setSubscription(null);
      setProfilePictureUrl(null);
      setHasProfile(false);
    } finally {
      setIsLoading(false);
      setIsLoadingStats(false);
      setLoadingSubscription(false);
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
    const end = subscription?.end_date || (subscription as any)?.expiresAt;
    if (end) {
      return new Date(end).toLocaleDateString('nl-NL');
    }
    return 'N/A';
  }, [subscription]);

  const toggleLookingStatus = async () => {
    if (!user?.id || !tenantProfile || isUpdatingStatus) return;

    const newStatus = !isLookingForPlace;
    setIsUpdatingStatus(true);

    try {
      // Create update data with all required properties for CreateTenantProfileData
      const updateData = {
        voornaam: tenantProfile.firstName,
        achternaam: tenantProfile.lastName,
        telefoon: tenantProfile.phone,
        geboortedatum: tenantProfile.dateOfBirth,
        beroep: tenantProfile.profession,
        maandinkomen: tenantProfile.income,
        bio: tenantProfile.bio,
        motivatie: tenantProfile.motivation,
        stad: tenantProfile.preferences?.city || '',
        minBudget: tenantProfile.preferences?.minBudget || 0,
        maxBudget: tenantProfile.preferences?.maxBudget || 0,
        slaapkamers: tenantProfile.preferences?.bedrooms || 1,
        woningtype: tenantProfile.preferences?.propertyType || 'appartement',
        gewensteWoonplaats: tenantProfile.preferences?.city || '',
      };
      await userService.updateTenantProfile(updateData);
      setIsLookingForPlace(newStatus);
      setTenantProfile({ ...tenantProfile });
      toast({
        title: 'Status bijgewerkt',
        description: newStatus ? 'Je profiel is nu zichtbaar voor verhuurders.' : 'Je profiel is nu verborgen.',
      });
    } catch (error) {
      toast({ title: 'Fout', description: 'Kon status niet bijwerken.', variant: 'destructive' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleProfileComplete = async (profileData: any, callback?: () => void) => {
    if (!user?.id) return;
    try {
      // Map English properties to Dutch database columns with all required fields
      const dutchProfileData = {
        voornaam: profileData.firstName || profileData.first_name,
        achternaam: profileData.lastName || profileData.last_name,
        telefoon: profileData.phone,
        geboortedatum: profileData.dateOfBirth || profileData.date_of_birth,
        beroep: profileData.profession,
        maandinkomen: profileData.income || profileData.monthly_income,
        bio: profileData.bio,
        motivatie: profileData.motivation,
        stad: profileData.city || profileData.preferred_city || '',
        minBudget: profileData.minBudget || 0,
        maxBudget: profileData.maxBudget || 0,
        slaapkamers: profileData.bedrooms || profileData.preferred_bedrooms || 1,
        woningtype: profileData.propertyType || profileData.preferred_property_type || 'appartement',
        gewensteWoonplaats: profileData.preferredLocation || profileData.preferred_city || '',
        profielfotoUrl: profileData.profilePictureUrl || profileData.profile_picture_url || '',
        coverFotoUrl: profileData.coverPhotoUrl || profileData.cover_foto_url || '',
      };
      await userService.updateTenantProfile(dutchProfileData);
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
