import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, FileText, Eye, Trash2, MessageCircle } from 'lucide-react';
import { User } from '@/types';

// Mock user data
const mockUser: User = {
  id: '1',
  email: 'sotocrioyo@gmail.com',
  role: 'huurder',
  name: 'Cristian Soto Garcia',
  isActive: true,
  createdAt: '2025-01-01',
  hasPayment: true,
  subscriptionEndDate: '2025-08-09'
};

// Mock applications data (Dutch)
const mockApplications = [
  {
    id: '1',
    propertyId: '1',
    propertyTitle: 'Modern Appartement in Amsterdam Centrum',
    propertyAddress: 'Damrak 123, Amsterdam',
    propertyPrice: 1500,
    status: 'in_behandeling' as const,
    submittedAt: '2025-07-05',
    lastUpdate: '2025-07-06',
    landlordName: 'Jan de Vries',
    notes: 'Aanvraag is ontvangen en wordt beoordeeld door de verhuurder.',
    viewingDate: '2025-07-10 14:00'
  },
  {
    id: '2',
    propertyId: '2',
    propertyTitle: 'Gezellige Studio in Utrecht',
    propertyAddress: 'Oudegracht 456, Utrecht',
    propertyPrice: 900,
    status: 'geaccepteerd' as const,
    submittedAt: '2025-07-01',
    lastUpdate: '2025-07-03',
    landlordName: 'Maria Janssen',
    notes: 'Gefeliciteerd! Je aanvraag is geaccepteerd. Neem contact op voor de volgende stappen.',
    contractStartDate: '2025-08-01'
  },
  {
    id: '3',
    propertyId: '3',
    propertyTitle: 'Familiehuis in Rotterdam',
    propertyAddress: 'Coolsingel 789, Rotterdam',
    propertyPrice: 2200,
    status: 'afgewezen' as const,
    submittedAt: '2025-06-28',
    lastUpdate: '2025-07-02',
    landlordName: 'Peter van der Berg',
    notes: 'Helaas is je aanvraag niet geselecteerd. Er waren veel kandidaten.',
    rejectionReason: 'Andere kandidaat gekozen'
  },
  {
    id: '4',
    propertyId: '4',
    propertyTitle: 'Studentenkamer in Groningen',
    propertyAddress: 'Grote Markt 321, Groningen',
    propertyPrice: 650,
    status: 'concept' as const,
    submittedAt: null,
    lastUpdate: '2025-07-07',
    landlordName: 'Anna Bakker',
    notes: 'Concept aanvraag - nog niet ingediend.',
  }
];

