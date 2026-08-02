import { COMPANY_RE, PERSON_RE, PUB_RE, SCHOOL_RE } from "./patterns.ts";
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
  /** The slug exactly as it appears in the URL (case preserved). */
  slug: string;
}

/** Matches a LinkedIn profile URL of the given kind. Returns `null` when invalid. */
export function matchEntityUrl(
  url: string,
  kind: EntityKind,
): EntityMatch | null {
  if (!isNonEmptyString(url)) return null;
  const match = ENTITY_RE[kind].exec(addHttpsIfMissing(url));
  if (!match) return null;
  return {
    segment: (match[1] ?? "").toLowerCase(),
    slug: match[2] ?? "",
  };
}

export interface PubMatch {
  /** The profile name as it appears in the URL (case preserved). */
  name: string;
  /** The three id segments, including their leading slashes (e.g. `/1/638/7a1`). */
  ids: string;
}

/** Matches a legacy numeric `/pub/<name>/<id>/<id>/<id>` profile URL. */
export function matchPubUrl(url: string): PubMatch | null {
  if (!isNonEmptyString(url)) return null;
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
 * original path segment (so `/school/` stays `/school/`), lowercased slug.
 * Returns `""` when the URL is not a valid profile URL of the given kind.
 */
export function canonicalEntityUrl(
  url: string,
  kind: EntityKind,
  options: CanonicalProfileUrlOptions = {},
): string {
  const match = matchEntityUrl(url, kind);
  if (!match) return "";
  return `https://${canonicalHost(url, options)}/${match.segment}/${match.slug.toLowerCase()}`;
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
