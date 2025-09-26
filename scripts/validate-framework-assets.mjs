#!/usr/bin/env node
/**
 * Validate framework assets in devdist directories
 * Usage: node scripts/validate-framework-assets.mjs
 */

import { dirname, join } from 'path';
import { readFileSync, existsSync, statSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Framework configuration (must match extract-framework-assets.mjs)
const frameworkConfigs = {
  'bootstrap3': {
    dependency: 'bootstrap',
    packagePath: 'packages/renderers/bootstrap3',
    files: {
      'dist/css/bootstrap.min.css': 'css/bootstrap.min.css',
      'dist/css/bootstrap-theme.min.css': 'css/bootstrap-theme.min.css',
      'dist/js/bootstrap.min.js': 'js/bootstrap.min.js'
    }
  },
  'bootstrap4': {
    dependency: 'bootstrap',
    packagePath: 'packages/renderers/bootstrap4',
    files: {
      'dist/css/bootstrap.min.css': 'css/bootstrap.min.css',
      'dist/js/bootstrap.bundle.min.js': 'js/bootstrap.bundle.min.js'
    }
  },
  'bootstrap5': {
    dependency: 'bootstrap',
    packagePath: 'packages/renderers/bootstrap5',
    files: {
      'dist/css/bootstrap.min.css': 'css/bootstrap.min.css',
      'dist/js/bootstrap.bundle.min.js': 'js/bootstrap.bundle.min.js'
    }
  },
  'tailwind': {
    dependency: 'tailwindcss',
    packagePath: 'packages/renderers/tailwind',
    files: {
      'https://cdn.tailwindcss.com': 'js/tailwind.js'
    }
  }
};

/**
 * Get expected framework version from package.json
 */
function getExpectedVersion(rendererName) {
  try {
    const packageJsonPath = join(projectRoot, frameworkConfigs[rendererName].packagePath, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const config = frameworkConfigs[rendererName];
    return packageJson.devDependencies?.[config.dependency] || packageJson.dependencies?.[config.dependency];
  } catch (error) {
    return null;
  }
}

/**
 * Validate assets for a single renderer
 */
function validateRenderer(rendererName) {
  console.log(`🔍 Validating ${rendererName} assets...`);

  const config = frameworkConfigs[rendererName];
  if (!config) {
    console.error(`❌ Unknown renderer: ${rendererName}`);
    return false;
  }

  const expectedVersion = getExpectedVersion(rendererName);
  const targetDir = join(projectRoot, config.packagePath, 'devdist', 'external');

  if (!existsSync(targetDir)) {
    console.error(`  ❌ Missing devdist/external directory: ${targetDir}`);
    return false;
  }

  let allValid = true;
  let totalSize = 0;

  // Check each expected file
  for (const [sourcePath, targetPath] of Object.entries(config.files)) {
    const targetFile = join(targetDir, targetPath);

    if (!existsSync(targetFile)) {
      console.error(`  ❌ Missing asset: ${targetPath}`);
      allValid = false;
      continue;
    }

    // Get file stats
    const stats = statSync(targetFile);
    const sizeKB = Math.round(stats.size / 1024);
    totalSize += stats.size;

    // Validate file is not empty
    if (stats.size === 0) {
      console.error(`  ❌ Empty asset: ${targetPath}`);
      allValid = false;
      continue;
    }

    console.log(`  ✅ ${targetPath} (${sizeKB} KB)`);
  }

  // Summary
  const totalSizeKB = Math.round(totalSize / 1024);
  if (allValid) {
    console.log(`  ✨ All assets valid (${Object.keys(config.files).length} files, ${totalSizeKB} KB total)`);
    if (expectedVersion) {
      console.log(`  📦 Expected version: ${expectedVersion}`);
    }
  }

  console.log('');
  return allValid;
}

/**
 * Main validation
 */
function main() {
  console.log('🎨 Framework Asset Validator\\n');

  let allValid = true;
  let validRenderers = 0;
  const rendererNames = Object.keys(frameworkConfigs);

  for (const rendererName of rendererNames) {
    if (validateRenderer(rendererName)) {
      validRenderers++;
    } else {
      allValid = false;
    }
  }

  console.log(`🎯 Results: ${validRenderers}/${rendererNames.length} renderers have valid assets`);

  if (!allValid) {
    console.log('\\n💡 To fix missing assets, run: yarn extract-assets');
    process.exit(1);
  } else {
    console.log('✅ All framework assets are valid and ready for use');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateRenderer, frameworkConfigs };