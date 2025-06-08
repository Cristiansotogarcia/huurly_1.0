import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { propertyService } from '@/services/PropertyService';
import { Search, MapPin, Euro, Home, Heart, Eye, Calendar } from 'lucide-react';

interface PropertySearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchFilters {
  city: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: string;
  propertyType: string;
}

const PropertySearchModal = ({ open, onOpenChange }: PropertySearchModalProps) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<SearchFilters>({
    city: '',
    minPrice: 0,
    maxPrice: 3000,
    bedrooms: '',
    propertyType: '',
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    const result = await propertyService.searchProperties({
      city: filters.city || undefined,
      minRent: filters.minPrice || undefined,
      maxRent: filters.maxPrice || undefined,
      bedrooms: filters.bedrooms ? parseInt(filters.bedrooms) : undefined,
      propertyType: filters.propertyType || undefined,
    });

    if (result.success && result.data) {
      setSearchResults(result.data);
      toast({
        title: 'Zoekresultaten bijgewerkt',
        description: `${result.data.length} woning(en) gevonden die voldoen aan je criteria.`,
      });
    } else {
      toast({
        title: 'Fout bij het zoeken',
        description: result.error?.message || 'Onbekende fout',
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const requestViewing = (propertyId: string) => {
    toast({
      title: "Bezichtiging aangevraagd",
      description: "Je aanvraag is verzonden naar de verhuurder. Je ontvangt binnenkort een reactie."
    });
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      minPrice: 0,
      maxPrice: 3000,
      bedrooms: '',
      propertyType: '',
    });
    handleSearch();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Woningen Zoeken
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Search Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Zoekfilters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="city">Stad</Label>
                  <Input
                    id="city"
                    placeholder="Amsterdam"
                    value={filters.city}
                    onChange={(e) => updateFilter('city', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="minPrice">Min. prijs (€)</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    placeholder="1000"
                    value={filters.minPrice || ''}
                    onChange={(e) => updateFilter('minPrice', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxPrice">Max. prijs (€)</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    placeholder="2000"
                    value={filters.maxPrice || ''}
                    onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bedrooms">Slaapkamers</Label>
                  <Select value={filters.bedrooms} onValueChange={(value) => updateFilter('bedrooms', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Alle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Alle</SelectItem>
                      <SelectItem value="1">1 slaapkamer</SelectItem>
                      <SelectItem value="2">2 slaapkamers</SelectItem>
                      <SelectItem value="3">3 slaapkamers</SelectItem>
                      <SelectItem value="4">4+ slaapkamers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="propertyType">Type</Label>
                  <Select value={filters.propertyType} onValueChange={(value) => updateFilter('propertyType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Alle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Alle</SelectItem>
                      <SelectItem value="Appartement">Appartement</SelectItem>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="Huis">Huis</SelectItem>
                      <SelectItem value="Kamer">Kamer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Zoeken
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  Filters wissen
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Zoekresultaten ({searchResults.length})
              </h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  Kaartweergave
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {searchResults.map((property) => (
                <Card key={property.id} className="hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
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
                      className="absolute top-2 left-2 bg-green-600"
                      variant={property.isActive ? 'default' : 'secondary'}
                    >
                      {property.isActive ? 'Beschikbaar' : 'Niet beschikbaar'}
                    </Badge>
                  </div>
                  
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-lg">{property.title}</h4>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {property.address}, {property.city}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{property.bedrooms} slaapkamer(s)</span>
                          <span>{property.propertyType}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-dutch-blue">
                            €{property.rent}
                          </div>
                          <div className="text-sm text-gray-600">per maand</div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {property.description}
                      </p>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => requestViewing(property.id)}
                          disabled={!property.isActive}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Bezichtiging
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </div>
                      
                      {property.requirements && (
                        <div className="text-xs text-gray-500 pt-2 border-t">
                          Min. inkomen: €{property.requirements.minIncome?.toLocaleString()}
                          {property.requirements.allowPets && " • Huisdieren toegestaan"}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {searchResults.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">Geen woningen gevonden</h3>
                    <p className="text-gray-600 mb-4">
                      Probeer je zoekfilters aan te passen om meer resultaten te vinden.
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Alle filters wissen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Sluiten
            </Button>
            
            <div className="flex space-x-2">
              <Button variant="outline">
                <Heart className="w-4 h-4 mr-2" />
                Favorieten ({favorites.length})
              </Button>
              <Button>
                Opgeslagen zoekopdrachten
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertySearchModal;
