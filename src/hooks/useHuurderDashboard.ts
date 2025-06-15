
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { dashboardDataService, HuurderDashboardData } from "@/services/DashboardDataService";
import { documentService } from "@/services/DocumentService";

export const useHuurderDashboard = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [dashboardData, setDashboardData] = useState<HuurderDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Load comprehensive dashboard data
  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    setIsLoadingStats(true);
    try {
      console.log("Loading comprehensive dashboard data for user:", user.id);
      
      const result = await dashboardDataService.getHuurderDashboardData(user.id);
      
      if (result.success && result.data) {
        setDashboardData(result.data);
        console.log("Dashboard data loaded successfully:", result.data);
      } else {
        console.error("Failed to load dashboard data:", result.error);
        toast({
          title: "Fout bij laden gegevens",
          description: "Kon dashboard gegevens niet laden. Probeer de pagina te vernieuwen.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Fout bij laden gegevens",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Initialize dashboard
  const initializeDashboard = async () => {
    setIsLoading(false);
  };

  const refreshDocuments = async () => {
    if (user?.id) {
      await loadDashboardData(); // Reload all data including documents
    }
  };

  const getSubscriptionEndDate = () => {
    if (dashboardData?.user.subscription_end_date) {
      return new Date(dashboardData.user.subscription_end_date).toLocaleDateString('nl-NL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return null;
  };

  // Load user statistics (now part of comprehensive data loading)
  const loadUserStats = async () => {
    await loadDashboardData();
  };

  return {
    user: dashboardData?.user || user,
    hasProfile: dashboardData?.profile.hasProfile || false,
    setHasProfile: (hasProfile: boolean) => {
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          profile: { ...dashboardData.profile, hasProfile }
        });
      }
    },
    userDocuments: dashboardData?.documents.documents || [],
    isLoading,
    subscriptionEndDate: dashboardData?.user.subscription_end_date,
    stats: dashboardData?.stats || {
      profileViews: 0,
      invitations: 0,
      applications: 0,
      acceptedApplications: 0
    },
    isLoadingStats,
    toast,
    initializeDashboard,
    loadDashboardData,
    loadUserStats,
    refreshDocuments,
    getSubscriptionEndDate
  };
};
