/**
 * Profile Data Mapper
 * Maps frontend English field names to backend Dutch column names
 */

import { ProfileFormData } from '@/components/modals/profileSchema';

export function mapProfileFormToDutch(data: ProfileFormData): any {
  // Convert date format from dd/mm/yyyy to yyyy-mm-dd
  const convertDateFormat = (dateStr: string): string => {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  };

  // Create Dutch data object
  const dutchData: any = {
    voornaam: data.first_name,
    achternaam: data.last_name,
    telefoon: data.phone,
    geboortedatum: convertDateFormat(data.date_of_birth),
    beroep: data.profession,
    werkgever: data.employer,
    dienstverband: data.employment_status,
    inkomen: data.monthly_income,
    // Add fields expected by validation
    maandinkomen: data.monthly_income,
    bio: data.bio,
    stad: Array.isArray(data.preferred_city) && data.preferred_city.length > 0 
      ? (data.preferred_city[0]?.name || data.preferred_city[0]) 
      : (typeof data.preferred_city === 'string' ? data.preferred_city : ''),
    minBudget: data.min_budget,
    maxBudget: data.max_budget,
    slaapkamers: data.min_kamers,
    woningtype: data.preferred_property_type,
    extra_inkomen: data.extra_income,
    extra_inkomen_beschrijving: data.extra_income_description,
    thuiswerken: data.work_from_home,
    nationaliteit: data.nationality,
    geslacht: data.sex,
    burgerlijke_staat: data.marital_status,
    
    // Partner information
    partner: data.has_partner,
    partner_naam: data.partner_name,
    partner_beroep: data.partner_profession,
    partner_dienstverband: data.partner_employment_status,
    partner_inkomen: data.partner_monthly_income,
    
    // Children information
    heeft_kinderen: data.has_children,
    aantal_kinderen: data.number_of_children,
    kinderen_leeftijden: data.children_ages,
    
    // Housing preferences
    locatie_voorkeur: Array.isArray(data.preferred_city) && data.preferred_city.length > 0 ? data.preferred_city.map(location => location.name || location) : [data.preferred_city],
    voorkeur_woningtype: data.preferred_property_type,
    min_budget: data.min_budget,
    max_huur: data.max_budget,
    min_kamers: data.min_kamers,
    max_kamers: data.max_kamers,
    voorkeur_slaapkamers: data.preferred_bedrooms,
    voorkeur_meubilering: data.furnished_preference,
    voorkeur_verhuisdatum: data.move_in_date_preferred ? convertDateFormat(data.move_in_date_preferred) : undefined,
    vroegste_verhuisdatum: data.move_in_date_earliest ? convertDateFormat(data.move_in_date_earliest) : undefined,
    beschikbaarheid_flexibel: data.availability_flexible,
    huurcontract_voorkeur: data.lease_duration_preference,
    parkeren_vereist: data.parking_required,
    
    // Storage preferences
    opslag_kelder: data.storage_kelder,
    opslag_zolder: data.storage_zolder,
    opslag_berging: data.storage_berging,
    opslag_garage: data.storage_garage,
    opslag_schuur: data.storage_schuur,
    
    // Lifestyle
    huisdieren: data.hasPets,
    huisdier_details: data.pet_details,
    roken: data.smokes,
    rook_details: data.smoking_details,
    
    // Guarantor
    borgsteller_beschikbaar: data.borgsteller_beschikbaar,
    borgsteller_naam: data.borgsteller_naam,
    borgsteller_relatie: data.borgsteller_relatie,
    borgsteller_telefoon: data.borgsteller_telefoon,
    borgsteller_inkomen: data.borgsteller_inkomen,
    
    // References
    referenties_beschikbaar: data.references_available,
    verhuurgeschiedenis_jaren: data.rental_history_years,
    reden_verhuizing: data.reason_for_moving,
    
    // Profile
    beschrijving: data.bio,
    motivatie: data.motivation,
    profiel_foto: data.profilePictureUrl,
  };

  // Remove undefined values (but preserve false boolean values)
  Object.keys(dutchData).forEach(key => {
    if (dutchData[key] === undefined) {
      delete dutchData[key];
    }
  });

  return dutchData;
}
