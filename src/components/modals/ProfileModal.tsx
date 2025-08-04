import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import UnifiedModal from './UnifiedModal';

// Simplified schema for the Profile Modal
const profileModalSchema = z.object({
  // Basic Info
  first_name: z.string().min(1, 'Voornaam is verplicht'),
  last_name: z.string().min(1, 'Achternaam is verplicht'),
  date_of_birth: z.string()
    .min(1, 'Geboortedatum is verplicht')
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Datum moet in dd/mm/jjjj formaat zijn'),
  phone: z.string().min(10, 'Ongeldig telefoonnummer'),
  profession: z.string().min(1, 'Beroep is verplicht'),
  monthly_income: z.number().min(0, 'Inkomen mag niet negatief zijn'),
  
  // Housing Preferences
  max_huur: z.number().min(1, 'Maximale huur moet groter dan 0 zijn'),
  min_kamers: z.number().min(1, 'Minimaal 1 kamer').optional(),
  max_kamers: z.number().min(1, 'Minimaal 1 kamer').optional(),
  locatie_voorkeur: z.array(z.string()).optional(),
  
  // Personal Details
  leeftijd: z.number().min(18, 'Je moet minimaal 18 jaar zijn').max(100, 'Ongeldige leeftijd'),
  kinderen: z.number().min(0, 'Aantal kinderen mag niet negatief zijn').optional(),
  partner: z.boolean().default(false),
  huisdieren: z.boolean().default(false),
  roken: z.boolean().default(false),
  
  // Availability
  voorkeur_verhuisdatum: z.string().optional(),
  vroegste_verhuisdatum: z.string().optional(),
  beschikbaarheid_flexibel: z.boolean().default(false),
  
  // Profile
  beschrijving: z.string().min(50, 'Beschrijving moet minimaal 50 karakters zijn').max(500, 'Beschrijving mag maximaal 500 karakters zijn'),
  profielfoto_url: z.string().optional(),
  
  // Guarantor
  borgsteller_beschikbaar: z.boolean().default(false),
  borgsteller_naam: z.string().optional(),
  borgsteller_relatie: z.string().optional(),
  borgsteller_telefoon: z.string().optional(),
  borgsteller_inkomen: z.number().min(0).optional(),
});

