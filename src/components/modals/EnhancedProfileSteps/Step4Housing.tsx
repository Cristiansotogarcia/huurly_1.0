
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { DateInput } from '@/components/ui/DateInput';
import EnhancedDatePicker from '../EnhancedDatePicker';
import { Home, Euro, MapPin, Clock, Calendar, Heart, PawPrint, Cigarette } from 'lucide-react';
import { useFormContext, Controller } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import LocationSelector from '@/components/ui/LocationSelector';

export default function Step4Housing() {
  const { register, control, formState: { errors }, watch } = useFormContext();
  
  const hasPets = watch('hasPets');
  const smokes = watch('smokes');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Home className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-xl font-semibold">Woonvoorkeuren</h2>
        </div>
        <p className="text-gray-600">Vertel ons waar en hoe je wilt wonen</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="preferred_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gewenste woonplaats *</FormLabel>
              <FormControl>
                <LocationSelector
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Zoek naar steden..."
                  error={errors.preferred_city?.message}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="preferred_property_type">Type woning</Label>
          <Controller
            name="preferred_property_type"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appartement">Appartement</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="huis">Huis</SelectItem>
                  <SelectItem value="kamer">Kamer</SelectItem>
                  <SelectItem value="penthouse">Penthouse</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.preferred_property_type && <p className="text-red-500 text-xs">{`${errors.preferred_property_type.message}`}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min_kamers">Minimum aantal kamers</Label>
          <Input
            id="min_kamers"
            type="number"
            min="1"
            max="10"
            {...register('min_kamers', { valueAsNumber: true })}
            placeholder="2"
          />
          {errors.min_kamers && <p className="text-red-500 text-xs">{`${errors.min_kamers.message}`}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_kamers">Maximum aantal kamers</Label>
          <Input
            id="max_kamers"
            type="number"
            min="1"
            max="10"
            {...register('max_kamers', { valueAsNumber: true })}
            placeholder="4"
          />
          {errors.max_kamers && <p className="text-red-500 text-xs">{`${errors.max_kamers.message}`}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min_budget">Minimum budget *</Label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="min_budget"
              type="number"
              {...register('min_budget', { valueAsNumber: true, required: true })}
              placeholder="1200"
              className="pl-10"
            />
          </div>
          {errors.min_budget && <p className="text-red-500 text-xs">{`${errors.min_budget.message}`}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_budget">Maximum budget *</Label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="max_budget"
              type="number"
              {...register('max_budget', { valueAsNumber: true })}
              placeholder="1800"
              className="pl-10"
            />
          </div>
          {errors.max_budget && <p className="text-red-500 text-xs">{`${errors.max_budget.message}`}</p>}
        </div>
      </div>

      {/* Timing Section - Merged from Step 5 */}
      <div className="border-t pt-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium">Timing & Beschikbaarheid</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
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

        <div className="space-y-2 mb-4">
          <Label htmlFor="lease_duration_preference">Gewenste huurperiode</Label>
          <Controller
            name="lease_duration_preference"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer type" />
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

      {/* Preferences Section */}
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


        <FormField
          control={control}
          name="parking_required"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label>Parkeerplaats gewenst</Label>
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* Storage Preferences - Now as checkboxes */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Opslag wensen</Label>
        <div className="grid md:grid-cols-2 gap-3">
          <FormField
            control={control}
            name="storage_kelder"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <Label>Kelder</Label>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="storage_zolder"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <Label>Zolder</Label>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="storage_berging"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <Label>Berging</Label>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="storage_garage"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <Label>Garage</Label>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="storage_schuur"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <Label>Schuur</Label>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Lifestyle Section - Moved from Step 6 */}
      <div className="border-t pt-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-pink-600" />
          </div>
          <h3 className="text-lg font-medium">Levensstijl</h3>
        </div>
        <p className="text-gray-600 mb-4">Vertel over je levensstijl en voorkeuren</p>

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
                <p className="text-sm text-red-600">{`${errors.pet_details.message}`}</p>
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
                <p className="text-sm text-red-600">{`${errors.smoking_details.message}`}</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mt-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Waarom vragen we dit?</h4>
          <p className="text-sm text-blue-800">
            Deze informatie helpt verhuurders om te bepalen of je past bij hun woning en regels. 
            Eerlijkheid voorkomt problemen later.
          </p>
        </div>
      </div>
    </div>
  );
}
