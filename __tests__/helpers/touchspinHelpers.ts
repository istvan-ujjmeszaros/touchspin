import { Page, Locator, expect } from '@playwright/test';

// Standard timeout constants
const TOUCHSPIN_EVENT_WAIT = 700;

async function waitForTimeout(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function cleanupTimeouts(): Promise<void> {
  // Playwright handles timeouts automatically, so this is mostly for compatibility
  // Can be used for custom cleanup if needed
}

/**
 * Wait for either the input (by `testid`) OR an initialized wrapper to exist.
 * Does not return anything; used for helpers that only need input access
 * and should also work after destroy.
 */
async function waitForInputOrWrapper(page: Page, testid: string, timeout: number = 5000): Promise<void> {
  await page.waitForFunction(
    ({ tid }) => {
      const el = document.querySelector(`[data-testid="${tid}"]`);
      // If the element exists and it's an input, we are good (works pre/post init)
      if (el && el.tagName && el.tagName.toLowerCase() === 'input') return true;
      // Otherwise, accept an initialized wrapper either by exact id or derived -wrapper
      const asIsWrapper = document.querySelector(`[data-testid="${tid}"][data-touchspin-injected]`);
      const derivedWrapper = document.querySelector(`[data-testid="${tid}-wrapper"][data-touchspin-injected]`);
      return !!(asIsWrapper || derivedWrapper);
    },
    { tid: testid },
    { timeout }
  );
}

/**
 * Waits for a TouchSpin instance to be ready and returns its wrapper locator.
 *
 * Accepts either the input's testid or the wrapper's testid. It waits for a
 * wrapper with `[data-touchspin-injected]` using either the exact testid as-is
 * or the derived "-wrapper" suffix, and always returns the wrapper.
 */
async function getWrapperInstanceWhenReady(page: Page, testid: string, timeout: number = 5000): Promise<Locator> {
  const asIsWrapper = page
    .locator(`[data-testid="${testid}"][data-touchspin-injected]`)
    .first();
  const derivedWrapper = page
    .locator(`[data-testid="${testid}-wrapper"][data-touchspin-injected]`)
    .first();

  await page.waitForFunction(
    ({ tid }) => {
      const asIs = document.querySelector(`[data-testid="${tid}"][data-touchspin-injected]`);
      const derived = document.querySelector(`[data-testid="${tid}-wrapper"][data-touchspin-injected]`);
      return !!(asIs || derived);
    },
    { tid: testid },
    { timeout }
  );

  if (await asIsWrapper.count()) {
    return asIsWrapper;
  }
  return derivedWrapper;
}

async function readInputValue(page: Page, inputTestId: string): Promise<string> {
  await waitForInputOrWrapper(page, inputTestId);
  // Directly access input using its testid
  const input = page.getByTestId(inputTestId);
  const value = await input.inputValue();
  return value ?? '';
}

async function setInputAttr(page: Page, inputTestId: string, attributeName: 'disabled' | 'readonly', attributeValue: boolean): Promise<void> {
  await waitForInputOrWrapper(page, inputTestId);
  // Directly access input using its testid
  const input = page.getByTestId(inputTestId);
  if (attributeValue) {
    await input.evaluate((el, attr) => el.setAttribute(attr, ''), attributeName);
  } else {
    await input.evaluate((el, attr) => el.removeAttribute(attr), attributeName);
  }
}

async function checkTouchspinUpIsDisabled(page: Page, inputTestId: string): Promise<boolean> {
  const wrapper = await getWrapperInstanceWhenReady(page, inputTestId);

  // Try different button locations within this specific TouchSpin instance
  const selectors = [
    '.bootstrap-touchspin-up',
    '.input-group-btn .bootstrap-touchspin-up',
    '.input-group-append .bootstrap-touchspin-up',
    '.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-up',
  ];

  for (const sel of selectors) {
    const button = wrapper.locator(sel);
    const count = await button.count();

    if (count > 0) {
      const isDisabled = await button.first().evaluate((el: HTMLButtonElement) => {
        return el.hasAttribute('disabled') || el.disabled;
      });
      return isDisabled;
    }
  }

  return false; // If no button found, assume not disabled
}

async function touchspinClickUp(page: Page, inputTestId: string): Promise<void> {
  const wrapper = await getWrapperInstanceWhenReady(page, inputTestId);
  // Get the initial state to determine if change is expected
  const initialState = await page.evaluate((testId) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    if (!input) return null;

    // Check input state
    const isDisabled = input.disabled || input.hasAttribute('disabled');
    const isReadonly = input.readOnly || input.hasAttribute('readonly');
    const currentValue = parseFloat(input.value) || 0;

    // Try to get TouchSpin settings from core instance
    const touchSpinCore = (input as any)._touchSpinCore;
    let maxValue = null;
    if (touchSpinCore && touchSpinCore.settings) {
      maxValue = touchSpinCore.settings.max;
    } else {
      // Fallback: check for data attributes or native attributes
      const dataMax = input.getAttribute('data-bts-max');
      const nativeMax = input.getAttribute('max');
      if (dataMax) maxValue = parseFloat(dataMax);
      else if (nativeMax) maxValue = parseFloat(nativeMax);
    }

    // Determine if value change is expected
    const atMaxBoundary = maxValue != null && currentValue >= maxValue;
    const shouldChange = !isDisabled && !isReadonly && !atMaxBoundary;

    return {
      value: input.value,
      disabled: isDisabled,
      readonly: isReadonly,
      atMaxBoundary,
      shouldChange
    };
  }, inputTestId);

  if (!initialState) {
    throw new Error('TouchSpin input not found');
  }

  // Find and click the specific button for this TouchSpin instance
  const clickResult = await wrapper.evaluate((container) => {
    const input = container.querySelector('input');
    if (!input) return { success: false, error: 'Input not found' };

    // Find the closest input-group or wrapper that contains both input and buttons
    const parent = input.closest('.input-group') ||
                  input.closest('.bootstrap-touchspin') ||
                  input.parentElement;

    if (!parent) return { success: false, error: 'Parent container not found' };

    const button = parent.querySelector('[data-touchspin-injected="up"]') as HTMLButtonElement;
    if (!button) return { success: false, error: 'Up button not found in parent' };

    // Check if button is clickable
    const isClickable = !button.disabled &&
                       !button.hasAttribute('disabled') &&
                       button.offsetParent !== null;

    if (!isClickable) return { success: false, error: 'Button not clickable' };

    // Trigger plain DOM mousedown and mouseup events (what TouchSpin core expects)
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      button: 0
    });

    const mouseUpEvent = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      button: 0
    });

    button.dispatchEvent(mouseDownEvent);

    // Immediately trigger mouseup to prevent spinning
    setTimeout(() => {
      button.dispatchEvent(mouseUpEvent);
    }, 10);

    return {
      success: true,
      buttonInfo: {
        className: button.className,
        id: button.id,
        disabled: button.disabled
      }
    };
  });

  if (!clickResult.success) {
    // Only warn for unexpected button click failures
    if (clickResult.error === 'Button not clickable' && !initialState.disabled && !initialState.readonly) {
      console.warn('Button not clickable - unexpected for enabled input');
    }
    return; // Exit early - don't wait for value change
  }

  // Only wait for value change if we expect it to happen
  if (initialState.shouldChange) {
    try {
      await page.waitForFunction(
        ({ testId, initialVal }: { testId: string; initialVal: string }) => {
          const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
          return input && input.value !== initialVal;
        },
        { testId: inputTestId, initialVal: initialState.value },
        { timeout: 2000 }
      );
    } catch (error) {
      // Only warn for truly unexpected failures
      console.warn('Value did not change within timeout - unexpected for enabled input not at boundary');
    }
  }
  // If change is not expected (disabled/readonly/at boundary), don't wait and don't warn
}

