/**
 * Browser Native Spinner Controls Tests
 * 
 * These tests verify how TouchSpin interacts with browser's native number input
 * spinner controls. Tests use a dedicated HTML page with multiple scenarios:
 * 
 * 1. Number input WITH native min/max/step attributes vs TouchSpin settings
 * 2. Number input WITHOUT native attributes (TouchSpin-only settings)
 * 3. Text input control group (no native spinners)
 * 4. Decimal values with conflicting native attributes
 * 5. Disabled state behavior
 * 6. Large step values
 * 7. TouchSpin booster vs native spinners
 */

import touchspinHelpers from './helpers/touchspinHelpers';
import {page, port} from './helpers/jestPuppeteerServerSetup';

const TEST_TIMEOUT = 50000;

describe('Browser Native Spinner Controls', () => {
  beforeEach(async () => {
    // Navigate to dedicated native spinner test page
    await page.goto(`http://localhost:${port}/__tests__/html/native-spinner-test.html`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });
    
    // Wait for TouchSpin to initialize all controls
    await touchspinHelpers.waitForTimeout(1000);
  });

  describe('Native Attributes Only', () => {
    it('should respect native min/max when no TouchSpin min/max provided', async () => {
      // Test input with only native attributes, no TouchSpin overrides
      // Input has native min="2" max="12", TouchSpin initialized with no min/max
      const inputSelector = '#native-only-attrs';
      
      // Test minimum boundary - try to go below native min=2
      await touchspinHelpers.fillWithValue(page, inputSelector, '5');
      await page.focus(inputSelector);
      
      // Go down multiple steps to hit minimum
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('ArrowDown');
        await touchspinHelpers.waitForTimeout(50);
      }
      
      const minValue = await touchspinHelpers.readInputValue(page, inputSelector);
      
      // Should respect native min="2"
      expect(parseInt(minValue || '0')).toBeGreaterThanOrEqual(2);
      expect(parseInt(minValue || '0')).toBeLessThan(5); // Should have decreased
      
      // Test maximum boundary - try to go above native max=12
      await touchspinHelpers.fillWithValue(page, inputSelector, '10');
      await page.focus(inputSelector);
      
      // Go up multiple steps to hit maximum
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('ArrowUp');
        await touchspinHelpers.waitForTimeout(50);
      }
      
      const maxValue = await touchspinHelpers.readInputValue(page, inputSelector);
      
      // Should respect native max="12"
      expect(parseInt(maxValue || '0')).toBeLessThanOrEqual(12);
      expect(parseInt(maxValue || '0')).toBeGreaterThan(10); // Should have increased
    }, TEST_TIMEOUT);

    it('should use native step when no TouchSpin step provided', async () => {
      // Test input with native step="3", no TouchSpin step override
      const inputSelector = '#native-only-attrs';
      
      await touchspinHelpers.fillWithValue(page, inputSelector, '5');
      await page.focus(inputSelector);
      
      // Test with TouchSpin button - should use native step=3
      await touchspinHelpers.touchspinClickUp(page, inputSelector);
      const buttonResult = await touchspinHelpers.readInputValue(page, inputSelector);
      
      // Should increment by native step=3 (5 + 3 = 8)
      expect(parseInt(buttonResult || '0')).toBe(8);
      
      // Test with keyboard - should also use native step=3
      await touchspinHelpers.fillWithValue(page, inputSelector, '5');
      await page.focus(inputSelector);
      await page.keyboard.press('ArrowUp');
      await touchspinHelpers.waitForTimeout(100);
      
      const keyboardResult = await touchspinHelpers.readInputValue(page, inputSelector);
      
      // Should increment by native step=3 (5 + 3 = 8)
      expect(parseInt(keyboardResult || '0')).toBe(8);
    }, TEST_TIMEOUT);
  });

  describe('Native Attributes vs TouchSpin Settings', () => {
    it('should prioritize TouchSpin min/max over native when both are present', async () => {
      // Test 1: Input has native min="5" max="15", but TouchSpin min=3 max=20
      // Expected: TouchSpin settings should win for browser native spinners
      const inputSelector = '#native-with-attrs';
      
      await page.focus(inputSelector);
      
      // Try to go below TouchSpin minimum (3) using native spinner
      // Start at 8, try to go down 10 steps (should stop at TouchSpin min=3, not native min=5)
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('ArrowDown');
        await touchspinHelpers.waitForTimeout(100);
      }
      
      const finalValue = await touchspinHelpers.readInputValue(page, inputSelector);
      
      // Should respect TouchSpin min=3, not native min="5"
      expect(parseInt(finalValue || '0')).toBeGreaterThanOrEqual(3);
      expect(parseInt(finalValue || '0')).toBeLessThan(8); // Should have decreased from initial value
    }, TEST_TIMEOUT);

    it('should use TouchSpin settings when no native attributes present', async () => {
      // Test 2: Input has NO native attributes, only TouchSpin min=3 max=20
      // Expected: TouchSpin settings should be respected by native spinners
      const inputSelector = '#native-without-attrs';
      
      await page.focus(inputSelector);
      
      // Try to go below TouchSpin minimum (3) using native spinner
      // Start at 8, try to go down 10 steps (should stop at TouchSpin min=3)
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('ArrowDown');
        await touchspinHelpers.waitForTimeout(100);
      }
      
      const finalValue = await touchspinHelpers.readInputValue(page, inputSelector);
      
      // TouchSpin settings should be respected by native spinners
      const numericValue = parseInt(finalValue || '0');
      expect(numericValue).toBeGreaterThanOrEqual(3);
      expect(numericValue).toBeLessThan(8); // Should have decreased from initial value
    }, TEST_TIMEOUT);

    it('should respect TouchSpin max over native max', async () => {
      // Test TouchSpin max=20 vs native max="15"
      const inputSelector = '#native-with-attrs';
      
      // Reset to a value closer to TouchSpin max
      await touchspinHelpers.fillWithValue(page, inputSelector, '18');
      await touchspinHelpers.waitForTimeout(200);
      await page.focus(inputSelector);
      
      // Try to go above TouchSpin maximum (20) using native spinner
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('ArrowUp');
        await touchspinHelpers.waitForTimeout(100);
      }
      
      const finalValue = await touchspinHelpers.readInputValue(page, inputSelector);
      
      // Should respect TouchSpin max=20, not native max="15"
      expect(parseInt(finalValue || '0')).toBeLessThanOrEqual(20);
      expect(parseInt(finalValue || '0')).toBeGreaterThan(18); // Should have increased from initial value
    }, TEST_TIMEOUT);
  });

  describe('Step Value Conflicts', () => {
    it('should use TouchSpin step setting over native step attribute', async () => {
      // Test 6: Input has native step="10", TouchSpin step=5
      // Expected: TouchSpin step should win
      const inputSelector = '#large-step-native';
      
      await page.focus(inputSelector);
      
      // Start at 20, press ArrowUp once
      await page.keyboard.press('ArrowUp');
      await touchspinHelpers.waitForTimeout(100);
      
      const newValue = await touchspinHelpers.readInputValue(page, inputSelector);
      
      // Should increment by TouchSpin step=5 (20 + 5 = 25), not native step=10 (20 + 10 = 30)
      expect(parseInt(newValue || '0')).toBe(25);
    }, TEST_TIMEOUT);

    it('should handle decimal step conflicts correctly', async () => {
      // Test 4: Input has native step="0.25", TouchSpin step=0.5
      // Expected: TouchSpin step should win
      const inputSelector = '#decimal-native-with-attrs';
      
      await page.focus(inputSelector);
      
      // Start at 2.75, press ArrowUp once
      await page.keyboard.press('ArrowUp');
      await touchspinHelpers.waitForTimeout(100);
      
      const newValue = await touchspinHelpers.readInputValue(page, inputSelector);
      
      // Should increment by TouchSpin step=0.5 (2.75 + 0.5 = 3.25), not native step=0.25 (2.75 + 0.25 = 3.00)
      expect(parseFloat(newValue || '0')).toBe(3.25);
    }, TEST_TIMEOUT);

    it('should use TouchSpin step=1 over native step="2"', async () => {
      // Test 1: Input has native step="2", TouchSpin step=1
      const inputSelector = '#native-with-attrs';
      
      // Reset to start value
      await touchspinHelpers.fillWithValue(page, inputSelector, '8');
      await touchspinHelpers.waitForTimeout(200);
      await page.focus(inputSelector);
      
      // Press ArrowUp once
      await page.keyboard.press('ArrowUp');
      await touchspinHelpers.waitForTimeout(100);
      
      const newValue = await touchspinHelpers.readInputValue(page, inputSelector);
      
      // Should increment by TouchSpin step=1 (8 + 1 = 9), not native step=2 (8 + 2 = 10)
      expect(parseInt(newValue || '0')).toBe(9);
    }, TEST_TIMEOUT);
  });

  describe('Control Type Comparison', () => {
    it('text input should only respect TouchSpin settings (no native spinners)', async () => {
      // Test 3: Text input has no native spinner controls
      const inputSelector = '#text-input';
      
      await page.focus(inputSelector);
      
      // Try arrow keys on text input - should do nothing
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowDown');
      await touchspinHelpers.waitForTimeout(100);
      
      const finalValue = await touchspinHelpers.readInputValue(page, inputSelector);
      
      // Value should remain unchanged (8) since text inputs don't have native spinners
      expect(parseInt(finalValue || '0')).toBe(8);
    }, TEST_TIMEOUT);

    it('should show consistent TouchSpin button behavior across all input types', async () => {
      // Compare TouchSpin button behavior across number vs text inputs
      const numberInputSelector = '#native-without-attrs';
      const textInputSelector = '#text-input';
      
      // Test TouchSpin up button on number input
      await touchspinHelpers.touchspinClickUp(page, numberInputSelector);
      const numberResult = await touchspinHelpers.readInputValue(page, numberInputSelector);
      
      // Test TouchSpin up button on text input
      await touchspinHelpers.touchspinClickUp(page, textInputSelector);
      const textResult = await touchspinHelpers.readInputValue(page, textInputSelector);
      
      // Both should behave identically (8 + 1 = 9) with TouchSpin buttons
      expect(parseInt(numberResult || '0')).toBe(9);
      expect(parseInt(textResult || '0')).toBe(9);
    }, TEST_TIMEOUT);
  });

  describe('Disabled State Behavior', () => {
    it('should respect TouchSpin disabled state for native spinners', async () => {
      // Test 5: Input is disabled via TouchSpin after initialization
      const inputSelector = '#disabled-test';
      
      // Wait a bit longer for the disable to take effect (set in HTML after 500ms)
      await touchspinHelpers.waitForTimeout(1500);
      
      const initialValue = await touchspinHelpers.readInputValue(page, inputSelector);
      
      await page.focus(inputSelector);
      
      // Try to use native spinner controls on disabled input
      await page.keyboard.press('ArrowUp');
      await touchspinHelpers.waitForTimeout(100);
      
      const finalValue = await touchspinHelpers.readInputValue(page, inputSelector);
      
      // Value should not change when TouchSpin is disabled
      expect(parseInt(finalValue || '0')).toBe(parseInt(initialValue || '0'));
    }, TEST_TIMEOUT);

    it('should also disable TouchSpin buttons when input is disabled', async () => {
      // Verify TouchSpin buttons are also disabled
      const inputSelector = '#disabled-test';
      
      // Wait for disable to take effect
      await touchspinHelpers.waitForTimeout(1500);
      
      const initialValue = await touchspinHelpers.readInputValue(page, inputSelector);
      
      // Try TouchSpin button (should not work when disabled)
      await touchspinHelpers.touchspinClickUp(page, inputSelector);
      const finalValue = await touchspinHelpers.readInputValue(page, inputSelector);
      
      // TouchSpin buttons should also not work when disabled
      expect(parseInt(finalValue || '0')).toBe(parseInt(initialValue || '0'));
    }, TEST_TIMEOUT);
  });

  describe('TouchSpin Features vs Native Spinners', () => {
    it('should maintain TouchSpin event firing with native spinner usage', async () => {
      // Test that TouchSpin events are triggered when using native spinners
      const inputSelector = '#booster-test';
      
      // Set up event monitoring
      await page.evaluate(() => {
        const events: string[] = [];
        const input = document.querySelector('#booster-test');
        
        if (input) {
          // Monitor TouchSpin events
          // @ts-ignore
          $(input).on('touchspin.on.startupspin', () => events.push('startupspin'));
          // @ts-ignore
          $(input).on('touchspin.on.stopupspin', () => events.push('stopupspin'));
        }
        
        // Store events on window
        (window as any).touchspinEvents = events;
      });
      
      await page.focus(inputSelector);
      
      // Use native spinner
      await page.keyboard.press('ArrowUp');
      await touchspinHelpers.waitForTimeout(200);
      
      // Check if TouchSpin events were triggered
      const events = await page.evaluate(() => (window as any).touchspinEvents || []);
      
      // Should trigger TouchSpin events when using native controls
      expect(events.length).toBeGreaterThan(0);
    }, TEST_TIMEOUT);

    it('should handle booster functionality independently of native spinners', async () => {
      // Test 7: Booster functionality should work via TouchSpin buttons
      const inputSelector = '#booster-test';
      
      const initialValue = await touchspinHelpers.readInputValue(page, inputSelector);
      
      // Use TouchSpin buttons repeatedly to trigger booster
      for (let i = 0; i < 5; i++) {
        await touchspinHelpers.touchspinClickUp(page, inputSelector);
        await touchspinHelpers.waitForTimeout(100);
      }
      
      const finalValue = await touchspinHelpers.readInputValue(page, inputSelector);
      
      // Should have incremented more than 5 steps due to booster (boostat: 3, maxboostedstep: 10)
      const increment = parseInt(finalValue || '0') - parseInt(initialValue || '0');
      expect(increment).toBeGreaterThan(5); // Booster should cause larger increments
    }, TEST_TIMEOUT);
  });
});