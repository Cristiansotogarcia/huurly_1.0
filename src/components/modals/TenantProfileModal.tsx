import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  MapPin, 
  Euro, 
  Briefcase, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Heart,
  MessageCircle,
  Download
} from 'lucide-react';
import { BaseModal, BaseModalActions, useModalState } from './BaseModal';

interface TenantProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: any;
  onInviteViewing: (tenant: any) => void;
}

const TenantProfileModal = ({ 
  open, 
  onOpenChange, 
  tenant,
  onInviteViewing 
}: TenantProfileModalProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const { isSubmitting, setIsSubmitting } = useModalState();

  const handleInviteViewing = () => {
    onInviteViewing(tenant);
    onOpenChange(false);
  };

  const handleSendMessage = () => {
    toast({
      title: "Bericht verzonden",
      description: `Je bericht is verzonden naar ${tenant.firstName} ${tenant.lastName}.`
    });
  };

  const handleAddToFavorites = () => {
    toast({
      title: "Toegevoegd aan favorieten",
      description: `${tenant.firstName} ${tenant.lastName} is toegevoegd aan je favoriete huurders.`
    });
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (!tenant) {
    return null;
  }

  // Mock documents for demo
  const documents = [
    {
      id: 'doc-1',
      type: 'identity',
      name: 'Identiteitsbewijs',
      fileName: 'ID_Emma_Bakker.pdf',
      status: 'approved',
      uploadedAt: '2024-01-16T10:00:00Z'
    },
    {
      id: 'doc-2',
      type: 'payslip',
      name: 'Loonstrook',
      fileName: 'Payslip_December_2023.pdf',
      status: 'approved',
      uploadedAt: '2024-01-16T10:15:00Z'
    },
    {
      id: 'doc-3',
      type: 'employment',
      name: 'Arbeidscontract',
      fileName: 'Contract_TechCorp.pdf',
      status: 'pending',
      uploadedAt: '2024-01-20T14:30:00Z'
    }
  ];

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Huurder Profiel"
      icon={User}
      size="4xl"
    >
      <div className="space-y-6">
          {/* Header with basic info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <img 
                  src={tenant.profilePicture || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'} 
                  alt={`${tenant.firstName} ${tenant.lastName}`}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{tenant.firstName} {tenant.lastName}</h2>
                      <p className="text-gray-600">{tenant.profession}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {tenant.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {tenant.phone || '+31 6 12345678'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getVerificationColor(tenant.verificationStatus)}>
                        {getVerificationIcon(tenant.verificationStatus)}
                        <span className="ml-1">
                          {tenant.verificationStatus === 'approved' ? 'Geverifieerd' : 
                           tenant.verificationStatus === 'pending' ? 'In behandeling' : 'Afgewezen'}
                        </span>
                      </Badge>
                      <div className="text-right text-sm text-gray-600">
                        Lid sinds {new Date(tenant.createdAt || '2024-01-15').toLocaleDateString('nl-NL')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profiel</TabsTrigger>
              <TabsTrigger value="preferences">Voorkeuren</TabsTrigger>
              <TabsTrigger value="documents">Documenten</TabsTrigger>
              <TabsTrigger value="history">Geschiedenis</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Werk & Inkomen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Beroep:</span>
                      <span className="font-medium">{tenant.profession}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maandinkomen:</span>
                      <span className="font-medium">€{tenant.income?.toLocaleString() || '4,500'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Werkgever:</span>
                      <span className="font-medium">TechCorp B.V.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contract:</span>
                      <span className="font-medium">Vast contract</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Persoonlijke Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Leeftijd:</span>
                      <span className="font-medium">29 jaar</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nationaliteit:</span>
                      <span className="font-medium">Nederlandse</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Huisdieren:</span>
                      <span className="font-medium">Geen</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Roker:</span>
                      <span className="font-medium">Nee</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Over Mij</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {tenant.bio || "Rustige, betrouwbare huurder die op zoek is naar een moderne woning in Amsterdam. Werk als software developer bij een tech startup en houd van een nette, georganiseerde leefomgeving. In mijn vrije tijd sport ik graag en lees ik veel. Ik ben een verantwoordelijke huurder die goed voor de woning zorgt."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Motivatie</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {tenant.motivation || "Ik ben op zoek naar een nieuwe woning vanwege een nieuwe baan in Amsterdam. Ik zoek een rustige plek waar ik kan werken en ontspannen na een drukke werkdag."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Locatie Voorkeuren
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gewenste stad:</span>
                      <span className="font-medium">{tenant.preferences?.city || 'Amsterdam'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wijken:</span>
                      <span className="font-medium">Centrum, Jordaan, Oud-Zuid</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max. reistijd werk:</span>
                      <span className="font-medium">30 minuten</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Euro className="w-4 h-4 mr-2" />
                      Budget & Woning
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-medium">
                        €{tenant.preferences?.minBudget || 1200} - €{tenant.preferences?.maxBudget || 1800}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Slaapkamers:</span>
                      <span className="font-medium">{tenant.preferences?.bedrooms || 2}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type woning:</span>
                      <span className="font-medium">{tenant.preferences?.propertyType || 'Appartement'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gemeubileerd:</span>
                      <span className="font-medium">Geen voorkeur</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Gewenste Voorzieningen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['Balkon', 'Tuin', 'Parkeerplaats', 'Lift', 'Wasmachine aansluiting', 'Vaatwasser'].map((amenity) => (
                      <Badge key={amenity} variant="outline">{amenity}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Geüploade Documenten
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-8 h-8 text-dutch-blue" />
                          <div>
                            <h4 className="font-medium">{doc.name}</h4>
                            <p className="text-sm text-gray-600">{doc.fileName}</p>
                            <p className="text-xs text-gray-500">
                              Geüpload op {new Date(doc.uploadedAt).toLocaleDateString('nl-NL')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getVerificationColor(doc.status)}>
                            {getVerificationIcon(doc.status)}
                            <span className="ml-1">
                              {doc.status === 'approved' ? 'Goedgekeurd' : 
                               doc.status === 'pending' ? 'In behandeling' : 'Afgewezen'}
                            </span>
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Verificatie Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <h4 className="font-semibold">Identiteit</h4>
                      <p className="text-sm text-green-600">Geverifieerd</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <h4 className="font-semibold">Inkomen</h4>
                      <p className="text-sm text-green-600">Geverifieerd</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                      <h4 className="font-semibold">Werkgever</h4>
                      <p className="text-sm text-orange-600">In behandeling</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Activiteit Geschiedenis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 pb-3 border-b">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Profiel aangemaakt</p>
                        <p className="text-sm text-gray-600">15 januari 2024, 10:00</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 pb-3 border-b">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Documenten geüpload</p>
                        <p className="text-sm text-gray-600">16 januari 2024, 10:15</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 pb-3 border-b">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Identiteit geverifieerd</p>
                        <p className="text-sm text-gray-600">17 januari 2024, 14:30</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Interesse getoond in 3 woningen</p>
                        <p className="text-sm text-gray-600">20 januari 2024, 16:45</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        <BaseModalActions
          customActions={
            <div className="flex justify-between w-full">
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleAddToFavorites}>
                  <Heart className="w-4 h-4 mr-2" />
                  Favoriet
                </Button>
                <Button variant="outline" onClick={handleSendMessage}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Bericht
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Sluiten
                </Button>
                <Button onClick={handleInviteViewing} className="bg-green-600 hover:bg-green-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Uitnodigen voor Bezichtiging
                </Button>
              </div>
            </div>
          }
        />
      </div>
    </BaseModal>
  );
};

export default TenantProfileModal;
