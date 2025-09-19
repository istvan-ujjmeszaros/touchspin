import { Page, Locator, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { TouchSpinEmittedEvent } from '@touchspin/core';

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
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Profiler.enable');
      await cdp.send('Profiler.startPreciseCoverage', {
        callCount: true,
        detailed: true
      });
      // Store CDP session on page for later use
      (page as any).__cdpSession = cdp;
    } catch (error) {
      console.error('Failed to start CDP coverage:', error);
    }
  }
}

// jQuery plugin installation AFTER coverage starts
async function installJqueryPlugin(page: Page): Promise<void> {
  // Install the jQuery plugin with Bootstrap 5 renderer from built artifacts
  await page.evaluate(async () => {
    // Fail fast: if any fixture HTML sneaks in /src/ scripts
    const offenders = Array.from(document.querySelectorAll('script[src*="/src/"]'))
      .map(s => (s as HTMLScriptElement).src);
    if (offenders.length) {
      throw new Error("Tests must not load /src/. Use /dist/index.js. Offenders:\n" + offenders.join("\n"));
    }

    const { installWithRenderer, TouchSpinEmittedEvent } = await import('/packages/jquery-plugin/dist/index.js');
    const rendererMod = await import('/packages/renderers/bootstrap5/dist/index.js');
    const Bootstrap5Renderer = (rendererMod as any).default || (rendererMod as any).Bootstrap5Renderer;
    installWithRenderer(Bootstrap5Renderer);

    // Mark as ready for tests
    (window as any).touchSpinReady = true;

    // Set up event logging using the global logEvent function from test-fixture.html
    if ((window as any).logEvent) {
      // Log all TouchSpin events
      const touchspinEvents = [
        TouchSpinEmittedEvent.ON_MIN,
        TouchSpinEmittedEvent.ON_MAX,
        TouchSpinEmittedEvent.ON_START_SPIN,
        TouchSpinEmittedEvent.ON_START_UP_SPIN,
        TouchSpinEmittedEvent.ON_START_DOWN_SPIN,
        TouchSpinEmittedEvent.ON_STOP_SPIN,
        TouchSpinEmittedEvent.ON_STOP_UP_SPIN,
        TouchSpinEmittedEvent.ON_STOP_DOWN_SPIN
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
async function initializeTouchSpinJQuery(page: Page, testId: string, options: any = {}): Promise<void> {
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
      const cdp = (page as any).__cdpSession;
      if (cdp) {
        const { result } = await cdp.send('Profiler.takePreciseCoverage');
        await saveCoverageData(result, testName);
      } else {
        console.warn(`No CDP session found for test: ${testName}`);
      }
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
           (url.includes('/src/') || url.includes('/dist/')) &&
           !url.includes('node_modules') &&
           !url.includes('@vite/client');
  });

  if (sourceCoverage.length > 0) {
    // Save raw V8 coverage for processing in teardown
    const fileName = `${testName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    const filePath = path.join(coverageDir, fileName);
    await fs.promises.writeFile(filePath, JSON.stringify(sourceCoverage, null, 2));
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

// Wait for TouchSpin to be ready/initialized
async function waitForTouchSpinReady(page: Page, testId: string, timeout: number = 5000): Promise<void> {
  try {
    // Wait for INPUT element to have data-touchspin-injected attribute (set last during init)
    await page.waitForSelector(`[data-testid="${testId}"][data-touchspin-injected]`, { timeout });
  } catch (error) {
    throw new Error(`TouchSpin failed to initialize within ${timeout}ms for testId: ${testId}`);
  }
}

// Hold up button for specified duration
async function holdUpButton(page: Page, testId: string, duration: number): Promise<void> {
  const button = page.locator(`[data-testid="${testId}-up"]`);
  const count = await button.count();
  if (count === 0) {
    throw new Error(`TouchSpin up button not found for testId: ${testId}`);
  }

  await button.dispatchEvent('mousedown');
  await page.waitForTimeout(duration);
  await button.dispatchEvent('mouseup');
}

// Hold down button for specified duration
async function holdDownButton(page: Page, testId: string, duration: number): Promise<void> {
  const button = page.locator(`[data-testid="${testId}-down"]`);
  const count = await button.count();
  if (count === 0) {
    throw new Error(`TouchSpin down button not found for testId: ${testId}`);
  }

  await button.dispatchEvent('mousedown');
  await page.waitForTimeout(duration);
  await button.dispatchEvent('mouseup');
}

// Press ArrowUp key once on input
async function pressUpArrowKeyOnInput(page: Page, testId: string): Promise<void> {
  const input = page.locator(`[data-testid="${testId}"]`);
  const count = await input.count();
  if (count === 0) {
    throw new Error(`Input element not found for testId: ${testId}`);
  }

  await input.focus();
  await page.keyboard.press('ArrowUp');
}

// Press ArrowDown key once on input
async function pressDownArrowKeyOnInput(page: Page, testId: string): Promise<void> {
  const input = page.locator(`[data-testid="${testId}"]`);
  const count = await input.count();
  if (count === 0) {
    throw new Error(`Input element not found for testId: ${testId}`);
  }

  await input.focus();
  await page.keyboard.press('ArrowDown');
}

// Hold ArrowUp key for specified duration
async function holdUpArrowKeyOnInput(page: Page, testId: string, duration: number): Promise<void> {
  const input = page.locator(`[data-testid="${testId}"]`);
  const count = await input.count();
  if (count === 0) {
    throw new Error(`Input element not found for testId: ${testId}`);
  }

  await input.focus();
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(duration);
  await page.keyboard.up('ArrowUp');
}

// Hold ArrowDown key for specified duration
async function holdDownArrowKeyOnInput(page: Page, testId: string, duration: number): Promise<void> {
  const input = page.locator(`[data-testid="${testId}"]`);
  const count = await input.count();
  if (count === 0) {
    throw new Error(`Input element not found for testId: ${testId}`);
  }

  await input.focus();
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(duration);
  await page.keyboard.up('ArrowDown');
}

// Type text in input
async function typeInInput(page: Page, testId: string, text: string): Promise<void> {
  const input = page.locator(`[data-testid="${testId}"]`);
  const count = await input.count();
  if (count === 0) {
    throw new Error(`Input element not found for testId: ${testId}`);
  }

  await input.focus();
  await page.keyboard.type(text);
}

// Select all text in input (Ctrl+A)
async function selectAllInInput(page: Page, testId: string): Promise<void> {
  const input = page.locator(`[data-testid="${testId}"]`);
  const count = await input.count();
  if (count === 0) {
    throw new Error(`Input element not found for testId: ${testId}`);
  }

  await input.focus();
  await page.keyboard.press('Control+a');
}

// Get input group addon texts from wrapper
async function getInputGroupAddons(page: Page, testId: string): Promise<string[]> {
  const wrapper = page.locator(`[data-testid="${testId}-wrapper"]`);
  const count = await wrapper.count();
  if (count === 0) {
    throw new Error(`TouchSpin wrapper not found for testId: ${testId}`);
  }

  return await wrapper.evaluate((el) =>
    Array.from(el.querySelectorAll('.input-group-addon, .input-group-text'))
      .map(n => (n.textContent || '').trim())
      .filter(Boolean)
  );
}

// Get up button DOM element
async function getUpButtonElement(page: Page, testId: string): Promise<any> {
  return await page.evaluate((testId) => {
    const button = document.querySelector(`[data-testid="${testId}-up"]`);
    if (!button) {
      throw new Error(`TouchSpin up button not found for testId: ${testId}`);
    }
    return button;
  }, testId);
}

// Get down button DOM element
async function getDownButtonElement(page: Page, testId: string): Promise<any> {
  return await page.evaluate((testId) => {
    const button = document.querySelector(`[data-testid="${testId}-down"]`);
    if (!button) {
      throw new Error(`TouchSpin down button not found for testId: ${testId}`);
    }
    return button;
  }, testId);
}

// Check if input group prepend exists
async function checkPrependExists(page: Page): Promise<boolean> {
  const prepend = page.locator('.input-group-prepend');
  return (await prepend.count()) > 0;
}

// Check if input group append exists
async function checkAppendExists(page: Page): Promise<boolean> {
  const append = page.locator('.input-group-append');
  return (await append.count()) > 0;
}

// ============ Polled Expectation Helpers ============
// One-line assertions with built-in polling

// Expect value to be a specific value (with polling)
async function expectValueToBe(page: Page, testId: string, expected: string, timeout: number = 3000): Promise<void> {
  await page.waitForFunction(({ testId, expected }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    return input && input.value === expected;
  }, { testId, expected }, { timeout });
}

// Expect value to change from one value to another (with polling)
async function expectValueToChange(page: Page, testId: string, from: string, to: string, timeout: number = 3000): Promise<void> {
  // First ensure we're at the 'from' value
  await expectValueToBe(page, testId, from, timeout);
  // Then wait for it to change to the 'to' value
  await expectValueToBe(page, testId, to, timeout);
}

// Expect value to be greater than a specific number (with polling)
async function expectValueToBeGreaterThan(page: Page, testId: string, value: number, timeout: number = 3000): Promise<void> {
  await page.waitForFunction(({ testId, value }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    return input && parseFloat(input.value || '0') > value;
  }, { testId, value }, { timeout });
}

// Expect value to be less than a specific number (with polling)
async function expectValueToBeLessThan(page: Page, testId: string, value: number, timeout: number = 3000): Promise<void> {
  await page.waitForFunction(({ testId, value }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    return input && parseFloat(input.value || '0') < value;
  }, { testId, value }, { timeout });
}

// Expect value to be between two numbers (with polling)
async function expectValueToBeBetween(page: Page, testId: string, min: number, max: number, timeout: number = 3000): Promise<void> {
  await page.waitForFunction(({ testId, min, max }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    if (!input) return false;
    const val = parseFloat(input.value || '0');
    return val >= min && val <= max;
  }, { testId, min, max }, { timeout });
}

// Expect button to be disabled (with polling)
async function expectButtonToBeDisabled(page: Page, testId: string, buttonType: 'up' | 'down', timeout: number = 3000): Promise<void> {
  await page.waitForFunction(({ testId, buttonType }) => {
    const wrapper = document.querySelector(`[data-testid="${testId}-wrapper"]`);
    if (!wrapper) return false;
    const button = wrapper.querySelector(`.bootstrap-touchspin-${buttonType}`) as HTMLElement;
    return button && button.classList.contains('disabled');
  }, { testId, buttonType }, { timeout });
}

// Expect button to be enabled (with polling)
async function expectButtonToBeEnabled(page: Page, testId: string, buttonType: 'up' | 'down', timeout: number = 3000): Promise<void> {
  await page.waitForFunction(({ testId, buttonType }) => {
    const wrapper = document.querySelector(`[data-testid="${testId}-wrapper"]`);
    if (!wrapper) return false;
    const button = wrapper.querySelector(`.bootstrap-touchspin-${buttonType}`) as HTMLElement;
    return button && !button.classList.contains('disabled');
  }, { testId, buttonType }, { timeout });
}

// Expect a specific event to be fired (with polling)
async function expectEventFired(page: Page, eventName: string, timeout: number = 3000): Promise<void> {
  await page.waitForFunction((eventName) => {
    const eventLog = (window as any).eventLog || [];
    return eventLog.some((entry: any) => entry.event === eventName);
  }, eventName, { timeout });
}

// Expect no specific event to be fired (with polling check)
async function expectNoEvent(page: Page, eventName: string, timeout: number = 1000): Promise<void> {
  try {
    await page.waitForFunction((eventName) => {
      const eventLog = (window as any).eventLog || [];
      return eventLog.some((entry: any) => entry.event === eventName);
    }, eventName, { timeout });
    // If we get here, the event was found, which is unexpected
    throw new Error(`Expected event '${eventName}' not to be fired, but it was found in the event log`);
  } catch (error) {
    // If we timeout, that's good - the event wasn't fired
    if (error.message.includes('Timeout')) {
      return; // Success - event was not fired
    }
    // Re-throw other errors
    throw error;
  }
}

// Expect a specific number of events to be fired (with polling)
async function expectEventCount(page: Page, eventName: string, count: number, timeout: number = 3000): Promise<void> {
  await page.waitForFunction(({ eventName, count }) => {
    const eventLog = (window as any).eventLog || [];
    const eventCount = eventLog.filter((entry: any) => entry.event === eventName).length;
    return eventCount === count;
  }, { eventName, count }, { timeout });
}

// ============ Mouse Wheel Helpers ============

// Mouse wheel up on input (for touchspin interactions)
async function wheelUpOnInput(page: Page, testId: string): Promise<void> {
  const input = page.locator(`[data-testid="${testId}"]`);
  const count = await input.count();
  if (count === 0) {
    throw new Error(`Input element not found for testId: ${testId}`);
  }

  await input.focus();
  await page.mouse.wheel(0, -100);
}

// Mouse wheel down on input (for touchspin interactions)
async function wheelDownOnInput(page: Page, testId: string): Promise<void> {
  const input = page.locator(`[data-testid="${testId}"]`);
  const count = await input.count();
  if (count === 0) {
    throw new Error(`Input element not found for testId: ${testId}`);
  }

  await input.focus();
  await page.mouse.wheel(0, 100);
}

// ============ Page Ready Helpers ============

// Wait for page ready flags commonly used in tests
async function waitForPageReady(page: Page, readyFlag: string = 'testPageReady', timeout: number = 5000): Promise<void> {
  await page.waitForFunction(
    (flag) => (window as any)[flag] === true,
    readyFlag,
    { timeout }
  );
}

// Wait for TouchSpin plugin to be ready after installation
async function waitForTouchSpinPluginReady(page: Page, timeout: number = 5000): Promise<void> {
  await page.waitForFunction(
    () => (window as any).touchSpinReady === true,
    {},
    { timeout }
  );
}

// Wait for core test ready flag
async function waitForCoreTestReady(page: Page, timeout: number = 5000): Promise<void> {
  await page.waitForFunction(
    () => (window as any).coreTestReady === true,
    {},
    { timeout }
  );
}

// ============ Attribute Helpers ============

// Get input attribute value
async function getInputAttribute(page: Page, testId: string, attributeName: string): Promise<string | null> {
  await waitForInputOrWrapper(page, testId);
  const input = page.locator(`[data-testid="${testId}"]`);
  return await input.getAttribute(attributeName);
}

// Generic element getter to replace page.getByTestId()
async function getElement(page: Page, testId: string) {
  return page.locator(`[data-testid="${testId}"]`);
}

// Helper for value assertions to replace expect().toHaveValue()
async function expectElementToHaveValue(page: Page, testId: string, expectedValue: string): Promise<void> {
  const actualValue = await readInputValue(page, testId);
  if (actualValue !== expectedValue) {
    throw new Error(`Expected element ${testId} to have value "${expectedValue}", but got "${actualValue}"`);
  }
}

// Generic element click helper
async function clickElement(page: Page, testId: string): Promise<void> {
  const element = page.locator(`[data-testid="${testId}"]`);
  const count = await element.count();
  if (count === 0) {
    throw new Error(`Element not found for testId: ${testId}`);
  }
  await element.click();
}

export {
  getWrapperInstanceWhenReady,
  waitForTimeout,
  cleanupTimeouts,
  readInputValue,
  setInputAttr,
  checkTouchspinUpIsDisabled,
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
  initializeTouchSpinJQuery,
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
  waitForTouchSpinReady,
  holdUpButton,
  holdDownButton,
  pressUpArrowKeyOnInput,
  pressDownArrowKeyOnInput,
  holdUpArrowKeyOnInput,
  holdDownArrowKeyOnInput,
  typeInInput,
  selectAllInInput,
  getInputGroupAddons,
  getUpButtonElement,
  getDownButtonElement,
  checkPrependExists,
  checkAppendExists,
  expectValueToBe,
  expectValueToChange,
  expectValueToBeGreaterThan,
  expectValueToBeLessThan,
  expectValueToBeBetween,
  expectButtonToBeDisabled,
  expectButtonToBeEnabled,
  expectEventFired,
  expectNoEvent,
  expectEventCount,
  wheelUpOnInput,
  wheelDownOnInput,
  waitForPageReady,
  waitForTouchSpinPluginReady,
  waitForCoreTestReady,
  getInputAttribute,
  getElement,
  expectElementToHaveValue,
  clickElement,
  TOUCHSPIN_EVENT_WAIT
};
