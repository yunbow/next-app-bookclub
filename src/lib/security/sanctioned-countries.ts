export const SANCTIONED_COUNTRIES = ["CU", "IR", "KP", "SY", "RU"] as const;

export function isSanctionedCountry(countryCode: string): boolean {
  if (!countryCode) return false;
  return (SANCTIONED_COUNTRIES as readonly string[]).includes(
    countryCode.toUpperCase()
  );
}
