/**
 * Date utility functions for handling date conversions between frontend and database
 */

/**
 * Convert a date string from DD-MM-YYYY format to YYYY-MM-DD format for database storage
 * @param dateString - Date in DD-MM-YYYY format
 * @returns Date in YYYY-MM-DD format or null if invalid
 */
export function convertToISODate(dateString: string): string | null {
  if (!dateString) return null;
  
  // Handle different date formats
  let date: Date;
  
  // Check if it's already in ISO format (YYYY-MM-DD)
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    date = new Date(dateString);
  }
  // Check if it's in DD-MM-YYYY format
  else if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
    const [day, month, year] = dateString.split('-');
    date = new Date(`${year}-${month}-${day}`);
  }
  // Check if it's in DD/MM/YYYY format
  else if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [day, month, year] = dateString.split('/');
    date = new Date(`${year}-${month}-${day}`);
  }
  // Try parsing as-is
  else {
    date = new Date(dateString);
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string provided:', dateString);
    return null;
  }
  
  // Return in YYYY-MM-DD format
  return date.toISOString().split('T')[0];
}

/**
 * Convert a date from database format (YYYY-MM-DD) to frontend format (DD-MM-YYYY)
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Date in DD-MM-YYYY format or empty string if invalid
 */
export function convertFromISODate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string provided:', dateString);
    return '';
  }
  
  // Format as DD-MM-YYYY
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
}

/**
 * Calculate age from birth date
 * @param birthDate - Birth date in any valid format
 * @returns Age in years
 */
export function calculateAge(birthDate: string | Date): number {
  if (!birthDate) return 0;
  
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  
  if (isNaN(birth.getTime())) {
    console.warn('Invalid birth date provided:', birthDate);
    return 0;
  }
  
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Format date for display in Dutch locale
 * @param dateString - Date string in any format
 * @returns Formatted date string in Dutch locale
 */
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return dateString; // Return original if can't parse
  }
  
  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}