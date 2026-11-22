import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractLinkedInProfileName,
  generateCanonicalCompanyLinkedInProfileUrl,
  generateCanonicalLinkedInProfileUrl,
  isValidCompanyLinkedInProfileUrl,
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
    "https://linkedin.com/in/राहुल-शर्मा",
    "https://linkedin.com/in/test/10/1",
    "https://www.linkedin.com/in/test?trk=people-guest_people_search-card",
    // regression: live slugs that start with `-`/`~` or contain `~`
    "https://www.linkedin.com/in/-janedoe/",
    "https://www.linkedin.com/in/-jane-doe-/",
    "https://www.linkedin.com/in/-jane-doe",
    "https://www.linkedin.com/in/jane~doe/",
    "https://www.linkedin.com/in/~janedoe/",
    "https://www.linkedin.com/in/jane-doe-mba-fcca~cpa-pmp-psm-1a234567b/",
  ];
  for (const url of valid) {
    it(`accepts ${url}`, () => {
      assert.equal(isValidLinkedInProfileUrl(url), true);
    });
  }

  const invalid = [
    // regression: a URL pasted on top of a prefilled one
    "https://www.linkedin.com/in/www.linkedin.com/in/john-doe",
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
    // a slug of only `-`/`~` has no name in it
    "https://linkedin.com/in/-",
    "https://linkedin.com/in/~",
    "https://linkedin.com/in/-~-",
    "https://linkedin.com/in/-/test",
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
    ["https://www.linkedin.com/in/-Jane-Doe-/", "-Jane-Doe-"],
    ["https://www.linkedin.com/in/jane~doe/", "jane~doe"],
    ["https://www.linkedin.com/in/~janedoe", "~janedoe"],
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
    ["www.linkedin.com/in/-Jane-Doe-/", "https://linkedin.com/in/-jane-doe-"],
    [
      "https://www.linkedin.com/in/Jane~Doe/",
      "https://linkedin.com/in/jane~doe",
    ],
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
      // escapes are normalized like /in/ slugs, against the /pub/ charset
      [
        "linkedin.com/pub/Caf%C3%A9-Owner/1/2/3",
        { numeric: true },
        "https://linkedin.com/pub/café-owner/1/2/3",
      ],
      [
        "linkedin.com/pub/jane-cfa%c2%ae/1/2/3",
        { numeric: true },
        "https://linkedin.com/pub/jane-cfa%C2%AE/1/2/3",
      ],
      [
        "linkedin.com/pub/Jane%2fDoe/1/2/3",
        { numeric: true },
        "https://linkedin.com/pub/jane%2Fdoe/1/2/3",
      ],
      ["linkedin.com/pub/%2Djane/1/2/3", { numeric: true }, ""],
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

describe("unicode symbols and percent-encoding", () => {
  const ADAM = "adam-hirsch-cima®-crpc®-6a2a9b3";
  const BRIAN = "brian-sweeney-mba-cfp®-ea-cepa-b2519724";
  const TM = "jane-doe-acme™-lead";

  // [url, extracted slug, canonical URL]
  const cases: [url: string, slug: string, canonical: string][] = [
    [
      `https://www.linkedin.com/in/${ADAM}`,
      ADAM,
      `https://linkedin.com/in/${ADAM}`,
    ],
    [
      "https://www.linkedin.com/in/adam-hirsch-cima%C2%AE-crpc%C2%AE-6a2a9b3",
      ADAM,
      `https://linkedin.com/in/${ADAM}`,
    ],
    [
      "https://www.linkedin.com/in/adam-hirsch-cima%c2%ae-crpc%c2%ae-6a2a9b3/",
      ADAM,
      `https://linkedin.com/in/${ADAM}`,
    ],
    [
      `https://www.linkedin.com/in/${BRIAN}`,
      BRIAN,
      `https://linkedin.com/in/${BRIAN}`,
    ],
    [
      "https://www.linkedin.com/in/brian-sweeney-mba-cfp%C2%AE-ea-cepa-b2519724",
      BRIAN,
      `https://linkedin.com/in/${BRIAN}`,
    ],
    [`https://www.linkedin.com/in/${TM}`, TM, `https://linkedin.com/in/${TM}`],
    [
      "https://www.linkedin.com/in/jane-doe-acme%E2%84%A2-lead",
      TM,
      `https://linkedin.com/in/${TM}`,
    ],
    [
      "https://linkedin.com/in/Jane-Doe-©°",
      "Jane-Doe-©°",
      "https://linkedin.com/in/jane-doe-©°",
    ],
    // escapes of characters that may not appear literally stay escaped, in uppercase
    [
      "https://linkedin.com/in/jane%20doe",
      "jane%20doe",
      "https://linkedin.com/in/jane%20doe",
    ],
    [
      "https://linkedin.com/in/Jane%2fDoe",
      "Jane%2FDoe",
      "https://linkedin.com/in/jane%2Fdoe",
    ],
    [
      "https://linkedin.com/in/jane%3cdoe",
      "jane%3Cdoe",
      "https://linkedin.com/in/jane%3Cdoe",
    ],
    // characters encodeURIComponent leaves alone stay escaped too
    [
      "https://linkedin.com/in/jane%21",
      "jane%21",
      "https://linkedin.com/in/jane%21",
    ],
    [
      "https://linkedin.com/in/jane%28doe%29",
      "jane%28doe%29",
      "https://linkedin.com/in/jane%28doe%29",
    ],
    // one undecodable byte does not block decoding of its neighbours
    [
      "https://linkedin.com/in/jane%C2%AE%ff",
      "jane®%FF",
      "https://linkedin.com/in/jane®%FF",
    ],
    [
      "https://linkedin.com/in/jane®%FF",
      "jane®%FF",
      "https://linkedin.com/in/jane®%FF",
    ],
    [
      "https://linkedin.com/in/%FFjane%C2%AE",
      "%FFjane®",
      "https://linkedin.com/in/%FFjane®",
    ],
    // not valid UTF-8: kept as is
    [
      "https://linkedin.com/in/jane%ff",
      "jane%FF",
      "https://linkedin.com/in/jane%FF",
    ],
    // an escape of an allowed ASCII character is decoded
    ["https://linkedin.com/in/%4Aane", "Jane", "https://linkedin.com/in/jane"],
  ];
  for (const [url, slug, canonical] of cases) {
    it(`${url} -> "${slug}", "${canonical}"`, () => {
      assert.equal(isValidLinkedInProfileUrl(url), true);
      assert.equal(extractLinkedInProfileName(url), slug);
      assert.equal(generateCanonicalLinkedInProfileUrl(url), canonical);
    });
    it(`${url}: parse -> canonical -> parse is stable`, () => {
      assert.equal(isValidLinkedInProfileUrl(canonical), true);
      assert.equal(generateCanonicalLinkedInProfileUrl(canonical), canonical);
      assert.equal(
        extractLinkedInProfileName(canonical),
        canonical.slice("https://linkedin.com/in/".length),
      );
    });
  }

  const invalid = [
    "https://linkedin.com/in/®",
    "https://linkedin.com/in/-®-",
    "https://linkedin.com/in/®jane",
    "https://linkedin.com/in/jane doe®",
    "https://linkedin.com/in/jane®%",
    // the encoded spellings are rejected just like the raw ones
    "https://linkedin.com/in/%C2%AE",
    "https://linkedin.com/in/-%C2%AE-",
    "https://linkedin.com/in/%E2%84%A2jane",
    // an undecodable byte after the symbol does not hide it
    "https://linkedin.com/in/%C2%AE%FF",
    // escapes decoding to a character that may not start a slug
    "https://linkedin.com/in/%2Ejane",
    "https://linkedin.com/in/%5Fjane",
    "https://linkedin.com/in/%26jane",
    "https://linkedin.com/in/%27jane",
    "https://linkedin.com/in/%CC%81jane",
    // ASCII symbols are still rejected
    "https://linkedin.com/in/jane<doe>",
    "https://linkedin.com/in/jane+doe",
    "https://linkedin.com/in/jane=doe",
    "https://linkedin.com/in/jane|doe",
    // whitespace and control characters
    "https://linkedin.com/in/jane doe",
    "https://linkedin.com/in/jane\u0007doe",
    "https://linkedin.com/in/jane\tdoe",
  ];
  for (const url of invalid) {
    it(`rejects ${JSON.stringify(url)}`, () => {
      assert.equal(isValidLinkedInProfileUrl(url), false);
      assert.equal(extractLinkedInProfileName(url), "");
      assert.equal(generateCanonicalLinkedInProfileUrl(url), "");
    });
  }

  // regression: live slugs that already passed keep passing
  const regressions: [url: string, slug: string][] = [
    ["https://www.linkedin.com/in/-sean-sheppard", "-sean-sheppard"],
    ["https://www.linkedin.com/in/-yu-chun-lin", "-yu-chun-lin"],
    ["https://www.linkedin.com/in/~janedoe", "~janedoe"],
  ];
  for (const [url, slug] of regressions) {
    it(`still accepts ${url}`, () => {
      assert.equal(isValidLinkedInProfileUrl(url), true);
      assert.equal(extractLinkedInProfileName(url), slug);
      assert.equal(
        generateCanonicalLinkedInProfileUrl(url),
        `https://linkedin.com/in/${slug}`,
      );
    });
  }
});

describe("legacy /pub/ percent-encoding", () => {
  const opts = { numeric: true };
  // [url, extracted name, canonical URL]
  const cases: [url: string, name: string, canonical: string][] = [
    [
      "https://de.linkedin.com/pub/Caf%C3%A9-Owner/1/638/7A1",
      "Café-Owner",
      "https://linkedin.com/pub/café-owner/1/638/7a1",
    ],
    [
      "https://de.linkedin.com/pub/Café-Owner/1/638/7a1",
      "Café-Owner",
      "https://linkedin.com/pub/café-owner/1/638/7a1",
    ],
    [
      "linkedin.com/pub/jane-cfa%c2%ae/1/2/3",
      "jane-cfa%C2%AE",
      "https://linkedin.com/pub/jane-cfa%C2%AE/1/2/3",
    ],
    [
      "linkedin.com/pub/jane%7edoe/1/2/3",
      "jane%7Edoe",
      "https://linkedin.com/pub/jane%7Edoe/1/2/3",
    ],
  ];
  for (const [url, name, canonical] of cases) {
    it(`${url} -> "${name}", "${canonical}"`, () => {
      assert.equal(isValidLinkedInProfileUrl(url, opts), true);
      assert.equal(extractLinkedInProfileName(url, opts), name);
      assert.equal(generateCanonicalLinkedInProfileUrl(url, opts), canonical);
    });
    it(`${url}: parse -> canonical -> parse is stable`, () => {
      assert.equal(isValidLinkedInProfileUrl(canonical, opts), true);
      assert.equal(
        generateCanonicalLinkedInProfileUrl(canonical, opts),
        canonical,
      );
    });
  }

  const invalid = [
    "linkedin.com/pub/%2Djane/1/2/3",
    "linkedin.com/pub/-jane/1/2/3",
    "linkedin.com/pub/jane®/1/2/3",
    "linkedin.com/pub/jane~doe/1/2/3",
  ];
  for (const url of invalid) {
    it(`rejects ${url}`, () => {
      assert.equal(isValidLinkedInProfileUrl(url, opts), false);
      assert.equal(extractLinkedInProfileName(url, opts), "");
    });
  }
});

describe("symbol allow-list: emoji, lookalikes and variation selectors", () => {
  // still accepted literally
  const accepted = [
    "https://linkedin.com/in/jane-doe-cfa®",
    "https://linkedin.com/in/jane-doe-acme©",
    "https://linkedin.com/in/jane-doe-acme™",
    "https://linkedin.com/in/jane-doe-360°",
    "https://linkedin.com/in/jane-doe-acme℠",
  ];
  for (const url of accepted) {
    it(`accepts ${url}`, () => {
      assert.equal(isValidLinkedInProfileUrl(url), true);
    });
  }

  const rejected = [
    // slash-lookalikes: one slug would read as two path segments
    "https://linkedin.com/in/jane\u2215doe", // ∕ division slash
    "https://linkedin.com/in/jane\u2044doe", // ⁄ fraction slash
    "https://linkedin.com/in/jane\u2216doe", // ∖ set minus
    "https://linkedin.com/in/jane\u29f8doe", // ⧸ big solidus
    "https://linkedin.com/in/jane\u2571doe", // ╱ box-drawing diagonal
    // emoji
    "https://linkedin.com/in/jane\u{1F600}", // 😀
    "https://linkedin.com/in/jane\u2764", // ❤
    "https://linkedin.com/in/jane\u{1F1FA}\u{1F1F8}", // 🇺🇸
    "https://linkedin.com/in/jane\u{1F44D}\u{1F3FB}", // 👍🏻
    "https://www.linkedin.com/company/acme\u{1F680}", // 🚀
    // slash-lookalikes outside any deny-list
    "https://linkedin.com/in/jane\u2AFDdoe", // ⫽ double solidus operator
    "https://linkedin.com/in/jane\u233Fdoe", // ⌿ APL slash bar
    "https://linkedin.com/in/jane\u{1F67C}doe", // 🙼 very heavy solidus
    // lookalikes of ASCII characters
    "https://linkedin.com/in/jane\uFF1Cx", // ＜ fullwidth <
    "https://linkedin.com/in/jane\uFE64x", // ﹤ small <
    "https://linkedin.com/in/jane\u02C2x", // ˂ modifier <
    "https://linkedin.com/in/jane\u02DCx", // ˜ looks like ~
    "https://linkedin.com/in/jane\u00B4x", // ´ looks like '
    // other symbols are no longer accepted
    "https://linkedin.com/in/jane-doe-€uro",
    // variation selectors: invisible, emoji/text presentation only
    "https://linkedin.com/in/jane\uFE0F",
    "https://linkedin.com/in/jane\uFE0E",
    "https://linkedin.com/in/acme\u00A9\uFE0F", // ©️
    "https://linkedin.com/in/acme\u2122\uFE0F", // ™️
  ];
  for (const url of rejected) {
    it(`rejects ${JSON.stringify(url)}`, () => {
      assert.equal(
        isValidLinkedInProfileUrl(url) || isValidCompanyLinkedInProfileUrl(url),
        false,
      );
    });
  }

  // encoded, they are valid but never decoded: the canonical URL keeps the escapes
  const kept: [url: string, canonical: string][] = [
    [
      "https://linkedin.com/in/jane%e2%88%95doe",
      "https://linkedin.com/in/jane%E2%88%95doe",
    ],
    [
      "https://linkedin.com/in/jane%E2%81%84doe",
      "https://linkedin.com/in/jane%E2%81%84doe",
    ],
    [
      "https://linkedin.com/in/jane%F0%9F%98%80",
      "https://linkedin.com/in/jane%F0%9F%98%80",
    ],
    // the emoji and its variation selector both stay escaped
    [
      "https://linkedin.com/in/jane%E2%9D%A4%ef%b8%8f",
      "https://linkedin.com/in/jane%E2%9D%A4%EF%B8%8F",
    ],
    [
      "https://linkedin.com/in/jane%E2%AB%BDdoe",
      "https://linkedin.com/in/jane%E2%AB%BDdoe",
    ],
  ];
  for (const [url, canonical] of kept) {
    it(`${url} -> "${canonical}"`, () => {
      assert.equal(isValidLinkedInProfileUrl(url), true);
      assert.equal(generateCanonicalLinkedInProfileUrl(url), canonical);
      assert.equal(generateCanonicalLinkedInProfileUrl(canonical), canonical);
    });
  }
});

describe("first unit after normalization", () => {
  // an escape that still decodes to a character may not start a slug,
  // exactly like the raw character
  const rejected = [
    "https://linkedin.com/in/%20jane",
    "https://linkedin.com/in/%2Fjane",
    "https://linkedin.com/in/-%2Fjane",
    "https://linkedin.com/in/%F0%9F%98%80",
    "https://linkedin.com/in/%E2%88%95jane",
    "https://linkedin.com/in/%EF%BC%8Fjane", // fullwidth ／
    "https://linkedin.com/in/%EF%B8%8Fjane", // U+FE0F
    "https://www.linkedin.com/company/%20acme",
    "https://www.linkedin.com/school/%2Facme",
  ];
  for (const url of rejected) {
    it(`rejects ${url}`, () => {
      assert.equal(
        isValidLinkedInProfileUrl(url) || isValidCompanyLinkedInProfileUrl(url),
        false,
      );
    });
  }

  // an escape that is not valid UTF-8 may still start a slug
  const accepted: [url: string, canonical: string][] = [
    ["https://linkedin.com/in/%ffjane", "https://linkedin.com/in/%FFjane"],
    ["https://linkedin.com/in/~%C2jane", "https://linkedin.com/in/~%C2jane"],
    ["https://linkedin.com/in/%41ne", "https://linkedin.com/in/ane"],
  ];
  for (const [url, canonical] of accepted) {
    it(`accepts ${url} -> "${canonical}"`, () => {
      assert.equal(isValidLinkedInProfileUrl(url), true);
      assert.equal(generateCanonicalLinkedInProfileUrl(url), canonical);
      assert.equal(generateCanonicalLinkedInProfileUrl(canonical), canonical);
    });
  }

  describe("legacy /pub/ names", () => {
    const opts = { numeric: true };
    const rejectedPub = [
      "linkedin.com/pub/%C2%AEjane/1/2/3",
      "linkedin.com/pub/%20jane/1/2/3",
      "linkedin.com/pub/%7Ejane/1/2/3",
      "linkedin.com/pub/jane%EF%B8%8F/1/2/3".replace("%EF%B8%8F", "\uFE0F"),
    ];
    for (const url of rejectedPub) {
      it(`rejects ${JSON.stringify(url)}`, () => {
        assert.equal(isValidLinkedInProfileUrl(url, opts), false);
      });
    }

    it("accepts an undecodable first escape", () => {
      assert.equal(
        generateCanonicalLinkedInProfileUrl(
          "linkedin.com/pub/%ffjane/1/2/3",
          opts,
        ),
        "https://linkedin.com/pub/%FFjane/1/2/3",
      );
    });

    it("keeps U+FE0F escaped", () => {
      assert.equal(
        generateCanonicalLinkedInProfileUrl(
          "linkedin.com/pub/jane%ef%b8%8f/1/2/3",
          opts,
        ),
        "https://linkedin.com/pub/jane%EF%B8%8F/1/2/3",
      );
    });
  });
});

describe("Unicode NFC normalization", () => {
  const CAFE = "caf\u00E9"; // café, composed (NFC)
  const cases: [url: string, label: string][] = [
    ["https://linkedin.com/in/caf\u00E9", "raw composed"],
    ["https://linkedin.com/in/cafe\u0301", "raw decomposed"],
    ["https://linkedin.com/in/caf%C3%A9", "encoded composed"],
    ["https://linkedin.com/in/cafe%CC%81", "encoded decomposed"],
    [
      "https://linkedin.com/in/cafe%cc%81/",
      "encoded decomposed, lowercase hex",
    ],
  ];
  for (const [url, label] of cases) {
    it(`${label}: ${JSON.stringify(url)} -> "${CAFE}"`, () => {
      assert.equal(isValidLinkedInProfileUrl(url), true);
      assert.equal(extractLinkedInProfileName(url), CAFE);
      assert.equal(
        generateCanonicalLinkedInProfileUrl(url),
        `https://linkedin.com/in/${CAFE}`,
      );
    });
  }

  it("keeps case while composing: CAFE + U+0301 -> CAFÉ", () => {
    assert.equal(
      extractLinkedInProfileName("https://linkedin.com/in/CAFE%CC%81"),
      "CAF\u00C9",
    );
    assert.equal(
      generateCanonicalLinkedInProfileUrl("https://linkedin.com/in/CAFE%CC%81"),
      "https://linkedin.com/in/caf\u00E9",
    );
  });

  it("composes across raw and encoded parts: e + %CC%81", () => {
    assert.equal(
      extractLinkedInProfileName("https://linkedin.com/in/jos%65%CC%81"),
      "jos\u00E9",
    );
    assert.equal(
      extractLinkedInProfileName("https://linkedin.com/in/jose%CC%81-doe"),
      "jos\u00E9-doe",
    );
  });

  it("never composes a mark with the hex digit of a kept escape", () => {
    // %FA is not valid UTF-8 and stays escaped; U+0301 must not turn "A" into "Á"
    const url = "https://linkedin.com/in/jane%FA%CC%81";
    assert.equal(extractLinkedInProfileName(url), "jane%FA\u0301");
    assert.equal(
      generateCanonicalLinkedInProfileUrl(url),
      "https://linkedin.com/in/jane%FA\u0301",
    );
  });

  it("company and school slugs are normalized too", () => {
    assert.equal(
      generateCanonicalCompanyLinkedInProfileUrl(
        "https://www.linkedin.com/company/Cafe%CC%81-Inc",
      ),
      "https://linkedin.com/company/caf\u00E9-inc",
    );
  });

  it("legacy /pub/ names are normalized too", () => {
    assert.equal(
      generateCanonicalLinkedInProfileUrl(
        "https://linkedin.com/pub/cafe%CC%81-owner/1/2/3",
        { numeric: true },
      ),
      "https://linkedin.com/pub/caf\u00E9-owner/1/2/3",
    );
  });
});

describe("slug length limit (NFC cost bound)", () => {
  // regression: NFC reorders long runs of combining marks in quadratic time;
  // this slug took seconds to validate before the length limit
  const MARKS = "a" + "\u0315".repeat(40000) + "\u0300".repeat(40000);
  const HUGE: [label: string, url: string, options?: { numeric: true }][] = [
    ["person", `https://linkedin.com/in/${MARKS}`],
    [
      "legacy /pub/",
      `https://linkedin.com/pub/${MARKS}/1/2/3`,
      { numeric: true },
    ],
  ];
  for (const [label, url, options] of HUGE) {
    it(`rejects a ${label} slug of 80 001 characters quickly`, () => {
      const start = performance.now();
      assert.equal(isValidLinkedInProfileUrl(url, options), false);
      assert.equal(extractLinkedInProfileName(url, options), "");
      assert.equal(generateCanonicalLinkedInProfileUrl(url, options), "");
      assert.ok(
        performance.now() - start < 250,
        `took ${(performance.now() - start).toFixed(0)} ms`,
      );
    });
  }

  it("rejects a company slug of 80 001 characters quickly", () => {
    const url = `https://www.linkedin.com/company/${MARKS}`;
    const start = performance.now();
    assert.equal(isValidCompanyLinkedInProfileUrl(url), false);
    assert.equal(generateCanonicalCompanyLinkedInProfileUrl(url), "");
    assert.ok(performance.now() - start < 250);
  });

  it("accepts a slug of exactly 2048 characters", () => {
    const slug = "a".repeat(2048);
    assert.equal(
      isValidLinkedInProfileUrl(`https://linkedin.com/in/${slug}`),
      true,
    );
    assert.equal(
      isValidLinkedInProfileUrl(`https://linkedin.com/in/${slug}a`),
      false,
    );
  });

  it("accepts a 100-character name fully percent-encoded as 4-byte UTF-8", () => {
    const slug = "%F0%A0%80%80".repeat(100); // 100 x U+20000 (CJK Ext. B), 1200 characters
    assert.equal(
      extractLinkedInProfileName(`https://linkedin.com/in/${slug}`),
      "\u{20000}".repeat(100),
    );
  });

  it("validates the worst case at the limit in well under a second", () => {
    const slug = "a" + "\u0315".repeat(1023) + "\u0300".repeat(1024);
    const start = performance.now();
    isValidLinkedInProfileUrl(`https://linkedin.com/in/${slug}`);
    assert.ok(performance.now() - start < 250);
  });
});
