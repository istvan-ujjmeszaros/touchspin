#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';

function run(command) {
  console.log(`📦 ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`❌ Failed: ${command}`);
    process.exit(1);
  }
}

console.log('🔀 Merging coverage files...');

if (!existsSync('.nyc_output')) {
  console.log('⚠️  No coverage data found (.nyc_output directory missing)');
  process.exit(0);
}

run('npx nyc merge .nyc_output .nyc_output/coverage.json');
console.log('✅ Coverage merge complete');