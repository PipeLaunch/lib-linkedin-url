import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractCompanyLinkedInProfileName,
  generateCanonicalCompanyLinkedInProfileUrl,
  generateCanonicalSchoolLinkedInProfileUrl,
  isValidCompanyLinkedInProfileUrl,
  isValidSchoolLinkedInProfileUrl,
} from "../index.ts";

describe("isValidCompanyLinkedInProfileUrl", () => {
  const valid = [
    "https://linkedin.com/company/test",
    "http://linkedin.com/company/test",
    "linkedin.com/company/test",
    "http://www.linkedin.com/company/test",
    "HTTP://WWW.LINKEDIN.COM/COMPANY/TEST",
    "https://www.linkedin.com/company/microsoft/about/",
    "https://www.linkedin.com/company/microsoft?feedView=all",
    "https://www.linkedin.com/company/microsoft/posts/?feedView=all",
    // the company validator historically accepts schools as well
    "http://linkedin.com/school/test",
    "https://www.linkedin.com/company/à-nous-la-lune-",
    "https://www.linkedin.com/company/123456",
    "https://www.linkedin.com/company/schwarz-&-partner-finanzkonsulenten-ag/",
    "https://www.linkedin.com/company/a-&-b?trk=1",
    "https://www.linkedin.com/company/o'neil",
    "https://www.linkedin.com/company/acme_corp",
    "https://www.linkedin.com/company/acme.io",
    "https://cn.linkedin.com/company/%E4%B8%AD%E5%9B%BD%E6%8A%95%E8%B5%84%E6%9C%89%E9%99%90%E8%B4%A3%E4%BB%BB%E5%85%AC%E5%8F%B8",
  ];
  for (const url of valid) {
    it(`accepts ${url}`, () => {
      assert.equal(isValidCompanyLinkedInProfileUrl(url), true);
    });
  }

  const invalid = [
    "linkedin.com/in/test",
    "www.test.com/in/test",
    "https://www.linkedin.com/company/",
    "https://www.linkedin.com/school/",
    "https://www.linkedin.com/schol/test",
    // the whole slug has to be valid, not just its first characters
    "https://www.linkedin.com/company/a<script>",
    "https://www.linkedin.com/company/a b c",
    "https://www.linkedin.com/company/test!",
    "https://www.linkedin.com/company/&&&&",
    // regression: a % must be part of a valid %XX escape
    "https://www.linkedin.com/company/%",
    "https://www.linkedin.com/company/%%%%",
    "https://www.linkedin.com/company/%GG",
    "https://www.linkedin.com/company/test%",
  ];
  for (const url of invalid) {
    it(`rejects ${url}`, () => {
      assert.equal(isValidCompanyLinkedInProfileUrl(url), false);
    });
  }
});

describe("isValidSchoolLinkedInProfileUrl", () => {
  const valid = [
    "https://linkedin.com/school/test",
    "http://linkedin.com/school/test",
    "linkedin.com/school/test",
    "http://www.linkedin.com/school/test",
    "HTTP://WWW.LINKEDIN.COM/school/TEST",
    "https://www.linkedin.com/school/king's-college-london/",
  ];
  for (const url of valid) {
    it(`accepts ${url}`, () => {
      assert.equal(isValidSchoolLinkedInProfileUrl(url), true);
    });
  }

  const invalid = [
    "linkedin.com/in/test",
    "www.test.com/in/test",
    // a company URL is not a school URL
    "https://www.linkedin.com/company/test",
    "https://www.linkedin.com/school/",
    "https://www.linkedin.com/schol/test",
    "https://www.linkedin.com/school/a<script>",
  ];
  for (const url of invalid) {
    it(`rejects ${url}`, () => {
      assert.equal(isValidSchoolLinkedInProfileUrl(url), false);
    });
  }
});

