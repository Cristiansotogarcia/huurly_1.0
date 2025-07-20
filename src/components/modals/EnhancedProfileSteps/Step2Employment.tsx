
import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, Euro } from 'lucide-react';
import { ProfileFormData } from '../profileSchema';

export default function Step2Employment() {
  const { register, control, watch, formState: { errors } } = useFormContext<ProfileFormData>();
  const extraIncome = watch('extra_income');
  
  // Convert to number and check if it's a valid positive number
  const extraIncomeValue = Number(extraIncome);
  const showExtraIncomeDescription = !isNaN(extraIncomeValue) && extraIncomeValue > 0;
  
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
            {...register('profession')}
            placeholder="Software Developer"
            required
          />
          {errors.profession && <p className="text-red-500 text-xs">{errors.profession.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="employer">Werkgever</Label>
          <Input
            id="employer"
            {...register('employer')}
            placeholder="Bedrijfsnaam"
          />
          {errors.employer && <p className="text-red-500 text-xs">{errors.employer.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="employment_status">Status</Label>
        <Controller
          name="employment_status"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Vast contract (full-time)</SelectItem>
                <SelectItem value="part-time">Tijdelijk contract (part-time)</SelectItem>
                <SelectItem value="zzp">ZZP</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="werkloos">Werkloos</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="monthly_income">Maandinkomen (bruto) *</Label>
        <div className="relative">
          <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="monthly_income"
            type="number"
            {...register('monthly_income', { valueAsNumber: true })}
            placeholder="4500"
            className="pl-10"
            required
          />
        </div>
        {errors.monthly_income && <p className="text-red-500 text-xs">{errors.monthly_income.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="extra_income">Extra inkomen (optioneel)</Label>
        <div className="relative">
          <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="extra_income"
            type="number"
            {...register('extra_income', { 
              valueAsNumber: true,
              setValueAs: (value) => value === '' ? 0 : Number(value)
            })}
            placeholder="1000"
            className="pl-10"
          />
        </div>
        {errors.extra_income && <p className="text-red-500 text-xs">{errors.extra_income.message}</p>}
      </div>

      {showExtraIncomeDescription && (
        <div className="space-y-2">
          <Label htmlFor="extra_income_description">Beschrijving extra inkomen</Label>
          <Textarea
            id="extra_income_description"
            {...register('extra_income_description')}
            placeholder="Beschrijf hier je extra inkomen, bijvoorbeeld: freelance werk, uitkering, investeringen, etc."
            rows={3}
          />
          {errors.extra_income_description && <p className="text-red-500 text-xs">{errors.extra_income_description.message}</p>}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Controller
          name="work_from_home"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="work_from_home"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="work_from_home">Ik werk (deels) vanuit huis</Label>
      </div>
    </div>
  );
}
