import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
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

// Standardized components
import { StatsWidget } from "@/components/standard/StatsWidget";
import { EmptyState } from "@/components/standard/EmptyState";
import { StandardCard } from "@/components/standard/StandardCard";

const HuurderDashboard = () => {
  const { user, login } = useAuthStore();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isLookingForPlace, setIsLookingForPlace] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [userDocuments, setUserDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  console.log("HuurderDashboard: Has payment:", user?.hasPayment);

  // Initialize dashboard and check payment status
  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(false);
      
      if (user) {
        // Simple payment modal logic - show if no payment
        setShowPaymentModal(!user.hasPayment);
      }
    };

    initializeDashboard();
  }, [user]);

  // Load profile, documents, and stats
  useEffect(() => {
    if (!user?.id) return;
    
    const loadDashboardData = async () => {
      console.log("Loading profile and documents for user:", user.id);
      
      // Load profile data
      const tenantProfileResult = await userService.getTenantProfile(user.id);
      if (tenantProfileResult.success && tenantProfileResult.data) {
        setHasProfile(true);
        console.log("Tenant profile loaded:", tenantProfileResult.data);
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
    };

    loadDashboardData();
  }, [user?.id]);

  const loadUserStats = async () => {
    if (!user?.id) return;
    
    setIsLoadingStats(true);
    try {
      const result = await DashboardService.getHuurderStats(user.id);
      
      if (result.success && result.data) {
        setStats({
          profileViews: result.data.profileViews,
          invitations: result.data.invitations,
          applications: result.data.applications,
          acceptedApplications: result.data.acceptedApplications
        });
      } else {
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
    
    const result = await userService.updateTenantProfile(profileData);
    
    if (result.success) {
      setHasProfile(true);
      toast({
        title: "Profiel bijgewerkt!",
        description:
          "Je profiel is succesvol bijgewerkt en is nu zichtbaar voor verhuurders.",
      });
      
      const tenantProfileResult = await userService.getTenantProfile(user.id);
      if (tenantProfileResult.success && tenantProfileResult.data) {
        console.log("Updated tenant profile loaded:", tenantProfileResult.data);
      }
      
      const docsResult = await documentService.getDocumentsByUser(user.id);
      if (docsResult.success && docsResult.data) {
        setUserDocuments(docsResult.data);
      }
      
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
    if (user?.id) {
      const docsResult = await documentService.getDocumentsByUser(user.id);
      if (docsResult.success && docsResult.data) {
        setUserDocuments(docsResult.data);
      }
    }

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
        "beoordelaar-demo-id",
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
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      await supabase.auth.signOut();
      localStorage.removeItem('auth-storage');
      useAuthStore.getState().logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('auth-storage');
      useAuthStore.getState().logout();
      window.location.href = '/';
    }
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const getSubscriptionEndDate = () => {
    if (user?.hasPayment) {
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

  // Show loading state while initializing
  if (isLoading) {
    console.log("Showing loading state");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Laden...</h2>
              <p className="text-gray-600">Dashboard wordt geladen...</p>
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
          {/* Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Welcome Card */}
              <StandardCard
                title={`Welkom, ${user.name}`}
                description="Dit is je persoonlijke dashboard. Hier kun je je profiel beheren, documenten uploaden en woningen zoeken."
                icon={Home}
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
                icon={User}
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
                icon={FileText}
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
                    icon={FileText}
                    title="Geen documenten geüpload"
                    description="Upload je documenten om je profiel compleet te maken."
                    action={{
                      label: "Documenten Uploaden",
                      onClick: () => setShowDocumentModal(true)
                    }}
                  />
                )}
              </StandardCard>

              {/* Statistics Section */}
              <StandardCard
                title="Statistieken"
                description="Overzicht van je activiteit op Huurly"
                icon={TrendingUp}
              >
                <div className="grid grid-cols-2 gap-4">
                  <StatsWidget
                    title="Profiel weergaven"
                    value={stats.profileViews}
                    icon={Eye}
                    loading={isLoadingStats}
                  />
                  <StatsWidget
                    title="Uitnodigingen"
                    value={stats.invitations}
                    icon={Calendar}
                    loading={isLoadingStats}
                  />
                  <StatsWidget
                    title="Aanvragen"
                    value={stats.applications}
                    icon={FileText}
                    loading={isLoadingStats}
                  />
                  <StatsWidget
                    title="Geaccepteerd"
                    value={stats.acceptedApplications}
                    icon={CheckCircle}
                    loading={isLoadingStats}
                  />
                </div>
              </StandardCard>
            </div>

            {/* Sidebar / Quick Actions */}
            <div className="lg:col-span-1 space-y-8">
              <StandardCard
                title="Snelle Acties"
                description="Handige links voor snelle toegang."
                icon={Calendar}
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

              <StandardCard
                title="Belangrijke Informatie"
                description="Lees meer over onze voorwaarden en privacybeleid."
                icon={FileText}
              >
                <div className="space-y-2">
                  <a href="/algemene-voorwaarden" className="text-blue-600 hover:underline block">Algemene Voorwaarden</a>
                  <a href="/privacybeleid" className="text-blue-600 hover:underline block">Privacybeleid</a>
                </div>
              </StandardCard>
            </div>
          </div>
        </div>
      </div>

      {showProfileModal && (
        <EnhancedProfileCreationModal
          open={showProfileModal}
          onOpenChange={setShowProfileModal}
          onComplete={handleProfileComplete}
          editMode={hasProfile}
        />
      )}

      {showDocumentModal && (
        <DocumentUploadModal
          open={showDocumentModal}
          onOpenChange={setShowDocumentModal}
          onUploadComplete={handleDocumentUploadComplete}
        />
      )}

      {showSearchModal && (
        <PropertySearchModal
          open={showSearchModal}
          onOpenChange={setShowSearchModal}
        />
      )}

      {showPaymentModal && <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />}
    </>
  );
};

export default HuurderDashboard;
