/**
 * Kenyan Phone Number & M-Pesa Helpers
 * Handles formatting for Eldoret / Kenya numbers (07XX, 01XX, +254)
 */

export function normalizeKenyanPhone(phone: string): string {
  if (!phone) return '';
  // Remove all non-digits except leading +
  let cleaned = phone.trim().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+254')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned;
  }

  return cleaned;
}

export function formatKenyanPhoneDisplay(phone: string): string {
  if (!phone) return '';
  const normalized = normalizeKenyanPhone(phone);
  if (normalized.length === 12 && normalized.startsWith('254')) {
    return `+254 ${normalized.slice(3, 6)} ${normalized.slice(6, 9)} ${normalized.slice(9)}`;
  }
  return phone;
}

export function isValidKenyanPhone(phone: string): boolean {
  const normalized = normalizeKenyanPhone(phone);
  // Valid Kenyan mobile numbers are 12 digits: 254 7XX XXX XXX or 254 1XX XXX XXX
  return /^254[71]\d{8}$/.test(normalized);
}

export function generateMpesaReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'CSL';
  for (let i = 0; i < 7; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

export function generateOrderNumber(): string {
  const prefix = 'CSL';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
}
