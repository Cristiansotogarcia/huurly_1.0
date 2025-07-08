import { z } from 'zod';

// User validation schemas
export const emailSchema = z.string().email('Ongeldig e-mailadres').min(1, 'E-mailadres is verplicht');

export const passwordSchema = z
  .string()
  .min(8, 'Wachtwoord moet minimaal 8 karakters bevatten')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Wachtwoord moet minimaal één hoofdletter, één kleine letter en één cijfer bevatten');

export const phoneSchema = z
  .string()
  .regex(/^(\+31|0)[1-9][0-9]{8}$/, 'Ongeldig Nederlands telefoonnummer')
  .min(1, 'Telefoonnummer is verplicht');

export const dutchPostalCodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{3} ?[a-zA-Z]{2}$/, 'Ongeldig Nederlandse postcode (bijv. 1234 AB)');

// Tenant profile validation schemas
export const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'Voornaam moet minimaal 2 karakters bevatten').max(50, 'Voornaam mag maximaal 50 karakters bevatten'),
  lastName: z.string().min(2, 'Achternaam moet minimaal 2 karakters bevatten').max(50, 'Achternaam mag maximaal 50 karakters bevatten'),
  email: emailSchema,
  phone: phoneSchema,
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18 && age <= 100;
  }, 'U moet tussen 18 en 100 jaar oud zijn'),
  sex: z.enum(['man', 'vrouw', 'anders']).optional(),
  nationality: z.string().min(2, 'Nationaliteit is verplicht').optional(),
  maritalStatus: z.enum(['alleenstaand', 'getrouwd', 'samenwonend', 'gescheiden', 'weduwe_weduwnaar']).optional(),
});

export const employmentSchema = z.object({
  profession: z.string().min(2, 'Beroep moet minimaal 2 karakters bevatten').max(100, 'Beroep mag maximaal 100 karakters bevatten'),
  employer: z.string().min(2, 'Werkgever moet minimaal 2 karakters bevatten').max(100, 'Werkgever mag maximaal 100 karakters bevatten').optional(),
  employmentStatus: z.enum(['voltijd', 'deeltijd', 'zelfstandig', 'student', 'gepensioneerd', 'werkloos']),
  workContractType: z.enum(['vast', 'tijdelijk', 'freelance', 'stage']).optional(),
  monthlyIncome: z.number().min(500, 'Maandinkomen moet minimaal €500 zijn').max(50000, 'Maandinkomen mag maximaal €50.000 zijn'),
  workFromHome: z.boolean().optional(),
});

export const householdSchema = z.object({
  hasPartner: z.boolean(),
  partnerName: z.string().min(2, 'Partner naam moet minimaal 2 karakters bevatten').max(100, 'Partner naam mag maximaal 100 karakters bevatten').optional(),
  partnerProfession: z.string().min(2, 'Partner beroep moet minimaal 2 karakters bevatten').max(100, 'Partner beroep mag maximaal 100 karakters bevatten').optional(),
  partnerEmploymentStatus: z.enum(['voltijd', 'deeltijd', 'zelfstandig', 'student', 'gepensioneerd', 'werkloos']).optional(),
  partnerMonthlyIncome: z.number().min(0, 'Partner inkomen kan niet negatief zijn').max(50000, 'Partner inkomen mag maximaal €50.000 zijn').optional(),
  hasChildren: z.boolean(),
  numberOfChildren: z.number().min(0, 'Aantal kinderen kan niet negatief zijn').max(10, 'Aantal kinderen mag maximaal 10 zijn').optional(),
  householdSize: z.number().min(1, 'Huishoudgrootte moet minimaal 1 zijn').max(15, 'Huishoudgrootte mag maximaal 15 zijn'),
});

export const housingPreferencesSchema = z.object({
  minBudget: z.number().min(300, 'Minimum budget moet minimaal €300 zijn').max(10000, 'Minimum budget mag maximaal €10.000 zijn'),
  maxBudget: z.number().min(300, 'Maximum budget moet minimaal €300 zijn').max(10000, 'Maximum budget mag maximaal €10.000 zijn'),
  city: z.string().min(2, 'Stad moet minimaal 2 karakters bevatten').max(100, 'Stad mag maximaal 100 karakters bevatten'),
  bedrooms: z.number().min(1, 'Aantal slaapkamers moet minimaal 1 zijn').max(10, 'Aantal slaapkamers mag maximaal 10 zijn'),
  propertyType: z.enum(['appartement', 'eengezinswoning', 'studio', 'kamer', 'penthouse']),
  furnishedPreference: z.enum(['gemeubileerd', 'ongemeubileerd', 'gedeeltelijk_gemeubileerd', 'geen_voorkeur']).optional(),
  parkingRequired: z.boolean().optional(),
  storageNeeds: z.enum(['geen', 'klein', 'groot']).optional(),
  leaseDurationPreference: z.enum(['kort_termijn', 'lang_termijn', 'onbeperkt']).optional(),
}).refine((data) => data.maxBudget >= data.minBudget, {
  message: 'Maximum budget moet groter of gelijk zijn aan minimum budget',
  path: ['maxBudget'],
});