async function touchspinClickDown(page: Page, inputTestId: string): Promise<void> {
  const wrapper = await getWrapperInstanceWhenReady(page, inputTestId);
  // Get the initial state to determine if change is expected
  const initialState = await page.evaluate((testId) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    if (!input) return null;

    // Check input state
    const isDisabled = input.disabled || input.hasAttribute('disabled');
    const isReadonly = input.readOnly || input.hasAttribute('readonly');
    const currentValue = parseFloat(input.value) || 0;

    // Try to get TouchSpin settings from core instance
    const touchSpinCore = (input as any)._touchSpinCore;
    let minValue = null;
    if (touchSpinCore && touchSpinCore.settings) {
      minValue = touchSpinCore.settings.min;
    } else {
      // Fallback: check for data attributes or native attributes
      const dataMin = input.getAttribute('data-bts-min');
      const nativeMin = input.getAttribute('min');
      if (dataMin) minValue = parseFloat(dataMin);
      else if (nativeMin) minValue = parseFloat(nativeMin);
    }

    // Determine if value change is expected
    const atMinBoundary = minValue != null && currentValue <= minValue;
    const shouldChange = !isDisabled && !isReadonly && !atMinBoundary;

    return {
      value: input.value,
      disabled: isDisabled,
      readonly: isReadonly,
      atMinBoundary,
      shouldChange
    };
  }, inputTestId);

  if (!initialState) {
    throw new Error('TouchSpin input not found');
  }

  // Find and click the specific button for this TouchSpin instance
  const clickResult = await wrapper.evaluate((container) => {
    const input = container.querySelector('input');
    if (!input) return { success: false, error: 'Input not found' };

    // Find the closest input-group or wrapper that contains both input and buttons
    const parent = input.closest('.input-group') ||
                  input.closest('.bootstrap-touchspin') ||
                  input.parentElement;

    if (!parent) return { success: false, error: 'Parent container not found' };

    const button = parent.querySelector('[data-touchspin-injected="down"]') as HTMLButtonElement;
    if (!button) return { success: false, error: 'Down button not found in parent' };

    // Check if button is clickable
    const isClickable = !button.disabled &&
                       !button.hasAttribute('disabled') &&
                       button.offsetParent !== null;

    if (!isClickable) return { success: false, error: 'Button not clickable' };

    // Trigger plain DOM mousedown and mouseup events (what TouchSpin core expects)
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      button: 0
    });

    const mouseUpEvent = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      button: 0
    });

    button.dispatchEvent(mouseDownEvent);

    // Immediately trigger mouseup to prevent spinning
    setTimeout(() => {
      button.dispatchEvent(mouseUpEvent);
    }, 10);

    return {
      success: true,
      buttonInfo: {
        className: button.className,
        id: button.id,
        disabled: button.disabled
      }
    };
  });

  if (!clickResult.success) {
    // Only warn for unexpected button click failures
    if (clickResult.error === 'Button not clickable' && !initialState.disabled && !initialState.readonly) {
      console.warn('Down button not clickable - unexpected for enabled input');
    }
    return; // Exit early - don't wait for value change
  }

  // Only wait for value change if we expect it to happen
  if (initialState.shouldChange) {
    try {
      await page.waitForFunction(
        ({ testId, initialVal }: { testId: string; initialVal: string }) => {
          const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
          return input && input.value !== initialVal;
        },
        { testId: inputTestId, initialVal: initialState.value },
        { timeout: 2000 }
      );
    } catch (error) {
      // Only warn for truly unexpected failures
      console.warn('Down value did not change within timeout - unexpected for enabled input not at boundary');
    }
  }
  // If change is not expected (disabled/readonly/at boundary), don't wait and don't warn
}

