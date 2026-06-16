const GMAIL_DOMAIN_PATTERN = /^[^\s@]+@(gmail\.com|googlemail\.com)$/i;

export function isGmailEmail(value: string): boolean {
  return GMAIL_DOMAIN_PATTERN.test(value.trim());
}

export const GMAIL_REQUIRED_MESSAGE =
  'Debes usar una cuenta de Gmail (por ejemplo: tu@gmail.com)';
