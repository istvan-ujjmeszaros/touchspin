#!/usr/bin/env node
/**
 * DevDist Build Guard
 *
 * Ensures all packages have current devdist build artifacts before tests run.
 * Auto-builds missing or stale devdist folders to prevent test failures.
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getNewestFileMtime } from './utils/file-mtime.mjs';

const __dirname = new URL('.', import.meta.url).pathname;
const projectRoot = join(__dirname, '..');

// Packages that need devdist artifacts for testing
// PR#2: Updated paths for new directory structure
// PR#4: Added standalone adapter
const PACKAGES_WITH_DEVDIST = [
  'packages/core',
  'packages/adapters/jquery',
  'packages/adapters/standalone',
  'packages/adapters/webcomponent',
  'packages/renderers/bootstrap3',
  'packages/renderers/bootstrap4',
  'packages/renderers/bootstrap5',
  'packages/renderers/tailwind',
  'packages/renderers/vanilla',
];

// Required files that must exist in single-root devdist (PR#2)
// PR#3: Removed complete bundles, only ESM + IIFE renderer builds
// PR#4: Added standalone adapter UMD bundles
const REQUIRED_FILES = {
  'packages/core': ['iife/index.global.js', 'artifacts.json'],
  'packages/adapters/jquery': [
    'umd/bootstrap3.global.js',
    'umd/bootstrap4.global.js',
    'umd/bootstrap5.global.js',
    'umd/tailwind.global.js',
    'umd/vanilla.global.js',
    'artifacts.json',
  ],
  'packages/adapters/standalone': [
    'umd/bootstrap3.global.js',
    'umd/bootstrap4.global.js',
    'umd/bootstrap5.global.js',
    'umd/tailwind.global.js',
    'umd/vanilla.global.js',
    'artifacts.json',
  ],
  'packages/adapters/webcomponent': ['vanilla.js', 'artifacts.json'],
  'packages/renderers/bootstrap3': [
    'Bootstrap3Renderer.js',
    'iife/Bootstrap3Renderer.global.js',
    'touchspin-bootstrap3.css',
    'artifacts.json',
  ],
  'packages/renderers/bootstrap4': [
    'Bootstrap4Renderer.js',
    'iife/Bootstrap4Renderer.global.js',
    'touchspin-bootstrap4.css',
    'artifacts.json',
  ],
  'packages/renderers/bootstrap5': [
    'Bootstrap5Renderer.js',
    'iife/Bootstrap5Renderer.global.js',
    'touchspin-bootstrap5.css',
    'artifacts.json',
  ],
  'packages/renderers/tailwind': [
    'TailwindRenderer.js',
    'iife/TailwindRenderer.global.js',
    'artifacts.json',
  ],
  'packages/renderers/vanilla': ['VanillaRenderer.js', 'themes/vanilla.css', 'artifacts.json'],
};

function checkDevdistExists(packagePath) {
  // PR#2: Single-root devdist structure at /devdist/
  // packages/core -> devdist/core
  // packages/renderers/bootstrap5 -> devdist/renderers/bootstrap5
  // packages/adapters/jquery -> devdist/adapters/jquery
  const devdistPath = join(projectRoot, 'devdist', packagePath.replace(/^packages\//, ''));

  if (!existsSync(devdistPath)) {
    return { exists: false, reason: 'devdist folder missing' };
  }

  const requiredFiles = REQUIRED_FILES[packagePath] || ['index.js'];
  const missingFiles = [];

  for (const file of requiredFiles) {
    const filePath = join(devdistPath, file);
    if (!existsSync(filePath)) {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    return {
      exists: false,
      reason: `missing required files: ${missingFiles.join(', ')}`,
    };
  }

  return { exists: true };
}

/**
 * Check if devdist is stale by comparing file modification times
 * Returns true if ANY source file is newer than ANY devdist file
 */
