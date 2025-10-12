#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

function run(command, args) {
  console.log(`📊 ${[command, ...args].join(' ')}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    console.error(`❌ Failed: ${[command, ...args].join(' ')}`);
    process.exit(result.status ?? 1);
  }
}

console.log('📊 Generating coverage report...');

if (!existsSync('.nyc_output/coverage.json')) {
  console.log('⚠️  No merged coverage data found (.nyc_output/coverage.json missing)');
  process.exit(0);
}

run('yarn', ['exec', '--', 'nyc', 'report']);
console.log('✅ Coverage report generated in reports/coverage/');
