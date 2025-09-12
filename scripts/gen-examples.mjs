#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

// One-time generator for a root /examples/index.html listing page.
// - Does NOT overwrite existing per-package example/index.html files.
// - If a package has no example page, it may create a minimal placeholder.

const root = process.cwd();
const pkgsDir = path.join(root, 'packages');
const rootExamplesDir = path.join(root, 'examples');

/** Return true if file exists and has non-empty, non-whitespace content */
function isNonEmptyFile(file) {
  try {
    const stat = fs.statSync(file);
    if (!stat.isFile()) return false;
    const data = fs.readFileSync(file, 'utf8');
    return data.trim().length > 0;
  } catch {
    return false;
  }
}

/** Create a placeholder index.html if missing or empty. Never replace a non-empty file. */
function ensurePackageExamplePlaceholder(exampleDir, pkgLabel) {
  try {
    if (!fs.existsSync(exampleDir)) return; // nothing to do
    const idx = path.join(exampleDir, 'index.html');
    if (!fs.existsSync(idx) || !isNonEmptyFile(idx)) {
      const html = `<!doctype html>
  <meta charset="utf-8">
  <title>${pkgLabel} Examples</title>
  <h1>${pkgLabel} Examples</h1>
  <p>This is a placeholder index. Add example HTML files in this folder.</p>`;
      fs.writeFileSync(idx, html);
    }
  } catch {
    // ignore errors — placeholders are best-effort
  }
}

const links = [];

function walk(dir, rel = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    const relPath = path.join(rel, e.name);
    if (e.isDirectory()) {
      // If this directory looks like a package (has package.json), check for example dir
      const pkgJson = path.join(full, 'package.json');
      const exampleDir = path.join(full, 'example');
      if (fs.existsSync(pkgJson) && fs.existsSync(exampleDir) && fs.statSync(exampleDir).isDirectory()) {
        // Ensure placeholder only if missing or empty
        ensurePackageExamplePlaceholder(exampleDir, relPath);

        // Collect all HTML files in the example dir
        const files = fs.readdirSync(exampleDir).filter((f) => f.toLowerCase().endsWith('.html'));
        for (const f of files) {
          links.push({ label: `${relPath}/example/${f}`, href: `/packages/${relPath}/example/${f}` });
        }
      }
      // Recurse
      walk(full, relPath);
    }
  }
}

// Build the listing
if (fs.existsSync(pkgsDir)) walk(pkgsDir);
links.sort((a, b) => a.label.localeCompare(b.label));

// Ensure root examples dir and write listing page
fs.mkdirSync(rootExamplesDir, { recursive: true });
const listHtml = `<!doctype html>
<meta charset="utf-8">
<title>Examples</title>
<h1>Examples</h1>
<ul>
${links.map((l) => `  <li><a href="${l.href}">${l.label}</a></li>`).join('\n')}
</ul>`;
fs.writeFileSync(path.join(rootExamplesDir, 'index.html'), listHtml);

console.log(`Generated /examples/index.html with ${links.length} entries. No per-package files were overwritten.`);

