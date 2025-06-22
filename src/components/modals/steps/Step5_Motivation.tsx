import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

export const Step5_Motivation = () => {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Motivatie & Bio</h3>
      <p className="text-sm text-muted-foreground">
        Dit is je kans om een goede indruk te maken! Vertel verhuurders wat meer over jezelf.
      </p>
      <div className="space-y-4">
        <FormField
          control={control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Korte biografie</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Vertel iets over jezelf, je werk, je hobbies..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="motivation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivatie voor verhuizen</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Waarom zoek je een nieuwe woning? Wat voor soort buurt zoek je?"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};