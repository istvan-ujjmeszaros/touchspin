// @ts-check
import { test, expect } from '@playwright/test';

test.describe('jQuery Event Cleanup', () => {
  
  // Helper function to count jQuery events on an element
  const getJQueryEventCount = async (page, elementId) => {
    return await page.evaluate((id) => {
      const input = document.getElementById(id);
      if (!window.jQuery || !input) return 0;
      
      const $ = window.jQuery;
      // Different jQuery versions store events differently
      const eventData = $._data ? $._data(input, 'events') : $(input).data('events');
      
      if (!eventData) return 0;
      
      // Count all events (including touchspin.* events)
      let totalEvents = 0;
      Object.keys(eventData).forEach(eventType => {
        if (Array.isArray(eventData[eventType])) {
          totalEvents += eventData[eventType].length;
        }
      });
      
      return totalEvents;
    }, elementId);
  };

  test('should clean up all jQuery events on jQuery destroy', async ({ page }) => {
    await page.goto('/__tests__/html-package/jquery-plugin-smoke.html');
    
    const input = page.locator('#jq-input');
    const initButton = page.locator('#btn-init');
    const destroyButton = page.locator('#btn-destroy');
    
    // Step 1: Check initial state (may have some events from page setup)
    const eventsBeforeInit = await getJQueryEventCount(page, 'jq-input');
    console.log(`Events before init: ${eventsBeforeInit}`);
    
    // Step 2: Initialize TouchSpin (should attach more jQuery events)
    await initButton.click();
    const eventsAfterInit = await getJQueryEventCount(page, 'jq-input');
    expect(eventsAfterInit).toBeGreaterThan(eventsBeforeInit);
    console.log(`Events after jQuery init: ${eventsAfterInit}`);
    
    // Step 3: Destroy via jQuery (should clean up TouchSpin events)
    await destroyButton.click();
    const eventsAfterJQueryDestroy = await getJQueryEventCount(page, 'jq-input');
    expect(eventsAfterJQueryDestroy).toBe(eventsBeforeInit); // Back to baseline
    console.log(`Events after jQuery destroy: ${eventsAfterJQueryDestroy}`);
  });

  test('should clean up jQuery events on core destroy (via teardown callback)', async ({ page }) => {
    await page.goto('/__tests__/html-package/jquery-plugin-smoke.html');
    
    const input = page.locator('#jq-input');
    const initButton = page.locator('#btn-init');
    
    // Step 1: Check baseline
    const eventsBeforeInit = await getJQueryEventCount(page, 'jq-input');
    console.log(`Events before init: ${eventsBeforeInit}`);
    
    // Step 2: Initialize TouchSpin via jQuery (attaches events)
    await initButton.click();
    const eventsAfterInit = await getJQueryEventCount(page, 'jq-input');
    expect(eventsAfterInit).toBeGreaterThan(eventsBeforeInit);
    console.log(`Events after jQuery init: ${eventsAfterInit}`);
    
    // Step 3: Destroy via core API directly (should now call teardown callback)
    await page.evaluate(() => {
      const input = document.getElementById('jq-input');
      const { getTouchSpin } = window.TouchSpinExports || {};
      if (getTouchSpin && input) {
        const coreInstance = getTouchSpin(input);
        if (coreInstance) {
          coreInstance.destroy(); // Core destroy should call jQuery teardown callback
        }
      }
    });
    
    // Step 4: jQuery events should now be cleaned up (back to baseline)
    const eventsAfterCoreDestroy = await getJQueryEventCount(page, 'jq-input');
    expect(eventsAfterCoreDestroy).toBe(eventsBeforeInit); // Back to baseline!
    console.log(`Events after core destroy: ${eventsAfterCoreDestroy} (should be same as before init)`);
    
    // Step 5: Verify no orphaned events remain
    const initialValue = await input.inputValue();
    
    // Try triggering events (should do nothing since they're cleaned up)
    await page.evaluate(() => {
      const input = document.getElementById('jq-input');
      if (window.jQuery && input) {
        const $ = window.jQuery;
        $(input).trigger('touchspin.uponce');
        $(input).trigger('touchspin.updatesettings', [{ step: 10 }]);
      }
    });
    
    // Value should remain unchanged
    const valueAfterEvents = await input.inputValue();
    expect(valueAfterEvents).toBe(initialValue);
    console.log(`Value unchanged after events: ${valueAfterEvents}`);
  });

  test('should demonstrate registerTeardown solution works', async ({ page }) => {
    await page.goto('/__tests__/html-package/jquery-plugin-smoke.html');
    
    const initButton = page.locator('#btn-init');
    
    // Check baseline
    const eventsBeforeInit = await getJQueryEventCount(page, 'jq-input');
    
    // Initialize and check event count
    await initButton.click();
    const eventsAfterInit = await getJQueryEventCount(page, 'jq-input');
    
    // Core destroy should now call teardown callbacks
    await page.evaluate(() => {
      const input = document.getElementById('jq-input');
      const { getTouchSpin } = window.TouchSpinExports || {};
      if (getTouchSpin && input) {
        const coreInstance = getTouchSpin(input);
        if (coreInstance) {
          coreInstance.destroy();
        }
      }
    });
    
    const eventsAfterCoreDestroy = await getJQueryEventCount(page, 'jq-input');
    
    // Document the SOLUTION behavior
    console.log(`
    REGISTERteardown SOLUTION ANALYSIS:
    - Events before init: ${eventsBeforeInit}
    - Events after jQuery init: ${eventsAfterInit}
    - Events after core destroy: ${eventsAfterCoreDestroy}
    - Problem solved: ${eventsAfterCoreDestroy === eventsBeforeInit ? 'YES - events properly cleaned up' : 'NO - still have orphaned events'}
    `);
    
    // The solution should work - events cleaned up properly
    expect(eventsAfterCoreDestroy).toBe(eventsBeforeInit); // Back to baseline - SOLUTION WORKS!
  });
});