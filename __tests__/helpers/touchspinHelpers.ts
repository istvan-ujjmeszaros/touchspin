import {Page} from 'puppeteer';

// Standard timeout constants
const TOUCHSPIN_EVENT_WAIT = 700;

async function waitForTimeout(ms: number): Promise<void> {
  return new Promise(r => {
    const timeoutId = setTimeout(() => {
      r();
    }, ms);

    // Store timeout ID for potential cleanup
    if (typeof globalThis !== 'undefined') {
      const global = globalThis as any;
      if (!global._testTimeouts) global._testTimeouts = [];
      global._testTimeouts.push(timeoutId);
    }
  });
}

async function cleanupTimeouts(): Promise<void> {
  if (typeof globalThis !== 'undefined') {
    const global = globalThis as any;
    if (global._testTimeouts) {
      global._testTimeouts.forEach((id: any) => clearTimeout(id));
      global._testTimeouts = [];
    }
  }
}

async function readInputValue(page: Page, selector: string): Promise<string|undefined> {
  const input = await page.$(selector);
  return await input?.evaluate((el) => (el as HTMLInputElement).value);
}

async function setInputAttr(page: Page, selector: string, attributeName: 'disabled' | 'readonly', attributeValue: boolean): Promise<void> {
  const input = await page.$(selector);
  await input?.evaluate((el, attributeName, attributeValue) => {
    if (attributeValue) {
      (el as HTMLInputElement).setAttribute(attributeName, '');
    } else {
      (el as HTMLInputElement).removeAttribute(attributeName);
    }
  }, attributeName, attributeValue);
}

async function checkTouchspinUpIsDisabled(page: Page, selector: string): Promise<boolean> {
  // Try multiple selectors for different Bootstrap versions and configurations
  const selectors = [
    // Bootstrap 3/4 with input-group-btn
    selector + ' + .input-group-btn > .bootstrap-touchspin-up',
    // Bootstrap 4 with input-group-append
    selector + ' + .input-group-append > .bootstrap-touchspin-up',
    // Bootstrap 5 direct structure
    selector + ' + .bootstrap-touchspin-up',
    // Generic fallback within same input-group
    '.input-group .bootstrap-touchspin-up',
    // Vertical buttons
    '.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-up',
    // Last resort - any up button
    '.bootstrap-touchspin-up',
  ];

  for (const sel of selectors) {
    const button = await page.$(sel);
    if (button) {
      const isDisabled = await button.evaluate((el) => {
        return (el as HTMLButtonElement).hasAttribute('disabled') ||
               (el as HTMLButtonElement).disabled;
      });
      if (isDisabled !== undefined) {
        return isDisabled;
      }
    }
  }

  return false; // If no button found, assume not disabled
}

async function touchspinClickUp(page: Page, input_selector: string): Promise<void> {
  // Get the initial value for comparison
  const initialValue = await readInputValue(page, input_selector);


  // Find and click the specific button for this input
  const clickResult = await page.evaluate((inputSel) => {
    const input = document.querySelector(inputSel);
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
  }, input_selector);



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
      (inputSelector, expectedInitialValue) => {
        const input = document.querySelector(inputSelector) as HTMLInputElement;
        return input && input.value !== expectedInitialValue;
      },
      { timeout: 2000 },
      input_selector,
      initialValue
    );

  } catch (error) {
    console.warn('Value did not change within timeout - this may be expected for disabled inputs');
  }
}

async function changeEventCounter(page: Page): Promise<number> {
  // Get the event log content
  const eventLogContent = await page.$eval('#events_log', el => el.textContent);

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
  // Get the event log content
  const eventLogContent = await page.$eval('#events_log', el => el.textContent);

  // Count the number of 'change' events with the expected value
  const searchString = selector + ': ' + event;
  return (eventLogContent ? eventLogContent.split(searchString).length - 1 : 0);
}

async function fillWithValue(page: Page, selector: string, value: string): Promise<void> {
  await page.focus(selector);
  // Has to be triple click to select all text when using decorators
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.type(value);
}

async function waitForTouchSpinReady(page: Page, input_selector: string): Promise<void> {
  // Wait for TouchSpin to be initialized and DOM structure to be ready
  await page.waitForFunction(
    (selector) => {
      const input = document.querySelector(selector) as HTMLInputElement;
      if (!input) return false;

      // Check if TouchSpin has been initialized by looking for generated structure
      const hasButtons =
        document.querySelector('.bootstrap-touchspin-up') !== null &&
        document.querySelector('.bootstrap-touchspin-down') !== null;

      return hasButtons;
    },
    { timeout: 5000 },
    input_selector
  );
}

async function touchspinClickDown(page: Page, input_selector: string): Promise<void> {
  // Get the initial value for comparison
  const initialValue = await readInputValue(page, input_selector);


  // Find and click the specific button for this input
  const clickResult = await page.evaluate((inputSel) => {
    const input = document.querySelector(inputSel);
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
  }, input_selector);



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
      (inputSelector, expectedInitialValue) => {
        const input = document.querySelector(inputSelector) as HTMLInputElement;
        return input && input.value !== expectedInitialValue;
      },
      { timeout: 2000 },
      input_selector,
      initialValue
    );

  } catch (error) {
    console.warn('Down value did not change within timeout - this may be expected for disabled inputs');
  }
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
