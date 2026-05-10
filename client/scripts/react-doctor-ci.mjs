import { spawnSync } from "node:child_process";

const minScore = 80;
const result = spawnSync(
  "react-doctor",
  [".", "--json", "--offline", "--fail-on", "none"],
  {
    encoding: "utf8",
    shell: process.platform === "win32",
  },
);

if (result.error) {
  console.error(`React Doctor failed to start: ${result.error.message}`);
  process.exit(1);
}

let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  console.error("React Doctor did not return valid JSON.");
  if (result.stdout) console.error(result.stdout);
  if (result.stderr) console.error(result.stderr);
  process.exit(1);
}

const summary = report.summary ?? {};
const score = summary.score ?? report.score;
const errorCount = summary.errorCount ?? 0;
const warningCount = summary.warningCount ?? 0;

console.log(
  `React Doctor score ${score}/100 (${errorCount} errors, ${warningCount} warnings)`,
);

if (result.status !== 0 || report.ok === false) {
  console.error(report.error ?? "React Doctor reported an unsuccessful scan.");
  process.exit(result.status || 1);
}

if (errorCount > 0) {
  console.error("React Doctor found error-level diagnostics.");
  process.exit(1);
}

if (typeof score !== "number" || score < minScore) {
  console.error(`React Doctor score must be at least ${minScore}.`);
  process.exit(1);
}
