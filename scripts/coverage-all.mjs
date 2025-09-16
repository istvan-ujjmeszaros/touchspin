import { spawnSync } from "node:child_process";

let open = true;
let dist = true; // default to build-mode for stable mappings
const passThrough = [];

for (const a of process.argv.slice(2)) {
  if (a === "--no-open") open = false;
  else if (a === "--dev") dist = false; // opt-in to dev (HMR) if really needed
  else passThrough.push(a);
}

function run(cmd, args, extraEnv = {}) {
  const r = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, ...extraEnv },
  });
  return r.status ?? 1;
}

function runAndExit(cmd, args, extraEnv = {}) {
  const status = run(cmd, args, extraEnv);
  if (status !== 0) process.exit(status);
}

console.log(`🎯 Running coverage in ${dist ? 'build' : 'dev'} mode${open ? ' (will open)' : ''}`);

if (dist) {
  console.log('📦 Building packages...');
  runAndExit("yarn", ["coverage:build"]);
}

console.log('🧪 Running tests with coverage...');
const testStatus = run("yarn", ["coverage", ...passThrough], dist ? { COVERAGE_DIST: "1" } : {});

console.log('🔀 Merging coverage files...');
runAndExit("yarn", ["coverage:merge"]);

console.log('📊 Generating reports...');
runAndExit("yarn", ["coverage:report"]);

if (open) {
  console.log('🌐 Opening coverage report...');
  runAndExit("yarn", ["coverage:open"]);
}

console.log('✅ Coverage pipeline complete!');
// Exit with test status so CI still sees failures
process.exit(testStatus);