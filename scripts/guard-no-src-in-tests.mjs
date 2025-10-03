#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET_DIRS = ['__tests__', 'packages'];

const FILE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.html', '.mjs', '.cjs']);

const offenders = [];

function walk(dir, isTestDir = false) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.git'))
      continue;
    const p = path.join(dir, entry.name);

    // Check if we're in a test directory or entering one
    const currentIsTest = isTestDir || entry.name === '__tests__' || entry.name === 'tests';

    if (entry.isDirectory()) {
      walk(p, currentIsTest);
    } else if (currentIsTest) {
      // Only check files in test directories
      const ext = path.extname(entry.name).toLowerCase();
      if (!FILE_EXTS.has(ext)) continue;
      const text = fs.readFileSync(p, 'utf8');
      // Catch any "/src/" loads:
      //  - <script src=".../src/...">
      //  - import('.../src/...')
      //  - from '.../src/...'
      //  - require('.../src/...')
      const bad =
        /<script[^>]+src=["'][^"']*\/src\/[^"']*["']/i.test(text) ||
        /\bimport\s*\(\s*["'][^"']*\/src\/[^"']*["']\s*\)/.test(text) ||
        /\bfrom\s+["'][^"']*\/src\/[^"']*["']/.test(text) ||
        /\brequire\s*\(\s*["'][^"']*\/src\/[^"']*["']\s*\)/.test(text);

      if (bad) offenders.push(p.replace(ROOT + path.sep, ''));
    }
  }
}

for (const d of TARGET_DIRS) {
  const abs = path.join(ROOT, d);
  if (fs.existsSync(abs)) walk(abs);
}

if (offenders.length) {
  console.error('❌ No /src/ imports allowed in tests. Use /dist/index.js instead.\nOffenders:');
  for (const f of offenders) console.error(' -', f);
  process.exit(1);
} else {
  process.exit(0);
}
