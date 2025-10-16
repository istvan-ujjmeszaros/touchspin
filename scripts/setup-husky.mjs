#!/usr/bin/env node

/**
 * Safe Husky setup helper for v9+.
 *
 * Husky v9 no longer requires "husky install" - hooks are automatically
 * used when present in .husky/ directory. This script simply validates
 * the environment without running deprecated commands.
 *
 * "npm pack" runs scripts in a temporary staging directory that lacks the
 * original .git folder. This wrapper exits gracefully when Git metadata
 * or explicit skip flags are absent, keeping packaging workflows happy.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';

const cwd = process.cwd();
const gitDir = join(cwd, '.git');
const huskyDir = join(cwd, '.husky');

// Respect common Husky skip flags (HUSKY=0, HUSKY_SKIP_INSTALL=1)
const shouldSkipViaEnv =
  process.env.HUSKY === '0' ||
  process.env.HUSKY_SKIP_INSTALL === '1' ||
  process.env.HUSKY_SKIP_INSTALL === 'true';

if (shouldSkipViaEnv) {
  console.log('Skipping Husky setup (env override detected).');
  process.exit(0);
}

if (!existsSync(gitDir)) {
  console.log('Skipping Husky setup (no .git directory in current workspace).');
  process.exit(0);
}

// Husky v9+ automatically uses hooks from .husky/ directory
// No install command needed - just verify the directory exists
if (existsSync(huskyDir)) {
  console.log('✓ Husky hooks ready (.husky/ directory found)');
} else {
  console.warn('⚠ Warning: .husky/ directory not found. Git hooks may not work.');
}
