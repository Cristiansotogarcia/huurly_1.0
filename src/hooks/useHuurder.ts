
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
      setStats({ profileViews: 0, invitations: 0, applications: 0, acceptedApplications: 0 });
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
    if (!user?.id) {
      toast({ 
        title: 'Fout', 
        description: 'Gebruiker niet ingelogd.', 
        variant: 'destructive' 
      });
      return;
    }

    console.log('Raw profileData received:', profileData);

    try {
      // Map form data to Dutch field names expected by the backend
      const dutchProfileData = {
        voornaam: profileData.personal_info?.first_name || profileData.first_name,
        achternaam: profileData.personal_info?.last_name || profileData.last_name,
        email: user.email, // Assuming email comes from auth user
        telefoon: profileData.personal_info?.phone || profileData.phone,
        geboortedatum: profileData.personal_info?.date_of_birth || profileData.date_of_birth,
        nationaliteit: profileData.personal_info?.nationality || profileData.nationality,
        burgerlijke_staat: profileData.personal_info?.marital_status || profileData.marital_status,
        aantal_kinderen: profileData.personal_info?.num_children || profileData.number_of_children || 0,
        heeftHuisdieren: profileData.lifestyle?.hasPets || profileData.hasPets || false,
        rookt: profileData.lifestyle?.smokes || profileData.smokes || false,
        beroep: profileData.employment?.occupation || profileData.profession || 'Niet opgegeven',
        werkgever: profileData.employment?.employer || profileData.employer,
        // Required field: maandinkomen
        maandinkomen: parseFloat(profileData.employment?.income || profileData.monthly_income || '0'),
        dienstverband: profileData.employment?.employment_status || profileData.employment_status,
        type_huishouden: profileData.household?.household_type || profileData.household_type,
        aantal_volwassenen: profileData.household?.num_adults || profileData.num_adults || 1,
        aantal_kinderen_huishouden: profileData.household?.num_children_household || profileData.number_of_children || 0,
        woningtype_voorkeur: profileData.housing_preferences?.property_type || profileData.preferred_property_type,
        // Required field: woningtype
        woningtype: profileData.housing_preferences?.property_type || profileData.preferred_property_type || 'appartement',
        // Required field: slaapkamers
        slaapkamers: parseInt(profileData.housing_preferences?.num_bedrooms || profileData.preferred_bedrooms || '1'),
        badkamers_voorkeur: profileData.housing_preferences?.num_bathrooms || profileData.num_bathrooms,
        buitenruimte_voorkeur: profileData.housing_preferences?.outdoor_space || profileData.outdoor_space,
        // Required field: maxBudget
        maxBudget: parseFloat(profileData.housing_preferences?.max_rent || profileData.max_budget || '0'),
        // Required field: minBudget
        minBudget: parseFloat(profileData.housing_preferences?.min_rent || profileData.min_budget || '0'),
        beschikbaar_vanaf: profileData.housing_preferences?.available_from || profileData.vroegste_verhuisdatum,
        // Required field: stad
        stad: Array.isArray(profileData.housing_preferences?.preferred_city) && profileData.housing_preferences?.preferred_city.length > 0 
          ? profileData.housing_preferences.preferred_city[0] 
          : Array.isArray(profileData.preferred_city) && profileData.preferred_city.length > 0
            ? profileData.preferred_city[0]
            : profileData.housing_preferences?.preferred_city || profileData.preferred_city || 'Amsterdam',
        gewenste_steden: Array.isArray(profileData.housing_preferences?.preferred_city) 
          ? profileData.housing_preferences.preferred_city 
          : Array.isArray(profileData.preferred_city)
            ? profileData.preferred_city
            : profileData.housing_preferences?.preferred_city || profileData.preferred_city
              ? [profileData.housing_preferences?.preferred_city || profileData.preferred_city]
              : [],
        // Storage preferences
        opslag_voorkeur: profileData.housing_preferences?.storage_preferences || profileData.storage_needs || 'Geen',
        // Financial details
        borgsteller_beschikbaar: profileData.financial_details?.has_guarantor || profileData.borgsteller_beschikbaar || false,
        // Motivation
        reden_verhuizing: profileData.reason_for_moving || profileData.profile_motivation?.reason_for_moving,
        // References
        referenties_beschikbaar: profileData.references_available || profileData.references?.has_references || false,
        huurgeschiedenis_beschikbaar: profileData.references?.has_rental_history || false,
        huurervaring_jaren: profileData.rental_history_years || profileData.references?.rental_history_years,
        // Bio and motivation
        bio: profileData.bio || 'Geen biografie opgegeven',
        motivatie: profileData.motivation || profileData.profile_motivation?.motivation || 'Geen motivatie opgegeven',
        // Profile picture
        profielfotoUrl: profileData.profilePictureUrl,
      };

      console.log('Mapped dutchProfileData:', dutchProfileData);

      await userService.updateTenantProfile(dutchProfileData);

      toast({
        title: 'Succes',
        description: 'Profiel succesvol opgeslagen!',
      });
      await refresh(); // Refresh user context to reflect profile changes
      if (callback) callback();
    } catch (error) {
      console.error('Fout bij opslaan profiel:', error);
      toast({
        title: 'Fout',
        description: `Fout bij opslaan profiel: ${error instanceof Error ? error.message : 'Onbekende fout'}`,
        variant: 'destructive',
      });
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
