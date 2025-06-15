
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/UserService";
import { dashboardDataService } from "@/services/DashboardDataService";
import { notifyDocumentUploaded } from "@/hooks/useNotifications";

export const useHuurderActions = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLookingForPlace, setIsLookingForPlace] = useState(true);

  const toggleLookingStatus = async () => {
    if (!user?.id || isUpdatingStatus) return;
    
    const newStatus = !isLookingForPlace;
    setIsUpdatingStatus(true);
    
    try {
      console.log("Updating profile visibility status to:", newStatus);
      
      const result = await dashboardDataService.updateProfileVisibility(user.id, newStatus);
      
      if (result.success) {
        setIsLookingForPlace(newStatus);
        toast({
          title: "Status bijgewerkt",
          description: newStatus
            ? "Je profiel is nu zichtbaar voor verhuurders"
            : "Je profiel is nu niet zichtbaar voor verhuurders",
        });
        console.log("Profile visibility updated successfully");
      } else {
        toast({
          title: "Fout bij bijwerken status",
          description: result.error?.message || "Er is iets misgegaan bij het bijwerken van je status.",
          variant: "destructive",
        });
        console.error("Failed to update profile visibility:", result.error);
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

  const handleProfileComplete = async (profileData: any, onComplete: () => void) => {
    if (!user?.id) return;
    
    console.log("Completing profile update with live data service");
    
    const result = await userService.updateTenantProfile(profileData);
    
    if (result.success) {
      toast({
        title: "Profiel bijgewerkt!",
        description: "Je profiel is succesvol bijgewerkt en is nu zichtbaar voor verhuurders.",
      });
      onComplete();
      console.log("Profile completed successfully");
    } else {
      toast({
        title: "Fout bij bijwerken profiel",
        description: result.error?.message || 'Er is iets misgegaan.',
        variant: "destructive",
      });
      console.error("Failed to complete profile:", result.error);
    }
  };

  const handleDocumentUploadComplete = async (documents: any[], onComplete: () => void) => {
    console.log("Processing document upload completion for", documents.length, "documents");
    
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

    onComplete();
    console.log("Document upload completion processed");
  };

  const handleStartSearch = () => {
    console.log("Property search functionality is not available in this simplified version");
    toast({
      title: "Zoekfunctie",
      description: "De zoekfunctie is momenteel niet beschikbaar.",
    });
  };

  const handleReportIssue = () => {
    console.log("Issue reported by user");
    toast({
      title: "Issue gerapporteerd",
      description: "Je probleem is gerapporteerd en wordt onderzocht door ons team.",
    });
  };

  const handleSettings = () => {
    console.log("Settings accessed");
    toast({
      title: "Instellingen",
      description: "Instellingen functionaliteit wordt binnenkort toegevoegd.",
    });
  };

  const handleHelpSupport = () => {
    console.log("Help & Support accessed");
    toast({
      title: "Help & Support",
      description: "Help & Support functionaliteit wordt binnenkort toegevoegd.",
    });
  };

  const handleLogout = async () => {
    try {
      console.log("User logging out");
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      await supabase.auth.signOut();
      localStorage.removeItem('auth-storage');
      useAuthStore.getState().logout();
      window.location.href = '/';
      console.log("Logout completed");
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('auth-storage');
      useAuthStore.getState().logout();
      window.location.href = '/';
    }
  };

  const handleGoHome = () => {
    console.log("Navigating to home page");
    window.location.href = "/";
  };

  return {
    isLookingForPlace,
    isUpdatingStatus,
    toggleLookingStatus,
    handleProfileComplete,
    handleDocumentUploadComplete,
    handleStartSearch,
    handleReportIssue,
    handleSettings,
    handleHelpSupport,
    handleLogout,
    handleGoHome
  };
};
