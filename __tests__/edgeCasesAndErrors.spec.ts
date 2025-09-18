import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinApiHelpers';
import './coverage.hooks';

test.describe('Edge Cases and Error Handling', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'edgeCasesAndErrors');
  });

  test.describe('firstclickvalueifempty Configuration', () => {
    test('should use firstclickvalueifempty when clicking on empty input', async ({ page }) => {
      // Create a TouchSpin with firstclickvalueifempty setting
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="firstclick-test" type="text" value="" data-testid="firstclick-test">');
        $('#firstclick-test').TouchSpin({
          min: 0,
          max: 100,
          firstclickvalueifempty: 42
        });
      });

      // Input should be empty initially
      const input = page.getByTestId('firstclick-test');
      expect(await input.inputValue()).toBe('');

      // Click the up button on empty input
      await touchspinHelpers.clickUpButton(page, 'firstclick-test');

      // Should use firstclickvalueifempty value
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, 'firstclick-test')
      ).toBe('42');
    });

    test('should fall back to midpoint when firstclickvalueifempty is null', async ({ page }) => {
      // Create a TouchSpin without firstclickvalueifempty (null by default)
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="midpoint-test" type="text" value="" data-testid="midpoint-test">');
        $('#midpoint-test').TouchSpin({
          min: 10,
          max: 30,
          firstclickvalueifempty: null // Explicitly null
        });
      });

      // Click the up button on empty input
      await touchspinHelpers.clickUpButton(page, 'midpoint-test');

      // Should use midpoint between min and max (10+30)/2 = 20
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, 'midpoint-test')
      ).toBe('20');
    });
  });

  test.describe('maxboostedstep Configuration', () => {
    test('should limit boost step size with maxboostedstep', async ({ page }) => {
      // Create a TouchSpin with maxboostedstep setting
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="maxboost-test" type="text" value="10" data-testid="maxboost-test">');
        $('#maxboost-test').TouchSpin({
          min: 0,
          max: 1000,
          step: 1,
          booster: true,
          boostat: 2, // Start boosting after 2 steps
          maxboostedstep: 5 // Limit boost steps to max 5
        });
      });

      const input = page.getByTestId('maxboost-test');
      await input.focus();

      // Hold down to trigger boosting
      await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const button = container?.querySelector('.bootstrap-touchspin-up');
        if (button) {
          button.dispatchEvent(new Event('mousedown', { bubbles: true }));
        }
      }, 'maxboost-test');

      // Hold long enough to trigger boosting
      await touchspinHelpers.waitForTimeout(800);

      await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const button = container?.querySelector('.bootstrap-touchspin-up');
        if (button) {
          button.dispatchEvent(new Event('mouseup', { bubbles: true }));
        }
      }, 'maxboost-test');

      // Verify boosting occurred but was limited
      await expect.poll(
        async () => {
          const value = await touchspinHelpers.readInputValue(page, 'maxboost-test');
          return parseInt(value || '10');
        }
      ).toBeGreaterThan(10); // Should have increased

      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, 'maxboost-test') || '10');
      expect(finalValue).toBeLessThan(50); // But not too much due to maxboostedstep limit
    });

    test('should handle maxboostedstep=false (unlimited)', async ({ page }) => {
      // Create a TouchSpin with maxboostedstep disabled
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="unlimited-boost-test" type="text" value="10" data-testid="unlimited-boost-test">');
        $('#unlimited-boost-test').TouchSpin({
          min: 0,
          max: 1000,
          step: 1,
          booster: true,
          boostat: 2,
          maxboostedstep: false // No limit
        });
      });

      // This should work without throwing errors
      const input = page.getByTestId('unlimited-boost-test');
      await input.focus();

      // Quick test to ensure it works
      await touchspinHelpers.clickUpButton(page, 'unlimited-boost-test');

      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, 'unlimited-boost-test')
      ).toBe('11'); // Simple increment
    });

    test('should handle invalid maxboostedstep values', async ({ page }) => {
      // Test that invalid maxboostedstep values are handled gracefully
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="invalid-boost-test" type="text" value="10" data-testid="invalid-boost-test">');
        $('#invalid-boost-test').TouchSpin({
          min: 0,
          max: 100,
          step: 1,
          booster: true,
          maxboostedstep: 'invalid' as any // Invalid value
        });
      });

      // Should still work without errors
      await touchspinHelpers.clickUpButton(page, 'invalid-boost-test');

      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, 'invalid-boost-test')
      ).toBe('11');
    });
  });

  test.describe('Data Attribute Conflict Warnings', () => {
    test('should warn when both data-bts and individual attributes are present', async ({ page }) => {
      // Capture console warnings
      const consoleMessages: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'warning') {
          consoleMessages.push(msg.text());
        }
      });

      // Create input with conflicting attributes
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append(`
          <input id="conflict-test" type="text" value="50"
                 data-bts-min="10" min="20"
                 data-bts-max="90" max="80"
                 data-testid="conflict-test">
        `);
        $('#conflict-test').TouchSpin();
      });

      // Check that warnings were logged (specific text may vary)
      await expect.poll(() => consoleMessages.length).toBeGreaterThan(0);
      await expect.poll(
        () => consoleMessages.some(msg => msg.includes('data-bts-'))
      ).toBe(true);
    });
  });

  test.describe('Error Handling Scenarios', () => {
    test('should handle missing default renderer gracefully', async ({ page }) => {
      // Test what happens when no default renderer is available (modern architecture)
      const consoleMessages: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'warning') {
          consoleMessages.push(msg.text());
        }
      });

      await page.evaluate(() => {
        // Temporarily hide default renderer
        const originalDefault = (globalThis as any).TouchSpinDefaultRenderer;
        delete (globalThis as any).TouchSpinDefaultRenderer;

        const $ = (window as any).jQuery;
        $('body').append('<input id="no-renderer-test" type="text" value="50" data-testid="no-renderer-test">');
        $('#no-renderer-test').TouchSpin();

        // Restore default renderer
        (globalThis as any).TouchSpinDefaultRenderer = originalDefault;
      });

      // Should warn about no renderer
      await expect.poll(
        () => consoleMessages.some(msg => msg.includes('No renderer specified'))
      ).toBe(true);
    });

    test('should handle non-input elements appropriately', async ({ page }) => {
      // Capture console warnings (non-input elements trigger console.warn)
      const consoleMessages: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'warning') {
          consoleMessages.push(msg.text());
        }
      });

      // Try to initialize TouchSpin on a div (not an input)
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<div id="not-input-test">Not an input</div>');
        $('#not-input-test').TouchSpin();
      });

      // Should log "Must be an input."
      await expect.poll(
        () => consoleMessages.some(msg => msg.includes('Must be an input'))
      ).toBe(true);
    });

    test('should handle renderer constructor failure', async ({ page }) => {
      const errorMessage = await page.evaluate(() => {
        try {
          // Create a renderer class that throws in constructor
          class FailingRenderer {
            constructor() {
              throw new Error('Renderer constructor failed');
            }
          }

          const $ = (window as any).jQuery;
          $('body').append('<input id="renderer-fail-test" type="text" value="50" data-testid="renderer-fail-test">');
          $('#renderer-fail-test').TouchSpin({
            renderer: FailingRenderer
          });

          return null;
        } catch (error: any) {
          return error.message;
        }
      });

      expect(errorMessage).toContain('Renderer constructor failed');
    });
  });

  test.describe('Edge Case Configurations', () => {
    test('should handle step divisibility edge cases', async ({ page }) => {
      // Test different forcestepdivisibility modes
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="step-edge-test" type="text" value="0" data-testid="step-edge-test">');
        $('#step-edge-test').TouchSpin({
          min: 0,
          max: 100,
          step: 3,
          forcestepdivisibility: 'ceil' // Test ceil mode
        });
      });

      // Enter a value that doesn't align with step
      await touchspinHelpers.fillWithValue(page, 'step-edge-test', '5');
      await page.keyboard.press('Tab');

      // Should round up to next step multiple (6)
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, 'step-edge-test')
      ).toBe('6');
    });

    test('should handle empty input with replacementval', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="replacement-test" type="text" value="" data-testid="replacement-test">');
        $('#replacement-test').TouchSpin({
          min: 0,
          max: 100,
          replacementval: '25'
        });
      });

      // Focus and blur empty input
      const input = page.getByTestId('replacement-test');
      await input.focus();
      await input.blur();

      // Should use replacement value
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, 'replacement-test')
      ).toBe('25');
    });

    test('should handle decimal edge cases', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="decimal-edge-test" type="text" value="1.999" data-testid="decimal-edge-test">');
        $('#decimal-edge-test').TouchSpin({
          min: 0,
          max: 10,
          step: 0.1,
          decimals: 1
        });
      });

      // Value should be formatted to 1 decimal place
      const input = page.getByTestId('decimal-edge-test');
      await input.focus();
      await input.blur();

      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, 'decimal-edge-test')
      ).toBe('2.0');
    });
  });

  test.describe('Event Edge Cases', () => {
    test('should handle rapid successive button clicks', async ({ page }) => {
      const testid = 'touchspin-default';

      // Perform rapid clicks
      for (let i = 0; i < 5; i++) {
        await touchspinHelpers.clickUpButton(page, testid);
      }

      // Should handle all clicks without errors
      await expect.poll(
        async () => {
          const value = await touchspinHelpers.readInputValue(page, testid);
          return parseInt(value || '50');
        }
      ).toBeGreaterThanOrEqual(55); // 50 + 5 clicks
    });

    test('should handle mouse wheel on disabled input', async ({ page }) => {
      // Test mousewheel on disabled input
      const input = page.getByTestId('touchspin-disabled');

      // Try to scroll on disabled input
      await input.focus();
      await input.evaluate((el) => {
        el.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, bubbles: true }));
      });

      // Value should not change (input is disabled)
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, 'touchspin-disabled')
      ).toBe('0');
    });
  });

  test.describe('Cleanup and Memory', () => {
    test('should handle multiple destroy calls safely', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="multi-destroy-test" type="text" value="50" data-testid="multi-destroy-test">');
        const $input = $('#multi-destroy-test');

        // Initialize TouchSpin
        $input.TouchSpin();

        // Call destroy multiple times
        $input.trigger('touchspin.destroy');
        $input.trigger('touchspin.destroy');
        $input.trigger('touchspin.destroy');
      });

      // Input should still exist and be functional as regular input
      const input = page.getByTestId('multi-destroy-test');
      await input.fill('123');
      await expect.poll(async () => input.inputValue()).toBe('123');
    });
  });
});
