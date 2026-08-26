/** Keep only digits and a leading 0 for BD mobiles (handles pasted +880…). */
export function normalizeBdMobile(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length >= 11) {
    return `0${digits.slice(3, 14)}`.slice(0, 11);
  }
  if (digits.startsWith("88") && digits.length >= 11) {
    return `0${digits.slice(2, 13)}`.slice(0, 11);
  }
  return digits.slice(0, 11);
}

export function digitsOnly(raw: string, maxLength: number): string {
  return raw.replace(/\D/g, "").slice(0, maxLength);
}
