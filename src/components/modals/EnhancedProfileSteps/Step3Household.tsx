
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Baby, Euro } from 'lucide-react';

interface Step3HouseholdProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  calculateHouseholdSize: () => number;
}

export default function Step3Household({ formData, handleInputChange, calculateHouseholdSize }: Step3HouseholdProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold">Huishouden</h2>
        </div>
        <p className="text-gray-600">Informatie over je huishoudsituatie</p>
      </div>

      {/* Partner Information */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="has_partner"
            checked={formData.has_partner}
            onCheckedChange={(checked) => handleInputChange('has_partner', checked)}
          />
          <Label htmlFor="has_partner">Ik heb een partner</Label>
        </div>

        {formData.has_partner && (
          <div className="ml-6 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partner_name">Partner naam</Label>
                <Input
                  id="partner_name"
                  value={formData.partner_name}
                  onChange={(e) => handleInputChange('partner_name', e.target.value)}
                  placeholder="Naam van je partner"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner_profession">Partner beroep</Label>
                <Input
                  id="partner_profession"
                  value={formData.partner_profession}
                  onChange={(e) => handleInputChange('partner_profession', e.target.value)}
                  placeholder="Beroep van je partner"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partner_employment_status">Partner werkstatus</Label>
                <Select value={formData.partner_employment_status} onValueChange={(value) => handleInputChange('partner_employment_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vast_contract">Vast contract</SelectItem>
                    <SelectItem value="tijdelijk_contract">Tijdelijk contract</SelectItem>
                    <SelectItem value="zzp">ZZP</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="werkloos">Werkloos</SelectItem>
                    <SelectItem value="pensioen">Pensioen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner_monthly_income">Partner maandinkomen</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="partner_monthly_income"
                    type="number"
                    value={formData.partner_monthly_income}
                    onChange={(e) => handleInputChange('partner_monthly_income', parseInt(e.target.value) || 0)}
                    placeholder="3500"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Children Information */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="has_children"
            checked={formData.has_children}
            onCheckedChange={(checked) => handleInputChange('has_children', checked)}
          />
          <Label htmlFor="has_children">Ik heb kinderen</Label>
        </div>

        {formData.has_children && (
          <div className="ml-6 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="number_of_children">Aantal kinderen</Label>
              <div className="relative">
                <Baby className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="number_of_children"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.number_of_children}
                  onChange={(e) => handleInputChange('number_of_children', parseInt(e.target.value) || 0)}
                  placeholder="2"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Household Summary */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Huishouden overzicht</h3>
        <p className="text-blue-700">
          Totaal aantal personen in huishouden: <span className="font-semibold">{calculateHouseholdSize()}</span>
        </p>
      </div>
    </div>
  );
}
