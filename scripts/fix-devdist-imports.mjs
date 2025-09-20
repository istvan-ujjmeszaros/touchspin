#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

/**
 * Fix import paths in devdist files to use devdist instead of dist
 */
function fixDevdistImports() {
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
    const devdistDir = path.join(rootDir, pkg, 'devdist');
    if (!fs.existsSync(devdistDir)) {
      return; // Skip if devdist doesn't exist
    }

    const jsFiles = fs.readdirSync(devdistDir)
      .filter(f => f.endsWith('.js'))
      .map(f => path.join(devdistDir, f));

    jsFiles.forEach(file => {
      let content = fs.readFileSync(file, 'utf-8');

      // Replace @touchspin/core/renderer imports to use devdist
      const originalPattern = /from ['"]@touchspin\/core\/renderer['"]/g;
      const replacement = 'from "/packages/core/devdist/renderer.js"';

      if (originalPattern.test(content)) {
        content = content.replace(originalPattern, replacement);
        fs.writeFileSync(file, content);
        console.log(`✅ Fixed imports in ${file}`);
      }
    });
  });
}

fixDevdistImports();