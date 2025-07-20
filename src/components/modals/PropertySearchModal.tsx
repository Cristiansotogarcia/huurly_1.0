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
      <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Zoek Woningen</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Search Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="stad" className="text-sm sm:text-base">Stad</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="stad"
                  value={searchFilters.stad}
                  onChange={(e) => setSearchFilters({ ...searchFilters, stad: e.target.value })}
                  placeholder="Amsterdam, Rotterdam..."
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxHuurprijs" className="text-sm sm:text-base">Max. huurprijs</Label>
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
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="woningType" className="text-sm sm:text-base">Woningtype</Label>
              <Select 
                value={searchFilters.woningType} 
                onValueChange={(value) => setSearchFilters({ ...searchFilters, woningType: value })}
              >
                <SelectTrigger className="text-sm sm:text-base">
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
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button onClick={handleSearch} disabled={loading} className="flex-1 text-sm sm:text-base">
              {loading ? 'Zoeken...' : 'Zoeken'}
            </Button>
            <Button variant="outline" onClick={clearFilters} className="text-sm sm:text-base">
              Filters wissen
            </Button>
          </div>

          {/* Search Results */}
          {properties.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-base sm:text-lg font-semibold">Zoekresultaten</h3>
                <Badge variant="secondary" className="self-start sm:self-auto">{properties.length} woningen</Badge>
              </div>
              
              <div className="grid gap-3 sm:gap-4 max-h-80 sm:max-h-96 overflow-y-auto">
                {properties.map((property) => (
                  <div key={property.id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <h4 className="font-medium text-base sm:text-lg line-clamp-2">{property.title}</h4>
                      <span className="text-base sm:text-lg font-bold text-green-600 flex-shrink-0">
                        {formatPrice(property.rent)}/maand
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="text-xs sm:text-sm truncate">{property.address}, {property.city}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                      {property.bedrooms && (
                        <Badge variant="outline" className="text-xs">
                          <Bed className="w-3 h-3 mr-1" />
                          {property.bedrooms} kamers
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">{property.propertyType}</Badge>
                    </div>
                    
                    {property.beschrijving && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                        {property.beschrijving}
                      </p>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-500">
                        Beschikbaar: {property.availableFrom || 'Direct'}
                      </span>
                      <Button size="sm" variant="outline" className="text-xs sm:text-sm self-start sm:self-auto">
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
            <div className="text-center py-6 sm:py-8">
              <Home className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Geen woningen gevonden</h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                Probeer je zoekcriteria aan te passen om meer resultaten te vinden.
              </p>
            </div>
          )}

          {/* Initial State */}
          {properties.length === 0 && !searchFilters.stad && (
            <div className="text-center py-6 sm:py-8">
              <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Begin met zoeken</h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                Vul je zoekcriteria in en klik op zoeken om beschikbare woningen te vinden.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};