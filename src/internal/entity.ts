import {
  COMPANY_RE,
  DUPLICATED_RE,
  PERSON_RE,
  PROFILE_SLUG_CHAR_RE,
  PROFILE_SLUG_RE,
  PUB_RE,
  PUB_SLUG_CHAR_RE,
  PUB_SLUG_RE,
  SCHOOL_RE,
} from "./patterns.ts";
import {
  addHttpsIfMissing,
  extractSubdomain,
  isNonEmptyString,
} from "./util.ts";
import type { CanonicalProfileUrlOptions } from "../types.ts";

/** The LinkedIn entity kinds this library can parse. */
export type EntityKind = "person" | "company" | "school";

const ENTITY_RE: Record<EntityKind, RegExp> = {
  person: PERSON_RE,
  // The company matcher accepts /school/ URLs as well (long-standing behavior).
  company: COMPANY_RE,
  school: SCHOOL_RE,
};

export interface EntityMatch {
  /** Lowercased path segment: `"in"`, `"company"` or `"school"`. */
  segment: string;
  /** The normalized slug (see {@link normalizeSlug}), case preserved. */
  slug: string;
}

/** Uppercases the hex digits of every percent-escape: `%c2%ae` -> `%C2%AE`. */
function upperEscapes(text: string): string {
  return text.replace(/%[0-9a-f]{2}/gi, (escape) => escape.toUpperCase());
}

const UTF8 = new TextEncoder();

/**
 * Percent-encodes every UTF-8 byte of `char` with uppercase hex. Unlike
 * `encodeURIComponent`, it also escapes `~ ! * ( )`, so a decoded character
 * that is not allowed in a slug always goes back to escapes (`%21`, `%7E`).
 */