async function changeEventCounter(page: Page): Promise<number> {
  // Get the event log content (this is global, not scoped to a specific TouchSpin)
  const eventLogContent = await page.locator('#events_log').textContent();

  // Count the number of 'change' events
  return (eventLogContent?.match(/change\[/g) ?? []).length;
}

async function countChangeWithValue(page: Page, expectedValue: string): Promise<number> {
  const expectedPattern = 'change[' + expectedValue + ']';
  return await page.evaluate((pattern) => {
    const eventsLog = document.getElementById('events_log');
    if (!eventsLog) return 0;
    const logContent = eventsLog.textContent || '';
    return (logContent.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  }, expectedPattern);
}

async function getElementIdFromTestId(page: Page, testid: string): Promise<string> {
  await waitForInputOrWrapper(page, testid);
  // Get the element ID from a testid for event counting
  const elementId = await page.getByTestId(testid).getAttribute('id');
  return elementId || testid;
}

async function countEvent(page: Page, elementIdOrSelector: string, event: string): Promise<number> {
  // Get the event log content (this is global, not scoped to a specific TouchSpin)
  const eventLogContent = await page.locator('#events_log').textContent();

  // Count the number of events with the expected value
  // Event log format is "#elementId: event" so ensure we have the # prefix
  const searchString = (elementIdOrSelector.startsWith('#') ? '' : '#') + elementIdOrSelector + ': ' + event;
  return (eventLogContent ? eventLogContent.split(searchString).length - 1 : 0);
}

async function fillWithValue(page: Page, inputTestId: string, value: string): Promise<void> {
  await waitForInputOrWrapper(page, inputTestId);
  // Directly access input using its testid
  const input = page.getByTestId(inputTestId);
  await input.focus();
  // Has to be triple click to select all text when using decorators
  await input.click({ clickCount: 3 });
  await input.fill(value);
  // Wait a small amount to ensure the value is set
  await waitForTimeout(10);
}

async function fillWithValueAndBlur(page: Page, inputTestId: string, value: string): Promise<void> {
  await waitForInputOrWrapper(page, inputTestId);
  // Fill the input with a value and trigger blur-based sanitization
  await fillWithValue(page, inputTestId, value);

  // Get the current value to detect if sanitization occurs
  const initialValue = await readInputValue(page, inputTestId);

  // Press Tab to trigger blur
  await page.keyboard.press('Tab');

  // Wait for sanitization to complete - check if value changed or wait a reasonable time
  try {
    await page.waitForFunction(
      ({ testId, initial }: { testId: string; initial: string | null }) => {
        const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
        // Either the value changed (sanitization happened) or we need to give it time
        return input && (input.value !== initial || Date.now() > (window as any)._sanitizeWaitStart + 100);
      },
      { testId: inputTestId, initial: initialValue },
      { timeout: 1000 }
    );
  } catch (error) {
    // If waitForFunction times out, just wait a fixed amount for sanitization
    await waitForTimeout(100);
  }
}

async function waitForSanitization(page: Page, inputTestId: string): Promise<void> {
  await waitForInputOrWrapper(page, inputTestId);
  // Wait for any async sanitization to complete after user input
  await waitForTimeout(100);
}

async function focusUpButton(page: Page, inputTestId: string): Promise<void> {
  const wrapper = await getWrapperInstanceWhenReady(page, inputTestId);
  const upButton = wrapper.locator('[data-touchspin-injected="up"]');
  await upButton.focus();
}

async function focusDownButton(page: Page, inputTestId: string): Promise<void> {
  const wrapper = await getWrapperInstanceWhenReady(page, inputTestId);
  const downButton = wrapper.locator('[data-touchspin-injected="down"]');
  await downButton.focus();
}

async function focusOutside(page: Page, outsideTestId: string): Promise<void> {
  // Focus an element completely outside the TouchSpin widget
  const outsideElement = page.getByTestId(outsideTestId);
  await outsideElement.focus();
}

// Coverage collection functionality
async function startCoverage(page: Page): Promise<void> {
  // Only collect coverage when running with coverage config
  if (process.env.COVERAGE === '1') {
    try {
      await page.coverage.startJSCoverage({
        resetOnNavigation: false
      });
    } catch (error) {
      console.error('Failed to start coverage:', error);
    }
  }

  // Set COVERAGE_DIST flag in browser context if environment variable is set
  if (process.env.COVERAGE_DIST === '1') {
    await page.evaluate(() => {
      (window as any).COVERAGE_DIST = true;
    });

    // Add import map for bare module specifiers when in dist mode
    await page.addInitScript(() => {
      const importMap = {
        imports: {
          '@touchspin/core': '/packages/core/dist/index.js',
          '@touchspin/renderer-bootstrap5': '/packages/renderers/bootstrap5/dist/index.js'
        }
      };

      const script = document.createElement('script');
      script.type = 'importmap';
      script.textContent = JSON.stringify(importMap);
      document.head.appendChild(script);
    });
  }

  // Enforce dist assets in coverage mode: serve files directly from filesystem
  if (process.env.COVERAGE_DIST === '1') {
    const fs = await import('fs');
    const path = await import('path');

    // Handle any request to /packages/**/src/** by translating to equivalent /dist/ path
    await page.route('**/packages/**/src/**', async (route) => {
      const orig = new URL(route.request().url());
      const distPath = orig.pathname
        .replace('/src/', '/dist/')
        .replace(/\.ts$/, '.js');

      // Convert URL path to local filesystem path
      const pathIndex = distPath.indexOf('/packages/');
      if (pathIndex === -1) {
        await route.abort();
        return;
      }

      const relativePath = distPath.slice(pathIndex + 1); // Remove leading slash
      const localPath = path.join(process.cwd(), relativePath);

      if (fs.existsSync(localPath)) {
        console.warn(`[COVERAGE_DIST] fulfill (src→dist): ${route.request().url()} → ${localPath}`);
        await route.fulfill({ path: localPath });
      } else {
        console.error(`[COVERAGE_DIST] dist file not found: ${localPath}`);
        await route.abort();
      }
    });

    // Also handle direct requests to /packages/**/dist/** from filesystem
    await page.route('**/packages/**/dist/**', async (route) => {
      const orig = new URL(route.request().url());
      const pathIndex = orig.pathname.indexOf('/packages/');
      if (pathIndex === -1) {
        await route.abort();
        return;
      }

      const relativePath = orig.pathname.slice(pathIndex + 1); // Remove leading slash
      const localPath = path.join(process.cwd(), relativePath);

      if (fs.existsSync(localPath)) {
        console.warn(`[COVERAGE_DIST] fulfill (dist): ${route.request().url()} → ${localPath}`);
        await route.fulfill({ path: localPath });
      } else {
        console.error(`[COVERAGE_DIST] dist file not found: ${localPath}`);
        await route.abort();
      }
    });

  }
}

// jQuery plugin installation AFTER coverage starts
async function installJqueryPlugin(page: Page): Promise<void> {
  // Install the jQuery plugin with Bootstrap 5 renderer
  // This MUST be called after startCoverage() for accurate coverage
  await page.evaluate(async () => {
    // Determine if we should use dist or src based on COVERAGE_DIST flag
    const useDist = !!(window as any).COVERAGE_DIST;

    // Choose appropriate module paths
    const pluginPath = useDist
      ? '/packages/jquery-plugin/dist/index.js'
      : '/packages/jquery-plugin/src/index.js';
    const rendererPath = useDist
      ? '/packages/renderers/bootstrap5/dist/index.js'
      : '/packages/renderers/bootstrap5/src/Bootstrap5Renderer.js';

    // Import the plugin and renderer
    const { installWithRenderer } = await import(pluginPath);
    const bootstrapModule = await import(rendererPath);
    const Bootstrap5Renderer = bootstrapModule.default || bootstrapModule.Bootstrap5Renderer;

    // Install with renderer
    installWithRenderer(Bootstrap5Renderer);

    // Mark as ready for tests
    (window as any).touchSpinReady = true;

    // Set up event logging using the global logEvent function from test-fixture.html
    if ((window as any).logEvent) {
      // Log all TouchSpin events
      const touchspinEvents = [
        'touchspin.on.min',
        'touchspin.on.max',
        'touchspin.on.startspin',
        'touchspin.on.startupspin',
        'touchspin.on.startdownspin',
        'touchspin.on.stopspin',
        'touchspin.on.stopupspin',
        'touchspin.on.stopdownspin'
      ];

      // Set up event listeners on document level to catch all TouchSpin events
      touchspinEvents.forEach(eventName => {
        $(document).on(eventName, function(e: any) {
          const target = e.target as HTMLElement;
          const testId = target.getAttribute('data-testid') || target.id || 'unknown';
          const value = (target as HTMLInputElement).value;
          (window as any).logEvent(eventName, { target: testId, value });
        });
      });

      // Define all native events to log
      const nativeEvents = [
        // Form events
        'change', 'input', 'submit', 'reset', 'select',
        // Focus events
        'focus', 'blur', 'focusin', 'focusout',
        // Keyboard events
        'keydown', 'keyup', 'keypress',
        // Mouse events
        'click', 'dblclick', 'mousedown', 'mouseup',
        'mouseenter', 'mouseleave', 'mouseover', 'mouseout', 'mousemove',
        // Other interaction events
        'wheel', 'contextmenu'
      ];

      // Log native events on inputs
      nativeEvents.forEach(eventName => {
        $(document).on(eventName, 'input[data-testid]', function(e: any) {
          const target = e.target as HTMLElement;
          const testId = target.getAttribute('data-testid') || 'unknown';
          const detail: any = { target: testId };

          // Include value for events where it makes sense
          if (['change', 'input', 'keydown', 'keyup', 'keypress', 'select'].includes(eventName)) {
            detail.value = (target as HTMLInputElement).value;
          }

          (window as any).logEvent(eventName, detail);
        });
      });

      // Also log events on TouchSpin buttons (they have class bootstrap-touchspin-up/down)
      const buttonEvents = ['click', 'mousedown', 'mouseup', 'mouseenter', 'mouseleave'];
      buttonEvents.forEach(eventName => {
        $(document).on(eventName, '.bootstrap-touchspin-up, .bootstrap-touchspin-down', function(e: any) {
          const button = e.currentTarget as HTMLElement;
          const isUp = button.classList.contains('bootstrap-touchspin-up');
          const input = button.closest('.bootstrap-touchspin')?.querySelector('input[data-testid]') as HTMLElement;
          const testId = input?.getAttribute('data-testid') || 'unknown';
          const detail = {
            target: `${testId}-${isUp ? 'up' : 'down'}-button`
          };
          (window as any).logEvent(eventName, detail);
        });
      });

      console.log('Event logging initialized for all TouchSpin and native events');
    } else {
      console.warn('Global logEvent function not found - event logging disabled');
    }
  });
}

// Helper to create additional test inputs dynamically
async function createAdditionalInput(page: Page, testId: string, options: {
  value?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  readonly?: boolean;
  label?: string;
} = {}): Promise<void> {
  await page.evaluate(({ id, opts }) => {
    // Use the page's helper function to create input
    (window as any).createTestInput(id, opts);
  }, { id: testId, opts: options });
}

// Helper to clear all additional inputs
async function clearAdditionalInputs(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as any).clearAdditionalInputs();
  });
}

