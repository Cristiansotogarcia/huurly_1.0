import { z } from 'zod';

// Location data structure for preferred cities
const LocationDataSchema = z.object({
  name: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radius: z.number().optional()
});

// Step 1: Personal Info - Required fields
export const step1Schema = z.object({
  first_name: z.string().min(1, 'Voornaam is verplicht'),
  last_name: z.string().min(1, 'Achternaam is verplicht'),
  date_of_birth: z.string().refine((dateStr) => {
    // Check if field is empty
    if (!dateStr || dateStr.trim() === '') {
      return false;
    }
    
    // Check format
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      return false;
    }
    
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
  }, 'Geboortedatum is verplicht en moet een geldige datum zijn in dd/mm/jjjj formaat'),
  phone: z.string().min(10, 'Ongeldig telefoonnummer'),
  sex: z.enum(['man', 'vrouw', 'anders', 'zeg_ik_liever_niet'], { required_error: 'Geslacht is verplicht' }),
  nationality: z.string().min(1, 'Nationaliteit is verplicht'),
  marital_status: z.enum(['single', 'samenwonend', 'getrouwd', 'gescheiden'], { required_error: 'Burgerlijke staat is verplicht' }),
});

// Step 2: Employment - Required fields
export const step2Schema = z.object({
  profession: z.string().min(1, 'Beroep is verplicht'),
  employer: z.string().optional(), // Made optional to match UI
  employment_status: z.enum(['full-time', 'part-time', 'zzp', 'student', 'werkloos'], { required_error: 'Dienstverband is verplicht' }),
  monthly_income: z.number().min(1, 'Maandinkomen is verplicht en moet groter dan 0 zijn'),
});

// Step 3: Household - No required fields
export const step3Schema = z.object({});

// Step 4: Housing Preferences - Required fields
export const step4Schema = z.object({
  preferred_city: z.array(LocationDataSchema).min(1, 'Minimaal één voorkeursstad is verplicht'),
  preferred_property_type: z.enum(['appartement', 'huis', 'studio', 'kamer', 'penthouse'], { required_error: 'Woningtype is verplicht' }),
  max_budget: z.number().min(1, "Budget moet groter dan 0 zijn"),
});

// Step 5: Guarantor - No required fields (consolidated from old step 6)
export const step5Schema = z.object({});

// Step 6: References - No required fields (consolidated from old step 7)
export const step6Schema = z.object({});

// Step 7: Profile & Motivation - Required fields (consolidated from old step 8)
export const step7Schema = z.object({
  bio: z.string().min(50, 'Bio moet minimaal 50 karakters lang zijn').max(500, 'Bio mag maximaal 500 karakters lang zijn'),
  motivation: z.string().min(50, 'Motivatie moet minimaal 50 karakters lang zijn').max(500, 'Motivatie mag maximaal 500 karakters lang zijn'),
});

// Array of all step schemas for easy access - now aligned with 7-step UI
export const stepSchemas = [
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
];

// Helper function to get field labels in Dutch
export const getFieldLabel = (fieldName: string): string => {
  const fieldLabels: Record<string, string> = {
    first_name: 'Voornaam',
    last_name: 'Achternaam',
    date_of_birth: 'Geboortedatum',
    phone: 'Telefoonnummer',
    sex: 'Geslacht',
    nationality: 'Nationaliteit',
    marital_status: 'Burgerlijke staat',
    profession: 'Beroep',
    employer: 'Werkgever',
    employment_status: 'Dienstverband',
    monthly_income: 'Maandinkomen',
    preferred_city: 'Voorkeursstad',
    preferred_property_type: 'Woningtype',
    max_budget: 'Maximaal budget',
    bio: 'Bio',
    motivation: 'Motivatie',
  };
  
  return fieldLabels[fieldName] || fieldName;
};