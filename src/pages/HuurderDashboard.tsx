
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useHuurder } from '@/hooks/useHuurder';
import { useHuurderActions } from '@/hooks/useHuurderActions';
import { useAuthStore } from '@/store/authStore';
import { optimizedSubscriptionService } from '@/services/OptimizedSubscriptionService';
import { DashboardHeader, DashboardContent } from "@/components/dashboard";
import { StatsGrid } from '@/components/standard/StatsGrid';
import { DocumentsSection } from '@/components/standard/DocumentsSection';
import ProfileOverview, { ProfileSection } from '@/components/standard/ProfileOverview';
import { Eye, Calendar, FileText, CheckCircle, User as UserIcon, Briefcase, Home, Heart, AlertCircle } from 'lucide-react';
import { DashboardModals } from "@/components/HuurderDashboard/DashboardModals";
// import { PaymentModal } from "@/components/PaymentModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { withAuth } from '@/hocs/withAuth';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
// Cloudflare Images components removed - using R2 for documents only
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface HuurderDashboardProps {
  user: User;
}

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
      const requiredFields = ['profession', 'income', 'age', 'preferredLocations', 'maxRent']; // updated to English
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
        { label: 'Email', value: user?.email },
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
        { label: 'Woningvoorkeur', value: tenantProfile.housingPreferences ? Object.entries(tenantProfile.housingPreferences).map(([key, value]) => `${key}: ${value}`).join(', ') : '' },
      ],
    },
    {
      title: 'Levensstijl & Motivatie',
      icon: Heart,
      iconColor: 'text-red-600',
      fields: [
        { label: 'Beschrijving', value: tenantProfile.description },
        { label: 'Motivatie', value: tenantProfile.lifestyleAndMotivation?.motivation },
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


  // The auth store already handles session cleanup on browser close via
  // `setupConservativeLogout`. Adding another `beforeunload` handler here
  // caused the auth state to be cleared on a normal page refresh which in
  // turn triggered redirect loops during initialization.  The effect has been
  // removed to ensure refreshes keep the session intact.


  const isSubscribed = subscription && subscription.status === 'active';

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

  // Move before return, after other states and useEffects
  const [showProfileAlert, setShowProfileAlert] = useState(true);
  const [showDocumentsAlert, setShowDocumentsAlert] = useState(true);

  useEffect(() => {
    setShowProfileAlert(!isProfileComplete);
    setShowDocumentsAlert(missingDocuments);
  }, [isProfileComplete, missingDocuments]);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {user && (
          <DashboardHeader
            user={{
              id: user.id,
              name: user.user_metadata?.full_name || user.email,
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
          {/* Unified Profile Header - Desktop & Mobile */}
          <div className="max-w-4xl mx-auto mb-6">
            <div className="relative">
              {/* Simple Header without Cover/Profile Photos */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {user?.user_metadata?.full_name || user?.email}
                </h1>
                <p className="text-gray-600 mt-1">Huurder Dashboard</p>
              </div>
            </div>

            {/* Centralized Notifications & Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
              {/* Notifications */}
              <div className="space-y-3 mb-6">
                {showProfileAlert && (
                  <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-orange-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-800">Profiel onvolledig</p>
                        <p className="text-sm text-orange-700 mt-1">Vul je profiel aan om beter zichtbaar te zijn.</p>
                      </div>
                      <button 
                        onClick={() => setShowProfileAlert(false)}
                        className="ml-4 text-orange-400 hover:text-orange-600 text-xl"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
                {showDocumentsAlert && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Documenten ontbreken</p>
                        <p className="text-sm text-red-700 mt-1">Upload ontbrekende documenten.</p>
                      </div>
                      <button 
                        onClick={() => setShowDocumentsAlert(false)}
                        className="ml-4 text-red-400 hover:text-red-600 text-xl"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Centralized Stats */}
              <div className="mb-6">
                <StatsGrid stats={huurderStats} className="grid grid-cols-2 md:grid-cols-4 gap-4" />
              </div>

              {/* Centralized Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button 
                  variant="default" 
                  className="w-full justify-center"
                  onClick={() => setShowProfileModal(true)}
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Profiel bewerken
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-center"
                  onClick={() => setShowDocumentModal(true)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Documenten beheren
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-center"
                  onClick={() => navigate('/property-search')}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Woningen zoeken
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-center"
                  onClick={() => navigate('/help-support')}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </Button>
              </div>
            </div>
          </div>

          {/* Content Sections Below */}
          <div className="max-w-4xl mx-auto space-y-6">
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
      />
      {/* <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={() => {
          toast({
            title: "Betaling succesvol!",
            description: "Je account is nu volledig actief.",
            variant: "success",
          });
          refresh(); // Refresh user data to get new subscription status
        }}
        onPaymentError={(error) => {
          toast({
            title: "Betaling mislukt",
            description: error,
            variant: "destructive",
          });
        }}
      /> */}
    </>
  );
};

export default withAuth(HuurderDashboard, 'huurder');
