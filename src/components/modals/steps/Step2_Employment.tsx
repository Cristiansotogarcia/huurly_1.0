import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Step2_Employment = () => {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Werk & Inkomen</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name="profession"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beroep</FormLabel>
              <FormControl>
                <Input placeholder="Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="employer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Werkgever</FormLabel>
              <FormControl>
                <Input placeholder="Tech Corp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="employment_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dienstverband</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer dienstverband" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="zzp">ZZP</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="werkloos">Werkloos</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="monthly_income"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Netto Maandinkomen</FormLabel>
              <FormControl>
                <Input type="number" placeholder="3000" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};