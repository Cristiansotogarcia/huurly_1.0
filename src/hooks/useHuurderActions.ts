
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/UserService";
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

  const handleProfileComplete = async (profileData: any, onComplete: () => void) => {
    if (!user?.id) return;
    
    const result = await userService.updateTenantProfile(profileData);
    
    if (result.success) {
      toast({
        title: "Profiel bijgewerkt!",
        description: "Je profiel is succesvol bijgewerkt en is nu zichtbaar voor verhuurders.",
      });
      onComplete();
    } else {
      toast({
        title: "Fout bij bijwerken profiel",
        description: result.error?.message || 'Er is iets misgegaan.',
        variant: "destructive",
      });
    }
  };

  const handleDocumentUploadComplete = async (documents: any[], onComplete: () => void) => {
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
  };

  const handleStartSearch = (hasProfile: boolean, onShowProfileModal: () => void, onShowSearchModal: () => void) => {
    if (!hasProfile) {
      toast({
        title: "Profiel vereist",
        description: "Maak eerst je profiel aan voordat je kunt zoeken naar woningen.",
        variant: "destructive",
      });
      onShowProfileModal();
      return;
    }

    onShowSearchModal();
  };

  const handleReportIssue = () => {
    toast({
      title: "Issue gerapporteerd",
      description: "Je probleem is gerapporteerd en wordt onderzocht door ons team.",
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
