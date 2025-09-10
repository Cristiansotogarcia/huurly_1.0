import { ProfileFormData } from '@/components/modals/profileSchema';

export const getDefaultProfileValues = (
  initialData?: Partial<ProfileFormData>
): ProfileFormData => {
  const defaults: ProfileFormData = {
    // Step 1: Personal Info
    profilePictureUrl: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone: '',
    sex: 'zeg_ik_liever_niet',
    nationality: 'Nederlandse',
    marital_status: 'single',

    // Children information
    has_children: false,
    number_of_children: 0,
    children_ages: [],

    // Step 2: Employment
    profession: '',
    employer: '',
    employment_status: 'full-time',
    work_contract_type: '',
    monthly_income: 0,
    inkomensbewijs_beschikbaar: false,
    work_from_home: false,
    extra_income: undefined,
    extra_income_description: '',

    // Step 3: Household
    has_partner: false,
    partner_name: '',
    partner_profession: '',
    partner_employment_status: '',
    partner_monthly_income: undefined,

    // Step 4: Housing Preferences
    preferred_city: [],
    preferred_property_type: 'appartement',
    preferred_bedrooms: undefined,
    furnished_preference: undefined,
    min_budget: 1,
    max_budget: 1000,
    min_kamers: undefined,
    max_kamers: undefined,

    // Timing fields
    move_in_date_preferred: undefined,
    move_in_date_earliest: undefined,
    availability_flexible: false,
    lease_duration_preference: undefined,
    parking_required: false,

    // Storage preferences
    storage_kelder: false,
    storage_zolder: false,
    storage_berging: false,
    storage_garage: false,
    storage_schuur: false,
    storage_needed: false,

    // Step 4: Lifestyle
    hasPets: false,
    pet_details: '',
    smokes: false,
    smoking_details: '',

    // Step 5: Guarantor
    borgsteller_beschikbaar: false,
    borgsteller_naam: '',
    borgsteller_relatie: '',
    borgsteller_telefoon: '',
    borgsteller_email: '',
    borgsteller_adres: '',
    borgsteller_inkomen: undefined,

    // Step 6: References & History
    references_available: false,
    rental_history_years: undefined,
    reason_for_moving: '',

    // Step 7: Profile & Motivation
    bio: 'Dit is een standaard bio om te voldoen aan de minimum lengte van 50 karakters. Gelieve dit aan te passen.',
    motivation:
      'Dit is een standaard motivatie om te voldoen aan de minimum lengte van 50 karakters. Gelieve dit aan te passen.',
  };

  const mergedData = initialData ? { ...defaults, ...initialData } : defaults;

  // Ensure required fields have proper values
  if (!mergedData.first_name) mergedData.first_name = '';
  if (!mergedData.last_name) mergedData.last_name = '';
  if (!mergedData.date_of_birth) mergedData.date_of_birth = '';
  if (!mergedData.phone) mergedData.phone = '';
  if (!mergedData.sex) mergedData.sex = 'zeg_ik_liever_niet';
  if (!mergedData.nationality) mergedData.nationality = 'Nederlandse';
  if (!mergedData.marital_status) mergedData.marital_status = 'single';
  if (!mergedData.profession) mergedData.profession = '';
  if (!mergedData.employment_status)
    mergedData.employment_status = 'full-time';
  if (
    mergedData.monthly_income === undefined ||
    mergedData.monthly_income === null
  )
    mergedData.monthly_income = 0;
  if (!mergedData.preferred_property_type)
    mergedData.preferred_property_type = 'appartement';
  if (
    mergedData.max_budget === undefined ||
    mergedData.max_budget === null
  )
    mergedData.max_budget = 1000;
  if (!mergedData.bio || mergedData.bio.length < 50)
    mergedData.bio =
      'Dit is een standaard bio om te voldoen aan de minimum lengte van 50 karakters. Gelieve dit aan te passen.';
  if (!mergedData.motivation || mergedData.motivation.length < 50)
    mergedData.motivation =
      'Dit is een standaard motivatie om te voldoen aan de minimum lengte van 50 karakters. Gelieve dit aan te passen.';
  if (!mergedData.preferred_city || mergedData.preferred_city.length === 0)
    mergedData.preferred_city = [{ name: 'Amsterdam' }];

  return mergedData;
};

