import { z } from 'zod';

export const profileSchema = z.object({
  // Step 1: Personal Info
  first_name: z.string().min(1, 'Voornaam is verplicht'),
  last_name: z.string().min(1, 'Achternaam is verplicht'),
  date_of_birth: z.date({
    required_error: 'Geboortedatum is verplicht',
    invalid_type_error: 'Ongeldige datum',
  }),
  phone: z.string().min(10, 'Ongeldig telefoonnummer'),
  sex: z.enum(['man', 'vrouw', 'anders', 'zeg_ik_liever_niet'], { required_error: 'Geslacht is verplicht' }),
  nationality: z.string().min(1, 'Nationaliteit is verplicht'),
  marital_status: z.enum(['single', 'samenwonend', 'getrouwd', 'gescheiden'], { required_error: 'Burgerlijke staat is verplicht' }),

  // Step 2: Employment
  profession: z.string().min(1, 'Beroep is verplicht'),
  employer: z.string().min(1, 'Werkgever is verplicht'),
  employment_status: z.enum(['full-time', 'part-time', 'zzp', 'student', 'werkloos'], { required_error: 'Dienstverband is verplicht' }),
  monthly_income: z.number().min(0, 'Inkomen mag niet negatief zijn'),

  // Step 3: Housing Preferences
  preferred_city: z.string().min(1, 'Voorkeursstad is verplicht'),
  preferred_property_type: z.enum(['appartement', 'huis', 'studio'], { required_error: 'Woningtype is verplicht' }),
  preferred_bedrooms: z.number().min(1, 'Minimaal 1 slaapkamer'),
  maxBudget: z.number().min(1, "Budget moet groter dan 0 zijn"),
  minBudget: z.number().min(0, "Budget mag niet negatief zijn"),

  // Step 4: Lifestyle
  hasPets: z.boolean(),
  pet_details: z.string().optional(),
  smokes: z.boolean(),
  smoking_details: z.string().optional(),

  // Step 5: Motivation
  bio: z.string().min(50, 'Bio moet minimaal 50 karakters lang zijn').max(500, 'Bio mag maximaal 500 karakters lang zijn'),
  motivation: z.string().min(50, 'Motivatie moet minimaal 50 karakters lang zijn').max(500, 'Motivatie mag maximaal 500 karakters lang zijn'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;