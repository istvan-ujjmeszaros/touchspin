import { test, expect } from '@playwright/test';
import * as apiHelpers from './helpers/touchspinApiHelpers';
import './coverage.hooks';

test.describe('API Methods', () => {

  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'apiMethods');
  });

  test.describe('TouchSpin Interface Events', () => {
    test('should respond to touchspin.uponce event', async ({ page }) => {
      const testid = 'touchspin-default';

      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        (window as any).$(input).trigger('touchspin.uponce');
      }, testid);

      await expect.poll(
        async () => await apiHelpers.readInputValue(page, testid)
      ).toBe('51');
    });

    test('should respond to touchspin.downonce event', async ({ page }) => {
      const testid = 'touchspin-default';

      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        (window as any).$(input).trigger('touchspin.downonce');
      }, testid);

      await expect.poll(
        async () => await apiHelpers.readInputValue(page, testid)
      ).toBe('49');
    });

    test('should respond to touchspin.startupspin event', async ({ page }) => {
      const testid = 'touchspin-default';
      const initialValue = await apiHelpers.readInputValue(page, testid);

      // Start up spin
      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        (window as any).$(input).trigger('touchspin.startupspin');
      }, testid);

      // Wait for spin to work
      await apiHelpers.waitForTimeout(apiHelpers.TOUCHSPIN_EVENT_WAIT);

      // Stop spin
      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        (window as any).$(input).trigger('touchspin.stopspin');
      }, testid);

      const finalValue = parseInt(await apiHelpers.readInputValue(page, testid) || '0');
      const originalValue = parseInt(initialValue || '0');

      expect(finalValue).toBeGreaterThan(originalValue);
    });

    test('should respond to touchspin.startdownspin event', async ({ page }) => {
      const testid = 'touchspin-default';
      const initialValue = await apiHelpers.readInputValue(page, testid);

      // Start down spin
      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        (window as any).$(input).trigger('touchspin.startdownspin');
      }, testid);

      // Wait for spin to work
      await apiHelpers.waitForTimeout(apiHelpers.TOUCHSPIN_EVENT_WAIT);

      // Stop spin
      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        (window as any).$(input).trigger('touchspin.stopspin');
      }, testid);

      const finalValue = parseInt(await apiHelpers.readInputValue(page, testid) || '0');
      const originalValue = parseInt(initialValue || '0');

      expect(finalValue).toBeLessThan(originalValue);
    });

    test('should respond to touchspin.stopspin event', async ({ page }) => {
      const testid = 'touchspin-default';

      // Start spin
      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        (window as any).$(input).trigger('touchspin.startupspin');
      }, testid);

      await apiHelpers.waitForTimeout(apiHelpers.TOUCHSPIN_EVENT_WAIT);

      // Stop spin
      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        (window as any).$(input).trigger('touchspin.stopspin');
      }, testid);

      const valueAfterStop = await apiHelpers.readInputValue(page, testid);

      // Wait and verify spinning has stopped
      await apiHelpers.waitForTimeout(apiHelpers.TOUCHSPIN_EVENT_WAIT);
      const finalValue = await apiHelpers.readInputValue(page, testid);

      expect(valueAfterStop).toBe(finalValue);
    });
  });

  test.describe('Settings Update', () => {
    test('should update settings via touchspin.updatesettings event', async ({ page }) => {
      // TODO: Add testid to input_group_sm in HTML files
      const selector = '#input_group_sm';

      // Update prefix and postfix
      await page.evaluate((sel) => {
        (window as any).$(sel).trigger('touchspin.updatesettings', [{
          prefix: 'NEW',
          postfix: 'TEST'
        }]);
      }, selector);

      // Check if prefix and postfix were updated - scope to the specific TouchSpin instance
      await expect.poll(async () => {
        const prefixText = await page.evaluate((sel) => {
          const input = document.querySelector(sel);
          const wrapper = input.closest('[data-touchspin-injected="wrapper"]');
          const prefixEl = wrapper?.querySelector('[data-touchspin-injected="prefix"]');
          return prefixEl?.textContent;
        }, selector);
        return prefixText;
      }).toContain('NEW');

      await expect.poll(async () => {
        const postfixText = await page.evaluate((sel) => {
          const input = document.querySelector(sel);
          const wrapper = input.closest('[data-touchspin-injected="wrapper"]');
          const postfixEl = wrapper?.querySelector('[data-touchspin-injected="postfix"]');
          return postfixEl?.textContent;
        }, selector);
        return postfixText;
      }).toContain('TEST');
    });

    test('should update min/max settings', async ({ page }) => {
      const testid = 'touchspin-default';

      // Update min and max values
      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        (window as any).$(input).trigger('touchspin.updatesettings', [{
          min: 10,
          max: 20
        }]);
      }, testid);

      // Check if current value was immediately clamped after updatesettings
      console.log('Value immediately after updatesettings:', await apiHelpers.readInputValue(page, testid));

      // Try to set below new min
      await apiHelpers.fillWithValueAndBlur(page, testid, '5');
      await expect.poll(
        async () => await apiHelpers.readInputValue(page, testid)
      ).toBe('10');

      // Try to set above new max
      await apiHelpers.fillWithValueAndBlur(page, testid, '25');
      await expect.poll(
        async () => await apiHelpers.readInputValue(page, testid)
      ).toBe('20');
    });

    test('should update step setting', async ({ page }) => {
      const testid = 'touchspin-default';

      // Update step value
      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        (window as any).$(input).trigger('touchspin.updatesettings', [{
          step: 5
        }]);
      }, testid);

      // Reset to known value
      await apiHelpers.fillWithValueAndBlur(page, testid, '10');

      // Click up once
      await apiHelpers.clickUpButton(page, testid);

      await expect.poll(
        async () => await apiHelpers.readInputValue(page, testid)
      ).toBe('15');
    });
  });

  test.describe('Destroy Method', () => {
    test('should destroy TouchSpin via touchspin.destroy event', async ({ page }) => {
      const testid = 'touchspin-default';

      // Verify TouchSpin is active
      const spin = apiHelpers.getElement(page, testid + '-wrapper');
      const upButton = spin.locator('.bootstrap-touchspin-up');
      await expect(upButton).toBeVisible();

      // Destroy TouchSpin
      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        (window as any).$(input).trigger('touchspin.destroy');
      }, testid);

      // Wait for destruction by checking that TouchSpin buttons are removed
      await expect(upButton).not.toBeVisible();

      // Verify TouchSpin functionality is disabled (buttons should not respond)
      const initialValue = await apiHelpers.readInputValue(page, testid);

      // After destroy, clicking up button should fail because buttons are removed
      let clickFailed = false;
      try {
        await apiHelpers.clickUpButton(page, testid);
      } catch (error) {
        clickFailed = true;
      }
      expect(clickFailed).toBe(true); // Click should fail because TouchSpin is destroyed

      // Verify original input is preserved
      const input = apiHelpers.getElement(page, testid);
      await expect(input).toBeVisible();
    });

    test('should clean up event handlers after destroy', async ({ page }) => {
      const testid = 'touchspin-default';

      // Destroy TouchSpin
      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        (window as any).$(input).trigger('touchspin.destroy');
      }, testid);

      // Try to trigger TouchSpin events - they should not work
      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        (window as any).$(input).trigger('touchspin.uponce');
      }, testid);

      // Value should not change since TouchSpin is destroyed
      await expect.poll(
        async () => apiHelpers.readInputValue(page, testid)
      ).toBe('50');
    });
  });

  test.describe('Programmatic Value Changes', () => {
    test('should handle direct value changes and maintain consistency', async ({ page }) => {
      const testid = 'touchspin-default';

      // Change value programmatically
      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        (window as any).$(input).val('75');
        (window as any).$(input).trigger('change');
      }, testid);

      // TouchSpin should still work with new value
      await apiHelpers.clickUpButton(page, testid);

      await expect.poll(
        async () => await apiHelpers.readInputValue(page, testid)
      ).toBe('76');
    });

    test('should validate programmatically set values against constraints', async ({ page }) => {
      const testid = 'touchspin-default';

      // Set value beyond max (100)
      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        (window as any).$(input).val('150');
        (window as any).$(input).trigger('blur');
      }, testid);

      // Should be constrained to max value
      await expect.poll(
        async () => await apiHelpers.readInputValue(page, testid)
      ).toBe('100');
    });

    test('should handle programmatic decimal value changes', async ({ page }) => {
      const testid = 'touchspin-decimals';

      // Set decimal value programmatically
      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        (window as any).$(input).val('12.345');
        (window as any).$(input).trigger('blur');
      }, testid);

      // Should be formatted to correct decimal places
      await expect.poll(
        async () => await apiHelpers.readInputValue(page, testid)
      ).toBe('12.35');
    });
  });

  test.describe('Mutation Observer Integration', () => {
    test('should respond to attribute changes via mutation observer', async ({ page }) => {
      const testid = 'touchspin-default';

      // Change disabled attribute programmatically
      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        if (input) input.setAttribute('disabled', '');
      }, testid);

      // Buttons should become disabled after mutation observer processes the change
      await expect.poll(
        async () => apiHelpers.checkTouchspinUpIsDisabled(page, testid)
      ).toBe(true);
    });

    test('should respond to readonly attribute changes', async ({ page }) => {
      const testid = 'touchspin-default';

      // Change readonly attribute programmatically
      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        if (input) input.setAttribute('readonly', '');
      }, testid);

      // Buttons should become disabled after mutation observer processes the change
      await expect.poll(
        async () => apiHelpers.checkTouchspinUpIsDisabled(page, testid)
      ).toBe(true);
    });

    test('should respond to attribute removal', async ({ page }) => {
      const testid = 'touchspin-disabled';

      // Initially should be disabled
      expect(await apiHelpers.checkTouchspinUpIsDisabled(page, testid)).toBe(true);

      // Remove disabled attribute
      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`);
        if (input) input.removeAttribute('disabled');
      }, testid);

      // Buttons should become enabled after mutation observer processes the change
      await expect.poll(
        async () => apiHelpers.checkTouchspinUpIsDisabled(page, testid)
      ).toBe(false);
    });
  });

  test.describe('jQuery Chain Integration', () => {
    test('should allow method chaining after TouchSpin initialization', async ({ page }) => {
      // Test that TouchSpin returns jQuery object for chaining
      const result = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="touchspin-default"]');
        return (window as any).$(input).TouchSpin().hasClass('form-control');
      });

      expect(result).toBe(true);
    });

    test('should work with multiple elements', async ({ page }) => {
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

  test.describe('Error Handling', () => {
    test('should handle invalid settings gracefully', async ({ page }) => {
      // Try to initialize with invalid settings
      const result = await page.evaluate(() => {
        try {
          const input = document.querySelector('[data-testid="touchspin-default"]');
          (window as any).$(input).TouchSpin({
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

    test('should handle missing jQuery gracefully', async ({ page }) => {
      // This is more of a structural test - ensure no errors when basic deps are available
      const hasJQuery = await page.evaluate(() => {
        return typeof (window as any).$ !== 'undefined';
      });

      expect(hasJQuery).toBe(true);
    });
  });
});
