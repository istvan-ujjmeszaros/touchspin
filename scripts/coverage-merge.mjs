#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

function run(command) {
  console.log(`📦 ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (_error) {
    console.error(`❌ Failed: ${command}`);
    process.exit(1);
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
    execSync('mkdir -p .nyc_output');
  } catch (error) {
    console.error('Failed to create .nyc_output directory:', error);
    process.exit(1);
  }
}

run(`npx nyc merge ${istanbulJsonDir} .nyc_output/coverage.json`);
console.log('✅ Coverage merge complete');
