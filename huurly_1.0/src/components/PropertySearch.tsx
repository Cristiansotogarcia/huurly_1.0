import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { propertyService, PropertyFilters } from '@/services/PropertyService';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, MapPin, Home, Euro, Bed, Bath, Calendar, Heart, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertySearchProps {
  onPropertySelect?: (property: any) => void;
  className?: string;
}

interface SearchFilters extends PropertyFilters {
  minRent: number;
  maxRent: number;
}

export const PropertySearch: React.FC<PropertySearchProps> = ({
  onPropertySelect,
  className
}) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    city: '',
    province: '',
    minRent: 0,
    maxRent: 3000,
    bedrooms: undefined,
    bathrooms: undefined,
    propertyType: '',
    furnished: undefined,
    petsAllowed: undefined,
    smokingAllowed: undefined,
  });

  const { toast } = useToast();

  const provinces = [
    'Noord-Holland', 'Zuid-Holland', 'Utrecht', 'Gelderland', 
    'Noord-Brabant', 'Overijssel', 'Limburg', 'Groningen', 
    'Friesland', 'Drenthe', 'Flevoland', 'Zeeland'
  ];

  const propertyTypes = [
    'Appartement', 'Huis', 'Studio', 'Kamer', 'Penthouse'
  ];

  useEffect(() => {
    searchProperties();
  }, []);

  const searchProperties = async () => {
    setLoading(true);
    try {
      const result = await propertyService.searchProperties(
        filters,
        { page: 1, limit: 20 },
        { column: 'created_at', ascending: false }
      );

      if (result.success && result.data) {
        setProperties(result.data);
      } else {
        toast({
          title: "Zoeken mislukt",
          description: result.error?.message || "Er is een fout opgetreden",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Zoeken mislukt",
        description: "Er is een onverwachte fout opgetreden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      city: '',
      province: '',
      minRent: 0,
      maxRent: 3000,
      bedrooms: undefined,
      bathrooms: undefined,
      propertyType: '',
      furnished: undefined,
      petsAllowed: undefined,
      smokingAllowed: undefined,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyImage = (property: any) => {
    const primaryImage = property.property_images?.find((img: any) => img.is_primary);
    return primaryImage?.image_url || property.property_images?.[0]?.image_url || '/placeholder.svg';
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Zoek op locatie, adres of trefwoorden..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-10"
            onKeyPress={(e) => e.key === 'Enter' && searchProperties()}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {Object.values(filters).some(v => v !== '' && v !== undefined && v !== 0 && v !== 3000) && (
            <Badge variant="secondary" className="ml-1">
              Actief
            </Badge>
          )}
        </Button>
        <Button onClick={searchProperties} disabled={loading}>
          {loading ? 'Zoeken...' : 'Zoeken'}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Geavanceerde filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Wissen
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Stad</Label>
                <Input
                  id="city"
                  placeholder="Bijv. Amsterdam"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="province">Provincie</Label>
                <Select value={filters.province} onValueChange={(value) => handleFilterChange('province', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer provincie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle provincies</SelectItem>
                    {provinces.map(province => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <Label>Huurprijs: {formatPrice(filters.minRent)} - {formatPrice(filters.maxRent)}</Label>
              <div className="mt-2 px-2">
                <Slider
                  value={[filters.minRent, filters.maxRent]}
                  onValueChange={([min, max]) => {
                    handleFilterChange('minRent', min);
                    handleFilterChange('maxRent', max);
                  }}
                  max={5000}
                  min={0}
                  step={50}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>€0</span>
                <span>€5.000+</span>
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bedrooms">Slaapkamers</Label>
                <Select value={filters.bedrooms?.toString() || ''} onValueChange={(value) => handleFilterChange('bedrooms', value ? parseInt(value) : undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bathrooms">Badkamers</Label>
                <Select value={filters.bathrooms?.toString() || ''} onValueChange={(value) => handleFilterChange('bathrooms', value ? parseInt(value) : undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="propertyType">Type woning</Label>
                <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange('propertyType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle types</SelectItem>
                    {propertyTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-3">
              <Label>Voorkeuren</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="furnished"
                    checked={filters.furnished === true}
                    onCheckedChange={(checked) => handleFilterChange('furnished', checked ? true : undefined)}
                  />
                  <Label htmlFor="furnished">Gemeubileerd</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="petsAllowed"
                    checked={filters.petsAllowed === true}
                    onCheckedChange={(checked) => handleFilterChange('petsAllowed', checked ? true : undefined)}
                  />
                  <Label htmlFor="petsAllowed">Huisdieren toegestaan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smokingAllowed"
                    checked={filters.smokingAllowed === true}
                    onCheckedChange={(checked) => handleFilterChange('smokingAllowed', checked ? true : undefined)}
                  />
                  <Label htmlFor="smokingAllowed">Roken toegestaan</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {properties.length} woningen gevonden
          </h3>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Geen woningen gevonden
              </h3>
              <p className="text-gray-600 mb-4">
                Probeer je zoekcriteria aan te passen om meer resultaten te vinden.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Filters wissen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative">
                  <img
                    src={getPropertyImage(property)}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  {property.property_images?.length > 1 && (
                    <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                      +{property.property_images.length - 1} foto's
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-lg truncate flex-1">
                      {property.title}
                    </h4>
                    <span className="text-lg font-bold text-dutch-blue ml-2">
                      {formatPrice(property.rent_amount)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm truncate">
                      {property.address}, {property.city}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Bed className="w-4 h-4 mr-1" />
                      {property.bedrooms}
                    </div>
                    {property.bathrooms && (
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        {property.bathrooms}
                      </div>
                    )}
                    {property.square_meters && (
                      <div className="flex items-center">
                        <Home className="w-4 h-4 mr-1" />
                        {property.square_meters}m²
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {property.furnished && (
                      <Badge variant="secondary" className="text-xs">Gemeubileerd</Badge>
                    )}
                    {property.pets_allowed && (
                      <Badge variant="secondary" className="text-xs">Huisdieren OK</Badge>
                    )}
                    {property.property_type && (
                      <Badge variant="outline" className="text-xs">{property.property_type}</Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => onPropertySelect?.(property)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Bekijken
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertySearch;
