
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd MMMM yyyy',
  WITH_TIME: 'dd/MM/yyyy HH:mm',
  SHORT_DATE: 'dd/MM/yyyy', // Added missing format
  LONG_DATE: 'dd MMMM yyyy', // Added missing format
  SHORT_DATETIME: 'dd/MM/yyyy HH:mm', // Added missing format
  LONG_DATETIME: 'dd MMMM yyyy HH:mm', // Added missing format
  TIME_ONLY: 'HH:mm', // Added missing format
  MONTH_YEAR: 'MM/yyyy', // Added missing format
} as const;

export const CURRENCY_FORMAT = {
  LOCALE: 'nl-NL',
  CURRENCY: 'EUR',
  OPTIONS: { // Added missing options
    style: 'currency',
    currency: 'EUR',
  },
} as const;

export const NUMBER_FORMAT = {
  LOCALE: 'nl-NL',
  OPTIONS: { // Added missing options
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
} as const;

export const DOCUMENT_TYPES = {
  IDENTITY: 'identiteit',
  INCOME: 'inkomen',
  REFERENCE: 'referentie',
  BKR: 'uittreksel_bkr',
  CONTRACT: 'arbeidscontract',
} as const;

export const DOCUMENT_STATUS = {
  PENDING: 'wachtend',
  APPROVED: 'goedgekeurd',
  REJECTED: 'afgekeurd',
} as const;

// Added UI text constants
export const UI_TEXT = {
  errors: {
    defaultTitle: 'Er is een fout opgetreden',
    networkError: 'Netwerkfout. Controleer je internetverbinding.',
    serverError: 'Serverfout. Probeer het later opnieuw.',
    authError: 'Authenticatiefout. Log opnieuw in.',
    validationError: 'Validatiefout. Controleer je invoer.',
  },
  buttons: {
    retry: 'Opnieuw proberen',
    cancel: 'Annuleren',
    save: 'Opslaan',
    delete: 'Verwijderen',
    edit: 'Bewerken',
    close: 'Sluiten',
  },
  loading: {
    default: 'Laden...',
    saving: 'Opslaan...',
    deleting: 'Verwijderen...',
    processing: 'Verwerken...',
  },
} as const;
