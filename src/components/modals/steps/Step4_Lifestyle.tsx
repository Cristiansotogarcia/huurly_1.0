import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ProfileFormData } from '../profileSchema';
import { Heart, Cigarette, PawPrint } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

export const Step4_Lifestyle = () => {
  const { control, register, formState: { errors }, watch } = useFormContext<ProfileFormData>();
  
  const hasPets = watch('hasPets');
  const smokes = watch('smokes');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-pink-600" />
          </div>
          <h2 className="text-xl font-semibold">Levensstijl</h2>
        </div>
        <p className="text-gray-600">Vertel over je levensstijl en voorkeuren</p>
      </div>

      <div className="space-y-6">
        <FormField
          control={control}
          name="hasPets"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="flex items-center space-x-2">
                  <PawPrint className="w-4 h-4" />
                  <span>Ik heb huisdieren</span>
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Geef aan of je huisdieren hebt
                </p>
              </div>
            </FormItem>
          )}
        />

        {hasPets && (
          <div className="space-y-2">
            <Label htmlFor="pet_details">Details over je huisdieren</Label>
            <Textarea
              id="pet_details"
              {...register('pet_details')}
              placeholder="Bijvoorbeeld: 1 kat, 2 jaar oud, huistrained..."
              className={errors.pet_details ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.pet_details && (
              <p className="text-sm text-red-600">{errors.pet_details.message}</p>
            )}
          </div>
        )}

        <FormField
          control={control}
          name="smokes"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="flex items-center space-x-2">
                  <Cigarette className="w-4 h-4" />
                  <span>Ik rook</span>
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Geef aan of je rookt (binnen of buiten)
                </p>
              </div>
            </FormItem>
          )}
        />

        {smokes && (
          <div className="space-y-2">
            <Label htmlFor="smoking_details">Details over je rookgewoonten</Label>
            <Textarea
              id="smoking_details"
              {...register('smoking_details')}
              placeholder="Bijvoorbeeld: Alleen buiten, nooit binnen, alleen op balkon..."
              className={errors.smoking_details ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.smoking_details && (
              <p className="text-sm text-red-600">{errors.smoking_details.message}</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">💡 Waarom vragen we dit?</h3>
        <p className="text-sm text-blue-800">
          Deze informatie helpt verhuurders om te bepalen of je past bij hun woning en regels. 
          Eerlijkheid voorkomt problemen later.
        </p>
      </div>
    </div>
  );
};