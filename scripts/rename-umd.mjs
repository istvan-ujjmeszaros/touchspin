#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

const [, , sourcePathArg, targetBaseArg] = process.argv;

if (!sourcePathArg) {
  console.error('Usage: rename-umd <sourcePath> [targetBasePath]');
  process.exit(1);
}

const sourcePath = resolve(process.cwd(), sourcePathArg);

if (!sourcePath.endsWith('.js')) {
  console.error('rename-umd: source file must end with .js');
  process.exit(1);
}

const targetBasePath = targetBaseArg ? resolve(process.cwd(), targetBaseArg) : null;

function normalizeBasePath(pathWithMaybeJsExt) {
  return pathWithMaybeJsExt.endsWith('.js') ? pathWithMaybeJsExt.slice(0, -3) : pathWithMaybeJsExt;
}

const desiredBase = targetBasePath
  ? normalizeBasePath(targetBasePath)
  : normalizeBasePath(sourcePath);
const targetPath = `${desiredBase}.umd.js`;

if (targetPath === sourcePath) {
  console.log('File already has .umd.js extension');
  process.exit(0);
}

async function safeRename(source, target) {
  // Ensure previous artifacts don't block rename
  try {
    await fs.rm(target, { force: true });
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  await fs.rename(source, target);

  const sourceMap = `${source}.map`;
  const targetMap = `${target}.map`;
  try {
    await fs.rm(targetMap, { force: true });
    await fs.rename(sourceMap, targetMap);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

safeRename(sourcePath, targetPath)
  .then(() => {
    console.log(`Renamed ${sourcePath} -> ${targetPath}`);
  })
  .catch((error) => {
    console.error(`Failed to rename ${sourcePath}`);
    console.error(error);
    process.exit(1);
  });
