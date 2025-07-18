import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileFormData } from '../profileSchema';
import { User, Calendar, Phone, Globe, Baby } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ProfilePictureUpload } from '@/components/ProfilePictureUpload';
import { useAuthStore } from '@/store/authStore';

export const Step1_PersonalInfo = () => {
  const { control, register, formState: { errors }, watch, setValue } = useFormContext<ProfileFormData>();
  const { user } = useAuthStore();
  const profilePictureUrl = watch('profilePictureUrl') || '';
  const hasChildren = watch('has_children');
  const numberOfChildren = watch('number_of_children') || 0;

  const handleProfilePictureUploaded = (url: string) => {
    setValue('profilePictureUrl', url);
  };

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

      {/* Profile Picture Upload */}
      <div className="flex justify-center mb-6">
        <ProfilePictureUpload
          userId={user?.id || ''}
          type="profile"
          currentImageUrl={profilePictureUrl}
          onImageUploaded={handleProfilePictureUploaded}
        />
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
          render={({ field }) => {
            const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              let value = e.target.value;
              
              // Remove any non-numeric characters except /
              let cleaned = value.replace(/[^\d/]/g, '');
              
              // Auto-format as user types
              if (cleaned.length >= 2 && cleaned.charAt(2) !== '/') {
                cleaned = cleaned.substring(0, 2) + '/' + cleaned.substring(2);
              }
              if (cleaned.length >= 5 && cleaned.charAt(5) !== '/') {
                cleaned = cleaned.substring(0, 5) + '/' + cleaned.substring(5);
              }
              
              // Limit to dd/mm/yyyy format (10 characters)
              if (cleaned.length > 10) {
                cleaned = cleaned.substring(0, 10);
              }
              
              field.onChange(cleaned);
            };
            
            return (
              <FormItem>
                <FormLabel>Geboortedatum *</FormLabel>
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

      {/* Children Information */}
      <div className="space-y-4">
        <FormField
          control={control}
          name="has_children"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Heb je kinderen?</FormLabel>
              <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value ? 'true' : 'false'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="false">Nee</SelectItem>
                  <SelectItem value="true">Ja</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {hasChildren && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Baby className="w-4 h-4 text-blue-600" />
              <h3 className="font-medium text-blue-900">Informatie over kinderen</h3>
            </div>
            
            <FormField
              control={control}
              name="number_of_children"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aantal kinderen</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer aantal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {numberOfChildren > 0 && (
              <div className="space-y-2">
                <Label>Leeftijden van kinderen</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Array.from({ length: numberOfChildren }, (_, index) => (
                    <FormField
                      key={index}
                      control={control}
                      name={`children_ages.${index}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={`Kind ${index + 1}`}
                              min="0"
                              max="25"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
