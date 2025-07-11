import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { DashboardHeader, DashboardContent } from "@/components/dashboard";
import { StatsGrid } from '@/components/standard/StatsGrid';
import { DocumentsSection } from '@/components/standard/DocumentsSection';
import ProfileOverview, { ProfileSection } from '@/components/standard/ProfileOverview';
import { Eye, Calendar, FileText, CheckCircle, User as UserIcon, Briefcase, Home, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User } from '@/types';

// Mock data that matches your existing schema structure
const mockUser: User = {
  id: '1',
  email: 'sotocrioyo@gmail.com',
  role: 'huurder',
  name: 'Cristian Soto Garcia',
  isActive: true,
  createdAt: '2025-01-01',
  hasPayment: true,
  subscriptionEndDate: '2025-08-09',
  user_metadata: {
    full_name: 'Cristian Soto Garcia',
    role: 'huurder'
  }
};

const mockTenantProfile = {
  id: '1',
  userId: '1',
  firstName: 'Cristian',
  lastName: 'Soto Garcia',
  email: 'sotocrioyo@gmail.com',
  phone: '+31 6 12345678',
  dateOfBirth: '1990-01-01',
  profession: 'Software Developer',
  employer: 'Tech Company',
  income: 4500,
  monthlyIncome: 4500,
  bio: 'Betrouwbare huurder op zoek naar een mooie woning',
  motivation: 'Ik ben op zoek naar een stabiele woonplek voor de lange termijn',
  isLookingForPlace: true,
  preferences: {
    minBudget: 1200,
    maxBudget: 1800,
    city: 'Amsterdam',
    bedrooms: 2,
    propertyType: 'Appartement'
  }
};

const mockStats = {
  profileViews: 24,
  invitations: 3,
  applications: 5,
  acceptedApplications: 1
};

const mockDocuments = [
  {
    id: '1',
    name: 'Identiteitsbewijs',
    type: 'identification',
    status: 'verified' as const,
    uploadedAt: '2025-07-01'
  },
  {
    id: '2',
    name: 'Inkomensverklaring',
    type: 'income',
    status: 'pending' as const,
    uploadedAt: '2025-07-05'
  }
];

interface FunctionalHuurderDashboardProps {
  user?: User;
}

