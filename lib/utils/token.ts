import * as crypto from 'crypto';

/**
 * Generates a cryptographically secure random token
 * @returns A 64-character hexadecimal string
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Checks if a token has expired
 * @param expiry - The expiration date of the token
 * @returns True if the token is expired or expiry is null, false otherwise
 */
export function isTokenExpired(expiry: Date | null): boolean {
  if (!expiry) return true;
  return new Date() > expiry;
}

/**
 * Calculates the expiry date for a token
 * @param hours - Number of hours until expiration
 * @returns A Date object representing the expiry time
 */
export function getTokenExpiry(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
