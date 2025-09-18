import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinApiHelpers';
import './coverage.hooks';

/**
 * This test investigates what the ACTUAL current behavior is
 * and whether ChatGPT's proposed changes are solving a real problem
 */
test.describe('Real Behavior Investigation', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'investigate-real-behavior');
  });

  test('Is there actually a document listener problem?', async ({ page }) => {
    const testid = 'touchspin-default';

    // Step 1: Check what happens with outside clicks
    await touchspinHelpers.fillWithValue(page, testid, '3');
    await page.click('body', { position: { x: 100, y: 100 } }); // Click far from widget
    const valueAfterBodyClick = await touchspinHelpers.readInputValue(page, testid);

    console.log('After body click:', valueAfterBodyClick);

    // Step 2: Check if there's unwanted sanitization happening
    await touchspinHelpers.fillWithValue(page, testid, '7'); // Should be sanitized to 5 or 10 if step=5
    await page.click('.container'); // Click on container div
    const valueAfterContainerClick = await touchspinHelpers.readInputValue(page, testid);

    console.log('After container click:', valueAfterContainerClick);

    // Step 3: Let's see what actually triggers _checkValue
    const checkValueTriggers = await page.evaluate(() => {
      // Monkey patch _checkValue to see when it's called
      const $ = (window as any).jQuery;
      const checkValueCallCount = 0;

      // Find a TouchSpin instance and patch its _checkValue
      const touchspinInput = $('[data-testid="touchspin-default"]');
      if (touchspinInput.length > 0) {
        // This is tricky - _checkValue is in closure, we can't directly patch it
        // Instead, let's monitor events that should trigger it

        // Monitor blur events
        touchspinInput.on('blur.test', () => {
          console.log('BLUR triggered on TouchSpin input');
        });

        // Monitor any existing document events
        $(document).on('mousedown.test touchstart.test', (e: any) => {
          console.log('Document event triggered:', e.type, 'target:', e.target.tagName);
        });
      }

      return { setup: 'complete' };
    });

    // Step 4: Trigger various events and see what happens
    await page.click('body');
    await page.click('.container');
    await page.keyboard.press('Tab'); // This should trigger blur

    const finalValue = await touchspinHelpers.readInputValue(page, testid);
    console.log('Final value after all interactions:', finalValue);

    // Document our findings
    expect(typeof finalValue).toBe('string');
  });

  test('What about the change event behavior?', async ({ page }) => {
    const testid = 'touchspin-default';

    const changeEventAnalysis = await page.evaluate((testid) => {
      const $ = (window as any).jQuery;
      const input = $(`[data-testid="${testid}"]`);
      const changeEvents: string[] = [];

      input.on('change.analysis', (e: any) => {
        const value = $(e.target).val();
        changeEvents.push(`Change: ${value} (triggered by: ${e.originalEvent?.type || 'unknown'})`);
      });

      return { setup: 'complete', initialChangeEvents: changeEvents };
    }, testid);

    // Type a value manually
    await touchspinHelpers.fillWithValue(page, testid, '15');

    // Click a button
    await touchspinHelpers.clickUpButton(page, testid);

    // Get final change event analysis
    const finalAnalysis = await page.evaluate(() => {
      const changeEvents = (window as any).changeEvents || [];
      return { changeEvents };
    });

    console.log('Change event analysis:', finalAnalysis);

    expect(changeEventAnalysis.setup).toBe('complete');
  });

  test('Memory leak investigation: are there actually leaked listeners?', async ({ page }) => {
    // Create and destroy multiple TouchSpin instances
    const memoryTest = await page.evaluate(() => {
      const $ = (window as any).jQuery;
      let instanceCount = 0;

      for (let i = 0; i < 5; i++) {
        const input = $(`<input id="temp-${i}" value="50">`).appendTo(document.body);
        (input as any).TouchSpin({ step: 1 });
        instanceCount++;

        // Immediately destroy
        (input as any).trigger('touchspin.destroy');
        input.remove();
      }

      // Check what's left on document
      const docEvents = $._data(document, 'events');
      const touchspinRelatedEvents = [];

      if (docEvents) {
        for (const [eventType, handlers] of Object.entries(docEvents)) {
          const touchspinHandlers = (handlers as any[]).filter(h =>
            h.namespace && h.namespace.includes('touchspin')
          );
          if (touchspinHandlers.length > 0) {
            touchspinRelatedEvents.push({
              type: eventType,
              count: touchspinHandlers.length,
              namespaces: touchspinHandlers.map(h => h.namespace)
            });
          }
        }
      }

      return {
        instancesCreated: instanceCount,
        remainingTouchspinEvents: touchspinRelatedEvents
      };
    });

    console.log('Memory leak test results:', memoryTest);

    // If there are remaining touchspin events after destroy, that's a real problem
    expect(memoryTest.remainingTouchspinEvents.length).toBe(0);
  });
});
