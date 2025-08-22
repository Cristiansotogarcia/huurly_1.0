import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Euro, Home, ArrowLeft, Heart, Eye, Bed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DashboardHeader } from '@/components/dashboard';
import { useAuthStore } from '@/store/authStore';

interface Property {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  address: string;
  city: string;
  rent: number;
  bedrooms: number;
  propertyType: string;
  images: string[];
  requirements: {
    minIncome: number;
    maxAge?: number;
    minAge?: number;
    allowPets: boolean;
  };
  isActive: boolean;
  availableFrom?: string;
  deposit?: number;
  utilities?: number;
  
  // Enhanced property fields
  furnished?: boolean;
  parkingAvailable?: boolean;
  smokingAllowed?: boolean;
  petsAllowed?: boolean;
  availableUntil?: string;
  voorzieningen?: string[];
}

// Mock data for demonstration
const mockProperties: Property[] = [
  {
    id: '1',
    landlordId: 'landlord1',
    title: 'Moderne Appartement in Centrum',
    description: 'Prachtig modern appartement in het hart van Amsterdam met alle voorzieningen op loopafstand.',
    address: 'Damstraat 1',
    city: 'Amsterdam',
    rent: 1500,
    bedrooms: 2,
    propertyType: 'Appartement',
    images: ['/api/placeholder/400/300'],
    requirements: {
      minIncome: 3000,
      allowPets: true
    },
    isActive: true,
    furnished: true,
    parkingAvailable: false,
    smokingAllowed: false,
    petsAllowed: true,
    voorzieningen: ['lift', 'balkon']
  },
  {
    id: '2',
    landlordId: 'landlord2',
    title: 'Gezellige Studio',
    description: 'Compacte maar gezellige studio perfect voor studenten of young professionals.',
    address: 'Oudegracht 100',
    city: 'Utrecht',
    rent: 950,
    bedrooms: 1,
    propertyType: 'Studio',
    images: ['/api/placeholder/400/300'],
    requirements: {
      minIncome: 2000,
      allowPets: false
    },
    isActive: true,
    furnished: true,
    parkingAvailable: true,
    smokingAllowed: false,
    petsAllowed: false
  },
  {
    id: '3',
    landlordId: 'landlord3',
    title: 'Ruim Familiehuis',
    description: 'Ruim familiehuis met tuin, perfect voor gezinnen met kinderen.',
    address: 'Kralingseweg 50',
    city: 'Rotterdam',
    rent: 2200,
    bedrooms: 4,
    propertyType: 'Huis',
    images: ['/api/placeholder/400/300'],
    requirements: {
      minIncome: 4500,
      allowPets: true
    },
    isActive: true,
    furnished: false,
    parkingAvailable: true,
    smokingAllowed: false,
    petsAllowed: true,
    voorzieningen: ['tuin', 'garage']
  }
];

const PropertySearch: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [properties] = useState<Property[]>(mockProperties);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(mockProperties);
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    minBedrooms: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    applyFilters();
  }, [filters, searchTerm]);

  const applyFilters = () => {
    let filtered = properties;

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(property => 
        property.city.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Price filters
    if (filters.minPrice) {
      filtered = filtered.filter(property => property.rent >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.rent <= parseInt(filters.maxPrice));
    }

    // Property type filter
    if (filters.propertyType) {
      filtered = filtered.filter(property => property.propertyType === filters.propertyType);
    }

    // Bedrooms filter
    if (filters.minBedrooms) {
      filtered = filtered.filter(property => property.bedrooms >= parseInt(filters.minBedrooms));
    }

    setFilteredProperties(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
    toast({
      title: favorites.includes(propertyId) ? 'Verwijderd van favorieten' : 'Toegevoegd aan favorieten',
      description: 'Je favorieten zijn bijgewerkt.',
    });
  };

  const handleViewProperty = (propertyId: string) => {
    toast({
      title: 'Eigenschap bekijken',
      description: `Functionaliteit voor het bekijken van eigenschap ${propertyId} wordt binnenkort toegevoegd.`,
    });
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      propertyType: '',
      minBedrooms: ''
    });
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <DashboardHeader
          user={{
            id: user.id,
            name: user.user_metadata?.full_name || user.email,
            role: user.user_metadata?.role || 'huurder',
            email: user.email,
            isActive: true,
            createdAt: user.createdAt,
              hasPayment: false,
              subscriptionEndDate: undefined,
              profilePictureUrl: undefined
            }}
          onSettings={() => {}}
          onLogout={() => navigate('/login')}
        />
      )}

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/huurder-dashboard')}
                className="flex items-center space-x-2 w-fit"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Terug naar Dashboard</span>
                <span className="sm:hidden">Terug</span>
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Woningen Zoeken</h1>
                <p className="text-gray-600 text-sm sm:text-base">Vind je perfecte woning</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Zoeken & Filteren</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div>
                <Label htmlFor="search">Zoeken</Label>
                <Input
                  id="search"
                  placeholder="Zoek op titel, locatie of beschrijving..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="location">Locatie</Label>
                  <Input
                    id="location"
                    placeholder="Stad of regio"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="minPrice">Min. Prijs (€)</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    placeholder="500"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="maxPrice">Max. Prijs (€)</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    placeholder="2000"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="propertyType">Type Woning</Label>
                  <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange('propertyType', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecteer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Appartement">Appartement</SelectItem>
                      <SelectItem value="Huis">Huis</SelectItem>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="Kamer">Kamer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="minBedrooms">Min. Slaapkamers</Label>
                  <Select value={filters.minBedrooms} onValueChange={(value) => handleFilterChange('minBedrooms', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Aantal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4">
                <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                  Filters Wissen
                </Button>
                <p className="text-sm text-gray-600 text-center sm:text-right">
                  {filteredProperties.length} van {properties.length} woningen gevonden
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredProperties.map(property => (
    <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{property.title}</CardTitle>
        <CardDescription className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {property.address}, {property.city}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Euro className="w-4 h-4" />
            <span className="font-semibold">{property.rent}</span>
            <span className="text-sm text-gray-500">/maand</span>
          </div>
          <div className="flex items-center space-x-2">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms} slaapkamers</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {property.furnished && <Badge variant="secondary">Gemeubileerd</Badge>}
          {property.parkingAvailable && <Badge variant="secondary">Parkeerplaats</Badge>}
          {property.petsAllowed && <Badge variant="secondary">Huisdieren toegestaan</Badge>}
          {property.voorzieningen?.map(voorziening => (
            <Badge key={voorziening} variant="outline">{voorziening}</Badge>
          ))}
        </div>
        <p className="text-sm text-gray-600 mb-4">{property.description}</p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">Minimaal inkomen:</span>
            <span className="text-sm">€{property.requirements.minIncome}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">Huisdieren:</span>
            <span className="text-sm">{property.requirements.allowPets ? 'Toegestaan' : 'Niet toegestaan'}</span>
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={() => handleViewProperty(property.id)}>
            <Eye className="w-4 h-4 mr-2" />
            Bekijken
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => toggleFavorite(property.id)}
            className={favorites.includes(property.id) ? 'text-red-500' : ''}
          >
            <Heart className="w-4 h-4 mr-2" />
            Favoriet
          </Button>
        </div>
      </CardContent>
    </Card>
  ))}
</div>

          {filteredProperties.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Geen woningen gevonden
                </h3>
                <p className="text-gray-600 mb-4">
                  Probeer je zoekcriteria aan te passen om meer resultaten te vinden.
                </p>
                <Button onClick={clearFilters}>
                  Filters Wissen
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;