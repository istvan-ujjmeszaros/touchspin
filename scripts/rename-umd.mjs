#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

const [, , filePath] = process.argv;

if (!filePath) {
  console.error('Usage: rename-umd <filePath>');
  process.exit(1);
}

const resolved = resolve(process.cwd(), filePath);
const newPath = resolved.endsWith('.global.js')
  ? resolved.replace(/\.global\.js$/, '.umd.js')
  : resolved.replace(/\.js$/, '.umd.js');
if (resolved === newPath) {
  console.log('File already has .umd.js extension');
  process.exit(0);
}

async function move(source, target) {
  await fs.rename(source, target);
  try {
    await fs.rename(`${source}.map`, `${target}.map`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

move(resolved, newPath)
  .then(() => {
    console.log(`Renamed ${resolved} -> ${newPath}`);
  })
  .catch((error) => {
    console.error(`Failed to rename ${resolved}`);
    console.error(error);
    process.exit(1);
  });
