import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractCompanyLinkedInProfileName,
  extractLinkedInProfileName,
  generateCanonicalCompanyLinkedInProfileUrl,
  generateCanonicalLinkedInProfileUrl,
  generateCanonicalSchoolLinkedInProfileUrl,
  isValidCompanyLinkedInProfileUrl,
  isValidLinkedInProfileUrl,
  isValidSchoolLinkedInProfileUrl,
} from "../index.ts";

/**
 * The 2048-character slug limit must hold after NFC and after lowercasing,
 * not only on the input: a slug either is rejected or its canonical URL is
 * valid and canonicalizes to itself.
 */

interface Kind {
  name: string;
  url: (slug: string) => string;
  isValid: (url: string) => boolean;
  extract: (url: string) => string;
  canonical: (url: string) => string;
}

const KINDS: Kind[] = [
  {
    name: "person",
    url: (slug) => `https://linkedin.com/in/${slug}`,
    isValid: (url) => isValidLinkedInProfileUrl(url),
    extract: (url) => extractLinkedInProfileName(url),
    canonical: (url) => generateCanonicalLinkedInProfileUrl(url),
  },
  {
    name: "company",
    url: (slug) => `https://linkedin.com/company/${slug}`,
    isValid: (url) => isValidCompanyLinkedInProfileUrl(url),
    extract: (url) => extractCompanyLinkedInProfileName(url),
    canonical: (url) => generateCanonicalCompanyLinkedInProfileUrl(url),
  },
  {
    name: "school",
    url: (slug) => `https://linkedin.com/school/${slug}`,
    isValid: (url) => isValidSchoolLinkedInProfileUrl(url),
    extract: (url) => extractCompanyLinkedInProfileName(url),
    canonical: (url) => generateCanonicalSchoolLinkedInProfileUrl(url),
  },
  {
    name: "legacy /pub/",
    url: (slug) => `https://linkedin.com/pub/${slug}/1/2/3`,
    isValid: (url) => isValidLinkedInProfileUrl(url, { numeric: true }),
    extract: (url) => extractLinkedInProfileName(url, { numeric: true }),
    canonical: (url) =>
      generateCanonicalLinkedInProfileUrl(url, { numeric: true }),
  },
];

// U+0344 is one code unit but NFC turns it into two (U+0308 U+0301);
// U+0130 (capital I with dot) is one code unit but lowercases to two (i U+0307).
// The boundary cases start with "q": "a" + U+0308 would compose into "ä".
const rejected: [label: string, slug: string][] = [
  ["NFC expands past the limit", "a" + "\u0344".repeat(1100)],
  ["NFC expands just past the limit", "q" + "\u0344".repeat(1024)],
  ["lowercasing expands past the limit", "\u0130".repeat(1025)],
];

const accepted: [label: string, slug: string][] = [
  ["NFC expands to just under the limit", "q" + "\u0344".repeat(1023)],
  ["lowercasing expands to exactly the limit", "\u0130".repeat(1024)],
  ["plain slug at the limit", "a".repeat(2048)],
];

for (const kind of KINDS) {
  describe(`${kind.name}: slug length limit after NFC and lowercasing`, () => {
    for (const [label, slug] of rejected) {
      it(`rejects: ${label} (${String(slug.length)} code units in)`, () => {
        const url = kind.url(slug);
        assert.equal(kind.isValid(url), false);
        assert.equal(kind.extract(url), "");
        assert.equal(kind.canonical(url), "");
      });
    }

    for (const [label, slug] of accepted) {
      it(`accepts and round-trips: ${label}`, () => {
        const url = kind.url(slug);
        assert.equal(kind.isValid(url), true);
        assert.ok(kind.extract(url).length <= 2048);
        const canonical = kind.canonical(url);
        assert.notEqual(canonical, "");
        assert.equal(kind.isValid(canonical), true);
        assert.equal(kind.canonical(canonical), canonical);
        // the extracted slug, put back into a URL, is accepted as well
        assert.equal(kind.isValid(kind.url(kind.extract(url))), true);
      });
    }
  });
}
