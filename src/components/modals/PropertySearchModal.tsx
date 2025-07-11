import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { propertyService, PropertySearchFilters } from '@/services/PropertyService';
import { Search, MapPin, Euro, Home, Calendar, Bed } from 'lucide-react';

interface PropertySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PropertySearchModal = ({ isOpen, onClose }: PropertySearchModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  
  const [searchFilters, setSearchFilters] = useState<PropertySearchFilters>({
    stad: '',
    maxHuurprijs: undefined,
    woningType: '',
    minOppervlakte: undefined,
    maxOppervlakte: undefined
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await propertyService.searchProperties(searchFilters);
      
      if (result.success && result.data) {
        setProperties(result.data);
        toast({
          title: 'Zoekresultaten',
          description: `${result.data.length} woningen gevonden`,
        });
      } else {
        throw new Error(result.error?.message || 'Zoeken mislukt');
      }
    } catch (error) {
      toast({
        title: 'Fout bij zoeken',
        description: 'Er is een fout opgetreden bij het zoeken naar woningen.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchFilters({ stad: '', maxHuurprijs: undefined, woningType: '', minOppervlakte: undefined, maxOppervlakte: undefined });
    setProperties([]);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Zoek Woningen</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="stad">Stad</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="stad"
                  value={searchFilters.stad}
                  onChange={(e) => setSearchFilters({ ...searchFilters, stad: e.target.value })}
                  placeholder="Amsterdam, Rotterdam..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxHuurprijs">Max. huurprijs</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="maxHuurprijs"
                  type="number"
                  value={searchFilters.maxHuurprijs || ''}
                  onChange={(e) => setSearchFilters({ 
                    ...searchFilters, 
                    maxHuurprijs: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  placeholder="1500"
                  className="pl-10"
                />
              </div>
            </div>


            <div className="space-y-2">
              <Label htmlFor="woningType">Woningtype</Label>
              <Select 
                value={searchFilters.woningType} 
                onValueChange={(value) => setSearchFilters({ ...searchFilters, woningType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle types</SelectItem>
                  <SelectItem value="appartement">Appartement</SelectItem>
                  <SelectItem value="huis">Huis</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                </SelectContent>
              </Select>
            </div>


          </div>

          {/* Search Actions */}
          <div className="flex space-x-3">
            <Button onClick={handleSearch} disabled={loading} className="flex-1">
              {loading ? 'Zoeken...' : 'Zoeken'}
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Filters wissen
            </Button>
          </div>

          {/* Search Results */}
          {properties.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Zoekresultaten</h3>
                <Badge variant="secondary">{properties.length} woningen</Badge>
              </div>
              
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {properties.map((property) => (
                  <div key={property.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-lg">{property.title}</h4>
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(property.rent)}/maand
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{property.address}, {property.city}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {property.bedrooms && (
                        <Badge variant="outline">
                          <Bed className="w-3 h-3 mr-1" />
                          {property.bedrooms} kamers
                        </Badge>
                      )}
                      <Badge variant="outline">{property.propertyType}</Badge>
                    </div>
                    
                    {property.beschrijving && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {property.beschrijving}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Beschikbaar: {property.availableFrom || 'Direct'}
                      </span>
                      <Button size="sm" variant="outline">
                        Bekijk details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading && properties.length === 0 && searchFilters.stad && (
            <div className="text-center py-8">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Geen woningen gevonden</h3>
              <p className="text-gray-600">
                Probeer je zoekcriteria aan te passen om meer resultaten te vinden.
              </p>
            </div>
          )}

          {/* Initial State */}
          {properties.length === 0 && !searchFilters.stad && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Begin met zoeken</h3>
              <p className="text-gray-600">
                Vul je zoekcriteria in en klik op zoeken om beschikbare woningen te vinden.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};