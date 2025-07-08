import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { propertyService, Property } from '@/services/PropertyService';
import { applicationService } from '@/services/ApplicationService';
import { messageService } from '@/services/MessageService';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Users, 
  MessageSquare, 
  Calendar,
  MapPin,
  Home,
  Euro,
  Bed,
  Bath,
  Wifi,
  Car,
  PawPrint,
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  FileText
} from 'lucide-react';

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      loadPropertyData();
    }
  }, [id]);

  const loadPropertyData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Load property details
      const propertyResult = await propertyService.getProperties();
      if (propertyResult.success && propertyResult.data) {
        const foundProperty = propertyResult.data.find(p => p.id === id);
        if (foundProperty) {
          setProperty(foundProperty);
          
          // Load applications for this property
          const applicationsResult = await propertyService.getPropertyApplications(id);
          if (applicationsResult.success && applicationsResult.data) {
            setApplications(applicationsResult.data);
          }
          
          // Load messages related to this property
          // TODO: Implement getPropertyMessages in messageService
          // const messagesResult = await messageService.getPropertyMessages(id);
          // if (messagesResult.success && messagesResult.data) {
          //   setMessages(messagesResult.data);
          // }
        } else {
          throw new Error('Property niet gevonden');
        }
      }
    } catch (error) {
      toast({
        title: 'Fout bij laden',
        description: 'Er is een fout opgetreden bij het laden van de eigendom gegevens.',
        variant: 'destructive',
      });
      navigate('/verhuurder-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'geaccepteerd' | 'afgewezen') => {
    try {
      const result = await applicationService.updateApplicationStatus(applicationId, action);
      if (result.success) {
        toast({
          title: 'Aanvraag bijgewerkt',
          description: `Aanvraag is ${action === 'geaccepteerd' ? 'geaccepteerd' : 'afgewezen'}.`,
        });
        loadPropertyData(); // Refresh data
      } else {
        throw new Error(result.error?.message || 'Fout bij bijwerken');
      }
    } catch (error) {
      toast({
        title: 'Fout bij bijwerken',
        description: 'Er is een fout opgetreden bij het bijwerken van de aanvraag.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProperty = async () => {
    if (!property?.id) return;
    
    if (window.confirm('Weet je zeker dat je deze woning wilt verwijderen?')) {
      try {
        const result = await propertyService.deleteProperty(property.id);
        if (result.success) {
          toast({
            title: 'Woning verwijderd',
            description: 'De woning is succesvol verwijderd.',
          });
          navigate('/verhuurder-dashboard');
        } else {
          throw new Error(result.error?.message || 'Fout bij verwijderen');
        }
      } catch (error) {
        toast({
          title: 'Fout bij verwijderen',
          description: 'Er is een fout opgetreden bij het verwijderen van de woning.',
          variant: 'destructive',
        });
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      actief: { variant: 'default' as const, label: 'Actief' },
      inactief: { variant: 'secondary' as const, label: 'Inactief' },
      verhuurd: { variant: 'destructive' as const, label: 'Verhuurd' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.actief;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getApplicationStatusIcon = (status: string) => {
    switch (status) {
      case 'wachtend':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'geaccepteerd':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'afgewezen':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Eigendom gegevens laden...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Woning niet gevonden</h2>
          <p className="text-gray-600 mb-4">De woning die je zoekt bestaat niet of je hebt geen toegang.</p>
          <Button onClick={() => navigate('/verhuurder-dashboard')}>
            Terug naar dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/verhuurder-dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{property.titel}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{property.adres}, {property.stad}</span>
                {getStatusBadge(property.status)}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Bewerken
            </Button>
            <Button variant="destructive" onClick={handleDeleteProperty}>
              <Trash2 className="w-4 h-4 mr-2" />
              Verwijderen
            </Button>
          </div>
        </div>

        {/* Property Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Huurprijs</p>
                <p className="text-2xl font-bold">{formatPrice(property.huurprijs)}</p>
                <p className="text-xs text-gray-500">per maand</p>
              </div>
              <Euro className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Oppervlakte</p>
                <p className="text-2xl font-bold">{property.oppervlakte || 'N/A'}</p>
                <p className="text-xs text-gray-500">vierkante meters</p>
              </div>
              <Home className="h-8 w-8 text-blue-500" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Kamers</p>
                <p className="text-2xl font-bold">{property.aantal_kamers || 'N/A'}</p>
                <p className="text-xs text-gray-500">totaal kamers</p>
              </div>
              <Bed className="h-8 w-8 text-purple-500" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Aanvragen</p>
                <p className="text-2xl font-bold">{applications.length}</p>
                <p className="text-xs text-gray-500">wachtend</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Home className="w-4 h-4 mr-2" />
              Overzicht
            </TabsTrigger>
            <TabsTrigger value="applications">
              <Users className="w-4 h-4 mr-2" />
              Aanvragen ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="w-4 h-4 mr-2" />
              Berichten
            </TabsTrigger>
            <TabsTrigger value="photos">
              <Camera className="w-4 h-4 mr-2" />
              Foto's
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Property Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Eigendom Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Type</p>
                      <p className="text-sm">{property.woning_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Meubilering</p>
                      <p className="text-sm">{property.meubilering}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Slaapkamers</p>
                      <p className="text-sm">{property.aantal_slaapkamers || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Beschikbaar vanaf</p>
                      <p className="text-sm">
                        {property.beschikbaar_vanaf ? 
                          new Date(property.beschikbaar_vanaf).toLocaleDateString('nl-NL') : 
                          'Direct'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {property.beschrijving && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Beschrijving</p>
                      <p className="text-sm text-gray-700">{property.beschrijving}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>Voorzieningen</CardTitle>
                </CardHeader>
                <CardContent>
                  {property.voorzieningen && property.voorzieningen.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {property.voorzieningen.map((voorziening, index) => (
                        <Badge key={index} variant="outline">
                          {voorziening}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Geen voorzieningen opgegeven</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            {applications.length > 0 ? (
              applications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getApplicationStatusIcon(application.status)}
                        <div>
                          <h3 className="font-medium">{application.huurders?.naam || 'Onbekende huurder'}</h3>
                          <p className="text-sm text-gray-600">{application.huurders?.email}</p>
                          <p className="text-xs text-gray-500">
                            Aangevraagd op {new Date(application.aangemaakt_op).toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                      </div>
                      
                      {application.status === 'wachtend' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleApplicationAction(application.id, 'afgewezen')}
                          >
                            Afwijzen
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleApplicationAction(application.id, 'geaccepteerd')}
                          >
                            Accepteren
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {application.bericht && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-1">Bericht van huurder:</p>
                        <p className="text-sm text-gray-700">{application.bericht}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Geen aanvragen</h3>
                  <p className="text-gray-600 text-center">
                    Er zijn nog geen aanvragen ontvangen voor deze woning.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Berichten</h3>
                <p className="text-gray-600 text-center">
                  Berichtenfunctionaliteit wordt binnenkort toegevoegd.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Camera className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Foto's</h3>
                <p className="text-gray-600 text-center mb-4">
                  Foto upload functionaliteit wordt binnenkort toegevoegd.
                </p>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Foto's toevoegen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PropertyDetailPage;