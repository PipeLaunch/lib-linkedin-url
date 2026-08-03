import { HAS_PROTOCOL_RE, SUBDOMAIN_RE } from "./patterns.ts";

/** Type guard shared by every public entry point: rejects non-strings and "". */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value !== "";
}

/** Prefixes `https://` when the URL does not carry an `http(s)://` protocol yet. */
export function addHttpsIfMissing(url: string): string {
  if (!isNonEmptyString(url)) return "";
  return HAS_PROTOCOL_RE.test(url) ? url : `https://${url}`;
}

/** Returns the lowercased 2-letter country subdomain of a LinkedIn URL, or `""`. */
export function extractSubdomain(url: string): string {
  if (!isNonEmptyString(url)) return "";
  const match = SUBDOMAIN_RE.exec(addHttpsIfMissing(url));
  return match?.[1]?.toLowerCase() ?? "";
}
