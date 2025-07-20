import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfilePictureUpload } from '@/components/ProfilePictureUpload';
import { DateInput } from '@/components/ui/DateInput';
import { User, Phone, Globe } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ProfileFormData } from '../profileSchema';

export default function Step1PersonalInfo() {
  const { control, register, setValue, watch, formState: { errors } } = useFormContext<ProfileFormData>();
  const { user } = useAuthStore();

  const profilePictureUrl = watch('profilePictureUrl');

  const handleProfilePictureUpload = (url: string) => {
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
        <p className="text-gray-600">Begin met je basisgegevens en profielfoto</p>
      </div>

      {/* Profile Picture Upload */}
      <div className="flex justify-center">
        <ProfilePictureUpload
          userId={user?.id || ''}
          type="profile"
          currentImageUrl={profilePictureUrl}
          onImageUploaded={handleProfilePictureUpload}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Voornaam *</Label>
          <Input
            id="first_name"
            {...register('first_name')}
            placeholder="Je voornaam"
            required
          />
          {errors.first_name && <p className="text-red-500 text-xs">{errors.first_name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Achternaam *</Label>
          <Input
            id="last_name"
            {...register('last_name')}
            placeholder="Je achternaam"
            required
          />
          {errors.last_name && <p className="text-red-500 text-xs">{errors.last_name.message}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Geboortedatum *</Label>
          <Controller
            name="date_of_birth"
            control={control}
            render={({ field }) => (
              <DateInput
                id="date_of_birth"
                value={field.value}
                onChange={field.onChange}
                placeholder="dd/mm/yyyy"
                required
              />
            )}
          />
          {errors.date_of_birth && <p className="text-red-500 text-xs">{errors.date_of_birth.message}</p>}
          <p className="text-xs text-gray-500">Voer je geboortedatum in als dd/mm/yyyy (bijvoorbeeld: 15/03/1990)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefoonnummer *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="phone"
              {...register('phone')}
              placeholder="+31 6 12345678"
              className="pl-10"
              required
            />
          </div>
          {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sex">Geslacht</Label>
          <Controller
            name="sex"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer geslacht" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="man">Man</SelectItem>
                  <SelectItem value="vrouw">Vrouw</SelectItem>
                  <SelectItem value="anders">Anders</SelectItem>
                  <SelectItem value="zeg_ik_liever_niet">Zeg ik liever niet</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">Nationaliteit</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="nationality"
              {...register('nationality')}
              placeholder="Nederlandse"
              className="pl-10"
            />
          </div>
          {errors.nationality && <p className="text-red-500 text-xs">{errors.nationality.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="marital_status">Burgerlijke staat</Label>
        <Controller
          name="marital_status"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer burgerlijke staat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Alleenstaand</SelectItem>
                <SelectItem value="samenwonend">Samenwonend</SelectItem>
                <SelectItem value="getrouwd">Getrouwd</SelectItem>
                <SelectItem value="gescheiden">Gescheiden</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </div>
  );
}