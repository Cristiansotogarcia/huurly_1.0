import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useHuurder } from '@/hooks/useHuurder';
import { useHuurderActions } from '@/hooks/useHuurderActions';
import { useAuthStore } from '@/store/authStore';
import { useProfileWarnings } from '@/hooks/useProfileWarnings';
import { optimizedSubscriptionService } from '@/services/OptimizedSubscriptionService';
import { DashboardHeader, DashboardContent } from "@/components/dashboard";
import { StatsGrid } from '@/components/standard/StatsGrid';
import { DocumentsSection } from '@/components/standard/DocumentsSection';
import ProfileOverview, { ProfileSection } from '@/components/standard/ProfileOverview';
import { ProfilePhotoSection } from '@/components/dashboard/ProfilePhotoSection';
import { Eye, Calendar, FileText, CheckCircle, User as UserIcon, Briefcase, Home, Heart } from 'lucide-react';
import { DashboardModals } from "@/components/HuurderDashboard/DashboardModals";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { withAuth } from '@/hocs/withAuth';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface HuurderDashboardProps {
  user: User;
}

const formatHousingPreferences = (preferences: any): string => {
  if (!preferences || typeof preferences !== 'object' || Object.keys(preferences).length === 0) {
    return 'N.v.t.';
  }

  const preferenceLabels: { [key: string]: string } = {
    minBudget: 'Min Budget',
    maxBudget: 'Max Budget',
    city: 'Stad',
    bedrooms: 'Slaapkamers',
    propertyType: 'Woningtype',
    furnishedPreference: 'Gemeubileerd',
    parkingRequired: 'Parkeren Vereist',
    storageNeeds: 'Opslag Nodig',
    leaseDurationPreference: 'Voorkeur Huurtermijn',
    moveInDatePreferred: 'Voorkeur Verhuisdatum',
    moveInDateEarliest: 'Vroegste Verhuisdatum',
    reasonForMoving: 'Reden van Verhuizing',
  };

  const formattedPreferences = Object.entries(preferences)
    .filter(([, value]) => value !== null && value !== undefined && value !== '' && value !== 0)
    .map(([key, value]) => {
      const label = preferenceLabels[key] || key;
      const displayValue = typeof value === 'boolean' ? (value ? 'Ja' : 'Nee') : value;
      return `${label}: ${displayValue}`;
    })
    .join(', ');

  return formattedPreferences || 'N.v.t.';
};

