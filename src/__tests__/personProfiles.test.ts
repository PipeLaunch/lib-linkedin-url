import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractLinkedInProfileName,
  generateCanonicalLinkedInProfileUrl,
  isValidLinkedInProfileUrl,
} from "../index.ts";
import type { CanonicalPersonProfileUrlOptions } from "../index.ts";

describe("isValidLinkedInProfileUrl", () => {
  const valid = [
    "https://linkedin.com/in/test",
    "http://linkedin.com/in/test",
    "linkedin.com/in/test",
    "LINKEDIN.COM/IN/TEST",
    "https://www.linkedin.com/in/test",
    "https://nl.linkedin.com/in/test",
    "https://linkedin.com/mwlite/in/test",
    "https://linkedin.com/m/in/test",
    "https://linkedin.com/in/à-nous-la-lune-",
    "https://linkedin.com/in/test/10/1",
    "https://www.linkedin.com/in/test?trk=people-guest_people_search-card",
  ];
  for (const url of valid) {
    it(`accepts ${url}`, () => {
      assert.equal(isValidLinkedInProfileUrl(url), true);
    });
  }

  const invalid = [
    "https://https://linkedin.com/in/test",
    "linkedin.com/company/test",
    "https://www.linkedin.com/in",
    "https://nl.linkedin.com/in/",
    "https://linkedin.com/in/",
    "www.test.com/in/test",
    // regression: an empty slug is not a profile
    "https://linkedin.com/in/?trk=x",
    "https://linkedin.com/in//test",
    "https://linkedin.com/mwlite/in/",
    "https://linkedin.com/m/in/",
    // regression: person slugs share the company charset
    "https://linkedin.com/in/a<script>",
    "https://linkedin.com/in/a b c",
    "https://linkedin.com/in/test!",
    // regression: a bare % is not a valid escape
    "https://linkedin.com/in/%",
    "https://linkedin.com/in/test%",
    "https://linkedin.com/in/%GG",
  ];
  for (const url of invalid) {
    it(`rejects ${url}`, () => {
      assert.equal(isValidLinkedInProfileUrl(url), false);
    });
  }

  describe("legacy /pub/ format (numeric option)", () => {
    const validPub = [
      "http://nl.linkedin.com/pub/other-name/11/223/544",
      "de.linkedin.com/pub/frank-rempp/1/638/7a1",
      "https://www.linkedin.com/pub/some-name/1a/2b/3c",
    ];
    for (const url of validPub) {
      it(`accepts ${url} with numeric: true`, () => {
        assert.equal(isValidLinkedInProfileUrl(url, { numeric: true }), true);
      });
      it(`rejects ${url} without the numeric option`, () => {
        assert.equal(isValidLinkedInProfileUrl(url), false);
      });
    }

    // regression: exactly three id segments are required
    const invalidPub = [
      "https://linkedin.com/pub/test/01/01",
      "https://linkedin.com/pub/test",
      "https://linkedin.com/pub/",
    ];
    for (const url of invalidPub) {
      it(`rejects ${url} even with numeric: true`, () => {
        assert.equal(isValidLinkedInProfileUrl(url, { numeric: true }), false);
      });
    }
  });
});

describe("extractLinkedInProfileName", () => {
  const cases: [url: string, expected: string][] = [
    ["https://linkedin.com/in/test", "test"],
    // extraction preserves case; only canonicalization lowercases
    ["https://linkedin.com/in/TEST?test=1", "TEST"],
    ["https://linkedin.com/in/test#home", "test"],
    ["https://linkedin.com/in/test/10/1", "test"],
    ["https://linkedin.com/mwlite/in/test", "test"],
    ["https://linkedin.com/m/in/test", "test"],
    ["linkedin.com/in/test", "test"],
    ["https://linkedin.com/company/test", ""],
    ["https://linkedin.com/in/", ""],
    ["https://linkedin.com/in/?trk=x", ""],
    ["https://linkedin.com/in/a b c", ""],
  ];
  for (const [url, expected] of cases) {
    it(`${url} -> "${expected}"`, () => {
      assert.equal(extractLinkedInProfileName(url), expected);
    });
  }

  describe("legacy /pub/ URLs", () => {
    const url = "http://nl.linkedin.com/pub/other-name/11/223/544";

    it(`${url} with numeric: true -> "other-name"`, () => {
      assert.equal(
        extractLinkedInProfileName(url, { numeric: true }),
        "other-name",
      );
    });

    it(`${url} without the numeric option -> ""`, () => {
      assert.equal(extractLinkedInProfileName(url), "");
    });
  });
});

describe("generateCanonicalLinkedInProfileUrl", () => {
  const cases: [url: string, expected: string][] = [
    ["https://linkedin.com/in/test", "https://linkedin.com/in/test"],
    ["https://linkedin.com/in/TEST", "https://linkedin.com/in/test"],
    ["https://linkedin.com/in/test?test=1", "https://linkedin.com/in/test"],
    ["https://de.linkedin.com/in/test", "https://linkedin.com/in/test"],
    ["https://linkedin.com/mwlite/in/TEST", "https://linkedin.com/in/test"],
    ["https://linkedin.com/company/test", ""],
    ["https://linkedin.com/in/", ""],
  ];
  for (const [url, expected] of cases) {
    it(`${url} -> "${expected}"`, () => {
      assert.equal(generateCanonicalLinkedInProfileUrl(url), expected);
    });
  }

  describe("keepTld", () => {
    const cases: [url: string, expected: string][] = [
      ["https://de.linkedin.com/in/test", "https://de.linkedin.com/in/test"],
      ["https://www.linkedin.com/in/TEST", "https://www.linkedin.com/in/test"],
      ["https://linkedin.com/in/TEST", "https://www.linkedin.com/in/test"],
      // regression: http:// and protocol-less URLs keep their subdomain
      ["http://de.linkedin.com/in/test", "https://de.linkedin.com/in/test"],
      ["de.linkedin.com/in/test", "https://de.linkedin.com/in/test"],
    ];
    for (const [url, expected] of cases) {
      it(`${url} -> "${expected}"`, () => {
        assert.equal(
          generateCanonicalLinkedInProfileUrl(url, { keepTld: true }),
          expected,
        );
      });
    }
  });

  describe("legacy /pub/ URLs", () => {
    const cases: [
      url: string,
      options: CanonicalPersonProfileUrlOptions,
      expected: string,
    ][] = [
      [
        "http://nl.linkedin.com/pub/Other-Name/11/223/54A",
        { numeric: true },
        "https://linkedin.com/pub/other-name/11/223/54a",
      ],
      [
        "http://nl.linkedin.com/pub/other-name/11/223/544",
        { numeric: true, keepTld: true },
        "https://nl.linkedin.com/pub/other-name/11/223/544",
      ],
      ["http://nl.linkedin.com/pub/other-name/11/223/544", {}, ""],
    ];
    for (const [url, options, expected] of cases) {
      it(`${url} ${JSON.stringify(options)} -> "${expected}"`, () => {
        assert.equal(
          generateCanonicalLinkedInProfileUrl(url, options),
          expected,
        );
      });
    }
  });
});
