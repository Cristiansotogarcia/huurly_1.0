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

  // Handle preferred city array - extract first city name
  const stad = Array.isArray(data.preferred_city) && data.preferred_city.length > 0
    ? (typeof data.preferred_city[0] === 'object' && data.preferred_city[0]?.name
        ? data.preferred_city[0].name
        : String(data.preferred_city[0]))
    : 'Amsterdam';

  // Map all cities for location preferences
  const locatie_voorkeur = Array.isArray(data.preferred_city)
    ? data.preferred_city.map(location =>
        typeof location === 'object' && location?.name
          ? location.name
          : String(location)
      ).filter(name => name !== '')
    : [stad];

  // Direct field mapping - clean and simple
  return {
    // Personal Information
    voornaam: data.first_name,
    achternaam: data.last_name,
    telefoon: data.phone,
    geboortedatum: convertDateFormat(data.date_of_birth),
    geslacht: data.sex,
    nationaliteit: data.nationality,
    burgerlijke_staat: data.marital_status,

    // Employment
    beroep: data.profession,
    werkgever: data.employer,
    dienstverband: data.employment_status,
    inkomen: data.monthly_income,
    thuiswerken: data.work_from_home,
    inkomensbewijs_beschikbaar: data.inkomensbewijs_beschikbaar,

    // Financial
    extra_inkomen: data.extra_income || 0,
    extra_inkomen_beschrijving: data.extra_income_description || '',

    // Household
    heeft_kinderen: data.has_children,
    aantal_kinderen: data.number_of_children || 0,
    kinderen_leeftijden: data.children_ages || [],
    aantal_huisgenoten: data.number_of_housemates || 0,
    huidige_woonsituatie: data.current_living_situation,

    // Partner
    partner: data.has_partner,
    partner_naam: data.partner_name || '',
    partner_beroep: data.partner_profession || '',
    partner_dienstverband: data.partner_employment_status || '',
    partner_inkomen: data.partner_monthly_income || 0,

    // Housing Preferences
    stad: stad,
    locatie_voorkeur: locatie_voorkeur,
    voorkeur_woningtype: data.preferred_property_type,
    min_budget: data.min_budget,
    max_budget: data.max_budget,
    min_kamers: data.min_kamers,
    max_kamers: data.max_kamers,
    voorkeur_slaapkamers: data.preferred_bedrooms,
    voorkeur_meubilering: data.furnished_preference,
    voorkeur_verhuisdatum: data.move_in_date_preferred ? convertDateFormat(data.move_in_date_preferred) : null,
    vroegste_verhuisdatum: data.move_in_date_earliest ? convertDateFormat(data.move_in_date_earliest) : null,
    beschikbaarheid_flexibel: data.availability_flexible,
    huurcontract_voorkeur: data.lease_duration_preference,
    parkeren_vereist: data.parking_required,

    // Storage
    opslag_kelder: data.storage_kelder,
    opslag_zolder: data.storage_zolder,
    opslag_berging: data.storage_berging,
    opslag_garage: data.storage_garage,
    opslag_schuur: data.storage_schuur,

    // Lifestyle
    huisdieren: data.hasPets,
    huisdier_details: data.pet_details || '',
    roken: data.smokes,
    rook_details: data.smoking_details || '',

    // Guarantor
    borgsteller_beschikbaar: data.borgsteller_beschikbaar,
    borgsteller_naam: data.borgsteller_naam || '',
    borgsteller_relatie: data.borgsteller_relatie || '',
    borgsteller_telefoon: data.borgsteller_telefoon || '',
    borgsteller_inkomen: data.borgsteller_inkomen || 0,
    borgsteller_email: data.borgsteller_email || '',

    // References & History
    referenties_beschikbaar: data.references_available,
    verhuurgeschiedenis_jaren: data.rental_history_years || 0,
    reden_verhuizing: data.reason_for_moving,

    // Profile Content
    beschrijving: data.bio,
    motivatie: data.motivation,
    profiel_foto: data.profilePictureUrl || '',
  };
}
