import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PropertyModal } from '@/components/modals/PropertyModal';
import { useToast } from '@/hooks/use-toast';
import { propertyService } from '@/services/PropertyService';
import { Property } from '@/types';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Home,
  MapPin,
  Euro,
  Bed,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';

const PropertyManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const result = await propertyService.getProperties();
      if (result.success && result.data) {
        setProperties(result.data);
      } else {
        throw new Error(result.error?.message || 'Fout bij laden eigenschappen');
      }
    } catch (error) {
      toast({
        title: 'Fout bij laden',
        description: 'Er is een fout opgetreden bij het laden van je eigenschappen.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Weet je zeker dat je deze woning wilt verwijderen?')) {
      try {
        const result = await propertyService.deleteProperty(propertyId);
        if (result.success) {
          toast({
            title: 'Woning verwijderd',
            description: 'De woning is succesvol verwijderd.',
          });
          loadProperties(); // Refresh the list
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

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsPropertyModalOpen(true);
  };

  const handlePropertySave = () => {
    setIsPropertyModalOpen(false);
    setEditingProperty(null);
    loadProperties(); // Refresh the list
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? 'Actief' : 'Inactief'}
      </Badge>
    );
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = true;
    return matchesSearch && matchesFilter;
  });

  const propertyStats = {
    total: properties.length,
    active: properties.filter(p => p.isActive).length,
    rented: properties.filter(p => !p.isActive).length,
    totalValue: properties.reduce((sum, p) => sum + p.rent, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Eigenschappen Beheer</h1>
            <p className="text-gray-600">Beheer al je woningen en huurvoorstellen</p>
          </div>
          <Button onClick={() => setIsPropertyModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Woning
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Woningen</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{propertyStats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve Woningen</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{propertyStats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verhuurde Woningen</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{propertyStats.rented}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Huurwaarde</CardTitle>
              <Euro className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatPrice(propertyStats.totalValue)}
              </div>
              <p className="text-xs text-gray-500">per maand</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter & Zoek</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Zoek op titel, stad of adres..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white"
                >
                  <option value="all">Alle statussen</option>
                  <option value="actief">Actief</option>
                  <option value="inactief">Inactief</option>
                  <option value="verhuurd">Verhuurd</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Property Image Placeholder */}
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                    <Home className="w-16 h-16 text-white" />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{property.title}</h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{property.address}, {property.city}</span>
                        </div>
                      </div>
                      {getStatusBadge(property.isActive)}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                          <Euro className="w-4 h-4 mr-1" />
                          Huurprijs
                        </span>
                        <span className="font-semibold">{formatPrice(property.rent)}/maand</span>
                      </div>
                      
                      
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          Beschikbaar
                        </span>
                      <span>
                          {property.availableFrom ? 
                            new Date(property.availableFrom).toLocaleDateString('nl-NL') : 
                            'Direct'
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/property/${property.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Bekijken
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditProperty(property)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteProperty(property.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Home className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'Geen woningen gevonden' : 'Nog geen woningen toegevoegd'}
              </h3>
              <p className="text-gray-600 text-center mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Probeer je zoekcriteria aan te passen.' 
                  : 'Begin met het toevoegen van je eerste woning om huurders te vinden.'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button onClick={() => setIsPropertyModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Eerste Woning Toevoegen
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Property Modal */}
        <PropertyModal
          isOpen={isPropertyModalOpen}
          onClose={() => {
            setIsPropertyModalOpen(false);
            setEditingProperty(null);
          }}
          property={editingProperty}
          onSave={handlePropertySave}
        />
      </div>
    </div>
  );
};

export default PropertyManagementPage;