import {
  canonicalEntityUrl,
  canonicalPubUrl,
  matchEntityUrl,
  matchPubUrl,
} from "../internal/entity.ts";
import type {
  CanonicalPersonProfileUrlOptions,
  PersonProfileUrlOptions,
} from "../types.ts";

/**
 * Validates a LinkedIn person profile URL (`/in/<slug>`, including the
 * mobile `/m/in/` and `/mwlite/in/` variants).
 *
 * @param url - LinkedIn profile URL, with or without protocol
 * @param options - set `numeric: true` to also accept the legacy `/pub/<name>/<id>/<id>/<id>` format
 * @returns `true` when the URL is a valid LinkedIn person profile URL
 * @example
 * isValidLinkedInProfileUrl("https://linkedin.com/in/williamhgates"); // true
 * isValidLinkedInProfileUrl("linkedin.com/in/williamhgates"); // true
 * isValidLinkedInProfileUrl("https://linkedin.com/in/"); // false (no slug)
 * isValidLinkedInProfileUrl("http://nl.linkedin.com/pub/other-name/11/223/544", { numeric: true }); // true
 */
export function isValidLinkedInProfileUrl(
  url: string,
  options: PersonProfileUrlOptions = {},
): boolean {
  if (matchEntityUrl(url, "person") !== null) return true;
  return options.numeric === true && matchPubUrl(url) !== null;
}

/**
 * Extracts the profile slug from a LinkedIn person profile URL.
 * The slug is returned exactly as written in the URL (case preserved);
 * only {@link generateCanonicalLinkedInProfileUrl} lowercases.
 *
 * @param url - LinkedIn profile URL, with or without protocol
 * @param options - set `numeric: true` to also extract the name from the legacy `/pub/` format
 * @returns the profile slug, or `""` when the URL is invalid
 * @example
 * extractLinkedInProfileName("https://linkedin.com/in/UserR?view=1"); // "UserR"
 * extractLinkedInProfileName("https://linkedin.com/company/test"); // ""
 */
export function extractLinkedInProfileName(
  url: string,
  options: PersonProfileUrlOptions = {},
): string {
  const match = matchEntityUrl(url, "person");
  if (match) return match.slug;
  if (options.numeric === true) return matchPubUrl(url)?.name ?? "";
  return "";
}

/**
 * Builds the canonical URL of a LinkedIn person profile:
 * `https://linkedin.com/in/<slug>` with a lowercased slug.
 *
 * @param url - LinkedIn profile URL, with or without protocol
 * @param options - `keepTld` keeps the country subdomain (`www` when there is none);
 *   `numeric: true` also canonicalizes legacy `/pub/` URLs
 * @returns the canonical profile URL, or `""` when the URL is invalid
 * @example
 * generateCanonicalLinkedInProfileUrl("de.linkedin.com/in/TEST"); // "https://linkedin.com/in/test"
 * generateCanonicalLinkedInProfileUrl("de.linkedin.com/in/TEST", { keepTld: true }); // "https://de.linkedin.com/in/test"
 */
export function generateCanonicalLinkedInProfileUrl(
  url: string,
  options: CanonicalPersonProfileUrlOptions = {},
): string {
  const canonical = canonicalEntityUrl(url, "person", options);
  if (canonical) return canonical;
  return options.numeric === true ? canonicalPubUrl(url, options) : "";
}
