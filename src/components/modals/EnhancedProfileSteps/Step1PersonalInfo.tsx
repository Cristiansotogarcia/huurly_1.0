
import React from "react";
import { User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EnhancedDatePicker from "../EnhancedDatePicker";

interface Props {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  handleDateSelect: (field: string, date: Date | undefined) => void;
}

const Step1PersonalInfo: React.FC<Props> = ({ formData, handleInputChange, handleDateSelect }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-4">
      <User className="h-5 w-5 text-blue-600" />
      <h3 className="text-lg font-semibold">Persoonlijke Gegevens</h3>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="first_name">Voornaam *</Label>
        <Input id="first_name" value={formData.first_name} onChange={e => handleInputChange("first_name", e.target.value)} placeholder="Je voornaam" />
      </div>
      <div>
        <Label htmlFor="last_name">Achternaam *</Label>
        <Input id="last_name" value={formData.last_name} onChange={e => handleInputChange("last_name", e.target.value)} placeholder="Je achternaam" />
      </div>
    </div>
    <div>
      <Label>Geboortedatum *</Label>
      <EnhancedDatePicker
        selected={formData.date_of_birth}
        onSelect={date => handleDateSelect("date_of_birth", date)}
        placeholder="Selecteer geboortedatum"
        disabled={date => date > new Date() || date < new Date("1900-01-01")}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="phone">Telefoonnummer *</Label>
        <Input id="phone" value={formData.phone} onChange={e => handleInputChange("phone", e.target.value)} placeholder="+31 6 12345678" />
      </div>
      <div>
        <Label htmlFor="sex">Geslacht</Label>
        <Select value={formData.sex} onValueChange={value => handleInputChange("sex", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecteer geslacht" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="man">Man</SelectItem>
            <SelectItem value="vrouw">Vrouw</SelectItem>
            <SelectItem value="anders">Anders</SelectItem>
            <SelectItem value="geen_antwoord">Geen antwoord</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="nationality">Nationaliteit</Label>
        <Input id="nationality" value={formData.nationality} onChange={e => handleInputChange("nationality", e.target.value)} placeholder="Nederlandse" />
      </div>
      <div>
        <Label htmlFor="marital_status">Burgerlijke staat</Label>
        <Select value={formData.marital_status} onValueChange={value => handleInputChange("marital_status", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecteer status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Alleenstaand</SelectItem>
            <SelectItem value="relationship">Relatie</SelectItem>
            <SelectItem value="married">Getrouwd</SelectItem>
            <SelectItem value="divorced">Gescheiden</SelectItem>
            <SelectItem value="widowed">Weduwe/Weduwnaar</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);
export default Step1PersonalInfo;
