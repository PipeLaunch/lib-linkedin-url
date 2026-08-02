// CJS smoke test: exercises the built CommonJS bundle (dist/index.js).
// Run `npm run build` first, then `node examples/example.cjs`.
"use strict";

const assert = require("node:assert/strict");
const {
  extractLinkedInProfileName,
  extractLinkedInSubdomain,
  generateCanonicalSchoolLinkedInProfileUrl,
  isValidLinkedInProfileUrl,
  isValidSchoolLinkedInProfileUrl,
} = require("../dist/index.js");

assert.equal(isValidLinkedInProfileUrl("linkedin.com/in/williamhgates"), true);
assert.equal(isValidLinkedInProfileUrl("https://linkedin.com/in/a b c"), false);

assert.equal(
  extractLinkedInProfileName("https://linkedin.com/in/UserR?view=1"),
  "UserR",
);

assert.equal(
  isValidSchoolLinkedInProfileUrl("https://www.linkedin.com/school/mit"),
  true,
);

assert.equal(
  generateCanonicalSchoolLinkedInProfileUrl("linkedin.com/school/MIT/people/"),
  "https://linkedin.com/school/mit",
);

assert.equal(extractLinkedInSubdomain("de.linkedin.com/in/test"), "de");

console.log("CJS bundle OK");
