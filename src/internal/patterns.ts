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
 * slug pass for another. No other symbol is ever kept literally: given
 * encoded, it stays percent-encoded; since 3.1.0 a raw non-ASCII one is
 * percent-encoded too (see {@link RAW_PROFILE_SLUG_CHAR}), so `jane∕doe`
 * gives `jane%E2%88%95doe` and no output shows the lookalike itself. Raw
 * ASCII symbols are not encoded: they are still rejected.
 * Used inside a character class, not as an alternative.
 */
const SYMBOL_CHARS = String.raw`\u00A9\u00AE\u00B0\u2120\u2122`;

/**
 * The letter-like symbols that may also start a person, company or school
 * slug (since 3.1.2): the circled, parenthesized, squared and negative
 * letters and digits that "fancy text" generators produce. They are `\p{So}`
 * or `\p{No}`, not `\p{L}`/`\p{Nd}`, but each stands for one letter or
 * digit, and real slugs are made of them. An example that 3.0.0-3.1.1
 * rejected:
 * `https://www.linkedin.com/in/%E2%93%9E%E2%93%A1%E2%93%90-%E2%93%93%E2%93%9E%E2%93%94-123456789/`
 * (`ⓞⓡⓐ-ⓓⓞⓔ-123456789`).
 *
 * - U+2460-U+24FF, the whole Enclosed Alphanumerics block: `①`, `⑴`, `⒈`,
 *   `⒜`, `Ⓐ`, `ⓐ`, `⓪`, `⓫`, `⓵`;
 * - from Enclosed Alphanumeric Supplement, only the single digit and A-Z
 *   forms: U+1F100-U+1F10C (digit full stop/comma, circled sans-serif
 *   zero), U+1F110-U+1F129 (parenthesized `🄐`), U+1F130-U+1F149 (squared
 *   `🄰`), U+1F150-U+1F169 (negative circled `🅐`), U+1F170-U+1F189
 *   (negative squared `🅰`).
 *
 * Left out: the rest of the supplement, i.e. the circled italic C and R
 * (lookalikes of `©` and `®`), the raised MC/MD/MR marks, the squared
 * abbreviations and words (`🆑`, `🆒`, `🆗`: mostly emoji), and the regional
 * indicators U+1F1E6-U+1F1FF: two in a row render as a flag (`🇩🇪`), so
 * they are emoji, not letters, and an emoji still may not come first.
 *
 * Only the first unit changes. Like any symbol outside {@link SYMBOL_CHARS},
 * these are never kept literally: raw or encoded, each one is a
 * percent-escape in the output (`/in/ⓞx` gives `%E2%93%9Ex`, as `/in/xⓞ`
 * already gave `x%E2%93%9E`), which `hasValidFirstUnit` in entity.ts accepts
 * through {@link LETTERLIKE_FIRST_CHAR_RE}. Used inside a character class,
 * not as an alternative.
 */
const LETTERLIKE_FIRST_CHARS = String.raw`①-⓿\u{1F100}-\u{1F10C}\u{1F110}-\u{1F129}\u{1F130}-\u{1F149}\u{1F150}-\u{1F169}\u{1F170}-\u{1F189}`;

/** A single decoded code point that may start a person/company/school slug as an escape. */
export const LETTERLIKE_FIRST_CHAR_RE = new RegExp(
  String.raw`^[${LETTERLIKE_FIRST_CHARS}]$`,
  "u",
);

/** One character allowed after the first unit of a person, company or school slug. */
const PROFILE_SLUG_CHAR = String.raw`${NOT_VARIATION_SELECTOR}[\p{L}\p{M}\p{Nd}&'._~${SYMBOL_CHARS}-]`;

/**
 * A person, company or school slug: like {@link SLUG}, but it may also contain
 * `~` and the symbols in {@link SYMBOL_CHARS} (`/in/jane-doe-cfa®`), and may start
 * with any run of `-`/`~` (`/in/-jane-doe-`, `/in/~janedoe`, `/in/jane~doe` are
 * all live profiles). The first unit after that run must be a letter, digit or
 * percent-escape, so `/in/-`, `/in/®`, `/in/-®-` and `/company/~` are rejected.
 * After normalization only an undecodable escape, or the escape of one of
 * the {@link LETTERLIKE_FIRST_CHARS}, may come first (see `hasValidFirstUnit`
 * in entity.ts).
 * The legacy `/pub/` format keeps the stricter {@link SLUG}.
 */
