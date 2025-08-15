import { Page, Locator } from '@playwright/test';

// Standard timeout constants
const TOUCHSPIN_EVENT_WAIT = 700;

async function waitForTimeout(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function cleanupTimeouts(): Promise<void> {
  // Playwright handles timeouts automatically, so this is mostly for compatibility
  // Can be used for custom cleanup if needed
}

async function readInputValue(page: Page, testid: string): Promise<string | null> {
  const touchspinContainer = page.getByTestId(testid);
  const input = touchspinContainer.locator('input');
  return await input.inputValue();
}

async function setInputAttr(page: Page, testid: string, attributeName: 'disabled' | 'readonly', attributeValue: boolean): Promise<void> {
  const touchspinContainer = page.getByTestId(testid);
  const input = touchspinContainer.locator('input');
  if (attributeValue) {
    await input.evaluate((el, attr) => el.setAttribute(attr, ''), attributeName);
  } else {
    await input.evaluate((el, attr) => el.removeAttribute(attr), attributeName);
  }
}

async function checkTouchspinUpIsDisabled(page: Page, testid: string): Promise<boolean> {
  const touchspinContainer = page.getByTestId(testid);
  
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

async function touchspinClickUp(page: Page, testid: string): Promise<void> {
  // Get the initial value for comparison
  const initialValue = await readInputValue(page, testid);
  const touchspinContainer = page.getByTestId(testid);

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
      (testid, expectedInitialValue) => {
        const container = document.querySelector(`[data-testid="${testid}"]`);
        if (!container) return false;
        const input = container.querySelector('input') as HTMLInputElement;
        return input && input.value !== expectedInitialValue;
      },
      testid,
      initialValue,
      { timeout: 2000 }
    );
  } catch (error) {
    console.warn('Value did not change within timeout - this may be expected for disabled inputs');
  }
}

async function touchspinClickDown(page: Page, testid: string): Promise<void> {
  // Get the initial value for comparison
  const initialValue = await readInputValue(page, testid);
  const touchspinContainer = page.getByTestId(testid);

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
      (testid, expectedInitialValue) => {
        const container = document.querySelector(`[data-testid="${testid}"]`);
        if (!container) return false;
        const input = container.querySelector('input') as HTMLInputElement;
        return input && input.value !== expectedInitialValue;
      },
      testid,
      initialValue,
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

async function countEvent(page: Page, selector: string, event: string): Promise<number> {
  // Get the event log content (this is global, not scoped to a specific TouchSpin)
  const eventLogContent = await page.locator('#events_log').textContent();

  // Count the number of events with the expected value
  const searchString = selector + ': ' + event;
  return (eventLogContent ? eventLogContent.split(searchString).length - 1 : 0);
}

async function fillWithValue(page: Page, testid: string, value: string): Promise<void> {
  const touchspinContainer = page.getByTestId(testid);
  const input = touchspinContainer.locator('input');
  await input.focus();
  // Has to be triple click to select all text when using decorators
  await input.click({ clickCount: 3 });
  await input.fill(value);
}

async function waitForTouchSpinReady(page: Page, testid: string): Promise<void> {
  // Wait for TouchSpin to be initialized and DOM structure to be ready
  await page.waitForFunction(
    (testid) => {
      // First try to find by data-testid (wrapper approach)
      let container = document.querySelector(`[data-testid="${testid}"]`);
      let input: HTMLInputElement | null = null;
      
      if (container) {
        // Found wrapper with data-testid, look for input within it
        input = container.querySelector('input') as HTMLInputElement;
      } else {
        // Try to find by input ID (fallback approach)
        input = document.querySelector(`#${testid}`) as HTMLInputElement;
        if (input) {
          // Find the closest TouchSpin container that contains both input and buttons
          container = input.closest('.input-group') ||
                     input.closest('.bootstrap-touchspin') ||
                     input.closest('[data-testid]') ||
                     input.parentElement;
        }
      }
      
      if (!container || !input) return false;

      // Check if TouchSpin has been initialized by looking for generated structure within this container
      const hasButtons =
        container.querySelector('.bootstrap-touchspin-up') !== null &&
        container.querySelector('.bootstrap-touchspin-down') !== null;

      return hasButtons;
    },
    testid,
    { timeout: 5000 }
  );
}

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
  waitForTouchSpinReady,
  TOUCHSPIN_EVENT_WAIT: TOUCHSPIN_EVENT_WAIT
};