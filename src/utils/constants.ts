/**
 * UI Text Constants - All Dutch interface text
 * Centralized location for all user-facing text in the Huurly application
 */

export const DATE_FORMATS = {
  SHORT_DATE: 'short_date',
  LONG_DATE: 'long_date',
  SHORT_DATETIME: 'short_datetime',
  LONG_DATETIME: 'long_datetime',
  TIME_ONLY: 'time_only',
  MONTH_YEAR: 'month_year'
};

export const CURRENCY_FORMAT = {
  LOCALE: 'nl-NL',
  OPTIONS: {
    style: 'currency',
    currency: 'EUR'
  }
};

export const NUMBER_FORMAT = {
  LOCALE: 'nl-NL',
  OPTIONS: {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }
};

export const UI_TEXT = {
  // Button labels
  buttons: {
    save: "Opslaan",
    cancel: "Annuleren",
    delete: "Verwijderen",
    edit: "Bewerken",
    add: "Toevoegen",
    upload: "Uploaden",
    search: "Zoeken",
    view: "Bekijken",
    approve: "Goedkeuren",
    reject: "Afwijzen",
    submit: "Versturen",
    close: "Sluiten",
    back: "Terug",
    next: "Volgende",
    previous: "Vorige",
    refresh: "Vernieuwen",
    download: "Downloaden",
    print: "Afdrukken",
    share: "Delen",
    copy: "Kopiëren",
    logout: "Uitloggen",
    login: "Inloggen",
    register: "Registreren"
  },

  // Status labels
  status: {
    pending: "In behandeling",
    approved: "Goedgekeurd",
    rejected: "Afgewezen",
    active: "Actief",
    inactive: "Inactief",
    completed: "Voltooid",
    cancelled: "Geannuleerd",
    draft: "Concept",
    published: "Gepubliceerd",
    archived: "Gearchiveerd",
    expired: "Verlopen",
    new: "Nieuw",
    updated: "Bijgewerkt"
  },

  // Empty state messages
  emptyStates: {
    noProperties: "Nog geen woningen toegevoegd",
    noTenants: "Geen huurders gevonden",
    noDocuments: "Nog geen documenten geüpload",
    noViewings: "Nog geen bezichtigingen gepland",
    noApplications: "Geen aanmeldingen ontvangen",
    noNotifications: "Geen nieuwe notificaties",
    noMessages: "Geen berichten",
    noIssues: "Geen openstaande problemen",
    noUsers: "Nog geen gebruikers geregistreerd",
    noPayments: "Geen betalingen gevonden",
    noReports: "Geen rapporten beschikbaar",
    noData: "Geen gegevens beschikbaar",
    noResults: "Geen resultaten gevonden",
    noContent: "Geen inhoud beschikbaar"
  },

  // Dashboard sections
  dashboard: {
    welcome: "Welkom",
    loading: "Laden...",
    error: "Er is een fout opgetreden",
    retry: "Opnieuw proberen",
    overview: "Overzicht",
    statistics: "Statistieken",
    recentActivity: "Recente activiteit",
    quickActions: "Snelle acties",
    notifications: "Notificaties",
    profile: "Profiel",
    settings: "Instellingen",
    help: "Help",
    support: "Ondersteuning"
  },

  // Form labels and placeholders
  forms: {
    firstName: "Voornaam",
    lastName: "Achternaam",
    email: "E-mailadres",
    phone: "Telefoonnummer",
    address: "Adres",
    city: "Stad",
    postalCode: "Postcode",
    description: "Beschrijving",
    title: "Titel",
    name: "Naam",
    password: "Wachtwoord",
    confirmPassword: "Bevestig wachtwoord",
    dateOfBirth: "Geboortedatum",
    gender: "Geslacht",
    nationality: "Nationaliteit",
    occupation: "Beroep",
    income: "Inkomen",
    message: "Bericht",
    subject: "Onderwerp",
    category: "Categorie",
    priority: "Prioriteit",
    dueDate: "Vervaldatum",
    startDate: "Startdatum",
    endDate: "Einddatum"
  },

  // Property related text
  property: {
    type: "Type woning",
    price: "Huurprijs",
    size: "Oppervlakte",
    rooms: "Kamers",
    bedrooms: "Slaapkamers",
    bathrooms: "Badkamers",
    furnished: "Gemeubileerd",
    unfurnished: "Ongemeubileerd",
    available: "Beschikbaar",
    unavailable: "Niet beschikbaar",
    rented: "Verhuurd",
    forRent: "Te huur",
    deposit: "Borg",
    utilities: "Nutsvoorzieningen",
    parking: "Parkeren",
    garden: "Tuin",
    balcony: "Balkon",
    elevator: "Lift",
    pets: "Huisdieren",
    smoking: "Roken"
  },

  // Document types
  documents: {
    identity: "Identiteitsbewijs",
    payslip: "Loonstrook",
    employmentContract: "Arbeidscontract",
    reference: "Referentie",
    bankStatement: "Bankafschrift",
    taxReturn: "Belastingaangifte",
    diploma: "Diploma",
    other: "Overig"
  },

  // User roles
  roles: {
    huurder: "Huurder",
    verhuurder: "Verhuurder",
    beoordelaar: "Beoordelaar",
    beheerder: "Beheerder"
  },

  // Time and date
  time: {
    today: "Vandaag",
    yesterday: "Gisteren",
    tomorrow: "Morgen",
    thisWeek: "Deze week",
    lastWeek: "Vorige week",
    thisMonth: "Deze maand",
    lastMonth: "Vorige maand",
    thisYear: "Dit jaar",
    lastYear: "Vorig jaar",
    never: "Nooit",
    always: "Altijd",
    soon: "Binnenkort",
    expired: "Verlopen"
  },

  // Success and error messages
  messages: {
    success: {
      saved: "Succesvol opgeslagen",
      updated: "Succesvol bijgewerkt",
      deleted: "Succesvol verwijderd",
      uploaded: "Succesvol geüpload",
      sent: "Succesvol verzonden",
      created: "Succesvol aangemaakt",
      approved: "Succesvol goedgekeurd",
      rejected: "Succesvol afgewezen",
      completed: "Succesvol voltooid"
    },
    error: {
      general: "Er is een fout opgetreden",
      network: "Verbinding mislukt. Probeer het opnieuw.",
      unauthorized: "Geen toegang tot deze gegevens",
      notFound: "Gegevens niet gevonden",
      serverError: "Er is een serverfout opgetreden",
      validation: "Controleer de ingevoerde gegevens",
      required: "Dit veld is verplicht",
      invalid: "Ongeldige invoer",
      tooLarge: "Bestand is te groot",
      unsupported: "Bestandstype wordt niet ondersteund"
    },
    warning: {
      unsavedChanges: "Je hebt niet-opgeslagen wijzigingen",
      deleteConfirm: "Weet je zeker dat je dit wilt verwijderen?",
      irreversible: "Deze actie kan niet ongedaan worden gemaakt",
      expiringSoon: "Verloopt binnenkort",
      incomplete: "Profiel is niet compleet"
    }
  },

  // Navigation
  navigation: {
    home: "Home",
    dashboard: "Dashboard",
    properties: "Woningen",
    tenants: "Huurders",
    landlords: "Verhuurders",
    applications: "Aanmeldingen",
    documents: "Documenten",
    messages: "Berichten",
    calendar: "Agenda",
    reports: "Rapporten",
    analytics: "Analytics",
    users: "Gebruikers",
    payments: "Betalingen",
    settings: "Instellingen",
    help: "Help",
    about: "Over ons",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Voorwaarden"
  }
};

