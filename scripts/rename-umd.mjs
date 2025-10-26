#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

const [, , sourcePathArg, targetPathArg] = process.argv;

if (!sourcePathArg || !targetPathArg) {
  console.error('Usage: rename-umd <sourcePath> <targetPath>');
  console.error('');
  console.error('Renames a UMD build file from tsup output to the desired target name.');
  console.error('Both paths must include the .js extension.');
  console.error('');
  console.error('Example:');
  console.error(
    '  rename-umd dist/umd/bootstrap5.global.js dist/umd/jquery.touchspin-bootstrap5.umd.js'
  );
  console.error('');
  console.error('Note: Source maps (.js.map) are also renamed automatically if present.');
  process.exit(1);
}

const sourcePath = resolve(process.cwd(), sourcePathArg);
const targetPath = resolve(process.cwd(), targetPathArg);

if (!sourcePath.endsWith('.js')) {
  console.error('Error: source path must end with .js');
  console.error(`Got: ${sourcePath}`);
  process.exit(1);
}

if (!targetPath.endsWith('.js')) {
  console.error('Error: target path must end with .js');
  console.error(`Got: ${targetPath}`);
  process.exit(1);
}

if (targetPath === sourcePath) {
  console.log('Source and target are identical, nothing to do');
  process.exit(0);
}

async function safeRename(source, target) {
  // Remove target file if it exists (cleanup from previous builds)
  try {
    await fs.rm(target, { force: true });
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  // Rename the main file
  await fs.rename(source, target);

  // Also rename source map if it exists
  const sourceMap = `${source}.map`;
  const targetMap = `${target}.map`;

  try {
    await fs.access(sourceMap);
    // Source map exists, rename it
    await fs.rm(targetMap, { force: true });
    await fs.rename(sourceMap, targetMap);
    console.log(`Renamed ${sourcePath} -> ${targetPath} (with source map)`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // No source map, that's fine
      console.log(`Renamed ${sourcePath} -> ${targetPath}`);
    } else {
      throw error;
    }
  }
}

safeRename(sourcePath, targetPath).catch((error) => {
  console.error(`Failed to rename ${sourcePath} -> ${targetPath}`);
  console.error(error);
  process.exit(1);
});
