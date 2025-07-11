/**
 * Shared validation utilities for consistent validation across the application
 * Provides reusable validation functions with Dutch error messages
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email validation with Dutch error message
 */
export const validateEmail = (email: string): FieldValidationResult => {
  if (!email) {
    return { isValid: false, error: 'E-mailadres is verplicht' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Ongeldig e-mailadres' };
  }
  
  return { isValid: true };
};

/**
 * Phone number validation with Dutch error message
 */
export const validatePhone = (phone: string): FieldValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Telefoonnummer is verplicht' };
  }
  
  // Dutch phone number patterns
  const phoneRegex = /^(\+31|0031|0)[1-9][0-9]{8}$/;
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Ongeldig Nederlands telefoonnummer' };
  }
  
  return { isValid: true };
};

/**
 * Postal code validation (Dutch format)
 */
export const validatePostalCode = (postalCode: string): FieldValidationResult => {
  if (!postalCode) {
    return { isValid: false, error: 'Postcode is verplicht' };
  }
  
  const postalCodeRegex = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;
  if (!postalCodeRegex.test(postalCode)) {
    return { isValid: false, error: 'Ongeldige postcode (bijv. 1234 AB)' };
  }
  
  return { isValid: true };
};

/**
 * Price validation
 */
export const validatePrice = (price: number, min: number = 0, max: number = 10000): FieldValidationResult => {
  if (price === undefined || price === null) {
    return { isValid: false, error: 'Prijs is verplicht' };
  }
  
  if (isNaN(price) || price < min) {
    return { isValid: false, error: `Prijs moet minimaal €${min} zijn` };
  }
  
  if (price > max) {
    return { isValid: false, error: `Prijs mag maximaal €${max} zijn` };
  }
  
  return { isValid: true };
};

/**
 * Text length validation
 */
export const validateTextLength = (
  text: string,
  fieldName: string,
  minLength: number = 0,
  maxLength: number = 1000
): FieldValidationResult => {
  if (!text && minLength > 0) {
    return { isValid: false, error: `${fieldName} is verplicht` };
  }
  
  if (text && text.length < minLength) {
    return { isValid: false, error: `${fieldName} moet minimaal ${minLength} karakters bevatten` };
  }
  
  if (text && text.length > maxLength) {
    return { isValid: false, error: `${fieldName} mag maximaal ${maxLength} karakters bevatten` };
  }
  
  return { isValid: true };
};

/**
 * Date validation
 */
export const validateDate = (date: string, fieldName: string, futureOnly: boolean = false): FieldValidationResult => {
  if (!date) {
    return { isValid: false, error: `${fieldName} is verplicht` };
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: `${fieldName} is geen geldige datum` };
  }
  
  if (futureOnly && dateObj < new Date()) {
    return { isValid: false, error: `${fieldName} moet in de toekomst liggen` };
  }
  
  return { isValid: true };
};

/**
 * Age validation (for birth date)
 */
export const validateAge = (birthDate: string, minAge: number = 18, maxAge: number = 120): FieldValidationResult => {
  if (!birthDate) {
    return { isValid: false, error: 'Geboortedatum is verplicht' };
  }
  
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) {
    return { isValid: false, error: 'Ongeldige geboortedatum' };
  }
  
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) ? age - 1 : age;
  
  if (actualAge < minAge) {
    return { isValid: false, error: `Minimale leeftijd is ${minAge} jaar` };
  }
  
  if (actualAge > maxAge) {
    return { isValid: false, error: `Maximale leeftijd is ${maxAge} jaar` };
  }
  
  return { isValid: true };
};

/**
 * File validation
 */
export const validateFile = (
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf'],
  maxSizeMB: number = 5
): FieldValidationResult => {
  if (!file) {
    return { isValid: false, error: 'Bestand is verplicht' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes.map(type => {
      switch (type) {
        case 'image/jpeg': return 'JPG';
        case 'image/png': return 'PNG';
        case 'application/pdf': return 'PDF';
        default: return type;
      }
    }).join(', ');
    return { isValid: false, error: `Alleen ${allowedExtensions} bestanden zijn toegestaan` };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: `Bestand mag maximaal ${maxSizeMB}MB groot zijn` };
  }
  
  return { isValid: true };
};

/**
 * Password strength validation
 */
export const validatePassword = (password: string): FieldValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Wachtwoord is verplicht' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Wachtwoord moet minimaal 8 karakters bevatten' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const criteriaMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  if (criteriaMet < 3) {
    return {
      isValid: false,
      error: 'Wachtwoord moet minimaal 3 van de volgende bevatten: hoofdletter, kleine letter, cijfer, speciaal teken'
    };
  }
  
  return { isValid: true };
};

/**
 * Comprehensive object validation
 */
export const validateObject = <T extends Record<string, any>>(
  data: T,
  validationRules: Partial<Record<keyof T, (value: any) => FieldValidationResult>>
): ValidationResult => {
  const errors: string[] = [];
  
  for (const [field, validator] of Object.entries(validationRules)) {
    if (validator && typeof validator === 'function') {
      const result = validator(data[field]);
      if (!result.isValid && result.error) {
        errors.push(result.error);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Required fields validation
 */
export const validateRequiredFields = <T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[],
  customFieldNames?: Partial<Record<keyof T, string>>
): ValidationResult => {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      const fieldName = customFieldNames?.[field] || String(field);
      errors.push(`${fieldName} is verplicht`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize input data
 */
export const sanitizeInput = <T extends Record<string, any>>(data: T): T => {
  const sanitized = { ...data } as T;
  
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      // Trim whitespace and remove potentially harmful characters
      (sanitized as any)[key] = value.trim().replace(/[<>"']/g, '');
    }
  }
  
  return sanitized;
};

/**
 * Common validation presets
 */
export const ValidationPresets = {
  userProfile: {
    voornaam: (value: string) => validateTextLength(value, 'Voornaam', 1, 50),
    achternaam: (value: string) => validateTextLength(value, 'Achternaam', 1, 50),
    email: validateEmail,
    telefoon: validatePhone,
  },
  
  property: {
    titel: (value: string) => validateTextLength(value, 'Titel', 5, 100),
    adres: (value: string) => validateTextLength(value, 'Adres', 5, 200),
    stad: (value: string) => validateTextLength(value, 'Stad', 2, 50),
    huurprijs: (value: number) => validatePrice(value, 100, 5000),
    postcode: validatePostalCode,
  },
  
  document: {
    file: (value: File) => validateFile(value, ['image/jpeg', 'image/png', 'application/pdf'], 10),
  },
};