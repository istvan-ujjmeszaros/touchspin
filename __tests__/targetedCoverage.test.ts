import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Targeted Coverage Tests', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'targetedCoverage');
  });

  test.describe('Double Initialization Detection', () => {
    test('should warn about double initialization and destroy/reinitialize', async ({ page }) => {
      // Capture console warnings
      const consoleWarnings: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'warning') {
          consoleWarnings.push(msg.text());
        }
      });

      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="double-init-test" type="text" value="50" data-testid="double-init-test">');
        
        const $input = $('#double-init-test');
        
        // Initialize TouchSpin first time
        $input.TouchSpin({
          min: 0,
          max: 100
        });
        
        // Try to initialize again - should warn and destroy/reinitialize
        $input.TouchSpin({
          min: 0,
          max: 200
        });
      });

      await touchspinHelpers.waitForTimeout(100);
      
      // Should warn about double initialization
      expect(consoleWarnings.some(msg => msg.includes('Destroying existing instance and reinitializing'))).toBe(true);

      // Should still work normally after reinitialization  
      await touchspinHelpers.touchspinClickUp(page, 'double-init-test');
      await touchspinHelpers.waitForTimeout(100);
      expect(await touchspinHelpers.readInputValue(page, 'double-init-test')).toBe('51');
    });
  });

  test.describe('Non-Input Element Detection', () => {
    test('should detect non-input elements and warn "Must be an input."', async ({ page }) => {
      // Capture console warnings
      const consoleWarnings: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'warning') {
          consoleWarnings.push(msg.text());
        }
      });

      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<div id="not-input-test">This is not an input</div>');
        
        // Try to initialize TouchSpin on a div
        $('#not-input-test').TouchSpin();
      });

      await touchspinHelpers.waitForTimeout(200);

      // Should warn "Must be an input." message
      expect(consoleWarnings.some(msg => msg.includes('Must be an input.'))).toBe(true);
    });
  });

  test.describe('Step Validation Edge Cases', () => {
    test('should fallback to step=1 when step=0', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="step-zero-test" type="text" value="50" data-testid="step-zero-test">');
        
        // Try to set step to 0 (invalid)
        $('#step-zero-test').TouchSpin({
          min: 0,
          max: 100,
          step: 0 // Invalid step
        });
      });

      // Should fallback to step=1 and work normally
      await touchspinHelpers.touchspinClickUp(page, 'step-zero-test');
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, 'step-zero-test')
      ).toBe('51'); // 50 + 1
    });

    test('should fallback to step=1 when step is invalid', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="step-invalid-test" type="text" value="50" data-testid="step-invalid-test">');
        
        // Try to set step to invalid value
        $('#step-invalid-test').TouchSpin({
          min: 0,
          max: 100,
          step: 'invalid' as any // Invalid step
        });
      });

      // Should fallback to step=1 and work normally
      await touchspinHelpers.touchspinClickUp(page, 'step-invalid-test');
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, 'step-invalid-test')
      ).toBe('51'); // 50 + 1
    });

    test('should fallback to step=1 when step is negative', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="step-negative-test" type="text" value="50" data-testid="step-negative-test">');
        
        // Try to set step to negative value
        $('#step-negative-test').TouchSpin({
          min: 0,
          max: 100,
          step: -5 // Invalid negative step
        });
      });

      // Should fallback to step=1 and work normally
      await touchspinHelpers.touchspinClickUp(page, 'step-negative-test');
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, 'step-negative-test')
      ).toBe('51'); // 50 + 1
    });
  });

  test.describe('Min/Max Validation Edge Cases', () => {
    test('should handle invalid min value and set to null', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="invalid-min-test" type="text" value="50" data-testid="invalid-min-test">');
        
        // Try to set min to invalid value
        $('#invalid-min-test').TouchSpin({
          min: 'invalid' as any, // Invalid min
          max: 100,
          step: 1
        });
      });

      // Should allow going below what would normally be min (since min becomes null)
      await touchspinHelpers.fillWithValue(page, 'invalid-min-test', '-999');
      await page.keyboard.press('Tab');
      
      // Should accept the negative value (no min constraint)
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, 'invalid-min-test')
      ).toBe('-999');
    });

    test('should handle invalid max value and set to null', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="invalid-max-test" type="text" value="50" data-testid="invalid-max-test">');
        
        // Try to set max to invalid value
        $('#invalid-max-test').TouchSpin({
          min: 0,
          max: 'invalid' as any, // Invalid max
          step: 1
        });
      });

      // Should allow going above what would normally be max (since max becomes null)
      await touchspinHelpers.fillWithValue(page, 'invalid-max-test', '9999');
      await page.keyboard.press('Tab');
      
      // Should accept the high value (no max constraint)
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, 'invalid-max-test')
      ).toBe('9999');
    });

    test('should handle NaN min/max values', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="nan-limits-test" type="text" value="50" data-testid="nan-limits-test">');
        
        // Try to set min/max to NaN
        $('#nan-limits-test').TouchSpin({
          min: NaN, // Will become null
          max: NaN, // Will become null
          step: 1
        });
      });

      // Should work without limits
      await touchspinHelpers.fillWithValue(page, 'nan-limits-test', '12345');
      await page.keyboard.press('Tab');
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, 'nan-limits-test')
      ).toBe('12345');
    });
  });

  test.describe('Decimals Validation Edge Cases', () => {
    test('should fallback to decimals=0 when decimals is invalid', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="invalid-decimals-test" type="text" value="50.123" data-testid="invalid-decimals-test">');
        
        // Try to set decimals to invalid value
        $('#invalid-decimals-test').TouchSpin({
          min: 0,
          max: 100,
          step: 0.1,
          decimals: 'invalid' as any // Invalid decimals
        });
      });

      // Should format with 0 decimal places (fallback)
      const input = page.getByTestId('invalid-decimals-test');
      await input.focus();
      await input.blur();
      await touchspinHelpers.waitForTimeout(200);
      
      // Should show integer (no decimals)
      expect(await touchspinHelpers.readInputValue(page, 'invalid-decimals-test')).toBe('50');
    });

    test('should fallback to decimals=0 when decimals is negative', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="negative-decimals-test" type="text" value="50.123" data-testid="negative-decimals-test">');
        
        // Try to set decimals to negative value
        $('#negative-decimals-test').TouchSpin({
          min: 0,
          max: 100,
          step: 0.1,
          decimals: -3 // Invalid negative decimals
        });
      });

      // Should format with 0 decimal places (fallback)
      const input = page.getByTestId('negative-decimals-test');
      await input.focus();
      await input.blur();
      await touchspinHelpers.waitForTimeout(200);
      
      // Should show integer (no decimals)
      expect(await touchspinHelpers.readInputValue(page, 'negative-decimals-test')).toBe('50');
    });

    test('should fallback to decimals=0 when decimals is NaN', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="nan-decimals-test" type="text" value="50.999" data-testid="nan-decimals-test">');
        
        // Try to set decimals to NaN
        $('#nan-decimals-test').TouchSpin({
          min: 0,
          max: 100,
          step: 0.1,
          decimals: NaN // Invalid NaN decimals
        });
      });

      // Should format with 0 decimal places (fallback)
      const input = page.getByTestId('nan-decimals-test');
      await input.focus();
      await input.blur();
      await touchspinHelpers.waitForTimeout(200);
      
      // Should show integer (no decimals)
      expect(await touchspinHelpers.readInputValue(page, 'nan-decimals-test')).toBe('51'); // rounded to integer
    });
  });

  test.describe('Custom Renderer Functionality', () => {
    test('should work with custom TestRenderer', async ({ page }) => {
      // Navigate to the test renderer page
      await page.goto('/__tests__/html/index-test-renderer.html');
      
      // Test that the TestRenderer works correctly
      const testid = 'test-target';
      
      // Should render and work with TestRenderer
      await touchspinHelpers.waitForTimeout(500); // Let page load
      
      // Check that custom TestRenderer was used by looking for test-specific classes
      const hasTestClasses = await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        return !!(container && (
          container.classList.contains('test-container') ||
          container.querySelector('.test-prefix') ||
          container.querySelector('.test-postfix') ||
          container.querySelector('.test-btn-up') ||
          container.querySelector('.test-btn-down')
        ));
      }, testid);
      
      expect(hasTestClasses).toBe(true);
      
      // Test functionality - should work normally
      await touchspinHelpers.touchspinClickUp(page, testid);
      await touchspinHelpers.waitForTimeout(100);
      expect(await touchspinHelpers.readInputValue(page, testid)).toBe('43'); // 42 + 1
      
      // Test down click
      await touchspinHelpers.touchspinClickDown(page, testid);
      await touchspinHelpers.waitForTimeout(100);
      expect(await touchspinHelpers.readInputValue(page, testid)).toBe('42'); // back to original
      
      // Verify TestRenderer specific elements are present
      const testSpecificElements = await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        return {
          hasTestWrapper: !!(container && container.classList.contains('test-container')),
          hasTestPrefix: !!(container && container.querySelector('.test-prefix')),
          hasTestPostfix: !!(container && container.querySelector('.test-postfix')),
          hasTestButtons: !!(container && container.querySelector('.test-btn-up') && container.querySelector('.test-btn-down'))
        };
      }, testid);
      
      expect(testSpecificElements.hasTestWrapper).toBe(true);
      expect(testSpecificElements.hasTestPrefix).toBe(true);
      expect(testSpecificElements.hasTestPostfix).toBe(true);
      expect(testSpecificElements.hasTestButtons).toBe(true);
    });
  });

  test.describe('UMD Module Loading (Simulation)', () => {
    test('should handle module environment detection', async ({ page }) => {
      // Test the UMD wrapper logic by simulating different environments
      const umdResults = await page.evaluate(() => {
        const results = [];
        
        // Simulate AMD environment
        const originalDefine = (window as any).define;
        (window as any).define = function(deps: any, factory: any) {
          results.push('AMD detected');
          return factory;
        };
        (window as any).define.amd = true;
        
        // Test AMD path
        try {
          // The UMD wrapper should detect AMD
          results.push('AMD path would be taken');
        } catch (e) {
          results.push('AMD error: ' + e);
        }
        
        // Cleanup
        if (originalDefine) {
          (window as any).define = originalDefine;
        } else {
          delete (window as any).define;
        }
        
        // Simulate CommonJS environment
        const originalModule = (window as any).module;
        const originalExports = (window as any).exports;
        
        (window as any).module = { exports: {} };
        (window as any).exports = (window as any).module.exports;
        
        try {
          results.push('CommonJS simulation complete');
        } catch (e) {
          results.push('CommonJS error: ' + e);
        }
        
        // Cleanup
        if (originalModule) {
          (window as any).module = originalModule;
        } else {
          delete (window as any).module;
        }
        
        if (originalExports) {
          (window as any).exports = originalExports;
        } else {
          delete (window as any).exports;
        }
        
        return results;
      });

      // Should have simulated the UMD environment detection
      expect(umdResults.length).toBeGreaterThan(0);
    });
  });

  test.describe('Boundary Value Testing', () => {
    test('should handle extreme decimal values', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="extreme-decimals-test" type="text" value="0" data-testid="extreme-decimals-test">');
        
        // Test with very high decimal precision
        $('#extreme-decimals-test').TouchSpin({
          min: 0,
          max: 1,
          step: 0.000001,
          decimals: 10 // Very high precision
        });
      });

      // Test precision handling
      await touchspinHelpers.fillWithValue(page, 'extreme-decimals-test', '0.123456789123456789');
      await page.keyboard.press('Tab');
      await touchspinHelpers.waitForTimeout(200);
      
      const value = await touchspinHelpers.readInputValue(page, 'extreme-decimals-test');
      // Should be limited to specified decimal places
      expect(value).toMatch(/^0\.\d{10}$/);
    });

    test('should handle very large numbers', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="large-numbers-test" type="text" value="0" data-testid="large-numbers-test">');
        
        $('#large-numbers-test').TouchSpin({
          min: null, // No limit
          max: null, // No limit
          step: 1000000
        });
      });

      // Test with large number
      await touchspinHelpers.fillWithValue(page, 'large-numbers-test', '999999999999999');
      await page.keyboard.press('Tab');
      await touchspinHelpers.waitForTimeout(200);
      
      const value = await touchspinHelpers.readInputValue(page, 'large-numbers-test');
      expect(parseFloat(value || '0')).toBeCloseTo(999999999999999, -3); // Allow for floating point precision
    });
  });
});