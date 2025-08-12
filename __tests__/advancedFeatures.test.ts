import touchspinHelpers from './helpers/touchspinHelpers';
import {page, port} from './helpers/jestPuppeteerServerSetup';

describe('Advanced Features', () => {

  describe('Mousewheel Support', () => {
    it('should increase value when scrolling up', async () => {
      const selector = '#testinput_default';
      
      // Focus the input
      await page.focus(selector);
      
      // Simulate mousewheel scroll up (negative deltaY)
      await page.mouse.wheel({ deltaY: -100 });
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });

    it('should decrease value when scrolling down', async () => {
      const selector = '#testinput_default';
      
      // Focus the input
      await page.focus(selector);
      
      // Simulate mousewheel scroll down (positive deltaY)
      await page.mouse.wheel({ deltaY: 100 });
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('49');
    });

    it('should respect min/max bounds when using mousewheel', async () => {
      const selector = '#testinput_default';
      
      // Set to max value
      await touchspinHelpers.fillWithValue(page, selector, '100');
      await page.focus(selector);
      
      // Try to scroll up beyond max
      await page.mouse.wheel({ deltaY: -100 });
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('100');
    });
  });

  describe('Keyboard Support', () => {
    it('should increase value with ArrowUp key', async () => {
      const selector = '#testinput_default';
      
      await page.focus(selector);
      await page.keyboard.press('ArrowUp');
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });

    it('should decrease value with ArrowDown key', async () => {
      const selector = '#testinput_default';
      
      await page.focus(selector);
      await page.keyboard.press('ArrowDown');
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('49');
    });

    it('should not change value when disabled input receives arrow keys', async () => {
      const selector = '#testinput_disabled';
      
      await page.focus(selector);
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowDown');
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('0');
    });
  });

  describe('Data Attributes', () => {
    it('should respect data-bts-min attribute', async () => {
      const selector = '#testinput_data_attributes';
      
      // Try to go below data-bts-min="40"
      await touchspinHelpers.fillWithValue(page, selector, '30');
      await page.keyboard.press('Tab');
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('40');
    });

    it('should respect data-bts-max attribute', async () => {
      const selector = '#testinput_data_attributes';
      
      // Try to go above data-bts-max="60"
      await touchspinHelpers.fillWithValue(page, selector, '70');
      await page.keyboard.press('Tab');
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('60');
    });

    it('should respect data-bts-step attribute', async () => {
      const selector = '#testinput_data_attributes';
      
      // Reset to known value
      await touchspinHelpers.fillWithValue(page, selector, '50');
      await page.keyboard.press('Tab');
      
      // Click up once (should increase by data-bts-step="2")
      await touchspinHelpers.touchspinClickUp(page, selector);
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('52');
    });
  });

  describe('Decimal Support', () => {
    it('should handle decimal values correctly', async () => {
      const selector = '#testinput_decimals';
      
      await touchspinHelpers.touchspinClickUp(page, selector);
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50.01');
    });

    it('should format decimal values to correct precision', async () => {
      const selector = '#testinput_decimals';
      
      // Enter a value with more decimals than configured
      await touchspinHelpers.fillWithValue(page, selector, '45.123456');
      await page.keyboard.press('Tab');
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('45.12');
    });
  });

  describe('Step Validation', () => {
    it('should enforce step divisibility with round mode', async () => {
      const selector = '#testinput_individual_min_max_step_properties';
      
      // Enter a value that doesn't align with step=3, starting from min=44
      await touchspinHelpers.fillWithValue(page, selector, '46');
      await page.keyboard.press('Tab');
      
      // Should round to nearest step (44 + 3 = 47, but 46 is closer to 45 = 44 + 1*3)
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('47');
    });
  });

  describe('Long Press and Spin Functionality', () => {
    it('should start spinning when holding down button', async () => {
      const selector = '#testinput_default';
      const initialValue = await touchspinHelpers.readInputValue(page, selector);
      
      // Start mousedown and hold for longer duration
      await page.evaluate((sel) => {
        const button = document.querySelector(sel + ' + .input-group-btn > .bootstrap-touchspin-up');
        button?.dispatchEvent(new Event('mousedown'));
      }, selector);
      
      // Wait for spin interval to kick in
      await touchspinHelpers.waitForTimeout(600);
      
      // Stop the spin
      await page.evaluate((sel) => {
        const button = document.querySelector(sel + ' + .input-group-btn > .bootstrap-touchspin-up');
        button?.dispatchEvent(new Event('mouseup'));
      }, selector);
      
      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, selector) || '0');
      const originalValue = parseInt(initialValue || '0');
      
      expect(finalValue).toBeGreaterThan(originalValue + 1); // Should have incremented multiple times
    });

    it('should stop spinning on mouseup', async () => {
      const selector = '#testinput_default';
      
      // Start spin
      await page.evaluate((sel) => {
        const button = document.querySelector(sel + ' + .input-group-btn > .bootstrap-touchspin-up');
        button?.dispatchEvent(new Event('mousedown'));
      }, selector);
      
      await touchspinHelpers.waitForTimeout(100);
      
      // Stop spin immediately
      await page.evaluate((sel) => {
        const button = document.querySelector(sel + ' + .input-group-btn > .bootstrap-touchspin-up');
        button?.dispatchEvent(new Event('mouseup'));
      }, selector);
      
      const valueAfterStop = await touchspinHelpers.readInputValue(page, selector);
      
      // Wait and check that spinning stopped
      await touchspinHelpers.waitForTimeout(600);
      const finalValue = await touchspinHelpers.readInputValue(page, selector);
      
      expect(valueAfterStop).toBe(finalValue);
    });
  });

  describe('Touch Support', () => {
    it('should respond to touchstart/touchend events', async () => {
      const selector = '#testinput_default';
      const initialValue = await touchspinHelpers.readInputValue(page, selector);
      
      // Simulate touch events
      await page.evaluate((sel) => {
        const button = document.querySelector(sel + ' + .input-group-btn > .bootstrap-touchspin-up');
        button?.dispatchEvent(new TouchEvent('touchstart', {
          touches: [new Touch({
            identifier: 1,
            target: button,
            clientX: 100,
            clientY: 100
          })]
        }));
      }, selector);
      
      await touchspinHelpers.waitForTimeout(200);
      
      await page.evaluate((sel) => {
        const button = document.querySelector(sel + ' + .input-group-btn > .bootstrap-touchspin-up');
        button?.dispatchEvent(new TouchEvent('touchend', { touches: [] }));
      }, selector);
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });
  });

  describe('Callback Functions', () => {
    it('should apply callback_before_calculation correctly', async () => {
      const selector = '#input_callbacks';
      
      // Test with the numeral.js implementation
      await touchspinHelpers.fillWithValue(page, selector, '$1,500.00');
      await touchspinHelpers.touchspinClickUp(page, selector);
      
      const result = await touchspinHelpers.readInputValue(page, selector);
      expect(result).toContain('1,500.10'); // Should increment by 0.1 and format
    });

    it('should apply callback_after_calculation for display formatting', async () => {
      const selector = '#input_callbacks';
      
      // The initial value should be formatted
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('$5,000.00');
    });
  });

  describe('Custom Event Validation', () => {
    it('should fire touchspin.on.startspin event on button hold', async () => {
      const selector = '#testinput_default';
      
      // Start long press
      await page.evaluate((sel) => {
        const button = document.querySelector(sel + ' + .input-group-btn > .bootstrap-touchspin-up');
        button?.dispatchEvent(new Event('mousedown'));
      }, selector);
      
      // Wait for spin to start
      await touchspinHelpers.waitForTimeout(600);
      
      // Stop
      await page.evaluate((sel) => {
        const button = document.querySelector(sel + ' + .input-group-btn > .bootstrap-touchspin-up');
        button?.dispatchEvent(new Event('mouseup'));
      }, selector);
      
      expect(await touchspinHelpers.countEvent(page, selector, 'touchspin.on.startspin')).toBeGreaterThan(0);
    });

    it('should fire touchspin.on.stopspin event when releasing button', async () => {
      const selector = '#testinput_default';
      
      // Start and stop spin
      await page.evaluate((sel) => {
        const button = document.querySelector(sel + ' + .input-group-btn > .bootstrap-touchspin-up');
        button?.dispatchEvent(new Event('mousedown'));
      }, selector);
      
      await touchspinHelpers.waitForTimeout(600);
      
      await page.evaluate((sel) => {
        const button = document.querySelector(sel + ' + .input-group-btn > .bootstrap-touchspin-up');
        button?.dispatchEvent(new Event('mouseup'));
      }, selector);
      
      expect(await touchspinHelpers.countEvent(page, selector, 'touchspin.on.stopspin')).toBeGreaterThan(0);
    });
  });
});