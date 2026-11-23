import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractCompanyLinkedInProfileName,
  extractLinkedInProfileName,
  generateCanonicalCompanyLinkedInProfileUrl,
  generateCanonicalLinkedInProfileUrl,
  generateCanonicalSchoolLinkedInProfileUrl,
  isNumericCompanyLinkedInProfileUrl,
  isValidCompanyLinkedInProfileUrl,
  isValidLinkedInProfileUrl,
  isValidSchoolLinkedInProfileUrl,
} from "../index.ts";

/**
 * Since 3.1.1 a person, company or school slug holding an invisible format
 * character (a copy-paste artefact) is rejected, raw or percent-encoded.
 * ZWNJ (U+200C) and ZWJ (U+200D) stay allowed.
 */

const PREFIXES = [
  "https://www.linkedin.com/in/",
  "https://de.linkedin.com/in/",
  "linkedin.com/m/in/",
  "https://linkedin.com/mwlite/in/",
  "https://www.linkedin.com/company/",
  "https://www.linkedin.com/school/",
];

/** Every public result for one URL. */
function results(url: string): Record<string, unknown> {
  return {
    isValid: isValidLinkedInProfileUrl(url),
    isValidNumeric: isValidLinkedInProfileUrl(url, { numeric: true }),
    extract: extractLinkedInProfileName(url),
    canonical: generateCanonicalLinkedInProfileUrl(url),
    canonicalKeepTld: generateCanonicalLinkedInProfileUrl(url, {
      keepTld: true,
    }),
    isValidCompany: isValidCompanyLinkedInProfileUrl(url),
    extractCompany: extractCompanyLinkedInProfileName(url),
    isNumericCompany: isNumericCompanyLinkedInProfileUrl(url),
    canonicalCompany: generateCanonicalCompanyLinkedInProfileUrl(url),
    isValidSchool: isValidSchoolLinkedInProfileUrl(url),
    canonicalSchool: generateCanonicalSchoolLinkedInProfileUrl(url),
  };
}

const REJECTED_RESULT = {
  isValid: false,
  isValidNumeric: false,
  extract: "",
  canonical: "",
  canonicalKeepTld: "",
  isValidCompany: false,
  extractCompany: "",
  isNumericCompany: false,
  canonicalCompany: "",
  isValidSchool: false,
  canonicalSchool: "",
};

function assertRejected(slug: string): void {
  for (const prefix of PREFIXES) {
    for (const suffix of ["", "/", "?trk=x"]) {
      const url = `${prefix}${slug}${suffix}`;
      assert.deepEqual(results(url), REJECTED_RESULT, JSON.stringify(url));
    }
  }
}

/** UTF-8 escapes of a code point, lowercase hex. */
function lowerEncode(char: string): string {
  return encodeURIComponent(char).toLowerCase();
}

const INVISIBLE: [codePoint: number, name: string][] = [
  [0x00ad, "soft hyphen"],
  [0x180e, "Mongolian vowel separator"],
  [0x200b, "zero-width space"],
  [0x200e, "left-to-right mark"],
  [0x200f, "right-to-left mark"],
  [0x202a, "left-to-right embedding"],
  [0x202b, "right-to-left embedding"],
  [0x202c, "pop directional formatting"],
  [0x202d, "left-to-right override"],
  [0x202e, "right-to-left override"],
  [0x2060, "word joiner"],
  [0x2061, "function application"],
  [0x2062, "invisible times"],
  [0x2063, "invisible separator"],
  [0x2064, "invisible plus"],
  [0x2066, "left-to-right isolate"],
  [0x2067, "right-to-left isolate"],
  [0x2068, "first strong isolate"],
  [0x2069, "pop directional isolate"],
  [0xfeff, "byte order mark"],
];

