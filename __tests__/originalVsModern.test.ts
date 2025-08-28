import { test, expect } from '@playwright/test';
import { createDualTestHelpers } from './helpers/dualTestHelpers';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Original vs Modern Implementation Comparison', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'originalVsModern');
  });

  test('Basic increment/decrement should behave identically', async ({ page }) => {
    const helpers = createDualTestHelpers(page);
    
    // Test original implementation
    await helpers.loadFixture('original');
    const originalResults = await helpers.testBasicIncrementDecrement('touchspin-default');
    
    // Test modern implementation  
    await helpers.loadFixture('modern');
    const modernResults = await helpers.testBasicIncrementDecrement('touchspin-default');
    
    // Results should be identical
    expect(modernResults.initial).toBe(originalResults.initial);
    expect(modernResults.afterIncrement).toBe(originalResults.afterIncrement);
    expect(modernResults.afterDecrement).toBe(originalResults.afterDecrement);
  });

  test('Programmatic API should behave identically', async ({ page }) => {
    const helpers = createDualTestHelpers(page);
    
    // Test original implementation
    await helpers.loadFixture('original');
    const originalResults = await helpers.testProgrammaticAPI('touchspin-default');
    
    // Test modern implementation
    await helpers.loadFixture('modern');
    const modernResults = await helpers.testProgrammaticAPI('touchspin-default');
    
    // API results should be identical
    expect(modernResults.getValue).toBe(originalResults.getValue);
    expect(modernResults.valueAfterSet).toBe(originalResults.valueAfterSet);
    expect(modernResults.valueAfterUpOnce).toBe(originalResults.valueAfterUpOnce);
  });

  test('Boundary behavior should be identical', async ({ page }) => {
    const helpers = createDualTestHelpers(page);
    
    // Test original implementation
    await helpers.loadFixture('original');
    const originalResults = await helpers.testBoundaryBehavior('touchspin-default', 0, 100);
    
    // Test modern implementation
    await helpers.loadFixture('modern');
    const modernResults = await helpers.testBoundaryBehavior('touchspin-default', 0, 100);
    
    // Boundary behavior should be identical
    expect(modernResults.nearMax).toBe(originalResults.nearMax);
    expect(modernResults.atMax).toBe(originalResults.atMax);
    expect(modernResults.beyondMax).toBe(originalResults.beyondMax);
    expect(modernResults.nearMin).toBe(originalResults.nearMin);
    expect(modernResults.atMin).toBe(originalResults.atMin);
    expect(modernResults.beyondMin).toBe(originalResults.beyondMin);
  });

  test('Disabled input should behave identically', async ({ page }) => {
    const helpers = createDualTestHelpers(page);
    
    // Test original implementation
    await helpers.loadFixture('original');
    const originalResults = await helpers.testDisabledReadonly('touchspin-disabled');
    
    // Test modern implementation
    await helpers.loadFixture('modern');
    const modernResults = await helpers.testDisabledReadonly('touchspin-disabled');
    
    // Disabled behavior should be identical
    expect(modernResults.initial).toBe(originalResults.initial);
    expect(modernResults.afterUpClick).toBe(originalResults.afterUpClick);
    expect(modernResults.afterDownClick).toBe(originalResults.afterDownClick);
    
    // Values should not have changed
    expect(modernResults.afterUpClick).toBe(modernResults.initial);
    expect(modernResults.afterDownClick).toBe(modernResults.initial);
  });

  test('Readonly input should behave identically', async ({ page }) => {
    const helpers = createDualTestHelpers(page);
    
    // Test original implementation
    await helpers.loadFixture('original');
    const originalResults = await helpers.testDisabledReadonly('touchspin-readonly');
    
    // Test modern implementation
    await helpers.loadFixture('modern');
    const modernResults = await helpers.testDisabledReadonly('touchspin-readonly');
    
    // Readonly behavior should be identical
    expect(modernResults.initial).toBe(originalResults.initial);
    expect(modernResults.afterUpClick).toBe(originalResults.afterUpClick);
    expect(modernResults.afterDownClick).toBe(originalResults.afterDownClick);
    
    // Values should not have changed
    expect(modernResults.afterUpClick).toBe(modernResults.initial);
    expect(modernResults.afterDownClick).toBe(modernResults.initial);
  });

  // This test will likely fail initially - that's the point!
  test('Event emission patterns should be similar', async ({ page }) => {
    const helpers = createDualTestHelpers(page);
    
    // Test original implementation
    await helpers.loadFixture('original');
    const originalEvents = await helpers.testEventEmission('touchspin-default');
    
    // Test modern implementation
    await helpers.loadFixture('modern');
    const modernEvents = await helpers.testEventEmission('touchspin-default');
    
    // Event patterns should be similar (not necessarily identical due to jQuery vs native events)
    // This test helps us understand the differences
    console.log('Original events:', originalEvents);
    console.log('Modern events:', modernEvents);
    
    // At minimum, we should have some events
    expect(originalEvents.length).toBeGreaterThan(0);
    expect(modernEvents.length).toBeGreaterThan(0);
    
    // Both should have change events
    const originalHasChange = originalEvents.some(event => event.includes('change'));
    const modernHasChange = modernEvents.some(event => event.includes('change'));
    expect(originalHasChange).toBe(true);
    expect(modernHasChange).toBe(true);
  });

  test('Callback formatting should work identically', async ({ page }) => {
    const helpers = createDualTestHelpers(page);
    
    // Test original implementation
    await helpers.loadFixture('original');
    let originalValue = await touchspinHelpers.readInputValue(page, 'touchspin-callbacks');
    await touchspinHelpers.touchspinClickUp(page, 'touchspin-callbacks');
    const originalAfterUp = await touchspinHelpers.readInputValue(page, 'touchspin-callbacks');
    
    // Test modern implementation
    await helpers.loadFixture('modern');
    let modernValue = await touchspinHelpers.readInputValue(page, 'touchspin-callbacks');
    await touchspinHelpers.touchspinClickUp(page, 'touchspin-callbacks');
    const modernAfterUp = await touchspinHelpers.readInputValue(page, 'touchspin-callbacks');
    
    // Initial formatted values should be identical
    expect(modernValue).toBe(originalValue);
    
    // Values after increment should be identical
    expect(modernAfterUp).toBe(originalAfterUp);
    
    // Both should be properly formatted (contain $ and commas)
    expect(originalAfterUp).toContain('$');
    expect(modernAfterUp).toContain('$');
  });
});

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
        
        // Set to max and try to go further
        api.setValue(10);
        api.upOnce(); // Should emit max event
        
        // Set to min and try to go further  
        api.setValue(0);
        api.downOnce(); // Should emit min event
        
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