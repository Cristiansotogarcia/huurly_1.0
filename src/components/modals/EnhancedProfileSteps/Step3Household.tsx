
import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Baby, Euro } from 'lucide-react';
import { useFormContext, Controller } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';

export default function Step3Household() {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext();

  const hasPartner = watch('has_partner');
  const hasChildren = watch('has_children');
  const numberOfChildren = watch('number_of_children') || 0;
  const maritalStatus = watch('marital_status');

  // Auto-select partner checkbox when marital status indicates having a partner
  useEffect(() => {
    if (maritalStatus === 'samenwonend' || maritalStatus === 'getrouwd') {
      setValue('has_partner', true);
    }
  }, [maritalStatus, setValue]);

  const calculateHouseholdSize = () => {
    let size = 1; // The user themselves
    if (hasPartner) {
      size += 1;
    }
    if (hasChildren && numberOfChildren > 0) {
      size += Number(numberOfChildren);
    }
    return size;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold">Huishouden</h2>
        </div>
        <p className="text-gray-600">Informatie over je huishoudsituatie</p>
      </div>

      {/* Partner Information */}
      <div className="space-y-4">
        <FormField
          control={control}
          name="has_partner"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label htmlFor="has_partner">Ik heb een partner</Label>
              </div>
            </FormItem>
          )}
        />

        {hasPartner && (
          <div className="ml-6 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partner_name">Partner naam</Label>
                <Input
                  id="partner_name"
                  {...register('partner_name')}
                  placeholder="Naam van je partner"
                />
                {errors.partner_name && <p className="text-red-500 text-xs">{`${errors.partner_name.message}`}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner_profession">Partner beroep</Label>
                <Input
                  id="partner_profession"
                  {...register('partner_profession')}
                  placeholder="Beroep van je partner"
                />
                 {errors.partner_profession && <p className="text-red-500 text-xs">{`${errors.partner_profession.message}`}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partner_employment_status">Partner werkstatus</Label>
                <Controller
                  name="partner_employment_status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vast_contract">Vast contract</SelectItem>
                        <SelectItem value="tijdelijk_contract">Tijdelijk contract</SelectItem>
                        <SelectItem value="zzp">ZZP</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="werkloos">Werkloos</SelectItem>
                        <SelectItem value="pensioen">Pensioen</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                 {errors.partner_employment_status && <p className="text-red-500 text-xs">{`${errors.partner_employment_status.message}`}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner_monthly_income">Partner maandinkomen</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="partner_monthly_income"
                    type="number"
                    {...register('partner_monthly_income', { valueAsNumber: true })}
                    placeholder="3500"
                    className="pl-10"
                  />
                </div>
                {errors.partner_monthly_income && <p className="text-red-500 text-xs">{`${errors.partner_monthly_income.message}`}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Children Information */}
      <div className="space-y-4">
        <FormField
          control={control}
          name="has_children"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label htmlFor="has_children">Ik heb kinderen</Label>
              </div>
            </FormItem>
          )}
        />

        {hasChildren && (
          <div className="ml-6 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="number_of_children">Aantal kinderen</Label>
              <div className="relative">
                <Baby className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="number_of_children"
                  type="number"
                  min="0"
                  max="10"
                  {...register('number_of_children', { valueAsNumber: true })}
                  placeholder="2"
                  className="pl-10"
                />
              </div>
              {errors.number_of_children && <p className="text-red-500 text-xs">{`${errors.number_of_children.message}`}</p>}
            </div>
            
            {numberOfChildren > 0 && (
              <div className="space-y-3">
                <Label>Leeftijden van kinderen</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: numberOfChildren }, (_, index) => (
                    <div key={index}>
                      <Label htmlFor={`child_age_${index}`} className="text-sm">
                        Kind {index + 1} leeftijd
                      </Label>
                      <Input
                        id={`child_age_${index}`}
                        type="number"
                        min="0"
                        max="25"
                        {...register(`children_ages.${index}`, { valueAsNumber: true })}
                        className="mt-1"
                        placeholder="Leeftijd"
                      />
                      {errors.children_ages?.[index] && <p className="text-red-500 text-xs">{`${errors.children_ages[index].message}`}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Household Summary */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Huishouden overzicht</h3>
        <p className="text-blue-700">
          Totaal aantal personen in huishouden: <span className="font-semibold">{calculateHouseholdSize()}</span>
        </p>
      </div>
    </div>
  );
}
