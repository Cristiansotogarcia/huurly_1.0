
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { consolidatedDashboardService } from '@/services/ConsolidatedDashboardService';
import { optimizedSubscriptionService } from '@/services/OptimizedSubscriptionService';
import { userService } from '@/services/UserService';
import { TenantProfile, Subscription, TenantDashboardData } from '@/types';
import { Document } from '@/types/documents';
import { mapProfileFormToDutch } from '@/utils/profileDataMapper';

export const useHuurder = () => {
  const { user, refresh: refreshAuth, setLoadingSubscription } = useAuthStore();
  const { toast } = useToast();

  // State from useHuurderDashboard
  const [stats, setStats] = useState<TenantDashboardData>({ profileViews: 0, applications: 0, acceptedApplications: 0 });
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  const [tenantProfile, setTenantProfile] = useState<TenantProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
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
        const { stats, documents, tenantProfile: mappedProfile, subscription, profilePictureUrl, coverPhotoUrl, hasProfile } = response.data;
        
        setStats(stats);
        setUserDocuments(Array.isArray(documents) ? documents : []);
        setTenantProfile(mappedProfile);
        setSubscription(subscription);
        setProfilePictureUrl(profilePictureUrl);
        setCoverPhotoUrl(coverPhotoUrl);
        setHasProfile(hasProfile);

        // Fetch latest expiration date if subscription is active
        if (subscription && subscription.status === 'active') {
          const expiration = await optimizedSubscriptionService.getSubscriptionExpiration(user.id);
          if (expiration.success && expiration.data?.expiresAt) {
            setSubscription(prev => {
              if (prev) {
                return { ...prev, end_date: expiration.data!.expiresAt } as Subscription;
              } else {
                return {
                  id: subscription?.id || '',
                  user_id: user.id,
                  status: 'active',
                  start_date: subscription?.start_date || new Date().toISOString(),
                  end_date: expiration.data!.expiresAt,
                  stripe_subscription_id: subscription?.stripe_subscription_id || ''
                } as Subscription;
              }
            });
          }
        }
      } else {
        // Set default values on error
        setStats({ profileViews: 0, applications: 0, acceptedApplications: 0 });
        setUserDocuments([]);
        setTenantProfile(null);
        setSubscription(null);
        setProfilePictureUrl(null);
        setCoverPhotoUrl(null);
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
      setStats({ profileViews: 0, applications: 0, acceptedApplications: 0 });
      setUserDocuments([]);
      setTenantProfile(null);
      setSubscription(null);
      setProfilePictureUrl(null);
      setCoverPhotoUrl(null);
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
        voornaam: tenantProfile.firstName || '',
        achternaam: tenantProfile.lastName || '',
        telefoon: tenantProfile.phone || '',
        geboortedatum: tenantProfile.dateOfBirth || '',
        beroep: tenantProfile.profession || '',
        inkomen: tenantProfile.income || 0,
        beschrijving: tenantProfile.bio || '',
        motivatie: tenantProfile.motivation || '',
        stad: tenantProfile.preferences?.city || '',
        min_budget: tenantProfile.preferences?.minBudget || 0,
        max_budget: tenantProfile.preferences?.maxBudget || 0,
        voorkeur_slaapkamers: tenantProfile.preferences?.bedrooms || 1,
        voorkeur_woningtype: tenantProfile.preferences?.propertyType || 'appartement',
        locatie_voorkeur: [tenantProfile.preferences?.city || ''],
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
    if (!user?.id) {
      const error = new Error('Gebruiker niet ingelogd.');
      toast({
        title: 'Fout',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }

    try {
      const mappedData = mapProfileFormToDutch(profileData);

      // Validate required fields
      const requiredFields = ['voornaam', 'achternaam', 'telefoon', 'geboortedatum', 'beroep', 'inkomen', 'beschrijving', 'motivatie', 'stad', 'voorkeur_woningtype', 'min_budget', 'max_budget'];
      const missingFields = requiredFields.filter(field => {
        const value = mappedData[field];
        // For arrays like preferred_city, check if it's an empty array
        if (Array.isArray(value)) {
          return value.length === 0;
        }
        const isMissing = value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
        return isMissing;
      });

      // Additional validation for preferred_city array (mapped to stad and locatie_voorkeur)
      if (!mappedData.locatie_voorkeur || mappedData.locatie_voorkeur.length === 0) {
        missingFields.push('stad');
      }

      if (missingFields.length > 0) {
        const error = new Error(`Ontbrekende verplichte velden: ${missingFields.join(', ')}`);
        toast({
          title: 'Fout',
          description: error.message,
          variant: 'destructive',
        } as any);
        throw error;
      }

      const updateResponse = await userService.updateTenantProfile(mappedData);
      if (updateResponse.success) {
        // Success toast removed - ProfileEditPage handles success feedback
        // Skip dashboard refresh for now to avoid hanging - data will be refreshed on next page load
        // await refresh(); // Commented out to prevent hanging

        if (callback) callback();
      } else {
        const errorMessage = updateResponse.error?.message || 'Onbekende fout bij het bijwerken van het profiel.';
        toast({
          title: 'Fout',
          description: `Kon profiel niet bijwerken: ${errorMessage}. Probeer het opnieuw.`,
          variant: 'destructive',
        });
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout.';
      toast({
        title: 'Fout',
        description: `Kon profiel niet bijwerken: ${errorMessage}. Probeer het opnieuw.`,
        variant: 'destructive',
      });
      throw error;
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
    coverPhotoUrl,
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
