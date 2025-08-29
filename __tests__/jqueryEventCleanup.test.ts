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
    
    // Step 1: Check initial state (no events)
    const eventsBeforeInit = await getJQueryEventCount(page, 'jq-input');
    expect(eventsBeforeInit).toBe(0);
    
    // Step 2: Initialize TouchSpin (should attach jQuery events)
    await initButton.click();
    const eventsAfterInit = await getJQueryEventCount(page, 'jq-input');
    expect(eventsAfterInit).toBeGreaterThan(0);
    console.log(`Events after jQuery init: ${eventsAfterInit}`);
    
    // Step 3: Destroy via jQuery (should clean up all events)
    await destroyButton.click();
    const eventsAfterJQueryDestroy = await getJQueryEventCount(page, 'jq-input');
    expect(eventsAfterJQueryDestroy).toBe(0);
    console.log(`Events after jQuery destroy: ${eventsAfterJQueryDestroy}`);
  });

  test('should NOT clean up jQuery events on core destroy (orphaned events)', async ({ page }) => {
    await page.goto('/__tests__/html-package/jquery-plugin-smoke.html');
    
    const input = page.locator('#jq-input');
    const initButton = page.locator('#btn-init');
    
    // Step 1: Initialize TouchSpin via jQuery (attaches events)
    await initButton.click();
    const eventsAfterInit = await getJQueryEventCount(page, 'jq-input');
    expect(eventsAfterInit).toBeGreaterThan(0);
    console.log(`Events after jQuery init: ${eventsAfterInit}`);
    
    // Step 2: Destroy via core API directly (bypassing jQuery cleanup)
    await page.evaluate(() => {
      const input = document.getElementById('jq-input');
      const { getTouchSpin } = window.TouchSpinExports || {};
      if (getTouchSpin && input) {
        const coreInstance = getTouchSpin(input);
        if (coreInstance) {
          coreInstance.destroy(); // Direct core destroy - doesn't clean jQuery events
        }
      }
    });
    
    // Step 3: jQuery events should still be there (orphaned)
    const eventsAfterCoreDestroy = await getJQueryEventCount(page, 'jq-input');
    expect(eventsAfterCoreDestroy).toBe(eventsAfterInit); // Same number as before
    console.log(`Events after core destroy: ${eventsAfterCoreDestroy} (should be same as after init)`);
    
    // Step 4: Verify the orphaned events are harmless (don't affect the input)
    const initialValue = await input.inputValue();
    
    // Try triggering orphaned jQuery events
    await page.evaluate(() => {
      const input = document.getElementById('jq-input');
      if (window.jQuery && input) {
        const $ = window.jQuery;
        $(input).trigger('touchspin.uponce');
        $(input).trigger('touchspin.updatesettings', [{ step: 10 }]);
      }
    });
    
    // Value should remain unchanged because core instance is gone
    const valueAfterOrphanedEvents = await input.inputValue();
    expect(valueAfterOrphanedEvents).toBe(initialValue);
    console.log(`Value unchanged after orphaned events: ${valueAfterOrphanedEvents}`);
  });

  test('should demonstrate the problem and potential solution', async ({ page }) => {
    await page.goto('/__tests__/html-package/jquery-plugin-smoke.html');
    
    const initButton = page.locator('#btn-init');
    
    // Initialize and check event count
    await initButton.click();
    const eventsAfterInit = await getJQueryEventCount(page, 'jq-input');
    
    // Core destroy leaves events orphaned
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
    
    // Document the current behavior
    console.log(`
    CURRENT BEHAVIOR ANALYSIS:
    - Events after jQuery init: ${eventsAfterInit}
    - Events after core destroy: ${eventsAfterCoreDestroy}
    - Problem: ${eventsAfterCoreDestroy > 0 ? 'YES - orphaned events remain' : 'NO - events cleaned up'}
    `);
    
    // This test documents the issue - we have orphaned jQuery events
    expect(eventsAfterCoreDestroy).toBe(eventsAfterInit); // They're the same (problem)
    
    // POTENTIAL SOLUTION: Core destroy should somehow clean up jQuery events too
    // Or jQuery wrapper should listen to core destroy events and clean up
  });
});