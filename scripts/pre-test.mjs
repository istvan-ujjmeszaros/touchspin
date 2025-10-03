#!/usr/bin/env node
/**
 * Universal Pre-Test Guard Runner
 *
 * Orchestrates all required guards before any test execution.
 * Ensures consistent pre-test validation across all packages and test entry points.
 *
 * Usage:
 *   node scripts/pre-test.mjs [test-path]
 *
 * Examples:
 *   node scripts/pre-test.mjs                           # Root tests
 *   node scripts/pre-test.mjs packages/core/tests       # Core package tests
 *   node scripts/pre-test.mjs packages/renderers/vanilla/tests  # Vanilla renderer tests
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(__dirname);

/**
 * All guards that must run before any test execution
 * Order matters - faster guards first, build guards last
 */
const GUARDS = [
  {
    name: 'No /src/ imports in tests',
    script: 'guard-no-src-in-tests.mjs',
    description: 'Prevents direct imports from /src/ in tests (must use /dist/)',
  },
  {
    name: 'No page.locator in test specs',
    script: 'page-locator-guard.mjs',
    description: 'Ensures tests use helper functions instead of direct page.locator()',
    needsTestPath: true,
  },
  {
    name: 'DevDist build artifacts',
    script: 'guard-devdist-build.mjs',
    description: 'Checks and builds devdist artifacts if missing/stale',
  },
  // Future guards can be added here:
  // { name: 'No helper bypass', script: 'guard-no-helper-bypass.mjs' },
  // { name: 'No hardcoded hosts', script: 'guard-no-hardcoded-hosts.mjs' }
];

async function runGuard(guard, testPath) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, guard.script);

    // Some guards need the test path parameter
    const args = [scriptPath];
    if (guard.needsTestPath && testPath) {
      args.push(testPath);
    }

    const child = spawn('node', args, {
      cwd: ROOT,
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${guard.name} failed with exit code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to run ${guard.name}: ${err.message}`));
    });
  });
}

async function runAllGuards(testPath) {
  console.log('🛡️  Running pre-test guardrails...');

  if (testPath) {
    console.log(`📍 Test target: ${testPath}`);
  }

  console.log('');

  let failed = 0;
  for (const guard of GUARDS) {
    try {
      console.log(`🔍 ${guard.name}...`);
      await runGuard(guard, testPath);
      console.log(`✅ ${guard.name} passed`);
    } catch (err) {
      console.error(`❌ ${err.message}`);
      failed++;
    }
  }

  console.log('');

  if (failed > 0) {
    console.error(`❌ ${failed}/${GUARDS.length} guardrails failed`);
    console.error('');
    console.error('🚨 Tests cannot run until all guardrails pass.');
    console.error('   Fix the issues above and try again.');
    process.exit(1);
  } else {
    console.log(`✅ All ${GUARDS.length} guardrails passed - tests are ready to run`);
    console.log('');
    process.exit(0);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const testPath = args[0]; // Optional test path for package-specific tests

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
  console.log('Universal Pre-Test Guard Runner');
  console.log('');
  console.log('Runs all required guards before test execution to ensure:');
  for (const guard of GUARDS) {
    console.log(`  • ${guard.description}`);
  }
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/pre-test.mjs [test-path]');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/pre-test.mjs                                # Root tests');
  console.log('  node scripts/pre-test.mjs packages/core/tests           # Core package');
  console.log('  node scripts/pre-test.mjs packages/renderers/vanilla/tests  # Vanilla renderer');
  process.exit(0);
}

// Run all guards
runAllGuards(testPath);
