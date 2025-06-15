import React from "react";
import { Briefcase } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

const Step2Employment: React.FC<Props> = ({ formData, handleInputChange }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-4">
      <Briefcase className="h-5 w-5 text-blue-600" />
      <h3 className="text-lg font-semibold">Werk & Inkomen</h3>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="profession">Beroep *</Label>
        <Input id="profession" value={formData.profession} onChange={e => handleInputChange("profession", e.target.value)} placeholder="Je beroep" />
      </div>
      <div>
        <Label htmlFor="employer">Werkgever</Label>
        <Input id="employer" value={formData.employer} onChange={e => handleInputChange("employer", e.target.value)} placeholder="Naam werkgever" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="employment_status">Arbeidscontract</Label>
        <Select value={formData.employment_status} onValueChange={value => handleInputChange("employment_status", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Type contract" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vast_contract">Vast contract</SelectItem>
            <SelectItem value="tijdelijk_contract">Tijdelijk contract</SelectItem>
            <SelectItem value="zzp">ZZP/Freelancer</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="werkloos">Werkloos</SelectItem>
            <SelectItem value="pensioen">Pensioen</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="monthly_income">Bruto maandinkomen (€) *</Label>
        <Input id="monthly_income" type="number" value={formData.monthly_income || ""} onChange={e => handleInputChange("monthly_income", Number(e.target.value))} placeholder="3000" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox id="work_from_home" checked={formData.work_from_home} onCheckedChange={checked => handleInputChange("work_from_home", checked)} />
        <Label htmlFor="work_from_home">Ik werk (deels) thuis</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="income_proof_available" checked={formData.income_proof_available} onCheckedChange={checked => handleInputChange("income_proof_available", checked)} />
        <Label htmlFor="income_proof_available">Ik kan inkomensbewijzen overleggen</Label>
      </div>
    </div>
  </div>
);

export default Step2Employment;