describe("invisible format characters are rejected, raw or encoded", () => {
  for (const [codePoint, name] of INVISIBLE) {
    const char = String.fromCodePoint(codePoint);
    const hex = codePoint.toString(16).toUpperCase().padStart(4, "0");
    it(`U+${hex} (${name}) raw`, () => {
      assertRejected(`jane${char}doe`);
      assertRejected(`jane-doe${char}`);
      assertRejected(`Jane\u{1F51C}${char}`);
    });
    it(`U+${hex} (${name}) percent-encoded`, () => {
      assertRejected(`jane${encodeURIComponent(char)}doe`);
      assertRejected(`jane${lowerEncode(char)}doe`);
      assertRejected(`jane-doe${encodeURIComponent(char)}`);
      assertRejected(`${encodeURIComponent(char)}jane`);
      // an undecodable byte before it does not hide it
      assertRejected(`jane%E2${encodeURIComponent(char)}doe`);
      assertRejected(`jane%FF${lowerEncode(char)}`);
    });
  }

  it("the three examples from the review", () => {
    for (const slug of [
      "jane\u{FEFF}doe",
      "jane%EF%BB%BFdoe",
      "jane\u{200B}doe",
      "jane%E2%80%8Bdoe",
      "jane\u{180E}doe",
      "jane%E1%A0%8Edoe",
    ]) {
      assert.equal(
        generateCanonicalLinkedInProfileUrl(`https://linkedin.com/in/${slug}`),
        "",
      );
    }
  });

  it("a long slug full of them is rejected quickly", () => {
    const url = `https://linkedin.com/in/a${"\u{200B}b".repeat(600)}`;
    const start = performance.now();
    assert.equal(isValidLinkedInProfileUrl(url), false);
    assert.ok(performance.now() - start < 250);
  });
});

describe("neighbouring characters are unaffected", () => {
  // [slug, extracted slug]; raw and encoded spellings agree
  const ACCEPTED: [slug: string, extracted: string][] = [
    // ZWNJ in a Persian name
    [
      "\u{645}\u{6CC}\u{200C}\u{62F}\u{627}\u{646}",
      "\u{645}\u{6CC}%E2%80%8C\u{62F}\u{627}\u{646}",
    ],
    // ZWNJ in a Devanagari name
    ["\u{915}\u{94D}\u{200C}\u{937}-x", "\u{915}\u{94D}%E2%80%8C\u{937}-x"],
    // ZWJ inside emoji sequences
    [
      "dev-\u{1F468}\u{200D}\u{1F4BB}-x",
      "dev-%F0%9F%91%A8%E2%80%8D%F0%9F%92%BB-x",
    ],
    [
      "jane-\u{1F3F3}\u{FE0F}\u{200D}\u{1F308}",
      "jane-%F0%9F%8F%B3%EF%B8%8F%E2%80%8D%F0%9F%8C%88",
    ],
    // code points next to the rejected ranges
    ["jane\u{2065}doe", "jane%E2%81%A5doe"], // unassigned, between U+2064 and U+2066
    ["jane\u{2070}doe", "jane%E2%81%B0doe"], // superscript zero
    ["jane\u{00AC}doe", "jane%C2%ACdoe"], // not sign
  ];
  for (const [slug, extracted] of ACCEPTED) {
    it(`${JSON.stringify(slug)} -> "${extracted}"`, () => {
      for (const prefix of PREFIXES) {
        const raw = `${prefix}${slug}`;
        const encoded = `${prefix}${encodeURIComponent(slug)}`;
        assert.deepEqual(results(raw), results(encoded), raw);
      }
      const url = `https://linkedin.com/in/${slug}`;
      assert.equal(isValidLinkedInProfileUrl(url), true);
      assert.equal(extractLinkedInProfileName(url), extracted);
      const canonical = generateCanonicalLinkedInProfileUrl(url);
      assert.equal(
        canonical,
        `https://linkedin.com/in/${extracted.toLowerCase().replace(/%[0-9a-f]{2}/g, (e) => e.toUpperCase())}`,
      );
      assert.equal(generateCanonicalLinkedInProfileUrl(canonical), canonical);
      assert.equal(
        generateCanonicalSchoolLinkedInProfileUrl(
          `https://linkedin.com/school/${slug}`,
        ),
        canonical.replace("/in/", "/school/"),
      );
    });
  }

  it("legacy /pub/ names are unchanged", () => {
    const opts = { numeric: true };
    assert.equal(
      generateCanonicalLinkedInProfileUrl(
        "linkedin.com/pub/jane%e2%80%8bdoe/1/2/3",
        opts,
      ),
      "https://linkedin.com/pub/jane%E2%80%8Bdoe/1/2/3",
    );
    assert.equal(
      isValidLinkedInProfileUrl("linkedin.com/pub/jane\u{200B}doe/1/2/3", opts),
      false,
    );
  });
});