// Initialize TouchSpin on a specific input
async function initializeTouchSpin(page: Page, testId: string, options: any = {}): Promise<void> {
  await page.evaluate(({ id, opts }) => {
    const $input = $(`[data-testid="${id}"]`);
    // If initval is specified, set the input value before initializing TouchSpin
    if (opts.initval !== undefined) {
      $input.val(opts.initval);
    }
    $input.TouchSpin(opts);
  }, { id: testId, opts: options });
}

// Get the TouchSpin wrapper for a given test ID
async function getTouchSpinWrapper(page: Page, testId: string) {
  return page.locator(`[data-testid="${testId}"]`).locator('xpath=..');
}

// Get TouchSpin elements for a given test ID
async function getTouchSpinElements(page: Page, testId: string) {
  const wrapper = await getTouchSpinWrapper(page, testId);
  return {
    wrapper,
    input: page.locator(`[data-testid="${testId}"]`),
    upButton: wrapper.locator('.bootstrap-touchspin-up').first(),
    downButton: wrapper.locator('.bootstrap-touchspin-down').first(),
    prefix: wrapper.locator('.bootstrap-touchspin-prefix').first(),
    postfix: wrapper.locator('.bootstrap-touchspin-postfix').first()
  };
}

// Check if TouchSpin has prefix
async function hasPrefix(page: Page, testId: string, expectedText?: string): Promise<boolean> {
  const elements = await getTouchSpinElements(page, testId);
  const exists = await elements.prefix.count() > 0;
  if (!exists) return false;
  if (expectedText !== undefined) {
    const text = await elements.prefix.textContent();
    return text === expectedText;
  }
  return true;
}

