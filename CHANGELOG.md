# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.2] - 2026-11-24

### Fixed

- A person, company or school slug may start with a letter-like symbol
  again, as in 2.x: a circled, parenthesized, squared or negative letter or
  digit. 3.0.0–3.1.1 rejected slugs such as
  `/in/ⓞⓡⓐ-ⓓⓞⓔ-123456789` in both spellings, because `ⓞ` is a
  symbol (`\p{So}`), not a letter; the same circled letter after the first
  unit was already accepted. Raw or encoded, it now extracts
  `%E2%93%9E%E2%93%A1%E2%93%90-%E2%93%93%E2%93%9E%E2%93%94-123456789`:
  these symbols are output percent-encoded, like any symbol outside
  `© ® ° ℠ ™`, and escapes are not case-folded (`Ⓞ` stays `%E2%93%84`). The
  set is U+2460–U+24FF (Enclosed Alphanumerics) and, from U+1F100–U+1F1FF,
  only the digit and A–Z forms: U+1F100–U+1F10C, U+1F110–U+1F129,
  U+1F130–U+1F149, U+1F150–U+1F169 and U+1F170–U+1F189. Every other symbol
  in first position stays rejected: `®`, `©`, `°`, `™`, `℠`, emoji,
  regional indicators (flags), lookalikes and invisible characters. Legacy
  `/pub/` names are unchanged. Results for every other URL are unchanged.

## [3.1.1] - 2026-11-23

### Fixed

- A person, company or school slug that holds an invisible format character
  is rejected again: 3.1.0 accepted the raw form (`/in/jane` + U+FEFF +
  `doe` gave `jane%EF%BB%BFdoe`). The encoded spelling, accepted since
  3.0.0, is now rejected too (`/in/jane%EF%BB%BFdoe`, `/in/jane%E2%80%8Bdoe`),
  so both return `false` / `""` from every function. Such a slug is a
  copy-paste artefact. The characters are U+00AD (soft hyphen), U+180E,
  U+200B, U+200E, U+200F, U+202A–U+202E, U+2060–U+2064, U+2066–U+2069 and
  U+FEFF, anywhere in the slug. ZWNJ (U+200C, used in Persian and Indic
  names) and ZWJ (U+200D, inside emoji sequences) stay accepted, and legacy
  `/pub/` names are unchanged.

## [3.1.0] - 2026-11-23

### Added

- A raw non-ASCII character that may not appear literally in a person,
  company or school slug (emoji, symbols other than `©`, `®`, `°`, `℠` and
  `™`, lookalikes, the variation selectors U+FE0E/U+FE0F) is now
  percent-encoded (UTF-8, uppercase hex) instead of making the URL invalid,
  so the raw and the encoded spelling give the same result from every
  function. Slugs such as `/in/alex-moss🔜-xds-123456780`,
  `/in/mia-stone-♦️-00a1234` and `/in/abc、abcd` extract
  `alex-moss%F0%9F%94%9C-xds-123456780`, `mia-stone-%E2%99%A6%EF%B8%8F-00a1234`
  and `abc%E3%80%81abcd`, exactly as their encoded URLs did in 3.0.0.

### Changed

- `isValidLinkedInProfileUrl()`, `isValidCompanyLinkedInProfileUrl()` and
  `isValidSchoolLinkedInProfileUrl()` now accept URLs they rejected in 3.0.0:
  those whose slug holds such a raw character after its first unit, and
  `extract*` / `generateCanonical*` return a slug for them instead of `""`.
  Results for URLs that 3.0.0 accepted are unchanged.
- Lookalikes stay safe: the character is never kept literally, only as an
  escape in the output (`/in/jane∕doe` -> `jane%E2%88%95doe`), so a slug
  still cannot pass for another one or show a fake path segment.
- Still rejected, as in 3.0.0: a raw symbol as the first unit (`/in/🔜-x`,
  rejected in its encoded form too); raw ASCII symbols (`<`, `+`, `=`, `|`,
  `!`, ...), a bare `%`, whitespace (including non-ASCII spaces such as
  U+00A0 and U+3000), control characters and unpaired surrogates, which are
  not encoded although their escapes (`%2B`, `%20`) are accepted; and raw
  symbols in legacy `/pub/` names. The 2048-character limit applies to the
  slug after encoding, as it does to the encoded spelling.

## [3.0.0] - 2026-11-22

A major release: no API was removed, but `extract*` and `generateCanonical*`
return a different string for some inputs (decoded slugs, Unicode NFC,
uppercase escape hex), and some URLs that 2.0.2 accepted are now rejected.
See **Changed** below, and "Migrating from 2.x" in the README, before
upgrading if you store or compare these values.

### Fixed

