import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["cjs", "esm"],
  dts: {
    compilerOptions: {
      // tsup's dts worker injects the deprecated `baseUrl` option internally;
      // TypeScript 6 treats deprecated options as errors without this.
      ignoreDeprecations: "6.0",
    },
  },
  outDir: "dist",
  clean: true,
  sourcemap: false,
  minify: false,
  platform: "node",
  target: "node22",
  treeshake: true,
});
