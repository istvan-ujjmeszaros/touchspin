#!/usr/bin/env node
/**
 * Extract framework assets from Yarn PnP to devdist directories
 * Usage: node scripts/extract-framework-assets.mjs [--renderer bootstrap3|bootstrap4|bootstrap5] [--all]
 */

import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { createRequire } from 'module';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Framework configuration for asset extraction
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
  }
};

/**
 * Find the framework package location using yarn exec
 * Works with Yarn PnP and multiple versions of the same package
 */
async function findFrameworkPath(rendererName, frameworkName) {
  try {
    const rendererPath = join(projectRoot, frameworkConfigs[rendererName].packagePath);

    // Use yarn exec to find the package location
    const command = `yarn exec node -p "require.resolve('${frameworkName}/package.json')"`;
    const packageJsonPath = execSync(command, { encoding: 'utf8', cwd: rendererPath }).trim();

    return dirname(packageJsonPath);
  } catch (error) {
    console.error(`❌ Could not resolve ${frameworkName} for ${rendererName}:`, error.message);
    return null;
  }
}

/**
 * Extract assets for a single renderer
 */
async function extractAssets(rendererName) {
  console.log(`🔧 Extracting assets for ${rendererName}...`);

  const config = frameworkConfigs[rendererName];
  if (!config) {
    console.error(`❌ Unknown renderer: ${rendererName}`);
    return false;
  }

  // Find framework package location
  const frameworkPath = await findFrameworkPath(rendererName, config.dependency);
  if (!frameworkPath) {
    return false;
  }

  // Create target directory
  const targetDir = join(projectRoot, config.packagePath, 'devdist', 'external');
  mkdirSync(join(targetDir, 'css'), { recursive: true });
  mkdirSync(join(targetDir, 'js'), { recursive: true });

  // Copy each configured file using Yarn PnP compatible methods
  let copiedCount = 0;
  for (const [sourcePath, targetPath] of Object.entries(config.files)) {
    const targetFile = join(targetDir, targetPath);

    try {
      // Use Yarn exec to read the file through PnP
      const command = `yarn exec node -e "const fs = require('fs'); const path = require('path'); const bootstrap = path.dirname(require.resolve('bootstrap/package.json')); const content = fs.readFileSync(path.join(bootstrap, '${sourcePath}')); process.stdout.write(content);"`;
      const content = execSync(command, { encoding: 'buffer', cwd: join(projectRoot, config.packagePath) });

      writeFileSync(targetFile, content);
      console.log(`  ✅ ${sourcePath} → ${targetPath}`);
      copiedCount++;
    } catch (error) {
      console.error(`  ❌ Failed to copy ${sourcePath}: ${error.message}`);
    }
  }

  console.log(`📦 ${rendererName}: Copied ${copiedCount}/${Object.keys(config.files).length} assets\n`);
  return copiedCount > 0;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  console.log('🎨 Framework Asset Extractor\n');

  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage:');
    console.log('  node scripts/extract-framework-assets.mjs --all');
    console.log('  node scripts/extract-framework-assets.mjs --renderer bootstrap5');
    console.log('  node scripts/extract-framework-assets.mjs --renderer bootstrap4');
    console.log('  node scripts/extract-framework-assets.mjs --renderer bootstrap3');
    return;
  }

  const rendererIndex = args.indexOf('--renderer');
  const specificRenderer = rendererIndex >= 0 ? args[rendererIndex + 1] : null;
  const extractAll = args.includes('--all');

  if (specificRenderer) {
    // Extract for specific renderer
    if (frameworkConfigs[specificRenderer]) {
      await extractAssets(specificRenderer);
    } else {
      console.error(`❌ Unknown renderer: ${specificRenderer}`);
      console.log('Available renderers:', Object.keys(frameworkConfigs).join(', '));
      process.exit(1);
    }
  } else if (extractAll) {
    // Extract for all renderers
    let successCount = 0;
    for (const rendererName of Object.keys(frameworkConfigs)) {
      if (await extractAssets(rendererName)) {
        successCount++;
      }
    }
    console.log(`🎯 Completed: ${successCount}/${Object.keys(frameworkConfigs).length} renderers processed successfully`);
  } else {
    console.log('Usage: --renderer <name> or --all');
    console.log('Available renderers:', Object.keys(frameworkConfigs).join(', '));
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { extractAssets, frameworkConfigs };