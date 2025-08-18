import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Uncovered Configuration Options', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'uncoveredConfigurations');
  });

  test.describe('mousewheel: false Configuration', () => {
    test('should disable mousewheel when set to false', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="no-mousewheel-test" type="text" value="50" data-testid="no-mousewheel-test">');
        $('#no-mousewheel-test').TouchSpin({
          min: 0,
          max: 100,
          mousewheel: false // Disable mousewheel
        });
      });

      const input = page.getByTestId('no-mousewheel-test');
      await input.focus();

      // Try mousewheel event
      await input.evaluate((el) => {
        el.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, bubbles: true }));
      });

      await touchspinHelpers.waitForTimeout(100);

      // Value should not change
      expect(await touchspinHelpers.readInputValue(page, 'no-mousewheel-test')).toBe('50');
    });
  });

  test.describe('booster: false Configuration', () => {
    test('should disable booster acceleration when set to false', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="no-booster-test" type="text" value="10" data-testid="no-booster-test">');
        $('#no-booster-test').TouchSpin({
          min: 0,
          max: 100,
          step: 1,
          booster: false, // Disable booster
          boostat: 2,
          maxboostedstep: 10
        });
      });

      // Hold down button for extended time to see if boosting occurs
      await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const button = container?.querySelector('.bootstrap-touchspin-up');
        if (button) {
          button.dispatchEvent(new Event('mousedown', { bubbles: true }));
        }
      }, 'no-booster-test');

      await touchspinHelpers.waitForTimeout(1000); // Long enough for boosting

      await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const button = container?.querySelector('.bootstrap-touchspin-up');
        if (button) {
          button.dispatchEvent(new Event('mouseup', { bubbles: true }));
        }
      }, 'no-booster-test');

      await touchspinHelpers.waitForTimeout(200);

      // Should have incremented consistently without acceleration
      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, 'no-booster-test') || '10');
      
      // Without booster, increments should be linear (step=1)
      expect(finalValue).toBeGreaterThan(10);
      expect(finalValue).toBeLessThan(30); // Should not have big jumps
    });
  });

  test.describe('forcestepdivisibility Options', () => {
    test('should handle forcestepdivisibility: "none"', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="step-none-test" type="text" value="0" data-testid="step-none-test">');
        $('#step-none-test').TouchSpin({
          min: 0,
          max: 100,
          step: 3,
          forcestepdivisibility: 'none' // Don't force step divisibility
        });
      });

      // Enter a value that doesn't align with step
      await touchspinHelpers.fillWithValue(page, 'step-none-test', '5');
      await page.keyboard.press('Tab');
      await touchspinHelpers.waitForTimeout(200);

      // Should keep the value as-is without forcing step alignment
      expect(await touchspinHelpers.readInputValue(page, 'step-none-test')).toBe('5');
    });

    test('should handle forcestepdivisibility: "floor"', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="step-floor-test" type="text" value="0" data-testid="step-floor-test">');
        $('#step-floor-test').TouchSpin({
          min: 0,
          max: 100,
          step: 3,
          forcestepdivisibility: 'floor' // Round down to step
        });
      });

      // Enter a value that doesn't align with step
      await touchspinHelpers.fillWithValue(page, 'step-floor-test', '8');
      await page.keyboard.press('Tab');
      await touchspinHelpers.waitForTimeout(200);

      // Should round down to 6 (8 / 3 = 2.67, floor = 2, 2 * 3 = 6)
      expect(await touchspinHelpers.readInputValue(page, 'step-floor-test')).toBe('6');
    });

    test('should handle forcestepdivisibility: "ceil"', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="step-ceil-test" type="text" value="0" data-testid="step-ceil-test">');
        $('#step-ceil-test').TouchSpin({
          min: 0,
          max: 100,
          step: 3,
          forcestepdivisibility: 'ceil' // Round up to step
        });
      });

      // Enter a value that doesn't align with step
      await touchspinHelpers.fillWithValue(page, 'step-ceil-test', '7');
      await page.keyboard.press('Tab');
      await touchspinHelpers.waitForTimeout(200);

      // Should round up to 9 (7 / 3 = 2.33, ceil = 3, 3 * 3 = 9)
      expect(await touchspinHelpers.readInputValue(page, 'step-ceil-test')).toBe('9');
    });
  });

  test.describe('Empty initval and replacementval', () => {
    test('should handle empty initval', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="empty-initval-test" type="text" value="" data-testid="empty-initval-test">');
        $('#empty-initval-test').TouchSpin({
          min: 0,
          max: 100,
          initval: '', // Empty init value
          replacementval: ''
        });
      });

      // Input should remain empty
      expect(await touchspinHelpers.readInputValue(page, 'empty-initval-test')).toBe('');
    });

    test('should handle null min/max values', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="null-limits-test" type="text" value="50" data-testid="null-limits-test">');
        $('#null-limits-test').TouchSpin({
          min: null, // No minimum limit
          max: null, // No maximum limit
          step: 1
        });
      });

      // Should allow values outside normal ranges
      await touchspinHelpers.fillWithValue(page, 'null-limits-test', '-999');
      await page.keyboard.press('Tab');
      await touchspinHelpers.waitForTimeout(200);
      expect(await touchspinHelpers.readInputValue(page, 'null-limits-test')).toBe('-999');

      await touchspinHelpers.fillWithValue(page, 'null-limits-test', '9999');
      await page.keyboard.press('Tab');
      await touchspinHelpers.waitForTimeout(200);
      expect(await touchspinHelpers.readInputValue(page, 'null-limits-test')).toBe('9999');
    });
  });

  test.describe('Vertical Button Custom Classes', () => {
    test('should apply custom vertical button classes', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="custom-vertical-test" type="text" value="50" data-testid="custom-vertical-test">');
        $('#custom-vertical-test').TouchSpin({
          verticalbuttons: true,
          verticalup: '<i class="custom-up">▲</i>',
          verticaldown: '<i class="custom-down">▼</i>',
          verticalupclass: 'my-up-class',
          verticaldownclass: 'my-down-class'
        });
      });

      // Check that custom classes are applied
      const hasCustomClasses = await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const upButton = container?.querySelector('.my-up-class');
        const downButton = container?.querySelector('.my-down-class');
        return !!(upButton && downButton);
      }, 'custom-vertical-test');

      expect(hasCustomClasses).toBe(true);

      // Should still function correctly
      await touchspinHelpers.touchspinClickUp(page, 'custom-vertical-test');
      await touchspinHelpers.waitForTimeout(100);
      expect(await touchspinHelpers.readInputValue(page, 'custom-vertical-test')).toBe('51');
    });
  });

  test.describe('Prefix/Postfix Extra Classes', () => {
    test('should apply extra classes to prefix and postfix', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="extra-classes-test" type="text" value="50" data-testid="extra-classes-test">');
        $('#extra-classes-test').TouchSpin({
          prefix: 'Pre',
          postfix: 'Post',
          prefix_extraclass: 'my-prefix-class',
          postfix_extraclass: 'my-postfix-class'
        });
      });

      // Check that extra classes are applied
      const hasExtraClasses = await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const prefixEl = container?.querySelector('.my-prefix-class');
        const postfixEl = container?.querySelector('.my-postfix-class');
        return !!(prefixEl && postfixEl);
      }, 'extra-classes-test');

      expect(hasExtraClasses).toBe(true);
    });
  });

  test.describe('Custom Button Classes and Text', () => {
    test('should use custom button classes and text', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="custom-buttons-test" type="text" value="50" data-testid="custom-buttons-test">');
        $('#custom-buttons-test').TouchSpin({
          buttondown_class: 'btn btn-danger custom-down',
          buttonup_class: 'btn btn-success custom-up', 
          buttondown_txt: '⬇',
          buttonup_txt: '⬆'
        });
      });

      // Check custom classes and text are applied
      const customization = await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const upButton = container?.querySelector('.custom-up');
        const downButton = container?.querySelector('.custom-down');
        return {
          hasCustomClasses: !!(upButton && downButton),
          upText: upButton?.textContent?.trim(),
          downText: downButton?.textContent?.trim()
        };
      }, 'custom-buttons-test');

      expect(customization.hasCustomClasses).toBe(true);
      expect(customization.upText).toBe('⬆');
      expect(customization.downText).toBe('⬇');
    });
  });

  test.describe('Decimal Precision Edge Cases', () => {
    test('should handle decimals=0 with decimal input', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="zero-decimals-test" type="text" value="50.75" data-testid="zero-decimals-test">');
        $('#zero-decimals-test').TouchSpin({
          min: 0,
          max: 100,
          step: 1,
          decimals: 0 // No decimal places
        });
      });

      // Should truncate decimals
      const input = page.getByTestId('zero-decimals-test');
      await input.focus();
      await input.blur();
      await touchspinHelpers.waitForTimeout(200);

      expect(await touchspinHelpers.readInputValue(page, 'zero-decimals-test')).toBe('51');
    });

    test('should handle high decimal precision', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="high-decimals-test" type="text" value="50.123456789" data-testid="high-decimals-test">');
        $('#high-decimals-test').TouchSpin({
          min: 0,
          max: 100,
          step: 0.001,
          decimals: 5 // 5 decimal places
        });
      });

      // Should format to 5 decimal places
      const input = page.getByTestId('high-decimals-test');
      await input.focus();
      await input.blur();
      await touchspinHelpers.waitForTimeout(200);

      expect(await touchspinHelpers.readInputValue(page, 'high-decimals-test')).toBe('50.12300'); // Actual behavior: pads with zeros
    });
  });

  test.describe('Timing Configuration Edge Cases', () => {
    test('should use custom stepinterval and stepintervaldelay', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="timing-test" type="text" value="10" data-testid="timing-test">');
        $('#timing-test').TouchSpin({
          min: 0,
          max: 100,
          step: 1,
          stepinterval: 50, // Very fast interval (50ms)
          stepintervaldelay: 100 // Short delay (100ms)
        });
      });

      // Hold button briefly to trigger fast stepping
      await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const button = container?.querySelector('.bootstrap-touchspin-up');
        if (button) {
          button.dispatchEvent(new Event('mousedown', { bubbles: true }));
        }
      }, 'timing-test');

      await touchspinHelpers.waitForTimeout(300); // Wait for fast increments

      await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const button = container?.querySelector('.bootstrap-touchspin-up');
        if (button) {
          button.dispatchEvent(new Event('mouseup', { bubbles: true }));
        }
      }, 'timing-test');

      await touchspinHelpers.waitForTimeout(100);

      // Should have incremented multiple times due to fast interval
      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, 'timing-test') || '10');
      expect(finalValue).toBeGreaterThan(12); // Should have fast increments
    });
  });
});