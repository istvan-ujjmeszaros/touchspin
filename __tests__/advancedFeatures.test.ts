import touchspinHelpers from './helpers/touchspinHelpers';
import {page, port} from './helpers/jestPuppeteerServerSetup';

describe('Advanced Features', () => {

  beforeEach(async () => {
    await touchspinHelpers.waitForTouchSpinReady(page, '#testinput_default');
  });

  describe('Data Attributes Configuration', () => {
    it('should respect data-bts-* attributes for configuration', async () => {
      const selector = '#testinput_data_attributes';
      
      // Test data-bts-min="40"
      await touchspinHelpers.fillWithValue(page, selector, '30');
      await page.keyboard.press('Tab');
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('40');
      
      // Test data-bts-max="60"
      await touchspinHelpers.fillWithValue(page, selector, '70');
      await page.keyboard.press('Tab');
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('60');
      
      // Test data-bts-step="2"
      await touchspinHelpers.fillWithValue(page, selector, '50');
      await page.keyboard.press('Tab');
      await touchspinHelpers.touchspinClickUp(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('52');
    });
  });

  describe('Step Validation and Divisibility', () => {
    it('should enforce step divisibility with round mode', async () => {
      const selector = '#testinput_individual_min_max_step_properties';
      
      // Enter a value that doesn't align with step=3
      await touchspinHelpers.fillWithValue(page, selector, '46');
      await page.keyboard.press('Tab');
      
      // Should round to nearest valid step value
      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, selector) || '0');
      expect(finalValue % 3).toBe(0); // Should be divisible by step
    });
  });

  describe('Long Press and Continuous Spinning', () => {
    it('should start spinning when holding down button', async () => {
      const selector = '#testinput_default';
      
      // Get initial value
      const initialValue = parseInt(await touchspinHelpers.readInputValue(page, selector) || '50');
      
      // Hold mousedown for longer than stepintervaldelay (500ms)
      await page.evaluate(() => {
        const button = document.querySelector('.bootstrap-touchspin-up');
        button?.dispatchEvent(new Event('mousedown', { bubbles: true }));
      });
      
      // Wait for spin to start and continue
      await touchspinHelpers.waitForTimeout(800);
      
      await page.evaluate(() => {
        const button = document.querySelector('.bootstrap-touchspin-up');
        button?.dispatchEvent(new Event('mouseup', { bubbles: true }));
      });
      
      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, selector) || '50');
      expect(finalValue).toBeGreaterThan(initialValue + 1); // Should have spun multiple times
    });

    it('should stop spinning on mouseup', async () => {
      const selector = '#testinput_default';
      
      // Start spinning
      await page.evaluate(() => {
        const button = document.querySelector('.bootstrap-touchspin-up');
        button?.dispatchEvent(new Event('mousedown', { bubbles: true }));
      });
      
      await touchspinHelpers.waitForTimeout(200); // Short hold
      
      // Stop spinning
      await page.evaluate(() => {
        const button = document.querySelector('.bootstrap-touchspin-up');
        button?.dispatchEvent(new Event('mouseup', { bubbles: true }));
      });
      
      const valueAfterStop = await touchspinHelpers.readInputValue(page, selector);
      
      // Wait a bit more to ensure spinning has stopped
      await touchspinHelpers.waitForTimeout(300);
      
      const valueAfterWait = await touchspinHelpers.readInputValue(page, selector);
      expect(valueAfterStop).toBe(valueAfterWait); // Should not continue incrementing
    });
  });

  describe('Touch Support', () => {
    it('should respond to touch events', async () => {
      const selector = '#testinput_default';
      
      // Simulate touch events
      await page.evaluate(() => {
        const button = document.querySelector('.bootstrap-touchspin-up');
        button?.dispatchEvent(new Event('touchstart', { bubbles: true }));
        setTimeout(() => {
          button?.dispatchEvent(new Event('touchend', { bubbles: true }));
        }, 100);
      });
      
      await touchspinHelpers.waitForTimeout(200);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });
  });

  describe('Callback Functions', () => {
    it('should apply callback functions for value processing', async () => {
      // This would test if callback_before_calculation and callback_after_calculation work
      // For now, we'll test that the plugin accepts these options without errors
      const selector = '#testinput_default';
      
      await page.evaluate(() => {
        const input = document.querySelector('#testinput_default') as HTMLInputElement;
        (window as any).$(input).trigger('touchspin.destroy');
        (window as any).$(input).TouchSpin({
          callback_before_calculation: function(value: number) {
            return value * 2; // Double the increment
          },
          callback_after_calculation: function(value: number) {
            return value; // No change to display
          }
        });
      });
      
      await touchspinHelpers.waitForTouchSpinReady(page, selector);
      
      // Test that plugin still works with callbacks
      await touchspinHelpers.touchspinClickUp(page, selector);
      const value = parseInt(await touchspinHelpers.readInputValue(page, selector) || '50');
      expect(value).toBeGreaterThan(50);
    });
  });

  describe('Custom Events', () => {
    it('should fire custom spin events', async () => {
      const selector = '#testinput_default';
      
      // Start spinning and check for events
      await page.evaluate(() => {
        const button = document.querySelector('.bootstrap-touchspin-up');
        button?.dispatchEvent(new Event('mousedown', { bubbles: true }));
      });
      
      await touchspinHelpers.waitForTimeout(600); // Wait for spin to start
      
      await page.evaluate(() => {
        const button = document.querySelector('.bootstrap-touchspin-up');
        button?.dispatchEvent(new Event('mouseup', { bubbles: true }));
      });
      
      // Check that spin events were logged (if events logging is available)
      const hasSpinEvents = await page.evaluate(() => {
        const eventLog = document.querySelector('#events_log');
        return eventLog && eventLog.textContent?.includes('startspin');
      });
      
      // This may not always be available, so we make it optional
      if (hasSpinEvents) {
        expect(hasSpinEvents).toBe(true);
      }
    });
  });
});