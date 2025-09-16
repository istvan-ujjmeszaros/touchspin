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
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log(`🎯 Running coverage in ${dist ? 'build' : 'dev'} mode${open ? ' (will open)' : ''}`);

if (dist) {
  console.log('📦 Building packages...');
  run("yarn", ["coverage:build"]);
}

console.log('🧪 Running tests with coverage...');
run("yarn", ["coverage", ...passThrough], dist ? { COVERAGE_DIST: "1" } : {});

console.log('🔀 Merging coverage files...');
run("yarn", ["coverage:merge"]);

console.log('📊 Generating reports...');
run("yarn", ["coverage:report"]);

if (open) {
  console.log('🌐 Opening coverage report...');
  run("yarn", ["coverage:open"]);
}

console.log('✅ Coverage pipeline complete!');
// optional: run("yarn", ["coverage:check"]); // only in CI