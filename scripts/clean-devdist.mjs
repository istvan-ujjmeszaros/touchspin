#!/usr/bin/env node
/**
 * Clean DevDist Build Artifacts
 *
 * Removes all build artifacts from the devdist directory while preserving:
 * - external/ directories (committed framework assets like Bootstrap, jQuery)
 * - artifacts.json manifests
 *
 * Usage:
 *   node scripts/clean-devdist.mjs
 *   yarn clean:devdist
 *
 * This ensures a clean build state and prevents stale artifacts from causing issues.
 */

import { readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const __dirname = new URL('.', import.meta.url).pathname;
const projectRoot = join(__dirname, '..');
const devdistRoot = join(projectRoot, 'devdist');

// File patterns to remove
const ARTIFACT_EXTENSIONS = ['.js', '.d.ts', '.map', '.css', '.tsbuildinfo'];

// Patterns to preserve
const PRESERVE_PATTERNS = [
  '/external/', // Framework assets (Bootstrap, jQuery, Tailwind)
  'artifacts.json', // Build manifests
];

function shouldPreserve(filePath) {
  return PRESERVE_PATTERNS.some((pattern) => filePath.includes(pattern));
}

function cleanDirectory(dir) {
  let removedCount = 0;
  let preservedCount = 0;

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const relativePath = fullPath.replace(projectRoot, '');

      // Check if this should be preserved
      if (shouldPreserve(relativePath)) {
        preservedCount++;
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          // Count files in preserved directory
          const preserved = countFilesRecursive(fullPath);
          preservedCount += preserved - 1; // -1 because we already counted the dir
        }
        continue;
      }

      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Recursively clean subdirectories
        const counts = cleanDirectory(fullPath);
        removedCount += counts.removed;
        preservedCount += counts.preserved;

        // Remove empty directories
        try {
          const remaining = readdirSync(fullPath);
          if (remaining.length === 0) {
            rmSync(fullPath, { recursive: true });
          }
        } catch {
          // Directory not empty or error, skip
        }
      } else {
        // Check if file should be removed based on extension
        const shouldRemove = ARTIFACT_EXTENSIONS.some((ext) => fullPath.endsWith(ext));

        if (shouldRemove) {
          rmSync(fullPath);
          removedCount++;
        }
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Error cleaning ${dir}:`, error.message);
    }
  }

  return { removed: removedCount, preserved: preservedCount };
}

function countFilesRecursive(dir) {
  let count = 0;
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        count += countFilesRecursive(fullPath);
      } else {
        count++;
      }
    }
  } catch {
    // Ignore errors
  }
  return count;
}

function main() {
  console.log('🧹 Cleaning devdist build artifacts...');
  console.log('📁 Target:', devdistRoot);
  console.log('');

  try {
    // Check if devdist exists
    try {
      statSync(devdistRoot);
    } catch {
      console.log('ℹ️  devdist directory does not exist, nothing to clean');
      return;
    }

    const { removed, preserved } = cleanDirectory(devdistRoot);

    console.log('');
    console.log('✅ DevDist cleaning completed');
    console.log(`   🗑️  Removed: ${removed} files`);
    console.log(`   💾 Preserved: ${preserved} files (external assets + manifests)`);
    console.log('');
    console.log('💡 Run `yarn build:test` to rebuild artifacts');
  } catch (error) {
    console.error('❌ DevDist cleaning failed:', error.message);
    process.exit(1);
  }
}

// Run the cleaner
main();