function percentEncode(char: string): string {
  let out = "";
  for (const byte of UTF8.encode(char)) {
    out += `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
  }
  return out;
}

/**
 * The longest slug (as written in the URL, escapes included) that is parsed.
 * LinkedIn vanity names are at most 100 characters, which is at most 1200
 * characters fully percent-encoded (4 UTF-8 bytes x 3 characters each); 2048
 * leaves room for generated suffixes. The bound matters for NFC, whose
 * reordering of long runs of combining marks grows quadratically: 2048
 * characters cost about 2 ms in the worst case, 80 000 cost seconds.
 */
export const MAX_SLUG_LENGTH = 2048;

/**
 * Normalizes the percent-encoding of a slug, so the raw and encoded spellings
 * of a slug give one result. `allowed` tests one decoded code point: the
 * person/company/school character set by default, {@link PUB_SLUG_CHAR_RE}
 * for legacy `/pub/` names.
 *
 * - an escape run that decodes (as UTF-8) to characters allowed in a slug is
 *   decoded: `cima%C2%AE` -> `cima®`, `%E4%B8%AD` -> `中`;
 * - a decoded character that is not allowed literally (space, `/`, `?`, `<`,
 *   control characters, ...) stays escaped: `jane%20doe` -> `jane%20doe`;
 * - each byte that does not start a valid UTF-8 sequence stays escaped on its
 *   own, without blocking the bytes around it: `jane%C2%AE%FF` -> `jane®%FF`;
 * - every escape that remains is written with uppercase hex digits;
 * - the text outside escapes is put in Unicode NFC, so a decomposed accent
 *   (`cafe%CC%81`, or a raw `e` + U+0301) and the composed one (`café`) give
 *   the same slug.
 *
 * Case is preserved. The result is a fixed point: normalizing it again
 * returns the same string.
 *
 * A slug longer than {@link MAX_SLUG_LENGTH} characters returns `""`, which
 * no slug pattern accepts, so the URL is rejected before NFC runs.
 */
export function normalizeSlug(
  slug: string,
  allowed: RegExp = PROFILE_SLUG_CHAR_RE,
): string {
  if (slug.length > MAX_SLUG_LENGTH) return "";
  return nfcOutsideEscapes(
    slug.replace(/(?:%[0-9a-f]{2})+/gi, (run) => decodeEscapeRun(run, allowed)),
  );
}

/**
 * Applies NFC to each stretch of text between percent-escapes, never across
 * one: a combining mark after a kept escape must not compose with its hex
 * digit (`%FA` + U+0301 would otherwise become `%FÁ`).
 */
function nfcOutsideEscapes(text: string): string {
  return text
    .split(/(%[0-9a-f]{2})/i)
    .map((part, index) => (index % 2 === 1 ? part : part.normalize("NFC")))
    .join("");
}

/** Length of the UTF-8 sequence a lead byte starts, or 0 when it cannot start one. */
function utf8SequenceLength(byte: number): number {
  if (byte < 0x80) return 1;
  if (byte >= 0xc2 && byte <= 0xdf) return 2;
  if (byte >= 0xe0 && byte <= 0xef) return 3;
  if (byte >= 0xf0 && byte <= 0xf4) return 4;
  return 0;
}

/**
 * Decodes a run of `%XX` escapes one UTF-8 sequence at a time. A sequence that
 * is not valid (bad lead byte, missing or wrong continuation bytes, overlong
 * form, surrogate) leaves only its lead byte escaped; decoding resumes at the
 * next byte.
 */
function decodeEscapeRun(run: string, allowed: RegExp): string {
  const escapes = run.match(/%[0-9a-f]{2}/gi) ?? [];
  let out = "";
  let i = 0;
  while (i < escapes.length) {
    const decoded = decodeSequenceAt(escapes, i);
    if (decoded) {
      out += allowed.test(decoded.char)
        ? decoded.char
        : percentEncode(decoded.char);
      i += decoded.length;
    } else {
      out += (escapes[i] ?? "").toUpperCase();
      i += 1;
    }
  }
  return out;
}

/**
 * Decodes the UTF-8 sequence that starts at `escapes[i]`. Returns `null` when
 * it is not a valid sequence (bad lead byte, missing or wrong continuation
 * bytes, overlong form, surrogate).
 */
function decodeSequenceAt(
  escapes: readonly string[],
  i: number,
): { char: string; length: number } | null {
  const length = utf8SequenceLength(parseInt((escapes[i] ?? "").slice(1), 16));
  if (length === 0 || i + length > escapes.length) return null;
  try {
    // decodeURIComponent rejects overlong forms, surrogates and bad
    // continuation bytes, so a successful decode is one valid code point.
    const char = decodeURIComponent(escapes.slice(i, i + length).join(""));
    return { char, length };
  } catch {
    return null;
  }
}

/**
 * Checks the first unit of a normalized slug (after any leading `-`/`~`).
 * The slug pattern accepts a percent-escape there, but after normalization an
 * escape that still decodes to a character is one that may not appear
 * literally (space, `/`, an emoji, a lookalike symbol, U+FE0F, ...). Such a
 * slug is rejected, exactly like its raw form; only an escape that is not
 * valid UTF-8 may start a slug.
 */
function hasValidFirstUnit(slug: string): boolean {
  const run = /^[~-]*((?:%[0-9a-f]{2})+)/i.exec(slug)?.[1];
  if (!run) return true;
  return decodeSequenceAt(run.match(/%[0-9a-f]{2}/gi) ?? [], 0) === null;
}

/**
 * Lowercases a normalized slug for a canonical URL, keeping the hex digits of
 * the remaining percent-escapes uppercase. NFC is re-applied because
 * lowercasing can leave a string that is no longer in NFC.
 */
export function canonicalSlug(slug: string): string {
  return nfcOutsideEscapes(upperEscapes(slug.toLowerCase()));
}

/**
 * Checks a normalized slug against {@link MAX_SLUG_LENGTH} after every
 * transformation that can lengthen it. {@link normalizeSlug} only bounds the
 * input, but NFC can expand a character (`̈́` -> `̈́`) and so
 * can lowercasing (`İ` -> `i̇`). Requiring both the normalized slug and
 * its canonical form to fit keeps the round trip intact: a canonical URL
 * always passes the input limit again and normalizes to itself.
 */
function fitsLengthLimit(slug: string): boolean {
  return (
    slug.length <= MAX_SLUG_LENGTH &&
    canonicalSlug(slug).length <= MAX_SLUG_LENGTH
  );
}

/**
 * Percent-encodes (UTF-8, uppercase hex) every raw non-ASCII code point of a
 * person, company or school slug that may not appear literally in it
 * (`jacky-jiang🔜` -> `jacky-jiang%F0%9F%94%9C`, `jane∕doe` ->
 * `jane%E2%88%95doe`), so the raw spelling normalizes exactly like the
 * encoded one. ASCII characters are left alone: the slug pattern already
 * admits only the allowed ones. The slug pattern never captures whitespace,
 * control characters or unpaired surrogates, so none reach this function.
 *
 * The {@link MAX_SLUG_LENGTH} check of {@link normalizeSlug} then applies to
 * the encoded result; a longer input returns `""` before any encoding.
 */
function encodeRawSlugSymbols(slug: string): string {
  if (slug.length > MAX_SLUG_LENGTH) return "";
  return slug.replace(/[^\0-\x7F]/gu, (char) =>
    PROFILE_SLUG_CHAR_RE.test(char) ? char : percentEncode(char),
  );
}

/** Matches a LinkedIn profile URL of the given kind. Returns `null` when invalid. */
export function matchEntityUrl(
  url: string,
  kind: EntityKind,
): EntityMatch | null {
  if (!isNonEmptyString(url) || DUPLICATED_RE.test(url)) return null;
  const match = ENTITY_RE[kind].exec(addHttpsIfMissing(url));
  if (!match) return null;
  // Validate the normalized slug as well, so `/in/%C2%AE` and `/in/%20jane`
  // are rejected just like `/in/®` and `/in/ jane`.
  const slug = normalizeSlug(encodeRawSlugSymbols(match[2] ?? ""));
  if (
    !PROFILE_SLUG_RE.test(slug) ||
    !hasValidFirstUnit(slug) ||
    !fitsLengthLimit(slug)
  ) {
    return null;
  }
  return { segment: (match[1] ?? "").toLowerCase(), slug };
}

export interface PubMatch {
  /** The normalized profile name (see {@link normalizeSlug}), case preserved. */
  name: string;
  /** The three id segments, including their leading slashes (e.g. `/1/638/7a1`). */
  ids: string;
}

/** Matches a legacy numeric `/pub/<name>/<id>/<id>/<id>` profile URL. */
export function matchPubUrl(url: string): PubMatch | null {
  if (!isNonEmptyString(url) || DUPLICATED_RE.test(url)) return null;
  const match = PUB_RE.exec(addHttpsIfMissing(url));
  if (!match) return null;
  // Re-check after decoding, so `/pub/%2Djane/...` and `/pub/%C2%AEjane/...`
  // are rejected like `/pub/-jane/...` and `/pub/®jane/...`.
  const name = normalizeSlug(match[1] ?? "", PUB_SLUG_CHAR_RE);
  if (
    !PUB_SLUG_RE.test(name) ||
    !hasValidFirstUnit(name) ||
    !fitsLengthLimit(name)
  ) {
    return null;
  }
  return { name, ids: match[2] ?? "" };
}

/** The canonical host: `linkedin.com`, or `<subdomain|www>.linkedin.com` with `keepTld`. */
export function canonicalHost(
  url: string,
  options: CanonicalProfileUrlOptions,
): string {
  if (!options.keepTld) return "linkedin.com";
  return `${extractSubdomain(url) || "www"}.linkedin.com`;
}

/**
 * Builds the canonical `https://` URL for a matched entity: normalized host,
 * original path segment (so `/school/` stays `/school/`), normalized and
 * lowercased slug (remaining percent-escapes keep uppercase hex digits).
 * Returns `""` when the URL is not a valid profile URL of the given kind.
 */
export function canonicalEntityUrl(
  url: string,
  kind: EntityKind,
  options: CanonicalProfileUrlOptions = {},
): string {
  const match = matchEntityUrl(url, kind);
  if (!match) return "";
  return `https://${canonicalHost(url, options)}/${match.segment}/${canonicalSlug(match.slug)}`;
}

/**
 * Builds the canonical `https://` URL for a legacy `/pub/` profile:
 * normalized host, normalized and lowercased name (remaining percent-escapes
 * keep uppercase hex), lowercased id segments.
 * Returns `""` when the URL is not a valid `/pub/` profile URL.
 */
export function canonicalPubUrl(
  url: string,
  options: CanonicalProfileUrlOptions = {},
): string {
  const pub = matchPubUrl(url);
  if (!pub) return "";
  return `https://${canonicalHost(url, options)}/pub/${canonicalSlug(pub.name)}${pub.ids.toLowerCase()}`;
}
