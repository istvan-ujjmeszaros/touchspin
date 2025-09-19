#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';

function run(command) {
  console.log(`🌐 ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`❌ Failed: ${command}`);
    process.exit(1);
  }
}

console.log('🌐 Opening coverage report...');

const reportPath = 'reports/coverage/index.html';
if (!existsSync(reportPath)) {
  console.log(`⚠️  Coverage report not found at ${reportPath}`);
  console.log('Run yarn coverage:report first to generate the report');
  process.exit(1);
}

// Try to open the report in the default browser
try {
  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  if (isWindows) {
    run(`start ${reportPath}`);
  } else if (isMac) {
    run(`open ${reportPath}`);
  } else {
    run(`xdg-open ${reportPath}`);
  }
} catch (error) {
  console.log(`ℹ️  Could not open browser automatically. Please open: ${reportPath}`);
}