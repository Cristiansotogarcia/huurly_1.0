import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// ProfilePictureUpload removed - users can update profile picture from dashboard
import { DateInput } from '@/components/ui/DateInput';
// useAuthStore removed - no longer needed without profile picture upload
import { ProfileFormData } from '../profileSchema';

export default function Step1PersonalInfo() {
  const { control, register, formState: { errors } } = useFormContext<ProfileFormData>();

  // Profile picture handling removed - users can update from dashboard

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefoonnummer *</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder="+31 6 12345678"
          required
        />
        {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <Input
            id="nationality"
            {...register('nationality')}
            placeholder="Nederlandse"
          />
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