function isDevdistStale(packagePath) {
  const srcPath = join(projectRoot, packagePath, 'src');
  // PR#2: Single-root devdist structure
  const devdistPath = join(projectRoot, 'devdist', packagePath.replace(/^packages\//, ''));

  if (!existsSync(srcPath) || !existsSync(devdistPath)) {
    return false; // Can't determine staleness if paths don't exist
  }

  try {
    const newestSrcMtime = getNewestFileMtime(srcPath);
    const newestDevdistMtime = getNewestFileMtime(devdistPath);

    // If any source file is newer than any devdist file, it's stale
    return newestSrcMtime > newestDevdistMtime;
  } catch {
    return false; // If we can't stat, assume not stale
  }
}

function buildDevdistTargeted(packagesToBuild) {
  console.log('🔨 Building devdist artifacts for specific packages...');

  for (const packagePath of packagesToBuild) {
    console.log(`📦 Building ${packagePath}...`);
    // PR#2: Handle adapter directory structure
    // PR#4: Added standalone adapter mapping
    let packageName = packagePath.replace('packages/', '@touchspin/');
    packageName = packageName.replace('renderers/', 'renderer-');
    packageName = packageName.replace('adapters/jquery', 'jquery');
    packageName = packageName.replace('adapters/standalone', 'standalone');
    packageName = packageName.replace('adapters/webcomponent', 'web-components');
    try {
      execSync(`yarn workspace ${packageName} run build:test`, {
        cwd: projectRoot,
        stdio: 'inherit',
        timeout: 120000, // 2 minute timeout per package
      });
      console.log(`  ✅ ${packageName} build completed`);
    } catch (error) {
      console.error(`  ❌ ${packageName} build failed:`, error.message);
      return false;
    }
  }

  console.log('✅ Targeted DevDist build completed successfully');
  return true;
}

function _buildDevdist() {
  console.log('🔨 Building devdist artifacts...');
  try {
    execSync('yarn build:test', {
      cwd: projectRoot,
      stdio: 'inherit',
      timeout: 300000, // 5 minute timeout
    });
    console.log('✅ DevDist build completed successfully');
    return true;
  } catch (error) {
    console.error('❌ DevDist build failed:', error.message);
    return false;
  }
}

function main() {
  console.log('🔍 Checking devdist build artifacts...');

  const issues = [];
  const packagesToBuild = [];

  // Check each package
  for (const packagePath of PACKAGES_WITH_DEVDIST) {
    // PR#2: Handle adapter directory structure
    // PR#4: Added standalone adapter mapping
    let packageName = packagePath.replace('packages/', '@touchspin/');
    packageName = packageName.replace('renderers/', 'renderer-');
    packageName = packageName.replace('adapters/jquery', 'jquery');
    packageName = packageName.replace('adapters/standalone', 'standalone');
    packageName = packageName.replace('adapters/webcomponent', 'web-components');

    const existsCheck = checkDevdistExists(packagePath);
    if (!existsCheck.exists) {
      issues.push(`📦 ${packageName}: ${existsCheck.reason}`);
      packagesToBuild.push(packagePath);
      continue;
    }

    if (isDevdistStale(packagePath)) {
      issues.push(`📦 ${packageName}: devdist is stale (src newer than devdist)`);
      packagesToBuild.push(packagePath);
      continue;
    }

    console.log(`  ✅ ${packageName}: devdist up to date`);
  }

  // If any issues found, try to build only the affected packages
  if (packagesToBuild.length > 0) {
    console.log('\n📋 Issues found:');
    for (const issue of issues) {
      console.log(`  ${issue}`);
    }

    console.log('');
    if (!buildDevdistTargeted(packagesToBuild)) {
      console.error('\n❌ DevDist guard failed: Unable to build required artifacts');
      process.exit(1);
    }

    // Re-check after build
    console.log('\n🔍 Verifying build results...');
    for (const packagePath of packagesToBuild) {
      // PR#2: Handle adapter directory structure
      let packageName = packagePath.replace('packages/', '@touchspin/');
      packageName = packageName.replace('renderers/', 'renderer-');
      packageName = packageName.replace('adapters/jquery', 'jquery');
      packageName = packageName.replace('adapters/webcomponent', 'web-components');
      const existsCheck = checkDevdistExists(packagePath);

      if (!existsCheck.exists) {
        console.error(`❌ ${packageName}: Still missing after build - ${existsCheck.reason}`);
        process.exit(1);
      }

      console.log(`  ✅ ${packageName}: devdist ready`);
    }
  }

  console.log('✅ All devdist artifacts are ready for testing');
}

// Run the guard
main();
