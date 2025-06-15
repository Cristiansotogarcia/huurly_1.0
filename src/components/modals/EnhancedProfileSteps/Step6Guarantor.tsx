import React from "react";
import { Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

const Step6Guarantor: React.FC<Props> = ({ formData, handleInputChange }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-4">
      <Shield className="h-5 w-5 text-blue-600" />
      <h3 className="text-lg font-semibold">Borg & Garantie</h3>
    </div>
    
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="guarantor_available"
          checked={formData.guarantor_available}
          onCheckedChange={(checked) => handleInputChange('guarantor_available', checked)}
        />
        <Label htmlFor="guarantor_available">Ik heb een borg/garantiesteller beschikbaar</Label>
      </div>

      {formData.guarantor_available && (
        <div className="space-y-4 pl-6 border-l-2 border-blue-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guarantor_name">Naam borg/garantiesteller</Label>
              <Input
                id="guarantor_name"
                value={formData.guarantor_name}
                onChange={(e) => handleInputChange('guarantor_name', e.target.value)}
                placeholder="Volledige naam"
              />
            </div>
            <div>
              <Label htmlFor="guarantor_phone">Telefoonnummer borg</Label>
              <Input
                id="guarantor_phone"
                value={formData.guarantor_phone}
                onChange={(e) => handleInputChange('guarantor_phone', e.target.value)}
                placeholder="+31 6 12345678"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guarantor_income">Maandinkomen borg (€)</Label>
              <Input
                id="guarantor_income"
                type="number"
                value={formData.guarantor_income || ''}
                onChange={(e) => handleInputChange('guarantor_income', Number(e.target.value))}
                placeholder="4000"
              />
            </div>
            <div>
              <Label htmlFor="guarantor_relationship">Relatie tot borg</Label>
              <Select value={formData.guarantor_relationship} onValueChange={(value) => handleInputChange('guarantor_relationship', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer relatie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ouder">Ouder</SelectItem>
                  <SelectItem value="familie">Familie</SelectItem>
                  <SelectItem value="vriend">Vriend/Vriendin</SelectItem>
                  <SelectItem value="werkgever">Werkgever</SelectItem>
                  <SelectItem value="anders">Anders</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default Step6Guarantor;
