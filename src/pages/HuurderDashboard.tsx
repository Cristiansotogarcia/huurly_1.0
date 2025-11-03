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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

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
                    // Extract city name only (remove province after comma)
                    const cityName = location.name.split(',')[0].trim();
                    return location.radius ? `${cityName} (${location.radius}km)` : cityName;
                  }
                  return null; // Filter out invalid entries
                })
                .filter((name: any) => name && typeof name === 'string' && name.trim() !== '')
                .join(' - ')
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
    handleLogout,
  } = useHuurderActions();
  const { setPaymentFlow } = useAuthStore();


  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [hasInitialDataLoaded, setHasInitialDataLoaded] = useState(false);
  const [profileViews, setProfileViews] = useState<number>(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const hasPaymentSuccess = urlParams.get("payment_success");

  // Calculate profile completeness

  const profileSections = useMemo(
    () => buildProfileSections(tenantProfile, user),
    [tenantProfile, user],
  );

  // Check if user is subscribed - if we have payment_success, assume they are subscribed
  const isSubscribed = (subscription && subscription.status === "active") || !!hasPaymentSuccess;
  const isLoading = isHuurderLoading;

  // Simple loading state management - just wait for user data
  useEffect(() => {
    if (user && !hasInitialDataLoaded) {
      setHasInitialDataLoaded(true);
    }
  }, [user, hasInitialDataLoaded]);

  // Fetch profile views count
  useEffect(() => {
    const fetchProfileViews = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('huurders')
            .select('profiel_weergaven')
            .eq('id', user.id)
            .single();

          if (!error && data) {
            setProfileViews(data.profiel_weergaven || 0);
          }
        } catch (error) {
          logger.error(`Error fetching profile views: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    };

    fetchProfileViews();
  }, [user?.id]);

  // Check subscription status and redirect if needed
  useEffect(() => {
    if (user && hasInitialDataLoaded && !isLoading) {
      // If user is not subscribed and not on payment page, redirect
      if (!isSubscribed) {
        const currentPath = window.location.pathname;
        if (currentPath !== '/payment-onboarding') {
          logger.info('User not subscribed, redirecting to payment onboarding');
          navigate('/payment-onboarding');
          return;
        }
      }
    }
  }, [user, isSubscribed, hasInitialDataLoaded, isLoading, navigate]);

  // Handle payment cancellation redirect
  useEffect(() => {
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
  }, [toast, setPaymentFlow, urlParams]);

  // Refresh subscription status when payment is successful
  useEffect(() => {
    if (urlParams.get("payment_success")) {
      // Clear payment flow state when payment succeeds
      setPaymentFlow(false);
      if (refresh) refresh();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refresh, setPaymentFlow, urlParams]);

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

  // Show loading screen only while waiting for user data
  if (!hasInitialDataLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dutch-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Account laden...</p>
        </div>
      </div>
    );
  }

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
            onLogout={handleLogout}
          />
        )}
        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {/* Content Sections - Proper Order */}
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Profile Views Statistics Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-blue-900">
                  <Eye className="h-5 w-5" />
                  Profiel Weergaven
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-blue-600">{profileViews}</span>
                  <span className="text-gray-600">verhuurders hebben je profiel bekeken</span>
                </div>
                {profileViews === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Tip: Maak je profiel compleet en actueel om meer aandacht van verhuurders te krijgen!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Foto Sectie */}
            <PhotoSection>
            {/* Quick access button - Mobile-first design */}
            <div className="grid grid-cols-1 gap-3 mt-6 w-full px-2">
            <Button
            className="flex items-center justify-start w-full min-h-[56px] p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 text-gray-700 font-semibold shadow-sm transition-all duration-200 border border-gray-200"
            onClick={() => navigate("/instellingen")}
            >
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-600 text-white mr-4 flex-shrink-0">
            <Settings className="h-6 w-6" />
            </div>
            <div className="text-left">
            <div className="font-semibold text-base">Instellingen</div>
            <div className="text-sm text-gray-600 opacity-75">Account beheren</div>
            </div>
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
        setShowProfileModal={setShowProfileModal}
        setShowDocumentModal={setShowDocumentModal}
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
