import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileFormData } from '../profileSchema';
import { Briefcase, Building, Euro, FileText, Users, Plus } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

export const Step2_Employment = () => {
  const { control, register, formState: { errors }, watch } = useFormContext<ProfileFormData>();
  
  const maritalStatus = watch('marital_status');
  const showPartnerIncome = maritalStatus === 'getrouwd' || maritalStatus === 'samenwonend';

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
        <FormField
          control={control}
          name="inkomensbewijs_beschikbaar"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Inkomensbewijs beschikbaar
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* Partner Income Section */}
      {showPartnerIncome && (
        <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-600" />
            <h3 className="font-medium text-purple-900">Partner Inkomen</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="partner_monthly_income">Maandelijks netto inkomen partner</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="partner_monthly_income"
                type="number"
                {...register('partner_monthly_income', { 
                  setValueAs: (value) => value ? Number(value) : 0 
                })}
                placeholder="2500"
                className={`pl-10 ${errors.partner_monthly_income ? 'border-red-500' : ''}`}
                min="0"
                step="100"
              />
            </div>
            {errors.partner_monthly_income && (
              <p className="text-sm text-red-600">{errors.partner_monthly_income.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Extra Income Section */}
      <div className="space-y-4 p-4 bg-green-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Plus className="w-4 h-4 text-green-600" />
          <h3 className="font-medium text-green-900">Extra Inkomen (Optioneel)</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="extra_income">Maandelijks extra inkomen</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="extra_income"
                type="number"
                {...register('extra_income', { 
                  setValueAs: (value) => value ? Number(value) : 0 
                })}
                placeholder="500"
                className={`pl-10 ${errors.extra_income ? 'border-red-500' : ''}`}
                min="0"
                step="50"
              />
            </div>
            {errors.extra_income && (
              <p className="text-sm text-red-600">{errors.extra_income.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="extra_income_description">Type extra inkomen</Label>
            <Textarea
              id="extra_income_description"
              {...register('extra_income_description')}
              placeholder="Bijv. freelance werk, uitkering, huur van kamer, etc."
              className={errors.extra_income_description ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.extra_income_description && (
              <p className="text-sm text-red-600">{errors.extra_income_description.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 bg-indigo-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-indigo-600" />
          <h3 className="font-medium text-indigo-900">Borgsteller Informatie</h3>
        </div>
        <FormField
          control={control}
          name="borgsteller_beschikbaar"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Borgsteller beschikbaar
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        {watch('borgsteller_beschikbaar') && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="borgsteller_naam">Naam borgsteller</Label>
              <Input
                id="borgsteller_naam"
                {...register('borgsteller_naam')}
                placeholder="Naam van borgsteller"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="borgsteller_relatie">Relatie tot borgsteller</Label>
              <Input
                id="borgsteller_relatie"
                {...register('borgsteller_relatie')}
                placeholder="Bijv. ouder, familielid"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="borgsteller_telefoon">Telefoon borgsteller</Label>
              <Input
                id="borgsteller_telefoon"
                {...register('borgsteller_telefoon')}
                placeholder="Telefoonnummer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="borgsteller_inkomen">Inkomen borgsteller</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="borgsteller_inkomen"
                  type="number"
                  {...register('borgsteller_inkomen', { setValueAs: (v) => v ? Number(v) : 0 })}
                  placeholder="3000"
                  className="pl-10"
                  min="0"
                  step="100"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Extra Income Section */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">💡 Tip</h3>
        <p className="text-sm text-blue-800">
          Een juiste inkomen verhoogt je kansen bij verhuurders. Zorg ervoor dat je 
          documenten zoals loonstroken en arbeidscontract up-to-date en geupload zijn.
        </p>
      </div>
    </div>
  );
};