const MijnAanvragen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [applications, setApplications] = useState(mockApplications);
  const [selectedStatus, setSelectedStatus] = useState<string>('alle');

  // Filter applications by status
  const filteredApplications = applications.filter(app => {
    if (selectedStatus === 'alle') return true;
    return app.status === selectedStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_behandeling':
        return <Badge className="bg-yellow-100 text-yellow-800">In Behandeling</Badge>;
      case 'geaccepteerd':
        return <Badge className="bg-green-100 text-green-800">Geaccepteerd</Badge>;
      case 'afgewezen':
        return <Badge className="bg-red-100 text-red-800">Afgewezen</Badge>;
      case 'concept':
        return <Badge className="bg-gray-100 text-gray-800">Concept</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusCount = (status: string) => {
    if (status === 'alle') return applications.length;
    return applications.filter(app => app.status === status).length;
  };

  const handleWithdraw = (applicationId: string, propertyTitle: string) => {
    setApplications(prev => prev.filter(app => app.id !== applicationId));
    toast({
      title: "Aanvraag Ingetrokken",
      description: `Je aanvraag voor "${propertyTitle}" is succesvol ingetrokken.`,
    });
  };

  const handleViewDetails = (applicationId: string) => {
    toast({
      title: "Details Bekijken",
      description: "Aanvraag details worden geopend...",
    });
    // In real implementation, navigate to detailed view
  };

  const handleContactLandlord = (landlordName: string) => {
    toast({
      title: "Contact Verhuurder",
      description: `Bericht naar ${landlordName} wordt geopend...`,
    });
    navigate('/berichten');
  };

  const handleSubmitDraft = (applicationId: string) => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { ...app, status: 'in_behandeling' as const, submittedAt: new Date().toISOString().split('T')[0] }
        : app
    ));
    toast({
      title: "Aanvraag Ingediend",
      description: "Je concept aanvraag is succesvol ingediend!",
    });
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleSettings = () => {
    navigate('/instellingen');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        user={mockUser}
        onSettings={handleSettings}
        onLogout={handleLogout}
      />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mijn Aanvragen</h1>
            <p className="text-gray-600">Beheer al je woningaanvragen op één plek</p>
          </div>

          {/* Status Filter Tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'alle', label: 'Alle Aanvragen' },
                { key: 'concept', label: 'Concepten' },
                { key: 'in_behandeling', label: 'In Behandeling' },
                { key: 'geaccepteerd', label: 'Geaccepteerd' },
                { key: 'afgewezen', label: 'Afgewezen' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  onClick={() => setSelectedStatus(key)}
                  variant={selectedStatus === key ? "default" : "outline"}
                  className="relative"
                >
                  {label}
                  <Badge 
                    className="ml-2 bg-gray-200 text-gray-700 text-xs"
                    variant="secondary"
                  >
                    {getStatusCount(key)}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6 flex gap-4">
            <Button onClick={() => navigate('/woningen-zoeken')} className="bg-blue-600 hover:bg-blue-700">
              🏠 Nieuwe Woning Zoeken
            </Button>
            <Button onClick={() => navigate('/huurder-dashboard')} variant="outline">
              ← Terug naar Dashboard
            </Button>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.map(application => (
              <Card key={application.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{application.propertyTitle}</CardTitle>
                      <CardDescription className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {application.propertyAddress}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(application.status)}
                      <div className="text-lg font-semibold text-gray-900 mt-1">
                        €{application.propertyPrice}/maand
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Verhuurder:</strong> {application.landlordName}
                      </div>
                      {application.submittedAt && (
                        <div className="text-sm text-gray-600 mb-2 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <strong>Ingediend:</strong> {application.submittedAt}
                        </div>
                      )}
                      {application.lastUpdate && (
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Laatste update:</strong> {application.lastUpdate}
                        </div>
                      )}
                    </div>

                    <div>
                      {application.viewingDate && (
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Bezichtiging:</strong> {application.viewingDate}
                        </div>
                      )}
                      {application.contractStartDate && (
                        <div className="text-sm text-green-600 mb-2">
                          <strong>Contract start:</strong> {application.contractStartDate}
                        </div>
                      )}
                      {application.rejectionReason && (
                        <div className="text-sm text-red-600 mb-2">
                          <strong>Reden afwijzing:</strong> {application.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {application.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <div className="text-sm text-gray-700">
                        <strong>Notities:</strong> {application.notes}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleViewDetails(application.id)}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>

                    {application.status === 'concept' && (
                      <Button
                        onClick={() => handleSubmitDraft(application.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Indienen
                      </Button>
                    )}

                    {(application.status === 'in_behandeling' || application.status === 'concept') && (
                      <Button
                        onClick={() => handleWithdraw(application.id, application.propertyTitle)}
                        variant="destructive"
                        size="sm"
                        className="flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Intrekken
                      </Button>
                    )}

                    {application.status !== 'concept' && (
                      <Button
                        onClick={() => handleContactLandlord(application.landlordName)}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Applications */}
          {filteredApplications.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedStatus === 'alle' 
                    ? 'Nog geen aanvragen' 
                    : `Geen ${selectedStatus.replace('_', ' ')} aanvragen`
                  }
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedStatus === 'alle'
                    ? 'Begin met zoeken naar woningen om je eerste aanvraag in te dienen.'
                    : 'Wijzig je filter om andere aanvragen te bekijken.'
                  }
                </p>
                <Button 
                  onClick={() => navigate('/woningen-zoeken')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Woningen Zoeken
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MijnAanvragen;

