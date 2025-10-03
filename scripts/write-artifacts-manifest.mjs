#!/usr/bin/env node
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: write-artifacts-manifest.mjs --dir <outputDir> key=value [key=value ...]');
  process.exit(1);
}

let targetDir = null;
const data = Object.create(null);

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--dir') {
    const next = args[i + 1];
    if (!next) {
      console.error('Missing value after --dir');
      process.exit(1);
    }
    targetDir = next;
    i += 1; // skip next, already consumed
    continue;
  }

  const eqIdx = arg.indexOf('=');
  if (eqIdx === -1) {
    console.error(`Invalid argument "${arg}". Expected key=value format.`);
    process.exit(1);
  }
  const key = arg.slice(0, eqIdx);
  const value = arg.slice(eqIdx + 1);
  if (!key) {
    console.error(`Invalid key in argument "${arg}".`);
    process.exit(1);
  }
  data[key] = value;
}

if (!targetDir) {
  console.error('Missing --dir <outputDir> argument.');
  process.exit(1);
}

const manifestPath = path.join(targetDir, 'artifacts.json');

try {
  await mkdir(targetDir, { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`Artifacts manifest written to ${manifestPath}`);
} catch (error) {
  console.error(
    `Failed to write manifest at ${manifestPath}:`,
    error instanceof Error ? error.message : error
  );
  process.exit(1);
}
