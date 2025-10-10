#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const roots = [
  'packages/core/devdist',
  'packages/renderers/vanilla/devdist',
  'packages/renderers/bootstrap5/devdist',
  'packages/renderers/bootstrap4/devdist',
  'packages/renderers/bootstrap3/devdist',
  'packages/renderers/tailwind/devdist',
  'packages/web-component/devdist',
  'packages/adapters/jquery/devdist',
  'packages/adapters/standalone/devdist',
  'packages/adapters/webcomponent/devdist',
];

const offenders = [];
const rx = /from\s+['"](\.\/|\.\.\/)[^'"]*['"]/g; // any relative import
const hasJs = (p) => p.endsWith('.js') || p.endsWith('.mjs');

for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  for (const file of fs.readdirSync(root)) {
    if (!file.endsWith('.js')) continue;
    const full = path.join(root, file);
    const txt = fs.readFileSync(full, 'utf8');
    let m;
    while ((m = rx.exec(txt))) {
      const spec = m[0].match(/['"]([^'"]+)['"]/)[1];
      if (!hasJs(spec)) offenders.push(`${full} -> ${spec}`);
    }
  }
}

if (offenders.length) {
  console.error(
    '❌ ESM guard: relative imports missing ".js" extension:\n' +
      offenders.map((s) => `  - ${s}`).join('\n')
  );
  process.exit(1);
} else {
  console.log('✅ ESM guard: all relative imports use ".js"');
}
