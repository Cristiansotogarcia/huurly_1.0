
import { useState, useEffect } from "react";
import { useHuurder } from '@/hooks/useHuurder';
import { useHuurderActions } from '@/hooks/useHuurderActions';
import { DashboardHeader, DashboardContent } from "@/components/dashboard";
import { StatsGrid } from '@/components/standard/StatsGrid';
import { DocumentsSection } from '@/components/standard/DocumentsSection';
import ProfileOverview, { ProfileSection } from '@/components/standard/ProfileOverview';
import { Eye, Calendar, FileText, CheckCircle, User as UserIcon, Briefcase, Home, Heart } from 'lucide-react';
import { DashboardModals } from "@/components/HuurderDashboard/DashboardModals";
import { SubscriptionModal } from "@/components/modals/SubscriptionModal";
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

  const { handleSettings, handleLogout, onStartSearch, handleReportIssue, handleHelpSupport } = useHuurderActions(user);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [isSubscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
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

  // Handle payment redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_success')) {
      toast({
        title: 'Betaling Gelukt!',
        description: 'Je abonnement is geactiveerd. Welkom bij Premium!',
        variant: 'success',
      });
      if (refresh) refresh();
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (urlParams.get('payment_canceled')) {
      toast({
        title: 'Betaling Geannuleerd',
        description: 'Je betaling is niet voltooid. Je kunt het opnieuw proberen.',
        variant: 'destructive',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refresh, toast]);

  // Handle payment redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_success')) {
      toast({
        title: 'Betaling Gelukt!',
        description: 'Je abonnement is geactiveerd. Welkom bij Premium!',
        variant: 'success',
      });
      if (refresh) refresh();
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (urlParams.get('payment_canceled')) {
      toast({
        title: 'Betaling Geannuleerd',
        description: 'Je betaling is niet voltooid. Je kunt het opnieuw proberen.',
        variant: 'destructive',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refresh, toast]);

  const isSubscribed = subscription && subscription.status === 'active';

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
  
  console.log("Rendering main dashboard content");

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {user && (
          <DashboardHeader
            user={{
              id: user.id,
              name: user.user_metadata.full_name || user.email,
              role: user.user_metadata.role || 'huurder',
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
          {!isSubscribed && user && (
            <div className="p-4 mb-6 text-center text-white bg-blue-500 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold">Word Premium!</h2>
              <p className="mt-2 mb-4">Krijg volledige toegang tot alle functies en vergroot je kansen om een woning te vinden.</p>
              <Button onClick={() => setSubscriptionModalOpen(true)} className="bg-white text-blue-500 hover:bg-gray-100">
                Abonneer nu voor €65/jaar
              </Button>
            </div>
          )}

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
            </div>
          </DashboardContent>
        </div>
      </div>

      <DashboardModals
        showProfileModal={showProfileModal}
        showDocumentModal={showDocumentModal}
        showPaymentModal={false} 
        hasProfile={!!tenantProfile}
        setShowProfileModal={setShowProfileModal}
        setShowDocumentModal={setShowDocumentModal}
        setShowPaymentModal={() => {}}
        onProfileComplete={onProfileComplete}
        onDocumentUploadComplete={onDocumentUploadComplete}
        user={user}
      />
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        onSuccess={() => {
          if (refresh) refresh();
          setSubscriptionModalOpen(false);
        }}
        userId={user?.id}
      />
    </>
  );
};

export default withAuth(HuurderDashboard, 'huurder');
