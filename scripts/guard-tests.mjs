#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(__dirname);

/**
 * Aggregated test guardrails runner
 * Runs all test-related guard scripts to ensure code quality
 */

const GUARDS = [
  {
    name: 'No /src/ imports in tests',
    script: 'guard-no-src-in-tests.mjs',
  },
  {
    name: 'No page.locator in test specs',
    script: 'page-locator-guard.mjs',
  },
  {
    name: 'Playwright specs use checklist and Scenario annotations',
    script: 'guard-gherkin-annotations.mjs',
  },
  {
    name: 'No shared fixtures in framework renderers',
    script: 'guard-no-shared-fixtures.mjs',
  },
  // Add more guards here as needed:
  // { name: 'No helper bypass', script: 'guard-no-helper-bypass.mjs' },
  // { name: 'No hardcoded hosts', script: 'guard-no-hardcoded-hosts.mjs' }
];

async function runGuard(guard) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, guard.script);
    const child = spawn('node', [scriptPath], {
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

async function runAllGuards() {
  console.log('🛡️  Running test guardrails...');

  let failed = 0;
  for (const guard of GUARDS) {
    try {
      await runGuard(guard);
    } catch (err) {
      console.error(`❌ ${err.message}`);
      failed++;
    }
  }

  if (failed > 0) {
    console.error(`❌ ${failed}/${GUARDS.length} guardrails failed`);
    process.exit(1);
  } else {
    console.log(`✅ All ${GUARDS.length} guardrails passed`);
    process.exit(0);
  }
}

// Parse command line args
const args = process.argv.slice(2);
if (args.includes('all')) {
  runAllGuards();
} else {
  console.error('Usage: node guard-tests.mjs all');
  process.exit(1);
}