type ProfileModalData = z.infer<typeof profileModalSchema>;

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ProfileModal({ isOpen, onClose, onSuccess }: ProfileModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProfileModalData>({
    resolver: zodResolver(profileModalSchema),
    defaultValues: {
      locatie_voorkeur: [],
      kinderen: 0,
      partner: false,
      huisdieren: false,
      roken: false,
      beschikbaarheid_flexibel: false,
      borgsteller_beschikbaar: false,
    },
  });

  const onSubmit = async (data: ProfileModalData) => {
    if (!user?.id) {
      toast({
        title: 'Fout',
        description: 'Je moet ingelogd zijn om je profiel bij te werken',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Convert date format from dd/mm/yyyy to yyyy-mm-dd
      const convertDateFormat = (dateStr: string): string => {
        if (!dateStr) return '';
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
      };

      // Prepare data for database
      const profileData = {
        // Basic info
        beroep: data.profession,
        inkomen: data.monthly_income,
        leeftijd: data.leeftijd,
        kinderen: data.kinderen || 0,
        partner: data.partner,
        huisdieren: data.huisdieren,
        roken: data.roken,
        
        // Housing preferences
        max_huur: data.max_huur,
        min_kamers: data.min_kamers,
        max_kamers: data.max_kamers,
        locatie_voorkeur: data.locatie_voorkeur,
        
        // Availability
        voorkeur_verhuisdatum: data.voorkeur_verhuisdatum ? convertDateFormat(data.voorkeur_verhuisdatum) : null,
        vroegste_verhuisdatum: data.vroegste_verhuisdatum ? convertDateFormat(data.vroegste_verhuisdatum) : null,
        beschikbaarheid_flexibel: data.beschikbaarheid_flexibel,
        
        // Profile
        beschrijving: data.beschrijving,
        profielfoto_url: data.profielfoto_url,
        
        // Guarantor
        borgsteller_beschikbaar: data.borgsteller_beschikbaar,
        borgsteller_naam: data.borgsteller_naam || null,
        borgsteller_relatie: data.borgsteller_relatie || null,
        borgsteller_telefoon: data.borgsteller_telefoon || null,
        borgsteller_inkomen: data.borgsteller_inkomen || null,
        
        // Update timestamp
        bijgewerkt_op: new Date().toISOString(),
      };

      // Update gebruikers table with basic info
      const { error: userError } = await supabase
        .from('gebruikers')
        .update({
          naam: `${data.first_name} ${data.last_name}`,
          telefoon: data.phone,
          bijgewerkt_op: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Update huurders table with profile data
      const { error: huurderError } = await supabase
        .from('huurders')
        .update(profileData)
        .eq('id', user.id);

      if (huurderError) throw huurderError;

      toast({
        title: 'Profiel bijgewerkt',
        description: 'Je profiel is succesvol bijgewerkt',
      });

      onSuccess?.();
      onClose();
      reset();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Fout',
        description: 'Er is een fout opgetreden bij het bijwerken van je profiel',
        variant: 'destructive',
      });
    } finally {
    }
  };

  return (
    <UnifiedModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Profiel bewerken"
      size="lg"
      footer={
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose} variant="outline">
            Annuleren
          </Button>
          <Button type="submit" form="profile-form" variant="default">
            Profiel Opslaan
          </Button>
        </div>
      }
    >
        
        <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Picture */}
          <div>
            <Label>Profielfoto</Label>
            <div className="mt-2">
              <Input
                type="url"
                placeholder="URL van je profielfoto"
                {...register('profielfoto_url')}
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Voornaam *</Label>
              <Input
                id="first_name"
                {...register('first_name')}
                placeholder="Voer je voornaam in"
              />
              {errors.first_name && (
                <p className="text-sm text-red-500 mt-1">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="last_name">Achternaam *</Label>
              <Input
                id="last_name"
                {...register('last_name')}
                placeholder="Voer je achternaam in"
              />
              {errors.last_name && (
                <p className="text-sm text-red-500 mt-1">{errors.last_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="date_of_birth">Geboortedatum *</Label>
              <Input
                id="date_of_birth"
                {...register('date_of_birth')}
                placeholder="dd/mm/jjjj"
              />
              {errors.date_of_birth && (
                <p className="text-sm text-red-500 mt-1">{errors.date_of_birth.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Telefoonnummer *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="06-12345678"
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="profession">Beroep *</Label>
              <Input
                id="profession"
                {...register('profession')}
                placeholder="Bijv. Software Engineer"
              />
              {errors.profession && (
                <p className="text-sm text-red-500 mt-1">{errors.profession.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="monthly_income">Maandinkomen *</Label>
              <Input
                id="monthly_income"
                type="number"
                {...register('monthly_income', { valueAsNumber: true })}
                placeholder="2500"
              />
              {errors.monthly_income && (
                <p className="text-sm text-red-500 mt-1">{errors.monthly_income.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="leeftijd">Leeftijd *</Label>
              <Input
                id="leeftijd"
                type="number"
                {...register('leeftijd', { valueAsNumber: true })}
                placeholder="25"
              />
              {errors.leeftijd && (
                <p className="text-sm text-red-500 mt-1">{errors.leeftijd.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="kinderen">Aantal kinderen</Label>
              <Input
                id="kinderen"
                type="number"
                {...register('kinderen', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.kinderen && (
                <p className="text-sm text-red-500 mt-1">{errors.kinderen.message}</p>
              )}
            </div>
          </div>

          {/* Lifestyle */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Levensstijl</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="partner"
                  checked={watch('partner')}
                  onCheckedChange={(checked) => setValue('partner', checked as boolean)}
                />
                <Label htmlFor="partner">Ik heb een partner</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="huisdieren"
                  checked={watch('huisdieren')}
                  onCheckedChange={(checked) => setValue('huisdieren', checked as boolean)}
                />
                <Label htmlFor="huisdieren">Ik heb huisdieren</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="roken"
                  checked={watch('roken')}
                  onCheckedChange={(checked) => setValue('roken', checked as boolean)}
                />
                <Label htmlFor="roken">Ik rook</Label>
              </div>
            </div>
          </div>

          {/* Housing Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Woningvoorkeuren</h3>
            
            <div>
              <Label htmlFor="max_huur">Maximale huur *</Label>
              <Input
                id="max_huur"
                type="number"
                {...register('max_huur', { valueAsNumber: true })}
                placeholder="1200"
              />
              {errors.max_huur && (
                <p className="text-sm text-red-500 mt-1">{errors.max_huur.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_kamers">Minimale kamers</Label>
                <Input
                  id="min_kamers"
                  type="number"
                  {...register('min_kamers', { valueAsNumber: true })}
                  placeholder="1"
                />
                {errors.min_kamers && (
                  <p className="text-sm text-red-500 mt-1">{errors.min_kamers.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="max_kamers">Maximale kamers</Label>
                <Input
                  id="max_kamers"
                  type="number"
                  {...register('max_kamers', { valueAsNumber: true })}
                  placeholder="3"
                />
                {errors.max_kamers && (
                  <p className="text-sm text-red-500 mt-1">{errors.max_kamers.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Beschikbaarheid</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="voorkeur_verhuisdatum">Voorkeur verhuisdatum</Label>
                <Input
                  id="voorkeur_verhuisdatum"
                  {...register('voorkeur_verhuisdatum')}
                  placeholder="dd/mm/jjjj"
                />
              </div>

              <div>
                <Label htmlFor="vroegste_verhuisdatum">Vroegste verhuisdatum</Label>
                <Input
                  id="vroegste_verhuisdatum"
                  {...register('vroegste_verhuisdatum')}
                  placeholder="dd/mm/jjjj"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="beschikbaarheid_flexibel"
                checked={watch('beschikbaarheid_flexibel')}
                onCheckedChange={(checked) => setValue('beschikbaarheid_flexibel', checked as boolean)}
              />
              <Label htmlFor="beschikbaarheid_flexibel">Flexibele beschikbaarheid</Label>
            </div>
          </div>

          {/* Guarantor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Borgsteller</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="borgsteller_beschikbaar"
                checked={watch('borgsteller_beschikbaar')}
                onCheckedChange={(checked) => setValue('borgsteller_beschikbaar', checked as boolean)}
              />
              <Label htmlFor="borgsteller_beschikbaar">Ik heb een borgsteller beschikbaar</Label>
            </div>

            {watch('borgsteller_beschikbaar') && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="borgsteller_naam">Naam borgsteller</Label>
                    <Input
                      id="borgsteller_naam"
                      {...register('borgsteller_naam')}
                      placeholder="Naam van borgsteller"
                    />
                  </div>

                  <div>
                    <Label htmlFor="borgsteller_relatie">Relatie tot borgsteller</Label>
                    <Input
                      id="borgsteller_relatie"
                      {...register('borgsteller_relatie')}
                      placeholder="Bijv. Ouder, familielid"
                    />
                  </div>

                  <div>
                    <Label htmlFor="borgsteller_telefoon">Telefoon borgsteller</Label>
                    <Input
                      id="borgsteller_telefoon"
                      {...register('borgsteller_telefoon')}
                      placeholder="06-12345678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="borgsteller_inkomen">Inkomen borgsteller</Label>
                    <Input
                      id="borgsteller_inkomen"
                      type="number"
                      {...register('borgsteller_inkomen', { valueAsNumber: true })}
                      placeholder="3000"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="beschrijving">Over jezelf *</Label>
            <Textarea
              id="beschrijving"
              {...register('beschrijving')}
              rows={4}
              placeholder="Vertel iets over jezelf, je interesses, en waarom je op zoek bent naar een nieuwe woning..."
            />
            {errors.beschrijving && (
              <p className="text-sm text-red-500 mt-1">{errors.beschrijving.message}</p>
            )}
          </div>

          {/* Form content - submit buttons are handled by UnifiedModal actions */}
        </form>
      </UnifiedModal>
    );
  };
