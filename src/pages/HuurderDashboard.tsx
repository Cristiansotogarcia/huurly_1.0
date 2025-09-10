import { useState, useEffect, useMemo } from "react";
import { useHuurder } from "@/hooks/useHuurder";
import { useHuurderActions } from "@/hooks/useHuurderActions";
import { useAuthStore } from "@/store/authStore";
import { optimizedSubscriptionService } from "@/services/OptimizedSubscriptionService";
import { DashboardHeader } from "@/components/dashboard";
import { PhotoSection } from "@/components/PhotoSection";
import ProfileOverview, {
  ProfileSection,
} from "@/components/standard/ProfileOverview";
import {
  User as UserIcon,
  Briefcase,
  Home,
  Heart,
  Shield,
  Users,
} from "lucide-react";
import { DashboardModals } from "@/components/HuurderDashboard/DashboardModals";
import { useToast } from "@/hooks/use-toast";
import { withAuth } from "@/hocs/withAuth";
import { User } from "@/types";
import {
  mapEmploymentStatusLabel,
  mapContractTypeLabel,
  mapPropertyTypeLabel,
  mapFurnishedPreferenceLabel,
  mapLeaseDurationPreferenceLabel,
  mapSexLabel,
  mapMaritalStatusLabel,
  mapCurrentLivingSituationLabel,
  mapReasonForMovingLabel,
} from "@/utils/labelMappers";

