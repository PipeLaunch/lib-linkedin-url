import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { inspect } from "node:util";
import * as lib from "../index.ts";

const EXPORTED_FUNCTIONS = [
  "extractCompanyLinkedInProfileName",
  "extractCountryName",
  "extractLinkedInProfileName",
  "extractLinkedInSubdomain",
  "generateCanonicalCompanyLinkedInProfileUrl",
  "generateCanonicalLinkedInProfileUrl",
  "generateCanonicalSchoolLinkedInProfileUrl",
  "isValidCompanyLinkedInProfileUrl",
  "isValidLinkedInProfileUrl",
  "isValidSchoolLinkedInProfileUrl",
] as const;

describe("public API (barrel)", () => {
  it("exports exactly the documented functions", () => {
    assert.deepEqual(Object.keys(lib).sort(), [...EXPORTED_FUNCTIONS]);
  });

  for (const name of EXPORTED_FUNCTIONS) {
    it(`${name} is a function`, () => {
      assert.equal(typeof lib[name], "function");
    });
  }
});

describe("non-string inputs never throw", () => {
  const inputs: unknown[] = [undefined, null, 42, {}, [], true];

  const validators = [
    lib.isValidLinkedInProfileUrl,
    lib.isValidCompanyLinkedInProfileUrl,
    lib.isValidSchoolLinkedInProfileUrl,
  ];
  const extractors = [
    lib.extractLinkedInProfileName,
    lib.extractCompanyLinkedInProfileName,
    lib.extractLinkedInSubdomain,
    lib.extractCountryName,
    lib.generateCanonicalLinkedInProfileUrl,
    lib.generateCanonicalCompanyLinkedInProfileUrl,
    lib.generateCanonicalSchoolLinkedInProfileUrl,
  ];

  for (const input of inputs) {
    it(`validators return false for ${inspect(input)}`, () => {
      for (const fn of validators) {
        assert.equal(fn(input as string), false);
      }
    });

    it(`extractors return "" for ${inspect(input)}`, () => {
      for (const fn of extractors) {
        assert.equal(fn(input as string), "");
      }
    });
  }
});