// Check if TouchSpin has postfix
async function hasPostfix(page: Page, testId: string, expectedText?: string): Promise<boolean> {
  const elements = await getTouchSpinElements(page, testId);
  const exists = await elements.postfix.count() > 0;
  if (!exists) return false;
  if (expectedText !== undefined) {
    const text = await elements.postfix.textContent();
    return text === expectedText;
  }
  return true;
}

async function collectCoverage(page: Page, testName: string): Promise<void> {
  // Only collect coverage when running with coverage config
  if (process.env.COVERAGE === '1') {
    try {
      const coverage = await page.coverage.stopJSCoverage();
      await saveCoverageData(coverage, testName);
    } catch (error) {
      // Log the error so we can see what's happening
      console.error(`Coverage collection error for ${testName}:`, error);
    }
  }
}

async function saveCoverageData(coverage: any[], testName: string): Promise<void> {
  const fs = await import('fs');
  const path = await import('path');

  const coverageDir = path.join(process.cwd(), 'reports', 'playwright-coverage');
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }


  // Filter coverage to include source files from packages
  const sourceCoverage = coverage.filter(entry => {
    const url = entry.url || '';
    return url.includes('/packages/') &&
           url.includes('/src/') &&
           !url.includes('node_modules') &&
           !url.includes('dist/') &&
           !url.includes('@vite/client');
  });

  if (sourceCoverage.length > 0) {
    // Save raw V8 coverage for processing in teardown
    const fileName = `${testName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    const filePath = path.join(coverageDir, fileName);
    await fs.promises.writeFile(filePath, JSON.stringify(sourceCoverage, null, 2));
  } else {
    // No source files found in coverage
  }
}

async function blurAway(page: Page): Promise<void> {
  // Click the blur target to move focus away from TouchSpin widget
  await page.click('#blur-target');
}

// Strict version of getTouchSpinElements that throws if elements don't exist
async function getTouchSpinElementsStrict(page: Page, testId: string) {
  const wrapper = await getTouchSpinWrapper(page, testId);
  const elements = {
    wrapper,
    input: page.locator(`[data-testid="${testId}"]`),
    upButton: wrapper.locator('.bootstrap-touchspin-up').first(),
    downButton: wrapper.locator('.bootstrap-touchspin-down').first(),
    prefix: wrapper.locator('.bootstrap-touchspin-prefix').first(),
    postfix: wrapper.locator('.bootstrap-touchspin-postfix').first()
  };

  // Verify all critical elements exist
  if (await elements.input.count() === 0) {
    throw new Error(`Input element not found for testId: ${testId}`);
  }
  if (await elements.upButton.count() === 0) {
    throw new Error(`Up button not found for testId: ${testId}`);
  }
  if (await elements.downButton.count() === 0) {
    throw new Error(`Down button not found for testId: ${testId}`);
  }

  return elements;
}

// Click the up button (strict - throws if not found)
async function clickUpButton(page: Page, testId: string): Promise<void> {
  const elements = await getTouchSpinElementsStrict(page, testId);
  await elements.upButton.click();
}

// Click the down button (strict - throws if not found)
async function clickDownButton(page: Page, testId: string): Promise<void> {
  const elements = await getTouchSpinElementsStrict(page, testId);
  await elements.downButton.click();
}

// Get the full event log as an array
async function getEventLog(page: Page): Promise<Array<{type: string, event: string, target?: string, value?: string}>> {
  return await page.evaluate(() => {
    return (window as any).eventLog || [];
  });
}

// Clear the event log
async function clearEventLog(page: Page): Promise<void> {
  await page.evaluate(() => {
    if ((window as any).clearEventLog) {
      (window as any).clearEventLog();
    } else {
      (window as any).eventLog = [];
      const logElement = document.getElementById('event-log');
      if (logElement) {
        (logElement as HTMLTextAreaElement).value = '';
      }
    }
  });
}

// Check if a specific event is in the log
async function hasEventInLog(page: Page, eventName: string, eventType?: 'native' | 'touchspin'): Promise<boolean> {
  const log = await getEventLog(page);
  return log.some(entry => {
    const matchesEvent = entry.event === eventName;
    const matchesType = !eventType || entry.type === eventType;
    return matchesEvent && matchesType;
  });
}

// Get all events of a specific type
async function getEventsOfType(page: Page, eventType: 'native' | 'touchspin'): Promise<Array<any>> {
  const log = await getEventLog(page);
  return log.filter(entry => entry.type === eventType);
}

// Count occurrences of a specific event
async function countEventInLog(page: Page, eventName: string, eventType?: 'native' | 'touchspin'): Promise<number> {
  const log = await getEventLog(page);
  return log.filter(entry => {
    const matchesEvent = entry.event === eventName;
    const matchesType = !eventType || entry.type === eventType;
    return matchesEvent && matchesType;
  }).length;
}

// Wait for an event to appear in the log
async function waitForEventInLog(page: Page, eventName: string, options?: { eventType?: 'native' | 'touchspin', timeout?: number }): Promise<boolean> {
  const timeout = options?.timeout || 5000;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await hasEventInLog(page, eventName, options?.eventType)) {
      return true;
    }
    await page.waitForTimeout(100);
  }

  return false;
}

// Get the visual event log text
async function getEventLogText(page: Page): Promise<string> {
  return await page.evaluate(() => {
    const logElement = document.getElementById('event-log');
    return logElement ? (logElement as HTMLTextAreaElement).value : '';
  });
}

// NOTE: waitForTouchSpinReady is no longer needed!
// TouchSpin now automatically creates wrapper testids as: {inputTestId}-wrapper
// All helper functions automatically wait for the wrapper to exist.
// For manual wrapper access, use: page.getByTestId(inputTestId + '-wrapper')

// Check if TouchSpin is initialized on an element
async function isTouchSpinInitialized(page: Page, testId: string): Promise<boolean> {
  const wrapper = page.locator(`[data-testid="${testId}-wrapper"][data-touchspin-injected]`);
  return (await wrapper.count()) > 0;
}

// Expect TouchSpin to be initialized, throwing clear error if not
async function expectTouchSpinInitialized(page: Page, testId: string): Promise<void> {
  const isInitialized = await isTouchSpinInitialized(page, testId);
  if (!isInitialized) {
    throw new Error(`TouchSpin not initialized on element with testId: ${testId}. Expected wrapper with data-testid="${testId}-wrapper" and data-touchspin-injected attribute.`);
  }
}

// Check if TouchSpin is destroyed (no wrapper exists)
async function isTouchSpinDestroyed(page: Page, testId: string): Promise<boolean> {
  const wrapper = page.locator(`[data-testid="${testId}-wrapper"][data-touchspin-injected]`);
  return (await wrapper.count()) === 0;
}

// Expect TouchSpin to be destroyed, throwing clear error if still initialized
async function expectTouchSpinDestroyed(page: Page, testId: string): Promise<void> {
  const isDestroyed = await isTouchSpinDestroyed(page, testId);
  if (!isDestroyed) {
    throw new Error(`TouchSpin still initialized on element with testId: ${testId}. Expected no wrapper with data-testid="${testId}-wrapper".`);
  }
}

export default {
  getWrapperInstanceWhenReady,
  waitForTimeout,
  cleanupTimeouts,
  readInputValue,
  setInputAttr,
  checkTouchspinUpIsDisabled,
  touchspinClickUp,
  touchspinClickDown,
  changeEventCounter,
  countEvent,
  countChangeWithValue,
  fillWithValue,
  fillWithValueAndBlur,
  waitForSanitization,
  focusUpButton,
  focusDownButton,
  focusOutside,
  blurAway,
  getElementIdFromTestId,
  startCoverage,
  installJqueryPlugin,
  collectCoverage,
  createAdditionalInput,
  clearAdditionalInputs,
  initializeTouchSpin,
  getTouchSpinWrapper,
  getTouchSpinElements,
  getTouchSpinElementsStrict,
  hasPrefix,
  hasPostfix,
  clickUpButton,
  clickDownButton,
  getEventLog,
  clearEventLog,
  hasEventInLog,
  getEventsOfType,
  countEventInLog,
  waitForEventInLog,
  getEventLogText,
  isTouchSpinInitialized,
  expectTouchSpinInitialized,
  isTouchSpinDestroyed,
  expectTouchSpinDestroyed,
  TOUCHSPIN_EVENT_WAIT: TOUCHSPIN_EVENT_WAIT
};
