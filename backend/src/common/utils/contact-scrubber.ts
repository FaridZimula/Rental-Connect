/**
 * Strips phone numbers, emails, and common obfuscations from free-text fields
 * before they are saved or displayed. This is a core anti-circumvention measure.
 */

const EMAIL_PATTERN = /[\w.+-]+\s*[@＠]\s*[\w.-]+\s*\.\s*\w{2,}/gi;
const PHONE_PATTERNS = [
  /(\+?[\d][\d\s\-().]{6,15}[\d])/g,           // standard international/local numbers
  /\b(zero|one|two|three|four|five|six|seven|eight|nine)\b/gi, // spoken digits
  /\b(naught|oh)\b/gi,
];
const SOCIAL_PATTERNS = [
  /\bwhatsapp\b[\s:]+[\d\s+()-]{6,}/gi,
  /\btelegram\b[\s:@]+\S+/gi,
  /\binstagram\b[\s:@]+\S+/gi,
  /\bfacebook\b[\s:/@]+\S+/gi,
  /\bviber\b[\s:]+[\d\s+()-]{6,}/gi,
];
// Catches spaced-out email: "g m a i l  d o t  c o m"
const SPACED_EMAIL_PATTERN = /([a-z]\s+){3,}(dot|\.)\s*[a-z]{2,}/gi;

export function scrubContactInfo(text: string): string {
  if (!text) return text;

  let result = text;
  result = result.replace(EMAIL_PATTERN, '[contact removed]');
  result = result.replace(SPACED_EMAIL_PATTERN, '[contact removed]');
  for (const p of PHONE_PATTERNS) {
    result = result.replace(p, '[contact removed]');
  }
  for (const p of SOCIAL_PATTERNS) {
    result = result.replace(p, '[contact removed]');
  }
  // "at gmail dot com" style
  result = result.replace(/\bat\b\s+\S+\s+\bdot\b\s+\S+/gi, '[contact removed]');

  return result;
}

export function containsContactInfo(text: string): boolean {
  if (!text) return false;
  const scrubbed = scrubContactInfo(text);
  return scrubbed !== text;
}
