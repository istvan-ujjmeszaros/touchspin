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
      // Ignore coverage errors in non-chromium browsers
      // Ignore
    }
  } else {
    // Coverage not enabled
  }
}

async function collectCoverage(page: Page, testName: string): Promise<void> {
  // Only collect coverage when running with coverage config
  if (process.env.COVERAGE === '1') {
    try {
      const coverage = await page.coverage.stopJSCoverage();
      await saveCoverageData(coverage, testName);
    } catch (error) {
      // Ignore coverage errors in non-chromium browsers
      // Ignore
    }
  }
}

async function saveCoverageData(coverage: any[], testName: string): Promise<void> {
  const fs = require('fs');
  const path = require('path');

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
           !url.includes('dist/');
  });

  if (sourceCoverage.length > 0) {
    // Save raw V8 coverage for processing in teardown
    const fileName = `${testName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    const filePath = path.join(coverageDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(sourceCoverage, null, 2));
  } else {
    // No source files found in coverage
  }
}

async function blurAway(page: Page): Promise<void> {
  // Click the blur target to move focus away from TouchSpin widget
  await page.click('#blur-target');
}

// NOTE: waitForTouchSpinReady is no longer needed!
// TouchSpin now automatically creates wrapper testids as: {inputTestId}-wrapper
// All helper functions automatically wait for the wrapper to exist.
// For manual wrapper access, use: page.getByTestId(inputTestId + '-wrapper')

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
  collectCoverage,
  TOUCHSPIN_EVENT_WAIT: TOUCHSPIN_EVENT_WAIT
};
