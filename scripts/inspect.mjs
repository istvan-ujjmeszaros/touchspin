#!/usr/bin/env node
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { createServer } from 'http';

(async () => {
const path = process.argv[2];
const format = process.argv[3] || 'json'; // 'json' or 'text'

if (!path) {
  console.error('Usage: npm run inspect <path> [json|text]');
  console.error('Example: npm run inspect /__tests__/html/index-bs4.html');
  console.error('Environment: set DEV_BASE_URL to override dev base (default http://localhost:8866)');
  process.exit(1);
}

// Build full URL from path. Default dev base is http://localhost:8866, but
// allow override via DEV_BASE_URL for custom setups (tunnels, containers, etc.).
const rawBase = process.env.DEV_BASE_URL || 'http://localhost:8866';
const base = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
const url = path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;

// Auto-start development server if needed
//
// WHY THIS CODE EXISTS:
// npm scripts with && operator don't work well with persistent servers.
// Running "node serve.mjs && node inspect.mjs" causes the inspect script
// to never execute because serve.mjs runs indefinitely.
//
// Cross-platform background process spawning (&, start, etc.) is unreliable
// in npm scripts, so we handle server startup directly in this script.
// This makes the inspect command self-sufficient and always work regardless
// of whether the dev server is already running.
const ensureServerRunning = async () => {
  // Keep default as 8866 per repo convention. If DEV_BASE_URL overrides host/port,
  // we still try to spin up the local dev server on 8866 if not already running.
  const port = 8866;

  // Check if server is already running
  const isPortInUse = await new Promise((resolve) => {
    const tester = createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true); // Port is in use
        } else {
          resolve(false); // Other error, assume not running
        }
      })
      .once('listening', () => {
        tester.close();
        resolve(false); // Port is available
      })
      .listen(port);
  });

  if (isPortInUse) {
    // Server already running, proceed with inspection
    return;
  }

  // Start the development server in detached mode
  const serverProcess = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
    detached: true,
    stdio: 'ignore'
  });

  serverProcess.unref(); // Allow parent process to exit independently

  // Wait for server to start (give it a moment to initialize)
  await new Promise(resolve => setTimeout(resolve, 2000));
};

await ensureServerRunning();

const result = {
  url,
  timestamp: new Date().toISOString(),
  console: [],
  pageErrors: [],
  networkErrors: [],
  touchspinStatus: {},
  summary: {
    totalConsoleErrors: 0,
    totalConsoleWarnings: 0,
    totalPageErrors: 0,
    totalNetworkErrors: 0,
    touchspinInitialized: 0,
    touchspinNotInitialized: 0
  }
};

const browser = await chromium.launch();
const page = await browser.newPage();

// Capture console messages
page.on('console', msg => {
  const entry = {
    type: msg.type(),
    text: msg.text(),
    location: msg.location()
  };
  result.console.push(entry);

  if (msg.type() === 'error') result.summary.totalConsoleErrors++;
  if (msg.type() === 'warning') result.summary.totalConsoleWarnings++;

  if (format === 'text') {
    console.log(`[${msg.type().toUpperCase()}]`, msg.text());
  }
});

// Capture page errors
page.on('pageerror', err => {
  result.pageErrors.push({
    message: err.message,
    stack: err.stack
  });
  result.summary.totalPageErrors++;

  if (format === 'text') {
    console.error('[PAGE ERROR]', err.message);
  }
});

// Capture network errors
page.on('requestfailed', request => {
  const failure = {
    url: request.url(),
    method: request.method(),
    errorText: request.failure()?.errorText,
    resourceType: request.resourceType()
  };
  result.networkErrors.push(failure);
  result.summary.totalNetworkErrors++;

  if (format === 'text') {
    console.error('[NETWORK ERROR]', `${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
  }
});

// Also capture 4xx/5xx responses
page.on('response', response => {
  if (response.status() >= 400) {
    const error = {
      url: response.url(),
      status: response.status(),
      statusText: response.statusText(),
      resourceType: response.request().resourceType()
    };
    result.networkErrors.push(error);
    result.summary.totalNetworkErrors++;

    if (format === 'text') {
      console.error('[HTTP ERROR]', `${response.status()} ${response.url()}`);
    }
  }
});

try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  // Check TouchSpin initialization
  const touchspinData = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[data-testid]');
    const status = {};
    inputs.forEach(input => {
      const testid = input.getAttribute('data-testid');
      status[testid] = {
        initialized: !!input._touchSpinCore,
        value: input.value,
        disabled: input.disabled,
        readonly: input.hasAttribute('readonly')
      };
    });
    return status;
  });

  result.touchspinStatus = touchspinData;

  // Count initialization status
  Object.values(touchspinData).forEach(status => {
    if (status.initialized) {
      result.summary.touchspinInitialized++;
    } else {
      result.summary.touchspinNotInitialized++;
    }
  });

  // Output results
  if (format === 'json') {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('\n=== Summary ===');
    console.log(`Console Errors: ${result.summary.totalConsoleErrors}`);
    console.log(`Console Warnings: ${result.summary.totalConsoleWarnings}`);
    console.log(`Page Errors: ${result.summary.totalPageErrors}`);
    console.log(`Network Errors: ${result.summary.totalNetworkErrors}`);
    if (result.summary.touchspinInitialized + result.summary.touchspinNotInitialized > 0) {
      console.log(`TouchSpin Initialized: ${result.summary.touchspinInitialized}/${result.summary.touchspinInitialized + result.summary.touchspinNotInitialized}`);
    }
  }

} catch (error) {
  result.loadError = {
    message: error.message,
    stack: error.stack
  };

  if (format === 'json') {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.error('Failed to load page:', error.message);
  }
  process.exit(1);
} finally {
  await browser.close();
}

// Exit with error code if there were errors
const hasErrors = result.summary.totalPageErrors > 0 ||
                  result.summary.totalNetworkErrors > 0 ||
                  result.summary.totalConsoleErrors > 0;
process.exit(hasErrors ? 1 : 0);
})();
