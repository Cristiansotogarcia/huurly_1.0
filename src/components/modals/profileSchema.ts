import { z } from 'zod';

export const profileSchema = z.object({
  // Step 1: Personal Info
  first_name: z.string().min(1, 'Voornaam is verplicht'),
  last_name: z.string().min(1, 'Achternaam is verplicht'),
  date_of_birth: z.string()
    .min(1, 'Geboortedatum is verplicht')
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Datum moet in dd/mm/jjjj formaat zijn')
    .refine((dateStr) => {
      const [day, month, year] = dateStr.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      
      // Check if the date is valid
      if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
        return false;
      }
      
      // Check if date is not in the future
      if (date > new Date()) {
        return false;
      }
      
      // Check if date is not too old (before 1900)
      if (year < 1900) {
        return false;
      }
      
      return true;
    }, 'Ongeldige geboortedatum'),
  phone: z.string().min(10, 'Ongeldig telefoonnummer'),
  sex: z.enum(['man', 'vrouw', 'anders', 'zeg_ik_liever_niet'], { required_error: 'Geslacht is verplicht' }),
  nationality: z.string().min(1, 'Nationaliteit is verplicht'),
  marital_status: z.enum(['single', 'samenwonend', 'getrouwd', 'gescheiden'], { required_error: 'Burgerlijke staat is verplicht' }),
  
  // Children information
  has_children: z.boolean().default(false),
  number_of_children: z.number().min(0).max(10).optional(),
  children_ages: z.array(z.number().min(0).max(25)).optional(),

  // Step 2: Employment
  profession: z.string().min(1, 'Beroep is verplicht'),
  employer: z.string().min(1, 'Werkgever is verplicht'),
  employment_status: z.enum(['full-time', 'part-time', 'zzp', 'student', 'werkloos'], { required_error: 'Dienstverband is verplicht' }),
  work_contract_type: z.string().optional(),
  monthly_income: z.number().min(0, 'Inkomen mag niet negatief zijn'),
  work_from_home: z.boolean().default(false),
  extra_income: z.number().min(0, 'Extra inkomen mag niet negatief zijn').optional(),
  extra_income_description: z.string().max(200, 'Beschrijving mag maximaal 200 karakters lang zijn').optional(),
  
  // Step 3: Household
  has_partner: z.boolean().default(false),
  partner_name: z.string().optional(),
  partner_profession: z.string().optional(),
  partner_employment_status: z.string().optional(),
  partner_monthly_income: z.number().min(0, 'Partner inkomen mag niet negatief zijn').optional(),

  // Step 4: Housing Preferences
  preferred_city: z.array(z.string()).min(1, 'Minimaal één voorkeursstad is verplicht'),
  preferred_property_type: z.enum(['appartement', 'huis', 'studio', 'kamer', 'penthouse'], { required_error: 'Woningtype is verplicht' }),
  preferred_bedrooms: z.number().min(1, 'Minimaal 1 slaapkamer').optional(),
  furnished_preference: z.enum(['gemeubileerd', 'ongemeubileerd', 'geen_voorkeur']).optional(),
  min_budget: z.number().min(0, "Budget mag niet negatief zijn").optional(),
  max_budget: z.number().min(1, "Budget moet groter dan 0 zijn"),
  min_kamers: z.number().min(1, 'Minimaal 1 kamer').optional(),
  max_kamers: z.number().min(1, 'Minimaal 1 kamer').optional(),
  vroegste_verhuisdatum: z.string().optional(),
  voorkeur_verhuisdatum: z.string().optional(),
  beschikbaarheid_flexibel: z.boolean().default(false),
  parking_required: z.boolean().default(false),
  storage_needs: z.string().optional(),

  // Step 4: Lifestyle (separate component)
  hasPets: z.boolean().default(false),
  pet_details: z.string().optional(),
  smokes: z.boolean().default(false),
  smoking_details: z.string().optional(),

  // Step 8: Profile & Motivation
  profilePictureUrl: z.string().optional(),
  bio: z.string().min(50, 'Bio moet minimaal 50 karakters lang zijn').max(500, 'Bio mag maximaal 500 karakters lang zijn'),
  motivation: z.string().min(50, 'Motivatie moet minimaal 50 karakters lang zijn').max(500, 'Motivatie mag maximaal 500 karakters lang zijn'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;