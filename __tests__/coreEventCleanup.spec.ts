// @ts-check
import { test, expect } from '@playwright/test';
import './coverage.hooks';
import touchspinHelpers from './helpers/touchspinHelpers';


test.describe('Core DOM Event Cleanup', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html'); // Update URL as needed
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'coreEventCleanup');
  });


  // Why monkey-patching is needed:
  // 1. Chrome's getEventListeners() only works in DevTools Console context, not in page.evaluate()
  // 2. No standard JavaScript API exists to count native DOM event listeners on elements
  // 3. Monkey-patching intercepts addEventListener/removeEventListener calls to count them
  // 4. This provides reliable cross-browser event counting without browser-specific APIs

  const setupEventTracking = async (page) => {
    return await page.evaluate(() => {
      const eventTracker = { netCount: 0 };

      const input = document.getElementById('core-input');
      const doc = document;

      const originalAddEventListener = {
        input: input.addEventListener.bind(input),
        document: doc.addEventListener.bind(doc)
      };

      const originalRemoveEventListener = {
        input: input.removeEventListener.bind(input),
        document: doc.removeEventListener.bind(doc)
      };

      input.addEventListener = function(type, listener, options) {
        eventTracker.netCount++;
        return originalAddEventListener.input(type, listener, options);
      };

      input.removeEventListener = function(type, listener, options) {
        eventTracker.netCount--;
        return originalRemoveEventListener.input(type, listener, options);
      };

      doc.addEventListener = function(type, listener, options) {
        eventTracker.netCount++;
        return originalAddEventListener.document(type, listener, options);
      };

      doc.removeEventListener = function(type, listener, options) {
        eventTracker.netCount--;
        return originalRemoveEventListener.document(type, listener, options);
      };

      window.eventTracker = eventTracker;

      return eventTracker;
    });
  };

  const getEventCount = async (page) => {
    return await page.evaluate(() => {
      return window.eventTracker.netCount;
    });
  };

  test('should clean up DOM events on destroy', async ({ page }) => {
    await page.goto('/__tests__/html-package/core-events-simple.html');

    await setupEventTracking(page);

    const beforeInit = await getEventCount(page);

    await page.evaluate(() => {
      const input = document.getElementById('core-input');
      const { TouchSpin } = window.TouchSpinExports;
      TouchSpin(input, { min: 0, max: 100, step: 1 });
    });

    const afterInit = await getEventCount(page);

    // Verify plugin is functional
    const input = page.locator('#core-input');
    const initialValue = await input.inputValue();
    await page.evaluate(() => {
      const input = document.getElementById('core-input');
      const { getTouchSpin } = window.TouchSpinExports;
      getTouchSpin(input)?.upOnce();
    });
    const newValue = await input.inputValue();
    expect(Number(newValue)).toBe(Number(initialValue) + 1);

    await page.evaluate(() => {
      const input = document.getElementById('core-input');
      const { getTouchSpin } = window.TouchSpinExports;
      getTouchSpin(input)?.destroy();
    });

    const afterDestroy = await getEventCount(page);

    expect(beforeInit).toBe(0);
    expect(afterInit).toBe(8);
    expect(afterDestroy).toBe(0);
  });
});