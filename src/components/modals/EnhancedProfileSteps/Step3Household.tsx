import React from "react";
import { Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  calculateHouseholdSize: () => number;
}

const Step3Household: React.FC<Props> = ({ formData, handleInputChange, calculateHouseholdSize }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-4">
      <Users className="h-5 w-5 text-blue-600" />
      <h3 className="text-lg font-semibold">Huishoudsamenstelling</h3>
    </div>
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="has_partner" checked={formData.has_partner} onCheckedChange={checked => handleInputChange("has_partner", checked)} />
        <Label htmlFor="has_partner">Ik heb een partner</Label>
      </div>
      {formData.has_partner && (
        <div className="space-y-4 pl-6 border-l-2 border-blue-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partner_name">Naam partner</Label>
              <Input id="partner_name" value={formData.partner_name} onChange={e => handleInputChange("partner_name", e.target.value)} placeholder="Naam van je partner" />
            </div>
            <div>
              <Label htmlFor="partner_profession">Beroep partner</Label>
              <Input id="partner_profession" value={formData.partner_profession} onChange={e => handleInputChange("partner_profession", e.target.value)} placeholder="Beroep van je partner" />
            </div>
          </div>
          <div>
            <Label htmlFor="partner_monthly_income">Bruto maandinkomen partner (€)</Label>
            <Input id="partner_monthly_income" type="number" value={formData.partner_monthly_income || ""} onChange={e => handleInputChange("partner_monthly_income", Number(e.target.value))} placeholder="2500" />
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox id="has_children" checked={formData.has_children} onCheckedChange={checked => handleInputChange("has_children", checked)} />
        <Label htmlFor="has_children">Ik heb kinderen</Label>
      </div>

      {formData.has_children && (
        <div className="pl-6 border-l-2 border-blue-200">
          <Label htmlFor="number_of_children">Aantal kinderen</Label>
          <Input id="number_of_children" type="number" value={formData.number_of_children || ""} onChange={e => handleInputChange("number_of_children", Number(e.target.value))} placeholder="2" min="1" />
        </div>
      )}
      <div className="bg-blue-50 p-3 rounded-lg">
        <Label className="text-sm font-medium text-blue-800">
          Totaal aantal personen in huishouden: {calculateHouseholdSize()}
        </Label>
        <p className="text-xs text-blue-600 mt-1">
          Dit wordt automatisch berekend op basis van je gezinssamenstelling
        </p>
      </div>
    </div>
  </div>
);

export default Step3Household;
