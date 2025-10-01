import { spawnSync, execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { release } from 'node:os';

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

async function main() {
  console.log(`🎯 Running coverage${open ? ' (will open)' : ''}`);

  console.log('🧪 Running tests with coverage...');
  // The pre-test guard will check devdist and build only if needed (same as yarn test)
  const testStatus = run(
    'yarn',
    ['coverage:run', ...passThrough],
    {
      PW_COVERAGE: '1',
      TS_BUILD_TARGET: 'dev',
      PLAYWRIGHT_TSCONFIG: 'tsconfig.playwright.json'
    }
  );

  // Only merge and report if tests actually ran (status code 0 or test failures)
  // Status code 1 from guards should not generate coverage reports
  if (testStatus !== 1) {
    runAndExit('yarn', ['coverage:merge']);

    console.log('📊 Generating reports...');
    runAndExit('yarn', ['coverage:report']);

    if (open) {
      console.log('🌐 Opening coverage report...');
      await openBestEffort(resolve('reports/coverage/index.html'));
    }

    console.log('✅ Coverage pipeline complete!');
  } else {
    console.error('\n❌ Coverage pipeline aborted due to test failures or guard errors');
  }

  // Exit with test status so CI still sees failures
  process.exit(testStatus);
}

main().catch(err => {
  console.error('Coverage pipeline failed:', err);
  process.exit(1);
});

async function openBestEffort(fileAbsPath) {
  // Build candidate commands per platform; try one-by-one, hide errors.
  const isWin = process.platform === 'win32';
  const isMac = process.platform === 'darwin';
  const isLinux = process.platform === 'linux';
  const isWSL =
    !!process.env.WSL_DISTRO_NAME ||
    (isLinux && release().toLowerCase().includes('microsoft'));

  // In WSL we can use wslview (preferred). For PowerShell/cmd we need Windows-style path.
  let winPath = null;
  if (isWSL) {
    try {
      winPath = execSync(`wslpath -w ${JSON.stringify(fileAbsPath)}`, { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim();
    } catch {
      // ignore
    }
  }

  /** @type {Array<[string, string[]]>} */
  const candidates = [];

  if (isMac) {
    candidates.push(['open', [fileAbsPath]]);
  }

  if (isLinux && !isWSL) {
    candidates.push(
      ['xdg-open', [fileAbsPath]],
      ['gio', ['open', fileAbsPath]],
      ['gnome-open', [fileAbsPath]],
      ['kde-open', [fileAbsPath]],
      ['sensible-browser', [fileAbsPath]],
    );
  }

  if (isWSL) {
    candidates.push(['wslview', [fileAbsPath]]);
    if (winPath) {
      candidates.push(
        ['powershell.exe', ['-NoProfile', '-NonInteractive', 'Start-Process', winPath]],
        ['cmd.exe', ['/c', 'start', '', winPath]],
      );
    }
  }

  if (isWin && !isWSL) {
    // `start` must be invoked via cmd; empty title arg required.
    candidates.push(['cmd', ['/c', 'start', '', fileAbsPath]]);
    candidates.push(['powershell', ['-NoProfile', '-NonInteractive', 'Start-Process', fileAbsPath]]);
  }

  // Final fallback: do nothing but print the path.
  for (const [cmd, args] of candidates) {
    try {
      const res = spawnSync(cmd, args, { stdio: 'ignore', shell: false, windowsHide: true });
      if (res.status === 0) {
        console.log(`🌐 Opened coverage report with: ${cmd}`);
        return;
      }
    } catch {
      // swallow
    }
  }
  console.log(`ℹ️ Coverage HTML ready at ${fileAbsPath} (no opener available)`);
}