- Person, company and school slugs may contain the symbols `©`, `®`, `°`,
  `℠` and `™` after the first character, e.g.
  `/in/adam-hirsch-cima®-crpc®-6a2a9b3`; LinkedIn issues these and they were
  previously rejected while the percent-encoded form passed. A slug must still
  start (after any `-`/`~`) with a letter, digit or an escape that is not
  valid UTF-8, so `/in/®` and `/in/-®-` stay invalid. This is an allow-list: every other
  symbol, including emoji (`😀`, `❤`, flags), slash-lookalikes (`∕`, `⁄`,
  `⫽`, `⌿`) and lookalikes of ASCII characters (`＜`, `˜`, `´`), is
  rejected literally and stays percent-encoded when given encoded, so a
  canonical URL never shows a fake path segment or one slug posing as
  another. ASCII symbols, whitespace and control characters are still
  rejected.

### Changed

- Raw and percent-encoded spellings of a person, company or school slug now
  give the same result. `extract*` and `generateCanonical*` return the
  decoded slug (`cima%C2%AE` -> `cima®`); escapes of characters that may not
  appear literally are kept with uppercase hex (`%2F`, previously `%2f` in
  canonical URLs). See "Slug normalization" in the README.
- Consequently a slug is now rejected, like its raw form, when its first
  character after any leading `-`/`~` is an escape that decodes to a
  character that may not start a slug. These URLs were valid in 2.0.2:
  - a symbol: `/in/%C2%AE`, `/in/%E2%84%A2jane`;
  - `.`, `_`, `&` or `'`: `/in/%2Ejane`, `/in/%5Fjane`, `/in/%26jane`,
    `/in/%27jane`;
  - a combining mark: `/in/%CC%81jane`;
  - a character that stays escaped because it may not appear literally at
    all (space, `/`, an emoji, a lookalike symbol, U+FE0F): `/in/%20jane`,
    `/in/%2Fjane`, `/in/%F0%9F%98%80`, `/in/%E2%88%95jane`.

  Only an escape that is not valid UTF-8 (`/in/%FFjane`) may still start a
  slug. The same applies to company and school slugs and to `/pub/` names.

- The variation selectors U+FE0E and U+FE0F (invisible; they only pick the
  text or emoji look of the previous character, as in `❤️` or `©️`) are no
  longer accepted literally as combining marks, in any slug including
  `/pub/` names, and stay percent-encoded when given encoded:
  `/in/jane%E2%9D%A4%EF%B8%8F` canonicalizes with both characters escaped.
  `/in/jane\uFE0F` was valid in 2.0.2.
- `isNumericCompanyLinkedInProfileUrl()` reads the decoded slug, so a
  percent-encoded numeric ID now counts as numeric:
  `/company/%31%30%33%35` returns `true` (it returned `false` in 2.0.2) and
  canonicalizes to `https://linkedin.com/company/1035`.
- Slugs are put in Unicode NFC (outside percent-escapes), so composed and
  decomposed accents give the same slug: `/in/café`, `/in/cafe%CC%81` and
  a raw `cafe` + U+0301 all extract `café` (composed) and canonicalize to
  `https://linkedin.com/in/café`. In 2.0.2 the decomposed forms returned
  different strings. This applies to company, school and `/pub/` slugs too.
- Slugs longer than 2048 characters (as written in the URL, escapes
  included) are rejected, for person, company, school and `/pub/` URLs.
  LinkedIn names are at most 100 characters (1200 fully percent-encoded).
  The limit bounds the cost of NFC, which is quadratic on long runs of
  combining marks: a crafted 80 000-character slug took seconds to
  validate and is now rejected in milliseconds.
  The limit also applies to the decoded slug and to its lowercased canonical
  form, since NFC and lowercasing can lengthen a slug (U+0344 becomes two
  characters, `İ` lowercases to two): a slug is rejected unless both fit, so
  every canonical URL is itself valid and canonicalizes to itself. 2.0.2 had
  no limit.
- Bytes that are not valid UTF-8 stay escaped one by one and do not stop
  their neighbours from decoding: `jane%C2%AE%FF` and `jane®%FF` both give
  `jane®%FF`, and `/in/%C2%AE%FF` is rejected like `/in/®%FF`.
- Legacy `/pub/` names (`{ numeric: true }`) get the same normalization
  against their own character set (unchanged except for U+FE0E/U+FE0F):
  `/pub/caf%C3%A9/1/2/3` extracts `café`, and `canonicalPubUrl` keeps uppercase hex for escapes it does not
  decode (`%C2%AE`, previously lowercased to `%c2%ae`). A name whose
  escapes decode to a character not allowed first (`/pub/%2Djane/1/2/3`) is
  now rejected, like its raw form.

## [2.0.2] - 2026-11-17

### Fixed

- Person, company and school slugs may start with `-` or `~` and may contain
  `~` (`/in/-jane-doe-`, `/in/~janedoe`, `/in/jane~doe`,
  `/company/-acme-corp-`); these are live LinkedIn URLs and were previously
  rejected. A slug made only of `-`/`~` is still invalid, and the legacy
  `/pub/` format is unchanged.

## [2.0.1] - 2026-10-14

### Added

- `isNumericCompanyLinkedInProfileUrl()`: detects company URLs that use a
  numeric company ID instead of the vanity name

