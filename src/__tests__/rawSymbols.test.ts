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
 * Since 3.1.0 a raw non-ASCII code point that may not appear literally in a
 * person, company or school slug is percent-encoded (UTF-8, uppercase hex)
 * before validation, so the raw and the `encodeURIComponent` spelling of a
 * slug give the same result from every public function.
 */

/** Every public result for one URL, so two spellings compare in one assertion. */
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

const PREFIXES = [
  "https://www.linkedin.com/in/",
  "https://de.linkedin.com/in/",
  "linkedin.com/m/in/",
  "https://linkedin.com/mwlite/in/",
  "https://www.linkedin.com/company/",
  "https://www.linkedin.com/school/",
];

/** Asserts that the raw and encoded spellings of `slug` agree under every prefix. */
function assertSameAsEncoded(slug: string, suffix = ""): void {
  for (const prefix of PREFIXES) {
    assert.deepEqual(
      results(`${prefix}${slug}${suffix}`),
      results(`${prefix}${encodeURIComponent(slug)}${suffix}`),
      `${prefix}${slug}${suffix}`,
    );
  }
}

describe("raw symbols are percent-encoded like their encoded spelling", () => {
  // live LinkedIn profiles that 3.0.0 rejected raw: [slug, extracted slug]
  const LIVE: [slug: string, encoded: string][] = [
    [
      "jacky-jiang\u{1F51C}-xds-796861111",
      "jacky-jiang%F0%9F%94%9C-xds-796861111",
    ],
    [
      "joão-gabriel-procópio-santos-\u{1F1E7}\u{1F1F7}-\u{1F1EE}\u{1F1F9}-a7043245",
      "joão-gabriel-procópio-santos-%F0%9F%87%A7%F0%9F%87%B7-%F0%9F%87%AE%F0%9F%87%B9-a7043245",
    ],
    ["sofia-heigis-♦️-00b9205", "sofia-heigis-%E2%99%A6%EF%B8%8F-00b9205"],
    ["pcb、pcba", "pcb%E3%80%81pcba"],
    [
      "robert-marking-\u{1F51C}miplondon-05b56513",
      "robert-marking-%F0%9F%94%9Cmiplondon-05b56513",
    ],
  ];
  for (const [slug, encoded] of LIVE) {
    it(`/in/${slug} -> /in/${encoded}`, () => {
      const url = `https://www.linkedin.com/in/${slug}`;
      assert.equal(isValidLinkedInProfileUrl(url), true);
      assert.equal(extractLinkedInProfileName(url), encoded);
      assert.equal(
        generateCanonicalLinkedInProfileUrl(url),
        `https://linkedin.com/in/${encoded}`,
      );
    });

    it(`${slug}: raw == encoded for person, company and school`, () => {
      assertSameAsEncoded(slug);
      assertSameAsEncoded(slug, "/?trk=x");
      assertSameAsEncoded(slug.toUpperCase(), "#about");
    });

    it(`${slug}: the canonical URL is a fixed point`, () => {
      const person = `https://linkedin.com/in/${encoded}`;
      assert.equal(
        generateCanonicalLinkedInProfileUrl(`linkedin.com/in/${slug}`),
        person,
      );
      assert.equal(generateCanonicalLinkedInProfileUrl(person), person);
      for (const kind of ["company", "school"]) {
        const canonical = `https://linkedin.com/${kind}/${encoded}`;
        assert.equal(
          generateCanonicalCompanyLinkedInProfileUrl(
            `linkedin.com/${kind}/${slug}`,
          ),
          canonical,
        );
        assert.equal(
          generateCanonicalCompanyLinkedInProfileUrl(canonical),
          canonical,
        );
      }
    });
  }

  it("company and school variants", () => {
    const slug = "acme\u{1F680}-labs";
    assert.equal(
      generateCanonicalCompanyLinkedInProfileUrl(
        `https://www.linkedin.com/company/${slug}/about/`,
      ),
      "https://linkedin.com/company/acme%F0%9F%9A%80-labs",
    );
    assert.equal(
      extractCompanyLinkedInProfileName("linkedin.com/company/Acme\u{1F680}"),
      "Acme%F0%9F%9A%80",
    );
    assert.equal(
      generateCanonicalSchoolLinkedInProfileUrl(
        `https://www.linkedin.com/school/${slug}`,
        { keepTld: true },
      ),
      "https://www.linkedin.com/school/acme%F0%9F%9A%80-labs",
    );
    assert.equal(
      isValidSchoolLinkedInProfileUrl("linkedin.com/school/uni、x"),
      true,
    );
  });

  it("a raw slash-lookalike stays an escape in the output: jane∕doe", () => {
    const url = "https://linkedin.com/in/jane∕doe";
    assert.equal(extractLinkedInProfileName(url), "jane%E2%88%95doe");
    assert.equal(
      generateCanonicalLinkedInProfileUrl(url),
      "https://linkedin.com/in/jane%E2%88%95doe",
    );
    assertSameAsEncoded("jane∕doe");
    assertSameAsEncoded("jane／doe"); // fullwidth solidus
  });

  it("allowed characters stay literal next to encoded ones", () => {
    const slug = "Café-cfa®-\u{1F51C}©";
    assert.equal(
      extractLinkedInProfileName(`https://linkedin.com/in/${slug}`),
      "Café-cfa®-%F0%9F%94%9C©",
    );
    assertSameAsEncoded(slug);
  });

  const MORE = [
    "dev-\u{1F468}‍\u{1F4BB}-x", // ZWJ sequence, a format character included
    "jane​doe", // zero-width space: a format character, not whitespace
    "jane", // private use
    "jane-\u{1F44D}\u{1F3FB}", // skin tone modifier
    "janeé́\u{1F51C}", // NFC still applies around the escape
    "~jane\u{1F51C}",
    "-jane-\u{1F51C}-",
    "1035\u{1F51C}",
  ];
  for (const slug of MORE) {
    it(`${JSON.stringify(slug)}: raw == encoded`, () => {
      assertSameAsEncoded(slug);
      assert.equal(
        isValidLinkedInProfileUrl(`https://linkedin.com/in/${slug}`),
        true,
      );
    });
  }

  // raw emoji next to escapes already in the URL
  const MIXED: [url: string, slug: string][] = [
    ["jane%FF\u{1F51C}", "jane%FF%F0%9F%94%9C"],
    ["jane%F0%9F\u{1F51C}", "jane%F0%9F%F0%9F%94%9C"],
    ["jane\u{1F51C}%C2%AE", "jane%F0%9F%94%9C®"],
    ["jane\u{1F51C}%ff", "jane%F0%9F%94%9C%FF"],
  ];
  for (const [raw, slug] of MIXED) {
    it(`${JSON.stringify(raw)} -> "${slug}" and matches the fully encoded spelling`, () => {
      const url = `https://linkedin.com/in/${raw}`;
      assert.equal(extractLinkedInProfileName(url), slug);
      assert.equal(
        extractLinkedInProfileName(
          `https://linkedin.com/in/${raw.replace("\u{1F51C}", "%F0%9F%94%9C")}`,
        ),
        slug,
      );
    });
  }
});

