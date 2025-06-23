export const UI_TEXT = {
  buttons: {
    save: 'Opslaan',
    cancel: 'Annuleren',
    delete: 'Verwijderen',
    edit: 'Bewerken',
    add: 'Toevoegen',
    upload: 'Uploaden',
    search: 'Zoeken',
    view: 'Bekijken',
    approve: 'Goedkeuren',
    reject: 'Afwijzen',
    submit: 'Verzenden',
    close: 'Sluiten',
    back: 'Terug',
    next: 'Volgende',
    previous: 'Vorige',
    continue: 'Doorgaan',
    finish: 'Voltooien',
    start: 'Starten',
    stop: 'Stoppen',
    pause: 'Pauzeren',
    resume: 'Hervatten',
    login: 'Inloggen',
    logout: 'Uitloggen',
    register: 'Registreren',
    retry: 'Opnieuw proberen',
  },
  errors: {
    defaultTitle: 'Er is een fout opgetreden',
    networkError: 'Netwerkfout - controleer je internetverbinding',
    serverError: 'Serverfout - probeer het later opnieuw',
    validationError: 'Validatiefout in het formulier',
    notFound: 'De gevraagde resource is niet gevonden',
    unauthorized: 'Je bent niet geautoriseerd voor deze actie',
    forbidden: 'Toegang geweigerd',
    timeout: 'De aanvraag duurde te lang',
    generic: 'Er is een onbekende fout opgetreden',
  },
  loading: {
    default: 'Laden...',
    saving: 'Opslaan...',
    uploading: 'Uploaden...',
    processing: 'Verwerken...',
  },
  empty: {
    noData: 'Geen gegevens beschikbaar',
    noResults: 'Geen resultaten gevonden',
    noDocuments: 'Geen documenten gevonden',
    noNotifications: 'Geen notificaties',
  },
  success: {
    saved: 'Succesvol opgeslagen',
    uploaded: 'Succesvol geüpload',
    deleted: 'Succesvol verwijderd',
    updated: 'Succesvol bijgewerkt',
  },
  navigation: {
    dashboard: 'Dashboard',
    profile: 'Profiel',
    documents: 'Documenten',
    settings: 'Instellingen',
    help: 'Help',
  },
} as const;

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  HUURDER_DASHBOARD: '/huurder-dashboard',
  VERHUURDER_DASHBOARD: '/verhuurder-dashboard',
  BEOORDELAAR_DASHBOARD: '/beoordelaar-dashboard',
  BEHEERDER_DASHBOARD: '/beheerder-dashboard',
  PROFILE: '/profile',
  DOCUMENTS: '/documents',
  SETTINGS: '/settings',
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
  PAYMENT_SUCCESS: '/payment-success',
} as const;

export const DOCUMENT_TYPES = {
  IDENTITY: 'identiteit',
  PAYSLIP: 'loonstrook',
  EMPLOYMENT_CONTRACT: 'arbeidscontract',
  REFERENCE: 'referentie',
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export const USER_ROLES = {
  HUURDER: 'huurder',
  VERHUURDER: 'verhuurder',
  BEOORDELAAR: 'beoordelaar',
  BEHEERDER: 'beheerder',
} as const;
