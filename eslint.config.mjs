import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/", "coverage/"] },
  {
    files: ["**/*.ts", "**/*.mts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      // node:test's describe/it return promises by design; awaiting them is not required.
      "@typescript-eslint/no-floating-promises": [
        "error",
        {
          allowForKnownSafeCalls: [
            {
              from: "package",
              name: ["describe", "it", "test"],
              package: "node:test",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.mjs", "**/*.cjs"],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
);
