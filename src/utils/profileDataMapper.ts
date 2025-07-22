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
    maandinkomen: data.monthly_income,
    extra_inkomen: data.extra_income,
    extra_inkomen_beschrijving: data.extra_income_description,
    thuiswerken: data.work_from_home,
    nationaliteit: data.nationality,
    geslacht: data.sex,
    burgerlijke_staat: data.marital_status,
    
    // Partner information
    heeft_partner: data.has_partner,
    partner_naam: data.partner_name,
    partner_beroep: data.partner_profession,
    partner_dienstverband: data.partner_employment_status,
    partner_maandinkomen: data.partner_monthly_income,
    
    // Children information
    heeft_kinderen: data.has_children,
    aantal_kinderen: data.number_of_children,
    kinderen_leeftijden: data.children_ages,
    
    // Housing preferences
    voorkeurslocaties: data.preferred_city,
    voorkeur_woningtype: data.preferred_property_type,
    min_budget: data.min_budget,
    max_budget: data.max_budget,
    min_kamers: data.min_kamers,
    max_kamers: data.max_kamers,
    voorkeur_slaapkamers: data.preferred_bedrooms,
    voorkeur_meubilering: data.furnished_preference,
    voorkeur_verhuisdatum: data.move_in_date_preferred?.toISOString(),
    vroegste_verhuisdatum: data.move_in_date_earliest?.toISOString(),
    beschikbaarheid_flexibel: data.availability_flexible,
    huurcontract_voorkeur: data.lease_duration_preference,
    
    // Storage preferences
    opslag_kelder: data.storage_kelder,
    opslag_zolder: data.storage_zolder,
    opslag_berging: data.storage_berging,
    opslag_garage: data.storage_garage,
    opslag_schuur: data.storage_schuur,
    
    // Lifestyle
    huisdieren: data.hasPets,
    huisdier_details: data.pet_details,
    rookt: data.smokes,
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
    bio: data.bio,
    motivatie: data.motivation,
    profielfoto_url: data.profilePictureUrl,
  };

  // Remove undefined values
  Object.keys(dutchData).forEach(key => {
    if (dutchData[key] === undefined) {
      delete dutchData[key];
    }
  });

  return dutchData;
}
