
import { User, TenantProfile, LandlordProfile, Property, Document, ViewingInvitation, Issue } from '@/types';

export const demoUsers: User[] = [
  {
    id: '1',
    email: 'emma.bakker@email.nl',
    role: 'huurder',
    name: 'Emma Bakker',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    hasPayment: true
  },
  {
    id: '2', 
    email: 'bas.verhuur@email.nl',
    role: 'verhuurder',
    name: 'Bas Verhuur BV',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z',
    hasPayment: true
  },
  {
    id: '3',
    email: 'lisa.reviewer@huurly.nl',
    role: 'beoordelaar', 
    name: 'Lisa de Vries',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    createdAt: '2024-01-05T10:00:00Z',
    hasPayment: true
  },
  {
    id: '4',
    email: 'admin@huurly.nl',
    role: 'beheerder',
    name: 'Peter Administrator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
    hasPayment: true
  },
  // Additional demo users
  {
    id: '5',
    email: 'sarah.zoeker@email.nl',
    role: 'huurder',
    name: 'Sarah van der Berg',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    createdAt: '2024-02-01T10:00:00Z',
    hasPayment: false
  },
  {
    id: '6',
    email: 'marco.huizen@email.nl',
    role: 'verhuurder',
    name: 'Marco Huizenbeheer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    createdAt: '2024-02-15T10:00:00Z',
    hasPayment: true
  }
];

export const demoTenantProfiles: TenantProfile[] = [
  {
    id: '1',
    userId: '1',
    firstName: 'Emma',
    lastName: 'Bakker',
    email: 'emma.bakker@email.nl',
    phone: '06 12345678',
    dateOfBirth: '1995-03-15',
    profession: 'Software Developer',
    income: 4500,
    bio: 'Rustige, nette huurder die van een schone en georganiseerde leefomgeving houdt.',
    motivation: 'Ik zoek een fijne plek in Amsterdam voor de lange termijn. Ik werk vanuit huis en heb daarom behoefte aan een rustige omgeving.',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face',
    isLookingForPlace: true,
    preferences: {
      minBudget: 1200,
      maxBudget: 1800,
      city: 'Amsterdam',
      bedrooms: 2,
      propertyType: 'appartement'
    },
    documents: [
      {
        id: '1',
        tenantId: '1',
        type: 'id',
        fileName: 'paspoort_emma.pdf',
        fileUrl: '/documents/paspoort_emma.pdf',
        status: 'approved',
        uploadedAt: '2024-06-01T10:00:00Z',
        reviewedAt: '2024-06-02T14:00:00Z',
        reviewedBy: '3'
      },
      {
        id: '2',
        tenantId: '1', 
        type: 'income',
        fileName: 'loonstrook_emma.pdf',
        fileUrl: '/documents/loonstrook_emma.pdf',
        status: 'approved',
        uploadedAt: '2024-06-01T10:30:00Z',
        reviewedAt: '2024-06-02T14:00:00Z',
        reviewedBy: '3'
      },
      {
        id: '3',
        tenantId: '1',
        type: 'employment',
        fileName: 'arbeidscontract_emma.pdf',
        fileUrl: '/documents/arbeidscontract_emma.pdf',
        status: 'pending',
        uploadedAt: '2024-06-03T09:00:00Z'
      }
    ],
    verificationStatus: 'approved'
  },
  {
    id: '2',
    userId: '5',
    firstName: 'Sarah',
    lastName: 'van der Berg',
    email: 'sarah.zoeker@email.nl',
    phone: '06 87654321',
    dateOfBirth: '1993-07-22',
    profession: 'Marketing Manager',
    income: 3800,
    bio: 'Sociale en verantwoordelijke huurder op zoek naar een gezellige woonplek.',
    motivation: 'Na 3 jaar in het buitenland wonen, ben ik terug in Nederland en zoek ik een mooie plek om te wonen.',
    profilePicture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
    isLookingForPlace: true,
    preferences: {
      minBudget: 1000,
      maxBudget: 1600,
      city: 'Utrecht',
      bedrooms: 1,
      propertyType: 'appartement'
    },
    documents: [
      {
        id: '4',
        tenantId: '2',
        type: 'id',
        fileName: 'rijbewijs_sarah.pdf',
        fileUrl: '/documents/rijbewijs_sarah.pdf',
        status: 'pending',
        uploadedAt: '2024-06-04T11:00:00Z'
      }
    ],
    verificationStatus: 'pending'
  }
];

