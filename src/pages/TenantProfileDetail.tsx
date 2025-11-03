import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { withAuth } from '@/hocs/withAuth';
import { User } from '@/types';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User as UserIcon, Briefcase, Home, Heart, Shield } from 'lucide-react';
import ProfileOverview, { ProfileSection } from '@/components/standard/ProfileOverview';
import {
  mapEmploymentStatusLabel,
  mapContractTypeLabel,
  mapPropertyTypeLabel,
  mapFurnishedPreferenceLabel,
  mapLeaseDurationPreferenceLabel,
  mapSexLabel,
  mapMaritalStatusLabel,
  mapCurrentLivingSituationLabel,
  mapReasonForMovingLabel,
} from '@/utils/labelMappers';

interface TenantProfileDetailProps {
  user: User;
}

const TenantProfileDetail: React.FC<TenantProfileDetailProps> = ({ user }) => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [tenantData, setTenantData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTenantProfile = async () => {
      if (!tenantId) {
        logger.error('No tenant ID provided');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch tenant profile data
        const { data: huurderData, error: huurderError } = await supabase
          .from('huurders')
          .select(`
            *,
            gebruikers!inner(naam, email)
          `)
          .eq('id', tenantId)
          .single();

        if (huurderError) {
          logger.error(`Error fetching tenant: ${huurderError.message}`);
          setIsLoading(false);
          return;
        }

        setTenantData(huurderData);

        // Track profile view - call the database function
        if (user.id !== tenantId) {
          try {
            const viewerName = user.user_metadata?.full_name || user.email || 'Een verhuurder';
            
            const { error: trackError } = await supabase.rpc('track_profile_view', {
              p_huurder_id: tenantId,
              p_viewer_id: user.id,
              p_viewer_name: viewerName
            });

            if (trackError) {
              logger.error(`Error tracking profile view: ${trackError.message}`);
            }
          } catch (trackError) {
            logger.error(`Error tracking profile view: ${trackError instanceof Error ? trackError.message : String(trackError)}`);
          }
        }
      } catch (error) {
        logger.error(`Error loading tenant profile: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadTenantProfile();
  }, [tenantId, user.id, user.email, user.user_metadata]);

  const buildProfileSections = (tenantProfile: any): ProfileSection[] => {
    if (!tenantProfile) return [];

    const householdSize =
      1 +
      (tenantProfile.partner ? 1 : 0) +
      (tenantProfile.aantal_kinderen || 0) +
      (tenantProfile.aantal_huisgenoten || 0);

    return [
      {
        title: 'Persoonlijke Informatie',
        icon: UserIcon,
        iconColor: 'text-blue-600',
        fields: [
          { label: 'Naam', value: tenantProfile.gebruikers?.naam },
          { label: 'Telefoonnummer', value: tenantProfile.telefoon },
          { label: 'Geboortedatum', value: tenantProfile.geboortedatum },
          { label: 'Geslacht', value: mapSexLabel(tenantProfile.geslacht) },
          { label: 'Nationaliteit', value: tenantProfile.nationaliteit },
          { label: 'Burgerlijke staat', value: mapMaritalStatusLabel(tenantProfile.burgerlijke_staat) },
          { label: 'Leeftijd', value: tenantProfile.leeftijd },
          { label: 'Partner', value: tenantProfile.partner ? 'Ja' : 'Nee' },
          { label: 'Partner naam', value: tenantProfile.partner_naam },
          { label: 'Partner beroep', value: tenantProfile.partner_beroep },
          { label: 'Partner dienstverband', value: mapEmploymentStatusLabel(tenantProfile.partner_dienstverband) },
          { label: 'Partner inkomen', value: tenantProfile.partner_inkomen ? `€${tenantProfile.partner_inkomen}` : null },
          { label: 'Huishoudgrootte', value: householdSize },
          { label: 'Huidige woonsituatie', value: mapCurrentLivingSituationLabel(tenantProfile.huidige_woonsituatie) },
          { label: 'Kinderen', value: tenantProfile.aantal_kinderen },
          { label: 'Leeftijden kinderen', value: tenantProfile.kinderen_leeftijden?.join(', ') },
          { label: 'Huisdieren', value: tenantProfile.huisdieren ? 'Ja' : 'Nee' },
          { label: 'Huisdier details', value: tenantProfile.huisdier_details },
          { label: 'Roken', value: tenantProfile.roken ? 'Ja' : 'Nee' },
          { label: 'Rook details', value: tenantProfile.rook_details },
        ],
      },
      {
        title: 'Werk & Inkomen',
        icon: Briefcase,
        iconColor: 'text-green-600',
        fields: [
          { label: 'Beroep', value: tenantProfile.beroep },
          { label: 'Werkgever', value: tenantProfile.werkgever },
          { label: 'Dienstverband', value: mapEmploymentStatusLabel(tenantProfile.dienstverband) },
          { label: 'Contract type', value: mapContractTypeLabel(tenantProfile.contract_type) },
          { label: 'Maandelijks Inkomen', value: tenantProfile.inkomen ? `€${tenantProfile.inkomen}` : null },
          { label: 'Extra inkomen', value: tenantProfile.extra_inkomen ? `€${tenantProfile.extra_inkomen}` : null },
          { label: 'Beschrijving extra inkomen', value: tenantProfile.extra_inkomen_beschrijving },
          { label: 'Thuiswerken', value: tenantProfile.thuiswerken ? 'Ja' : 'Nee' },
          { label: 'Inkomensbewijs beschikbaar', value: tenantProfile.inkomensbewijs_beschikbaar ? 'Ja' : 'Nee' },
        ],
      },
      {
        title: 'Woonvoorkeuren',
        icon: Home,
        iconColor: 'text-purple-600',
        fields: [
          {
            label: 'Gewenste Locatie',
            value: tenantProfile.locatie_voorkeur && tenantProfile.locatie_voorkeur.length > 0
              ? tenantProfile.locatie_voorkeur.join(' - ')
              : 'Geen voorkeur opgegeven',
          },
          { label: 'Budget', value: tenantProfile.max_huur ? `€${tenantProfile.max_huur}` : null },
          { label: 'Min Kamers', value: tenantProfile.min_kamers },
          { label: 'Max Kamers', value: tenantProfile.max_kamers },
          { label: 'Vroegste Verhuisdatum', value: tenantProfile.vroegste_verhuisdatum },
          { label: 'Voorkeur Verhuisdatum', value: tenantProfile.voorkeur_verhuisdatum },
          { label: 'Beschikbaarheid Flexibel', value: tenantProfile.beschikbaarheid_flexibel ? 'Ja' : 'Nee' },
          { label: 'Woningtype', value: mapPropertyTypeLabel(tenantProfile.woningvoorkeur?.type) },
          { label: 'Gemeubileerd voorkeur', value: mapFurnishedPreferenceLabel(tenantProfile.woningvoorkeur?.meubilering) },
          { label: 'Parkeren vereist', value: tenantProfile.woningvoorkeur?.parkeren ? 'Ja' : 'Nee' },
          { label: 'Huurcontract voorkeur', value: mapLeaseDurationPreferenceLabel(tenantProfile.huurcontract_voorkeur) },
          { label: 'Reden voor verhuizing', value: mapReasonForMovingLabel(tenantProfile.reden_verhuizing) },
          { label: 'Opslag kelder', value: tenantProfile.opslag_kelder ? 'Ja' : 'Nee' },
          { label: 'Opslag zolder', value: tenantProfile.opslag_zolder ? 'Ja' : 'Nee' },
          { label: 'Opslag berging', value: tenantProfile.opslag_berging ? 'Ja' : 'Nee' },
          { label: 'Opslag garage', value: tenantProfile.opslag_garage ? 'Ja' : 'Nee' },
          { label: 'Opslag schuur', value: tenantProfile.opslag_schuur ? 'Ja' : 'Nee' },
        ],
      },
      {
        title: 'Borgsteller',
        icon: Shield,
        iconColor: 'text-orange-600',
        fields: [
          { label: 'Borgsteller beschikbaar', value: tenantProfile.borgsteller_beschikbaar ? 'Ja' : 'Nee' },
          { label: 'Borgsteller Naam', value: tenantProfile.borgsteller_naam },
          { label: 'Borgsteller Relatie', value: tenantProfile.borgsteller_relatie },
          { label: 'Borgsteller Telefoon', value: tenantProfile.borgsteller_telefoon },
          { label: 'Borgsteller E-mail', value: tenantProfile.borgsteller_email },
          { label: 'Borgsteller Inkomen', value: tenantProfile.borgsteller_inkomen ? `€${tenantProfile.borgsteller_inkomen}` : null },
        ],
      },
      {
        title: 'Levensstijl & Motivatie',
        icon: Heart,
        iconColor: 'text-red-600',
        fields: [
          { label: 'Beschrijving', value: tenantProfile.beschrijving || 'N.v.t.' },
          { label: 'Motivatie', value: tenantProfile.motivatie || 'N.v.t.' },
          { label: 'Referenties beschikbaar', value: tenantProfile.referenties_beschikbaar ? 'Ja' : 'Nee' },
          { label: 'Huurgeschiedenis (jaren)', value: tenantProfile.verhuurgeschiedenis_jaren },
        ],
      },
    ];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dutch-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Profiel laden...</p>
        </div>
      </div>
    );
  }

  if (!tenantData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Profiel niet gevonden</p>
            <Button onClick={() => navigate('/zoek-huurders')} className="mt-4 w-full">
              Terug naar zoeken
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileSections = buildProfileSections(tenantData);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/zoek-huurders')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar zoeken
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {tenantData.profiel_foto && (
                <img
                  src={tenantData.profiel_foto}
                  alt={tenantData.gebruikers?.naam}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{tenantData.gebruikers?.naam}</h1>
                <p className="text-gray-600">{tenantData.beroep || 'Beroep niet opgegeven'}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Max Budget</p>
                <p className="font-semibold">€{tenantData.max_huur || 'Niet opgegeven'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gewenste Locaties</p>
                <p className="font-semibold">
                  {tenantData.locatie_voorkeur?.join(', ') || 'Niet opgegeven'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Kamers</p>
                <p className="font-semibold">
                  {tenantData.min_kamers} - {tenantData.max_kamers} kamers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ProfileOverview
          sections={profileSections}
          title="Volledig Profiel"
          onEdit={() => {}}
          isCreating={false}
        />
      </div>
    </div>
  );
};

export default withAuth(TenantProfileDetail, 'verhuurder');
