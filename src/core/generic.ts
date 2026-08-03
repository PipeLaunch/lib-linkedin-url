import { TLD_TABLE } from "../internal/tld.ts";
import { extractSubdomain } from "../internal/util.ts";

/**
 * Extracts the 2-letter country subdomain from a LinkedIn URL.
 *
 * @param url - LinkedIn URL, with or without protocol
 * @returns the lowercased subdomain (e.g. `"de"`), or `""` when there is none (`www` counts as none)
 * @example
 * extractLinkedInSubdomain("https://de.linkedin.com/in/test"); // "de"
 * extractLinkedInSubdomain("https://www.linkedin.com/in/test"); // ""
 */
export function extractLinkedInSubdomain(url: string): string {
  return extractSubdomain(url);
}

/**
 * Derives the English country name from a LinkedIn URL's country subdomain.
 *
 * @param url - LinkedIn URL, with or without protocol
 * @returns the country name (e.g. `"Germany"`), or `""` when the URL has no or an unknown subdomain
 * @example
 * extractCountryName("https://de.linkedin.com/in/test"); // "Germany"
 * extractCountryName("https://www.linkedin.com/in/test"); // ""
 */
export function extractCountryName(url: string): string {
  const subdomain = extractSubdomain(url);
  if (!subdomain) return "";
  return TLD_TABLE[subdomain] ?? "";
}
