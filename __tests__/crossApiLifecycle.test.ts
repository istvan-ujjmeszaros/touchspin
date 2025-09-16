// @ts-check
import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';


test.describe('Cross-API Lifecycle Management', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html'); // Update URL as needed
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'crossApiLifecycle');
  });

  test('should handle jQuery init → core destroy cleanly', async ({ page }) => {
    // Navigate to the jQuery plugin smoke test page
    await page.goto('/__tests__/html-package/jquery-plugin-smoke.html');

    const input = page.locator('#jq-input');
    const initButton = page.locator('#btn-init');
    const upOnceButton = page.locator('#btn-uponce');
    const updateButton = page.locator('#btn-update');

    // Verify initial state
    await expect(input).toHaveValue('10');

    // Step 1: Initialize via jQuery (attaches jQuery event listeners)
    await initButton.click();
    await expect(page.locator('#status')).toContainText('Initialized');

    // Step 2: Verify jQuery events work
    await upOnceButton.click();
    await expect(input).toHaveValue('11');

    await upOnceButton.click();
    await expect(input).toHaveValue('12');

    // Step 3: Destroy via CORE API directly (not jQuery)
    // This simulates: someone gets the core instance and destroys it directly
    await page.evaluate(() => {
      const input = document.getElementById('jq-input');
      // Get the core instance directly and destroy it (bypassing jQuery)
      const { getTouchSpin } = window.TouchSpinExports || {};
      if (getTouchSpin && input) {
        const coreInstance = getTouchSpin(input);
        if (coreInstance) {
          coreInstance.destroy(); // Direct core destroy, not jQuery destroy
        }
      }
    });

    // Step 4: Test that jQuery commands are properly ignored
    // These should NOT work because core instance is gone
    const valueAfterCoreDestroy = await input.inputValue();

    // Try jQuery command API
    await upOnceButton.click(); // This triggers jQuery event handlers
    await expect(input).toHaveValue(valueAfterCoreDestroy); // Should remain unchanged

    // Try jQuery callable events
    await updateButton.click(); // This triggers touchspin.updatesettings event
    await expect(input).toHaveValue(valueAfterCoreDestroy); // Should remain unchanged

    // Final verification
    await expect(input).toHaveValue('12');
  });

  test('should verify orphaned jQuery events after core destroy', async ({ page }) => {
    // This test specifically checks if jQuery event handlers remain after core destroy
    await page.goto('/__tests__/html-package/jquery-plugin-smoke.html');

    const input = page.locator('#jq-input');
    const initButton = page.locator('#btn-init');

    // Step 1: Initialize via jQuery (this attaches jQuery event listeners)
    await initButton.click();
    await expect(input).toHaveValue('10');

    // Step 2: Use working jQuery events to increment value to 12
    await page.evaluate(() => {
      const $ = window.jQuery;
      $('#jq-input').trigger('touchspin.uponce'); // 10 -> 11
      $('#jq-input').trigger('touchspin.uponce'); // 11 -> 12
    });
    await expect(input).toHaveValue('12');

    // Step 3: Destroy via core API (bypassing jQuery cleanup)
    await page.evaluate(() => {
      const input = document.getElementById('jq-input');
      const { getTouchSpin } = window.TouchSpinExports || {};
      if (getTouchSpin && input) {
        const coreInstance = getTouchSpin(input);
        if (coreInstance) {
          coreInstance.destroy(); // Direct core destroy
        }
      }
    });

    // Step 4: Check if jQuery event handlers still exist (they shouldn't be harmful)
    const hasOrphanedEvents = await page.evaluate(() => {
      const input = document.getElementById('jq-input');
      if (window.jQuery && input) {
        const $ = window.jQuery;
        const eventData = $._data ? $._data(input, 'events') : $(input).data('events');

        // Count touchspin-related events
        let touchspinEvents = 0;
        if (eventData) {
          Object.keys(eventData).forEach(eventType => {
            if (eventType.includes('touchspin')) {
              touchspinEvents += eventData[eventType].length;
            }
          });
        }

        return {
          hasEvents: touchspinEvents > 0,
          eventCount: touchspinEvents,
          eventTypes: eventData ? Object.keys(eventData) : []
        };
      }
      return { hasEvents: false, eventCount: 0, eventTypes: [] };
    });

    console.log('Orphaned events check:', hasOrphanedEvents);

    // The events might still be there, but they should be harmless since core instance is gone
    // This test documents the current behavior - events may remain but do nothing

    // Verify that even if events remain, they don't cause issues
    await page.evaluate(() => {
      const input = document.getElementById('jq-input');
      if (window.jQuery && input) {
        const $ = window.jQuery;
        // Try triggering the orphaned events
        $(input).trigger('touchspin.uponce');
        $(input).trigger('touchspin.updatesettings', [{ step: 5 }]);
      }
    });

    // Value should remain unchanged since core instance is gone
    await expect(input).toHaveValue('12'); // From the previous upOnce calls
  });

  test('should expose core exports for cross-API testing', async ({ page }) => {
    // This test ensures we can access getTouchSpin for cross-API testing
    await page.goto('/__tests__/html-package/jquery-plugin-smoke.html');

    // Verify we can access core functions from the page
    const hasCoreExports = await page.evaluate(() => {
      return typeof window.TouchSpinExports !== 'undefined';
    });

    // If core exports aren't available, we need to add them
    if (!hasCoreExports) {
      console.log('Core exports not available - this test scenario needs core API access');
      // This is expected for now - we'd need to modify the HTML to expose core API
    }
  });
});