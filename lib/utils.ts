export { cn } from "cn"

/**
 * Generate random 6-character shortlink
 * Returns lowercase alphanumeric string
 */
export function generateShortlink(): string {
  return Math.random().toString(36).substring(2, 8).toLowerCase();
}

/**
 * Format date to Indonesian locale
 */
export function formatDateID(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

