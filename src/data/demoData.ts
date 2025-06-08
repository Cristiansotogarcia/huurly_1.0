/**
 * Demo data file - PRODUCTION-LIKE DATA for realistic testing
 * Contains realistic data as if the platform is already in production
 */

import { User, TenantProfile, LandlordProfile, Property, Document, ViewingInvitation, Issue } from '@/types';
import { getEnvVar } from '@/lib/env';

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

// PRODUCTION-LIKE DATA - Realistic data for testing as if in production

export const demoTenantProfiles: TenantProfile[] = [
  {
    id: 'tenant-1',
    userId: 'demo-huurder-1',
    firstName: 'Emma',
    lastName: 'Bakker',
    email: 'emma.bakker@email.nl',
    phone: '+31 6 12345678',
    dateOfBirth: '1995-03-15',
    profession: 'Software Developer',
    monthlyIncome: 4500,
    income: 4500,
    bio: 'Rustige, betrouwbare huurder die op zoek is naar een moderne woning in Amsterdam. Werk als software developer bij een tech startup.',
    motivation: 'Ik ben op zoek naar een rustige woning waar ik kan werken en ontspannen.',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isLookingForPlace: true,
    verificationStatus: 'approved',
    preferences: {
      city: 'Amsterdam',
      minBudget: 1200,
      maxBudget: 1800,
      bedrooms: 2,
      propertyType: 'Appartement'
    },
    documents: [
      {
        id: 'doc-1',
        tenantId: 'demo-huurder-1',
        fileName: 'Identiteitsbewijs_Emma_Bakker.pdf',
        fileUrl: '/uploads/doc-1.pdf',
        type: 'id',
        status: 'approved',
        uploadedAt: '2024-01-16T10:00:00Z'
      },
      {
        id: 'doc-2',
        tenantId: 'demo-huurder-1',
        fileName: 'Inkomensverklaring_2024.pdf',
        fileUrl: '/uploads/doc-2.pdf',
        type: 'income',
        status: 'approved',
        uploadedAt: '2024-01-16T10:15:00Z'
      },
      {
        id: 'doc-3',
        tenantId: 'demo-huurder-1',
        fileName: 'Arbeidscontract_TechCorp.pdf',
        fileUrl: '/uploads/doc-3.pdf',
        type: 'employment',
        status: 'pending',
        uploadedAt: '2024-01-20T14:30:00Z'
      }
    ]
  }
];

export const demoProperties: Property[] = [
  {
    id: 'prop-1',
    landlordId: 'demo-verhuurder-1',
    title: 'Modern 2-kamer appartement in Amsterdam Centrum',
    description: 'Prachtig gerenoveerd appartement met moderne afwerking en veel lichtinval.',
    address: 'Prinsengracht 123',
    city: 'Amsterdam',
    rent: 1650,
    bedrooms: 2,
    propertyType: 'Appartement',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop'
    ],
    requirements: {
      minIncome: 4950,
      allowPets: false
    },
    isActive: true,
    availableFrom: '2024-02-01',
    deposit: 3300,
    utilities: 150
  },
  {
    id: 'prop-2',
    landlordId: 'demo-verhuurder-1',
    title: 'Ruime studio in Amsterdam Noord',
    description: 'Moderne studio met eigen keuken en badkamer, perfect voor young professionals.',
    address: 'Noorderdok 45',
    city: 'Amsterdam',
    rent: 1200,
    bedrooms: 1,
    propertyType: 'Studio',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
    ],
    requirements: {
      minIncome: 3600,
      allowPets: true
    },
    isActive: true,
    availableFrom: '2024-01-15',
    deposit: 2400,
    utilities: 100
  }
];

export const demoLandlordProfiles: LandlordProfile[] = [
  {
    id: 'landlord-1',
    userId: 'demo-verhuurder-1',
    companyName: 'Berg Properties',
    contactPerson: 'Bas van der Berg',
    email: 'bas.verhuur@email.nl',
    phone: '+31 6 87654321',
    properties: demoProperties
  }
];

