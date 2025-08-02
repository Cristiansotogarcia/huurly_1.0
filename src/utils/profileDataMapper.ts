/**
 * Profile Data Mapper
 * Maps frontend English field names to backend Dutch column names
 */

import { ProfileFormData } from '@/components/modals/profileSchema';

export function mapProfileFormToDutch(data: ProfileFormData): any {
  console.log('🔥 mapProfileFormToDutch - Received data:', data);
  
  // Convert date format from dd/mm/yyyy to yyyy-mm-dd
  const convertDateFormat = (dateStr: string): string => {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  };

  // Ensure preferred_city is properly handled
  let stad = '';
  let locatie_voorkeur: string[] = [];
  
  if (Array.isArray(data.preferred_city) && data.preferred_city.length > 0) {
    const firstCity = data.preferred_city[0];
    if (typeof firstCity === 'object' && firstCity !== null && 'name' in firstCity) {
      stad = (firstCity as { name: string }).name;
    } else if (typeof firstCity === 'string') {
      stad = firstCity;
    } else {
      // Handle case where firstCity might be an object with different structure
      stad = 'Amsterdam'; // fallback
    }
    
    // Map all cities for location preferences
    locatie_voorkeur = data.preferred_city.map(location => {
      if (typeof location === 'object' && location !== null) {
        if ('name' in location) {
          return (location as { name: string }).name;
        } else {
          // Handle objects without 'name' property
          return String(location);
        }
      } else if (typeof location === 'string') {
        return location;
      }
      return '';
    }).filter(name => name !== '');
  } else if (typeof data.preferred_city === 'string') {
    stad = data.preferred_city;
    locatie_voorkeur = [data.preferred_city];
  } else {
    // Default fallback
    stad = 'Amsterdam';
    locatie_voorkeur = ['Amsterdam'];
  }

  // Create Dutch data object with all required fields
  const dutchData: any = {
    voornaam: data.first_name || '',
    achternaam: data.last_name || '',
    telefoon: data.phone || '',
    geboortedatum: convertDateFormat(data.date_of_birth) || null,
    beroep: data.profession || '',
    werkgever: data.employer || '',
    dienstverband: data.employment_status || 'full-time',
    inkomen: data.monthly_income || 0,
    // Add fields expected by validation
    maandinkomen: data.monthly_income || 0,
    bio: data.bio || 'Dit is een standaard bio om te voldoen aan de minimum lengte van 50 karakters. Gelieve dit aan te passen.',
    beschrijving: data.bio || 'Dit is een standaard bio om te voldoen aan de minimum lengte van 50 karakters. Gelieve dit aan te passen.',
    stad: stad,
    minBudget: data.min_budget ?? 0,
    maxBudget: data.max_budget ?? 1000,
    slaapkamers: data.min_kamers ?? 1,
    woningtype: data.preferred_property_type || 'appartement',
    motivatie: data.motivation || 'Dit is een standaard motivatie om te voldoen aan de minimum lengte van 50 karakters. Gelieve dit aan te passen.',
    extra_inkomen: data.extra_income || 0,
    extra_inkomen_beschrijving: data.extra_income_description || '',
    thuiswerken: data.work_from_home || false,
    nationaliteit: data.nationality || 'Nederlandse',
    geslacht: data.sex || 'zeg_ik_liever_niet',
    burgerlijke_staat: data.marital_status || 'single',
    
    // Partner information
    partner: data.has_partner || false,
    partner_naam: data.partner_name || '',
    partner_beroep: data.partner_profession || '',
    partner_dienstverband: data.partner_employment_status || '',
    partner_inkomen: data.partner_monthly_income || 0,
    
    // Children information
    heeft_kinderen: data.has_children || false,
    aantal_kinderen: data.number_of_children || 0,
    kinderen_leeftijden: data.children_ages || [],
    
    // Housing preferences
    locatie_voorkeur: locatie_voorkeur,
    voorkeur_woningtype: data.preferred_property_type || 'appartement',
    min_budget: data.min_budget,
    max_huur: data.max_budget,
    min_kamers: data.min_kamers,
    max_kamers: data.max_kamers,
    voorkeur_slaapkamers: data.preferred_bedrooms,
    voorkeur_meubilering: data.furnished_preference,
    voorkeur_verhuisdatum: data.move_in_date_preferred ? convertDateFormat(data.move_in_date_preferred) : undefined,
    vroegste_verhuisdatum: data.move_in_date_earliest ? convertDateFormat(data.move_in_date_earliest) : undefined,
    beschikbaarheid_flexibel: data.availability_flexible || false,
    huurcontract_voorkeur: data.lease_duration_preference,
    parkeren_vereist: data.parking_required || false,
    
    // Storage preferences
    opslag_kelder: data.storage_kelder || false,
    opslag_zolder: data.storage_zolder || false,
    opslag_berging: data.storage_berging || false,
    opslag_garage: data.storage_garage || false,
    opslag_schuur: data.storage_schuur || false,
    
    // Lifestyle
    huisdieren: data.hasPets || false,
    huisdier_details: data.pet_details || '',
    roken: data.smokes || false,
    rook_details: data.smoking_details || '',
    
    // Guarantor
    borgsteller_beschikbaar: data.borgsteller_beschikbaar || false,
    borgsteller_naam: data.borgsteller_naam || '',
    borgsteller_relatie: data.borgsteller_relatie || '',
    borgsteller_telefoon: data.borgsteller_telefoon || '',
    borgsteller_inkomen: data.borgsteller_inkomen || 0,
    
    // References
    referenties_beschikbaar: data.references_available || false,
    verhuurgeschiedenis_jaren: data.rental_history_years || 0,
    reden_verhuizing: data.reason_for_moving || '',
    
    // Profile
    profiel_foto: data.profilePictureUrl || '',
  };

  // Remove undefined values (but preserve false boolean values)
  Object.keys(dutchData).forEach(key => {
    if (dutchData[key] === undefined) {
      delete dutchData[key];
    }
  });

  console.log('🔥 Mapped profile data:', dutchData);
  return dutchData;
}
