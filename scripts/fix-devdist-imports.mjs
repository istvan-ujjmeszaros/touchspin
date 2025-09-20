#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

/**
 * Fix import paths in devdist files to use devdist instead of dist
 *
 * NOTE: This script is kept for fallback purposes but is NO LONGER USED by default.
 * Test fixtures now use import maps to handle module resolution natively in the browser.
 * To run manually with debug output: DEBUG_FIX_IMPORTS=1 node scripts/fix-devdist-imports.mjs
 * To use in build: yarn build:test:with-fix
 */
function fixDevdistImports() {
  // First fix core package devdist relative imports
  const coreDevdistDir = path.join(rootDir, 'packages/core/devdist');
  if (fs.existsSync(coreDevdistDir)) {
    const coreFiles = fs.readdirSync(coreDevdistDir)
      .filter(f => f.endsWith('.js'))
      .map(f => path.join(coreDevdistDir, f));

    coreFiles.forEach(file => {
      let content = fs.readFileSync(file, 'utf-8');
      // Fix relative imports in core devdist files
      content = content.replace(/from ['"]\.\/events['"]/g, 'from "/packages/core/devdist/events.js"');
      content = content.replace(/from ['"]\.\/renderer['"]/g, 'from "/packages/core/devdist/renderer.js"');
      fs.writeFileSync(file, content);
      if (process.env.DEBUG_FIX_IMPORTS === '1') {
        console.log(`✅ Fixed relative imports in ${file}`);
      }
    });
  }

  const packages = [
    'packages/renderers/bootstrap5',
    'packages/renderers/bootstrap4',
    'packages/renderers/bootstrap3',
    'packages/renderers/tailwind',
    'packages/renderers/material',
    'packages/vanilla-renderer',
    'packages/web-component',
    'packages/jquery-plugin'
  ];

  packages.forEach(pkg => {
    // ONLY fix devdist files - never touch dist (publish artifacts)
    const devdistDir = path.join(rootDir, pkg, 'devdist');
    if (fs.existsSync(devdistDir)) {
      const devdistFiles = fs.readdirSync(devdistDir)
        .filter(f => f.endsWith('.js'))
        .map(f => path.join(devdistDir, f));

      devdistFiles.forEach(file => {
        let content = fs.readFileSync(file, 'utf-8');
        const originalPattern = /from ['"]@touchspin\/core\/renderer['"]/g;
        const replacement = 'from "/packages/core/devdist/renderer.js"';

        if (originalPattern.test(content)) {
          content = content.replace(originalPattern, replacement);
          fs.writeFileSync(file, content);
          if (process.env.DEBUG_FIX_IMPORTS === '1') {
            console.log(`✅ Fixed devdist imports in ${file}`);
          }
        }
      });
    }

    // DO NOT process dist files - those are publish artifacts
  });
}

fixDevdistImports();