/**
 * Color scheme constants for consistent styling
 */
export const COLORS = {
  primary: "#3B82F6",      // Blue
  secondary: "#6B7280",    // Gray
  success: "#10B981",      // Green
  warning: "#F59E0B",      // Yellow
  danger: "#EF4444",       // Red
  info: "#06B6D4",         // Cyan
  light: "#F9FAFB",        // Light gray
  dark: "#111827",         // Dark gray
  dutchBlue: "#1E40AF",    // Dutch blue
  dutchOrange: "#EA580C"   // Dutch orange
};

/**
 * Typography constants for consistent text styling
 */
export const TYPOGRAPHY = {
  heading1: "text-3xl font-bold text-gray-900",
  heading2: "text-2xl font-bold text-gray-900",
  heading3: "text-xl font-semibold text-gray-800",
  heading4: "text-lg font-semibold text-gray-800",
  body: "text-base text-gray-700",
  bodySmall: "text-sm text-gray-600",
  caption: "text-xs text-gray-500",
  label: "text-sm font-medium text-gray-700",
  link: "text-blue-600 hover:text-blue-800 underline",
  error: "text-red-600",
  success: "text-green-600",
  warning: "text-yellow-600"
};

/**
 * Spacing constants for consistent layout
 */
export const SPACING = {
  xs: "0.25rem",   // 4px
  sm: "0.5rem",    // 8px
  md: "1rem",      // 16px
  lg: "1.5rem",    // 24px
  xl: "2rem",      // 32px
  "2xl": "3rem",   // 48px
  "3xl": "4rem"    // 64px
};

/**
 * Animation constants for consistent transitions
 */
export const ANIMATIONS = {
  fast: "150ms",
  normal: "300ms",
  slow: "500ms",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  ease: "cubic-bezier(0.4, 0, 0.2, 1)"
};
