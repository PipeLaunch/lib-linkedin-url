import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { addHttpsIfMissing, isNonEmptyString } from "../internal/util.ts";
import { TLD_TABLE } from "../internal/tld.ts";
import { canonicalSlug, normalizeSlug } from "../internal/entity.ts";
import { PUB_SLUG_CHAR_RE } from "../internal/patterns.ts";

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

describe("normalizeSlug", () => {
  const cases: [slug: string, expected: string][] = [
    ["Jane-Doe", "Jane-Doe"],
    ["cima%C2%AE", "cima®"],
    ["cima%c2%ae", "cima®"],
    ["%E4%B8%AD%E5%9B%BD", "中国"],
    ["a%20b", "a%20b"],
    ["a%2fb", "a%2Fb"],
    // an invalid byte stays escaped on its own; the bytes around it still decode
    ["a%ff%C2%AE", "a%FF®"],
    ["a%C2%AE%ff", "a®%FF"],
    ["a%C2%ff%AE", "a%C2%FF%AE"],
    ["a%E2%84%C2%AE", "a%E2%84®"],
    ["a%C0%AF", "a%C0%AF"],
    ["a%ED%A0%80b", "a%ED%A0%80b"],
    ["a%F0%9F%98", "a%F0%9F%98"],
    ["a%C2%AE%20b", "a®%20b"],
    ["%41b", "Ab"],
    // slash-lookalikes and emoji are not decoded
    ["a%e2%88%95b", "a%E2%88%95b"],
    ["a%F0%9F%98%80", "a%F0%9F%98%80"],
    ["a%E2%84%A2", "a™"],
    // NFC: decomposed accents compose, but never across a kept escape
    ["cafe%CC%81", "caf\u00E9"],
    ["cafe\u0301", "caf\u00E9"],
    ["a%FA%CC%81", "a%FA\u0301"],
    ["\u212Bngstrom", "\u00C5ngstrom"],
    ["a%E2%84%A0", "a℠"],
    ["a%C2%B0", "a°"],
    // symbols outside the allow-list and variation selectors stay escaped
    ["a%E2%82%AC", "a%E2%82%AC"],
    ["a%E2%9D%A4%ef%b8%8f", "a%E2%9D%A4%EF%B8%8F"],
    ["a%E2%AB%BD", "a%E2%AB%BD"],
    ["a%21%2a", "a%21%2A"],
  ];
  for (const [slug, expected] of cases) {
    it(`"${slug}" -> "${expected}" (and is a fixed point)`, () => {
      assert.equal(normalizeSlug(slug), expected);
      assert.equal(normalizeSlug(expected), expected);
    });
  }
});

describe("canonicalSlug", () => {
  it("lowercases letters but keeps escapes uppercase", () => {
    assert.equal(canonicalSlug("Jane%2FDoe-CFA®"), "jane%2Fdoe-cfa®");
  });
});

describe("normalizeSlug with the /pub/ character set", () => {
  const cases: [slug: string, expected: string][] = [
    ["caf%C3%A9", "café"],
    ["jane%C2%AE", "jane%C2%AE"],
    ["jane%7edoe", "jane%7Edoe"],
  ];
  for (const [slug, expected] of cases) {
    it(`"${slug}" -> "${expected}" (and is a fixed point)`, () => {
      assert.equal(normalizeSlug(slug, PUB_SLUG_CHAR_RE), expected);
      assert.equal(normalizeSlug(expected, PUB_SLUG_CHAR_RE), expected);
    });
  }
});