import { Button } from "@/components/ui/button";
import { FileText, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HuurderDashboardProps {
  user: User;
}

const buildProfileSections = (
  tenantProfile: any,
  user?: User | null,
): ProfileSection[] => {
  if (!tenantProfile) return [];

  // Calculate household size: tenant (1) + partner (optioneel 1) + kinderen + extra huisgenoten
  const householdSize =
    1 +
    (tenantProfile.hasPartner ? 1 : 0) +
    (tenantProfile.numberOfChildren || 0) +
    (tenantProfile.numberOfHousemates || 0);

  return [
    {
      title: "Persoonlijke Informatie",
      icon: UserIcon,
      iconColor: "text-blue-600",
      fields: [
        { label: "Naam", value: tenantProfile.personalInfo?.fullName },
        { label: "Email", value: user?.email, isHidden: true },
        { label: "Telefoonnummer", value: tenantProfile.personalInfo?.phone },
        {
          label: "Geboortedatum",
          value: tenantProfile.personalInfo?.dateOfBirth,
        },
        { label: "Geslacht", value: mapSexLabel(tenantProfile.personalInfo?.sex) },
        {
          label: "Nationaliteit",
          value: tenantProfile.personalInfo?.nationality,
        },
        {
          label: "Burgerlijke staat",
          value: mapMaritalStatusLabel(tenantProfile.personalInfo?.maritalStatus),
        },
        { label: "Leeftijd", value: tenantProfile.age },
        { label: "Partner", value: tenantProfile.hasPartner ? "Ja" : "Nee" },
        { label: "Partner naam", value: tenantProfile.partnerName },
        { label: "Partner beroep", value: tenantProfile.partnerProfession },
        {
          label: "Partner dienstverband",
          value: mapEmploymentStatusLabel(tenantProfile.partnerEmploymentStatus),
        },
        { label: "Partner inkomen", value: tenantProfile.partnerMonthlyIncome },
        {
          label: "Huishoudgrootte",
          value: householdSize,
        },
        {
          label: "Huidige woonsituatie",
          value: mapCurrentLivingSituationLabel(tenantProfile.currentLivingSituation),
        },
        { label: "Kinderen", value: tenantProfile.numberOfChildren },
        {
          label: "Leeftijden kinderen",
          value: tenantProfile.childrenAges?.join(", "),
        },
        { label: "Huisdieren", value: tenantProfile.hasPets ? "Ja" : "Nee" },
        { label: "Huisdier details", value: tenantProfile.petDetails },
        { label: "Roken", value: tenantProfile.smokes ? "Ja" : "Nee" },
        { label: "Rook details", value: tenantProfile.smokingDetails },
      ],
    },
    {
      title: "Werk & Inkomen",
      icon: Briefcase,
      iconColor: "text-green-600",
      fields: [
        { label: "Beroep", value: tenantProfile.profession },
        { label: "Werkgever", value: tenantProfile.workAndIncome?.employer },
        {
          label: "Dienstverband",
          value: mapEmploymentStatusLabel(tenantProfile.workAndIncome?.employmentStatus),
        },
        {
          label: "Contract type",
          value: mapContractTypeLabel(tenantProfile.workAndIncome?.contractType),
        },
        { label: "Maandelijks Inkomen", value: tenantProfile.income },
        { label: "Extra inkomen", value: tenantProfile.extraIncome },
        {
          label: "Beschrijving extra inkomen",
          value: tenantProfile.extraIncomeDescription,
        },
        {
          label: "Thuiswerken",
          value: tenantProfile.workAndIncome?.workFromHome ? "Ja" : "Nee",
        },
        {
          label: "Inkomensbewijs beschikbaar",
          value: tenantProfile.incomeProofAvailable ? "Ja" : "Nee",
        },
      ],
    },
    {
      title: "Woonvoorkeuren",
      icon: Home,
      iconColor: "text-purple-600",
      fields: [
        {
          label: "Gewenste Locatie",
          value: tenantProfile.preferredLocations && tenantProfile.preferredLocations.length > 0
            ? tenantProfile.preferredLocations
                .map((location: any) => {
                  if (location && location.name) {
                    return location.radius ? `${location.name} (${location.radius}km)` : location.name;
                  }
                  return null; // Filter out invalid entries
                })
                .filter((name: any) => name && typeof name === 'string' && name.trim() !== '')
                .join(', ')
            : 'Geen voorkeur opgegeven',
        },
        { label: "Budget", value: tenantProfile.maxRent },
        { label: "Min Kamers", value: tenantProfile.minRooms },
        { label: "Max Kamers", value: tenantProfile.maxRooms },
        {
          label: "Vroegste Verhuisdatum",
          value: tenantProfile.earliestMoveDate,
        },
        {
          label: "Voorkeur Verhuisdatum",
          value: tenantProfile.preferredMoveDate,
        },
        {
          label: "Beschikbaarheid Flexibel",
          value: tenantProfile.availabilityFlexible ? "Ja" : "Nee",
        },
        {
          label: "Woningtype",
          value: mapPropertyTypeLabel(tenantProfile.housingPreferences?.propertyType),
        },
        {
          label: "Gemeubileerd voorkeur",
          value: mapFurnishedPreferenceLabel(tenantProfile.housingPreferences?.furnishedPreference),
        },
        {
          label: "Parkeren vereist",
          value: tenantProfile.housingPreferences?.parkingRequired
            ? "Ja"
            : "Nee",
        },
        {
          label: "Opslag nodig",
          value: tenantProfile.housingPreferences?.storageNeeds ? "Ja" : "Nee",
        },
        {
          label: "Huurcontract voorkeur",
          value: mapLeaseDurationPreferenceLabel(tenantProfile.housingPreferences?.leaseDurationPreference),
        },
        {
          label: "Reden voor verhuizing",
          value: mapReasonForMovingLabel(tenantProfile.housingPreferences?.reasonForMoving),
        },
        {
          label: "Opslag kelder",
          value: tenantProfile.storageKelder ? "Ja" : "Nee",
        },
        {
          label: "Opslag zolder",
          value: tenantProfile.storageZolder ? "Ja" : "Nee",
        },
        {
          label: "Opslag berging",
          value: tenantProfile.storageBerging ? "Ja" : "Nee",
        },
        {
          label: "Opslag garage",
          value: tenantProfile.storageGarage ? "Ja" : "Nee",
        },
        {
          label: "Opslag schuur",
          value: tenantProfile.storageSchuur ? "Ja" : "Nee",
        },
      ],
    },
    {
      title: "Borgsteller",
      icon: Shield,
      iconColor: "text-orange-600",
      fields: [
        {
          label: "Borgsteller beschikbaar",
          value: tenantProfile.guarantorAvailable ? "Ja" : "Nee",
        },
        {
          label: "Borgsteller Naam",
          value:
            tenantProfile.guarantorDetails?.name || tenantProfile.guarantorName,
        },
        {
          label: "Borgsteller Relatie",
          value:
            tenantProfile.guarantorDetails?.relationship ||
            tenantProfile.guarantorRelationship,
        },
        {
          label: "Borgsteller Telefoon",
          value:
            tenantProfile.guarantorDetails?.phone ||
            tenantProfile.guarantorPhone,
        },
        {
          label: "Borgsteller E-mail",
          value:
            tenantProfile.guarantorEmail || tenantProfile.guarantorDetails?.email,
        },
        {
          label: "Borgsteller Inkomen",
          value:
            tenantProfile.guarantorDetails?.income ||
            tenantProfile.guarantorIncome,
        },
      ],
    },
    {
      title: "Referenties & Geschiedenis",
      icon: Users,
      iconColor: "text-indigo-600",
      fields: [
        {
          label: "Referenties beschikbaar",
          value: tenantProfile.referencesAvailable ? "Ja" : "Nee",
        },
        {
          label: "Huurgeschiedenis (jaren)",
          value: tenantProfile.rentalHistoryYears,
        },
      ],
    },
    {
      title: "Levensstijl & Motivatie",
      icon: Heart,
      iconColor: "text-red-600",
      fields: [
        { label: "Beschrijving", value: tenantProfile.description || "N.v.t." },
        {
          label: "Motivatie",
          value: tenantProfile.lifestyleAndMotivation?.motivation || "N.v.t.",
        },
      ],
    },
  ];
};

  const HuurderDashboard: React.FC<HuurderDashboardProps> = () => {
  const huurderHook = useHuurder();
  const {
    user,
    isLoading: isHuurderLoading,
        profilePictureUrl,
    tenantProfile,
    subscription,
    refresh,
    getSubscriptionEndDate,
    handleProfileComplete,
    handleDocumentUploadComplete,
  } = huurderHook;
  // Verwijderde matching, messaging, notifications en navigate hooks
  const {
    handleSettings,
    handleLogout,
  } = useHuurderActions();
  const { setPaymentFlow, isLoadingSubscription } = useAuthStore();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [hasInitialDataLoaded, setHasInitialDataLoaded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Calculate profile completeness
  
  const profileSections = useMemo(
    () => buildProfileSections(tenantProfile, user),
    [tenantProfile, user],
  );

  const isSubscribed = subscription && subscription.status === "active";
  const isLoading = isHuurderLoading;

  // Track when initial data has been loaded to prevent modal flash
  useEffect(() => {
    if (user && !isLoadingSubscription && !hasInitialDataLoaded) {
      setHasInitialDataLoaded(true);
    }
  }, [user, isLoadingSubscription, hasInitialDataLoaded]);

  useEffect(() => {
    // Only show payment modal if user is loaded, initial data has loaded, subscription is not loading, and user is not subscribed
    if (
      user &&
      hasInitialDataLoaded &&
      !isLoading &&
      !isLoadingSubscription &&
      !isSubscribed
    ) {
      setShowPaymentModal(true);
    } else if (user && (isSubscribed || isLoadingSubscription)) {
      // Close payment modal when user becomes subscribed or while loading
      setShowPaymentModal(false);
    }
  }, [user, isSubscribed, isLoadingSubscription, hasInitialDataLoaded]);

  // Handle payment cancellation redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("payment_canceled")) {
      // Clear payment flow state when payment is cancelled
      setPaymentFlow(false);
      toast({
        title: "Betaling Geannuleerd",
        description:
          "Je betaling is niet voltooid. Je kunt het opnieuw proberen.",
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, setPaymentFlow]);

  // Refresh subscription status when payment is successful
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("payment_success")) {
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
          const isExpiringSoon =
            await optimizedSubscriptionService.isSubscriptionExpiringSoon(
              user.id,
            );
          if (isExpiringSoon) {
            const expirationResult =
              await optimizedSubscriptionService.getSubscriptionExpiration(
                user.id,
              );
            if (
              expirationResult.success &&
              expirationResult.data?.daysRemaining
            ) {
              toast({
                title: "Abonnement verloopt binnenkort",
                description: `Je abonnement verloopt over ${expirationResult.data.daysRemaining} dagen. Zorg ervoor dat je betalingsgegevens up-to-date zijn.`,
                variant: "destructive",
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
              name:
                tenantProfile?.personalInfo?.fullName ||
                user.user_metadata?.full_name ||
                user.email,
              role: (user.user_metadata?.role ?? undefined) || "huurder",
              email: user.email || "",
              isActive: true as boolean,
              createdAt: user.createdAt,
              hasPayment: isSubscribed ?? undefined,
              subscriptionEndDate: getSubscriptionEndDate(),
              profilePictureUrl: profilePictureUrl ?? undefined,
            }}
            onSettings={handleSettings}
            onLogout={handleLogout}
          />
        )}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Content Sections - Proper Order */}
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Foto Sectie */}
            <PhotoSection>
            {/* Quick access buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 w-full">
            <Button
            className="flex flex-col items-center justify-center w-full h-32 sm:h-28 p-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-blue-700 font-semibold shadow-sm transition-colors"
            onClick={() => navigate("/documenten")}
            >
            <FileText className="h-8 w-8 mb-3" />
            <span className="text-center">Mijn Documenten</span>
            </Button>
            <Button
            className="flex flex-col items-center justify-center w-full h-32 sm:h-28 p-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-blue-700 font-semibold shadow-sm transition-colors"
            onClick={() => navigate("/reset-password")}
            >
            <Key className="h-8 w-8 mb-3" />
            <span className="text-center">Mijn gebruikersnaam en wachtwoord</span>
            </Button>
            </div>
            </PhotoSection>


            {/* Profiel Overzicht */}
            <ProfileOverview
            sections={profileSections}
            title="Profiel Overzicht"
            onEdit={() => setShowProfileModal(true)}
            isCreating={!tenantProfile}
            />
            {/* Quick access cards */}
            {/* Duplicate quick access cards removed */}
          </div>
        </div>
      </div>
      <DashboardModals
        showProfileModal={showProfileModal}
        showDocumentModal={showDocumentModal}
        showPaymentModal={showPaymentModal}
        setShowProfileModal={setShowProfileModal}
        setShowDocumentModal={setShowDocumentModal}
        setShowPaymentModal={setShowPaymentModal}
        onProfileComplete={onProfileComplete}
        onDocumentUploadComplete={onDocumentUploadComplete}
        user={user}
        tenantProfile={tenantProfile}
        profilePictureUrl={profilePictureUrl}
      />
    </>
  );
};

export default withAuth(HuurderDashboard, "huurder");
