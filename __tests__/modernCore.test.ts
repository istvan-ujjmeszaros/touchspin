import { test, expect } from '@playwright/test';

test.describe('Modern Core Unit Tests (TDD)', () => {

  test('Modern core should handle disabled/readonly checks', async ({ page }) => {
    // This test will fail initially and drive us to fix the modern core
    await page.goto('/__tests__/html-package/core-smoke.html');
    
    // Test direct core API (without jQuery wrapper)
    const result = await page.evaluate(() => {
      const input = document.getElementById('core-input');
      input.disabled = true;
      
      // Import and create core instance
      return import('../../packages/core/src/index.js').then(({ createPublicApi }) => {
        const api = createPublicApi(input);
        const beforeValue = api.getValue();
        
        // This should not change the value because input is disabled
        api.upOnce();
        const afterValue = api.getValue();
        
        return { beforeValue, afterValue, shouldBeEqual: beforeValue === afterValue };
      });
    });
    
    // Core should respect disabled state
    expect(result.shouldBeEqual).toBe(true);
  });

  test('Modern core should emit proper events', async ({ page }) => {
    await page.goto('/__tests__/html-package/core-smoke.html');
    
    const events = await page.evaluate(() => {
      const input = document.getElementById('core-input');
      const eventsCollected = [];
      
      return import('../../packages/core/src/index.js').then(({ createPublicApi }) => {
        const api = createPublicApi(input, { min: 0, max: 10 });
        
        // Listen to core events
        api.on('max', () => eventsCollected.push('max'));
        api.on('min', () => eventsCollected.push('min'));
        
        // Set to near max and increment to trigger max event
        api.setValue(9);
        api.upOnce(); // Should emit max event when reaching 10
        
        // Set to near min and decrement to trigger min event
        api.setValue(1);
        api.downOnce(); // Should emit min event when reaching 0
        
        return eventsCollected;
      });
    });
    
    // Should have emitted boundary events
    expect(events).toContain('max');
    expect(events).toContain('min');
  });

  test('Modern core should handle step alignment correctly', async ({ page }) => {
    await page.goto('/__tests__/html-package/core-smoke.html');
    
    const result = await page.evaluate(() => {
      const input = document.getElementById('core-input');
      
      return import('../../packages/core/src/index.js').then(({ createPublicApi }) => {
        const api = createPublicApi(input, { 
          step: 5, 
          min: 0, 
          max: 100,
          forcestepdivisibility: 'round'
        });
        
        // Set an off-step value
        api.setValue(7); // Should be aligned to nearest step (5 or 10)
        const alignedValue = api.getValue();
        
        // Increment should work with proper step
        api.upOnce();
        const afterUp = api.getValue();
        
        return { alignedValue, afterUp, stepDifference: afterUp - alignedValue };
      });
    });
    
    // Value should be aligned to step boundary
    expect(result.alignedValue % 5).toBe(0);
    
    // Step should be exactly 5
    expect(result.stepDifference).toBe(5);
  });
});