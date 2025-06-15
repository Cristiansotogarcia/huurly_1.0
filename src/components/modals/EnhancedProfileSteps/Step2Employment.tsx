
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Briefcase, Euro } from 'lucide-react';

interface Step2EmploymentProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export default function Step2Employment({ formData, handleInputChange }: Step2EmploymentProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold">Werk & Inkomen</h2>
        </div>
        <p className="text-gray-600">Vertel ons over je werk en financiële situatie</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="profession">Beroep *</Label>
          <Input
            id="profession"
            value={formData.profession}
            onChange={(e) => handleInputChange('profession', e.target.value)}
            placeholder="Software Developer"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employer">Werkgever</Label>
          <Input
            id="employer"
            value={formData.employer}
            onChange={(e) => handleInputChange('employer', e.target.value)}
            placeholder="Bedrijfsnaam"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="employment_status">Status</Label>
          <Select value={formData.employment_status} onValueChange={(value) => handleInputChange('employment_status', value)}>
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
          <Label htmlFor="work_contract_type">Contract type</Label>
          <Input
            id="work_contract_type"
            value={formData.work_contract_type}
            onChange={(e) => handleInputChange('work_contract_type', e.target.value)}
            placeholder="Fulltime, parttime, etc."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="monthly_income">Maandinkomen (bruto) *</Label>
        <div className="relative">
          <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="monthly_income"
            type="number"
            value={formData.monthly_income}
            onChange={(e) => handleInputChange('monthly_income', parseInt(e.target.value) || 0)}
            placeholder="4500"
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="work_from_home"
          checked={formData.work_from_home}
          onCheckedChange={(checked) => handleInputChange('work_from_home', checked)}
        />
        <Label htmlFor="work_from_home">Ik werk (deels) vanuit huis</Label>
      </div>
    </div>
  );
}
