import {Page} from 'puppeteer';

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
  // Try multiple selectors for different Bootstrap versions and configurations
  const selectors = [
    // Bootstrap 3/4 with input-group-btn
    input_selector + ' + .input-group-btn > .bootstrap-touchspin-up',
    // Bootstrap 4 with input-group-append
    input_selector + ' + .input-group-append > .bootstrap-touchspin-up',
    // Bootstrap 5 direct structure
    input_selector + ' + .bootstrap-touchspin-up',
    // Generic fallback within same input-group
    '.input-group .bootstrap-touchspin-up',
    // Vertical buttons
    '.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-up',
    // Last resort - any up button
    '.bootstrap-touchspin-up',
  ];

  let buttonFound = false;
  for (const selector of selectors) {
    const button = await page.$(selector);
    if (button) {
      // Check if button is visible and enabled before clicking
      const isClickable = await button.evaluate((el) => {
        const button = el as HTMLButtonElement;
        return !button.disabled && 
               !button.hasAttribute('disabled') &&
               button.offsetParent !== null; // Check if visible
      });

      if (isClickable) {
        await page.evaluate((sel) => {
          const btn = document.querySelector(sel);
          if (btn) {
            btn.dispatchEvent(new Event('mousedown'));
          }
        }, selector);

        // Delay to allow the value to change.
        await new Promise(r => setTimeout(r, 200));

        await page.evaluate((sel) => {
          const btn = document.querySelector(sel);
          if (btn) {
            btn.dispatchEvent(new Event('mouseup'));
          }
        }, selector);

        buttonFound = true;
        break;
      }
    }
  }

  if (!buttonFound) {
    throw new Error(`TouchSpin up button not found or not clickable for selector: ${input_selector}`);
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

async function touchspinClickDown(page: Page, input_selector: string): Promise<void> {
  // Try multiple selectors for different Bootstrap versions and configurations
  const selectors = [
    // Bootstrap 3/4 with input-group-btn
    input_selector + ' + .input-group-btn > .bootstrap-touchspin-down',
    // Bootstrap 3 structure (down button before input)
    input_selector + ' ~ .input-group-btn > .bootstrap-touchspin-down',
    // Bootstrap 4 with input-group-prepend (down button)
    input_selector + ' ~ .input-group-prepend > .bootstrap-touchspin-down',
    // Bootstrap 5 direct structure
    input_selector + ' ~ .bootstrap-touchspin-down',
    // Generic fallback within same input-group
    '.input-group .bootstrap-touchspin-down',
    // Vertical buttons
    '.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-down',
    // Last resort - any down button
    '.bootstrap-touchspin-down',
  ];

  let buttonFound = false;
  for (const selector of selectors) {
    const button = await page.$(selector);
    if (button) {
      // Check if button is visible and enabled before clicking
      const isClickable = await button.evaluate((el) => {
        const button = el as HTMLButtonElement;
        return !button.disabled && 
               !button.hasAttribute('disabled') &&
               button.offsetParent !== null; // Check if visible
      });

      if (isClickable) {
        await page.evaluate((sel) => {
          const btn = document.querySelector(sel);
          if (btn) {
            btn.dispatchEvent(new Event('mousedown'));
          }
        }, selector);

        // Delay to allow the value to change.
        await new Promise(r => setTimeout(r, 200));

        await page.evaluate((sel) => {
          const btn = document.querySelector(sel);
          if (btn) {
            btn.dispatchEvent(new Event('mouseup'));
          }
        }, selector);

        buttonFound = true;
        break;
      }
    }
  }

  if (!buttonFound) {
    throw new Error(`TouchSpin down button not found or not clickable for selector: ${input_selector}`);
  }
}

export default { waitForTimeout, cleanupTimeouts, readInputValue, setInputAttr, checkTouchspinUpIsDisabled, touchspinClickUp, touchspinClickDown, changeEventCounter, countEvent, countChangeWithValue, fillWithValue };
