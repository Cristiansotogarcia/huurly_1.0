import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Euro, Home, ArrowLeft, Heart, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DashboardHeader } from '@/components/dashboard';
import { useAuthStore } from '@/store/authStore';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  description: string;
  imageUrl: string;
  available: boolean;
}

// Mock data for demonstration
const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Moderne Appartement in Centrum',
    location: 'Amsterdam, Noord-Holland',
    price: 1500,
    type: 'Appartement',
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    description: 'Prachtig modern appartement in het hart van Amsterdam met alle voorzieningen op loopafstand.',
    imageUrl: '/api/placeholder/400/300',
    available: true
  },
  {
    id: '2',
    title: 'Gezellige Studio',
    location: 'Utrecht, Utrecht',
    price: 950,
    type: 'Studio',
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    description: 'Compacte maar gezellige studio perfect voor studenten of young professionals.',
    imageUrl: '/api/placeholder/400/300',
    available: true
  },
  {
    id: '3',
    title: 'Ruim Familiehuis',
    location: 'Rotterdam, Zuid-Holland',
    price: 2200,
    type: 'Huis',
    bedrooms: 4,
    bathrooms: 2,
    area: 120,
    description: 'Ruim familiehuis met tuin, perfect voor gezinnen met kinderen.',
    imageUrl: '/api/placeholder/400/300',
    available: true
  }
];

const PropertySearch: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>(mockProperties);
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
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(property => 
        property.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Price filters
    if (filters.minPrice) {
      filtered = filtered.filter(property => property.price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.price <= parseInt(filters.maxPrice));
    }

    // Property type filter
    if (filters.propertyType) {
      filtered = filtered.filter(property => property.type === filters.propertyType);
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
      description: 'Functionaliteit voor het bekijken van eigenschappen wordt binnenkort toegevoegd.',
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
            subscriptionEndDate: null,
            profilePictureUrl: null
          }}
          onSettings={() => {}}
          onLogout={() => navigate('/login')}
        />
      )}

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/huurder-dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Terug naar Dashboard</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Woningen Zoeken</h1>
                <p className="text-gray-600">Vind je perfecte woning</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

              <div className="flex justify-between items-center pt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Filters Wissen
                </Button>
                <p className="text-sm text-gray-600">
                  {filteredProperties.length} van {properties.length} woningen gevonden
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => toggleFavorite(property.id)}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.includes(property.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-600'
                      }`}
                    />
                  </Button>
                  <Badge
                    className="absolute top-2 left-2"
                    variant={property.available ? 'default' : 'secondary'}
                  >
                    {property.available ? 'Beschikbaar' : 'Niet beschikbaar'}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{property.title}</h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.location}
                    </div>
                    <div className="flex items-center text-blue-600 font-semibold">
                      <Euro className="w-4 h-4 mr-1" />
                      €{property.price}/maand
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{property.bedrooms} slaapkamers</span>
                      <span>{property.bathrooms} badkamers</span>
                      <span>{property.area}m²</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {property.description}
                    </p>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button
                      className="flex-1"
                      onClick={() => handleViewProperty(property.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Bekijken
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