#!/usr/bin/env node
import puppeteer from 'puppeteer';

const url = process.argv[2];
const format = process.argv[3] || 'json'; // 'json' or 'text'

if (!url) {
  console.error('Usage: npm run check-console <url> [json|text]');
  console.error('Example: npm run check-console http://localhost:8866/__tests__/html/index-bs4.html');
  process.exit(1);
}

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

const browser = await puppeteer.launch();
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
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  
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