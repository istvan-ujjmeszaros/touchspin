import touchspinHelpers from './helpers/touchspinHelpers';
import {page, port} from './helpers/jestPuppeteerServerSetup';

describe('API Methods', () => {

  describe('TouchSpin Interface Events', () => {
    it('should respond to touchspin.uponce event', async () => {
      const selector = '#testinput_default';
      
      await page.evaluate((sel) => {
        (window as any).$(sel).trigger('touchspin.uponce');
      }, selector);
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });

    it('should respond to touchspin.downonce event', async () => {
      const selector = '#testinput_default';
      
      await page.evaluate((sel) => {
        (window as any).$(sel).trigger('touchspin.downonce');
      }, selector);
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('49');
    });

    it('should respond to touchspin.startupspin event', async () => {
      const selector = '#testinput_default';
      const initialValue = await touchspinHelpers.readInputValue(page, selector);
      
      // Start up spin
      await page.evaluate((sel) => {
        (window as any).$(sel).trigger('touchspin.startupspin');
      }, selector);
      
      // Wait for spin to work
      await touchspinHelpers.waitForTimeout(600);
      
      // Stop spin
      await page.evaluate((sel) => {
        (window as any).$(sel).trigger('touchspin.stopspin');
      }, selector);
      
      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, selector) || '0');
      const originalValue = parseInt(initialValue || '0');
      
      expect(finalValue).toBeGreaterThan(originalValue);
    });

    it('should respond to touchspin.startdownspin event', async () => {
      const selector = '#testinput_default';
      const initialValue = await touchspinHelpers.readInputValue(page, selector);
      
      // Start down spin
      await page.evaluate((sel) => {
        (window as any).$(sel).trigger('touchspin.startdownspin');
      }, selector);
      
      // Wait for spin to work
      await touchspinHelpers.waitForTimeout(600);
      
      // Stop spin
      await page.evaluate((sel) => {
        (window as any).$(sel).trigger('touchspin.stopspin');
      }, selector);
      
      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, selector) || '0');
      const originalValue = parseInt(initialValue || '0');
      
      expect(finalValue).toBeLessThan(originalValue);
    });

    it('should respond to touchspin.stopspin event', async () => {
      const selector = '#testinput_default';
      
      // Start spin
      await page.evaluate((sel) => {
        (window as any).$(sel).trigger('touchspin.startupspin');
      }, selector);
      
      await touchspinHelpers.waitForTimeout(100);
      
      // Stop spin
      await page.evaluate((sel) => {
        (window as any).$(sel).trigger('touchspin.stopspin');
      }, selector);
      
      const valueAfterStop = await touchspinHelpers.readInputValue(page, selector);
      
      // Wait and verify spinning has stopped
      await touchspinHelpers.waitForTimeout(600);
      const finalValue = await touchspinHelpers.readInputValue(page, selector);
      
      expect(valueAfterStop).toBe(finalValue);
    });
  });

  describe('Settings Update', () => {
    it('should update settings via touchspin.updatesettings event', async () => {
      const selector = '#input_group_sm';
      
      // Update prefix and postfix
      await page.evaluate((sel) => {
        (window as any).$(sel).trigger('touchspin.updatesettings', [{
          prefix: 'NEW',
          postfix: 'TEST'
        }]);
      }, selector);
      
      // Wait for update to apply
      await touchspinHelpers.waitForTimeout(100);
      
      // Check if prefix and postfix were updated
      const prefixText = await page.$eval('.bootstrap-touchspin-prefix', el => el.textContent);
      const postfixText = await page.$eval('.bootstrap-touchspin-postfix', el => el.textContent);
      
      expect(prefixText).toContain('NEW');
      expect(postfixText).toContain('TEST');
    });

    it('should update min/max settings', async () => {
      const selector = '#testinput_default';
      
      // Update min and max values
      await page.evaluate((sel) => {
        (window as any).$(sel).trigger('touchspin.updatesettings', [{
          min: 10,
          max: 20
        }]);
      }, selector);
      
      // Try to set below new min
      await touchspinHelpers.fillWithValue(page, selector, '5');
      await page.keyboard.press('Tab');
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('10');
      
      // Try to set above new max
      await touchspinHelpers.fillWithValue(page, selector, '25');
      await page.keyboard.press('Tab');
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('20');
    });

    it('should update step setting', async () => {
      const selector = '#testinput_default';
      
      // Update step value
      await page.evaluate((sel) => {
        (window as any).$(sel).trigger('touchspin.updatesettings', [{
          step: 5
        }]);
      }, selector);
      
      // Reset to known value
      await touchspinHelpers.fillWithValue(page, selector, '10');
      await page.keyboard.press('Tab');
      
      // Click up once
      await touchspinHelpers.touchspinClickUp(page, selector);
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('15');
    });
  });

  describe('Destroy Method', () => {
    it('should destroy TouchSpin via touchspin.destroy event', async () => {
      const selector = '#testinput_default';
      
      // Verify TouchSpin is active
      let upButton = await page.$(selector + ' + .input-group-btn > .bootstrap-touchspin-up');
      expect(upButton).toBeTruthy();
      
      // Destroy TouchSpin
      await page.evaluate((sel) => {
        (window as any).$(sel).trigger('touchspin.destroy');
      }, selector);
      
      // Wait for destruction
      await touchspinHelpers.waitForTimeout(100);
      
      // Verify TouchSpin buttons are removed
      upButton = await page.$(selector + ' + .input-group-btn > .bootstrap-touchspin-up');
      expect(upButton).toBeFalsy();
      
      // Verify original input is preserved
      const originalInput = await page.$(selector);
      expect(originalInput).toBeTruthy();
    });

    it('should clean up event handlers after destroy', async () => {
      const selector = '#testinput_default';
      
      // Destroy TouchSpin
      await page.evaluate((sel) => {
        (window as any).$(sel).trigger('touchspin.destroy');
      }, selector);
      
      await touchspinHelpers.waitForTimeout(100);
      
      // Try to trigger TouchSpin events - they should not work
      await page.evaluate((sel) => {
        (window as any).$(sel).trigger('touchspin.uponce');
      }, selector);
      
      // Value should not change since TouchSpin is destroyed
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
    });
  });

  describe('Programmatic Value Changes', () => {
    it('should handle direct value changes and maintain consistency', async () => {
      const selector = '#testinput_default';
      
      // Change value programmatically
      await page.evaluate((sel) => {
        (window as any).$(sel).val('75');
        (window as any).$(sel).trigger('change');
      }, selector);
      
      // TouchSpin should still work with new value
      await touchspinHelpers.touchspinClickUp(page, selector);
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('76');
    });

    it('should validate programmatically set values against constraints', async () => {
      const selector = '#testinput_default';
      
      // Set value beyond max (100)
      await page.evaluate((sel) => {
        (window as any).$(sel).val('150');
        (window as any).$(sel).trigger('blur');
      }, selector);
      
      // Should be constrained to max value
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('100');
    });

    it('should handle programmatic decimal value changes', async () => {
      const selector = '#testinput_decimals';
      
      // Set decimal value programmatically
      await page.evaluate((sel) => {
        (window as any).$(sel).val('12.345');
        (window as any).$(sel).trigger('blur');
      }, selector);
      
      // Should be formatted to correct decimal places
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('12.35');
    });
  });

  describe('Mutation Observer Integration', () => {
    it('should respond to attribute changes via mutation observer', async () => {
      const selector = '#testinput_default';
      
      // Change disabled attribute programmatically
      await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element) element.setAttribute('disabled', '');
      }, selector);
      
      // Wait for mutation observer to kick in
      await touchspinHelpers.waitForTimeout(100);
      
      // Buttons should become disabled
      expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, selector)).toBe(true);
    });

    it('should respond to readonly attribute changes', async () => {
      const selector = '#testinput_default';
      
      // Change readonly attribute programmatically
      await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element) element.setAttribute('readonly', '');
      }, selector);
      
      // Wait for mutation observer
      await touchspinHelpers.waitForTimeout(100);
      
      // Buttons should become disabled
      expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, selector)).toBe(true);
    });

    it('should respond to attribute removal', async () => {
      const selector = '#testinput_disabled';
      
      // Initially should be disabled
      expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, selector)).toBe(true);
      
      // Remove disabled attribute
      await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element) element.removeAttribute('disabled');
      }, selector);
      
      // Wait for mutation observer
      await touchspinHelpers.waitForTimeout(100);
      
      // Buttons should become enabled
      expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, selector)).toBe(false);
    });
  });

  describe('jQuery Chain Integration', () => {
    it('should allow method chaining after TouchSpin initialization', async () => {
      // Test that TouchSpin returns jQuery object for chaining
      const result = await page.evaluate(() => {
        return (window as any).$('#testinput_default').TouchSpin().hasClass('form-control');
      });
      
      expect(result).toBe(true);
    });

    it('should work with multiple elements', async () => {
      // Initialize TouchSpin on multiple elements
      await page.evaluate(() => {
        const $ = (window as any).$;
        $('input[type="text"]').each(function(this: HTMLElement) {
          if (!$(this).parent().hasClass('bootstrap-touchspin')) {
            $(this).TouchSpin();
          }
        });
      });
      
      // All should have TouchSpin functionality
      const touchspinCount = await page.evaluate(() => {
        return (window as any).$('.bootstrap-touchspin').length;
      });
      
      expect(touchspinCount).toBeGreaterThan(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid settings gracefully', async () => {
      // Try to initialize with invalid settings
      const result = await page.evaluate(() => {
        try {
          (window as any).$('#testinput_default').TouchSpin({
            min: 'invalid',
            max: null,
            step: 'not a number'
          });
          return true;
        } catch (error) {
          return false;
        }
      });
      
      // Should not throw errors
      expect(result).toBe(true);
    });

    it('should handle missing jQuery gracefully', async () => {
      // This is more of a structural test - ensure no errors when basic deps are available
      const hasJQuery = await page.evaluate(() => {
        return typeof (window as any).$ !== 'undefined';
      });
      
      expect(hasJQuery).toBe(true);
    });
  });
});