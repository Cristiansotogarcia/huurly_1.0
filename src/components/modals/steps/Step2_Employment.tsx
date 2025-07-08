import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileFormData } from '../profileSchema';
import { Briefcase, Building, Euro, FileText } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

export const Step2_Employment = () => {
  const { control, register, formState: { errors } } = useFormContext<ProfileFormData>();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold">Werk & Inkomen</h2>
        </div>
        <p className="text-gray-600">Vertel over je werkervaring en inkomen</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="profession">Beroep *</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="profession"
              {...register('profession')}
              placeholder="Bijvoorbeeld: Software Developer"
              className={`pl-10 ${errors.profession ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.profession && (
            <p className="text-sm text-red-600">{errors.profession.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="employer">Werkgever *</Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="employer"
              {...register('employer')}
              placeholder="Naam van je werkgever"
              className={`pl-10 ${errors.employer ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.employer && (
            <p className="text-sm text-red-600">{errors.employer.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="employment_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dienstverband *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer dienstverband" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="full-time">Voltijd</SelectItem>
                  <SelectItem value="part-time">Deeltijd</SelectItem>
                  <SelectItem value="zzp">ZZP</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="werkloos">Werkloos</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="monthly_income">Maandelijks netto inkomen *</Label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="monthly_income"
              type="number"
              {...register('monthly_income', { 
                setValueAs: (value) => value ? Number(value) : 0 
              })}
              placeholder="2500"
              className={`pl-10 ${errors.monthly_income ? 'border-red-500' : ''}`}
              min="0"
              step="100"
            />
          </div>
          {errors.monthly_income && (
            <p className="text-sm text-red-600">{errors.monthly_income.message}</p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">💡 Tip</h3>
        <p className="text-sm text-blue-800">
          Een hoger inkomen verhoogt je kansen bij verhuurders. Zorg ervoor dat je 
          documenten zoals loonstroken en arbeidscontract up-to-date zijn.
        </p>
      </div>
    </div>
  );
};