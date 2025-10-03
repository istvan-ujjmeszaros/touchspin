#!/usr/bin/env node
/**
 * Pre-Dev Server Guardrails
 *
 * Ensures all required build artifacts are available before starting development server.
 * Auto-builds missing or stale devdist folders for smooth development experience.
 */

import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = new URL('.', import.meta.url).pathname;
const projectRoot = join(__dirname, '..');

console.log('🛡️  Running pre-dev guardrails...\n');

// Run devdist build guard
console.log('🔍 DevDist build artifacts...');
try {
  execSync('node scripts/guard-devdist-build.mjs', {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  console.log('✅ DevDist build artifacts passed\n');
} catch (error) {
  console.error('❌ DevDist build artifacts failed');
  process.exit(1);
}

console.log('✅ All guardrails passed - development server ready to start\n');
