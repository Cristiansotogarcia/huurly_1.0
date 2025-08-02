import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Euro, Phone, User } from 'lucide-react';
import { useFormContext, Controller } from 'react-hook-form';
import { FormField, FormItem, FormControl } from '@/components/ui/form';

export default function Step5Guarantor() {
  const { control, register, watch, formState: { errors } } = useFormContext();
  const guarantorAvailable = watch('borgsteller_beschikbaar');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold">Borg & Garanties</h2>
        </div>
        <p className="text-gray-600">Informatie over financiële garanties</p>
      </div>

      <div className="space-y-4">
        <FormField
          control={control}
          name="borgsteller_beschikbaar"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label>Ik heb een borg/garantsteller beschikbaar</Label>
              </div>
            </FormItem>
          )}
        />

        {guarantorAvailable && (
          <div className="ml-6 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="borgsteller_naam">Naam garantsteller</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input {...register('borgsteller_naam')} placeholder="Volledige naam" className="pl-10" />
              </div>
              {errors.borgsteller_naam && <p className="text-red-500 text-xs">{`${errors.borgsteller_naam.message}`}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="borgsteller_telefoon">Telefoon garantsteller</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input {...register('borgsteller_telefoon')} placeholder="+31 6 12345678" className="pl-10" />
                </div>
                {errors.borgsteller_telefoon && <p className="text-red-500 text-xs">{`${errors.borgsteller_telefoon.message}`}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="borgsteller_inkomen">Inkomen garantsteller</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input {...register('borgsteller_inkomen', { valueAsNumber: true })} type="number" placeholder="5000" className="pl-10" />
                </div>
                {errors.borgsteller_inkomen && <p className="text-red-500 text-xs">{`${errors.borgsteller_inkomen.message}`}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="borgsteller_relatie">Relatie tot garantsteller</Label>
              <Controller
                name="borgsteller_relatie"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer relatie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ouder">Ouder</SelectItem>
                      <SelectItem value="familie">Familie</SelectItem>
                      <SelectItem value="vriend">Vriend</SelectItem>
                      <SelectItem value="werkgever">Werkgever</SelectItem>
                      <SelectItem value="anders">Anders</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.borgsteller_relatie && <p className="text-red-500 text-xs">{`${errors.borgsteller_relatie.message}`}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <FormField
          control={control}
          name="inkomensbewijs_beschikbaar"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label>Ik kan inkomstenbewijs overleggen</Label>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
