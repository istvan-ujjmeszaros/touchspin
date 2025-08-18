import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Keyboard Accessibility Tests', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'keyboardAccessibility');
  });

  test.describe('Button Keyboard Events', () => {

    test('should handle Enter key on up button', async ({ page }) => {
      const testid = 'touchspin-default';
      
      // Focus the up button and press Enter
      await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const upButton = container?.querySelector('.bootstrap-touchspin-up');
        if (upButton) {
          (upButton as HTMLElement).focus();
          
          // Simulate Enter keydown
          upButton.dispatchEvent(new KeyboardEvent('keydown', { 
            keyCode: 13, 
            which: 13, 
            bubbles: true 
          }));
        }
      }, testid);

      await touchspinHelpers.waitForTimeout(100);

      // Value should increment once
      expect(await touchspinHelpers.readInputValue(page, testid)).toBe('51');

      // Release Enter key
      await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const upButton = container?.querySelector('.bootstrap-touchspin-up');
        if (upButton) {
          upButton.dispatchEvent(new KeyboardEvent('keyup', { 
            keyCode: 13, 
            which: 13, 
            bubbles: true 
          }));
        }
      }, testid);

      await touchspinHelpers.waitForTimeout(100);
    });

    test('should handle Space key on down button', async ({ page }) => {
      const testid = 'touchspin-default';
      
      // Focus the down button and press Space
      await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const downButton = container?.querySelector('.bootstrap-touchspin-down');
        if (downButton) {
          (downButton as HTMLElement).focus();
          
          // Simulate Space keydown
          downButton.dispatchEvent(new KeyboardEvent('keydown', { 
            keyCode: 32, 
            which: 32, 
            bubbles: true 
          }));
        }
      }, testid);

      await touchspinHelpers.waitForTimeout(100);

      // Value should decrement once
      expect(await touchspinHelpers.readInputValue(page, testid)).toBe('49');

      // Release Space key
      await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const downButton = container?.querySelector('.bootstrap-touchspin-down');
        if (downButton) {
          downButton.dispatchEvent(new KeyboardEvent('keyup', { 
            keyCode: 32, 
            which: 32, 
            bubbles: true 
          }));
        }
      }, testid);

      await touchspinHelpers.waitForTimeout(100);
    });

    test('should handle Enter key on down button', async ({ page }) => {
      const testid = 'touchspin-default';
      
      // Focus the down button and press Enter
      await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const downButton = container?.querySelector('.bootstrap-touchspin-down');
        if (downButton) {
          (downButton as HTMLElement).focus();
          
          // Simulate Enter keydown
          downButton.dispatchEvent(new KeyboardEvent('keydown', { 
            keyCode: 13, 
            which: 13, 
            bubbles: true 
          }));
        }
      }, testid);

      await touchspinHelpers.waitForTimeout(100);

      // Value should decrement once
      expect(await touchspinHelpers.readInputValue(page, testid)).toBe('49');

      // Release Enter key
      await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const downButton = container?.querySelector('.bootstrap-touchspin-down');
        if (downButton) {
          downButton.dispatchEvent(new KeyboardEvent('keyup', { 
            keyCode: 13, 
            which: 13, 
            bubbles: true 
          }));
        }
      }, testid);

      await touchspinHelpers.waitForTimeout(100);
    });

    test('should handle held Space key for spinning', async ({ page }) => {
      const testid = 'touchspin-default';
      
      // Hold Space key on up button to trigger spinning
      await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const upButton = container?.querySelector('.bootstrap-touchspin-up');
        if (upButton) {
          (upButton as HTMLElement).focus();
          
          // Start spinning with Space keydown
          upButton.dispatchEvent(new KeyboardEvent('keydown', { 
            keyCode: 32, 
            which: 32, 
            bubbles: true 
          }));
        }
      }, testid);

      // Wait for spin to occur
      await touchspinHelpers.waitForTimeout(300);

      // Should have incremented multiple times
      const value = parseInt(await touchspinHelpers.readInputValue(page, testid) || '50');
      expect(value).toBeGreaterThan(50);

      // Stop spinning with keyup
      await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const upButton = container?.querySelector('.bootstrap-touchspin-up');
        if (upButton) {
          upButton.dispatchEvent(new KeyboardEvent('keyup', { 
            keyCode: 32, 
            which: 32, 
            bubbles: true 
          }));
        }
      }, testid);

      await touchspinHelpers.waitForTimeout(100);
    });

    test('should prevent default behavior on Space and Enter keys', async ({ page }) => {
      const testid = 'touchspin-default';
      
      // Test that preventDefault is called
      const preventDefaultCalled = await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const upButton = container?.querySelector('.bootstrap-touchspin-up');
        let preventDefaultWasCalled = false;
        
        if (upButton) {
          (upButton as HTMLElement).focus();
          
          // Create event and override preventDefault to detect if it's called
          const event = new KeyboardEvent('keydown', { 
            keyCode: 32, 
            which: 32, 
            bubbles: true 
          });
          
          const originalPreventDefault = event.preventDefault;
          event.preventDefault = function() {
            preventDefaultWasCalled = true;
            originalPreventDefault.call(this);
          };
          
          upButton.dispatchEvent(event);
        }
        
        return preventDefaultWasCalled;
      }, testid);

      expect(preventDefaultCalled).toBe(true);
    });

    test('should ignore other keys on buttons', async ({ page }) => {
      const testid = 'touchspin-default';
      const initialValue = await touchspinHelpers.readInputValue(page, testid);
      
      // Press various other keys that should not trigger actions
      await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const upButton = container?.querySelector('.bootstrap-touchspin-up');
        if (upButton) {
          (upButton as HTMLElement).focus();
          
          // Test various keys that should be ignored
          const ignoredKeys = [27, 65, 66, 9, 16]; // Escape, A, B, Tab, Shift
          
          ignoredKeys.forEach(keyCode => {
            upButton.dispatchEvent(new KeyboardEvent('keydown', { 
              keyCode: keyCode, 
              which: keyCode, 
              bubbles: true 
            }));
          });
        }
      }, testid);

      await touchspinHelpers.waitForTimeout(200);

      // Value should remain unchanged
      expect(await touchspinHelpers.readInputValue(page, testid)).toBe(initialValue);
    });

    test('should handle rapid key events correctly', async ({ page }) => {
      const testid = 'touchspin-default';
      
      // Rapidly press and release Space key multiple times
      await page.evaluate((testId) => {
        const container = document.querySelector(`[data-testid="${testId}-wrapper"]`);
        const upButton = container?.querySelector('.bootstrap-touchspin-up');
        if (upButton) {
          (upButton as HTMLElement).focus();
          
          // Simulate rapid key presses
          for (let i = 0; i < 3; i++) {
            upButton.dispatchEvent(new KeyboardEvent('keydown', { 
              keyCode: 32, 
              which: 32, 
              bubbles: true 
            }));
            
            // Brief pause
            setTimeout(() => {
              upButton.dispatchEvent(new KeyboardEvent('keyup', { 
                keyCode: 32, 
                which: 32, 
                bubbles: true 
              }));
            }, 50);
          }
        }
      }, testid);

      await touchspinHelpers.waitForTimeout(500);

      // Should handle rapid events without errors
      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, testid) || '50');
      expect(finalValue).toBeGreaterThanOrEqual(50);
    });
  });
});