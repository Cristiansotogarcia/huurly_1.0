import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Euro, Home, Bed, Bath, Square } from 'lucide-react';
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

// Mock properties data (Dutch)
const mockProperties = [
  {
    id: '1',
    titel: 'Modern Appartement in Amsterdam Centrum',
    beschrijving: 'Prachtig modern appartement in het hart van Amsterdam met geweldige openbaar vervoer verbindingen.',
    adres: 'Damrak 123',
    stad: 'Amsterdam',
    provincie: 'Noord-Holland',
    postcode: '1012 AB',
    huurprijs: 1500,
    oppervlakte: 75,
    aantal_kamers: 3,
    aantal_slaapkamers: 2,
    woning_type: 'Appartement',
    meubilering: 'Gemeubileerd',
    status: 'actief' as const,
    foto_urls: ['/api/placeholder/400/300'],
    beschikbaar_vanaf: '2025-08-01'
  },
  {
    id: '2',
    titel: 'Gezellige Studio in Utrecht',
    beschrijving: 'Compacte maar goed ontworpen studio appartement perfect voor studenten of young professionals.',
    adres: 'Oudegracht 456',
    stad: 'Utrecht',
    provincie: 'Utrecht',
    postcode: '3511 AB',
    huurprijs: 900,
    oppervlakte: 45,
    aantal_kamers: 2,
    aantal_slaapkamers: 1,
    woning_type: 'Studio',
    meubilering: 'Gestoffeerd',
    status: 'actief' as const,
    foto_urls: ['/api/placeholder/400/300'],
    beschikbaar_vanaf: '2025-07-15'
  },
  {
    id: '3',
    titel: 'Familiehuis in Rotterdam',
    beschrijving: 'Ruim familiehuis met tuin, perfect voor gezinnen met kinderen.',
    adres: 'Coolsingel 789',
    stad: 'Rotterdam',
    provincie: 'Zuid-Holland',
    postcode: '3012 AB',
    huurprijs: 2200,
    oppervlakte: 120,
    aantal_kamers: 5,
    aantal_slaapkamers: 4,
    woning_type: 'Huis',
    meubilering: 'Leeg',
    status: 'actief' as const,
    foto_urls: ['/api/placeholder/400/300'],
    beschikbaar_vanaf: '2025-09-01'
  }
];

const WoningenZoeken = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [city, setCity] = useState('');
  
  // Filter properties based on search criteria
  const filteredProperties = mockProperties.filter(property => {
    const matchesSearch = property.titel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.stad.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.beschrijving.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = !maxPrice || property.huurprijs <= parseInt(maxPrice);
    const matchesType = !propertyType || property.woning_type === propertyType;
    const matchesCity = !city || property.stad.toLowerCase().includes(city.toLowerCase());
    
    return matchesSearch && matchesPrice && matchesType && matchesCity;
  });

  const handleApply = (propertyId: string, propertyTitle: string) => {
    toast({
      title: "Aanvraag Ingediend!",
      description: `Je aanvraag voor "${propertyTitle}" is succesvol ingediend. Je wordt doorgestuurd naar je aanvragen.`,
    });
    // In real implementation, this would call the ApplicationService
    setTimeout(() => navigate('/mijn-aanvragen'), 2000);
  };

  const handleFavorite = (propertyId: string, propertyTitle: string) => {
    toast({
      title: "Toegevoegd aan Favorieten",
      description: `"${propertyTitle}" is toegevoegd aan je favorieten.`,
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Woningen Zoeken</h1>
            <p className="text-gray-600">Vind je perfecte woning met onze geavanceerde zoekfilters</p>
          </div>

          {/* Search Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Zoekfilters</CardTitle>
              <CardDescription>Verfijn je zoekopdracht om de perfecte woning te vinden</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zoeken
                  </label>
                  <Input
                    type="text"
                    placeholder="Zoek op titel, stad of beschrijving..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stad
                  </label>
                  <Input
                    type="text"
                    placeholder="Bijv. Amsterdam, Utrecht..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max. Huurprijs
                  </label>
                  <Input
                    type="number"
                    placeholder="€ 1500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Woning Type
                  </label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Alle types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Alle types</SelectItem>
                      <SelectItem value="Appartement">Appartement</SelectItem>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="Huis">Huis</SelectItem>
                      <SelectItem value="Kamer">Kamer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setMaxPrice('');
                    setPropertyType('');
                    setCity('');
                  }}
                  variant="outline"
                >
                  Filters Wissen
                </Button>
                <Button onClick={() => navigate('/huurder-dashboard')}>
                  Terug naar Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="mb-4">
            <p className="text-gray-600">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'woning' : 'woningen'} gevonden
            </p>
          </div>

          {/* Property Listings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProperties.map(property => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  <img 
                    src={property.foto_urls[0] || '/api/placeholder/400/300'} 
                    alt={property.titel}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-green-500">
                    {property.status === 'actief' ? 'Beschikbaar' : 'Niet beschikbaar'}
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {property.titel}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.adres}, {property.stad}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Euro className="h-4 w-4 mr-1" />
                      €{property.huurprijs}/maand
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Square className="h-4 w-4 mr-1" />
                      {property.oppervlakte}m²
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Home className="h-4 w-4 mr-1" />
                      {property.aantal_kamers} kamers
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.aantal_slaapkamers} slaapkamers
                    </div>
                  </div>

                  <div className="mb-3">
                    <Badge variant="outline" className="mr-2">
                      {property.woning_type}
                    </Badge>
                    <Badge variant="outline">
                      {property.meubilering}
                    </Badge>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {property.beschrijving}
                  </p>

                  <div className="text-sm text-gray-500 mb-4">
                    Beschikbaar vanaf: {property.beschikbaar_vanaf}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleApply(property.id, property.titel)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Aanvragen
                    </Button>
                    <Button 
                      onClick={() => handleFavorite(property.id, property.titel)}
                      variant="outline"
                      className="px-3"
                    >
                      ❤️
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredProperties.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Geen woningen gevonden
                </h3>
                <p className="text-gray-600 mb-4">
                  Probeer je zoekfilters aan te passen om meer resultaten te vinden.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setMaxPrice('');
                    setPropertyType('');
                    setCity('');
                  }}
                  variant="outline"
                >
                  Alle Filters Wissen
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default WoningenZoeken;

