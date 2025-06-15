
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { dashboardDataService } from "@/services/DashboardDataService";

interface DashboardStats {
  profileViews: number;
  invitations: number;
  applications: number;
  acceptedApplications: number;
}

export const useHuurderDashboard = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [hasProfile, setHasProfile] = useState(false);
  const [userDocuments, setUserDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    profileViews: 0,
    invitations: 0,
    applications: 0,
    acceptedApplications: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const initializeDashboard = async () => {
    console.log("Initializing dashboard...");
    setIsLoading(false);
  };

  const loadDashboardData = async () => {
    if (!user?.id) {
      console.log("No user ID available for loading dashboard data");
      return;
    }

    console.log("Loading dashboard data for user:", user.id);
    
    try {
      setIsLoadingStats(true);

      // Load tenant profile
      const profileResult = await dashboardDataService.getTenantProfile(user.id);
      if (profileResult.success && profileResult.data) {
        setHasProfile(true);
        console.log("Tenant profile found");
      } else {
        setHasProfile(false);
        console.log("No tenant profile found");
      }

      // Load user documents
      const documentsResult = await dashboardDataService.getUserDocuments(user.id);
      if (documentsResult.success) {
        setUserDocuments(documentsResult.data || []);
        console.log("User documents loaded:", documentsResult.data?.length || 0);
      }

      // Load dashboard stats
      const statsResult = await dashboardDataService.getTenantDashboardStats(user.id);
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
        console.log("Dashboard stats loaded:", statsResult.data);
      }

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Fout bij laden gegevens",
        description: "Er is een fout opgetreden bij het laden van je dashboard gegevens.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const refreshDocuments = async () => {
    if (!user?.id) return;
    
    const result = await dashboardDataService.getUserDocuments(user.id);
    if (result.success) {
      setUserDocuments(result.data || []);
    }
  };

  const getSubscriptionEndDate = () => {
    if (user?.subscriptionEndDate) {
      return new Date(user.subscriptionEndDate).toLocaleDateString('nl-NL');
    }
    return null;
  };

  return {
    user,
    hasProfile,
    setHasProfile,
    userDocuments,
    isLoading,
    stats,
    isLoadingStats,
    initializeDashboard,
    loadDashboardData,
    refreshDocuments,
    getSubscriptionEndDate
  };
};
