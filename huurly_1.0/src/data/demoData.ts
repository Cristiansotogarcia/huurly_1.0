/**
 * Demo data file - CLEANED for production testing
 * Dashboard data removed, but login credentials preserved
 */

import { User, TenantProfile, LandlordProfile, Property, Document, ViewingInvitation, Issue } from '@/types';

// Demo users for login credentials (preserved for testing)
export const demoUsers: User[] = [
  {
    id: 'demo-huurder-1',
    email: 'emma.bakker@email.nl',
    name: 'Emma Bakker',
    role: 'huurder',
    isActive: true,
    hasPayment: true,
    createdAt: '2024-01-15T10:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'demo-verhuurder-1',
    email: 'bas.verhuur@email.nl',
    name: 'Bas van der Berg',
    role: 'verhuurder',
    isActive: true,
    hasPayment: false,
    createdAt: '2024-01-10T09:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'demo-beoordelaar-1',
    email: 'lisa.reviewer@huurly.nl',
    name: 'Lisa de Vries',
    role: 'beoordelaar',
    isActive: true,
    hasPayment: false,
    createdAt: '2024-01-05T08:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'demo-beheerder-1',
    email: 'admin@huurly.nl',
    name: 'Admin Huurly',
    role: 'beheerder',
    isActive: true,
    hasPayment: false,
    createdAt: '2024-01-01T00:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  }
];

// EMPTY ARRAYS - Dashboard data cleaned for real-world testing

export const demoTenantProfiles: TenantProfile[] = [];

export const demoLandlordProfiles: LandlordProfile[] = [];

export const demoViewingInvitations: ViewingInvitation[] = [];

export const demoIssues: Issue[] = [];

export const demoDocuments: Document[] = [];

// Reset statistics to zero for clean testing
export const demoStatistics = {
  platform: {
    totalUsers: 0,
    activeUsers: 0,
    totalProperties: 0,
    successfulMatches: 0,
    pendingDocuments: 0,
    monthlyRevenue: 0,
    userGrowth: 0,
    matchSuccessRate: 0
  },
  landlord: {
    totalProperties: 0,
    activeProperties: 0,
    totalViews: 0,
    totalApplications: 0,
    acceptedApplications: 0,
    pendingApplications: 0,
    monthlyRevenue: 0
  },
  tenant: {
    profileViews: 0,
    invitationsReceived: 0,
    applicationsSubmitted: 0,
    acceptedApplications: 0,
    pendingApplications: 0,
    documentsApproved: 0,
    documentsPending: 0
  },
  reviewer: {
    documentsReviewed: 0,
    documentsApproved: 0,
    documentsRejected: 0,
    avgReviewTime: '0 uur',
    pendingReviews: 0,
    weeklyGoal: 50,
    weeklyCompleted: 0
  }
};

// Helper function to check if we're in demo mode
export const isDemoMode = (): boolean => {
  return import.meta.env.VITE_DEMO_MODE === 'true';
};

// Empty state messages for clean UI
export const EMPTY_STATE_MESSAGES = {
  noUsers: 'Nog geen gebruikers geregistreerd',
  noProperties: 'Nog geen woningen toegevoegd',
  noDocuments: 'Nog geen documenten geüpload',
  noViewings: 'Nog geen bezichtigingen gepland',
  noIssues: 'Geen openstaande issues',
  noNotifications: 'Geen nieuwe notificaties'
};
