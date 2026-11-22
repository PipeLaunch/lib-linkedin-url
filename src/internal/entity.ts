import {
  COMPANY_RE,
  DUPLICATED_RE,
  PERSON_RE,
  PROFILE_SLUG_CHAR_RE,
  PROFILE_SLUG_RE,
  PUB_RE,
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

/**
 * Normalizes the percent-encoding of a person, company or school slug, so the
 * raw and encoded spellings of a slug give one result:
 * - an escape run that decodes (as UTF-8) to characters allowed in a slug is
 *   decoded: `cima%C2%AE` -> `cima®`, `%E4%B8%AD` -> `中`;
 * - a decoded character that is not allowed literally (space, `/`, `?`, `<`,
 *   control characters, ...) stays escaped: `jane%20doe` -> `jane%20doe`;
 * - a run that is not valid UTF-8 stays as it is;
 * - every escape that remains is written with uppercase hex digits.
 *
 * Everything outside escapes is returned unchanged (case preserved). The
 * result is a fixed point: normalizing it again returns the same string.
 */
export function normalizeSlug(slug: string): string {
  return slug.replace(/(?:%[0-9a-f]{2})+/gi, (run) => {
    let decoded: string;
    try {
      decoded = decodeURIComponent(run);
    } catch {
      return upperEscapes(run);
    }
    let out = "";
    for (const char of decoded) {
      out += PROFILE_SLUG_CHAR_RE.test(char)
        ? char
        : upperEscapes(encodeURIComponent(char));
    }
    return out;
  });
}

/**
 * Lowercases a normalized slug for a canonical URL, keeping the hex digits of
 * the remaining percent-escapes uppercase.
 */
export function canonicalSlug(slug: string): string {
  return upperEscapes(slug.toLowerCase());
}

/** Matches a LinkedIn profile URL of the given kind. Returns `null` when invalid. */
export function matchEntityUrl(
  url: string,
  kind: EntityKind,
): EntityMatch | null {
  if (!isNonEmptyString(url) || DUPLICATED_RE.test(url)) return null;
  const match = ENTITY_RE[kind].exec(addHttpsIfMissing(url));
  if (!match) return null;
  // Validate the normalized slug as well, so `/in/%C2%AE` is rejected just
  // like `/in/®` (a slug may not start with a symbol).
  const slug = normalizeSlug(match[2] ?? "");
  if (!PROFILE_SLUG_RE.test(slug)) return null;
  return { segment: (match[1] ?? "").toLowerCase(), slug };
}

export interface PubMatch {
  /** The profile name as it appears in the URL (case preserved). */
  name: string;
  /** The three id segments, including their leading slashes (e.g. `/1/638/7a1`). */
  ids: string;
}

/** Matches a legacy numeric `/pub/<name>/<id>/<id>/<id>` profile URL. */
export function matchPubUrl(url: string): PubMatch | null {
  if (!isNonEmptyString(url) || DUPLICATED_RE.test(url)) return null;
  const match = PUB_RE.exec(addHttpsIfMissing(url));
  if (!match) return null;
  return { name: match[1] ?? "", ids: match[2] ?? "" };
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
 * normalized host, lowercased name and id segments.
 * Returns `""` when the URL is not a valid `/pub/` profile URL.
 */
export function canonicalPubUrl(
  url: string,
  options: CanonicalProfileUrlOptions = {},
): string {
  const pub = matchPubUrl(url);
  if (!pub) return "";
  return `https://${canonicalHost(url, options)}/pub/${pub.name.toLowerCase()}${pub.ids.toLowerCase()}`;
}
