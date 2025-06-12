import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import { UI_TEXT } from "@/utils/constants";

import { authService } from "@/lib/auth";

const HuurderDashboard = () => {
  const { user, login } = useAuthStore();
  const { signOut } = useAuth();
  const location = useLocation();
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

  // Initialize loading state
  useEffect(() => {
    setIsLoading(false);
    if (user) {
      setShowPaymentModal(!user.hasPayment);
    }
  }, [user]);

  // Check payment result in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const result = params.get('payment');
    if (result === 'success') {
      (async () => {
        // Force close payment modal immediately
        setShowPaymentModal(false);
        
        // Show success popup only once after payment
        const hasShownSuccessPopup = localStorage.getItem('hasShownPaymentSuccessPopup');
        if (!hasShownSuccessPopup) {
          setShowSuccessPopup(true);
          localStorage.setItem('hasShownPaymentSuccessPopup', 'true');
        }
        
        // Refresh user data
        const refreshed = await authService.getCurrentUser();
        if (refreshed) {
          login(refreshed);
          toast({
            title: 'Betaling succesvol!',
            description: 'Je account is nu actief. Welkom bij Huurly!',
          });
        } else {
          // Attempt to refresh the session if no user is returned
          await useAuthStore.getState().refreshSession?.();
        }
        
        // Clean up URL
        params.delete('payment');
        window.history.replaceState({}, '', location.pathname);
        
        // Force full page reload to ensure fresh state
        setTimeout(() => {
          window.location.reload();
        }, 1000); // Small delay to allow toast to show
      })();
    } else if (result === 'cancelled') {
      toast({
        title: 'Betaling geannuleerd',
        description: 'De betaling is geannuleerd.',
        variant: 'destructive',
      });
      params.delete('payment');
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.search, login, toast, location.pathname]);

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
      const { createClient } = await import('@supabase/supabase-js');
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
          {/* One-time Payment Success Alert */}
          {showSuccessPopup && (
            <Card className="mb-8 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-green-900">
                        Account Actief
                      </h3>
                      <p className="text-green-700">
                        Je hebt een actief abonnement (€65/jaar inclusief BTW).
                        Je profiel is zichtbaar voor verhuurders.
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowSuccessPopup(false)}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Toggle */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Zoekstatus</h3>
                  <p className="text-gray-600">
                    {isLookingForPlace
                      ? "Je profiel is zichtbaar voor verhuurders"
                      : "Je profiel is niet zichtbaar voor verhuurders"}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm">Niet zoekend</span>
                  <Switch
                    checked={isLookingForPlace}
                    onCheckedChange={toggleLookingStatus}
                  />
                  <span className="text-sm">Actief zoekend</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats - Standardized Components */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <StatsWidget
                  title="Profielweergaven"
                  value={stats.profileViews}
                  icon={TrendingUp}
                  color="dutch-blue"
                  loading={isLoadingStats}
                />
                <StatsWidget
                  title="Uitnodigingen"
                  value={stats.invitations}
                  icon={Calendar}
                  color="dutch-orange"
                  loading={isLoadingStats}
                />
                <StatsWidget
                  title="Aanmeldingen"
                  value={stats.applications}
                  icon={FileText}
                  color="green-600"
                  loading={isLoadingStats}
                />
                <StatsWidget
                  title="Geaccepteerd"
                  value={stats.acceptedApplications}
                  icon={Home}
                  color="purple-600"
                  loading={isLoadingStats}
                />
              </div>

              {/* Profile Setup */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Mijn Profiel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!hasProfile ? (
                    <div className="text-center py-8">
                      <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold mb-2">
                        Profiel nog niet compleet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Vul je profiel aan om zichtbaar te worden voor verhuurders
                      </p>
                      <Button
                        className="mr-2"
                        onClick={() => setShowProfileModal(true)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profiel aanmaken
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowDocumentModal(true)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Documenten uploaden
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                      <h3 className="text-lg font-semibold mb-2">
                        Profiel compleet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Je profiel is zichtbaar voor verhuurders. Je kunt je gegevens altijd bijwerken.
                      </p>
                      <Button
                        className="mr-2"
                        onClick={() => setShowProfileModal(true)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profiel bewerken
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowDocumentModal(true)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Documenten uploaden
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Property Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="w-5 h-5 mr-2" />
                    Woningen Zoeken
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">
                      Zoek je droomwoning
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Doorzoek duizenden woningen en vind je perfecte match
                    </p>
                    <Button onClick={handleStartSearch}>
                      <Search className="w-4 h-4 mr-2" />
                      Start zoeken
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Viewing Invitations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Bezichtigingen (0)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">{UI_TEXT.emptyStates.noViewings}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Documenten ({userDocuments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userDocuments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm mb-4">
                        {UI_TEXT.emptyStates.noDocuments}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDocumentModal(true)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload document
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-dutch-blue" />
                            <div>
                              <p className="font-medium">{doc.file_name}</p>
                              <p className="text-sm text-gray-500">
                                {doc.document_type === 'identity' ? 'Identiteitsbewijs' :
                                 doc.document_type === 'payslip' ? 'Loonstrook' :
                                 doc.document_type === 'employment_contract' ? 'Arbeidscontract' :
                                 doc.document_type === 'reference' ? 'Referentie' : doc.document_type}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant={doc.status === 'approved' ? 'default' : 
                                   doc.status === 'rejected' ? 'destructive' : 'secondary'}
                          >
                            {doc.status === 'pending' ? 'In behandeling' :
                             doc.status === 'approved' ? 'Goedgekeurd' :
                             doc.status === 'rejected' ? 'Afgewezen' : doc.status}
                          </Badge>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setShowDocumentModal(true)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Meer documenten uploaden
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Snelle Acties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full text-sm"
                      onClick={handleStartSearch}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Zoek woningen
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-sm"
                      onClick={() => setShowDocumentModal(true)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload documenten
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-sm"
                      onClick={handleReportIssue}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Probleem melden
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Help Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Hulp nodig?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <p className="text-gray-600">Als huurder kun je:</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Je profiel aanmaken en verifiëren</li>
                      <li>• Documenten uploaden voor verificatie</li>
                      <li>• Woningen zoeken en bekijken</li>
                      <li>• Bezichtigingen aanvragen</li>
                      <li>• Contact opnemen met verhuurders</li>
                    </ul>
                    <Button variant="outline" size="sm" className="w-full mt-3" onClick={handleHelpSupport}>
                      Help & Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Modals */}
        <EnhancedProfileCreationModal
          open={showProfileModal}
          onOpenChange={setShowProfileModal}
          onComplete={handleProfileComplete}
          editMode={true}
          existingProfileId={user?.id}
        />

        <DocumentUploadModal
          open={showDocumentModal}
          onOpenChange={setShowDocumentModal}
          onUploadComplete={handleDocumentUploadComplete}
        />

        <PropertySearchModal
          open={showSearchModal}
          onOpenChange={setShowSearchModal}
        />
      </div>
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        persistent
      />
    </>
  );
};

export default HuurderDashboard;
