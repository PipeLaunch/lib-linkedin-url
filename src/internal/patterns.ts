/**
 * Shared regex building blocks for LinkedIn URL parsing.
 *
 * All patterns are compiled once at module load. None of them may use the
 * `g` flag: a module-scoped `g` regex keeps `lastIndex` state between calls,
 * which would make `.test()`/`.exec()` results order-dependent.
 */

/** `http(s)://`, optionally `www.` or a 2-letter country subdomain, then `linkedin.com/`. */
const HOST_PREFIX = String.raw`^https?:\/\/(?:(?:www|[a-z]{2})\.)?linkedin\.com\/`;

/** A single valid percent-escape (`%E4`, `%2f`, ...). A bare `%` without two hex digits is rejected. */
const PCT = String.raw`%[0-9a-f]{2}`;

/**
 * A profile slug: starts with a letter (any script), digit or percent-escape,
 * and may continue with those plus `&`, `'`, `.`, `_` and `-`.
 *
 * LinkedIn's own vanity-URL rule is "3-100 letters or numbers, no spaces,
 * symbols, or special characters", but real slugs also carry unicode letters,
 * separator punctuation and percent-encoded UTF-8 bytes, so only the character
 * set is validated here, not the length.
 */
const SLUG = String.raw`(?:${PCT}|[\p{L}0-9])(?:${PCT}|[\p{L}0-9&'._-])*`;

/** The slug must fill a whole path segment: only `/`, `?`, `#` or the end may follow it. */
const AFTER_SLUG = String.raw`(?=[/?#]|$)`;

/** Person profiles: `/in/<slug>`, including the mobile `/m/in/` and `/mwlite/in/` variants. */
export const PERSON_RE = new RegExp(
  String.raw`${HOST_PREFIX}(?:mwlite\/|m\/)?(in)\/(${SLUG})${AFTER_SLUG}`,
  "iu",
);

/** Companies: `/company/<slug>`. Also accepts `/school/` (long-standing behavior of the company validator). */
export const COMPANY_RE = new RegExp(
  String.raw`${HOST_PREFIX}(company|school)\/(${SLUG})${AFTER_SLUG}`,
  "iu",
);

/** Schools only: `/school/<slug>`. */
export const SCHOOL_RE = new RegExp(
  String.raw`${HOST_PREFIX}(school)\/(${SLUG})${AFTER_SLUG}`,
  "iu",
);

/**
 * Legacy numeric person profiles: `/pub/<name>/<id>/<id>/<id>` with exactly
 * three id segments, e.g. `de.linkedin.com/pub/frank-rempp/1/638/7a1`.
 * Gone from linkedin.com (404s since ~2017) but still found in old datasets.
 */
export const PUB_RE = new RegExp(
  String.raw`${HOST_PREFIX}pub\/(${SLUG})((?:\/[a-z0-9]+){3})${AFTER_SLUG}`,
  "iu",
);

/** Captures the 2-letter country subdomain: `https://de.linkedin.com[/...]` -> `de`. `www` never matches. */
export const SUBDOMAIN_RE = /^https?:\/\/([a-z]{2})\.linkedin\.com(?=[/?#]|$)/i;

/** Detects an existing `http(s)://` protocol prefix. */
export const HAS_PROTOCOL_RE = /^https?:\/\//i;
