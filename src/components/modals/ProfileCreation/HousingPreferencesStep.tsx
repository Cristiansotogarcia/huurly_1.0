
import { Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StepProps } from './types';

export const HousingPreferencesStep = ({ profileData, updateField }: StepProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Home className="w-12 h-12 mx-auto mb-4 text-dutch-orange" />
        <h3 className="text-lg font-semibold">Woonvoorkeuren</h3>
        <p className="text-gray-600">Wat voor woning zoek je?</p>
      </div>
      
      <div>
        <Label htmlFor="city">Gewenste stad *</Label>
        <Select value={profileData.city} onValueChange={(value) => updateField('city', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Amsterdam">Amsterdam</SelectItem>
            <SelectItem value="Rotterdam">Rotterdam</SelectItem>
            <SelectItem value="Den Haag">Den Haag</SelectItem>
            <SelectItem value="Utrecht">Utrecht</SelectItem>
            <SelectItem value="Eindhoven">Eindhoven</SelectItem>
            <SelectItem value="Groningen">Groningen</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minBudget">Minimum budget * (€/maand)</Label>
          <Input
            id="minBudget"
            type="number"
            value={profileData.minBudget || ''}
            onChange={(e) => updateField('minBudget', parseInt(e.target.value) || 0)}
            placeholder="1000"
          />
        </div>
        <div>
          <Label htmlFor="maxBudget">Maximum budget * (€/maand)</Label>
          <Input
            id="maxBudget"
            type="number"
            value={profileData.maxBudget || ''}
            onChange={(e) => updateField('maxBudget', parseInt(e.target.value) || 0)}
            placeholder="2000"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="bedrooms">Aantal slaapkamers</Label>
        <Select value={profileData.bedrooms.toString()} onValueChange={(value) => updateField('bedrooms', parseInt(value))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 slaapkamer</SelectItem>
            <SelectItem value="2">2 slaapkamers</SelectItem>
            <SelectItem value="3">3 slaapkamers</SelectItem>
            <SelectItem value="4">4+ slaapkamers</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="propertyType">Type woning</Label>
        <Select value={profileData.propertyType} onValueChange={(value) => updateField('propertyType', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Appartement">Appartement</SelectItem>
            <SelectItem value="Studio">Studio</SelectItem>
            <SelectItem value="Huis">Huis</SelectItem>
            <SelectItem value="Kamer">Kamer</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
