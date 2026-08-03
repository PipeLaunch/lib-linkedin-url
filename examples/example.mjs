// ESM smoke test: exercises the built ESM bundle (dist/index.mjs).
// Run `npm run build` first, then `node examples/example.mjs`.
import assert from "node:assert/strict";
import {
  extractCompanyLinkedInProfileName,
  extractCountryName,
  generateCanonicalCompanyLinkedInProfileUrl,
  generateCanonicalLinkedInProfileUrl,
  isValidCompanyLinkedInProfileUrl,
  isValidLinkedInProfileUrl,
} from "../dist/index.mjs";

assert.equal(
  isValidLinkedInProfileUrl("https://www.linkedin.com/in/williamhgates"),
  true,
);
assert.equal(isValidLinkedInProfileUrl("https://www.linkedin.com/in/"), false);

assert.equal(
  generateCanonicalLinkedInProfileUrl("de.linkedin.com/in/TEST", {
    keepTld: true,
  }),
  "https://de.linkedin.com/in/test",
);

assert.equal(
  isValidCompanyLinkedInProfileUrl(
    "https://www.linkedin.com/company/1234567890/",
  ),
  true,
);

assert.equal(
  extractCompanyLinkedInProfileName(
    "https://www.linkedin.com/company/%C3%A0-nous-la-lune-",
  ),
  "%C3%A0-nous-la-lune-",
);

assert.equal(
  generateCanonicalCompanyLinkedInProfileUrl(
    "https://www.linkedin.com/school/MIT",
  ),
  "https://linkedin.com/school/mit",
);

assert.equal(extractCountryName("http://de.linkedin.com/in/test"), "Germany");

console.log("ESM bundle OK");
