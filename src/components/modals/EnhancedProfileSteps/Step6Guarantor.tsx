
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Euro, Phone, User } from 'lucide-react';

interface Step6GuarantorProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export default function Step6Guarantor({ formData, handleInputChange }: Step6GuarantorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold">Borg & Garanties</h2>
        </div>
        <p className="text-gray-600">Informatie over financiële garanties</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="guarantor_available"
            checked={formData.guarantor_available}
            onCheckedChange={(checked) => handleInputChange('guarantor_available', checked)}
          />
          <Label htmlFor="guarantor_available">Ik heb een borg/garantsteller beschikbaar</Label>
        </div>

        {formData.guarantor_available && (
          <div className="ml-6 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guarantor_name">Naam garantsteller</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="guarantor_name"
                    value={formData.guarantor_name}
                    onChange={(e) => handleInputChange('guarantor_name', e.target.value)}
                    placeholder="Volledige naam"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guarantor_phone">Telefoon garantsteller</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="guarantor_phone"
                    value={formData.guarantor_phone}
                    onChange={(e) => handleInputChange('guarantor_phone', e.target.value)}
                    placeholder="+31 6 12345678"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guarantor_income">Inkomen garantsteller</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="guarantor_income"
                    type="number"
                    value={formData.guarantor_income}
                    onChange={(e) => handleInputChange('guarantor_income', parseInt(e.target.value) || 0)}
                    placeholder="5000"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guarantor_relationship">Relatie tot garantsteller</Label>
                <Select value={formData.guarantor_relationship} onValueChange={(value) => handleInputChange('guarantor_relationship', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer relatie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ouder">Ouder</SelectItem>
                    <SelectItem value="familie">Familie</SelectItem>
                    <SelectItem value="vriend">Vriend</SelectItem>
                    <SelectItem value="werkgever">Werkgever</SelectItem>
                    <SelectItem value="anders">Anders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="income_proof_available"
            checked={formData.income_proof_available}
            onCheckedChange={(checked) => handleInputChange('income_proof_available', checked)}
          />
          <Label htmlFor="income_proof_available">Ik kan inkomstenbewijs overleggen</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="emergency_contact_name">Noodcontact naam</Label>
        <Input
          id="emergency_contact_name"
          value={formData.emergency_contact_name}
          onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
          placeholder="Naam van noodcontact"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emergency_contact_phone">Noodcontact telefoon</Label>
          <Input
            id="emergency_contact_phone"
            value={formData.emergency_contact_phone}
            onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
            placeholder="+31 6 12345678"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergency_contact_relationship">Relatie noodcontact</Label>
          <Input
            id="emergency_contact_relationship"
            value={formData.emergency_contact_relationship}
            onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
            placeholder="Ouder, partner, vriend, etc."
          />
        </div>
      </div>
    </div>
  );
}
