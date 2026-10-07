/**
 * Normalise an Egyptian / international number to wa.me format (digits only,
 * country code, no leading zeros). "01090459654" → "201090459654".
 */
export function normalizeWhatsappNumber(raw: string, defaultCountryCode = "20"): string {
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits.slice(1).replace(/\D/g, "");
  digits = digits.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith(defaultCountryCode)) return digits;
  if (digits.startsWith("0")) return defaultCountryCode + digits.slice(1);
  return defaultCountryCode + digits;
}

export function whatsappLink(number: string, message?: string): string {
  const base = `https://wa.me/${normalizeWhatsappNumber(number)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Replace {name}, {service}… placeholders in an admin-editable template. */
export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

/** Display format for an Egyptian mobile: 010 9045 9654 */
export function formatPhoneDisplay(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("0")) return `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7)}`;
  return raw;
}
