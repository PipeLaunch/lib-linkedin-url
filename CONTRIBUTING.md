# Contributing

Thanks for your interest in improving `lib-linkedin-url`!

## Development setup

Requirements: **Node.js 24** (see `.nvmrc`). Anything from Node 22.18 up works —
the tests run TypeScript directly through Node's built-in type stripping, which
is enabled by default since 22.18.

```sh
nvm use        # or: fnm use
npm install    # also builds dist/ via the prepare script
npm test
```

## Scripts

| Script                            | What it does                                             |
| --------------------------------- | -------------------------------------------------------- |
| `npm run build`                   | Bundle `dist/` (CJS + ESM + type declarations) with tsup |
| `npm run typecheck`               | `tsc` (no emit) over sources, tests and config           |
| `npm test`                        | `node --test` over `src/**/*.test.ts`                    |
| `npm run test:watch`              | Tests in watch mode                                      |
| `npm run test:coverage`           | Tests with V8 coverage                                   |
| `npm run lint` / `lint:fix`       | ESLint with type-checked rules                           |
| `npm run format` / `format:check` | Prettier                                                 |
| `npm run lint:package`            | publint + arethetypeswrong against the packed tarball    |

## Project conventions

- **`src/package.json` (`{"type": "module"}`) is load-bearing.** It tells Node
  and tsc to treat the TypeScript sources as ESM, which lets `node --test` run
  them natively and makes `verbatimModuleSyntax` valid. It is dev-only — the
  published package only contains `dist/`. Please don't "clean it up".
- **Relative imports use explicit `.ts` extensions.** Node's type stripping
  executes the `.ts` files directly and resolves specifiers as written;
  extensionless relative imports fail at runtime.
- **TypeScript is intentionally pinned to `~6.0.x`.** typescript-eslint's peer
  range caps at `<6.1.0`, and TypeScript 7 (the native compiler) no longer
  ships the JS compiler API that typescript-eslint and tsup's declaration
  build depend on. Widen the pin when both catch up. Related: TypeScript 6
  turns deprecated compiler options into errors, and tsup's dts worker
  injects the deprecated `baseUrl` internally — that is why `tsup.config.mts`
  sets `ignoreDeprecations: "6.0"` for the dts build only.
- **Tests are table-driven**: each URL is its own named subtest, so a failure
  names the exact input that broke. Public API tests import from
  `src/index.ts` (the barrel), so a broken export fails loudly.
- **Regexes live in `src/internal/patterns.ts`**, compiled once at module
  scope and never with the `g` flag (a module-scoped `g` regex keeps
  `lastIndex` state between calls).

## LinkedIn URL format notes

- Person profiles: `linkedin.com/in/<slug>`, plus the mobile variants
  `/m/in/<slug>` and `/mwlite/in/<slug>`.
- Legacy numeric person format (404s on linkedin.com since ~2017):
  `xx.linkedin.com/pub/<name>/<id>/<id>/<id>` — supported behind
  `{ numeric: true }` for parsing old datasets.
- `linkedin.com/profile/view?id=<id>` is another dead format and is
  intentionally unsupported.
- LinkedIn's official vanity-slug rule is "3-100 letters or numbers", but real
  slugs also contain unicode letters, `&'._-` and percent-encoded UTF-8 bytes,
  so validation is charset-only (no length check).

## Releasing (maintainers)

1. Set the new `version` in `package.json` and date the entry in
   `CHANGELOG.md`.
2. `npm publish` — the `prepublishOnly` gate runs format check, lint,
   typecheck, tests, build and package validation before anything is uploaded
   (`npm adduser` first if needed; the 2FA code arrives by email).
3. Merge to `main`, tag `v<version>`, push the tag and create a GitHub
   release.
