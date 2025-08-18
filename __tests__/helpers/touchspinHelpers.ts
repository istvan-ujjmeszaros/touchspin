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

async function readInputValue(page: Page, inputTestId: string): Promise<string | null> {
  // Directly access input using its testid
  const input = page.getByTestId(inputTestId);
  return await input.inputValue();
}

async function setInputAttr(page: Page, inputTestId: string, attributeName: 'disabled' | 'readonly', attributeValue: boolean): Promise<void> {
  // Directly access input using its testid
  const input = page.getByTestId(inputTestId);
  if (attributeValue) {
    await input.evaluate((el, attr) => el.setAttribute(attr, ''), attributeName);
  } else {
    await input.evaluate((el, attr) => el.removeAttribute(attr), attributeName);
  }
}

async function checkTouchspinUpIsDisabled(page: Page, inputTestId: string): Promise<boolean> {
  // Wait for TouchSpin wrapper to be ready and get it
  const touchspinContainer = page.getByTestId(inputTestId + '-wrapper');
  
  // Try different button locations within this specific TouchSpin instance
  const selectors = [
    '.bootstrap-touchspin-up',
    '.input-group-btn .bootstrap-touchspin-up',
    '.input-group-append .bootstrap-touchspin-up',
    '.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-up',
  ];

  for (const sel of selectors) {
    const button = touchspinContainer.locator(sel);
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
  // Get the initial value for comparison
  const initialValue = await readInputValue(page, inputTestId);
  // Get the TouchSpin wrapper that contains both input and buttons
  const touchspinContainer = page.getByTestId(inputTestId + '-wrapper');

  // Find and click the specific button for this TouchSpin instance
  const clickResult = await touchspinContainer.evaluate((container) => {
    const input = container.querySelector('input');
    if (!input) return { success: false, error: 'Input not found' };

    // Find the closest input-group or wrapper that contains both input and buttons
    const parent = input.closest('.input-group') ||
                  input.closest('.bootstrap-touchspin') ||
                  input.parentElement;

    if (!parent) return { success: false, error: 'Parent container not found' };

    const button = parent.querySelector('.bootstrap-touchspin-up') as HTMLButtonElement;
    if (!button) return { success: false, error: 'Up button not found in parent' };

    // Check if button is clickable
    const isClickable = !button.disabled &&
                       !button.hasAttribute('disabled') &&
                       button.offsetParent !== null;

    if (!isClickable) return { success: false, error: 'Button not clickable' };

    // Trigger mousedown and mouseup events (what TouchSpin expects)
    const $ = (window as any).$;
    if ($) {
      const $btn = $(button);
      $btn.trigger('mousedown.touchspin');
      // Immediately trigger mouseup to prevent spinning
      setTimeout(() => {
        $btn.trigger('mouseup.touchspin');
      }, 10);
    } else {
      // Fallback to click if jQuery not available
      button.click();
    }

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
    // If button is not clickable (disabled), that's expected for some tests
    if (clickResult.error === 'Button not clickable') {
      console.warn('Button not clickable - this may be expected for disabled/readonly inputs');
      return;
    }
    throw new Error(`TouchSpin up button click failed: ${clickResult.error}`);
  }

  // Wait for the value to actually change
  try {
    await page.waitForFunction(
      ({ testId, initialVal }: { testId: string; initialVal: string | null }) => {
        const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
        return input && input.value !== initialVal;
      },
      { testId: inputTestId, initialVal: initialValue },
      { timeout: 2000 }
    );
  } catch (error) {
    console.warn('Value did not change within timeout - this may be expected for disabled inputs');
  }
}

async function touchspinClickDown(page: Page, inputTestId: string): Promise<void> {
  // Get the initial value for comparison
  const initialValue = await readInputValue(page, inputTestId);
  // Wait for TouchSpin wrapper to be ready and get it
  const touchspinContainer = page.getByTestId(inputTestId + '-wrapper');

  // Find and click the specific button for this TouchSpin instance
  const clickResult = await touchspinContainer.evaluate((container) => {
    const input = container.querySelector('input');
    if (!input) return { success: false, error: 'Input not found' };

    // Find the closest input-group or wrapper that contains both input and buttons
    const parent = input.closest('.input-group') ||
                  input.closest('.bootstrap-touchspin') ||
                  input.parentElement;

    if (!parent) return { success: false, error: 'Parent container not found' };

    const button = parent.querySelector('.bootstrap-touchspin-down') as HTMLButtonElement;
    if (!button) return { success: false, error: 'Down button not found in parent' };

    // Check if button is clickable
    const isClickable = !button.disabled &&
                       !button.hasAttribute('disabled') &&
                       button.offsetParent !== null;

    if (!isClickable) return { success: false, error: 'Button not clickable' };

    // Trigger mousedown and mouseup events (what TouchSpin expects)
    const $ = (window as any).$;
    if ($) {
      const $btn = $(button);
      $btn.trigger('mousedown.touchspin');
      // Immediately trigger mouseup to prevent spinning
      setTimeout(() => {
        $btn.trigger('mouseup.touchspin');
      }, 10);
    } else {
      // Fallback to click if jQuery not available
      button.click();
    }

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
    // If button is not clickable (disabled), that's expected for some tests
    if (clickResult.error === 'Button not clickable') {
      console.warn('Down button not clickable - this may be expected for disabled/readonly inputs');
      return;
    }
    throw new Error(`TouchSpin down button click failed: ${clickResult.error}`);
  }

  // Wait for the value to actually change
  try {
    await page.waitForFunction(
      ({ testId, initialVal }: { testId: string; initialVal: string | null }) => {
        const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
        return input && input.value !== initialVal;
      },
      { testId: inputTestId, initialVal: initialValue },
      { timeout: 2000 }
    );
  } catch (error) {
    console.warn('Down value did not change within timeout - this may be expected for disabled inputs');
  }
}

async function changeEventCounter(page: Page): Promise<number> {
  // Get the event log content (this is global, not scoped to a specific TouchSpin)
  const eventLogContent = await page.locator('#events_log').textContent();
  
  // Count the number of 'change' events
  return (eventLogContent?.match(/change\[/g) ?? []).length;
}

async function countChangeWithValue(page: Page, expectedValue: string): Promise<number> {
  const expectedText = '#input_callbacks: change[' + expectedValue + ']';
  return await page.evaluate((text) => {
    return Array.from(document.querySelectorAll('#events_log'))
      .filter(element => element.textContent!.includes(text)).length;
  }, expectedText);
}

async function getElementIdFromTestId(page: Page, testid: string): Promise<string> {
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
  // Directly access input using its testid
  const input = page.getByTestId(inputTestId);
  await input.focus();
  // Has to be triple click to select all text when using decorators
  await input.click({ clickCount: 3 });
  await input.fill(value);
}

async function focusUpButton(page: Page, inputTestId: string): Promise<void> {
  // Focus the up button within the specific TouchSpin widget
  const wrapper = page.getByTestId(inputTestId + '-wrapper');
  const upButton = wrapper.locator('.bootstrap-touchspin-up');
  await upButton.focus();
}

async function focusDownButton(page: Page, inputTestId: string): Promise<void> {
  // Focus the down button within the specific TouchSpin widget
  const wrapper = page.getByTestId(inputTestId + '-wrapper');
  const downButton = wrapper.locator('.bootstrap-touchspin-down');
  await downButton.focus();
}

async function focusOutside(page: Page, outsideTestId: string): Promise<void> {
  // Focus an element completely outside the TouchSpin widget
  const outsideElement = page.getByTestId(outsideTestId);
  await outsideElement.focus();
}

// Coverage collection functionality
async function startCoverage(page: Page): Promise<void> {
  await page.coverage.startJSCoverage({
    reportAnonymousScripts: true,
    resetOnNavigation: false
  });
}

async function collectCoverage(page: Page, testName: string): Promise<void> {
  const coverage = await page.coverage.stopJSCoverage();
  await saveCoverageData(coverage, testName);
}

async function saveCoverageData(coverage: any[], testName: string): Promise<void> {
  const fs = require('fs');
  const path = require('path');
  const v8toIstanbul = require('v8-to-istanbul');
  
  const coverageDir = 'reports/coverage';
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }
  
  // Filter coverage to include all TouchSpin source files
  const touchspinCoverage = coverage.filter(entry => 
    entry.url && (
      entry.url.includes('jquery.bootstrap-touchspin') ||
      entry.url.includes('touchspin') ||
      entry.url.includes('/src/') ||
      entry.url.includes('/renderers/')
    )
  );
  
  if (touchspinCoverage.length > 0) {
    // Convert V8 coverage to Istanbul format for NYC
    const istanbulCoverage: Record<string, any> = {};
    
    for (const entry of touchspinCoverage) {
      try {
        // Extract file path from URL
        let filePath = '';
        if (entry.url.includes('src/')) {
          const srcIndex = entry.url.indexOf('src/');
          filePath = path.join(process.cwd(), entry.url.substring(srcIndex));
        }
        
        if (filePath && fs.existsSync(filePath)) {
          const converter = v8toIstanbul(filePath);
          await converter.load();
          converter.applyCoverage(entry.functions);
          Object.assign(istanbulCoverage, converter.toIstanbul());
        }
      } catch (error: any) {
        console.warn(`Failed to process coverage for ${entry.url}:`, error.message);
      }
    }
    
    // Save in Istanbul format that NYC expects
    const fileName = `${testName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    fs.writeFileSync(
      path.join(coverageDir, fileName), 
      JSON.stringify(istanbulCoverage, null, 2)
    );
  }
}

// NOTE: waitForTouchSpinReady is no longer needed!
// TouchSpin now automatically creates wrapper testids as: {inputTestId}-wrapper
// All helper functions automatically wait for the wrapper to exist.
// For manual wrapper access, use: page.getByTestId(inputTestId + '-wrapper')

export default {
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
  focusUpButton,
  focusDownButton,
  focusOutside,
  getElementIdFromTestId,
  startCoverage,
  collectCoverage,
  TOUCHSPIN_EVENT_WAIT: TOUCHSPIN_EVENT_WAIT
};