import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export const Step4_Lifestyle = () => {
  const { control, watch } = useFormContext();
  const hasPets = watch('hasPets');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Levensstijl</h3>
      <div className="space-y-4">
        <FormField
          control={control}
          name="hasPets"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Huisdieren</FormLabel>
                <p className="text-sm text-muted-foreground">Heb je huisdieren?</p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {hasPets && (
          <FormField
            control={control}
            name="pet_details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Details over huisdieren</FormLabel>
                <FormControl>
                  <Textarea placeholder="Bijv: 1 hond, golden retriever, 5 jaar oud" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={control}
          name="smokes"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Roken</FormLabel>
                <p className="text-sm text-muted-foreground">Rook je?</p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};