describe("raw characters that are still rejected", () => {
  // the encoded spelling is rejected too: raw and encoded agree
  const SAME = [
    "\u{1F51C}-x", // a symbol as the first unit
    "\u{1F51C}",
    "-\u{1F51C}jane",
    "~∕jane",
    "∕jane",
    "️jane",
    "®jane",
  ];
  for (const slug of SAME) {
    it(`rejects ${JSON.stringify(slug)} raw and encoded`, () => {
      assertSameAsEncoded(slug);
      assert.equal(
        isValidLinkedInProfileUrl(`https://linkedin.com/in/${slug}`),
        false,
      );
      assert.equal(
        isValidLinkedInProfileUrl(
          `https://linkedin.com/in/${encodeURIComponent(slug)}`,
        ),
        false,
      );
    });
  }

  // raw whitespace, controls, ASCII symbols, a bare % and unpaired
  // surrogates are left alone and still reject the URL, as in 3.0.0
  const RAW_REJECTED = [
    "jane doe",
    "jane doe", // no-break space
    "jane　doe", // ideographic space
    "jane doe", // line separator
    "jane\u0085doe", // next line (C1 control)
    "jane\u0007doe",
    "jane\tdoe",
    "jane\u{1F51C} doe",
    "jane+doe",
    "jane<doe>",
    "jane=doe",
    "jane|doe",
    "jane!",
    "jane\u{1F51C}!",
    "jane%",
    "jane\u{1F51C}%",
    "jane\uD800", // unpaired high surrogate
    "jane\uDC00doe", // unpaired low surrogate
    "\uD83Djane",
  ];
  for (const slug of RAW_REJECTED) {
    it(`rejects ${JSON.stringify(slug)}`, () => {
      for (const prefix of PREFIXES) {
        const url = `${prefix}${slug}`;
        assert.equal(isValidLinkedInProfileUrl(url), false, url);
        assert.equal(isValidCompanyLinkedInProfileUrl(url), false, url);
        assert.equal(isValidSchoolLinkedInProfileUrl(url), false, url);
        assert.equal(extractLinkedInProfileName(url), "", url);
        assert.equal(generateCanonicalLinkedInProfileUrl(url), "", url);
      }
    });
  }

  it("a raw / ? # still ends the slug before a raw emoji", () => {
    for (const separator of ["/", "?x=", "#"]) {
      assert.equal(
        extractLinkedInProfileName(
          `https://linkedin.com/in/jane${separator}\u{1F51C}`,
        ),
        "jane",
      );
    }
  });

  it("legacy /pub/ names are unchanged: a raw emoji is still rejected", () => {
    const opts = { numeric: true };
    assert.equal(
      isValidLinkedInProfileUrl("linkedin.com/pub/jane\u{1F51C}/1/2/3", opts),
      false,
    );
    assert.equal(
      generateCanonicalLinkedInProfileUrl(
        "linkedin.com/pub/jane%F0%9F%94%9C/1/2/3",
        opts,
      ),
      "https://linkedin.com/pub/jane%F0%9F%94%9C/1/2/3",
    );
  });
});

