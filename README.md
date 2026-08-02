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
- Unicode and percent-encoded slugs supported
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
| `extractLinkedInProfileName(url, options?)`                 | `string`  | Person slug, case preserved. `""` when invalid                                                 |
| `generateCanonicalLinkedInProfileUrl(url, options?)`        | `string`  | `https://linkedin.com/in/<slug>`, lowercased. `""` when invalid                                |
| `isValidCompanyLinkedInProfileUrl(url)`                     | `boolean` | Validates `/company/<slug>` (also accepts `/school/`)                                          |
| `isValidSchoolLinkedInProfileUrl(url)`                      | `boolean` | Validates `/school/<slug>` only                                                                |
| `extractCompanyLinkedInProfileName(url)`                    | `string`  | Company or school slug, case preserved. `""` when invalid                                      |
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

## Known limitations

- Validation is character-set based, not existence based: a "valid" URL is
  well-formed, but the library never contacts LinkedIn to check that the
  profile exists.
- Percent-encoded and unicode forms of the same slug are treated as two
  distinct slugs — no decoding or normalization is performed.
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
