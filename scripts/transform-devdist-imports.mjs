#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

/**
 * Transform import paths in devdist files for serving from repository root.
 *
 * Why this is necessary:
 * - TypeScript outputs relative imports (e.g., './events')
 * - We serve test files from repo root via http-server
 * - Browsers resolve relative imports based on the URL, not file location
 * - Import maps can't rewrite imports inside modules, only top-level imports
 *
 * This script converts relative imports to absolute paths that work when
 * serving from the repository root.
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
      content = content.replace(/from ['"]\.\/AbstractRenderer['"]/g, 'from "/packages/core/devdist/AbstractRenderer.js"');
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