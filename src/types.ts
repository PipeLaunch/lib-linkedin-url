/**
 * Options for canonical URL generation.
 */
export interface CanonicalProfileUrlOptions {
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
export interface PersonProfileUrlOptions {
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
export interface CanonicalPersonProfileUrlOptions
  extends CanonicalProfileUrlOptions, PersonProfileUrlOptions {}
