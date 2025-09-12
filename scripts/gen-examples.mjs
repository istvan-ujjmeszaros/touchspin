#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pkgsDir = path.join(root, 'packages');

function ensureIndex(pkgName, dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.html'));
  if (files.length === 0) return;
  const items = files.map((f) => `<li><a href="./${f}">${f}</a></li>`).join('');
  const html = `<!doctype html>
  <meta charset="utf-8">
  <title>${pkgName} Examples</title>
  <h1>${pkgName} Examples</h1>
  <ul>${items}</ul>`;
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

const entries = fs.readdirSync(pkgsDir, { withFileTypes: true }).filter((d) => d.isDirectory());
for (const d of entries) {
  const exampleDir = path.join(pkgsDir, d.name, 'example');
  if (fs.existsSync(exampleDir)) {
    ensureIndex(d.name, exampleDir);
  }
}

console.log('Example indexes generated.');