export const demoLandlordProfiles: LandlordProfile[] = [
  {
    id: '1',
    userId: '2',
    companyName: 'Bas Verhuur BV',
    contactPerson: 'Bas van der Berg',
    email: 'bas.verhuur@email.nl',
    phone: '020 1234567',
    properties: [
      {
        id: '1',
        landlordId: '1',
        title: 'Modern 2-kamer appartement in Amsterdam Noord',
        description: 'Prachtig gerenoveerd appartement met veel lichtinval en moderne afwerking. Gelegen in een rustige buurt met goede verbindingen.',
        address: 'Noordstraat 123',
        city: 'Amsterdam',
        rent: 1650,
        bedrooms: 2,
        propertyType: 'appartement',
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
        ],
        requirements: {
          minIncome: 4500,
          maxAge: 35,
          allowPets: false
        },
        isActive: true,
        availableFrom: '2024-07-01',
        deposit: 3300,
        utilities: 150
      },
      {
        id: '2',
        landlordId: '1',
        title: 'Gezellige studio in het centrum van Amsterdam',
        description: 'Perfecte studio voor een student of young professional. Alle voorzieningen op loopafstand.',
        address: 'Centrum 45',
        city: 'Amsterdam',
        rent: 1200,
        bedrooms: 1,
        propertyType: 'studio',
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=600&fit=crop'
        ],
        requirements: {
          minIncome: 3600,
          maxAge: 30,
          allowPets: true
        },
        isActive: true,
        availableFrom: '2024-08-15',
        deposit: 2400,
        utilities: 100
      }
    ]
  },
  {
    id: '2',
    userId: '6',
    companyName: 'Marco Huizenbeheer',
    contactPerson: 'Marco de Wit',
    email: 'marco.huizen@email.nl',
    phone: '030 7654321',
    properties: [
      {
        id: '3',
        landlordId: '2',
        title: 'Ruim 3-kamer appartement in Utrecht Centrum',
        description: 'Licht en ruim appartement met balkon en moderne keuken. Uitstekende locatie nabij openbaar vervoer.',
        address: 'Utrechtseweg 89',
        city: 'Utrecht',
        rent: 1850,
        bedrooms: 3,
        propertyType: 'appartement',
        images: [
          'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'
        ],
        requirements: {
          minIncome: 5550,
          maxAge: 40,
          allowPets: false
        },
        isActive: true,
        availableFrom: '2024-09-01',
        deposit: 3700,
        utilities: 200
      }
    ]
  }
];

export const demoViewingInvitations: ViewingInvitation[] = [
  {
    id: '1',
    propertyId: '1',
    tenantId: '1',
    landlordId: '2',
    scheduledDate: '2024-06-15T14:00:00Z',
    deadline: '2024-06-10T23:59:59Z',
    status: 'pending',
    message: 'Graag zou ik je uitnodigen voor een bezichtiging van het appartement. Het ligt perfect voor jouw wensen!',
    createdAt: '2024-06-05T10:00:00Z'
  },
  {
    id: '2',
    propertyId: '2',
    tenantId: '5',
    landlordId: '2',
    scheduledDate: '2024-06-18T16:00:00Z',
    deadline: '2024-06-12T23:59:59Z',
    status: 'accepted',
    message: 'Je profiel ziet er geweldig uit! Kom graag langs voor een bezichtiging.',
    createdAt: '2024-06-06T14:30:00Z'
  },
  {
    id: '3',
    propertyId: '3',
    tenantId: '1',
    landlordId: '6',
    scheduledDate: '2024-06-20T10:00:00Z',
    deadline: '2024-06-15T23:59:59Z',
    status: 'declined',
    message: 'Uitnodiging voor bezichtiging van het Utrecht appartement.',
    createdAt: '2024-06-07T09:15:00Z'
  }
];

