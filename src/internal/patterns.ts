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
 * Excludes the variation selectors U+FE0E/U+FE0F from the combining marks a
 * slug may contain. They only switch the text/emoji presentation of the
 * character before them (`❤` + U+FE0F, `©` + U+FE0F), carry no letter of their own and are
 * invisible, so they stay percent-encoded and are rejected literally.
 */
const NOT_VARIATION_SELECTOR = String.raw`(?![\uFE0E\uFE0F])`;

/*
 * Each "one character" pattern below is a SINGLE character class, never an
 * alternation of overlapping classes. Under the `iu` flags some code points
 * match more than one property (U+0345 is both `\p{M}` and, case-folded,
 * `\p{L}`); `(?:[\p{L}]|\p{M})*` then has 2^n ways to match n of them and
 * backtracks exponentially on an invalid suffix (`a` + 25 x U+0345 + `!`).
 */

/** One character allowed after the first unit of a legacy `/pub/` slug. */
const SLUG_CHAR = String.raw`${NOT_VARIATION_SELECTOR}[\p{L}\p{M}\p{Nd}&'._-]`;

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
const SLUG = String.raw`(?:${PCT}|[\p{L}\p{Nd}])(?:${PCT}|${SLUG_CHAR})*`;

/** A whole, already normalized legacy `/pub/` slug (see `normalizeSlug`). */
export const PUB_SLUG_RE = new RegExp(String.raw`^(?:${SLUG})$`, "iu");

/** A single decoded code point that may appear literally in a legacy `/pub/` slug. */
export const PUB_SLUG_CHAR_RE = new RegExp(String.raw`^${SLUG_CHAR}$`, "u");

/**
 * The symbols allowed in a person, company or school slug: the marks LinkedIn
 * issues in credential-style slugs (`cima®`, `acme™`, `acme©`, `acme℠`,
 * `360°`): U+00A9, U+00AE, U+00B0, U+2120, U+2122. An allow-list on purpose:
 * the rest of `\p{S}` holds emoji, slash-lookalikes (`∕`, `⁄`, `⫽`, `⌿`)
 * and lookalikes of ASCII characters (`＜`, `˜`, `´`) that would let one
 * slug pass for another. Any other symbol is rejected literally and stays
 * percent-encoded. Used inside a character class, not as an alternative.
 */
const SYMBOL_CHARS = String.raw`\u00A9\u00AE\u00B0\u2120\u2122`;

/** One character allowed after the first unit of a person, company or school slug. */
const PROFILE_SLUG_CHAR = String.raw`${NOT_VARIATION_SELECTOR}[\p{L}\p{M}\p{Nd}&'._~${SYMBOL_CHARS}-]`;

/**
 * A person, company or school slug: like {@link SLUG}, but it may also contain
 * `~` and the symbols in {@link SYMBOL_CHARS} (`/in/jane-doe-cfa®`), and may start
 * with any run of `-`/`~` (`/in/-jane-doe-`, `/in/~janedoe`, `/in/jane~doe` are
 * all live profiles). The first unit after that run must be a letter, digit or
 * percent-escape, so `/in/-`, `/in/®`, `/in/-®-` and `/company/~` are rejected.
 * After normalization only an undecodable escape may come first (see
 * `hasValidFirstUnit` in entity.ts).
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
