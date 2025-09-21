// /scripts/gherkin-guard-dog.mjs
// Scans the whole repo (or given paths) for *.spec.ts files,
// validates the checklist at the top of each file against actual test() titles.
//
// Usage:
//   node scripts/gherkin-guard-dog.mjs         # scan CWD recursively
//   node scripts/gherkin-guard-dog.mjs src e2e # scan specific roots
//
// Optional env flags:
//   REQUIRE_CHECKLIST=1  -> fail if a spec file has no checklist
//   VERBOSE=1            -> print per-file OK messages

import fs from "node:fs";
import path from "node:path";

const ROOTS = process.argv.slice(2);
const START_DIRS = ROOTS.length ? ROOTS.map(p => path.resolve(p)) : [process.cwd()];
const SPEC_REGEX = /\.spec\.ts$/i;

// common junk to skip while walking
const IGNORE_DIRS = new Set([
  "node_modules", ".git", "dist", "build", "coverage", ".next", "out",
  ".turbo", ".cache", ".yarn", ".pnpm", ".idea", ".vscode", "tmp"
]);

const REQUIRE_CHECKLIST = process.env.REQUIRE_CHECKLIST === "1";
const VERBOSE = process.env.VERBOSE === "1";

// ---------- fs helpers ----------
function walk(dir, acc = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc; // unreadable dir
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!IGNORE_DIRS.has(e.name)) walk(full, acc);
    } else if (e.isFile() && SPEC_REGEX.test(e.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function readFile(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

// ---------- parsing ----------
function parseChecklistBlock(src) {
  // Look for our checklist header; assume it's inside a /* ... */ block.
  const anchor = src.indexOf("CHECKLIST — Scenarios in this spec");
  if (anchor === -1) return null;

  const blockStart = src.lastIndexOf("/*", anchor);
  const blockEnd = src.indexOf("*/", anchor);
  if (blockStart === -1 || blockEnd === -1) return null;

  const raw = src.slice(blockStart, blockEnd + 2);
  const lines = raw.split(/\r?\n/).map(l => l.replace(/^\s*\*\s?/, "").trim());

  const items = [];
  for (const ln of lines) {
    const m = ln.match(/^\[(x| )\]\s+(.+)$/i);
    if (m) items.push({ checked: m[1].toLowerCase() === "x", title: m[2].trim() });
  }
  if (!items.length) return null;
  return { raw, items };
}

function parseTests(src) {
  const implementedTests = [];
  const skippedTests = [];

  // matches: test('Title',   or  test("Title", with optional comments
  const testRe = /^\s*(?:\/\/.*\n\s*)?test\s*\(\s*['"`]([^'"`]+)['"`]\s*,/gm;
  let m;
  while ((m = testRe.exec(src))) {
    implementedTests.push(m[1].trim());
  }

  // matches: test.skip('Title',   or  test.skip("Title", with optional comments
  const skipRe = /^\s*(?:\/\/.*\n\s*)?test\.skip\s*\(\s*['"`]([^'"`]+)['"`]\s*,/gm;
  while ((m = skipRe.exec(src))) {
    skippedTests.push(m[1].trim());
  }

  return { implementedTests, skippedTests };
}

function findDuplicates(arr) {
  const seen = new Map();
  const dups = new Set();
  for (const v of arr) {
    const n = (seen.get(v) || 0) + 1;
    seen.set(v, n);
    if (n > 1) dups.add(v);
  }
  return [...dups];
}

// ---------- per-file validation ----------
function validateSpec(file) {
  const src = readFile(file);
  const { implementedTests, skippedTests } = parseTests(src);
  const checklist = parseChecklistBlock(src);

  const errors = [];
  const warnings = [];

  if (!checklist) {
    if (REQUIRE_CHECKLIST) {
      errors.push("Missing checklist block at top of file.");
    } else if (VERBOSE) {
      console.log(`(i) ${file}: no checklist found — skipping validation`);
    }
    return { ok: !REQUIRE_CHECKLIST, errors, warnings, implementedTests, skippedTests, checklistItems: [] };
  }

  const items = checklist.items;
  const checklistTitles = items.map(i => i.title);
  const implementedMarked = new Set(items.filter(i => i.checked).map(i => i.title));
  const unimplementedMarked = new Set(items.filter(i => !i.checked).map(i => i.title));
  const implementedTestSet = new Set(implementedTests);
  const skippedTestSet = new Set(skippedTests);

  // [x] must exist as test() (not test.skip())
  for (const title of implementedMarked) {
    if (!implementedTestSet.has(title)) {
      if (skippedTestSet.has(title)) {
        errors.push(`Marked as implemented [x] but test is skipped: "${title}" — either implement or flip to [ ].`);
      } else {
        errors.push(`Marked as implemented [x] but test not found: "${title}"`);
      }
    }
  }

  // [ ] must exist as test.skip()
  for (const title of unimplementedMarked) {
    if (!skippedTestSet.has(title)) {
      if (implementedTestSet.has(title)) {
        errors.push(`Scenario is unchecked [ ] but test is implemented: "${title}" — flip it to [x].`);
      } else {
        errors.push(`Scenario is unchecked [ ] but no test.skip() found: "${title}"`);
      }
    }
  }

  // test() must appear in checklist as [x]
  for (const t of implementedTests) {
    if (!checklistTitles.includes(t)) {
      errors.push(`Implemented test not listed in checklist: "${t}"`);
    } else if (!implementedMarked.has(t)) {
      errors.push(`Implemented test is not marked [x] in checklist: "${t}"`);
    }
  }

  // test.skip() must appear in checklist as [ ]
  for (const t of skippedTests) {
    if (!checklistTitles.includes(t)) {
      errors.push(`Skipped test not listed in checklist: "${t}"`);
    } else if (!unimplementedMarked.has(t)) {
      errors.push(`Skipped test is not marked [ ] in checklist: "${t}"`);
    }
  }

  // duplicate titles checks
  const dupChecklist = findDuplicates(checklistTitles);
  if (dupChecklist.length) {
    errors.push(`Duplicate scenario titles in checklist: ${dupChecklist.map(s => `"${s}"`).join(", ")}`);
  }
  const dupImplemented = findDuplicates(implementedTests);
  if (dupImplemented.length) {
    errors.push(`Duplicate test() titles: ${dupImplemented.map(s => `"${s}"`).join(", ")}`);
  }
  const dupSkipped = findDuplicates(skippedTests);
  if (dupSkipped.length) {
    errors.push(`Duplicate test.skip() titles: ${dupSkipped.map(s => `"${s}"`).join(", ")}`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    implementedTests,
    skippedTests,
    checklistItems: items
  };
}

// ---------- run ----------
let total = 0, failed = 0;
for (const root of START_DIRS) {
  const files = walk(root);
  for (const file of files) {
    total++;
    const { ok, errors } = validateSpec(file);
    if (!ok) {
      failed++;
      console.error(`❌ Guard: ${file}`);
      for (const e of errors) console.error(`   - ${e}`);
    } else if (VERBOSE) {
      console.log(`✅ Guard: ${file}`);
    }
  }
}

if (failed) {
  console.error(`\nGuard failed in ${failed} of ${total} spec file(s).`);
  process.exit(1);
} else {
  console.log(`\nGuard passed for ${total} spec file(s). 🐶✅`);
}