export const demoIssues: Issue[] = [
  {
    id: '1',
    reporterId: '1',
    reporterRole: 'huurder',
    title: 'Document upload werkt niet',
    description: 'Ik kan mijn inkomensverklaring niet uploaden. De pagina blijft laden.',
    category: 'technical',
    status: 'resolved',
    priority: 'medium',
    assignedTo: '4',
    notes: [
      {
        id: '1',
        issueId: '1',
        authorId: '4',
        content: 'Upload functionaliteit is hersteld. Kan je het opnieuw proberen?',
        createdAt: '2024-06-05T14:00:00Z'
      },
      {
        id: '2',
        issueId: '1',
        authorId: '1',
        content: 'Werkt nu perfect! Bedankt voor de snelle oplossing.',
        createdAt: '2024-06-05T15:30:00Z'
      }
    ],
    createdAt: '2024-06-04T15:30:00Z',
    resolvedAt: '2024-06-05T16:00:00Z'
  },
  {
    id: '2',
    reporterId: '2',
    reporterRole: 'verhuurder',
    title: 'Onterechte huurder in zoekresultaten',
    description: 'Ik zie huurders die niet voldoen aan mijn minimum inkomensvereisten.',
    category: 'user_complaint',
    status: 'in_progress',
    priority: 'high',
    assignedTo: '4',
    notes: [
      {
        id: '3',
        issueId: '2',
        authorId: '4',
        content: 'Bezig met onderzoek naar de filtering algoritme.',
        createdAt: '2024-06-05T09:00:00Z'
      },
      {
        id: '4',
        issueId: '2',
        authorId: '4',
        content: 'Filter is aangepast. Kun je controleren of het probleem is opgelost?',
        createdAt: '2024-06-06T11:00:00Z'
      }
    ],
    createdAt: '2024-06-03T11:15:00Z'
  },
  {
    id: '3',
    reporterId: '5',
    reporterRole: 'huurder',
    title: 'Profielfoto uploaden lukt niet',
    description: 'Telkens als ik een foto probeer te uploaden krijg ik een error.',
    category: 'technical',
    status: 'open',
    priority: 'low',
    notes: [],
    createdAt: '2024-06-06T08:45:00Z'
  },
  {
    id: '4',
    reporterId: '6',
    reporterRole: 'verhuurder',
    title: 'Betalingsproblemen',
    description: 'Mijn betaling voor premium account is niet verwerkt.',
    category: 'billing',
    status: 'open',
    priority: 'high',
    notes: [
      {
        id: '5',
        issueId: '4',
        authorId: '3',
        content: 'Betalingsgegevens zijn gecontroleerd. Contact opgenomen met Stripe.',
        createdAt: '2024-06-06T16:00:00Z'
      }
    ],
    createdAt: '2024-06-06T12:30:00Z'
  },
  {
    id: '5',
    reporterId: '3',
    reporterRole: 'beoordelaar',
    title: 'Systeem performance problemen',
    description: 'Document review pagina laadt erg langzaam tijdens piekuren.',
    category: 'technical',
    status: 'open',
    priority: 'medium',
    assignedTo: '4',
    notes: [],
    createdAt: '2024-06-07T10:20:00Z'
  }
];

// Additional demo data for more comprehensive dashboards
export const demoDocuments: Document[] = [
  {
    id: '1',
    tenantId: '1',
    type: 'id',
    fileName: 'paspoort_emma.pdf',
    fileUrl: '/documents/paspoort_emma.pdf',
    status: 'approved',
    uploadedAt: '2024-06-01T10:00:00Z',
    reviewedAt: '2024-06-02T14:00:00Z',
    reviewedBy: '3'
  },
  {
    id: '2',
    tenantId: '1', 
    type: 'income',
    fileName: 'loonstrook_emma.pdf',
    fileUrl: '/documents/loonstrook_emma.pdf',
    status: 'approved',
    uploadedAt: '2024-06-01T10:30:00Z',
    reviewedAt: '2024-06-02T14:00:00Z',
    reviewedBy: '3'
  },
  {
    id: '3',
    tenantId: '1',
    type: 'employment',
    fileName: 'arbeidscontract_emma.pdf',
    fileUrl: '/documents/arbeidscontract_emma.pdf',
    status: 'pending',
    uploadedAt: '2024-06-03T09:00:00Z'
  },
  {
    id: '4',
    tenantId: '2',
    type: 'id',
    fileName: 'rijbewijs_sarah.pdf',
    fileUrl: '/documents/rijbewijs_sarah.pdf',
    status: 'pending',
    uploadedAt: '2024-06-04T11:00:00Z'
  },
  {
    id: '5',
    tenantId: '2',
    type: 'income',
    fileName: 'loonstrook_sarah.pdf',
    fileUrl: '/documents/loonstrook_sarah.pdf',
    status: 'rejected',
    uploadedAt: '2024-06-04T11:30:00Z',
    reviewedAt: '2024-06-05T10:00:00Z',
    reviewedBy: '3',
    rejectionReason: 'Document is niet duidelijk leesbaar. Upload een nieuwe versie.'
  }
];

export const demoStatistics = {
  platform: {
    totalUsers: 1247,
    activeUsers: 892,
    totalProperties: 156,
    successfulMatches: 89,
    pendingDocuments: 23,
    monthlyRevenue: 15680,
    userGrowth: 12.5,
    matchSuccessRate: 73.2
  },
  landlord: {
    totalProperties: 8,
    activeProperties: 6,
    totalViews: 234,
    totalApplications: 45,
    acceptedApplications: 12,
    pendingApplications: 8,
    monthlyRevenue: 12450
  },
  tenant: {
    profileViews: 89,
    invitationsReceived: 15,
    applicationsSubmitted: 8,
    acceptedApplications: 3,
    pendingApplications: 2,
    documentsApproved: 3,
    documentsPending: 1
  },
  reviewer: {
    documentsReviewed: 156,
    documentsApproved: 134,
    documentsRejected: 22,
    avgReviewTime: '2.3 uur',
    pendingReviews: 12,
    weeklyGoal: 50,
    weeklyCompleted: 38
  }
};
