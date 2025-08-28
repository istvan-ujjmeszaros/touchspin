#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdirSync, createWriteStream, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
let out = 'reports/json/last.json';
const testArgs = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if ((a === '--output' || a === '-o') && args[i+1]) { out = args[i+1]; i++; continue; }
  testArgs.push(a);
}

mkdirSync(resolve('reports/json'), { recursive: true });
const outStream = createWriteStream(out, { flags: 'w' });

const cp = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['playwright', 'test', ...testArgs, '--reporter=json'], { stdio: ['ignore', 'pipe', 'inherit'] });
cp.stdout.pipe(outStream);

cp.on('close', (code) => {
  try {
    if (!existsSync(out)) {
      console.error('JSON report not found:', out);
      process.exit(code || 1);
    }
    const txt = readFileSync(out, 'utf8');
    const data = JSON.parse(txt);
    const fails = [];
    const walk = (s) => {
      if (s.suites) s.suites.forEach(walk);
      if (s.specs) s.specs.forEach(sp => {
        if (!sp.ok) {
          (sp.tests||[]).forEach(t => (t.results||[]).forEach(r => (r.errors||[]).forEach(e => {
            fails.push({ title: sp.title, message: (e.message||'').split('\n')[0] });
          })));
        }
      });
    };
    walk(data);
    if (fails.length) {
      console.log('--- Playwright Failures (summary) ---');
      for (const f of fails) console.log(`FAIL: ${f.title}\n  message: ${f.message}`);
    } else {
      console.log('All tests passed');
    }
  } catch (err) {
    console.error('Failed to parse JSON report:', err);
  } finally {
    process.exit(code);
  }
});

