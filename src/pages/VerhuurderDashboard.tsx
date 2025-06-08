
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { propertyService } from '@/services/PropertyService';
import { userService } from '@/services/UserService';
import { viewingService } from '@/services/ViewingService';
import { Search, Home, Users, Calendar, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ViewingInvitationModal from '@/components/modals/ViewingInvitationModal';
import TenantProfileModal from '@/components/modals/TenantProfileModal';
import AddPropertyModal from '@/components/modals/AddPropertyModal';
import NotificationBell from '@/components/NotificationBell';
import { notifyViewingInvitation, notifyApplicationReceived } from '@/hooks/useNotifications';
import { Logo } from '@/components/Logo';

const VerhuurderDashboard = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    maxBudget: '',
    minIncome: ''
  });
  const [allTenants, setAllTenants] = useState<any[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<any[]>([]);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const [properties, setProperties] = useState<any[]>([]);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const availableTenants = filteredTenants;

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const propsResult = await propertyService.getPropertiesByLandlord(user.id);
      if (propsResult.success && propsResult.data) {
        setProperties(propsResult.data);
      }

      const tenantsResult = await userService.getUsers({ role: 'huurder' });
      if (tenantsResult.success && tenantsResult.data) {
        setAllTenants(tenantsResult.data);
        setFilteredTenants(
          tenantsResult.data.filter((t: any) => t.is_looking_for_place),
        );
      }
    })();
  }, [user?.id]);

  const handlePropertyCreated = (property: any) => {
    setProperties(prev => [...prev, property]);
    toast({ title: "Woning toegevoegd", description: "Je woning is opgeslagen." });
  };

  const handleLogout = () => {
    useAuthStore.getState().logout();
    window.location.href = '/';
  };

  const handleSearch = () => {
    let results = allTenants.filter(tenant => tenant.is_looking_for_place);

    // Apply filters
    if (searchFilters.city) {
      results = results.filter(tenant => 
        tenant.preferences?.city?.toLowerCase().includes(searchFilters.city.toLowerCase())
      );
    }

    if (searchFilters.maxBudget) {
      const maxBudget = parseInt(searchFilters.maxBudget);
      results = results.filter(tenant => 
        tenant.preferences?.maxBudget <= maxBudget
      );
    }

    if (searchFilters.minIncome) {
      const minIncome = parseInt(searchFilters.minIncome);
      results = results.filter(tenant => 
        tenant.income >= minIncome
      );
    }

    setFilteredTenants(results);
    
    toast({
      title: "Zoekresultaten bijgewerkt",
      description: `${results.length} huurder(s) gevonden die voldoen aan je criteria.`
    });
  };

  const handleViewProfile = (tenant: any) => {
    setSelectedTenant(tenant);
    setShowProfileModal(true);
  };

  const handleInviteViewing = (tenant: any) => {
    setSelectedTenant(tenant);
    setSelectedProperty(properties[0]);
    setShowViewingModal(true);
  };

  const handleInvitationSent = async (invitationData: any) => {
    if (selectedTenant && selectedProperty) {
      await viewingService.createViewingInvitation({
        propertyId: selectedProperty.id,
        tenantId: selectedTenant.id || selectedTenant.userId,
        scheduledDate: invitationData.date,
        deadline: invitationData.date,
        message: invitationData.message,
      });

      notifyViewingInvitation(
        user?.name || 'Verhuurder',
        selectedProperty.address,
        invitationData.date,
        selectedTenant.id
      );

      toast({
        title: 'Uitnodiging verzonden!',
        description: `${selectedTenant?.firstName} ${selectedTenant?.lastName} heeft een uitnodiging ontvangen.`
      });
    }
  };

  const handleReportIssue = () => {
    // TODO: connect with IssueService
    toast({
      title: "Issue gerapporteerd",
      description: "Je probleem is gerapporteerd en wordt onderzocht door ons team."
    });
  };

  if (!user || user.role !== 'verhuurder') {
    return <div>Toegang geweigerd</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo />
              <span className="ml-4 text-gray-500">| Verhuurder Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <span className="text-sm text-gray-600">Welkom, {user.name}</span>
              <Button variant="outline" onClick={handleLogout}>
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Home className="w-8 h-8 text-dutch-blue" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{properties.length}</p>
                  <p className="text-gray-600">Actieve Objecten</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-dutch-orange" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{availableTenants.length}</p>
                  <p className="text-gray-600">Beschikbare Huurders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-gray-600">Geplande Bezichtigingen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Search className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-gray-600">Matches Deze Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Huurders Zoeken
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Stad</label>
                    <Input 
                      placeholder="Amsterdam" 
                      value={searchFilters.city}
                      onChange={(e) => setSearchFilters({...searchFilters, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Budget</label>
                    <Input 
                      placeholder="€2000" 
                      value={searchFilters.maxBudget}
                      onChange={(e) => setSearchFilters({...searchFilters, maxBudget: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Min Inkomen</label>
                    <Input 
                      placeholder="€4000" 
                      value={searchFilters.minIncome}
                      onChange={(e) => setSearchFilters({...searchFilters, minIncome: e.target.value})}
                    />
                  </div>
                </div>
                <Button className="mt-4" onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Zoeken
                </Button>
              </CardContent>
            </Card>

            {/* Available Tenants */}
            <Card>
              <CardHeader>
                <CardTitle>Beschikbare Huurders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableTenants.map((tenant) => (
                    <div key={tenant.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4">
                        <img 
                          src={tenant.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face'} 
                          alt={`${tenant.firstName} ${tenant.lastName}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                              {tenant.firstName} {tenant.lastName}
                            </h3>
                            <Badge variant={tenant.verificationStatus === 'approved' ? 'default' : 'secondary'}>
                              {tenant.verificationStatus === 'approved' ? 'Geverifieerd' : 'In behandeling'}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{tenant.profession}</p>
                          <p className="text-sm text-gray-500 mt-1">{tenant.bio}</p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                            <span>Inkomen: €{tenant.income.toLocaleString()}</span>
                            <span>Budget: €{tenant.preferences.minBudget} - €{tenant.preferences.maxBudget}</span>
                            <span>Kamers: {tenant.preferences.bedrooms}</span>
                          </div>
                          <div className="mt-3 flex space-x-2">
                            <Button size="sm" onClick={() => handleInviteViewing(tenant)}>
                              Uitnodigen voor Bezichtiging
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleViewProfile(tenant)}>
                              Profiel Bekijken
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Properties */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Home className="w-5 h-5 mr-2" />
                    Mijn Objecten
                  </span>
                  <Button size="sm" onClick={() => setShowAddPropertyModal(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Nieuw
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {properties.map((property) => (
                    <div key={property.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">{property.title}</h4>
                      <p className="text-xs text-gray-600">{property.address}, {property.city}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-semibold">€{property.rent}/maand</span>
                        <Badge variant={property.isActive ? 'default' : 'secondary'}>
                          {property.isActive ? 'Actief' : 'Inactief'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recente Activiteit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Emma Bakker heeft interesse getoond</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Nieuwe bezichtiging ingepland</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Document goedgekeurd voor Jan de Vries</span>
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
                  <Button variant="outline" className="w-full text-sm" onClick={handleReportIssue}>
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

      {/* Modals */}
      <ViewingInvitationModal
        open={showViewingModal}
        onOpenChange={setShowViewingModal}
        tenant={selectedTenant}
        property={selectedProperty}
        onInvitationSent={handleInvitationSent}
      />
      
      <TenantProfileModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        tenant={selectedTenant}
        onInviteViewing={handleInviteViewing}
      />

      <AddPropertyModal
        open={showAddPropertyModal}
        onOpenChange={setShowAddPropertyModal}
        onCreated={handlePropertyCreated}
      />
    </div>
  );
};

export default VerhuurderDashboard;
