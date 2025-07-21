import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { MapPin, X, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';

// Helper function to safely extract error message
const getErrorMessage = (error: string | FieldError | Merge<FieldError, FieldErrorsImpl<any>>): string => {
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return (error.message as string) || 'Validation error';
  }
  return 'Validation error';
};

export interface LocationData {
  name?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

interface LocationSelectorProps {
  value: LocationData[];
  onChange: (locations: LocationData[]) => void;
  placeholder?: string;
  className?: string;
  error?: string | FieldError | Merge<FieldError, FieldErrorsImpl<any>>;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  value = [],
  onChange,
  placeholder = "Zoek naar steden...",
  className,
  error
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingRadius, setEditingRadius] = useState<number | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search function with fallback mechanisms
  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      
      // Try multiple approaches for better compatibility
      const searchMethods = [
        // Method 1: Standard Nominatim with CORS
        async () => {
          const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=nl&limit=5&q=${encodeURIComponent(query)}&addressdetails=1`;
          
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8'
            },
            mode: 'cors'
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          return await response.json();
        },
        
        // Method 2: Alternative endpoint
        async () => {
          const url = `https://nominatim.openstreetmap.org/search.php?format=json&countrycodes=nl&limit=5&q=${encodeURIComponent(query)}&addressdetails=1`;
          
          
          const response = await fetch(url, {
            method: 'GET',
            mode: 'cors'
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          return await response.json();
        },
        
        // Method 3: Fallback with mock data for development
        async () => {
          
          
          // Mock data for common Dutch cities
          const mockCities = [
            { display_name: 'Amsterdam, Noord-Holland', lat: '52.3676', lon: '4.9041', place_id: '1' },
            { display_name: 'Rotterdam, Zuid-Holland', lat: '51.9244', lon: '4.4777', place_id: '2' },
            { display_name: 'Den Haag, Zuid-Holland', lat: '52.0705', lon: '4.3007', place_id: '3' },
            { display_name: 'Utrecht, Utrecht', lat: '52.0907', lon: '5.1214', place_id: '4' },
            { display_name: 'Eindhoven, Noord-Brabant', lat: '51.4416', lon: '5.4697', place_id: '5' },
            { display_name: 'Tilburg, Noord-Brabant', lat: '51.5555', lon: '5.0913', place_id: '6' },
            { display_name: 'Groningen, Groningen', lat: '53.2194', lon: '6.5665', place_id: '7' },
            { display_name: 'Almere, Flevoland', lat: '52.3508', lon: '5.2647', place_id: '8' },
            { display_name: 'Breda, Noord-Brabant', lat: '51.5719', lon: '4.7683', place_id: '9' },
            { display_name: 'Nijmegen, Gelderland', lat: '51.8426', lon: '5.8518', place_id: '10' }
          ];
          
          return mockCities.filter(city => 
            city.display_name.toLowerCase().includes(query.toLowerCase())
          );
        }
      ];
      
      let results: NominatimResult[] = [];
      let methodUsed = 0;
      
      // Try each method until one succeeds
      for (let i = 0; i < searchMethods.length; i++) {
        try {
 
          results = await searchMethods[i]();
          methodUsed = i + 1;
          
          break;
        } catch (error) {
          
          if (i === searchMethods.length - 1) {
            throw error;
          }
        }
      }
      
      
      
      // Filter and clean location names (remove ', Nederland' suffix)
      const cleanedResults = results
        .filter(result => result.display_name && (result.display_name.includes('Nederland') || methodUsed === 3))
        .map(result => ({
          ...result,
          display_name: result.display_name
            .replace(/, Nederland$/, '')
            .replace(/, Netherlands$/, '')
        }))
        .slice(0, 5);

      
      setSuggestions(cleanedResults);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSuggestions(true);

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout
    debounceRef.current = setTimeout(() => {
      searchLocations(query);
    }, 300);
  };

  // Handle location selection
  const handleLocationSelect = (suggestion: NominatimResult) => {
    const newLocation: LocationData = {
      name: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
      radius: 10 // Default radius of 10km
    };

    // Check if location already exists
    const exists = value.some(loc => 
      Math.abs(loc.lat - newLocation.lat) < 0.01 && 
      Math.abs(loc.lng - newLocation.lng) < 0.01
    );

    if (!exists) {
      onChange([...value, newLocation]);
    }

    // Clear search
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle location removal
  const handleLocationRemove = (index: number) => {
    const newLocations = value.filter((_, i) => i !== index);
    onChange(newLocations);
  };

  // Handle radius change
  const handleRadiusChange = (index: number, newRadius: number[]) => {
    const newLocations = value.map((loc, i) => 
      i === index ? { ...loc, radius: newRadius[0] } : loc
    );
    onChange(newLocations);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className={cn(
              "pl-10 pr-10",
              error && "border-red-500"
            )}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
          )}
          {!isLoading && searchQuery && (
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          )}
        </div>



        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                onClick={() => handleLocationSelect(suggestion)}
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm">{suggestion.display_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {showSuggestions && !isLoading && searchQuery.length >= 2 && suggestions.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500 text-sm">
            Geen steden gevonden voor "{searchQuery}"
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 mt-1">
          {getErrorMessage(error)}
        </p>
      )}

      {/* Selected Locations */}
      {value.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Gewenste woonplaats:</Label>
          <div className="space-y-2">
            {value.map((location, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-2 flex-1">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">{location.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {location.radius}km straal
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingRadius(editingRadius === index ? null : index)}
                    className="text-xs"
                  >
                    Straal
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLocationRemove(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Radius Editor */}
          {editingRadius !== null && value[editingRadius] && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label className="text-sm font-medium mb-2 block">
                Zoekstraal voor {value[editingRadius].name}: {value[editingRadius].radius}km
              </Label>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">1km</span>
                <Slider
                  value={[value[editingRadius].radius]}
                  onValueChange={(newRadius) => handleRadiusChange(editingRadius, newRadius)}
                  min={1}
                  max={50}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">50km</span>
              </div>
              <div className="mt-2 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingRadius(null)}
                >
                  Klaar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      <p className="text-sm text-gray-500">
        Zoek en selecteer de steden waar je wilt wonen. Je kunt de zoekstraal per stad aanpassen.
      </p>
    </div>
  );
};

export default LocationSelector;