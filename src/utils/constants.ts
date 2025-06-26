
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd MMMM yyyy',
  WITH_TIME: 'dd/MM/yyyy HH:mm',
} as const;

export const CURRENCY_FORMAT = {
  LOCALE: 'nl-NL',
  CURRENCY: 'EUR',
} as const;

export const NUMBER_FORMAT = {
  LOCALE: 'nl-NL',
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
