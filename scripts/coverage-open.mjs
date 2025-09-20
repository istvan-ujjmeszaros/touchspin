#!/usr/bin/env node

import { spawnSync, execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { release } from 'os';

console.log('🌐 Opening coverage report...');

const reportPath = 'reports/coverage/index.html';
if (!existsSync(reportPath)) {
  console.log(`⚠️  Coverage report not found at ${reportPath}`);
  console.log('Run yarn coverage:report first to generate the report');
  process.exit(1);
}

await openBestEffort(resolve(reportPath));

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