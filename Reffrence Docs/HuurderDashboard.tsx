
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
import { Eye, Calendar, FileText, CheckCircle, User as UserIcon, Briefcase, Home, Heart } from 'lucide-react';
import { DashboardModals } from "@/components/HuurderDashboard/DashboardModals";
// import { PaymentModal } from "@/components/PaymentModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { withAuth } from '@/hocs/withAuth';
import { User } from '@/types';

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

  const { handleSettings, handleLogout, onStartSearch, handleReportIssue, handleHelpSupport } = useHuurderActions(user);
  const { setPaymentFlow } = useAuthStore();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { toast } = useToast();
  
  // Define profile sections for the ProfileOverview component
  const profileSections: ProfileSection[] = tenantProfile ? [
    {
      title: 'Persoonlijke Informatie',
      icon: UserIcon,
      iconColor: 'text-blue-600',
      fields: [
        { label: 'Naam', value: tenantProfile.personalInfo?.fullName },
        { label: 'Email', value: user?.email },
        { label: 'Telefoonnummer', value: tenantProfile.personalInfo?.phone }, // Changed from phoneNumber to phone
        { label: 'Geboortedatum', value: tenantProfile.personalInfo?.dateOfBirth },
      ],
    },
    {
      title: 'Werk & Inkomen',
      icon: Briefcase,
      iconColor: 'text-green-600',
      fields: [
        { label: 'Beroep', value: tenantProfile.workAndIncome?.profession },
        { label: 'Werkgever', value: tenantProfile.workAndIncome?.employer },
        { label: 'Maandelijks Inkomen', value: tenantProfile.workAndIncome?.monthlyIncome },
      ],
    },
    {
      title: 'Woonvoorkeuren',
      icon: Home,
      iconColor: 'text-purple-600',
      fields: [
        { label: 'Gewenste Locatie', value: tenantProfile.housingPreferences?.city }, // Changed from desiredLocation to city
        { label: 'Budget', value: `€${tenantProfile.housingPreferences?.minBudget} - €${tenantProfile.housingPreferences?.maxBudget}` }, // Changed from budget to minBudget-maxBudget
        { label: 'Aantal Kamers', value: tenantProfile.housingPreferences?.bedrooms }, // Changed from numberOfRooms to bedrooms
      ],
    },
    {
      title: 'Levensstijl & Motivatie',
      icon: Heart,
      iconColor: 'text-red-600',
      fields: [
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

  useEffect(() => {
    if (user && !isSubscribed) {
      setShowPaymentModal(true);
    } else if (user && isSubscribed) {
      // Close payment modal when user becomes subscribed
      setShowPaymentModal(false);
    }
  }, [user, isSubscribed]);

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

          <DashboardContent>
            <StatsGrid stats={huurderStats} />
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
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <Button onClick={onStartSearch} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                Start Zoeken
              </Button>
              <Button onClick={handleReportIssue} className="w-full bg-red-500 hover:bg-red-600 text-white">
                Meld Probleem
              </Button>
              <Button onClick={handleHelpSupport} className="w-full bg-gray-500 hover:bg-gray-600 text-white">
                Help & Support
              </Button>
              <Button onClick={() => navigate('/subscription')} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
                Abonnement
              </Button>
            </div>
          </DashboardContent>
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
