import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileFormData } from '../profileSchema';
import { Home, MapPin, Bed, Euro } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

export const Step3_Housing = () => {
  const { control, register, formState: { errors }, watch } = useFormContext<ProfileFormData>();
  
  const minBudget = watch('minBudget');
  const maxBudget = watch('maxBudget');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Home className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold">Woonvoorkeuren</h2>
        </div>
        <p className="text-gray-600">Vertel over je ideale woning</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preferred_city">Voorkeursstad *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="preferred_city"
              {...register('preferred_city')}
              placeholder="Amsterdam, Rotterdam, Den Haag..."
              className={`pl-10 ${errors.preferred_city ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.preferred_city && (
            <p className="text-sm text-red-600">{errors.preferred_city.message}</p>
          )}
        </div>

        <FormField
          control={control}
          name="preferred_property_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Woningtype *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer woningtype" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="appartement">Appartement</SelectItem>
                  <SelectItem value="huis">Huis</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preferred_bedrooms">Aantal slaapkamers *</Label>
          <div className="relative">
            <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="preferred_bedrooms"
              type="number"
              {...register('preferred_bedrooms', {
                setValueAs: (value) => value ? Number(value) : 1
              })}
              placeholder="1"
              className={`pl-10 ${errors.preferred_bedrooms ? 'border-red-500' : ''}`}
              min="1"
              max="10"
            />
          </div>
          {errors.preferred_bedrooms && (
            <p className="text-sm text-red-600">{errors.preferred_bedrooms.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minBudget">Minimum budget *</Label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="minBudget"
              type="number"
              {...register('minBudget', { 
                setValueAs: (value) => value ? Number(value) : 0 
              })}
              placeholder="500"
              className={`pl-10 ${errors.minBudget ? 'border-red-500' : ''}`}
              min="0"
              step="50"
            />
          </div>
          {errors.minBudget && (
            <p className="text-sm text-red-600">{errors.minBudget.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxBudget">Maximum budget *</Label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="maxBudget"
              type="number"
              {...register('maxBudget', { 
                setValueAs: (value) => value ? Number(value) : 0 
              })}
              placeholder="1000"
              className={`pl-10 ${errors.maxBudget ? 'border-red-500' : ''}`}
              min="0"
              step="50"
            />
          </div>
          {errors.maxBudget && (
            <p className="text-sm text-red-600">{errors.maxBudget.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Budget range</Label>
        <div className="text-sm text-gray-600 mb-2">
          €{minBudget} - €{maxBudget} per maand
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-medium text-green-900 mb-2">💡 Tip</h3>
        <p className="text-sm text-green-800">
          Zorg ervoor dat je budget realistisch is. Als vuistregel geldt: 
          huur mag maximaal 30-40% van je netto inkomen zijn.
        </p>
      </div>
    </div>
  );};