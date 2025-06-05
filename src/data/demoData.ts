
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
    hasPayment: false
  },
  {
    id: '2', 
    email: 'bas.verhuur@email.nl',
    role: 'verhuurder',
    name: 'Bas Verhuur BV',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '3',
    email: 'lisa.reviewer@huurly.nl',
    role: 'beoordelaar', 
    name: 'Lisa de Vries',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    createdAt: '2024-01-05T10:00:00Z'
  },
  {
    id: '4',
    email: 'admin@huurly.nl',
    role: 'beheerder',
    name: 'Peter Administrator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z'
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
        status: 'pending',
        uploadedAt: '2024-06-01T10:00:00Z'
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
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop'
        ],
        requirements: {
          minIncome: 4500,
          maxAge: 35,
          allowPets: false
        },
        isActive: true
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
    status: 'open',
    priority: 'medium',
    notes: [],
    createdAt: '2024-06-04T15:30:00Z'
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
        id: '1',
        issueId: '2',
        authorId: '4',
        content: 'Bezig met onderzoek naar de filtering algoritme.',
        createdAt: '2024-06-05T09:00:00Z'
      }
    ],
    createdAt: '2024-06-03T11:15:00Z'
  }
];
