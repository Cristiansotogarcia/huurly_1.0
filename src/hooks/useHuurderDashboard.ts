
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/UserService";
import { documentService } from "@/services/DocumentService";
import { DashboardService } from "@/services/DashboardService";
import { paymentService } from "@/services/PaymentService";

export const useHuurderDashboard = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [hasProfile, setHasProfile] = useState(false);
  const [userDocuments, setUserDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null);
  const [stats, setStats] = useState({
    profileViews: 0,
    invitations: 0,
    applications: 0,
    acceptedApplications: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Load actual subscription end date from payment records
  const loadSubscriptionEndDate = async () => {
    if (!user?.id) return;
    
    try {
      const result = await paymentService.checkSubscriptionStatus(user.id);
      if (result.success && result.data?.expiresAt) {
        setSubscriptionEndDate(result.data.expiresAt);
      }
    } catch (error) {
      console.error("Error loading subscription end date:", error);
    }
  };

  // Load user statistics
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

  // Load profile and documents
  const loadDashboardData = async () => {
    if (!user?.id) return;
    
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

  // Initialize dashboard
  const initializeDashboard = async () => {
    setIsLoading(false);
    
    if (user) {
      // Load actual subscription end date if user has payment
      if (user.hasPayment) {
        await loadSubscriptionEndDate();
      }
    }
  };

  const refreshDocuments = async () => {
    if (user?.id) {
      const docsResult = await documentService.getDocumentsByUser(user.id);
      if (docsResult.success && docsResult.data) {
        setUserDocuments(docsResult.data);
      }
    }
  };

  const getSubscriptionEndDate = () => {
    if (user?.hasPayment && subscriptionEndDate) {
      return new Date(subscriptionEndDate).toLocaleDateString('nl-NL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return null;
  };

  return {
    user,
    hasProfile,
    setHasProfile,
    userDocuments,
    isLoading,
    subscriptionEndDate,
    stats,
    isLoadingStats,
    toast,
    initializeDashboard,
    loadDashboardData,
    loadUserStats,
    refreshDocuments,
    getSubscriptionEndDate
  };
};