const PROFILE_SLUG = String.raw`[~-]*(?:${PCT}|[\p{L}\p{Nd}])(?:${PCT}|${PROFILE_SLUG_CHAR})*`;

/**
 * One character after the first unit of a person, company or school slug as
 * written in the URL, before normalization: a {@link PROFILE_SLUG_CHAR}, or any
 * other non-ASCII code point (U+FE0E/U+FE0F included) that is not whitespace,
 * a control character or an unpaired surrogate. `encodeRawSlugSymbols` in
 * entity.ts then percent-encodes each one {@link PROFILE_SLUG_CHAR} does not
 * admit, so a raw `🔜` gives the same slug as `%F0%9F%94%9C`. Raw ASCII
 * symbols, whitespace (non-ASCII spaces such as U+00A0 and U+3000 included),
 * control characters and unpaired surrogates still end the match, so the URL
 * stays rejected. One character class behind a negative lookahead:
 * `\u0080-\u{10FFFF}` overlaps `\p{L}`, but overlap inside a single class
 * does not backtrack.
 */
const RAW_PROFILE_SLUG_CHAR = String.raw`(?![\p{White_Space}\p{Cc}\p{Cs}])[\p{L}\p{M}\p{Nd}&'._~\u0080-\u{10FFFF}-]`;

/**
 * A person, company or school slug as written in the URL: {@link PROFILE_SLUG}
 * with {@link RAW_PROFILE_SLUG_CHAR} after the first unit. The first unit may
 * also be one of the {@link LETTERLIKE_FIRST_CHARS} (`/in/ⓞⓡⓐ`); any other
 * raw symbol there (`/in/🔜-x`, `/in/-🔜`, `/in/®`) is rejected, like its
 * encoded form. The first unit is still matched exactly once, by a single
 * character class that does not overlap `%` or `[~-]`, so it adds no
 * backtracking.
 */
const RAW_PROFILE_SLUG = String.raw`[~-]*(?:${PCT}|[\p{L}\p{Nd}${LETTERLIKE_FIRST_CHARS}])(?:${PCT}|${RAW_PROFILE_SLUG_CHAR})*`;

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

/**
 * Finds an invisible format character in a normalized person, company or
 * school slug: U+00AD (soft hyphen), U+180E, U+200B, U+200E/U+200F,
 * U+202A-U+202E, U+2060-U+2064, U+2066-U+2069 or U+FEFF. A slug holding one
 * is a copy-paste artefact, so it is rejected (since 3.1.1), raw or encoded.
 * U+200C (ZWNJ, needed in Persian and Indic names) and U+200D (ZWJ, inside
 * emoji sequences) stay allowed.
 *
 * None of these may appear literally in a slug, so after `normalizeSlug`
 * each one is always its UTF-8 escape with uppercase hex, and every lead
 * byte (`C2`, `E1`, `E2`, `EF`) is decoded on its own, so these escape
 * texts only ever spell those characters. Matched on the escapes rather
 * than on decoded text; literal alternatives that are tried once per
 * position, with no repetition, so there is nothing to backtrack into.
 */
export const INVISIBLE_ESCAPE_RE =
  /%(?:C2%AD|E1%A0%8E|E2%80%8[BEF]|E2%80%A[A-E]|E2%81%A[0-46-9]|EF%BB%BF)/;

/** The slug must fill a whole path segment: only `/`, `?`, `#` or the end may follow it. */
const AFTER_SLUG = String.raw`(?=[/?#]|$)`;

/** Person profiles: `/in/<slug>`, including the mobile `/m/in/` and `/mwlite/in/` variants. */
export const PERSON_RE = new RegExp(
  String.raw`${HOST_PREFIX}(?:mwlite\/|m\/)?(in)\/(${RAW_PROFILE_SLUG})${AFTER_SLUG}`,
  "iu",
);

/** Companies: `/company/<slug>`. Also accepts `/school/` (long-standing behavior of the company validator). */
export const COMPANY_RE = new RegExp(
  String.raw`${HOST_PREFIX}(company|school)\/(${RAW_PROFILE_SLUG})${AFTER_SLUG}`,
  "iu",
);

/** Schools only: `/school/<slug>`. */
export const SCHOOL_RE = new RegExp(
  String.raw`${HOST_PREFIX}(school)\/(${RAW_PROFILE_SLUG})${AFTER_SLUG}`,
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
