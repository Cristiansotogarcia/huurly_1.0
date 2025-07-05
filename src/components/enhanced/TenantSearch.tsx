import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchService } from '@/services/SearchService';
import { favoritesService } from '@/services/FavoritesService';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { Search, Heart, MessageCircle, Eye, MapPin, Euro, Users, Home } from 'lucide-react';

interface TenantProfile {
  id: string;
  naam: string;
  email: string;
  leeftijd?: number;
  beroep?: string;
  inkomen?: number;
  beschrijving?: string;
  profielfoto_url?: string;
  locatie_voorkeur?: string[];
  max_huur?: number;
  min_kamers?: number;
  max_kamers?: number;
  partner?: boolean;
  kinderen?: number;
  huisdieren?: boolean;
  roken?: boolean;
}

interface TenantSearchProps {
  onSelectTenant?: (tenant: TenantProfile) => void;
  onContactTenant?: (tenant: TenantProfile) => void;
}

export const TenantSearch: React.FC<TenantSearchProps> = ({
  onSelectTenant,
  onContactTenant
}) => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [searchResults, setSearchResults] = useState<TenantProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState({
    leeftijd_min: '',
    leeftijd_max: '',
    inkomen_min: '',
    max_huur_min: '',
    locatie: '',
    partner: '',
    huisdieren: '',
    roken: '',
    beroep: ''
  });

  useEffect(() => {
    loadActiveTenants();
    loadFavorites();
  }, []);

  const loadActiveTenants = async () => {
    setLoading(true);
    try {
      const result = await SearchService.searchTenantProfiles('', {});
      if (result.success && result.data) {
        setSearchResults(result.data);
      }
    } catch (error) {
      toast({
        title: 'Fout bij laden huurders',
        description: 'Er kon geen verbinding worden gemaakt met de database.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!user?.id) return;
    try {
      const result = await favoritesService.listSavedProfiles(user.id);
      if (result.success && result.data) {
        const favoriteIds = new Set(result.data);
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      const result = await SearchService.searchTenantProfiles('', { filters: searchFilters });
      if (result.success && result.data) {
        setSearchResults(result.data);
      }
    } catch (error) {
      toast({
        title: 'Zoekfout',
        description: 'Er is een fout opgetreden bij het zoeken.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (tenantId: string) => {
    if (!user?.id) return;
    
    try {
      if (favorites.has(tenantId)) {
        const result = await favoritesService.removeProfile(user.id, tenantId);
        if (result.success) {
          setFavorites(prev => {
            const next = new Set(prev);
            next.delete(tenantId);
            return next;
          });
          toast({
            title: 'Favoriet verwijderd',
            description: 'Huurder is verwijderd uit uw favorieten.',
          });
        }
      } else {
        const result = await favoritesService.saveProfile(user.id, tenantId);
        if (result.success) {
          setFavorites(prev => new Set([...prev, tenantId]));
          toast({
            title: 'Favoriet toegevoegd',
            description: 'Huurder is toegevoegd aan uw favorieten.',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Fout',
        description: 'Er is een fout opgetreden bij het bijwerken van favorieten.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Zoekfilters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="leeftijd_min">Min. leeftijd</Label>
              <Input
                id="leeftijd_min"
                type="number"
                value={filters.leeftijd_min}
                onChange={(e) => setFilters(prev => ({ ...prev, leeftijd_min: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="leeftijd_max">Max. leeftijd</Label>
              <Input
                id="leeftijd_max"
                type="number"
                value={filters.leeftijd_max}
                onChange={(e) => setFilters(prev => ({ ...prev, leeftijd_max: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="inkomen_min">Min. inkomen</Label>
              <Input
                id="inkomen_min"
                type="number"
                value={filters.inkomen_min}
                onChange={(e) => setFilters(prev => ({ ...prev, inkomen_min: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="max_huur_min">Min. budget</Label>
              <Input
                id="max_huur_min"
                type="number"
                value={filters.max_huur_min}
                onChange={(e) => setFilters(prev => ({ ...prev, max_huur_min: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="locatie">Locatie</Label>
              <Input
                id="locatie"
                value={filters.locatie}
                onChange={(e) => setFilters(prev => ({ ...prev, locatie: e.target.value }))}
                placeholder="Stad of regio"
              />
            </div>
            <div>
              <Label htmlFor="partner">Partner</Label>
              <Select value={filters.partner} onValueChange={(value) => setFilters(prev => ({ ...prev, partner: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle</SelectItem>
                  <SelectItem value="true">Ja</SelectItem>
                  <SelectItem value="false">Nee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="huisdieren">Huisdieren</Label>
              <Select value={filters.huisdieren} onValueChange={(value) => setFilters(prev => ({ ...prev, huisdieren: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle</SelectItem>
                  <SelectItem value="true">Ja</SelectItem>
                  <SelectItem value="false">Nee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="roken">Roken</Label>
              <Select value={filters.roken} onValueChange={(value) => setFilters(prev => ({ ...prev, roken: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle</SelectItem>
                  <SelectItem value="true">Ja</SelectItem>
                  <SelectItem value="false">Nee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Zoeken
            </Button>
            <Button variant="outline" onClick={() => setFilters({
              leeftijd_min: '', leeftijd_max: '', inkomen_min: '', max_huur_min: '', 
              locatie: '', partner: '', huisdieren: '', roken: '', beroep: ''
            })}>
              Filters wissen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Beschikbare Huurders ({searchResults.length})
          </h3>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((tenant) => (
              <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={tenant.profielfoto_url} />
                        <AvatarFallback>
                          {tenant.naam.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{tenant.naam}</h4>
                        <p className="text-sm text-muted-foreground">
                          {tenant.leeftijd && `${tenant.leeftijd} jaar`}
                          {tenant.beroep && ` • ${tenant.beroep}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(tenant.id)}
                      className={favorites.has(tenant.id) ? 'text-red-500' : 'text-gray-400'}
                    >
                      <Heart className={`w-4 h-4 ${favorites.has(tenant.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>

                  {tenant.beschrijving && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {tenant.beschrijving}
                    </p>
                  )}

                  <div className="space-y-2">
                    {tenant.inkomen && (
                      <div className="flex items-center text-sm">
                        <Euro className="w-4 h-4 mr-2 text-green-600" />
                        <span>€{tenant.inkomen.toLocaleString()} inkomen</span>
                      </div>
                    )}
                    
                    {tenant.max_huur && (
                      <div className="flex items-center text-sm">
                        <Home className="w-4 h-4 mr-2 text-blue-600" />
                        <span>Tot €{tenant.max_huur.toLocaleString()} huur</span>
                      </div>
                    )}

                    {(tenant.min_kamers || tenant.max_kamers) && (
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 mr-2 text-purple-600" />
                        <span>
                          {tenant.min_kamers && tenant.max_kamers 
                            ? `${tenant.min_kamers}-${tenant.max_kamers} kamers`
                            : tenant.min_kamers 
                            ? `Min. ${tenant.min_kamers} kamers`
                            : `Max. ${tenant.max_kamers} kamers`
                          }
                        </span>
                      </div>
                    )}

                    {tenant.locatie_voorkeur && tenant.locatie_voorkeur.length > 0 && (
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{tenant.locatie_voorkeur.slice(0, 2).join(', ')}</span>
                        {tenant.locatie_voorkeur.length > 2 && (
                          <span className="text-muted-foreground"> +{tenant.locatie_voorkeur.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {tenant.partner && <Badge variant="secondary" className="text-xs">Partner</Badge>}
                    {tenant.kinderen && tenant.kinderen > 0 && (
                      <Badge variant="secondary" className="text-xs">{tenant.kinderen} kind(eren)</Badge>
                    )}
                    {tenant.huisdieren && <Badge variant="secondary" className="text-xs">Huisdieren</Badge>}
                    {tenant.roken && <Badge variant="destructive" className="text-xs">Roker</Badge>}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectTenant?.(tenant)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Bekijk
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onContactTenant?.(tenant)}
                      className="flex-1"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && searchResults.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Geen huurders gevonden
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Er zijn geen huurders gevonden die voldoen aan uw zoekcriteria. Probeer uw filters aan te passen.
              </p>
              <Button onClick={loadActiveTenants} variant="outline">
                Alle actieve huurders tonen
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};