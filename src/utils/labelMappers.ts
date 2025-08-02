/**
 * Label Mappers
 * Utilities to map raw database values or enum-like keys to human-readable labels.
 */

// Mapper for employment status (dienstverband)
export const mapEmploymentStatusLabel = (value: string | undefined): string => {
  switch (value) {
    case 'full-time':
    case 'voltijd':
      return 'Voltijd';
    case 'part-time':
    case 'deeltijd':
      return 'Deeltijd';
    case 'contract':
    case 'tijdelijk_contract':
      return 'Tijdelijk Contract';
    case 'freelance':
    case 'zzp':
      return 'ZZP / Freelance';
    case 'internship':
    case 'stage':
      return 'Stage';
    case 'student':
    case 'studentenbaan':
      return 'Studentenbaan';
    case 'retired':
    case 'gepensioneerd':
      return 'Gepensioneerd';
    case 'seeking':
    case 'werkzoekend':
      return 'Werkzoekend';
    default:
      return value || 'N.v.t.'; // Fallback to original value or N.v.t.
  }
};

// Mapper for contract type (can be similar or the same as employment status depending on context)
export const mapContractTypeLabel = (value: string | undefined): string => {
  // If contract type is distinct from employment status, add specific cases here.
  // For now, assuming it might overlap or be the same.
  return mapEmploymentStatusLabel(value);
};

// Mapper for property type (woningtype)
export const mapPropertyTypeLabel = (value: string | undefined): string => {
  switch (value) {
    case 'appartement':
      return 'Appartement';
    case 'huis':
      return 'Huis';
    case 'studio':
      return 'Studio';
    case 'kamer':
      return 'Kamer';
    case 'penthouse':
      return 'Penthouse';
    case 'benedenwoning':
      return 'Benedenwoning';
    case 'tussenwoning':
      return 'Tussenwoning';
    case 'hoekwoning':
      return 'Hoekwoning';
    case 'vrijstaand':
      return 'Vrijstaande Woning';
    default:
      return value || 'N.v.t.';
  }
};

// Mapper for furnished preference (meubilering)
export const mapFurnishedPreferenceLabel = (value: string | undefined): string => {
  switch (value) {
    case 'gemeubileerd':
      return 'Gemeubileerd';
    case 'ongemeubileerd':
      return 'Ongemeubileerd';
    case 'gestoffeerd':
      return 'Gestoffeerd';
    case 'kaal':
      return 'Kaal';
    case 'flexibel':
      return 'Flexibel';
    default:
      return value || 'N.v.t.';
  }
};

// Mapper for lease duration preference (huurcontract_voorkeur)
export const mapLeaseDurationPreferenceLabel = (value: string | undefined): string => {
  switch (value) {
    case '6_maanden':
      return '6 maanden';
    case '1_jaar':
      return '1 jaar';
    case '2_jaar':
      return '2 jaar';
    case 'langer':
      return 'Langer dan 2 jaar';
    case 'flexibel':
    case 'onbepaalde_tijd':
      return 'Flexibel / Onbepaalde tijd';
    default:
      return value || 'N.v.t.';
  }
};

// Mapper for sex (geslacht)
export const mapSexLabel = (value: string | undefined): string => {
  switch (value) {
    case 'man':
    case 'male':
      return 'Man';
    case 'vrouw':
    case 'female':
      return 'Vrouw';
    case 'anders':
    case 'other':
      return 'Anders';
    case 'zeg_ik_liever_niet':
    case 'prefer_not_to_say':
      return 'Zeg ik liever niet';
    default:
      return value || 'N.v.t.';
  }
};

// Mapper for marital status (burgerlijke_staat)
export const mapMaritalStatusLabel = (value: string | undefined): string => {
  switch (value) {
    case 'single':
    case 'ongehuwd':
      return 'Ongehuwd';
    case 'getrouwd':
    case 'married':
      return 'Getrouwd';
    case 'gescheiden':
    case 'divorced':
      return 'Gescheiden';
    case 'samenwonend':
    case 'cohabiting':
      return 'Samenwonend';
    case 'verweduwd':
    case 'widowed':
      return 'Verweduwd';
    default:
      return value || 'N.v.t.';
  }
};

// A generic mapper that can be used if specific mappers aren't needed
// or as a fallback.
export const mapGenericLabel = (
  value: string | undefined,
  mapping: Record<string, string> = {}
): string => {
  if (!value) return 'N.v.t.';
  return mapping[value] || value;
};
