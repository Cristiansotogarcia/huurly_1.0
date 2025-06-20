import { DATE_FORMATS, CURRENCY_FORMAT, NUMBER_FORMAT } from './constants';

/**
 * Formats a date according to the specified format
 * 
 * @param date - The date to format (Date object or ISO string)
 * @param format - The format to use (from DATE_FORMATS)
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format: string = DATE_FORMATS.SHORT_DATE): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date provided to formatDate:', date);
    return '';
  }
  
  // Format using Intl.DateTimeFormat for localized dates
  try {
    let options: Intl.DateTimeFormatOptions = {};
    
    // Set options based on format
    switch (format) {
      case DATE_FORMATS.SHORT_DATE:
        options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        break;
      case DATE_FORMATS.LONG_DATE:
        options = { day: 'numeric', month: 'long', year: 'numeric' };
        break;
      case DATE_FORMATS.SHORT_DATETIME:
        options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        break;
      case DATE_FORMATS.LONG_DATETIME:
        options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        break;
      case DATE_FORMATS.TIME_ONLY:
        options = { hour: '2-digit', minute: '2-digit' };
        break;
      case DATE_FORMATS.MONTH_YEAR:
        options = { month: 'long', year: 'numeric' };
        break;
      default:
        options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    }
    
    return new Intl.DateTimeFormat('nl-NL', options).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Formats a number as currency according to Dutch locale
 * 
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, options = CURRENCY_FORMAT.OPTIONS): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '';
  }
  
  try {
    return new Intl.NumberFormat(CURRENCY_FORMAT.LOCALE, options).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return '';
  }
}

/**
 * Formats a number according to Dutch locale
 * 
 * @param value - The number to format
 * @param options - Optional formatting options
 * @returns Formatted number string
 */
export function formatNumber(value: number, options = NUMBER_FORMAT.OPTIONS): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '';
  }
  
  try {
    return new Intl.NumberFormat(NUMBER_FORMAT.LOCALE, options).format(value);
  } catch (error) {
    console.error('Error formatting number:', error);
    return '';
  }
}

/**
 * Formats a percentage value
 * 
 * @param value - The percentage value (0-100)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '';
  }
  
  try {
    return new Intl.NumberFormat(NUMBER_FORMAT.LOCALE, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return '';
  }
}

/**
 * Truncates text to a specified length and adds ellipsis if needed
 * 
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Formats a file size in bytes to a human-readable format
 * 
 * @param bytes - The file size in bytes
 * @param decimals - Number of decimal places
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Formats a phone number according to Dutch format
 * 
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a Dutch mobile number
  if (cleaned.startsWith('31') && cleaned.length === 11) {
    return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
  }
  
  // Check if it's a Dutch mobile number without country code
  if (cleaned.startsWith('6') && cleaned.length === 9) {
    return `+31 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}`;
  }
  
  // Check if it's a Dutch landline number
  if (cleaned.length === 10 && !cleaned.startsWith('6')) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  
  // Return original format if no pattern matches
  return phoneNumber;
}