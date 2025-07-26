
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Clock } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';

export default function Step7References() {
  const { control, register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold">Referenties & Geschiedenis</h2>
        </div>
        <p className="text-gray-600">Vertel ons over je huurverleden en referenties</p>
      </div>

      <div className="space-y-4">
        <FormField
          control={control}
          name="references_available"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label>Ik kan referenties van vorige verhuurders overleggen</Label>
              </div>
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rental_history_years">Hoeveel jaar huurervaring heb je?</Label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            {...register('rental_history_years', { valueAsNumber: true })}
            type="number"
            min="0"
            max="50"
            placeholder="5"
            className="pl-10"
          />
        </div>
        {errors.rental_history_years && <p className="text-red-500 text-xs">{`${errors.rental_history_years.message}`}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason_for_moving">Reden voor verhuizing</Label>
        <Textarea
          {...register('reason_for_moving')}
          placeholder="Beschrijf waarom je op zoek bent naar een nieuwe woning (bijv. nieuwe baan, studiebeëindiging, groeiende familie)"
          className="min-h-[100px]"
        />
        {errors.reason_for_moving && <p className="text-red-500 text-xs">{`${errors.reason_for_moving.message}`}</p>}
      </div>
    </div>
  );
}
