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
 * A profile slug: starts with a letter or digit (any script) or a percent-escape,
 * and may continue with those plus combining marks (`\p{M}`: the vowel signs
 * and viramas of Devanagari, Thai, ... and decomposed accents), `&`, `'`, `.`,
 * `_` and `-`.
 *
 * LinkedIn's own vanity-URL rule is "3-100 letters or numbers, no spaces,
 * symbols, or special characters", but real slugs also carry unicode letters,
 * separator punctuation and percent-encoded UTF-8 bytes, so only the character
 * set is validated here, not the length.
 */
const SLUG_CHAR = String.raw`[\p{L}\p{M}\p{Nd}&'._-]`;

const SLUG = String.raw`(?:${PCT}|[\p{L}\p{Nd}])(?:${PCT}|${SLUG_CHAR})*`;

/** A whole, already normalized legacy `/pub/` slug (see `normalizeSlug`). */
export const PUB_SLUG_RE = new RegExp(String.raw`^(?:${SLUG})$`, "iu");

/** A single decoded code point that may appear literally in a legacy `/pub/` slug. */
export const PUB_SLUG_CHAR_RE = new RegExp(String.raw`^${SLUG_CHAR}$`, "u");

/**
 * Symbols that render like `/` or `\` (fraction slash, division slash, set
 * minus, big solidus, box-drawing and mathematical diagonals). Accepted
 * literally, they would make one slug look like two path segments.
 */
const SLASH_LIKE = String.raw`⁄∕∖╱╲⟋⟍⧵-⧹`;

/**
 * A non-ASCII Unicode symbol (`\p{S}`) that is allowed in a slug: `®`, `©` and
 * `™`, plus any other non-ASCII symbol (`°`, `℠`, `€`, ...) that is neither an
 * emoji (`\p{Emoji}`: `😀`, `❤`, regional-indicator flags, skin-tone
 * modifiers) nor slash-like ({@link SLASH_LIKE}). `®`, `©` and `™` carry the
 * Emoji property too, so they are listed explicitly. ASCII symbols (`<`, `>`,
 * `+`, `=`, `|`, `^`, `` ` ``, `$`) stay rejected: LinkedIn never puts them in
 * a slug, and `<`/`>` would let markup through.
 */
const SYMBOL = String.raw`(?:[©®™]|(?![\p{Emoji}${SLASH_LIKE}])[^\P{S}\x00-\x7f])`;

/** One character allowed after the first unit of a person, company or school slug. */
const PROFILE_SLUG_CHAR = String.raw`[\p{L}\p{M}\p{Nd}&'._~-]|${SYMBOL}`;

/**
 * A person, company or school slug: like {@link SLUG}, but it may also contain
 * `~` and non-ASCII symbols (`/in/jane-doe-cfa®`), and may start with any run of
 * `-`/`~` (`/in/-jane-doe-`, `/in/~janedoe`, `/in/jane~doe` are all live
 * profiles). The first unit after that run must be a letter, digit or
 * percent-escape, so `/in/-`, `/in/®`, `/in/-®-` and `/company/~` are rejected.
 * The legacy `/pub/` format keeps the stricter {@link SLUG}.
 */
const PROFILE_SLUG = String.raw`[~-]*(?:${PCT}|[\p{L}\p{Nd}])(?:${PCT}|${PROFILE_SLUG_CHAR})*`;

/** A whole, already normalized person/company/school slug (see `normalizeSlug`). */
export const PROFILE_SLUG_RE = new RegExp(
  String.raw`^(?:${PROFILE_SLUG})$`,
  "iu",
);

/** A single decoded code point that may appear literally in a person/company/school slug. */
export const PROFILE_SLUG_CHAR_RE = new RegExp(
  String.raw`^(?:${PROFILE_SLUG_CHAR})$`,
  "u",
);

/** The slug must fill a whole path segment: only `/`, `?`, `#` or the end may follow it. */
const AFTER_SLUG = String.raw`(?=[/?#]|$)`;

/** Person profiles: `/in/<slug>`, including the mobile `/m/in/` and `/mwlite/in/` variants. */
export const PERSON_RE = new RegExp(
  String.raw`${HOST_PREFIX}(?:mwlite\/|m\/)?(in)\/(${PROFILE_SLUG})${AFTER_SLUG}`,
  "iu",
);

/** Companies: `/company/<slug>`. Also accepts `/school/` (long-standing behavior of the company validator). */
export const COMPANY_RE = new RegExp(
  String.raw`${HOST_PREFIX}(company|school)\/(${PROFILE_SLUG})${AFTER_SLUG}`,
  "iu",
);

/** Schools only: `/school/<slug>`. */
export const SCHOOL_RE = new RegExp(
  String.raw`${HOST_PREFIX}(school)\/(${PROFILE_SLUG})${AFTER_SLUG}`,
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

/**
 * Detects a URL pasted on top of a prefilled one, e.g.
 * `linkedin.com/company/www.linkedin.com/company/foo`: a second
 * `linkedin.com/<profile segment>/` in the path. A slug that merely contains
 * `linkedin.com` (`/company/linkedin.com`) and a `linkedin.com/` inside the
 * query string or fragment are fine.
 */
export const DUPLICATED_RE =
  /^[^?#]*linkedin\.com\/[^?#]*linkedin\.com\/(?:m\/|mwlite\/)?(?:in|company|school|pub)\//i;

/** Detects an existing `http(s)://` protocol prefix. */
export const HAS_PROTOCOL_RE = /^https?:\/\//i;
