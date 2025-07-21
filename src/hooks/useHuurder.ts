
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
      // Map form data to match CreateTenantProfileData interface and database schema
      const dutchProfileData = {
        // Required basic fields
        voornaam: profileData.first_name,
        achternaam: profileData.last_name,
        telefoon: profileData.phone,
        geboortedatum: profileData.date_of_birth,
        beroep: profileData.profession,
        maandinkomen: parseFloat(profileData.monthly_income || '0'),
        bio: profileData.bio || '',
        stad: profileData.preferred_city?.[0]?.name || profileData.preferred_city?.[0] || 'Amsterdam',
        minBudget: parseFloat(profileData.min_budget || '0'),
        maxBudget: parseFloat(profileData.max_budget || '0'),
        slaapkamers: profileData.preferred_bedrooms || 1,
        woningtype: profileData.preferred_property_type || 'appartement',
        motivatie: profileData.motivation || '',
        
        // Optional personal information
        nationaliteit: profileData.nationality,
        geslacht: profileData.sex,
        burgerlijkeStaat: profileData.marital_status,
        
        // Children information
        heeftKinderen: profileData.has_children || false,
        aantalKinderen: profileData.number_of_children || 0,
        leeftijdenKinderen: profileData.children_ages || [],
        
        // Partner information
        heeftPartner: profileData.has_partner || false,
        naamPartner: profileData.partner_name,
        beroepPartner: profileData.partner_profession,
        maandinkomenPartner: profileData.partner_monthly_income ? parseFloat(profileData.partner_monthly_income) : undefined,
        werkstatusPartner: profileData.partner_employment_status,
        
        // Employment details
        werkgever: profileData.employer,
        werkstatus: profileData.employment_status,
        typeArbeidscontract: profileData.work_contract_type,
        
        // Guarantor information
        garantstellerBeschikbaar: profileData.borgsteller_beschikbaar || false,
        naamGarantsteller: profileData.borgsteller_naam,
        telefoonGarantsteller: profileData.borgsteller_telefoon,
        inkomenGarantsteller: profileData.borgsteller_inkomen ? parseFloat(profileData.borgsteller_inkomen) : undefined,
        relatieGarantsteller: profileData.borgsteller_relatie,
        inkomensbewijsBeschikbaar: profileData.inkomensbewijs_beschikbaar || false,
        
        // Housing preferences
        voorkeurswijken: Array.isArray(profileData.preferred_city) ? profileData.preferred_city : [profileData.preferred_city].filter(Boolean),
        maxReistijd: profileData.max_commute_time || 30,
        vervoersvoorkeur: profileData.transport_preference || 'openbaar_vervoer',
        voorkeurMeubilering: profileData.furnished_preference || 'geen_voorkeur',
        gewensteVoorzieningen: profileData.desired_amenities || [],
        
        // Timing preferences
        voorkeurVerhuisdatum: profileData.move_in_date_preferred,
        vroegsteVerhuisdatum: profileData.move_in_date_earliest,
        flexibeleBeschikbaarheid: profileData.availability_flexible || false,
        
        // Lifestyle
        heeftHuisdieren: profileData.hasPets || false,
        detailsHuisdieren: profileData.pet_details,
        rookt: profileData.smokes || false,
        detailsRoken: profileData.smoking_details,
        
        // Additional enhanced profile fields
        min_kamers: profileData.min_kamers || profileData.preferred_bedrooms || 1,
        max_kamers: profileData.max_kamers || (profileData.preferred_bedrooms ? profileData.preferred_bedrooms + 1 : 3),
        parkeren_vereist: profileData.parking_required || false,
        opslag_kelder: profileData.storage_kelder || false,
        opslag_zolder: profileData.storage_zolder || false,
        opslag_berging: profileData.storage_berging || false,
        opslag_garage: profileData.storage_garage || false,
        opslag_schuur: profileData.storage_schuur || false,
        verhuurgeschiedenis_jaren: profileData.rental_history_years,
        reden_verhuizing: profileData.reason_for_moving,
        referenties_beschikbaar: profileData.references_available || false,
        extra_inkomen: profileData.extra_income ? parseFloat(profileData.extra_income) : undefined,
        extra_inkomen_beschrijving: profileData.extra_income_description,
        profielfotoUrl: profileData.profilePictureUrl
      };

      console.log('Mapped dutchProfileData:', dutchProfileData);

      await userService.createTenantProfile(dutchProfileData);

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
