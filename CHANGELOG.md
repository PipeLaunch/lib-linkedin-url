# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[2.0.0]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v1.3.0...v2.0.0
[1.3.0]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/PipeLaunch/lib-linkedin-url/compare/1.2.0...v1.2.1
[1.2.0]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v1.1.0...1.2.0
[1.1.0]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v1.0.3...v1.1.0
[1.0.3]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/PipeLaunch/lib-linkedin-url/compare/v1.0.0-beta.1...v1.0.1
[1.0.0-beta.1]: https://github.com/PipeLaunch/lib-linkedin-url/releases/tag/v1.0.0-beta.1
