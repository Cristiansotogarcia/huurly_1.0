import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { demoTenantProfiles, demoViewingInvitations, demoStatistics } from '@/data/demoData';
import { Home, FileText, Calendar, User, Eye, TrendingUp } from 'lucide-react';

const HuurderDashboard = () => {
  const { user } = useAuthStore();
  const [isLookingForPlace, setIsLookingForPlace] = useState(true);
  const { toast } = useToast();

  const tenantProfile = demoTenantProfiles.find(p => p.userId === user?.id) || demoTenantProfiles[0];
  const viewingInvitations = demoViewingInvitations.filter(v => v.tenantId === user?.id);
  const stats = demoStatistics.tenant;

  const toggleLookingStatus = () => {
    setIsLookingForPlace(!isLookingForPlace);
    toast({
      title: "Status bijgewerkt",
      description: isLookingForPlace 
        ? "Je profiel is nu niet zichtbaar voor verhuurders"
        : "Je profiel is nu zichtbaar voor verhuurders"
    });
  };

  const handleLogout = () => {
    useAuthStore.getState().logout();
    window.location.href = '/';
  };

  if (!user || user.role !== 'huurder') {
    return <div>Toegang geweigerd</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-dutch-blue to-dutch-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="ml-2 text-xl font-bold text-dutch-blue">Huurly</span>
              <span className="ml-4 text-gray-500">| Huurder Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welkom, {user.name}</span>
              <Button variant="outline" onClick={handleLogout}>
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Toggle */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Zoekstatus</h3>
                <p className="text-gray-600">
                  {isLookingForPlace 
                    ? "Je profiel is zichtbaar voor verhuurders" 
                    : "Je profiel is niet zichtbaar voor verhuurders"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm">Niet zoekend</span>
                <Switch 
                  checked={isLookingForPlace}
                  onCheckedChange={toggleLookingStatus}
                />
                <span className="text-sm">Actief zoekend</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-dutch-blue" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">{stats.profileViews}</p>
                      <p className="text-xs text-muted-foreground">Profielweergaven</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-dutch-orange" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">{stats.invitationsReceived}</p>
                      <p className="text-xs text-muted-foreground">Uitnodigingen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">{stats.applicationsSubmitted}</p>
                      <p className="text-xs text-muted-foreground">Aanmeldingen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Home className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">{stats.acceptedApplications}</p>
                      <p className="text-xs text-muted-foreground">Geaccepteerd</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Mijn Profiel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <img 
                    src={tenantProfile.profilePicture} 
                    alt="Profielfoto"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">
                      {tenantProfile.firstName} {tenantProfile.lastName}
                    </h3>
                    <p className="text-gray-600">{tenantProfile.profession}</p>
                    <p className="text-sm text-gray-500 mt-2">{tenantProfile.bio}</p>
                    <div className="mt-4 flex space-x-2">
                      <Badge variant={tenantProfile.verificationStatus === 'approved' ? 'default' : 'secondary'}>
                        {tenantProfile.verificationStatus === 'approved' ? 'Geverifieerd' : 'In behandeling'}
                      </Badge>
                      <Badge variant="outline">
                        Inkomstenverificatie: €{tenantProfile.monthlyIncome?.toLocaleString() || tenantProfile.income?.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Bewerken
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Documenten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tenantProfile.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{doc.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {doc.type === 'id' ? 'Identiteitsbewijs' : 
                           doc.type === 'income' ? 'Inkomensverklaring' :
                           doc.type === 'employment' ? 'Arbeidscontract' : 'Referentie'}
                        </p>
                        {doc.rejectionReason && (
                          <p className="text-sm text-red-600 mt-1">{doc.rejectionReason}</p>
                        )}
                      </div>
                      <Badge variant={doc.status === 'approved' ? 'default' : 
                                    doc.status === 'rejected' ? 'destructive' : 'secondary'}>
                        {doc.status === 'approved' ? 'Goedgekeurd' :
                         doc.status === 'rejected' ? 'Afgewezen' : 'In behandeling'}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    Document toevoegen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Viewing Invitations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Bezichtigingen ({viewingInvitations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {viewingInvitations.length > 0 ? (
                  <div className="space-y-3">
                    {viewingInvitations.map((invitation) => (
                      <div key={invitation.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">Bezichtiging uitnodiging</h4>
                          <Badge variant={
                            invitation.status === 'accepted' ? 'default' :
                            invitation.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {invitation.status === 'accepted' ? 'Geaccepteerd' :
                             invitation.status === 'rejected' ? 'Afgewezen' : 'In afwachting'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Datum: {new Date(invitation.scheduledDate).toLocaleDateString('nl-NL')}
                        </p>
                        <p className="text-xs text-gray-600">
                          Deadline: {new Date(invitation.deadline).toLocaleDateString('nl-NL')}
                        </p>
                        {invitation.status === 'pending' && (
                          <div className="flex space-x-2 mt-3">
                            <Button size="sm" className="text-xs">Accepteren</Button>
                            <Button size="sm" variant="outline" className="text-xs">Afwijzen</Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Geen uitnodigingen</p>
                )}
              </CardContent>
            </Card>

            {/* My Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Mijn Voorkeuren</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-semibold">€{tenantProfile.preferences?.minBudget} - €{tenantProfile.preferences?.maxBudget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stad:</span>
                    <span className="font-semibold">{tenantProfile.preferences?.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kamers:</span>
                    <span className="font-semibold">{tenantProfile.preferences?.bedrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold">{tenantProfile.preferences?.propertyType}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Snelle Acties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full text-sm">
                    Zoek woningen
                  </Button>
                  <Button variant="outline" className="w-full text-sm">
                    Probleem melden
                  </Button>
                  <Button variant="outline" className="w-full text-sm">
                    Help & Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HuurderDashboard;
