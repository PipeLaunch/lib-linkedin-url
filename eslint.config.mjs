import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { files: ["**/*.{ts}"] },
  { languageOptions: { globals: globals.browser } },
  {
    ignores: ["**/dist/", "*.js"],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