export const demoViewingInvitations: ViewingInvitation[] = [
  {
    id: 'viewing-1',
    tenantId: 'demo-huurder-1',
    propertyId: 'prop-1',
    landlordId: 'demo-verhuurder-1',
    scheduledDate: '2024-01-25T14:00:00Z',
    deadline: '2024-01-24T12:00:00Z',
    status: 'pending',
    message: 'Graag zou ik een bezichtiging inplannen voor dit mooie appartement.',
    createdAt: '2024-01-22T09:00:00Z'
  },
  {
    id: 'viewing-2',
    tenantId: 'demo-huurder-1',
    propertyId: 'prop-2',
    landlordId: 'demo-verhuurder-1',
    scheduledDate: '2024-01-23T16:00:00Z',
    deadline: '2024-01-22T18:00:00Z',
    status: 'accepted',
    message: 'Bezichtiging bevestigd voor morgen om 16:00.',
    createdAt: '2024-01-21T11:30:00Z'
  }
];

export const demoIssues: Issue[] = [
  {
    id: 'issue-1',
    reporterId: 'demo-huurder-1',
    reporterRole: 'huurder',
    title: 'Document upload probleem',
    description: 'Gebruiker kan geen PDF documenten uploaden groter dan 5MB',
    category: 'technical',
    status: 'open',
    priority: 'medium',
    createdAt: '2024-01-22T10:30:00Z',
    notes: [
      {
        id: 'note-1',
        issueId: 'issue-1',
        authorId: 'demo-beoordelaar-1',
        content: 'Probleem gereproduceerd, onderzoek naar file size limits.',
        createdAt: '2024-01-22T11:00:00Z'
      }
    ]
  }
];

export const demoDocuments: Document[] = [
  {
    id: 'doc-1',
    tenantId: 'demo-huurder-1',
    fileName: 'Identiteitsbewijs_Emma_Bakker.pdf',
    fileUrl: '/uploads/doc-1.pdf',
    type: 'id',
    status: 'approved',
    uploadedAt: '2024-01-16T10:00:00Z'
  },
  {
    id: 'doc-2',
    tenantId: 'demo-huurder-1',
    fileName: 'Inkomensverklaring_2024.pdf',
    fileUrl: '/uploads/doc-2.pdf',
    type: 'income',
    status: 'approved',
    uploadedAt: '2024-01-16T10:15:00Z'
  },
  {
    id: 'doc-3',
    tenantId: 'demo-huurder-1',
    fileName: 'Arbeidscontract_TechCorp.pdf',
    fileUrl: '/uploads/doc-3.pdf',
    type: 'employment',
    status: 'pending',
    uploadedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 'doc-4',
    tenantId: 'demo-huurder-1',
    fileName: 'Referentie_Vorige_Verhuurder.pdf',
    fileUrl: '/uploads/doc-4.pdf',
    type: 'reference',
    status: 'pending',
    uploadedAt: '2024-01-21T09:00:00Z'
  }
];

// Realistic production statistics
export const demoStatistics = {
  platform: {
    totalUsers: 2847,
    activeUsers: 1923,
    totalProperties: 456,
    successfulMatches: 234,
    pendingDocuments: 12,
    monthlyRevenue: 18750,
    userGrowth: 12.5,
    matchSuccessRate: 78.3
  },
  landlord: {
    totalProperties: 3,
    activeProperties: 2,
    totalViews: 127,
    totalApplications: 23,
    acceptedApplications: 8,
    pendingApplications: 4,
    monthlyRevenue: 0
  },
  tenant: {
    profileViews: 34,
    invitationsReceived: 7,
    applicationsSubmitted: 12,
    acceptedApplications: 2,
    pendingApplications: 3,
    documentsApproved: 2,
    documentsPending: 2
  },
  reviewer: {
    documentsReviewed: 156,
    documentsApproved: 134,
    documentsRejected: 22,
    avgReviewTime: '2.3 uur',
    pendingReviews: 4,
    weeklyGoal: 50,
    weeklyCompleted: 38
  }
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
