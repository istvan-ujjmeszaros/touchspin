#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';

function run(command, args) {
  console.log(`📦 ${[command, ...args].join(' ')}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    console.error(`❌ Failed: ${[command, ...args].join(' ')}`);
    process.exit(result.status ?? 1);
  }
}

console.log('🔀 Merging coverage files...');

const istanbulJsonDir = 'reports/istanbul-json';
if (!existsSync(istanbulJsonDir)) {
  console.log(`⚠️  No coverage data found (${istanbulJsonDir} directory missing)`);
  process.exit(0);
}

// Ensure .nyc_output directory exists
if (!existsSync('.nyc_output')) {
  try {
    mkdirSync('.nyc_output', { recursive: true });
  } catch (error) {
    console.error('Failed to create .nyc_output directory:', error);
    process.exit(1);
  }
}

run('yarn', ['exec', '--', 'nyc', 'merge', istanbulJsonDir, '.nyc_output/coverage.json']);
console.log('✅ Coverage merge complete');
