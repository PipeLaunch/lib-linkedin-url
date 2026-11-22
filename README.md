# lib-linkedin-url

[![npm version](https://img.shields.io/npm/v/lib-linkedin-url?logo=npm&label=npm)](https://www.npmjs.com/package/lib-linkedin-url)
[![CI](https://github.com/PipeLaunch/lib-linkedin-url/actions/workflows/ci.yml/badge.svg)](https://github.com/PipeLaunch/lib-linkedin-url/actions/workflows/ci.yml)
[![npm downloads](https://img.shields.io/npm/dm/lib-linkedin-url)](https://www.npmjs.com/package/lib-linkedin-url)
[![license](https://img.shields.io/github/license/PipeLaunch/lib-linkedin-url?logo=github&label=License)](LICENSE)

Utility library to work with LinkedIn profile URLs: validate person, company and
school URLs, extract profile slugs, build canonical URLs, and derive the country
from regional subdomains.

## Features

- Validates the URL formats LinkedIn actually uses, including the mobile
  `/m/in/` and `/mwlite/in/` variants and the legacy numeric `/pub/` format
- Handles URLs with or without protocol, uppercase hosts, query strings,
  hashes and extra path segments
- Unicode slugs (letters, combining marks, digits and symbols such as `®`/`™`)
  and percent-encoded slugs supported; both spellings normalize to one form
- Zero runtime dependencies
- Dual ESM + CommonJS builds, TypeScript types included
- Never throws: invalid input returns `false` or `""`

## Requirements

- Node.js >= 22, or any modern bundler / runtime (the built output is plain ES2023)

## Installation

```sh
npm install lib-linkedin-url
# pnpm add lib-linkedin-url
# yarn add lib-linkedin-url
# bun add lib-linkedin-url
```

## Usage

```ts
// ESM / TypeScript
import {
  extractCompanyLinkedInProfileName,
  isValidCompanyLinkedInProfileUrl,
} from "lib-linkedin-url";

isValidCompanyLinkedInProfileUrl(
  "https://www.linkedin.com/company/pipelaunch/",
);
// -> true

extractCompanyLinkedInProfileName(
  "https://www.linkedin.com/company/pipelaunch/",
);
// -> "pipelaunch"
```

```js
// CommonJS
const { generateCanonicalLinkedInProfileUrl } = require("lib-linkedin-url");

generateCanonicalLinkedInProfileUrl("de.linkedin.com/in/UserName?trk=1");
// -> "https://linkedin.com/in/username"
```

## API

Every function accepts URLs with or without an `http(s)://` protocol and never
throws — invalid input (including non-strings) returns `false` or `""`.

| Function                                                    | Returns   | Description                                                                                    |
| ----------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------- |
| `isValidLinkedInProfileUrl(url, options?)`                  | `boolean` | Validates a person profile URL (`/in/<slug>`). `{ numeric: true }` also accepts legacy `/pub/` |
| `extractLinkedInProfileName(url, options?)`                 | `string`  | Person slug, decoded (see below), case preserved. `""` when invalid                            |
| `generateCanonicalLinkedInProfileUrl(url, options?)`        | `string`  | `https://linkedin.com/in/<slug>`, decoded and lowercased. `""` when invalid                    |
| `isValidCompanyLinkedInProfileUrl(url)`                     | `boolean` | Validates `/company/<slug>` (also accepts `/school/`)                                          |
| `isValidSchoolLinkedInProfileUrl(url)`                      | `boolean` | Validates `/school/<slug>` only                                                                |
| `isNumericCompanyLinkedInProfileUrl(url)`                   | `boolean` | Valid company URL whose slug is a numeric company ID (`/company/1035`)                         |
| `extractCompanyLinkedInProfileName(url)`                    | `string`  | Company or school slug, decoded (see below), case preserved. `""` when invalid                 |
| `generateCanonicalCompanyLinkedInProfileUrl(url, options?)` | `string`  | Canonical company URL; school URLs keep their `/school/` segment                               |
| `generateCanonicalSchoolLinkedInProfileUrl(url, options?)`  | `string`  | Canonical school URL. `""` for non-school URLs                                                 |
| `extractLinkedInSubdomain(url)`                             | `string`  | 2-letter country subdomain: `de.linkedin.com` -> `"de"`. `""` for none/`www`                   |
| `extractCountryName(url)`                                   | `string`  | English country name from the subdomain: `"Germany"`. `""` when unknown                        |

Exported option types: `CanonicalProfileUrlOptions` (`{ keepTld?: boolean }`),
`PersonProfileUrlOptions` (`{ numeric?: boolean }`), and
`CanonicalPersonProfileUrlOptions` (both combined).

### Person profiles

```js
isValidLinkedInProfileUrl("https://linkedin.com/in/test"); // -> true
isValidLinkedInProfileUrl("linkedin.com/in/test"); // -> true (protocol optional)
isValidLinkedInProfileUrl("https://linkedin.com/in/"); // -> false (no slug)
isValidLinkedInProfileUrl("https://linkedin.com/in/a b c"); // -> false (invalid characters)

// extraction preserves case ...
extractLinkedInProfileName("https://linkedin.com/in/UserR?view=1"); // -> "UserR"

// ... canonicalization lowercases
generateCanonicalLinkedInProfileUrl("https://www.linkedin.com/in/UserR?view=1");
// -> "https://linkedin.com/in/userr"

// keep the country subdomain
generateCanonicalLinkedInProfileUrl("http://de.linkedin.com/in/Test", {
  keepTld: true,
});
// -> "https://de.linkedin.com/in/test"

// legacy numeric format (dead on linkedin.com, still found in old datasets)
isValidLinkedInProfileUrl("http://nl.linkedin.com/pub/other-name/11/223/544", {
  numeric: true,
});
// -> true
extractLinkedInProfileName("http://nl.linkedin.com/pub/other-name/11/223/544", {
  numeric: true,
});
// -> "other-name"
```

### Companies and schools

```js
isValidCompanyLinkedInProfileUrl("https://linkedin.com/company/test"); // -> true
isValidCompanyLinkedInProfileUrl("https://linkedin.com/school/test"); // -> true (schools count as companies)
isValidCompanyLinkedInProfileUrl("https://linkedin.com/company/a-&-b"); // -> true
isValidCompanyLinkedInProfileUrl("https://linkedin.com/company/a<script>"); // -> false

isValidSchoolLinkedInProfileUrl("https://linkedin.com/school/mit"); // -> true
isValidSchoolLinkedInProfileUrl("https://linkedin.com/company/test"); // -> false

isNumericCompanyLinkedInProfileUrl("https://linkedin.com/company/1035"); // -> true
isNumericCompanyLinkedInProfileUrl("https://linkedin.com/company/microsoft"); // -> false

extractCompanyLinkedInProfileName(
  "https://www.linkedin.com/company/microsoft/about/",
);
// -> "microsoft"

generateCanonicalCompanyLinkedInProfileUrl(
  "https://de.linkedin.com/company/TEST?trk=1",
);
// -> "https://linkedin.com/company/test"

generateCanonicalCompanyLinkedInProfileUrl(
  "https://de.linkedin.com/company/TEST?trk=1",
  { keepTld: true },
);
// -> "https://de.linkedin.com/company/test"

// school URLs keep their /school/ path segment
generateCanonicalCompanyLinkedInProfileUrl(
  "https://www.linkedin.com/school/MIT",
);
// -> "https://linkedin.com/school/mit"

generateCanonicalSchoolLinkedInProfileUrl("linkedin.com/school/MIT/people/");
// -> "https://linkedin.com/school/mit"
```

### Subdomain and country

```js
extractLinkedInSubdomain("https://de.linkedin.com/company/test"); // -> "de"
extractLinkedInSubdomain("https://www.linkedin.com/company/test"); // -> ""

extractCountryName("https://de.linkedin.com/company/test"); // -> "Germany"
extractCountryName("https://www.linkedin.com/company/test"); // -> ""
```

## Slug normalization

Since 2.1.0, raw and percent-encoded spellings of a slug give the same
answer from every function for every character a slug may contain. The
library returns the **decoded** form:

- an escape that decodes (as UTF-8) to a character allowed in a slug is
  decoded: `cima%C2%AE` -> `cima®`, `%E4%B8%AD` -> `中`;
- any other escape (space, `/`, `?`, `<`, control characters, emoji,
  symbols outside `© ® ° ℠ ™`, the variation selectors U+FE0E/U+FE0F) is
  kept, written with **uppercase** hex: `jane%2fdoe` -> `jane%2Fdoe`;
- a byte that is not valid UTF-8 is kept escaped on its own, and the bytes
  around it are still decoded: `jane%C2%AE%ff` -> `jane®%FF`;
- validity is checked on the decoded slug, so an escape that decodes to a
  character that may not start a slug (`%C2%AE`, `%2E`, `%5F`, ...) is rejected
  in first position, exactly like the raw character. A kept escape (`%20`,
  `%2F`, an emoji) may not start a slug either; only a byte that is not valid
  UTF-8 (`%FFjane`) may;
- the slug is put in Unicode NFC, so `cafe%CC%81` (decomposed) and `café`
  (composed) give the same `café`;
- `extract*` functions keep the case of letters; `generateCanonical*`
  functions lowercase letters but not the hex digits of kept escapes.

```js
extractLinkedInProfileName("linkedin.com/in/Jane-Doe-CFA%C2%AE"); // "Jane-Doe-CFA®"
generateCanonicalLinkedInProfileUrl("linkedin.com/in/Jane-Doe-CFA%C2%AE"); // "https://linkedin.com/in/jane-doe-cfa®"
generateCanonicalLinkedInProfileUrl("linkedin.com/in/Jane-Doe-CFA®"); // same
```

A canonical URL parses back to itself. Legacy `/pub/` names are normalized
the same way, against their stricter character set (no `~`, no symbols), so
`/pub/caf%C3%A9/1/2/3` canonicalizes to `/pub/café/1/2/3`, while an escaped
`®` stays `%C2%AE`.

## Known limitations

- Validation is character-set based, not existence based: a "valid" URL is
  well-formed, but the library never contacts LinkedIn to check that the
  profile exists.
- Person, company and school slugs must start (after any leading `-`/`~`)
  with a letter, digit or an escape that is not valid UTF-8. After that the
  only symbols allowed literally are `©`, `®`, `°`, `℠` and `™`; any other
  symbol (emoji, slash-lookalikes such as `∕` or `⁄`, lookalikes such as `＜`
  or `˜`) is only accepted percent-encoded and stays encoded. ASCII symbols
  (`<`, `+`, `=`, `|`, ...) and whitespace never.
- Slugs longer than 2048 characters (escapes included) are rejected, to
  bound the cost of Unicode normalization.
- The legacy `/pub/<name>/<id>/<id>/<id>` format is only recognized when
  explicitly enabled with `{ numeric: true }`; those URLs no longer exist on
  linkedin.com and are useful only for parsing old datasets.
- The `?locale=` query parameter is not (yet) used for country detection; only
  the regional subdomain is.

## Migrating from 1.x

v2.0.0 is a major release. What changed:

- **Node.js >= 22 required** (was `>= 18`; Node 18 and 20 are end-of-life).
- The package ships **dual ESM + CJS** with an `exports` map. Deep imports such
  as `lib-linkedin-url/dist/...` no longer resolve — import everything from the
  package root.
- **Stricter validation** (previously these were accepted): person slugs are
  now character-validated like company slugs (`/in/a b`, `/in/a<script>` are
  invalid), empty slugs (`/in/`, `/mwlite/in/`) are invalid, `%` must form a
  valid `%XX` escape, and legacy `/pub/` URLs need exactly three id segments.
- **Fixed subdomain handling**: `extractLinkedInSubdomain`,
  `extractCountryName` and `keepTld` now work for `http://` and protocol-less
  URLs (a regex typo made them silently return `""`/`www` before).
- **School canonicalization fixed**:
  `generateCanonicalCompanyLinkedInProfileUrl("…/school/mit")` now returns
  `…/school/mit` instead of rewriting it to a different entity's
  `…/company/mit` URL.
- **New**: `generateCanonicalSchoolLinkedInProfileUrl()`, exported option
  types, and `{ numeric: true }` support in `extractLinkedInProfileName()` /
  `generateCanonicalLinkedInProfileUrl()`.

## Contributing

Issues and pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md)
for the development setup, and the [changelog](CHANGELOG.md) for release
history.

## References

- [How to validate a LinkedIn public profile URL (Stack Overflow)](https://stackoverflow.com/questions/8450403/how-to-validate-a-linkedin-public-profile-url)

## License

[MIT](LICENSE) © 2022-2026 [PipeLaunch](https://pipelaunch.com)
