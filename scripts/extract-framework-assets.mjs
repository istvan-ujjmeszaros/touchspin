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
import https from 'https';
import { URL } from 'url';

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
 * Fetch content from HTTP URL with redirect support
 */
async function fetchFromUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        if (maxRedirects > 0) {
          // Resolve relative redirects
          const redirectUrl = new URL(response.headers.location, url).href;
          console.log(`  ↗️  Redirecting to ${redirectUrl}`);
          fetchFromUrl(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
          return;
        } else {
          reject(new Error('Too many redirects'));
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

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

  // Copy each configured file using Yarn PnP compatible methods or HTTP fetch
  let copiedCount = 0;
  for (const [sourcePath, targetPath] of Object.entries(config.files)) {
    const targetFile = join(targetDir, targetPath);

    try {
      let content;

      if (sourcePath.startsWith('http://') || sourcePath.startsWith('https://')) {
        // Fetch from HTTP URL
        console.log(`  📥 Downloading ${sourcePath}...`);
        content = await fetchFromUrl(sourcePath);
      } else {
        // Use Yarn exec to read the file through PnP
        const command = `yarn exec node -e "const fs = require('fs'); const path = require('path'); const framework = path.dirname(require.resolve('${config.dependency}/package.json')); const content = fs.readFileSync(path.join(framework, '${sourcePath}')); process.stdout.write(content);"`;
        content = execSync(command, { encoding: 'buffer', cwd: join(projectRoot, config.packagePath) });
      }

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
    console.log('  node scripts/extract-framework-assets.mjs --renderer tailwind');
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