const HuurderDashboard: React.FC<HuurderDashboardProps> = ({ user: authUser }) => {
  const {
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
  } = useHuurder();
  const navigate = useNavigate();

  const { handleSettings, handleLogout, onStartSearch, handleReportIssue, handleHelpSupport } = useHuurderActions();
  const { setPaymentFlow, isLoadingSubscription } = useAuthStore();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [hasInitialDataLoaded, setHasInitialDataLoaded] = useState(false);
  const { toast } = useToast();
  
  // Define profile sections for the ProfileOverview component
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [missingDocuments, setMissingDocuments] = useState(false);

  useEffect(() => {
    const checkCompleteness = () => {
      if (!tenantProfile) return;
      const requiredFields = ['profession', 'income', 'age', 'preferredLocations', 'maxRent'];
      const isComplete = requiredFields.every(field => tenantProfile[field] != null);
      setIsProfileComplete(isComplete);
      setMissingDocuments(userDocuments.length < 3);
    };
    checkCompleteness();
  }, [tenantProfile, userDocuments]);

  const profileSections: ProfileSection[] = tenantProfile ? [
    {
      title: 'Persoonlijke Informatie',
      icon: UserIcon,
      iconColor: 'text-blue-600',
      fields: [
        { label: 'Naam', value: tenantProfile.personalInfo?.fullName },
        { label: 'Email', value: user?.email, isHidden: true },
        { label: 'Telefoonnummer', value: tenantProfile.personalInfo?.phone },
        { label: 'Geboortedatum', value: tenantProfile.personalInfo?.dateOfBirth },
        { label: 'Leeftijd', value: tenantProfile.age },
        { label: 'Partner', value: tenantProfile.hasPartner ? 'Ja' : 'Nee' },
        { label: 'Kinderen', value: tenantProfile.numberOfChildren },
        { label: 'Huisdieren', value: tenantProfile.hasPets ? 'Ja' : 'Nee' },
        { label: 'Roken', value: tenantProfile.smokes ? 'Ja' : 'Nee' },
      ],
    },
    {
      title: 'Werk & Inkomen',
      icon: Briefcase,
      iconColor: 'text-green-600',
      fields: [
        { label: 'Beroep', value: tenantProfile.profession },
        { label: 'Werkgever', value: tenantProfile.workAndIncome?.employer },
        { label: 'Maandelijks Inkomen', value: tenantProfile.income },
        { label: 'Inkomensbewijs beschikbaar', value: tenantProfile.incomeProofAvailable ? 'Ja' : 'Nee' },
        { label: 'Borgsteller beschikbaar', value: tenantProfile.guarantorAvailable ? 'Ja' : 'Nee' },
        { label: 'Borgsteller Naam', value: tenantProfile.guarantorName },
        { label: 'Borgsteller Relatie', value: tenantProfile.guarantorRelationship },
        { label: 'Borgsteller Telefoon', value: tenantProfile.guarantorPhone },
        { label: 'Borgsteller Inkomen', value: tenantProfile.guarantorIncome },
      ],
    },
    {
      title: 'Woonvoorkeuren',
      icon: Home,
      iconColor: 'text-purple-600',
      fields: [
        { label: 'Gewenste Locatie', value: tenantProfile.preferredLocations?.join(', ') },
        { label: 'Budget', value: tenantProfile.maxRent },
        { label: 'Min Kamers', value: tenantProfile.minRooms },
        { label: 'Max Kamers', value: tenantProfile.maxRooms },
        { label: 'Vroegste Verhuisdatum', value: tenantProfile.earliestMoveDate },
        { label: 'Voorkeur Verhuisdatum', value: tenantProfile.preferredMoveDate },
        { label: 'Beschikbaarheid Flexibel', value: tenantProfile.availabilityFlexible ? 'Ja' : 'Nee' },
                { label: 'Woningvoorkeur', value: formatHousingPreferences(tenantProfile.housingPreferences) }, 
      ],
    },
    {
      title: 'Levensstijl & Motivatie',
      icon: Heart,
      iconColor: 'text-red-600',
      fields: [
        { label: 'Beschrijving', value: tenantProfile.description || 'N.v.t.' },
        { label: 'Motivatie', value: tenantProfile.lifestyleAndMotivation?.motivation || 'N.v.t.' },
      ],
    },
  ] : [];
  
  // Define stats for the StatsGrid component
  const huurderStats = [
    {
      title: 'Profiel weergaven',
      value: stats.profileViews,
      icon: Eye,
      color: 'blue-600',
      loading: isLoadingStats,
    },
    {
      title: 'Uitnodigingen',
      value: stats.invitations,
      icon: Calendar,
      color: 'green-600',
      loading: isLoadingStats,
    },
    {
      title: 'Aanvragen',
      value: stats.applications,
      icon: FileText,
      color: 'orange-600',
      loading: isLoadingStats,
    },
    {
      title: 'Geaccepteerd',
      value: stats.acceptedApplications,
      icon: CheckCircle,
      color: 'emerald-600',
      loading: isLoadingStats,
    },
  ];

  const isSubscribed = subscription && subscription.status === 'active';

  // Use the new profile warnings hook
  const { checkAndShowWarnings } = useProfileWarnings();
  
  // Show warnings on dashboard load
  useEffect(() => {
    if (!isLoading && hasInitialDataLoaded) {
      checkAndShowWarnings();
    }
  }, [isLoading, hasInitialDataLoaded, checkAndShowWarnings]);

  // Track when initial data has been loaded to prevent modal flash
  useEffect(() => {
    if (user && !isLoadingSubscription && !hasInitialDataLoaded) {
      setHasInitialDataLoaded(true);
    }
  }, [user, isLoadingSubscription, hasInitialDataLoaded]);

  useEffect(() => {
    // Only show payment modal if user is loaded, initial data has loaded, subscription is not loading, and user is not subscribed
    if (user && hasInitialDataLoaded && !isLoading && !isLoadingSubscription && !isSubscribed) {
      setShowPaymentModal(true);
    } else if (user && (isSubscribed || isLoadingSubscription)) {
      // Close payment modal when user becomes subscribed or while loading
      setShowPaymentModal(false);
    }
  }, [user, isSubscribed, isLoadingSubscription, hasInitialDataLoaded]);

  // Handle payment cancellation redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_canceled')) {
      // Clear payment flow state when payment is cancelled
      setPaymentFlow(false);
      toast({
        title: 'Betaling Geannuleerd',
        description: 'Je betaling is niet voltooid. Je kunt het opnieuw proberen.',
        variant: 'destructive',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, setPaymentFlow]);

  // Refresh subscription status when payment is successful
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_success')) {
      // Clear payment flow state and close modal when payment succeeds
      setPaymentFlow(false);
      setShowPaymentModal(false);
      if (refresh) refresh();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refresh, setPaymentFlow]);

  // Check subscription expiration warning (2 weeks)
  useEffect(() => {
    const checkExpirationWarning = async () => {
      if (user?.id && isSubscribed) {
        try {
          const isExpiringSoon = await optimizedSubscriptionService.isSubscriptionExpiringSoon(user.id);
          if (isExpiringSoon) {
            const expirationResult = await optimizedSubscriptionService.getSubscriptionExpiration(user.id);
            if (expirationResult.success && expirationResult.data?.daysRemaining) {
              toast({
                title: 'Abonnement verloopt binnenkort',
                description: `Je abonnement verloopt over ${expirationResult.data.daysRemaining} dagen. Zorg ervoor dat je betalingsgegevens up-to-date zijn.`,
                variant: 'destructive',
              });
            }
          }
        } catch (error) {
          // Silently ignore errors in expiration checking
        }
      }
    };

    // Check expiration warning on dashboard load
    checkExpirationWarning();
  }, [user?.id, isSubscribed, toast]);

  const onProfileComplete = async (profileData: any) => {
    await handleProfileComplete(profileData, () => {
      setShowProfileModal(false);
    });
  };

  const onDocumentUploadComplete = async (documents: any[]) => {
    await handleDocumentUploadComplete(documents, () => {
      setShowDocumentModal(false);
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {user && (
          <DashboardHeader
            user={{
              id: user.id,
              name: tenantProfile?.personalInfo?.fullName || user.user_metadata?.full_name || user.email,
              role: user.user_metadata?.role || 'huurder',
              email: user.email,
              isActive: true,
              createdAt: user.createdAt,
              hasPayment: isSubscribed,
              subscriptionEndDate: getSubscriptionEndDate(),
              profilePictureUrl: profilePictureUrl
            }}
            onSettings={handleSettings}
            onLogout={handleLogout}
          />
        )}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Content Sections - Proper Order */}
          <div className="max-w-4xl mx-auto space-y-6">
            {/* 1. Cover Photo, Profile Photo, and Stats Section */}
            <ProfilePhotoSection>
              <div className="relative mt-4 px-4">
                <StatsGrid stats={huurderStats} className="grid-cols-2 sm:grid-cols-4 bg-transparent shadow-none border-none" />
              </div>
            </ProfilePhotoSection>
            
            {/* 2. Profile Actions Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 mt-8">
              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="default" 
                  size="sm"
                  className="w-full justify-center text-xs sm:text-sm lg:text-base h-12 sm:h-9 lg:h-10"
                  onClick={() => setShowProfileModal(true)}
                >
                  <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden lg:inline">Profiel bewerken</span>
                  <span className="lg:hidden">Profiel</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-center text-xs sm:text-sm lg:text-base h-12 sm:h-9 lg:h-10"
                  onClick={() => setShowDocumentModal(true)}
                >
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden lg:inline">Documenten beheren</span>
                  <span className="lg:hidden">Documenten</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-center text-xs sm:text-sm lg:text-base h-12 sm:h-9 lg:h-10"
                  onClick={() => navigate('/property-search')}
                >
                  <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden lg:inline">Woningen zoeken</span>
                  <span className="lg:hidden">Zoeken</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-center text-xs sm:text-sm lg:text-base h-12 sm:h-9 lg:h-10"
                  onClick={() => navigate('/help-support')}
                >
                  <span className="hidden lg:inline">Help & Support</span>
                  <span className="lg:hidden">Help</span>
                </Button>
              </div>
            </div>
            
            {/* 3. Profile Overview - Third */}
            <ProfileOverview 
              sections={profileSections}
              title="Profiel Overzicht"
              onEdit={() => setShowProfileModal(true)} 
              isCreating={!tenantProfile}
            />
            <DocumentsSection 
              userDocuments={userDocuments} 
              onShowDocumentModal={() => setShowDocumentModal(true)}
              title="Mijn Documenten"
              emptyStateTitle="Nog geen documenten geüpload."
              emptyStateDescription="Klik op 'Document Uploaden' om te beginnen."
            />
          </div>
        </div>
      </div>
      <DashboardModals
        showProfileModal={showProfileModal}
        showDocumentModal={showDocumentModal}
        showPaymentModal={showPaymentModal} 
        hasProfile={!!tenantProfile}
        setShowProfileModal={setShowProfileModal}
        setShowDocumentModal={setShowDocumentModal}
        setShowPaymentModal={setShowPaymentModal}
        onProfileComplete={onProfileComplete}
        onDocumentUploadComplete={onDocumentUploadComplete}
        user={user}
        tenantProfile={tenantProfile}
      />
    </>
  );
};

export default withAuth(HuurderDashboard, 'huurder');
