#!/usr/bin/env node
/**
 * DevDist Build Guard
 *
 * Ensures all packages have current devdist build artifacts before tests run.
 * Auto-builds missing or stale devdist folders to prevent test failures.
 */

import { execSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  'packages/renderers/vanilla'
];

// Required files that must exist in devdist
const REQUIRED_FILES = {
  'packages/core': ['index.js', 'renderer.js', 'artifacts.json'],
  'packages/jquery-plugin': ['index.js', 'artifacts.json'],
  'packages/web-component': ['index.js', 'artifacts.json'],
  'packages/renderers/bootstrap3': ['index.js', 'Bootstrap3Renderer.js', 'artifacts.json'],
  'packages/renderers/bootstrap4': ['index.js', 'Bootstrap4Renderer.js', 'artifacts.json'],
  'packages/renderers/bootstrap5': ['index.js', 'Bootstrap5Renderer.js', 'artifacts.json'],
  'packages/renderers/tailwind': ['index.js', 'TailwindRenderer.js', 'artifacts.json'],
  'packages/renderers/vanilla': ['index.js', 'VanillaRenderer.js', 'artifacts.json']
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
      reason: `missing required files: ${missingFiles.join(', ')}`
    };
  }

  return { exists: true };
}

function isDevdistStale(packagePath) {
  const srcPath = join(projectRoot, packagePath, 'src');
  const devdistPath = join(projectRoot, packagePath, 'devdist');

  if (!existsSync(srcPath) || !existsSync(devdistPath)) {
    return false; // Can't determine staleness if paths don't exist
  }

  try {
    const srcStat = statSync(srcPath);
    const devdistStat = statSync(devdistPath);

    // If src is newer than devdist, it's stale
    return srcStat.mtime > devdistStat.mtime;
  } catch {
    return false; // If we can't stat, assume not stale
  }
}

function buildDevdist() {
  console.log('🔨 Building devdist artifacts...');
  try {
    execSync('yarn build:test', {
      cwd: projectRoot,
      stdio: 'inherit',
      timeout: 300000 // 5 minute timeout
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
  let needsBuild = false;

  // Check each package
  for (const packagePath of PACKAGES_WITH_DEVDIST) {
    const packageName = packagePath.replace('packages/', '@touchspin/').replace('renderers/', 'renderer-');

    const existsCheck = checkDevdistExists(packagePath);
    if (!existsCheck.exists) {
      issues.push(`📦 ${packageName}: ${existsCheck.reason}`);
      needsBuild = true;
      continue;
    }

    if (isDevdistStale(packagePath)) {
      issues.push(`📦 ${packageName}: devdist is stale (src newer than devdist)`);
      needsBuild = true;
      continue;
    }

    console.log(`  ✅ ${packageName}: devdist up to date`);
  }

  // If any issues found, try to build
  if (needsBuild) {
    console.log('\n📋 Issues found:');
    for (const issue of issues) {
      console.log(`  ${issue}`);
    }

    console.log('');
    if (!buildDevdist()) {
      console.error('\n❌ DevDist guard failed: Unable to build required artifacts');
      process.exit(1);
    }

    // Re-check after build
    console.log('\n🔍 Verifying build results...');
    for (const packagePath of PACKAGES_WITH_DEVDIST) {
      const packageName = packagePath.replace('packages/', '@touchspin/').replace('renderers/', 'renderer-');
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