#!/usr/bin/env node
import { spawnSync, spawn } from 'node:child_process';
import os from 'node:os';

function parseArgs(argv) {
  let port = 8866;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if ((a === '--port' || a === '-p') && argv[i + 1]) {
      port = Number(argv[++i]);
    } else if (!isNaN(Number(a))) {
      port = Number(a);
    }
  }
  return { port };
}

function killPort(port) {
  const platform = os.platform();
  try {
    if (platform === 'win32') {
      // netstat output -> PID
      const ns = spawnSync('cmd', ['/c', `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do @echo %a`], { encoding: 'utf8' });
      if (ns.stdout) {
        const pids = Array.from(new Set(ns.stdout.split(/\r?\n/).map(s => s.trim()).filter(Boolean)));
        for (const pid of pids) {
          spawnSync('cmd', ['/c', `taskkill /F /PID ${pid}`], { stdio: 'ignore' });
        }
      }
    } else {
      // Try lsof first
      const ls = spawnSync('bash', ['-lc', `lsof -ti :${port} || true`], { encoding: 'utf8' });
      let pids = [];
      if (ls.stdout) pids = ls.stdout.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      if (pids.length === 0) {
        // fuser fallback
        const fu = spawnSync('bash', ['-lc', `fuser -n tcp ${port} 2>/dev/null || true`], { encoding: 'utf8' });
        if (fu.stdout) {
          pids = fu.stdout.split(/\s+/).map(s => s.trim()).filter(Boolean);
        }
      }
      for (const pid of new Set(pids)) {
        spawnSync('bash', ['-lc', `kill -9 ${pid} || true`], { stdio: 'ignore' });
      }
    }
  } catch {
    // ignore errors
  }
}

async function main() {
  const { port } = parseArgs(process.argv);
  console.log(`[dev:force] Freeing port ${port} if occupied...`);
  killPort(port);

  console.log(`[dev:force] Starting Vite on port ${port}...`);
  const child = spawn('vite', ['--port', String(port), '--strictPort'], { stdio: 'inherit' });

  const onExit = () => {
    try { child.kill('SIGINT'); } catch {}
    process.exit();
  };
  process.on('SIGINT', onExit);
  process.on('SIGTERM', onExit);

  child.on('exit', (code) => process.exit(code ?? 0));
}

main().catch((err) => {
  console.error('[dev:force] Unexpected error:', err);
  process.exit(1);
});
