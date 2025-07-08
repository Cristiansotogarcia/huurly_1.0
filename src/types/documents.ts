// Central document type definitions for Huurly application

export type DocumentType = 
  | 'identiteit'           // Identity documents
  | 'inkomen'             // Income documents  
  | 'referentie'          // Reference documents
  | 'uittreksel_bkr'      // Credit bureau extract
  | 'arbeidscontract';    // Employment contract

export type DocumentStatus = 
  | 'wachtend'            // Pending review
  | 'goedgekeurd'         // Approved
  | 'afgekeurd';          // Rejected

// Document type labels for UI display
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  identiteit: 'Identiteitsbewijs',
  inkomen: 'Inkomensbewijs',
  referentie: 'Referentie',
  uittreksel_bkr: 'BKR Uittreksel',
  arbeidscontract: 'Arbeidscontract'
};

// Document status labels for UI display
export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  wachtend: 'Wachtend op beoordeling',
  goedgekeurd: 'Goedgekeurd',
  afgekeurd: 'Afgekeurd'
};

// Document type descriptions for users
export const DOCUMENT_TYPE_DESCRIPTIONS: Record<DocumentType, string> = {
  identiteit: 'Paspoort, rijbewijs of Nederlandse identiteitskaart',
  inkomen: 'Loonstrook van de afgelopen 3 maanden of jaaropgave',
  referentie: 'Referentiebrief van vorige verhuurder of werkgever',
  uittreksel_bkr: 'Recent BKR-uittreksel (niet ouder dan 3 maanden)',
  arbeidscontract: 'Arbeidscontract of uitzendcontract'
};

// Document requirements for validation
export const DOCUMENT_REQUIREMENTS: Record<DocumentType, {
  required: boolean;
  maxFiles: number;
  description: string;
}> = {
  identiteit: {
    required: true,
    maxFiles: 2,
    description: 'Voor- en achterkant van je identiteitsbewijs'
  },
  inkomen: {
    required: true,
    maxFiles: 3,
    description: 'Laatste 3 loonstroken of jaaropgave'
  },
  referentie: {
    required: false,
    maxFiles: 2,
    description: 'Optionele referentiebrieven'
  },
  uittreksel_bkr: {
    required: true,
    maxFiles: 1,
    description: 'Recent BKR-uittreksel'
  },
  arbeidscontract: {
    required: true,
    maxFiles: 1,
    description: 'Huidig arbeidscontract'
  }
};

// File validation rules
export const FILE_VALIDATION_RULES = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
  allowedMimeTypes: [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

// Document validation helper functions
export const validateDocumentType = (type: string): type is DocumentType => {
  return Object.keys(DOCUMENT_TYPE_LABELS).includes(type as DocumentType);
};

export const validateDocumentStatus = (status: string): status is DocumentStatus => {
  return Object.keys(DOCUMENT_STATUS_LABELS).includes(status as DocumentStatus);
};

export const getDocumentTypeFromLegacy = (legacyType: string): DocumentType => {
  const mapping: Record<string, DocumentType> = {
    'identiteitsbewijs': 'identiteit',
    'loonstrook': 'inkomen',
    'id': 'identiteit',
    'payslip': 'inkomen',
    'income': 'inkomen',
    'reference': 'referentie',
    'bkr': 'uittreksel_bkr',
    'contract': 'arbeidscontract'
  };
  
  return mapping[legacyType.toLowerCase()] || 'identiteit';
};

// Storage folder paths for different document types
export const DOCUMENT_STORAGE_PATHS: Record<DocumentType, string> = {
  identiteit: 'documents/identity',
  inkomen: 'documents/income',
  referentie: 'documents/reference',
  uittreksel_bkr: 'documents/bkr',
  arbeidscontract: 'documents/contract'
};

// Document interface for type safety
export interface Document {
  id: string;
  huurder_id: string;
  beoordelaar_id?: string;
  bestandsnaam: string;
  bestand_url: string;
  beoordeling_notitie?: string;
  type: DocumentType;
  status: DocumentStatus;
  aangemaakt_op: string;
  bijgewerkt_op: string;
}

// Document upload interface
export interface DocumentUploadData {
  type: DocumentType;
  file: File;
  description?: string;
}

// Document review interface
export interface DocumentReviewData {
  status: DocumentStatus;
  notitie?: string;
}