describe("extractCompanyLinkedInProfileName", () => {
  const cases: [url: string, expected: string][] = [
    ["https://linkedin.com/company/test", "test"],
    // extraction preserves case; only canonicalization lowercases
    ["https://linkedin.com/company/TEST?test=1", "TEST"],
    ["https://linkedin.com/company/test#home", "test"],
    ["https://linkedin.com/company/test/10/1", "test"],
    ["https://linkedin.com/company/123456", "123456"],
    [
      "https://www.linkedin.com/company/schwarz-&-partner-finanzkonsulenten-ag/",
      "schwarz-&-partner-finanzkonsulenten-ag",
    ],
    ["https://www.linkedin.com/school/mit", "mit"],
    // pinned behavior: unicode and percent-encoded forms round-trip verbatim (never equated)
    [
      "https://www.linkedin.com/company/中国投资有限责任公司/",
      "中国投资有限责任公司",
    ],
    [
      "https://cn.linkedin.com/company/%E4%B8%AD%E5%9B%BD%E6%8A%95%E8%B5%84%E6%9C%89%E9%99%90%E8%B4%A3%E4%BB%BB%E5%85%AC%E5%8F%B8",
      "%E4%B8%AD%E5%9B%BD%E6%8A%95%E8%B5%84%E6%9C%89%E9%99%90%E8%B4%A3%E4%BB%BB%E5%85%AC%E5%8F%B8",
    ],
    ["https://www.linkedin.com/company/", ""],
    ["https://www.linkedin.com/company//", ""],
    ["https://linkedin.com/in/test", ""],
    ["https://www.linkedin2com/company/test", ""],
    ["https://www.linkedin.com/company/a<script>", ""],
  ];
  for (const [url, expected] of cases) {
    it(`${url} -> "${expected}"`, () => {
      assert.equal(extractCompanyLinkedInProfileName(url), expected);
    });
  }
});

describe("generateCanonicalCompanyLinkedInProfileUrl", () => {
  const cases: [url: string, expected: string][] = [
    ["https://linkedin.com/company/test", "https://linkedin.com/company/test"],
    ["https://linkedin.com/company/TEST", "https://linkedin.com/company/test"],
    [
      "https://linkedin.com/company/test?test=1",
      "https://linkedin.com/company/test",
    ],
    [
      "https://www.linkedin.com/company/Schwarz-&-Partner-Finanzkonsulenten-AG/",
      "https://linkedin.com/company/schwarz-&-partner-finanzkonsulenten-ag",
    ],
    // regression: school URLs keep their /school/ path segment
    ["https://www.linkedin.com/school/MIT", "https://linkedin.com/school/mit"],
    ["https://linkedin.com/in/test", ""],
    ["https://www.linkedin.com/company/", ""],
  ];
  for (const [url, expected] of cases) {
    it(`${url} -> "${expected}"`, () => {
      assert.equal(generateCanonicalCompanyLinkedInProfileUrl(url), expected);
    });
  }

  describe("keepTld", () => {
    const cases: [url: string, expected: string][] = [
      [
        "https://de.linkedin.com/company/test",
        "https://de.linkedin.com/company/test",
      ],
      [
        "https://www.linkedin.com/company/TEST",
        "https://www.linkedin.com/company/test",
      ],
      [
        "https://linkedin.com/company/TEST",
        "https://www.linkedin.com/company/test",
      ],
      // regression: http:// and protocol-less URLs keep their subdomain
      [
        "http://de.linkedin.com/company/test",
        "https://de.linkedin.com/company/test",
      ],
      ["de.linkedin.com/company/test", "https://de.linkedin.com/company/test"],
    ];
    for (const [url, expected] of cases) {
      it(`${url} -> "${expected}"`, () => {
        assert.equal(
          generateCanonicalCompanyLinkedInProfileUrl(url, { keepTld: true }),
          expected,
        );
      });
    }
  });
});

describe("generateCanonicalSchoolLinkedInProfileUrl", () => {
  const cases: [url: string, expected: string][] = [
    ["https://linkedin.com/school/MIT", "https://linkedin.com/school/mit"],
    ["linkedin.com/school/MIT/people/", "https://linkedin.com/school/mit"],
    [
      "https://www.linkedin.com/school/king's-college-london/",
      "https://linkedin.com/school/king's-college-london",
    ],
    // a company URL is not a school URL
    ["https://linkedin.com/company/test", ""],
    ["https://linkedin.com/school/", ""],
  ];
  for (const [url, expected] of cases) {
    it(`${url} -> "${expected}"`, () => {
      assert.equal(generateCanonicalSchoolLinkedInProfileUrl(url), expected);
    });
  }

  it("keeps the country subdomain with keepTld", () => {
    assert.equal(
      generateCanonicalSchoolLinkedInProfileUrl(
        "http://de.linkedin.com/school/TEST",
        { keepTld: true },
      ),
      "https://de.linkedin.com/school/test",
    );
  });
});
