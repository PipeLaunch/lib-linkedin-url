import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

/**
 * Regression for catastrophic regex backtracking. Under the `iu` flags U+0345
 * matches both a combining-mark and (case-folded) a letter class; when those
 * were separate alternatives inside a repeated group, `a` + 25 x U+0345 + `!`
 * took seconds to reject. A runaway regex cannot be interrupted in-process,
 * so each check runs in a child process with a hard timeout.
 */

const INDEX_URL = new URL("../index.ts", import.meta.url).href;
const TIMEOUT_MS = 5000;

/** Runs `expression` (which sees the library as `lib` and the slug as `slug`) in a child process. */
function runIsolated(expression: string): {
  timedOut: boolean;
  stdout: string;
  stderr: string;
} {
  const script = `
    const lib = await import(${JSON.stringify(INDEX_URL)});
    const slug = "a" + String.fromCharCode(0x345).repeat(25) + "!";
    const result = ${expression};
    process.stdout.write(JSON.stringify(result));
  `;
  const child = spawnSync(
    process.execPath,
    ["--no-warnings", "--input-type=module", "-e", script],
    { encoding: "utf8", timeout: TIMEOUT_MS },
  );
  return {
    timedOut: child.error !== undefined || child.signal !== null,
    stdout: child.stdout,
    stderr: child.stderr,
  };
}

const CASES: [kind: string, expression: string][] = [
  [
    "person",
    "lib.isValidLinkedInProfileUrl(`https://linkedin.com/in/${slug}`)",
  ],
  [
    "company",
    "lib.isValidCompanyLinkedInProfileUrl(`https://linkedin.com/company/${slug}`)",
  ],
  [
    "school",
    "lib.isValidSchoolLinkedInProfileUrl(`https://linkedin.com/school/${slug}`)",
  ],
  [
    "person, letter-like first unit",
    "lib.isValidLinkedInProfileUrl(`https://linkedin.com/in/ⓐ${slug}`)",
  ],
  [
    "legacy /pub/",
    "lib.isValidLinkedInProfileUrl(`https://linkedin.com/pub/${slug}/1/2/3`, { numeric: true })",
  ],
];

describe("no catastrophic backtracking on overlapping Unicode classes", () => {
  for (const [kind, expression] of CASES) {
    it(`${kind}: a + 25 x U+0345 + ! is rejected within ${String(TIMEOUT_MS)} ms`, () => {
      const run = runIsolated(expression);
      assert.equal(run.timedOut, false, `timed out; stderr: ${run.stderr}`);
      assert.equal(run.stdout, "false", `stderr: ${run.stderr}`);
    });
  }
});
