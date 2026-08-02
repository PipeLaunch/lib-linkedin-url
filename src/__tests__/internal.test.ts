import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { addHttpsIfMissing, isNonEmptyString } from "../internal/util.ts";
import { TLD_TABLE } from "../internal/tld.ts";

describe("addHttpsIfMissing", () => {
  const cases: [url: string, expected: string][] = [
    ["www.pipelaunch.com", "https://www.pipelaunch.com"],
    ["http://www.pipelaunch.com", "http://www.pipelaunch.com"],
    ["https://www.pipelaunch.com", "https://www.pipelaunch.com"],
    ["HTTP://www.pipelaunch.com", "HTTP://www.pipelaunch.com"],
    ["", ""],
  ];
  for (const [url, expected] of cases) {
    it(`"${url}" -> "${expected}"`, () => {
      assert.equal(addHttpsIfMissing(url), expected);
    });
  }
});

describe("isNonEmptyString", () => {
  it("accepts non-empty strings", () => {
    assert.equal(isNonEmptyString("a"), true);
  });

  const rejected: [label: string, value: unknown][] = [
    ["empty string", ""],
    ["number", 42],
    ["null", null],
    ["undefined", undefined],
    ["object", {}],
    ["array", []],
  ];
  for (const [label, value] of rejected) {
    it(`rejects ${label}`, () => {
      assert.equal(isNonEmptyString(value), false);
    });
  }
});

describe("TLD_TABLE integrity", () => {
  const entries = Object.entries(TLD_TABLE);

  it("has 251 entries", () => {
    assert.equal(entries.length, 251);
  });

  it("every key is a 2-letter lowercase code", () => {
    for (const [key] of entries) {
      assert.match(key, /^[a-z]{2}$/);
    }
  });

  it("every value is a non-empty country name", () => {
    for (const [key, value] of entries) {
      assert.equal(typeof value, "string");
      assert.notEqual(value, "", `empty country name for "${key}"`);
    }
  });

  it("maps well-known codes", () => {
    assert.equal(TLD_TABLE.de, "Germany");
    assert.equal(TLD_TABLE.uk, "United Kingdom");
    assert.equal(typeof TLD_TABLE.gb, "string");
  });
});
