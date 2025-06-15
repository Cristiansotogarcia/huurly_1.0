import React from "react";
import { FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

const Step7References: React.FC<Props> = ({ formData, handleInputChange }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-4">
      <FileText className="h-5 w-5 text-blue-600" />
      <h3 className="text-lg font-semibold">Referenties & Contact</h3>
    </div>
    
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="emergency_contact_name">Noodcontact naam</Label>
          <Input
            id="emergency_contact_name"
            value={formData.emergency_contact_name}
            onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
            placeholder="Volledige naam"
          />
        </div>
        <div>
          <Label htmlFor="emergency_contact_phone">Noodcontact telefoon</Label>
          <Input
            id="emergency_contact_phone"
            value={formData.emergency_contact_phone}
            onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
            placeholder="+31 6 12345678"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="emergency_contact_relationship">Relatie tot noodcontact</Label>
        <Input
          id="emergency_contact_relationship"
          value={formData.emergency_contact_relationship}
          onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
          placeholder="Ouder, partner, vriend(in), etc."
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="references_available"
            checked={formData.references_available}
            onCheckedChange={(checked) => handleInputChange('references_available', checked)}
          />
          <Label htmlFor="references_available">Ik kan huurderreferenties overleggen</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="rental_history_years">Jaren huurervaring</Label>
        <Input
          id="rental_history_years"
          type="number"
          value={formData.rental_history_years || ''}
          onChange={(e) => handleInputChange('rental_history_years', Number(e.target.value))}
          placeholder="2"
          min="0"
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_pets"
              checked={formData.has_pets}
              onCheckedChange={(checked) => handleInputChange('has_pets', checked)}
            />
            <Label htmlFor="has_pets">Ik heb huisdieren</Label>
          </div>
          
          {formData.has_pets && (
            <div className="pl-6 border-l-2 border-blue-200">
              <Label htmlFor="pet_details">Details over huisdieren</Label>
              <Textarea
                id="pet_details"
                value={formData.pet_details}
                onChange={(e) => handleInputChange('pet_details', e.target.value)}
                placeholder="Type, aantal, leeftijd, gedrag..."
                rows={2}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="smokes"
              checked={formData.smokes}
              onCheckedChange={(checked) => handleInputChange('smokes', checked)}
            />
            <Label htmlFor="smokes">Ik rook</Label>
          </div>
          
          {formData.smokes && (
            <div className="pl-6 border-l-2 border-blue-200">
              <Label htmlFor="smoking_details">Rookgewoonten</Label>
              <Textarea
                id="smoking_details"
                value={formData.smoking_details}
                onChange={(e) => handleInputChange('smoking_details', e.target.value)}
                placeholder="Alleen buiten, binnen toegestaan, etc."
                rows={2}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default Step7References;
