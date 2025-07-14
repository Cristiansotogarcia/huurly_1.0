
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Home, Euro, MapPin, Car } from 'lucide-react';

interface Step4HousingProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export default function Step4Housing({ formData, handleInputChange }: Step4HousingProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Home className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-xl font-semibold">Woonvoorkeuren</h2>
        </div>
        <p className="text-gray-600">Vertel ons waar en hoe je wilt wonen</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preferred_city">Gewenste steden *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="preferred_city"
              value={Array.isArray(formData.preferred_city) ? formData.preferred_city.join(', ') : formData.preferred_city || ''}
              onChange={(e) => {
                const cities = e.target.value.split(',').map(city => city.trim()).filter(city => city.length > 0);
                handleInputChange('preferred_city', cities);
              }}
              placeholder="Amsterdam, Utrecht, Den Haag"
              className="pl-10"
              required
            />
          </div>
          <p className="text-sm text-gray-500">Meerdere steden scheiden met komma's</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferred_property_type">Type woning</Label>
          <Select value={formData.preferred_property_type} onValueChange={(value) => handleInputChange('preferred_property_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecteer type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="appartement">Appartement</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="huis">Huis</SelectItem>
              <SelectItem value="kamer">Kamer</SelectItem>
              <SelectItem value="penthouse">Penthouse</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min_kamers">Minimum aantal kamers</Label>
          <Input
            id="min_kamers"
            type="number"
            min="1"
            max="10"
            value={formData.min_kamers || ''}
            onChange={(e) => handleInputChange('min_kamers', parseInt(e.target.value) || null)}
            placeholder="2"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_kamers">Maximum aantal kamers</Label>
          <Input
            id="max_kamers"
            type="number"
            min="1"
            max="10"
            value={formData.max_kamers || ''}
            onChange={(e) => handleInputChange('max_kamers', parseInt(e.target.value) || null)}
            placeholder="4"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min_budget">Minimum budget</Label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="min_budget"
              type="number"
              value={formData.min_budget}
              onChange={(e) => handleInputChange('min_budget', parseInt(e.target.value) || 0)}
              placeholder="1200"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_budget">Maximum budget *</Label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="max_budget"
              type="number"
              value={formData.max_budget}
              onChange={(e) => handleInputChange('max_budget', parseInt(e.target.value) || 0)}
              placeholder="1800"
              className="pl-10"
              required
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vroegste_verhuisdatum">Vroegste verhuisdatum</Label>
          <Input
            id="vroegste_verhuisdatum"
            type="date"
            value={formData.vroegste_verhuisdatum || ''}
            onChange={(e) => handleInputChange('vroegste_verhuisdatum', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="voorkeur_verhuisdatum">Gewenste verhuisdatum</Label>
          <Input
            id="voorkeur_verhuisdatum"
            type="date"
            value={formData.voorkeur_verhuisdatum || ''}
            onChange={(e) => handleInputChange('voorkeur_verhuisdatum', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="beschikbaarheid_flexibel"
            checked={formData.beschikbaarheid_flexibel}
            onCheckedChange={(checked) => handleInputChange('beschikbaarheid_flexibel', checked)}
          />
          <Label htmlFor="beschikbaarheid_flexibel">Flexibele verhuisdatum</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="parking_required"
            checked={formData.parking_required}
            onCheckedChange={(checked) => handleInputChange('parking_required', checked)}
          />
          <Label htmlFor="parking_required">Parkeerplaats gewenst</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="storage_needs">Opslag wensen</Label>
        <Textarea
          id="storage_needs"
          value={formData.storage_needs}
          onChange={(e) => handleInputChange('storage_needs', e.target.value)}
          placeholder="Beschrijf je opslag behoeften (bijv. kelder, zolder, berging)"
          className="min-h-[80px]"
        />
      </div>
    </div>
  );
}
