import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { extractCountryName, extractLinkedInSubdomain } from "../index.ts";

describe("extractLinkedInSubdomain", () => {
  const cases: [url: string, expected: string][] = [
    ["https://linkedin.com/company/test", ""],
    ["https://www.linkedin.com/company/test", ""],
    ["https://de.linkedin.com/company/test", "de"],
    ["HTTPS://DE.LINKEDIN.COM/COMPANY/TEST", "de"],
    // regression: http://, protocol-less and path-less URLs all work
    ["http://de.linkedin.com/in/test", "de"],
    ["de.linkedin.com/in/test", "de"],
    ["https://de.linkedin.com", "de"],
    ["https://de.linkedin.com?trk=1", "de"],
    // only real 2-letter subdomains match
    ["https://abc.linkedin.com/in/test", ""],
    ["https://12.linkedin.com/in/test", ""],
    ["htts://de.linkedin.com/in/test", ""],
    ["https://de.linkedin2com/in/test", ""],
  ];
  for (const [url, expected] of cases) {
    it(`${url} -> "${expected}"`, () => {
      assert.equal(extractLinkedInSubdomain(url), expected);
    });
  }
});

describe("extractCountryName", () => {
  const cases: [url: string, expected: string][] = [
    ["https://linkedin.com/company/test", ""],
    ["https://www.linkedin.com/company/test", ""],
    ["https://de.linkedin.com/company/test", "Germany"],
    ["https://uk.linkedin.com/in/test", "United Kingdom"],
    // regression: http:// works
    ["http://de.linkedin.com/in/test", "Germany"],
    // pinned behavior: an unknown subdomain yields "", not a default country
    ["https://zz.linkedin.com/in/test", ""],
  ];
  for (const [url, expected] of cases) {
    it(`${url} -> "${expected}"`, () => {
      assert.equal(extractCountryName(url), expected);
    });
  }
});
