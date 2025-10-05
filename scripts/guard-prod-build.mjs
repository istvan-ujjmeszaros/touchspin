#!/usr/bin/env node
/**
 * Production Build Guard
 *
 * Checks if production dist/ is stale and rebuilds only if needed.
 * Used by build:test to ensure IIFE bundles get fresh code from package.json exports.
 *
 * Usage: node scripts/guard-prod-build.mjs packages/core [packages/other...]
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getNewestFileMtime } from './utils/file-mtime.mjs';

const __dirname = new URL('.', import.meta.url).pathname;
const projectRoot = join(__dirname, '..');

/**
 * Check if production dist/ is stale by comparing file modification times
 * Returns true if ANY source file is newer than ANY dist file
 */
function isDistStale(packagePath) {
  const srcPath = join(projectRoot, packagePath, 'src');
  const distPath = join(projectRoot, packagePath, 'dist');

  // If src doesn't exist, package doesn't need building
  if (!existsSync(srcPath)) {
    return false;
  }

  // If dist doesn't exist but src does, it's definitely stale
  if (!existsSync(distPath)) {
    return true;
  }

  try {
    const newestSrcMtime = getNewestFileMtime(srcPath);
    const newestDistMtime = getNewestFileMtime(distPath, {
      ignoreExtensions: ['.d.ts', '.d.ts.map'],
    });

    // If any source file is newer than any dist file, it's stale
    return newestSrcMtime > newestDistMtime;
  } catch {
    // If we can't stat, assume stale to be safe
    return true;
  }
}

/**
 * Guard and rebuild a single package's production dist/ if needed
 */
function guardAndRebuild(packagePath) {
  const packageName = packagePath
    .replace('packages/', '@touchspin/')
    .replace('renderers/', 'renderer-');

  if (isDistStale(packagePath)) {
    console.log(`📦 ${packageName}: Production dist/ is stale, rebuilding...`);
    try {
      execSync('yarn build', {
        cwd: join(projectRoot, packagePath),
        stdio: 'inherit',
        timeout: 120000, // 2 minute timeout
      });
      console.log(`✅ ${packageName}: Production build complete`);
    } catch (error) {
      console.error(`❌ ${packageName}: Production build failed:`, error.message);
      process.exit(1);
    }
  } else {
    console.log(`✅ ${packageName}: Production dist/ is up to date`);
  }
}

function main() {
  // Get package paths from command line args
  const packages = process.argv.slice(2);

  if (packages.length === 0) {
    console.error('Usage: node scripts/guard-prod-build.mjs <package-path> [package-path...]');
    console.error('Example: node scripts/guard-prod-build.mjs packages/core');
    process.exit(1);
  }

  console.log('🔍 Checking production dist/ staleness...');

  for (const packagePath of packages) {
    guardAndRebuild(packagePath);
  }

  console.log('✅ All production builds are up to date');
}

// Run the guard
main();
