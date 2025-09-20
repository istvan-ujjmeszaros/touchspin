import { spawnSync } from 'node:child_process';

let open = true;
const passThrough = [];

for (const a of process.argv.slice(2)) {
  if (a === '--no-open') open = false;
  else passThrough.push(a);
}

function run(cmd, args, extraEnv = {}) {
  const r = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...extraEnv },
  });
  return r.status ?? 1;
}

function runAndExit(cmd, args, extraEnv = {}) {
  const status = run(cmd, args, extraEnv);
  if (status !== 0) process.exit(status);
}

console.log(`🎯 Running coverage in build mode${open ? ' (will open)' : ''}`);

console.log('📦 Building test packages...');
// Only build the test artifacts (devdist) needed for coverage
runAndExit('yarn', ['build:test']);

console.log('🔍 Checking for src imports in tests...');
runAndExit('yarn', ['guard:no-src-in-tests']);

console.log('🧪 Running tests with coverage...');
// Always test against devdist, enable coverage pathing.
const testStatus = run(
  'yarn',
  ['coverage:run', ...passThrough],
  {
    PW_COVERAGE: '1',
    TS_BUILD_TARGET: 'dev',
    PLAYWRIGHT_TSCONFIG: 'tsconfig.playwright.json'
  }
);

console.log('🔀 Merging coverage files...');
runAndExit('yarn', ['coverage:merge']);

console.log('📊 Generating reports...');
runAndExit('yarn', ['coverage:report']);

if (open) {
  console.log('🌐 Opening coverage report...');
  runAndExit('yarn', ['coverage:open']);
}

console.log('✅ Coverage pipeline complete!');
// Exit with test status so CI still sees failures
process.exit(testStatus);