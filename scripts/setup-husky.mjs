#!/usr/bin/env node

/**
 * Safe Husky install helper.
 *
 * "npm pack" runs scripts in a temporary staging directory that lacks the
 * original .git folder. Calling `husky install` there throws a fatal
 * "not in a git directory" error. This wrapper skips the install gracefully
 * when Git metadata or explicit skip flags are absent, keeping packaging
 * workflows happy while still wiring Husky during regular development.
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const cwd = process.cwd();
const gitDir = join(cwd, '.git');

// Respect common Husky skip flags (HUSKY=0, HUSKY_SKIP_INSTALL=1)
const shouldSkipViaEnv =
  process.env.HUSKY === '0' ||
  process.env.HUSKY_SKIP_INSTALL === '1' ||
  process.env.HUSKY_SKIP_INSTALL === 'true';

if (shouldSkipViaEnv) {
  console.log('Skipping Husky install (env override detected).');
  process.exit(0);
}

if (!existsSync(gitDir)) {
  console.log('Skipping Husky install (no .git directory in current workspace).');
  process.exit(0);
}

try {
  execSync('yarn husky install', { stdio: 'inherit', cwd });
} catch (error) {
  console.error('Husky install failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
