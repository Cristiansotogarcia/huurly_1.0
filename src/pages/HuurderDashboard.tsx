import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/UserService";
import { documentService } from "@/services/DocumentService";
import { DashboardService } from "@/services/DashboardService";
import {
  Home,
  FileText,
  Calendar,
  User,
  Eye,
  TrendingUp,
  Upload,
  Search,
  Bell,
  Settings,
  CheckCircle,
  Loader2,
} from "lucide-react";
import EnhancedProfileCreationModal from "@/components/modals/EnhancedProfileCreationModal";
import DocumentUploadModal from "@/components/modals/DocumentUploadModal";
import PropertySearchModal from "@/components/modals/PropertySearchModal";
import NotificationBell from "@/components/NotificationBell";
import { notifyDocumentUploaded } from "@/hooks/useNotifications";
import { Logo } from "@/components/Logo";
import { PaymentModal } from "@/components/PaymentModal";
import { authService } from "@/lib/auth"; // Import authService

// Standardized components
import { StatsWidget } from "@/components/standard/StatsWidget";
import { EmptyState } from "@/components/standard/EmptyState";
import { StandardCard } from "@/components/standard/StandardCard";
import { UI_TEXT } from "@/utils/constants";

const HuurderDashboard = () => {
  const { user, login } = useAuthStore();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLookingForPlace, setIsLookingForPlace] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [userDocuments, setUserDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [stats, setStats] = useState({
    profileViews: 0,
    invitations: 0,
    applications: 0,
    acceptedApplications: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { toast } = useToast();

  console.log("HuurderDashboard: Current user:", user);
  console.log("HuurderDashboard: User role:", user?.role);
  console.log("HuurderDashboard: Is loading:", isLoading);

  // Initialize loading state and handle payment success redirect
  useEffect(() => {
    setIsLoading(false);
    if (user) {
      const paymentSuccessParam = searchParams.get('payment');

      if (paymentSuccessParam === 'success' && !user.hasPayment) {
        setIsVerifyingPayment(true);
        const verifyPaymentStatus = async () => {
          let attempts = 0;
          const maxAttempts = 10; // Try up to 10 times
          const delay = 1000; // 1 second delay between attempts

          while (attempts < maxAttempts) {
            console.log(`Attempt ${attempts + 1} to verify payment status...`);
            const refreshedUser = await authService.getCurrentUser(); // Re-fetch user
            if (refreshedUser && refreshedUser.hasPayment) {
              login(refreshedUser); // Update store with correct status
              setIsVerifyingPayment(false);
              toast({
                title: 'Betaling succesvol!',
                description: 'Je account is nu actief. Welkom bij Huurly!',
              });
              // Clear the payment=success param from URL
              navigate('/huurder-dashboard', { replace: true });
              break;
            }
            attempts++;
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          if (attempts === maxAttempts) {
            console.error('Failed to verify payment status after multiple attempts.');
            setIsVerifyingPayment(false);
            toast({
              title: 'Betaling verificatie mislukt',
              description: 'We konden je betalingsstatus niet verifiëren. Probeer opnieuw in te loggen of neem contact op met support.',
              variant: 'destructive',
            });
          }
        };
        verifyPaymentStatus();
      } else {
        setShowPaymentModal(!user.hasPayment);
      }
      
      // Show success popup only once after payment if localStorage flag is set
      const hasShownSuccessPopup = localStorage.getItem('hasShownPaymentSuccessPopup');
      if (hasShownSuccessPopup && !showSuccessPopup) {
        setShowSuccessPopup(true);
        // Remove the flag so it doesn't show again
        localStorage.removeItem('hasShownPaymentSuccessPopup');
      }
    }
  }, [user, searchParams, navigate, login, toast]);

  // Load profile, documents, and stats
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      console.log("Loading profile and documents for user:", user.id);
      
      // Load profile data
      const tenantProfileResult = await userService.getTenantProfile(user.id);
      if (tenantProfileResult.success && tenantProfileResult.data) {
        setHasProfile(true);
        console.log("Tenant profile loaded:", tenantProfileResult.data);
        // Note: is_looking_for_place field doesn't exist in current schema
        // This will be added in Phase 2 of the production fixes
        // For now, we keep the default state value
      } else {
        // Fallback to check basic profile
        const profileResult = await userService.getProfile(user.id);
        if (profileResult.success && profileResult.data) {
          setHasProfile(true);
          console.log("Basic profile loaded:", profileResult.data);
        }
      }

      // Load documents
      const docsResult = await documentService.getDocumentsByUser(user.id);
      if (docsResult.success && docsResult.data) {
        setUserDocuments(docsResult.data);
        console.log("Documents loaded:", docsResult.data);
      }

      // Load user statistics
      await loadUserStats();
    })();
  }, [user?.id]);

  const loadUserStats = async () => {
    if (!user?.id) return;
    
    setIsLoadingStats(true);
    try {
      // Use the new DashboardService
      const result = await DashboardService.getHuurderStats(user.id);
      
      if (result.success && result.data) {
        setStats({
          profileViews: result.data.profileViews,
          invitations: result.data.invitations,
          applications: result.data.applications,
          acceptedApplications: result.data.acceptedApplications
        });
      } else {
        // Fallback to zeros if service fails
        setStats({
          profileViews: 0,
          invitations: 0,
          applications: 0,
          acceptedApplications: 0
        });
      }
      
      console.log("User stats loaded with DashboardService");
    } catch (error) {
      console.error("Error loading user stats:", error);
      // Fallback to zeros if everything fails
      setStats({
        profileViews: 0,
        invitations: 0,
        applications: 0,
        acceptedApplications: 0
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const toggleLookingStatus = async () => {
    if (!user?.id || isUpdatingStatus) return;
    
    const newStatus = !isLookingForPlace;
    setIsUpdatingStatus(true);
    
    try {
      // Update the database with the new status
      // Use any type to bypass TypeScript until types are updated
      const result = await userService.updateProfile(user.id, {
        is_looking_for_place: newStatus
      } as any);
      
      if (result.success) {
        setIsLookingForPlace(newStatus);
        toast({
          title: "Status bijgewerkt",
          description: newStatus
            ? "Je profiel is nu zichtbaar voor verhuurders"
            : "Je profiel is nu niet zichtbaar voor verhuurders",
        });
      } else {
        toast({
          title: "Fout bij bijwerken status",
          description: result.error?.message || "Er is iets misgegaan bij het bijwerken van je status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating looking status:", error);
      toast({
        title: "Fout bij bijwerken status",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleProfileComplete = async (profileData: any) => {
    if (!user?.id) return;
    
    // Always use updateTenantProfile since we're always in edit mode
    const result = await userService.updateTenantProfile(profileData);
    
    if (result.success) {
      setHasProfile(true);
      toast({
        title: "Profiel bijgewerkt!",
        description:
          "Je profiel is succesvol bijgewerkt en is nu zichtbaar voor verhuurders.",
      });
      
      // Reload profile and documents data
      const tenantProfileResult = await userService.getTenantProfile(user.id);
      if (tenantProfileResult.success && tenantProfileResult.data) {
        console.log("Updated tenant profile loaded:", tenantProfileResult.data);
      }
      
      // Reload documents
      const docsResult = await documentService.getDocumentsByUser(user.id);
      if (docsResult.success && docsResult.data) {
        setUserDocuments(docsResult.data);
      }
      
      // Reload stats
      await loadUserStats();
    } else {
      toast({
        title: "Fout bij bijwerken profiel",
        description: result.error?.message || 'Er is iets misgegaan.',
        variant: "destructive",
      });
    }
  };

  const handleDocumentUploadComplete = async (documents: any[]) => {
    // Reload user documents to get the latest data
    if (user?.id) {
      const docsResult = await documentService.getDocumentsByUser(user.id);
      if (docsResult.success && docsResult.data) {
        setUserDocuments(docsResult.data);
      }
    }

    // Notify beoordelaars about new documents
    documents.forEach((doc) => {
      notifyDocumentUploaded(
        user?.name || "Onbekende gebruiker",
        doc.document_type === "identity"
          ? "identiteitsbewijs"
          : doc.document_type === "payslip"
            ? "loonstrook"
            : doc.document_type === "employment_contract"
              ? "arbeidscontract"
              : doc.document_type === "reference"
                ? "referentie"
                : "document",
        "beoordelaar-demo-id", // In real app, this would be actual beoordelaar ID
      );
    });

    toast({
      title: "Documenten geüpload",
      description: `${documents.length} document(en) zijn geüpload voor beoordeling.`,
    });
  };

  const handleStartSearch = () => {
    if (!hasProfile) {
      toast({
        title: "Profiel vereist",
        description:
          "Maak eerst je profiel aan voordat je kunt zoeken naar woningen.",
        variant: "destructive",
      });
      setShowProfileModal(true);
      return;
    }

    setShowSearchModal(true);
  };

  const handleReportIssue = () => {
    // TODO: connect with IssueService
    toast({
      title: "Issue gerapporteerd",
      description:
        "Je probleem is gerapporteerd en wordt onderzocht door ons team.",
    });
  };

  const handleSettings = () => {
    toast({
      title: "Instellingen",
      description: "Instellingen functionaliteit wordt binnenkort toegevoegd.",
    });
  };

  const handleHelpSupport = () => {
    toast({
      title: "Help & Support",
      description: "Help & Support functionaliteit wordt binnenkort toegevoegd.",
    });
  };

  const handleLogout = async () => {
    try {
      // Direct approach - clear Supabase session and local storage
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local storage
      localStorage.removeItem('auth-storage');
      
      // Clear auth store
      useAuthStore.getState().logout();
      
      // Navigate to home
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback - force logout
      localStorage.removeItem('auth-storage');
      useAuthStore.getState().logout();
      window.location.href = '/';
    }
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  // Calculate subscription end date (1 year from subscription start)
  const getSubscriptionEndDate = () => {
    if (user?.hasPayment) {
      // For now, we'll calculate 1 year from current date since we don't have subscription_start_date
      // In production, this should come from the subscription data
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      return endDate.toLocaleDateString('nl-NL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return null;
  };

  // Show loading state while checking authentication
  if (isLoading || isVerifyingPayment) {
    console.log("Showing loading state");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">{isVerifyingPayment ? "Betaling verifiëren..." : "Laden..."}</h2>
              <p className="text-gray-600">{isVerifyingPayment ? "Even geduld, we controleren je betalingsstatus." : "Dashboard wordt geladen..."}</p>
              {isVerifyingPayment && <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mt-4" />}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied if no user or wrong role
  if (!user) {
    console.log("No user found, showing access denied");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Toegang geweigerd</h2>
              <p className="text-gray-600 mb-4">
                Je moet ingelogd zijn om het huurder dashboard te bekijken.
              </p>
              <Button onClick={handleGoHome}>
                Terug naar home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== "huurder") {
    console.log("Wrong role, showing access denied. User role:", user.role);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Toegang geweigerd</h2>
              <p className="text-gray-600 mb-4">
                Je hebt geen toegang tot het huurder dashboard.
              </p>
              <Button onClick={handleGoHome}>
                Terug naar home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log("Rendering main dashboard content");

  return (
    <>
      <div
        className={
          showPaymentModal
            ? "min-h-screen bg-gray-50 filter blur-sm pointer-events-none select-none"
            : "min-h-screen bg-gray-50"
        }
      >
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Logo />
                <div className="ml-4 flex items-center">
                  <span className="text-gray-500">| Huurder Dashboard</span>
                  {user.hasPayment && (
                    <div className="ml-4 flex items-center space-x-2">
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                        Account Actief
                      </Badge>
                      <span className="text-sm text-gray-600">
                        tot {getSubscriptionEndDate()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <NotificationBell />
                <Button variant="ghost" size="sm" onClick={handleSettings}>
                  <Settings className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Welkom, {user.name}
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Uitloggen
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* One-time Payment Success Alert */}
          {showSuccessPopup && (
            <Card className="mb-8 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-green-800">Betaling succesvol!</h3>
                      <p className="text-sm text-green-700">Je account is nu actief. Welkom bij Huurly!</p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setShowSuccessPopup(false)}>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Welcome Card */}
              <StandardCard
                title={`Welkom, ${user.name}`}
                description="Dit is je persoonlijke dashboard. Hier kun je je profiel beheren, documenten uploaden en woningen zoeken."
                icon={<Home className="w-6 h-6" />}
              >
                <div className="flex flex-wrap gap-4">
                  {!hasProfile && (
                    <Button onClick={() => setShowProfileModal(true)}>
                      <User className="mr-2 h-4 w-4" /> Maak Profiel Aan
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShowDocumentModal(true)}>
                    <Upload className="mr-2 h-4 w-4" /> Documenten Uploaden
                  </Button>
                  <Button onClick={handleStartSearch}>
                    <Search className="mr-2 h-4 w-4" /> Zoek Woningen
                  </Button>
                </div>
              </StandardCard>

              {/* Profile Status */}
              <StandardCard
                title="Profiel Status"
                description="Beheer de zichtbaarheid van je profiel voor verhuurders."
                icon={<User className="w-6 h-6" />}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="looking-status"
                      checked={isLookingForPlace}
                      onCheckedChange={toggleLookingStatus}
                      disabled={isUpdatingStatus}
                    />
                    <label htmlFor="looking-status" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {isLookingForPlace ? "Ik zoek actief een woning" : "Ik zoek momenteel geen woning"}
                    </label>
                  </div>
                  {isUpdatingStatus && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
              </StandardCard>

              {/* Documents Section */}
              <StandardCard
                title="Mijn Documenten"
                description="Upload en beheer belangrijke documenten zoals loonstroken en identiteitsbewijzen."
                icon={<FileText className="w-6 h-6" />}
              >
                {userDocuments.length > 0 ? (
                  <ul className="space-y-2">
                    {userDocuments.map((doc) => (
                      <li key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                        <span className="text-sm font-medium">{doc.file_name}</span>
                        <Badge variant="secondary">{doc.status}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    title="Geen documenten geüpload"
                    description="Upload je documenten om je profiel compleet te maken."
                    actionText="Documenten Uploaden"
                    onAction={() => setShowDocumentModal(true)}
                  />
                )}
              </StandardCard>

              {/* Statistics Section */}
              <StatsWidget
                profileViews={stats.profileViews}
                invitations={stats.invitations}
                applications={stats.applications}
                acceptedApplications={stats.acceptedApplications}
                isLoading={isLoadingStats}
              />
            </div>

            {/* Sidebar / Quick Actions */}
            <div className="lg:col-span-1 space-y-8">
              <StandardCard
                title="Snelle Acties"
                description="Handige links voor snelle toegang."
                icon={<Calendar className="w-6 h-6" />}
              >
                <div className="space-y-4">
                  <Button variant="outline" className="w-full" onClick={() => setShowProfileModal(true)}>
                    <User className="mr-2 h-4 w-4" /> Profiel Bewerken
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setShowDocumentModal(true)}>
                    <Upload className="mr-2 h-4 w-4" /> Documenten Beheren
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleStartSearch}>
                    <Search className="mr-2 h-4 w-4" /> Woningen Zoeken
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleReportIssue}>
                    <Bell className="mr-2 h-4 w-4" /> Probleem Melden
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleHelpSupport}>
                    <Settings className="mr-2 h-4 w-4" /> Help & Support
                  </Button>
                </div>
              </StandardCard>

              {/* UI Text Card */}
              <StandardCard
                title="Belangrijke Informatie"
                description="Lees meer over onze voorwaarden en privacybeleid."
                icon={<FileText className="w-6 h-6" />}
              >
                <div className="space-y-2">
                  <a href="/algemene-voorwaarden" className="text-blue-600 hover:underline block">{UI_TEXT.algemeneVoorwaarden}</a>
                  <a href="/privacybeleid" className="text-blue-600 hover:underline block">{UI_TEXT.privacybeleid}</a>
                </div>
              </StandardCard>
            </div>
          </div>
        </div>
      </div>

      {showProfileModal && (
        <EnhancedProfileCreationModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onProfileComplete={handleProfileComplete}
          initialData={user}
        />
      )}

      {showDocumentModal && (
        <DocumentUploadModal
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          onUploadComplete={handleDocumentUploadComplete}
        />
      )}

      {showSearchModal && (
        <PropertySearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
        />
      )}

      {showPaymentModal && <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />}

