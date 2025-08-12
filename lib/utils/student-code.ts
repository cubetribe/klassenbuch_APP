import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique, anonymous student code
 * Format: YYYY-CC-XXXX where:
 * - YYYY: Current year
 * - CC: Course identifier (first 2 chars of course ID)
 * - XXXX: Random alphanumeric string
 */
export function generateStudentCode(courseId: string): string {
  const year = new Date().getFullYear();
  const coursePrefix = courseId.substring(0, 2).toUpperCase();
  const randomSuffix = generateRandomString(4);
  
  return `${year}-${coursePrefix}-${randomSuffix}`;
}

/**
 * Generates a random alphanumeric string
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Validates a student code format
 */
export function isValidStudentCode(code: string): boolean {
  const pattern = /^\d{4}-[A-Z0-9]{2}-[A-Z0-9]{4}$/;
  return pattern.test(code);
}

/**
 * Generates initials from a display name
 * Used for privacy mode in board view
 */
export function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/);
  
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return parts
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}