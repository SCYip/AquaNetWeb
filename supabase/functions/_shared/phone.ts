/**
 * Phone number helpers — mainland China only.
 *
 * Mainland numbers are 11 digits starting with 1, second digit 3–9.
 * We strip leading +86 / 86 / spaces / hyphens before validating.
 */

export const MAINLAND_PHONE_RE = /^1[3-9]\d{9}$/;

export function normalizePhone(raw: string): string {
  let phone = String(raw).trim().replace(/[\s-]/g, "");
  if (phone.startsWith("+86")) phone = phone.slice(3);
  if (phone.startsWith("86") && phone.length === 13) phone = phone.slice(2);
  return phone;
}

export function isValidMainlandPhone(raw: string): boolean {
  return MAINLAND_PHONE_RE.test(normalizePhone(raw));
}

/**
 * Build the synthetic email key used for phone-only Supabase Auth users.
 *
 * Supabase Auth needs *some* identifier to look users up by; we use
 * `<phone>@phone.aquanet.local` because the `.local` TLD is RFC-reserved
 * for local-only use and won't accidentally route real mail. The email
 * is never shown to users and never delivered to.
 */
export function syntheticEmailForPhone(phone: string): string {
  return `${normalizePhone(phone)}@phone.aquanet.local`;
}
