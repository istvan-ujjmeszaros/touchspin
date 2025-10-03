#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

function run(command) {
  console.log(`📊 ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (_error) {
    console.error(`❌ Failed: ${command}`);
    process.exit(1);
  }
}

console.log('📊 Generating coverage report...');

if (!existsSync('.nyc_output/coverage.json')) {
  console.log('⚠️  No merged coverage data found (.nyc_output/coverage.json missing)');
  process.exit(0);
}

run('npx nyc report');
console.log('✅ Coverage report generated in reports/coverage/');
