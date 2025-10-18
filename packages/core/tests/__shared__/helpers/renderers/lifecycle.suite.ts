import { expect, test } from '@playwright/test';
import { initializeTouchspinFromGlobals } from '../core/initialization';
import * as apiHelpers from '../index';
import { installDomHelpers } from '../runtime/installDomHelpers';
import { waitForPageReady } from '../test-utilities/wait';
import type { RendererSuiteOptions } from './universal-renderer.suite';

// Extend window interface for test event logging
declare global {
  interface Window {
    userEventLog?: string[];
  }
}

/**
 * Shared lifecycle test suite for renderer destroy/reinit behavior
 *
 * Tests that all renderers properly:
 * - Clean up injected DOM elements
 * - Preserve user-added elements, classes, attributes
 * - Preserve user event listeners
 * - Support multiple destroy/reinit cycles
 */
export function lifecycleRendererSuite(
  name: string,
  rendererUrl: string,
  fixturePath: string,
  options: RendererSuiteOptions = {}
) {
  test.describe(`Lifecycle: ${name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(fixturePath);
      if (options.setupGlobals) {
        await options.setupGlobals(page);
      }
      await waitForPageReady(page);
      await installDomHelpers(page);
    });

    test('basic destroy/reinit cycle preserves input and restores DOM', async ({ page }) => {
      // Initialize
      await initializeTouchspinFromGlobals(page, 'test-input', {
        buttonup_txt: 'UP',
        buttondown_txt: 'DOWN',
      });

      // Verify initialized
      expect(await apiHelpers.isTouchSpinInitialized(page, 'test-input')).toBe(true);
      const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
      await expect(elements.upButton).toBeVisible();

      // Destroy
      await page.evaluate((testId) => {
        window.__ts?.requireCoreByTestId(testId).destroy();
      }, 'test-input');

      // Verify destroyed
      expect(await apiHelpers.isTouchSpinInitialized(page, 'test-input')).toBe(false);

      // Input should still exist
      const input = page.getByTestId('test-input');
      await expect(input).toBeVisible();

      // Buttons should be gone
      await expect(elements.upButton).toBeHidden();

      // Reinitialize
      await initializeTouchspinFromGlobals(page, 'test-input', {
        buttonup_txt: 'UP2',
        buttondown_txt: 'DOWN2',
      });

      // Verify reinitialized
      expect(await apiHelpers.isTouchSpinInitialized(page, 'test-input')).toBe(true);
      const newElements = await apiHelpers.getTouchSpinElements(page, 'test-input');
      await expect(newElements.upButton).toBeVisible();
      await expect(newElements.upButton).toHaveText('UP2');
    });

    test('preserves user classes on input across destroy/reinit', async ({ page }) => {
      // Add user classes to input
      await page.evaluate(() => {
        const input = document.getElementById('test-input') as HTMLInputElement;
        input.classList.add('user-class-1', 'user-class-2');
      });

      // Initialize
      await initializeTouchspinFromGlobals(page, 'test-input', {});

      // Verify user classes still present
      const input = page.getByTestId('test-input');
      await expect(input).toHaveClass(/user-class-1/);
      await expect(input).toHaveClass(/user-class-2/);

      // Destroy
      await page.evaluate((testId) => {
        window.__ts?.requireCoreByTestId(testId).destroy();
      }, 'test-input');

      // User classes should still be present
      await expect(input).toHaveClass(/user-class-1/);
      await expect(input).toHaveClass(/user-class-2/);

      // Reinitialize
      await initializeTouchspinFromGlobals(page, 'test-input', {});

      // User classes should STILL be present
      await expect(input).toHaveClass(/user-class-1/);
      await expect(input).toHaveClass(/user-class-2/);
    });

    test('preserves user attributes on input across destroy/reinit', async ({ page }) => {
      // Add user attributes to input
      await page.evaluate(() => {
        const input = document.getElementById('test-input') as HTMLInputElement;
        input.setAttribute('data-user-attr', 'user-value');
        input.setAttribute('data-custom', 'custom-value');
      });

      // Initialize
      await initializeTouchspinFromGlobals(page, 'test-input', {});

      // Verify user attributes still present
      const input = page.getByTestId('test-input');
      await expect(input).toHaveAttribute('data-user-attr', 'user-value');
      await expect(input).toHaveAttribute('data-custom', 'custom-value');

      // Destroy
      await page.evaluate((testId) => {
        window.__ts?.requireCoreByTestId(testId).destroy();
      }, 'test-input');

      // User attributes should still be present
      await expect(input).toHaveAttribute('data-user-attr', 'user-value');
      await expect(input).toHaveAttribute('data-custom', 'custom-value');

      // Reinitialize
      await initializeTouchspinFromGlobals(page, 'test-input', {});

      // User attributes should STILL be present
      await expect(input).toHaveAttribute('data-user-attr', 'user-value');
      await expect(input).toHaveAttribute('data-custom', 'custom-value');
    });

    test('preserves user event listeners across destroy/reinit', async ({ page }) => {
      // Add event log to window for tracking
      await page.evaluate(() => {
        window.userEventLog = [];
      });

      // Add user event listener to input
      await page.evaluate(() => {
        const input = document.getElementById('test-input') as HTMLInputElement;
        input.addEventListener('change', () => {
          window.userEventLog.push('USER_CHANGE_FIRED');
        });
      });

      // Initialize
      await initializeTouchspinFromGlobals(page, 'test-input', {});

      // Trigger change event
      await page.evaluate(() => {
        const input = document.getElementById('test-input') as HTMLInputElement;
        input.value = '50';
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });

      // Verify user handler fired
      let logs = await page.evaluate(() => window.userEventLog);
      expect(logs).toContain('USER_CHANGE_FIRED');

      // Clear log
      await page.evaluate(() => {
        window.userEventLog = [];
      });

      // Destroy
      await page.evaluate((testId) => {
        window.__ts?.requireCoreByTestId(testId).destroy();
      }, 'test-input');

      // Trigger change event again
      await page.evaluate(() => {
        const input = document.getElementById('test-input') as HTMLInputElement;
        input.value = '100';
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });

      // User handler should STILL fire (listener preserved)
      logs = await page.evaluate(() => window.userEventLog);
      expect(logs).toContain('USER_CHANGE_FIRED');

      // Clear log
      await page.evaluate(() => {
        window.userEventLog = [];
      });

      // Reinitialize
      await initializeTouchspinFromGlobals(page, 'test-input', {});

      // Trigger change event again
      await page.evaluate(() => {
        const input = document.getElementById('test-input') as HTMLInputElement;
        input.value = '150';
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });

      // User handler should STILL fire after reinit
      logs = await page.evaluate(() => window.userEventLog);
      expect(logs).toContain('USER_CHANGE_FIRED');
    });

    test('supports multiple destroy/reinit cycles (3x)', async ({ page }) => {
      // Add user classes and attributes
      await page.evaluate(() => {
        const input = document.getElementById('test-input') as HTMLInputElement;
        input.classList.add('persistent-class');
        input.setAttribute('data-persistent', 'value');
      });

      const input = page.getByTestId('test-input');

      // Cycle 1
      await initializeTouchspinFromGlobals(page, 'test-input', { buttonup_txt: 'UP1' });
      expect(await apiHelpers.isTouchSpinInitialized(page, 'test-input')).toBe(true);
      await expect(input).toHaveClass(/persistent-class/);
      await expect(input).toHaveAttribute('data-persistent', 'value');

      await page.evaluate((testId) => {
        window.__ts?.requireCoreByTestId(testId).destroy();
      }, 'test-input');
      expect(await apiHelpers.isTouchSpinInitialized(page, 'test-input')).toBe(false);
      await expect(input).toHaveClass(/persistent-class/);
      await expect(input).toHaveAttribute('data-persistent', 'value');

      // Cycle 2
      await initializeTouchspinFromGlobals(page, 'test-input', { buttonup_txt: 'UP2' });
      expect(await apiHelpers.isTouchSpinInitialized(page, 'test-input')).toBe(true);
      await expect(input).toHaveClass(/persistent-class/);
      await expect(input).toHaveAttribute('data-persistent', 'value');

      await page.evaluate((testId) => {
        window.__ts?.requireCoreByTestId(testId).destroy();
      }, 'test-input');
      expect(await apiHelpers.isTouchSpinInitialized(page, 'test-input')).toBe(false);
      await expect(input).toHaveClass(/persistent-class/);
      await expect(input).toHaveAttribute('data-persistent', 'value');

      // Cycle 3
      await initializeTouchspinFromGlobals(page, 'test-input', { buttonup_txt: 'UP3' });
      expect(await apiHelpers.isTouchSpinInitialized(page, 'test-input')).toBe(true);
      await expect(input).toHaveClass(/persistent-class/);
      await expect(input).toHaveAttribute('data-persistent', 'value');

      await page.evaluate((testId) => {
        window.__ts?.requireCoreByTestId(testId).destroy();
      }, 'test-input');
      expect(await apiHelpers.isTouchSpinInitialized(page, 'test-input')).toBe(false);
      await expect(input).toHaveClass(/persistent-class/);
      await expect(input).toHaveAttribute('data-persistent', 'value');
    });

    test('input value persists across destroy/reinit', async ({ page }) => {
      await initializeTouchspinFromGlobals(page, 'test-input', { initval: 50 });

      // Set value via API
      await apiHelpers.setValueViaAPI(page, 'test-input', 75);
      await apiHelpers.expectValueToBe(page, 'test-input', '75');

      // Destroy
      await page.evaluate((testId) => {
        window.__ts?.requireCoreByTestId(testId).destroy();
      }, 'test-input');

      // Value should still be in DOM
      const inputValue = await page.evaluate(() => {
        const input = document.getElementById('test-input') as HTMLInputElement;
        return input.value;
      });
      expect(inputValue).toBe('75');

      // Reinitialize
      await initializeTouchspinFromGlobals(page, 'test-input', {});

      // Value should be preserved and normalized
      const finalValue = await apiHelpers.getNumericValue(page, 'test-input');
      expect(finalValue).toBe(75);
    });

    test('functionality works correctly after reinit', async ({ page }) => {
      // Initialize
      await initializeTouchspinFromGlobals(page, 'test-input', { step: 5, initval: 10 });

      // Test increment
      await apiHelpers.incrementViaAPI(page, 'test-input');
      await apiHelpers.expectValueToBe(page, 'test-input', '15');

      // Destroy
      await page.evaluate((testId) => {
        window.__ts?.requireCoreByTestId(testId).destroy();
      }, 'test-input');

      // Reinitialize with different settings
      await initializeTouchspinFromGlobals(page, 'test-input', { step: 10, initval: 20 });

      // Test increment with new settings
      await apiHelpers.incrementViaAPI(page, 'test-input');
      await apiHelpers.expectValueToBe(page, 'test-input', '30');

      // Test button clicks
      await apiHelpers.clickUpButton(page, 'test-input');
      await apiHelpers.expectValueToBe(page, 'test-input', '40');

      await apiHelpers.clickDownButton(page, 'test-input');
      await apiHelpers.expectValueToBe(page, 'test-input', '30');
    });
  });
}
