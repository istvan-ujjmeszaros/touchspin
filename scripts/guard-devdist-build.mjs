#!/usr/bin/env node
/**
 * DevDist Build Guard
 *
 * Ensures all packages have current devdist build artifacts before tests run.
 * Auto-builds missing or stale devdist folders to prevent test failures.
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const __dirname = new URL('.', import.meta.url).pathname;
const projectRoot = join(__dirname, '..');

// Packages that need devdist artifacts for testing
const PACKAGES_WITH_DEVDIST = [
  'packages/core',
  'packages/jquery-plugin',
  'packages/web-component',
  'packages/renderers/bootstrap3',
  'packages/renderers/bootstrap4',
  'packages/renderers/bootstrap5',
  'packages/renderers/tailwind',
  'packages/renderers/vanilla',
];

// Required files that must exist in devdist
const REQUIRED_FILES = {
  'packages/core': ['index.js', 'renderer.js', 'artifacts.json'],
  'packages/jquery-plugin': [
    'umd/jquery-touchspin-bs3.js',
    'umd/jquery-touchspin-bs5.js',
    'artifacts.json',
  ],
  'packages/web-component': ['index.js', 'artifacts.json'],
  'packages/renderers/bootstrap3': [
    'Bootstrap3Renderer.js',
    'iife/touchspin-bs3-complete.global.js',
    'artifacts.json',
  ],
  'packages/renderers/bootstrap4': [
    'Bootstrap4Renderer.js',
    'iife/touchspin-bs4-complete.global.js',
    'artifacts.json',
  ],
  'packages/renderers/bootstrap5': [
    'Bootstrap5Renderer.js',
    'iife/touchspin-bs5-complete.global.js',
    'artifacts.json',
  ],
  'packages/renderers/tailwind': [
    'TailwindRenderer.js',
    'iife/touchspin-tailwind-complete.global.js',
    'artifacts.json',
  ],
  'packages/renderers/vanilla': ['VanillaRenderer.js', 'artifacts.json'],
};

function checkDevdistExists(packagePath) {
  const devdistPath = join(projectRoot, packagePath, 'devdist');

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
 * Recursively get the newest file mtime in a directory tree
 */
function getNewestFileMtime(dirPath) {
  let newestMtime = 0;

  function scanDir(dir) {
    try {
      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and hidden directories
          if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
            continue;
          }
          scanDir(fullPath);
        } else if (entry.isFile()) {
          const stat = statSync(fullPath);
          if (stat.mtime.getTime() > newestMtime) {
            newestMtime = stat.mtime.getTime();
          }
        }
      }
    } catch (_err) {
      // Ignore errors (e.g., permission denied)
    }
  }

  scanDir(dirPath);
  return newestMtime;
}

/**
 * Check if devdist is stale by comparing file modification times
 * Returns true if ANY source file is newer than ANY devdist file
 */
function isDevdistStale(packagePath) {
  const srcPath = join(projectRoot, packagePath, 'src');
  const devdistPath = join(projectRoot, packagePath, 'devdist');

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
    const packageName = packagePath
      .replace('packages/', '@touchspin/')
      .replace('renderers/', 'renderer-');
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
    const packageName = packagePath
      .replace('packages/', '@touchspin/')
      .replace('renderers/', 'renderer-');

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
      const packageName = packagePath
        .replace('packages/', '@touchspin/')
        .replace('renderers/', 'renderer-');
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
