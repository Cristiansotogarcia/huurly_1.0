import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileFormData } from '../profileSchema';
import { Home, MapPin, Bed, Euro, Calendar } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import LocationSelector from '@/components/ui/LocationSelector';

export const Step3_Housing = () => {
  const { control, register, formState: { errors }, watch } = useFormContext<ProfileFormData>();
  
  const minBudget = watch('min_budget');
  const maxBudget = watch('max_budget');

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
        <FormField
          control={control}
          name="preferred_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voorkeursstad *</FormLabel>
              <FormControl>
                <LocationSelector
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Zoek naar steden..."
                  error={errors.preferred_city?.message}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
        <div className="space-y-2">
          <Label htmlFor="min_kamers">Minimaal aantal kamers</Label>
          <Input
            id="min_kamers"
            type="number"
            {...register('min_kamers', { setValueAs: (v) => v ? Number(v) : 1 })}
            placeholder="1"
            min="1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_kamers">Maximaal aantal kamers</Label>
          <Input
            id="max_kamers"
            type="number"
            {...register('max_kamers', { setValueAs: (v) => v ? Number(v) : undefined })}
            placeholder="5"
            min="1"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min_budget">Minimum budget *</Label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="min_budget"
              type="number"
              {...register('min_budget', { 
                setValueAs: (value) => value ? Number(value) : 0 
              })}
              placeholder="500"
              className={`pl-10 ${errors.min_budget ? 'border-red-500' : ''}`}
              min="0"
              step="50"
            />
          </div>
          {errors.min_budget && (
            <p className="text-sm text-red-600">{errors.min_budget.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_budget">Maximum budget *</Label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="max_budget"
              type="number"
              {...register('max_budget', { 
                setValueAs: (value) => value ? Number(value) : 0 
              })}
              placeholder="1000"
              className={`pl-10 ${errors.max_budget ? 'border-red-500' : ''}`}
              min="0"
              step="50"
            />
          </div>
          {errors.max_budget && (
            <p className="text-sm text-red-600">{errors.max_budget.message}</p>
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
      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="vroegste_verhuisdatum"
          render={({ field }) => {
            const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              let value = e.target.value;
              let cleaned = value.replace(/[^\d/]/g, '');
              if (cleaned.length >= 2 && cleaned.charAt(2) !== '/') {
                cleaned = cleaned.substring(0, 2) + '/' + cleaned.substring(2);
              }
              if (cleaned.length >= 5 && cleaned.charAt(5) !== '/') {
                cleaned = cleaned.substring(0, 5) + '/' + cleaned.substring(5);
              }
              if (cleaned.length > 10) {
                cleaned = cleaned.substring(0, 10);
              }
              field.onChange(cleaned);
            };
            return (
              <FormItem>
                <FormLabel>Vroegste verhuisdatum</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      {...field}
                      onChange={handleDateInputChange}
                      placeholder="dd/mm/jjjj"
                      className="pl-10"
                      maxLength={10}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={control}
          name="voorkeur_verhuisdatum"
          render={({ field }) => {
            const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              let value = e.target.value;
              let cleaned = value.replace(/[^\d/]/g, '');
              if (cleaned.length >= 2 && cleaned.charAt(2) !== '/') {
                cleaned = cleaned.substring(0, 2) + '/' + cleaned.substring(2);
              }
              if (cleaned.length >= 5 && cleaned.charAt(5) !== '/') {
                cleaned = cleaned.substring(0, 5) + '/' + cleaned.substring(5);
              }
              if (cleaned.length > 10) {
                cleaned = cleaned.substring(0, 10);
              }
              field.onChange(cleaned);
            };
            return (
              <FormItem>
                <FormLabel>Voorkeur verhuisdatum</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      {...field}
                      onChange={handleDateInputChange}
                      placeholder="dd/mm/jjjj"
                      className="pl-10"
                      maxLength={10}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>
      <FormField
        control={control}
        name="beschikbaarheid_flexibel"
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
                Beschikbaarheid flexibel
              </FormLabel>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};