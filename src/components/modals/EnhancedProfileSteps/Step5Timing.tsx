
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Calendar } from 'lucide-react';
import EnhancedDatePicker from '../EnhancedDatePicker';
import { useFormContext, Controller } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';

export default function Step5Timing() {
  const { control, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold">Timing & Beschikbaarheid</h2>
        </div>
        <p className="text-gray-600">Wanneer wil je verhuizen?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="move_in_date_preferred">Gewenste inhuurdatum</Label>
          <Controller
            name="move_in_date_preferred"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <div className="pl-10">
                  <EnhancedDatePicker
                    selected={field.value}
                    onSelect={field.onChange}
                    placeholder="Gewenste datum"
                  />
                </div>
              </div>
            )}
          />
          {errors.move_in_date_preferred && <p className="text-red-500 text-xs">{`${errors.move_in_date_preferred.message}`}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="move_in_date_earliest">Vroegst mogelijke datum</Label>
          <Controller
            name="move_in_date_earliest"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <div className="pl-10">
                  <EnhancedDatePicker
                    selected={field.value}
                    onSelect={field.onChange}
                    placeholder="Vroegste datum"
                  />
                </div>
              </div>
            )}
          />
          {errors.move_in_date_earliest && <p className="text-red-500 text-xs">{`${errors.move_in_date_earliest.message}`}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <FormField
          control={control}
          name="availability_flexible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label>Ik ben flexibel met de datum</Label>
              </div>
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lease_duration_preference">Gewenste huurperiode</Label>
        <Controller
          name="lease_duration_preference"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer voorkeur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6_maanden">6 maanden</SelectItem>
                <SelectItem value="1_jaar">1 jaar</SelectItem>
                <SelectItem value="2_jaar">2 jaar</SelectItem>
                <SelectItem value="langer">Langer dan 2 jaar</SelectItem>
                <SelectItem value="flexibel">Flexibel</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.lease_duration_preference && <p className="text-red-500 text-xs">{`${errors.lease_duration_preference.message}`}</p>}
      </div>
    </div>
  );
}
