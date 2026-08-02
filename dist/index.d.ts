/**
 * Options for canonical URL generation.
 */
interface CanonicalProfileUrlOptions {
    /**
     * Keep the country subdomain of the input URL (e.g. `de.linkedin.com`)
     * instead of normalizing the host to `linkedin.com`. URLs without a
     * country subdomain canonicalize to `www.linkedin.com`.
     * @default false
     */
    keepTld?: boolean;
}
/**
 * Options for person profile URL validation and extraction.
 */
interface PersonProfileUrlOptions {
    /**
     * Also accept the legacy numeric `/pub/<name>/<id>/<id>/<id>` format.
     * These URLs are gone from linkedin.com (they 404 since ~2017) but still
     * appear in old datasets.
     * @default false
     */
    numeric?: boolean;
}
/**
 * Options for canonical person profile URL generation.
 */
interface CanonicalPersonProfileUrlOptions extends CanonicalProfileUrlOptions, PersonProfileUrlOptions {
}

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
declare function isValidLinkedInProfileUrl(url: string, options?: PersonProfileUrlOptions): boolean;
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
declare function extractLinkedInProfileName(url: string, options?: PersonProfileUrlOptions): string;
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
declare function generateCanonicalLinkedInProfileUrl(url: string, options?: CanonicalPersonProfileUrlOptions): string;

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
declare function isValidCompanyLinkedInProfileUrl(url: string): boolean;
/**
 * Validates a LinkedIn school profile URL (`/school/<slug>`).
 *
 * @param url - LinkedIn school URL, with or without protocol
 * @returns `true` when the URL is a valid LinkedIn school profile URL
 * @example
 * isValidSchoolLinkedInProfileUrl("https://www.linkedin.com/school/mit"); // true
 * isValidSchoolLinkedInProfileUrl("https://www.linkedin.com/company/microsoft"); // false
 */
declare function isValidSchoolLinkedInProfileUrl(url: string): boolean;
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
declare function extractCompanyLinkedInProfileName(url?: string): string;
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
declare function generateCanonicalCompanyLinkedInProfileUrl(url: string, options?: CanonicalProfileUrlOptions): string;
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
declare function generateCanonicalSchoolLinkedInProfileUrl(url: string, options?: CanonicalProfileUrlOptions): string;

/**
 * Extracts the 2-letter country subdomain from a LinkedIn URL.
 *
 * @param url - LinkedIn URL, with or without protocol
 * @returns the lowercased subdomain (e.g. `"de"`), or `""` when there is none (`www` counts as none)
 * @example
 * extractLinkedInSubdomain("https://de.linkedin.com/in/test"); // "de"
 * extractLinkedInSubdomain("https://www.linkedin.com/in/test"); // ""
 */
declare function extractLinkedInSubdomain(url: string): string;
/**
 * Derives the English country name from a LinkedIn URL's country subdomain.
 *
 * @param url - LinkedIn URL, with or without protocol
 * @returns the country name (e.g. `"Germany"`), or `""` when the URL has no or an unknown subdomain
 * @example
 * extractCountryName("https://de.linkedin.com/in/test"); // "Germany"
 * extractCountryName("https://www.linkedin.com/in/test"); // ""
 */
declare function extractCountryName(url: string): string;

export { type CanonicalPersonProfileUrlOptions, type CanonicalProfileUrlOptions, type PersonProfileUrlOptions, extractCompanyLinkedInProfileName, extractCountryName, extractLinkedInProfileName, extractLinkedInSubdomain, generateCanonicalCompanyLinkedInProfileUrl, generateCanonicalLinkedInProfileUrl, generateCanonicalSchoolLinkedInProfileUrl, isValidCompanyLinkedInProfileUrl, isValidLinkedInProfileUrl, isValidSchoolLinkedInProfileUrl };
