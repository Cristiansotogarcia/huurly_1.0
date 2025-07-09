import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileFormData } from '../profileSchema';
import { User, Calendar, Phone, Globe } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import EnhancedDatePicker from '../EnhancedDatePicker';

export const Step1_PersonalInfo = () => {
  const { control, register, formState: { errors } } = useFormContext<ProfileFormData>();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold">Persoonlijke Informatie</h2>
        </div>
        <p className="text-gray-600">Begin met je basisgegevens</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Voornaam *</Label>
          <Input
            id="first_name"
            {...register('first_name')}
            placeholder="Je voornaam"
            className={errors.first_name ? 'border-red-500' : ''}
          />
          {errors.first_name && (
            <p className="text-sm text-red-600">{errors.first_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Achternaam *</Label>
          <Input
            id="last_name"
            {...register('last_name')}
            placeholder="Je achternaam"
            className={errors.last_name ? 'border-red-500' : ''}
          />
          {errors.last_name && (
            <p className="text-sm text-red-600">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="date_of_birth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Geboortedatum *</FormLabel>
              <FormControl>
                <EnhancedDatePicker
                  selected={field.value}
                  onSelect={field.onChange}
                  placeholder="Selecteer geboortedatum"
                  disabled={(date) => 
                    date > new Date() || date < new Date("1900-01-01")
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="phone">Telefoonnummer *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="phone"
              {...register('phone')}
              placeholder="+31 6 12345678"
              className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Geslacht</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer geslacht" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="man">Man</SelectItem>
                  <SelectItem value="vrouw">Vrouw</SelectItem>
                  <SelectItem value="anders">Anders</SelectItem>
                  <SelectItem value="zeg_ik_liever_niet">Zeg ik liever niet</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="nationality">Nationaliteit</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="nationality"
              {...register('nationality')}
              placeholder="Nederlandse"
              className={`pl-10 ${errors.nationality ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.nationality && (
            <p className="text-sm text-red-600">{errors.nationality.message}</p>
          )}
        </div>
      </div>

      <FormField
        control={control}
        name="marital_status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Burgerlijke staat</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer burgerlijke staat" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="single">Alleenstaand</SelectItem>
                <SelectItem value="samenwonend">Samenwonend</SelectItem>
                <SelectItem value="getrouwd">Getrouwd</SelectItem>
                <SelectItem value="gescheiden">Gescheiden</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};