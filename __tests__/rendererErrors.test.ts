import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Renderer Error Handling and Edge Cases', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'rendererErrors');
  });

  test.describe('Abstract Renderer Error Paths', () => {
    test('should throw error when calling abstract renderer methods directly', async ({ page }) => {
      const errorMessages = await page.evaluate(() => {
        const errors: string[] = [];

        try {
          // Try to instantiate AbstractRenderer directly (should fail)
          const AbstractRenderer = (window as any).AbstractRenderer;
          if (AbstractRenderer) {
            const renderer = new AbstractRenderer({}, {}, null);

            // Try calling abstract methods
            try {
              renderer.getVersion();
            } catch (e: any) {
              errors.push(e.message);
            }

            try {
              renderer.getClasses();
            } catch (e: any) {
              errors.push(e.message);
            }

            try {
              renderer.buildAdvancedInputGroup();
            } catch (e: any) {
              errors.push(e.message);
            }

            try {
              renderer.buildInputGroup();
            } catch (e: any) {
              errors.push(e.message);
            }

            try {
              renderer.buildVerticalButtons();
            } catch (e: any) {
              errors.push(e.message);
            }
          }
        } catch (e: any) {
          errors.push(e.message);
        }

        return errors;
      });

      // Should have multiple "must be implemented by subclasses" errors
      expect(errorMessages.length).toBeGreaterThan(0);
      expect(errorMessages.some(msg => msg.includes('must be implemented by subclasses'))).toBe(true);
    });

    test('should handle invalid renderer configuration', async ({ page }) => {
      const errorMessage = await page.evaluate(() => {
        try {
          // Create a mock invalid renderer
          const originalFactory = (window as any).RendererFactory;
          (window as any).RendererFactory = {
            createRenderer: () => ({
              // Missing required methods
              buildInputGroup: null,
              initElements: null
            }),
            getVersion: () => 4
          };

          const $ = (window as any).jQuery;
          $('body').append('<input id="invalid-renderer-test" type="text" value="50" data-testid="invalid-renderer-test">');
          $('#invalid-renderer-test').TouchSpin();

          // Restore original factory
          (window as any).RendererFactory = originalFactory;
          return null;
        } catch (error: any) {
          return error.message;
        }
      });

      expect(errorMessage).toBeTruthy(); // Should have an error
    });

    test('should handle renderer element initialization failure', async ({ page }) => {
      const errorMessage = await page.evaluate(() => {
        try {
          // Mock renderer that fails during element initialization
          const originalFactory = (window as any).RendererFactory;
          (window as any).RendererFactory = {
            createRenderer: () => ({
              buildInputGroup: () => null, // Return null container
              initElements: () => null, // Fail to initialize elements
              hideEmptyPrefixPostfix: () => ({ _detached_prefix: null, _detached_postfix: null }),
              updatePrefixPostfix: () => {}
            }),
            getVersion: () => 4
          };

          const $ = (window as any).jQuery;
          $('body').append('<input id="element-fail-test" type="text" value="50" data-testid="element-fail-test">');
          $('#element-fail-test').TouchSpin();

          // Restore original factory
          (window as any).RendererFactory = originalFactory;
          return null;
        } catch (error: any) {
          return error.message;
        }
      });

      expect(errorMessage).toBeTruthy(); // Should have an error
    });
  });

  test.describe('RendererFactory Error Paths', () => {
    test('should handle RendererFactory fallback error', async ({ page }) => {
      const errorMessage = await page.evaluate(() => {
        try {
          // Test the standalone RendererFactory that should throw error
          const RendererFactory = (window as any).RendererFactory;

          // Temporarily replace with standalone version that should error
          (window as any).RendererFactory = {
            createRenderer: () => {
              throw new Error('TouchSpin: Use version-specific build files (bootstrap-touchspin-bs3.js, bootstrap-touchspin-bs4.js, or bootstrap-touchspin-bs5.js)');
            },
            getVersion: () => {
              throw new Error('TouchSpin: Use version-specific build files');
            }
          };

          const $ = (window as any).jQuery;
          $('body').append('<input id="factory-fail-test" type="text" value="50" data-testid="factory-fail-test">');
          $('#factory-fail-test').TouchSpin();

          // Restore original factory
          (window as any).RendererFactory = RendererFactory;
          return null;
        } catch (error: any) {
          return error.message;
        }
      });

      expect(errorMessage).toContain('Use version-specific build files');
    });
  });

  test.describe('Renderer Compatibility Edge Cases', () => {
    test('should handle custom renderer with missing methods', async ({ page }) => {
      const errorMessage = await page.evaluate(() => {
        try {
          const $ = (window as any).jQuery;
          $('body').append('<input id="custom-renderer-test" type="text" value="50" data-testid="custom-renderer-test">');

          // Try to use TouchSpin with incomplete custom renderer
          $('#custom-renderer-test').TouchSpin({
            renderer: {
              // Missing required methods like buildInputGroup, initElements, etc.
            } as any
          });

          return null;
        } catch (error: any) {
          return error.message;
        }
      });

      expect(errorMessage).toBeTruthy(); // Should have an error
    });

    test('should handle renderer version mismatch scenarios', async ({ page }) => {
      // Test what happens with mismatched Bootstrap versions
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="version-mismatch-test" type="text" value="50" data-testid="version-mismatch-test">');

        // This should work but might produce different markup
        $('#version-mismatch-test').TouchSpin({
          prefix: '$',
          postfix: '.00'
        });
      });

      // Should not throw errors, even if rendering is suboptimal
      const value = await touchspinHelpers.readInputValue(page, 'version-mismatch-test');
      expect(value).toBe('50');
    });
  });

  test.describe('DOM Manipulation Edge Cases', () => {
    test('should handle malformed DOM structures', async ({ page }) => {
      // Test TouchSpin behavior with unusual DOM structures
      await page.evaluate(() => {
        const $ = (window as any).jQuery;

        // Create input inside complex nested structure
        $('body').append(`
          <div class="weird-container" style="position: relative; overflow: hidden;">
            <div class="inner-wrapper" style="display: inline-block;">
              <input id="malformed-dom-test" type="text" value="50" data-testid="malformed-dom-test">
            </div>
          </div>
        `);

        $('#malformed-dom-test').TouchSpin({
          verticalbuttons: true,
          prefix: 'Test'
        });
      });

      // Should still work
      await touchspinHelpers.touchspinClickUp(page, 'malformed-dom-test');
      await touchspinHelpers.waitForTimeout(100);

      expect(await touchspinHelpers.readInputValue(page, 'malformed-dom-test')).toBe('51');
    });

    test('should handle existing input-group modifications', async ({ page }) => {
      // Test behavior when input-group is modified after initialization
      await page.evaluate(() => {
        const $ = (window as any).jQuery;

        // Create input with existing input-group
        $('body').append(`
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text">Existing</span>
            </div>
            <input id="existing-group-test" type="text" value="50" data-testid="existing-group-test">
          </div>
        `);

        $('#existing-group-test').TouchSpin({
          postfix: 'Added'
        });

        // Modify the DOM structure after initialization
        $('.input-group').first().addClass('modified-after-init');
      });

      // Should still function correctly
      await touchspinHelpers.touchspinClickUp(page, 'existing-group-test');
      await touchspinHelpers.waitForTimeout(100);

      expect(await touchspinHelpers.readInputValue(page, 'existing-group-test')).toBe('51');
    });
  });

  test.describe('Memory and Performance Edge Cases', () => {
    test('should handle rapid initialization and destruction', async ({ page }) => {
      await page.evaluate(() => {
        const $ = (window as any).jQuery;

        // Rapidly create and destroy multiple TouchSpins
        for (let i = 0; i < 10; i++) {
          const inputId = `rapid-test-${i}`;
          $('body').append(`<input id="${inputId}" type="text" value="50" data-testid="${inputId}">`);

          const $input = $(`#${inputId}`);
          $input.TouchSpin({ min: 0, max: 100 });
          $input.trigger('touchspin.destroy');
        }
      });

      // Should not cause memory leaks or errors
      await touchspinHelpers.waitForTimeout(200);

      // Create one final test to ensure everything still works
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        $('body').append('<input id="final-test" type="text" value="50" data-testid="final-test">');
        $('#final-test').TouchSpin();
      });

      await touchspinHelpers.touchspinClickUp(page, 'final-test');
      await touchspinHelpers.waitForTimeout(100);
      expect(await touchspinHelpers.readInputValue(page, 'final-test')).toBe('51');
    });
  });
});
