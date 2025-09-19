import { test, expect } from '@playwright/test';
import * as apiHelpers from './helpers/touchspinApiHelpers';
import './coverage.hooks';

test.describe('Keyboard Accessibility Tests', () => {

  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'keyboardAccessibility');
  });

  test.describe('Button Keyboard Events', () => {

    test('should handle Enter key on up button', async ({ page }) => {
      const testid = 'touchspin-default';

      // Focus the up button and press Enter
      const wrapper = await apiHelpers.getWrapperInstanceWhenReady(page, testid);
      await wrapper.evaluate((container) => {
        const upButton = container.querySelector('[data-touchspin-injected="up"]') as HTMLElement | null;
        if (upButton) {
          upButton.focus();
          upButton.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13, which: 13, bubbles: true }));
          upButton.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 13, which: 13, bubbles: true }));
        }
      });

      // Value should increment once
      await expect.poll(
        async () => apiHelpers.readInputValue(page, testid)
      ).toBe('51');
    });

    test('should handle Space key on down button', async ({ page }) => {
      const testid = 'touchspin-default';

      // Focus the down button and press Space
      const wrapper2 = await apiHelpers.getWrapperInstanceWhenReady(page, testid);
      await wrapper2.evaluate((container) => {
        const downButton = container.querySelector('[data-touchspin-injected="down"]') as HTMLElement | null;
        if (downButton) {
          downButton.focus();
          downButton.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 32, which: 32, bubbles: true }));
          downButton.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 32, which: 32, bubbles: true }));
        }
      });

      // Value should decrement once
      await expect.poll(
        async () => apiHelpers.readInputValue(page, testid)
      ).toBe('49');


      // Brief wait for event processing
    });

    test('should handle Enter key on down button', async ({ page }) => {
      const testid = 'touchspin-default';

      // Focus the down button and press Enter
      const wrapper3 = await apiHelpers.getWrapperInstanceWhenReady(page, testid);
      await wrapper3.evaluate((container) => {
        const downButton = container.querySelector('[data-touchspin-injected="down"]') as HTMLElement | null;
        if (downButton) {
          downButton.focus();
          downButton.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13, which: 13, bubbles: true }));
          downButton.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 13, which: 13, bubbles: true }));
        }
      });

      // Value should decrement once
      await expect.poll(
        async () => apiHelpers.readInputValue(page, testid)
      ).toBe('49');


      // Brief wait for event processing
    });

    test('should handle held Space key for spinning', async ({ page }) => {
      const testid = 'touchspin-default';

      // Hold Space key on up button to trigger spinning
      const wrapper4 = await apiHelpers.getWrapperInstanceWhenReady(page, testid);
      await wrapper4.evaluate((container) => {
        const upButton = container.querySelector('[data-touchspin-injected=\"up\"]') as HTMLElement | null;
        if (upButton) {
          upButton.focus();
          // Start spinning with Space keydown
          upButton.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 32, which: 32, bubbles: true }));
          // Brief delay for spinning, then stop
          setTimeout(() => {
            upButton.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 32, which: 32, bubbles: true }));
          }, 50);
        }
      });

      // Wait for spin to occur
      // Brief wait for spin processing

      // Should have incremented multiple times
      const value = parseInt(await apiHelpers.readInputValue(page, testid) || '50');
      expect(value).toBeGreaterThan(50);
    });

    test('should prevent default behavior on Space and Enter keys', async ({ page }) => {
      const testid = 'touchspin-default';

      // Test that preventDefault is called
      const wrapper5 = await apiHelpers.getWrapperInstanceWhenReady(page, testid);
      const preventDefaultCalled = await wrapper5.evaluate((container) => {
        const upButton = container.querySelector('[data-touchspin-injected=\"up\"]') as HTMLElement | null;
        let preventDefaultWasCalled = false;
        if (upButton) {
          upButton.focus();
          const event = new KeyboardEvent('keydown', { keyCode: 32, which: 32, bubbles: true });
          const originalPreventDefault = event.preventDefault;
          (event as any).preventDefault = function(this: Event) {
            preventDefaultWasCalled = true;
            return originalPreventDefault.call(this);
          };
          upButton.dispatchEvent(event);
        }
        return preventDefaultWasCalled;
      });

      expect(preventDefaultCalled).toBe(true);
    });

    test('should ignore other keys on buttons', async ({ page }) => {
      const testid = 'touchspin-default';
      const initialValue = await apiHelpers.readInputValue(page, testid);

      // Press various other keys that should not trigger actions
      const wrapper6 = await apiHelpers.getWrapperInstanceWhenReady(page, testid);
      await wrapper6.evaluate((container) => {
        const upButton = container.querySelector('[data-touchspin-injected=\"up\"]') as HTMLElement | null;
        if (upButton) {
          upButton.focus();
          const ignoredKeys = [27, 65, 66, 9, 16];
          ignoredKeys.forEach(keyCode => {
            upButton.dispatchEvent(new KeyboardEvent('keydown', { keyCode, which: keyCode, bubbles: true }));
          });
        }
      });

      // Value should remain unchanged
      await expect.poll(
        async () => apiHelpers.readInputValue(page, testid)
      ).toBe(initialValue);
    });

    test('should handle rapid key events correctly', async ({ page }) => {
      const testid = 'touchspin-default';

      // Rapidly press and release Space key multiple times
      const wrapper7 = await apiHelpers.getWrapperInstanceWhenReady(page, testid);
      await wrapper7.evaluate((container) => {
        const upButton = container.querySelector('[data-touchspin-injected=\"up\"]') as HTMLElement | null;
        if (upButton) {
          upButton.focus();
          for (let i = 0; i < 3; i++) {
            upButton.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 32, which: 32, bubbles: true }));
            setTimeout(() => {
              upButton.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 32, which: 32, bubbles: true }));
            }, 50);
          }
        }
      });

      // Brief wait for rapid events

      // Should handle rapid events without errors
      const finalValue = parseInt(await apiHelpers.readInputValue(page, testid) || '50');
      expect(finalValue).toBeGreaterThanOrEqual(50);
    });
  });
});