export const timingSchema = z.object({
  moveInDatePreferred: z.string().refine((date) => {
    const moveDate = new Date(date);
    const today = new Date();
    return moveDate >= today;
  }, 'Gewenste verhuisdatum moet in de toekomst liggen'),
  moveInDateEarliest: z.string().refine((date) => {
    const moveDate = new Date(date);
    const today = new Date();
    return moveDate >= today;
  }, 'Vroegste verhuisdatum moet in de toekomst liggen'),
  availabilityFlexible: z.boolean().optional(),
  reasonForMoving: z.string().min(10, 'Reden voor verhuizen moet minimaal 10 karakters bevatten').max(500, 'Reden voor verhuizen mag maximaal 500 karakters bevatten').optional(),
}).refine((data) => {
  const preferredDate = new Date(data.moveInDatePreferred);
  const earliestDate = new Date(data.moveInDateEarliest);
  return preferredDate >= earliestDate;
}, {
  message: 'Gewenste verhuisdatum moet op of na de vroegste verhuisdatum liggen',
  path: ['moveInDatePreferred'],
});

export const guarantorSchema = z.object({
  guarantorAvailable: z.boolean(),
  guarantorName: z.string().min(2, 'Borgsteller naam moet minimaal 2 karakters bevatten').max(100, 'Borgsteller naam mag maximaal 100 karakters bevatten').optional(),
  guarantorPhone: phoneSchema.optional(),
  guarantorIncome: z.number().min(1000, 'Borgsteller inkomen moet minimaal €1.000 zijn').max(100000, 'Borgsteller inkomen mag maximaal €100.000 zijn').optional(),
  guarantorRelationship: z.enum(['ouder', 'familie', 'vriend', 'werkgever', 'anders']).optional(),
  incomeProofAvailable: z.boolean().optional(),
});

export const lifestyleSchema = z.object({
  hasPets: z.boolean(),
  petDetails: z.string().max(200, 'Huisdieren details mogen maximaal 200 karakters bevatten').optional(),
  smokes: z.boolean(),
  smokingDetails: z.string().max(200, 'Roken details mogen maximaal 200 karakters bevatten').optional(),
});

export const motivationSchema = z.object({
  bio: z.string().min(50, 'Bio moet minimaal 50 karakters bevatten').max(1000, 'Bio mag maximaal 1000 karakters bevatten'),
  motivation: z.string().min(100, 'Motivatie moet minimaal 100 karakters bevatten').max(1500, 'Motivatie mag maximaal 1500 karakters bevatten'),
});

// Complete tenant profile schema
export const completeTenantProfileSchema = personalInfoSchema
  .merge(employmentSchema)
  .merge(householdSchema)
  .merge(housingPreferencesSchema)
  .merge(timingSchema)
  .merge(guarantorSchema)
  .merge(lifestyleSchema)
  .merge(motivationSchema);

// Payment validation schemas
export const paymentSchema = z.object({
  amount: z.number().min(1, 'Bedrag moet minimaal €1 zijn').max(10000, 'Bedrag mag maximaal €10.000 zijn'),
  currency: z.enum(['eur']),
  description: z.string().min(1, 'Beschrijving is verplicht').max(200, 'Beschrijving mag maximaal 200 karakters bevatten'),
});

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Wachtwoord is verplicht'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Wachtwoord bevestiging is verplicht'),
  firstName: z.string().min(2, 'Voornaam moet minimaal 2 karakters bevatten').max(50, 'Voornaam mag maximaal 50 karakters bevatten'),
  lastName: z.string().min(2, 'Achternaam moet minimaal 2 karakters bevatten').max(50, 'Achternaam mag maximaal 50 karakters bevatten'),
  phone: phoneSchema,
  agreeToTerms: z.boolean().refine((val) => val === true, 'U moet akkoord gaan met de algemene voorwaarden'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Wachtwoorden komen niet overeen',
  path: ['confirmPassword'],
});

// Document upload schema
export const documentUploadSchema = z.object({
  file: z.object({
    name: z.string().min(1, 'Bestandsnaam is verplicht'),
    size: z.number().max(10 * 1024 * 1024, 'Bestand mag maximaal 10MB zijn'), // 10MB limit
    type: z.string().refine((type) => {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      return allowedTypes.includes(type);
    }, 'Alleen PDF, JPEG en PNG bestanden zijn toegestaan'),
  }),
  documentType: z.enum(['identiteit', 'inkomen', 'referentie', 'uittreksel_bkr', 'arbeidscontract']),
  description: z.string().max(200, 'Beschrijving mag maximaal 200 karakters bevatten').optional(),
});

// Type exports for TypeScript
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Employment = z.infer<typeof employmentSchema>;
export type Household = z.infer<typeof householdSchema>;
export type HousingPreferences = z.infer<typeof housingPreferencesSchema>;
export type Timing = z.infer<typeof timingSchema>;
export type Guarantor = z.infer<typeof guarantorSchema>;
export type Lifestyle = z.infer<typeof lifestyleSchema>;
export type Motivation = z.infer<typeof motivationSchema>;
export type CompleteTenantProfile = z.infer<typeof completeTenantProfileSchema>;
export type Login = z.infer<typeof loginSchema>;
export type Register = z.infer<typeof registerSchema>;
export type DocumentUpload = z.infer<typeof documentUploadSchema>;
export type Payment = z.infer<typeof paymentSchema>;