const FunctionalHuurderDashboard: React.FC<FunctionalHuurderDashboardProps> = ({ 
  user = mockUser 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [isLookingForPlace, setIsLookingForPlace] = useState(mockTenantProfile.isLookingForPlace);

  // Profile sections for the ProfileOverview component (Dutch)
  const profileSections: ProfileSection[] = [
    {
      title: 'Persoonlijke Informatie',
      icon: UserIcon,
      iconColor: 'text-blue-600',
      fields: [
        { label: 'Naam', value: mockTenantProfile.firstName + ' ' + mockTenantProfile.lastName },
        { label: 'Email', value: mockTenantProfile.email },
        { label: 'Telefoonnummer', value: mockTenantProfile.phone },
        { label: 'Geboortedatum', value: mockTenantProfile.dateOfBirth },
      ],
    },
    {
      title: 'Werk & Inkomen',
      icon: Briefcase,
      iconColor: 'text-green-600',
      fields: [
        { label: 'Beroep', value: mockTenantProfile.profession },
        { label: 'Werkgever', value: mockTenantProfile.employer },
        { label: 'Maandelijks Inkomen', value: `€${mockTenantProfile.monthlyIncome}` },
      ],
    },
    {
      title: 'Woonvoorkeuren',
      icon: Home,
      iconColor: 'text-purple-600',
      fields: [
        { label: 'Gewenste Locatie', value: mockTenantProfile.preferences.city },
        { label: 'Budget', value: `€${mockTenantProfile.preferences.minBudget} - €${mockTenantProfile.preferences.maxBudget}` },
        { label: 'Aantal Kamers', value: mockTenantProfile.preferences.bedrooms.toString() },
      ],
    },
    {
      title: 'Levensstijl & Motivatie',
      icon: Heart,
      iconColor: 'text-red-600',
      fields: [
        { label: 'Motivatie', value: mockTenantProfile.motivation },
      ],
    },
  ];
  
  // Stats for the StatsGrid component (Dutch)
  const huurderStats = [
    {
      title: 'Profiel weergaven',
      value: mockStats.profileViews,
      icon: Eye,
      color: 'blue-600',
      loading: false,
    },
    {
      title: 'Uitnodigingen',
      value: mockStats.invitations,
      icon: Calendar,
      color: 'green-600',
      loading: false,
    },
    {
      title: 'Aanvragen',
      value: mockStats.applications,
      icon: FileText,
      color: 'orange-600',
      loading: false,
    },
    {
      title: 'Geaccepteerd',
      value: mockStats.acceptedApplications,
      icon: CheckCircle,
      color: 'emerald-600',
      loading: false,
    },
  ];

  // Action handlers (Dutch)
  const handleSettings = () => {
    toast({
      title: "Instellingen",
      description: "Instellingen pagina wordt geopend...",
    });
    navigate('/instellingen');
  };

  const handleLogout = () => {
    toast({
      title: "Uitgelogd",
      description: "Je bent succesvol uitgelogd.",
    });
    navigate('/');
  };

  const onStartSearch = () => {
    toast({
      title: "Zoeken gestart",
      description: "Je wordt doorgestuurd naar de zoekpagina...",
    });
    navigate('/woningen-zoeken');
  };

  const handleReportIssue = () => {
    toast({
      title: "Probleem melden",
      description: "Support formulier wordt geopend...",
    });
    navigate('/support');
  };

  const handleHelpSupport = () => {
    toast({
      title: "Help & Support",
      description: "Help pagina wordt geopend...",
    });
    navigate('/help');
  };

  const handleProfileEdit = () => {
    setShowProfileModal(true);
    toast({
      title: "Profiel bewerken",
      description: "Profiel bewerking wordt geopend...",
    });
  };

  const handleDocumentUpload = () => {
    setShowDocumentModal(true);
    toast({
      title: "Document uploaden",
      description: "Document upload wordt geopend...",
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          user={user}
          onSettings={handleSettings}
          onLogout={handleLogout}
        />

        <div className="p-4 sm:p-6 lg:p-8">
          <DashboardContent>
            {/* Welcome Message */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welkom terug, {user.name}!
              </h1>
              <p className="text-gray-600">
                Hier is een overzicht van je activiteiten en profiel.
              </p>
            </div>

            {/* Stats Grid */}
            <StatsGrid stats={huurderStats} />
            
            {/* Profile Overview */}
            <ProfileOverview 
              sections={profileSections}
              title="Profiel Overzicht"
              onEdit={handleProfileEdit} 
              isCreating={!mockTenantProfile}
            />
            
            {/* Documents Section */}
            <DocumentsSection 
              userDocuments={mockDocuments} 
              onShowDocumentModal={handleDocumentUpload}
              title="Mijn Documenten"
              emptyStateTitle="Nog geen documenten geüpload."
              emptyStateDescription="Klik op 'Document Uploaden' om te beginnen."
            />
            
            {/* Action Buttons (Dutch) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <Button 
                onClick={onStartSearch} 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                🏠 Woningen Zoeken
              </Button>
              <Button 
                onClick={() => navigate('/mijn-aanvragen')} 
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                📋 Mijn Aanvragen
              </Button>
              <Button 
                onClick={() => navigate('/berichten')} 
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                💬 Berichten
              </Button>
              <Button 
                onClick={() => navigate('/abonnement')} 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                💎 Abonnement
              </Button>
            </div>

            {/* Additional Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Button 
                onClick={handleReportIssue} 
                className="w-full bg-red-500 hover:bg-red-600 text-white"
              >
                🚨 Probleem Melden
              </Button>
              <Button 
                onClick={handleHelpSupport} 
                className="w-full bg-gray-500 hover:bg-gray-600 text-white"
              >
                ❓ Help & Support
              </Button>
              <Button 
                onClick={() => navigate('/favorieten')} 
                className="w-full bg-pink-500 hover:bg-pink-600 text-white"
              >
                ❤️ Favorieten
              </Button>
            </div>

            {/* Status Toggle */}
            <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Zoekstatus</h3>
                  <p className="text-sm text-gray-600">
                    {isLookingForPlace 
                      ? "Je bent actief op zoek naar een woning" 
                      : "Je zoekt momenteel niet actief naar een woning"
                    }
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setIsLookingForPlace(!isLookingForPlace);
                    toast({
                      title: isLookingForPlace ? "Zoeken gepauzeerd" : "Zoeken geactiveerd",
                      description: isLookingForPlace 
                        ? "Je profiel is niet meer zichtbaar voor verhuurders" 
                        : "Je profiel is nu zichtbaar voor verhuurders",
                    });
                  }}
                  variant={isLookingForPlace ? "destructive" : "default"}
                  className="ml-4"
                >
                  {isLookingForPlace ? "Pauzeer Zoeken" : "Start Zoeken"}
                </Button>
              </div>
            </div>
          </DashboardContent>
        </div>
      </div>

      {/* Modals would be rendered here */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Profiel Bewerken</h2>
            <p className="text-gray-600 mb-4">Profiel bewerking functionaliteit komt hier...</p>
            <Button onClick={() => setShowProfileModal(false)}>Sluiten</Button>
          </div>
        </div>
      )}

      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Document Uploaden</h2>
            <p className="text-gray-600 mb-4">Document upload functionaliteit komt hier...</p>
            <Button onClick={() => setShowDocumentModal(false)}>Sluiten</Button>
          </div>
        </div>
      )}
    </>
  );
};

export default FunctionalHuurderDashboard;

