import React from "react";
import { Home } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

const Step4Housing: React.FC<Props> = ({ formData, handleInputChange }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-4">
      <Home className="h-5 w-5 text-blue-600" />
      <h3 className="text-lg font-semibold">Woonvoorkeuren</h3>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="preferred_city">Gewenste stad/plaats *</Label>
        <Input
          id="preferred_city"
          value={formData.preferred_city}
          onChange={(e) => handleInputChange('preferred_city', e.target.value)}
          placeholder="Amsterdam"
        />
      </div>
      <div>
        <Label htmlFor="preferred_property_type">Type woning</Label>
        <Select value={formData.preferred_property_type} onValueChange={(value) => handleInputChange('preferred_property_type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecteer type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="appartement">Appartement</SelectItem>
            <SelectItem value="studio">Studio</SelectItem>
            <SelectItem value="eengezinswoning">Eengezinswoning</SelectItem>
            <SelectItem value="kamer">Kamer</SelectItem>
            <SelectItem value="penthouse">Penthouse</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label htmlFor="preferred_bedrooms">Aantal slaapkamers</Label>
        <Input
          id="preferred_bedrooms"
          type="number"
          value={formData.preferred_bedrooms || ''}
          onChange={(e) => handleInputChange('preferred_bedrooms', Number(e.target.value))}
          min="1"
          max="10"
        />
      </div>
      <div>
        <Label htmlFor="min_budget">Min. budget (€/maand)</Label>
        <Input
          id="min_budget"
          type="number"
          value={formData.min_budget || ''}
          onChange={(e) => handleInputChange('min_budget', Number(e.target.value))}
          placeholder="800"
        />
      </div>
      <div>
        <Label htmlFor="max_budget">Max. budget (€/maand) *</Label>
        <Input
          id="max_budget"
          type="number"
          value={formData.max_budget || ''}
          onChange={(e) => handleInputChange('max_budget', Number(e.target.value))}
          placeholder="1500"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="furnished_preference">Meubilering voorkeur</Label>
        <Select value={formData.furnished_preference} onValueChange={(value) => handleInputChange('furnished_preference', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecteer voorkeur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gemeubileerd">Gemeubileerd</SelectItem>
            <SelectItem value="ongemeubileerd">Ongemeubileerd</SelectItem>
            <SelectItem value="geen_voorkeur">Geen voorkeur</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="lease_duration_preference">Gewenste huurperiode</Label>
        <Select value={formData.lease_duration_preference} onValueChange={(value) => handleInputChange('lease_duration_preference', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecteer periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6_maanden">6 maanden</SelectItem>
            <SelectItem value="1_jaar">1 jaar</SelectItem>
            <SelectItem value="2_jaar">2 jaar</SelectItem>
            <SelectItem value="langer">Langer dan 2 jaar</SelectItem>
            <SelectItem value="flexibel">Flexibel</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="parking_required"
          checked={formData.parking_required}
          onCheckedChange={(checked) => handleInputChange('parking_required', checked)}
        />
        <Label htmlFor="parking_required">Parkeerplaats gewenst</Label>
      </div>
    </div>

    <div>
      <Label htmlFor="storage_needs">Bergruimte/opslag wensen</Label>
      <Textarea
        id="storage_needs"
        value={formData.storage_needs}
        onChange={(e) => handleInputChange('storage_needs', e.target.value)}
        placeholder="Beschrijf eventuele bergruimte behoeften..."
        rows={2}
      />
    </div>
  </div>
);

export default Step4Housing;