describe("the length limit applies to the encoded slug", () => {
  it("a raw emoji that takes the encoded slug past 2048 is rejected, like its encoded form", () => {
    const fits = "a".repeat(2036) + "\u{1F51C}"; // 2036 + 12 = 2048 characters encoded
    const over = "a".repeat(2037) + "\u{1F51C}"; // 2049 characters encoded
    assert.equal(
      isValidLinkedInProfileUrl(`https://linkedin.com/in/${fits}`),
      true,
    );
    assert.equal(
      isValidLinkedInProfileUrl(`https://linkedin.com/in/${over}`),
      false,
    );
    assertSameAsEncoded(fits);
    assertSameAsEncoded(over);
  });

  it("a long run of raw emoji is rejected quickly", () => {
    const url = `https://linkedin.com/in/a${"\u{1F51C}".repeat(40000)}`;
    const start = performance.now();
    assert.equal(isValidLinkedInProfileUrl(url), false);
    assert.equal(generateCanonicalCompanyLinkedInProfileUrl(url), "");
    assert.ok(performance.now() - start < 250);
  });

  it("an invalid suffix after many raw symbols and marks is rejected quickly", () => {
    const url = `https://linkedin.com/in/a${"ͅ\u{1F51C}".repeat(150)}!`;
    const start = performance.now();
    assert.equal(isValidLinkedInProfileUrl(url), false);
    assert.ok(performance.now() - start < 250);
  });
});
