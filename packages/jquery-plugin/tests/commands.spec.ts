/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';
import * as apiHelpers from '../../../__tests__/helpers/touchspinApiHelpers';
import * as jqueryHelpers from '../../../__tests__/helpers/touchspinJqueryHelpers';
import '../../../__tests__/coverage.hooks';

test.describe('jQuery TouchSpin Commands API', () => {

  test.beforeEach(async ({ page }) => {
    // Reload page for each test to ensure clean state
    await page.goto('http://localhost:8866/packages/jquery-plugin/tests/html/test-fixture.html');
    await apiHelpers.waitForPageReady(page, 'testPageReady');
    await apiHelpers.installJqueryPlugin(page);
    await apiHelpers.waitForTouchSpinPluginReady(page);
  });

  test.describe('Plugin Initialization', () => {

    test('should initialize TouchSpin on element', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', {});

      // TouchSpin should be properly initialized with wrapper
      expect(await apiHelpers.isTouchSpinInitialized(page, 'test-input')).toBe(true);

      // Should have up and down buttons with correct test IDs
      const elements = await apiHelpers.getTouchSpinElementsStrict(page, 'test-input');
      expect(await elements.upButton.count()).toBe(1);
      expect(await elements.downButton.count()).toBe(1);
    });

    test('should initialize with custom settings', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', {
        prefix: '$',
        postfix: '.00'
      });

      // TouchSpin should be initialized
      expect(await apiHelpers.isTouchSpinInitialized(page, 'test-input')).toBe(true);

      // Settings should be applied with correct test IDs
      const elements = await apiHelpers.getTouchSpinElementsStrict(page, 'test-input');
      expect(await elements.prefix.textContent()).toBe('$');
      expect(await elements.postfix.textContent()).toBe('.00');
    });
  });

  test.describe('Value Commands', () => {

    test('should get value using get command', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', {});

      const value = await jqueryHelpers.jQueryGetValue(page, 'test-input');

      expect(value).toBe(50); // Default test input value
    });

    test('should get value using getvalue command alias', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', {});

      const value = await jqueryHelpers.jQueryTouchSpin(page, 'test-input', 'getvalue');

      expect(value).toBe(50); // Default test input value
    });

    test('should set value using set command', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', {});

      await jqueryHelpers.jQuerySetValue(page, 'test-input', 75);

      expect(await apiHelpers.readInputValue(page, 'test-input')).toBe('75');
    });

    test('should set value using setvalue command alias', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', {});

      await jqueryHelpers.jQueryTouchSpin(page, 'test-input', 'setvalue', 25);

      expect(await apiHelpers.readInputValue(page, 'test-input')).toBe('25');
    });

    test('should return raw value when not initialized', async ({ page }) => {
      // Don't initialize TouchSpin - test graceful handling
      const value = await jqueryHelpers.jQueryGetValue(page, 'test-input');

      expect(value).toBe('50'); // Raw input value as string
    });
  });

  test.describe('Increment/Decrement Commands', () => {

    test('should increment using uponce command', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', { step: 5 });

      await jqueryHelpers.jQueryUpOnce(page, 'test-input');

      expect(await apiHelpers.readInputValue(page, 'test-input')).toBe('55'); // 50 + 5
    });

    test('should decrement using downonce command', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', { step: 3 });

      await jqueryHelpers.jQueryDownOnce(page, 'test-input');

      expect(await apiHelpers.readInputValue(page, 'test-input')).toBe('48'); // 50 - 3, rounded to step
    });
  });

  test.describe('Continuous Spinning Commands', () => {

    test('should start up spin using startupspin command', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', { step: 1 });

      await jqueryHelpers.jQueryStartUpSpin(page, 'test-input');

      // Wait briefly for spinning to start
      await apiHelpers.waitForTimeout(100);

      await jqueryHelpers.jQueryStopSpin(page, 'test-input');

      const finalValue = parseInt(await apiHelpers.readInputValue(page, 'test-input'));
      expect(finalValue).toBeGreaterThan(50); // Should have increased
    });

    test('should start down spin using startdownspin command', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', { step: 1 });

      await jqueryHelpers.jQueryStartDownSpin(page, 'test-input');

      // Wait briefly for spinning to start
      await apiHelpers.waitForTimeout(100);

      await jqueryHelpers.jQueryStopSpin(page, 'test-input');

      const finalValue = parseInt(await apiHelpers.readInputValue(page, 'test-input'));
      expect(finalValue).toBeLessThan(50); // Should have decreased
    });

    test('should stop spinning using stopspin command', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', { step: 1 });

      // Start spinning
      await jqueryHelpers.jQueryStartUpSpin(page, 'test-input');

      await apiHelpers.waitForTimeout(100);

      // Stop and capture value
      await jqueryHelpers.jQueryStopSpin(page, 'test-input');

      const stoppedValue = await apiHelpers.readInputValue(page, 'test-input');

      // Wait more to ensure it really stopped
      await apiHelpers.waitForTimeout(200);

      const finalValue = await apiHelpers.readInputValue(page, 'test-input');
      expect(finalValue).toBe(stoppedValue); // Should not have changed after stop
    });
  });

  test.describe('Settings Commands', () => {

    test('should update settings using updatesettings command', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', {});

      await jqueryHelpers.jQueryUpdateSettings(page, 'test-input', {
        prefix: '€',
        step: 10
      });

      // Prefix should be updated
      const elements = await apiHelpers.getTouchSpinElementsStrict(page, 'test-input');
      expect(await elements.prefix.textContent()).toBe('€');

      // Step setting should work
      await jqueryHelpers.jQueryUpOnce(page, 'test-input');

      expect(await apiHelpers.readInputValue(page, 'test-input')).toBe('60'); // 50 + 10
    });

    test('should add prefix through settings update', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', {});

      await jqueryHelpers.jQueryUpdateSettings(page, 'test-input', {
        prefix: '$'
      });

      // Prefix element should be created
      const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
      expect(await elements.prefix.count()).toBe(1);
      expect(await elements.prefix.textContent()).toBe('$');
    });

    test('should add postfix through settings update', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', {});

      await jqueryHelpers.jQueryUpdateSettings(page, 'test-input', {
        postfix: ' USD'
      });

      // Postfix element should be created
      const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
      expect(await elements.postfix.count()).toBe(1);
      expect(await elements.postfix.textContent()).toBe(' USD');
    });

    test('should update button text through settings', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', {});

      await jqueryHelpers.jQueryUpdateSettings(page, 'test-input', {
        buttondown_txt: 'Less',
        buttonup_txt: 'More'
      });

      // Button texts should be updated
      const elements = await apiHelpers.getTouchSpinElementsStrict(page, 'test-input');
      expect(await elements.downButton.textContent()).toBe('Less');
      expect(await elements.upButton.textContent()).toBe('More');
    });
  });

  test.describe('Destroy Command', () => {

    test('should destroy TouchSpin instance using destroy command', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', {});

      await jqueryHelpers.jQueryDestroy(page, 'test-input');

      // TouchSpin should be destroyed (no wrapper)
      expect(await apiHelpers.isTouchSpinDestroyed(page, 'test-input')).toBe(true);

      // Specific buttons should be removed
      const upButtonCount = await await apiHelpers.getElement(page, 'test-input-up').count();
      const downButtonCount = await await apiHelpers.getElement(page, 'test-input-down').count();
      expect(upButtonCount).toBe(0);
      expect(downButtonCount).toBe(0);

      // Input should still exist
      const inputCount = await await apiHelpers.getElement(page, 'test-input').count();
      expect(inputCount).toBe(1);
    });

    test('should allow reinitializing after destroy', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', {});

      // Destroy
      await jqueryHelpers.jQueryDestroy(page, 'test-input');

      // Reinitialize with different settings
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', {
        prefix: 'NEW',
        step: 20
      });

      // Should work with new settings
      const elements = await apiHelpers.getTouchSpinElementsStrict(page, 'test-input');
      expect(await elements.prefix.textContent()).toBe('NEW');

      await jqueryHelpers.jQueryUpOnce(page, 'test-input');

      expect(await apiHelpers.readInputValue(page, 'test-input')).toBe('80'); // 50 + 10 + 20, corrected to step multiple
    });
  });

  test.describe('jQuery Integration', () => {

    test('should support jQuery method chaining', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', {});

      const isJQuery = await page.evaluate(() => {
        const result = (window as any).$('[data-testid="test-input"]')
          .TouchSpin('set', 60)
          .TouchSpin('uponce');
        return result instanceof (window as any).$;
      });

      expect(isJQuery).toBe(true);
      expect(await apiHelpers.readInputValue(page, 'test-input')).toBe('61'); // 60 + 1
    });

    test('should handle multiple instances independently', async ({ page }) => {
      // Create second input
      await apiHelpers.createAdditionalInput(page, 'input-2', { value: '30' });

      // Initialize both with different settings
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', { step: 5 });
      await apiHelpers.initializeTouchSpinJQuery(page, 'input-2', { step: 3 });

      // Operate on each independently
      await jqueryHelpers.jQueryUpOnce(page, 'test-input');
      await jqueryHelpers.jQueryUpOnce(page, 'input-2');

      expect(await apiHelpers.readInputValue(page, 'test-input')).toBe('55'); // 50 + 5
      expect(await apiHelpers.readInputValue(page, 'input-2')).toBe('33'); // 30 + 3
    });

    test('should destroy specific instance without affecting others', async ({ page }) => {
      // Create second input
      await apiHelpers.createAdditionalInput(page, 'input-2', { value: '30' });

      // Initialize both
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', {});
      await apiHelpers.initializeTouchSpinJQuery(page, 'input-2', {});

      // Destroy first one
      await jqueryHelpers.jQueryDestroy(page, 'test-input');

      // First should be destroyed, second should still work
      expect(await apiHelpers.isTouchSpinDestroyed(page, 'test-input')).toBe(true);
      expect(await apiHelpers.isTouchSpinInitialized(page, 'input-2')).toBe(true);

      // Second instance should still be functional
      await jqueryHelpers.jQueryUpOnce(page, 'input-2');

      expect(await apiHelpers.readInputValue(page, 'input-2')).toBe('31'); // 30 + 1
    });
  });

  test.describe('Error Handling', () => {

    test('should handle invalid commands gracefully', async ({ page }) => {
      await apiHelpers.initializeTouchSpinJQuery(page, 'test-input', {});

      // Invalid command should not throw error
      const noError = await page.evaluate(() => {
        try {
          (window as any).$('[data-testid="test-input"]').TouchSpin('invalidcommand');
          return true;
        } catch {
          return false;
        }
      });

      expect(noError).toBe(true);
    });

    test('should handle commands on non-initialized inputs gracefully', async ({ page }) => {
      // Don't initialize TouchSpin - test graceful handling
      const originalValue = await apiHelpers.readInputValue(page, 'test-input');

      const noError = await page.evaluate(() => {
        try {
          (window as any).$('[data-testid="test-input"]').TouchSpin('uponce');
          (window as any).$('[data-testid="test-input"]').TouchSpin('destroy');
          return true;
        } catch {
          return false;
        }
      });

      expect(noError).toBe(true);
      expect(await apiHelpers.readInputValue(page, 'test-input')).toBe(originalValue); // Should be unchanged
    });
  });
});
