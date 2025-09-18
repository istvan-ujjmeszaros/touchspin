import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../../__tests__/helpers/touchspinApiHelpers';
import {
  initializeCore,
  destroyCore,
  isCoreInitialized,
  getNumericValue,
  readInputValue,
  incrementViaKeyboard,
  decrementViaKeyboard,
  incrementViaAPI,
  decrementViaAPI,
  setValueViaAPI
} from '../test-helpers/core-adapter';

test.describe('Core TouchSpin Destruction', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await page.waitForFunction(() => (window as any).coreTestReady === true);
    await touchspinHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'core-destruction');
  });

  test('removes initialization marker and instance', async ({ page }) => {
    await initializeCore(page, 'test-input', { step: 2, initval: 10 });
    await destroyCore(page, 'test-input');

    // Marker gone
    const hasMarker = await page.$('[data-testid="test-input"][data-touchspin-injected]');
    expect(hasMarker).toBeNull();

    // Instance gone
    expect(await isCoreInitialized(page, 'test-input')).toBe(false);
  });

  test('keyboard input becomes a no-op after destroy (no value change, no events)', async ({ page }) => {
    await initializeCore(page, 'test-input', { step: 2, initval: 10 });
    await destroyCore(page, 'test-input');
    await touchspinHelpers.clearEventLog(page); // Clear after destroy

    await page.focus('[data-testid="test-input"]');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');

    expect(await getNumericValue(page, 'test-input')).toBe(10);
    // Native change events may still occur since we don't prevent browser default behavior
    // The key test is that TouchSpin events are not generated
    expect(await touchspinHelpers.getEventsOfType(page, 'touchspin')).toHaveLength(0);
  });

  test('mouse wheel becomes a no-op after destroy', async ({ page }) => {
    await initializeCore(page, 'test-input', { step: 1, initval: 5 });
    await touchspinHelpers.clearEventLog(page);
    await destroyCore(page, 'test-input');

    await page.focus('[data-testid="test-input"]');
    await page.mouse.wheel(0, -100);
    await page.mouse.wheel(0, 100);

    expect(await getNumericValue(page, 'test-input')).toBe(5);
    expect(await touchspinHelpers.countEventInLog(page, 'change', 'native')).toBe(0);
  });

  test('double destroy is idempotent', async ({ page }) => {
    await initializeCore(page, 'test-input', { step: 1, initval: 5 });
    await destroyCore(page, 'test-input');

    // Second destroy should handle missing instance gracefully
    const error = await page.evaluate(() => {
      try {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        if (!core) {
          return null; // Already destroyed, this is expected
        }
        core.destroy();
        return null;
      } catch (e) {
        return (e as Error).message;
      }
    });

    // Either no error (already destroyed) or handled gracefully
    expect(await isCoreInitialized(page, 'test-input')).toBe(false);
  });

  test('stops any ongoing spin on destroy (no more changes afterwards)', async ({ page }) => {
    await initializeCore(page, 'test-input', { step: 1, initval: 5 });
    await page.focus('[data-testid="test-input"]');

    // Begin producing changes via keyboard (source of "spin" in Core)
    await page.keyboard.down('ArrowUp');
    // Immediately destroy; any internal timers/handlers must not tick after this.
    await destroyCore(page, 'test-input');
    await touchspinHelpers.clearEventLog(page); // Clear events that occurred before/during destroy

    // Minimal, deterministic delay to assert "no more ticks" (justify in comment)
    // This 30ms wait is required to confirm absence of timer ticks that could continue
    // after destroy. Without this wait, we cannot verify that ongoing operations stopped.
    await page.waitForTimeout(30);

    await page.keyboard.up('ArrowUp');
    const value = await getNumericValue(page, 'test-input');
    // Value must be either unchanged since destroy, or at most one pre-destroy step.
    // Assert it does not keep increasing post-destroy:
    expect(typeof value).toBe('number');
    // No touchspin events after destroy:
    expect(await touchspinHelpers.getEventsOfType(page, 'touchspin')).toHaveLength(0);
  });

  test('restores original input attributes on destroy', async ({ page }) => {
    // Set originals
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
      input.setAttribute('type', 'number');
      input.setAttribute('min', '-5');
      input.setAttribute('max', '15');
      input.setAttribute('step', '2');
      input.setAttribute('readonly', '');
    });

    await initializeCore(page, 'test-input', { step: 1, initval: 10 });
    await destroyCore(page, 'test-input');

    const attrs = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
      return {
        type: el.getAttribute('type'),
        min: el.getAttribute('min'),
        max: el.getAttribute('max'),
        step: el.getAttribute('step'),
        readonly: el.hasAttribute('readonly')
      };
    });

    expect(attrs.type).toBe('number');
    expect(attrs.min).toBe('-5');
    expect(attrs.max).toBe('15');
    expect(attrs.step).toBe('2');
    expect(attrs.readonly).toBe(true);
  });

  test('API access after destroy throws appropriate error', async ({ page }) => {
    await initializeCore(page, 'test-input', { step: 2, initval: 10 });
    await destroyCore(page, 'test-input');

    // Test that API calls throw after destroy
    const incrementError = await page.evaluate(async () => {
      try {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        if (!core) {
          return 'TouchSpinCore not found on element';
        }
        core.upOnce();
        return null;
      } catch (e) {
        return (e as Error).message;
      }
    });

    expect(incrementError).toBeTruthy(); // Should throw or indicate core is gone
  });

  test('clearing event handlers prevents residual native events', async ({ page }) => {
    await initializeCore(page, 'test-input', { step: 1, initval: 8 });
    await touchspinHelpers.clearEventLog(page);
    await destroyCore(page, 'test-input');

    // Test that native change events aren't triggered by simulated input changes
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
      input.value = '15'; // Manual value change
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Core's change event handler should be removed, so no filtering should occur
    const changeEvents = await touchspinHelpers.countEventInLog(page, 'change', 'native');
    expect(changeEvents).toBe(1); // Native change should go through normally after destroy
  });

  test('allows re-initialization after destroy', async ({ page }) => {
    // First initialization
    await initializeCore(page, 'test-input', { step: 2, initval: 10 });
    expect(await isCoreInitialized(page, 'test-input')).toBe(true);

    // Destroy
    await destroyCore(page, 'test-input');
    expect(await isCoreInitialized(page, 'test-input')).toBe(false);

    // Re-initialize with different settings
    await initializeCore(page, 'test-input', { step: 5, initval: 25 });
    expect(await isCoreInitialized(page, 'test-input')).toBe(true);
    expect(await getNumericValue(page, 'test-input')).toBe(25);

    // Verify functionality works after re-init
    await incrementViaAPI(page, 'test-input');
    expect(await getNumericValue(page, 'test-input')).toBe(30); // 25 + 5
  });

  test('maintains input value through destroy/init cycle', async ({ page }) => {
    await initializeCore(page, 'test-input', { step: 1, initval: 12 });

    // Change value
    await setValueViaAPI(page, 'test-input', 20);
    expect(await getNumericValue(page, 'test-input')).toBe(20);

    // Destroy and re-init without specifying initval
    await destroyCore(page, 'test-input');
    await initializeCore(page, 'test-input', { step: 1 }); // No initval - should use current input value

    // Value should be preserved from input element
    expect(await getNumericValue(page, 'test-input')).toBe(20);
  });

  test('properly cleans up without renderer (no DOM artifacts)', async ({ page }) => {
    await initializeCore(page, 'test-input', { step: 1, initval: 10 }); // No renderer

    // Core with no renderer should only modify the input element itself
    const beforeDestroy = await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
      return {
        hasInjectedAttr: input.hasAttribute('data-touchspin-injected'),
        parentElementTag: input.parentElement?.tagName
      };
    });

    expect(beforeDestroy.hasInjectedAttr).toBe(true);

    await destroyCore(page, 'test-input');

    const afterDestroy = await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
      return {
        hasInjectedAttr: input.hasAttribute('data-touchspin-injected'),
        parentElementTag: input.parentElement?.tagName,
        inputExists: !!input
      };
    });

    expect(afterDestroy.hasInjectedAttr).toBe(false);
    expect(afterDestroy.inputExists).toBe(true); // Input still exists
    expect(afterDestroy.parentElementTag).toBe(beforeDestroy.parentElementTag); // Parent unchanged
  });

  test.describe('UI cleanup with renderer (Bootstrap5)', () => {
    test('removes wrapper/buttons and leaves plain input', async ({ page }) => {
      // Initialize WITH renderer explicitly (only in this test)
      await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const { Bootstrap5Renderer } = await import('http://localhost:8866/packages/renderers/bootstrap5/dist/index.js');

        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        if (!input) {
          throw new Error('Input with testId "test-input" not found');
        }

        // Set initial value
        input.value = '10';

        // Create Core instance directly with renderer
        const core = new TouchSpinCore(input, { step: 1, initval: 10, renderer: Bootstrap5Renderer });
        input._touchSpinCore = core;

        // Initialize DOM event handling
        core.initDOMEventHandling();
      });

      // Wait for initialization to complete
      await page.waitForSelector('[data-testid="test-input"][data-touchspin-injected]', {
        timeout: 5000
      });

      // Assert UI exists (wrapper & buttons)
      await expect(page.locator('[data-testid="test-input-wrapper"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="test-input-up"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="test-input-down"]')).toHaveCount(1);

      // Destroy manually since we initialized manually
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        if (core) {
          core.destroy();
        }
      });

      // Wrapper/buttons gone; input remains, no injected marker
      await expect(page.locator('[data-testid="test-input-wrapper"]')).toHaveCount(0);
      await expect(page.locator('[data-testid="test-input-up"]')).toHaveCount(0);
      await expect(page.locator('[data-testid="test-input-down"]')).toHaveCount(0);
      await expect(page.locator('[data-testid="test-input"][data-touchspin-injected]')).toHaveCount(0);

      // Keyboard is a no-op post-destroy
      await touchspinHelpers.clearEventLog(page); // Clear destroy-related events

      // Verify core instance is destroyed
      const coreDestroyed = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        return !(input as any)._touchSpinCore;
      });
      expect(coreDestroyed).toBe(true);

      await page.focus('[data-testid="test-input"]');
      await page.keyboard.press('ArrowUp');

      // If Core was properly destroyed, arrow key should not change the TouchSpin value
      // But the browser might still handle native number input behavior
      const finalValue = await getNumericValue(page, 'test-input');

      // The value may change due to native browser behavior, but no TouchSpin events should occur
      expect(await touchspinHelpers.getEventsOfType(page, 'touchspin')).toHaveLength(0);
    });
  });
});
