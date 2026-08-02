import { canonicalEntityUrl, matchEntityUrl } from "../internal/entity.ts";
import type { CanonicalProfileUrlOptions } from "../types.ts";

/**
 * Validates a LinkedIn company profile URL (`/company/<slug>`).
 * For backwards compatibility this also accepts school URLs (`/school/<slug>`);
 * use {@link isValidSchoolLinkedInProfileUrl} to match schools only.
 *
 * @param url - LinkedIn company URL, with or without protocol
 * @returns `true` when the URL is a valid LinkedIn company (or school) profile URL
 * @example
 * isValidCompanyLinkedInProfileUrl("https://www.linkedin.com/company/microsoft"); // true
 * isValidCompanyLinkedInProfileUrl("linkedin.com/school/mit"); // true
 * isValidCompanyLinkedInProfileUrl("https://www.linkedin.com/company/a b c"); // false
 */
export function isValidCompanyLinkedInProfileUrl(url: string): boolean {
  return matchEntityUrl(url, "company") !== null;
}

/**
 * Validates a LinkedIn school profile URL (`/school/<slug>`).
 *
 * @param url - LinkedIn school URL, with or without protocol
 * @returns `true` when the URL is a valid LinkedIn school profile URL
 * @example
 * isValidSchoolLinkedInProfileUrl("https://www.linkedin.com/school/mit"); // true
 * isValidSchoolLinkedInProfileUrl("https://www.linkedin.com/company/microsoft"); // false
 */
export function isValidSchoolLinkedInProfileUrl(url: string): boolean {
  return matchEntityUrl(url, "school") !== null;
}

/**
 * Extracts the company (or school) slug from a LinkedIn URL.
 * The slug is returned exactly as written in the URL (case preserved);
 * only {@link generateCanonicalCompanyLinkedInProfileUrl} lowercases.
 *
 * @param url - LinkedIn company or school URL, with or without protocol
 * @returns the profile slug, or `""` when the URL is invalid
 * @example
 * extractCompanyLinkedInProfileName("https://www.linkedin.com/company/microsoft/about/"); // "microsoft"
 * extractCompanyLinkedInProfileName("https://www.linkedin.com/school/mit"); // "mit"
 */
export function extractCompanyLinkedInProfileName(url = ""): string {
  return matchEntityUrl(url, "company")?.slug ?? "";
}

/**
 * Builds the canonical URL of a LinkedIn company profile:
 * `https://linkedin.com/company/<slug>` with a lowercased slug.
 * School URLs keep their `/school/` path segment.
 *
 * @param url - LinkedIn company or school URL, with or without protocol
 * @param options - `keepTld` keeps the country subdomain (`www` when there is none)
 * @returns the canonical profile URL, or `""` when the URL is invalid
 * @example
 * generateCanonicalCompanyLinkedInProfileUrl("linkedin.com/company/Microsoft/about/"); // "https://linkedin.com/company/microsoft"
 * generateCanonicalCompanyLinkedInProfileUrl("https://www.linkedin.com/school/MIT"); // "https://linkedin.com/school/mit"
 */
export function generateCanonicalCompanyLinkedInProfileUrl(
  url: string,
  options: CanonicalProfileUrlOptions = {},
): string {
  return canonicalEntityUrl(url, "company", options);
}

/**
 * Builds the canonical URL of a LinkedIn school profile:
 * `https://linkedin.com/school/<slug>` with a lowercased slug.
 *
 * @param url - LinkedIn school URL, with or without protocol
 * @param options - `keepTld` keeps the country subdomain (`www` when there is none)
 * @returns the canonical school URL, or `""` when the URL is not a school URL
 * @example
 * generateCanonicalSchoolLinkedInProfileUrl("linkedin.com/school/MIT/people/"); // "https://linkedin.com/school/mit"
 */
export function generateCanonicalSchoolLinkedInProfileUrl(
  url: string,
  options: CanonicalProfileUrlOptions = {},
): string {
  return canonicalEntityUrl(url, "school", options);
}