### Fixed

- Slugs may contain combining marks (`\p{M}`), so Devanagari, Thai and other
  scripts with vowel signs, and decomposed accents, are accepted
- Slugs may contain digits of any script (`\p{Nd}`), not only `0-9`
- A URL pasted on top of a prefilled one
  (`linkedin.com/company/www.linkedin.com/company/foo`) is now rejected;
  previously it validated and extracted `www.linkedin.com` as the slug

## [2.0.0] - 2026-08-02

### Added

- Dual ESM + CommonJS builds with a proper `exports` map; TypeScript types
  shipped for both formats
- `generateCanonicalSchoolLinkedInProfileUrl()`
- Exported option types: `CanonicalProfileUrlOptions`,
  `PersonProfileUrlOptions`, `CanonicalPersonProfileUrlOptions`
- `extractLinkedInProfileName()` and `generateCanonicalLinkedInProfileUrl()`
  accept `{ numeric: true }` to handle legacy `/pub/` URLs (previously only
  validation did, incoherently)
- Strict, full-segment company/school slug validation (was on `main` since
  early 2025 but never released to npm)
- GitHub Actions CI on Node 22 + 24: format check, lint, typecheck, tests,
  build, package validation (publint + arethetypeswrong), ESM/CJS smoke tests
- Community docs: CONTRIBUTING, SECURITY, CODE_OF_CONDUCT

### Changed

- **BREAKING**: requires Node.js >= 22 (was >= 18; Node 18 and 20 are EOL)
- **BREAKING**: deep imports (`lib-linkedin-url/dist/...`) are blocked by the
  `exports` map — import from the package root
- **BREAKING**: person profile slugs are validated with the same character set
  as company slugs; URLs like `/in/a b`, `/in/a<script>` or with empty slugs
  (`/in/`, `/mwlite/in/`) are no longer considered valid
- **BREAKING**: a `%` in any slug must form a valid `%XX` escape (`/company/%`
  is no longer valid)
- **BREAKING**: legacy `/pub/` URLs (`{ numeric: true }`) must have exactly
  three id segments, matching the real historical format
- Canonicalizing a school URL through
  `generateCanonicalCompanyLinkedInProfileUrl()` now preserves the `/school/`
  path segment instead of rewriting it to `/company/` (which pointed at a
  different LinkedIn entity)
- Country lookup is O(1) (plain object) instead of scanning a 251-entry array
- Internals rewritten around a single set of shared, precompiled regexes
  (previously the host pattern was hand-written six times)
- Tests migrated from Jest to the built-in `node:test` runner and restructured
  into table-driven cases (one named subtest per URL)
- Build migrated from `tsc` to `tsup`

### Fixed

- `extractLinkedInSubdomain()` / `extractCountryName()` never matched
  `http://` or protocol-less URLs due to a regex typo (`http?s`), which also
  made `keepTld` canonicalization silently fall back to `www`; URLs without a
  path now work too, and only real 2-letter subdomains match
- Published type declarations referenced a `TldTable` interface that was never
  shipped, breaking consumers with `skipLibCheck: false`
- JSDoc wrongly claimed unknown countries default to `"United States"` — the
  function returns `""`

### Removed

- `jest`, `ts-jest`, `ts-node`, `@types/jest`, `auto-changelog`,
  `@tsconfig/node22` dev dependencies
- Build output (`dist/`) is no longer committed to git
- Internal scratch notes (`DEV.md`, `NOTES.md`, `TODO.md`) — their contents
  moved into `CONTRIBUTING.md`, source comments and tests

## [1.3.0] - 2025-01-22

- Update tooling to Node 22 era dependencies
- `isValidLinkedInProfileUrl()` rejects bare `/in` URLs without a slug

## [1.2.1] - 2024-06-13

- Update libraries; add numeric company id test

## [1.2.0] - 2023-12-11

- Support unicode company names; update libraries

## [1.1.0] - 2023-06-20

- Add school profile support (`isValidSchoolLinkedInProfileUrl`); update
  dependencies

## [1.0.3] - 2023-04-05

- Maintenance release

## [1.0.2] - 2023-04-05

- Support percent-encoded company names; update libraries

## [1.0.1] - 2022-12-30

- First stable release; regex fixes

## [1.0.0-beta.1] - 2022-10-27

- Initial release

[3.1.2]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v3.1.1...v3.1.2
[3.1.1]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v3.1.0...v3.1.1
[3.1.0]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v2.0.2...v3.0.0
[2.0.2]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v1.3.0...v2.0.0
[1.3.0]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/PipeLaunch/lib-linkedin-url/compare/1.2.0...v1.2.1
[1.2.0]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v1.1.0...1.2.0
[1.1.0]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v1.0.3...v1.1.0
[1.0.3]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v1.0.0-beta.1...v1.0.1
[1.0.0-beta.1]: https://github.com/PipeLaunch/lib-linkedin-url/releases/tag/v1.0.0-beta.1
