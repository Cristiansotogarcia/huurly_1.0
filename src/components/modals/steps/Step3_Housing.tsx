import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Step3_Housing = () => {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Woonwensen</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name="preferred_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voorkeursstad</FormLabel>
              <FormControl>
                <Input placeholder="Amsterdam" {...field} />
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
              <FormLabel>Voorkeur Woningtype</FormLabel>
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
        <FormField
          control={control}
          name="preferred_bedrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aantal Slaapkamers</FormLabel>
              <FormControl>
                <Input type="number" placeholder="2" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="max_budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximale Huurprijs (€)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1500" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};