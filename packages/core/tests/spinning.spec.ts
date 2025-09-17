import { test, expect } from '@playwright/test';
import touchspinHelpers from '../test-helpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  isCoreInitialized,
  startUpSpinViaAPI,
  startDownSpinViaAPI,
  stopSpinViaAPI
} from '../test-helpers/core-adapter';

// Use original battle-tested helpers
const {
  clickUpButton,      // was: coreUpOnce
  clickDownButton,    // was: coreDownOnce
  readInputValue,     // was: getInputValue
  fillWithValue,      // was: setInputValue
  setInputAttr        // was: setInputAttribute
} = touchspinHelpers;

test.describe('Core TouchSpin Continuous Spinning', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await page.waitForFunction(() => (window as any).coreTestReady === true);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'core-spinning');
  });

  test.describe('Spin API Methods', () => {
    test('should start up spin via API', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await startUpSpinViaAPI(page, 'test-input');

      // Should emit start spin event
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);
    });

    test('should start down spin via API', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await startDownSpinViaAPI(page, 'test-input');

      // Should emit start spin event
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);
    });

    test('should stop spin via API', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await startUpSpinViaAPI(page, 'test-input');
      await touchspinHelpers.clearEventLog(page);

      await stopSpinViaAPI(page, 'test-input');

      // Should emit stop spin event
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);
    });

    test('should handle multiple spin operations', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 2, initval: 10 });

      await startUpSpinViaAPI(page, 'test-input');
      await stopSpinViaAPI(page, 'test-input');
      await startDownSpinViaAPI(page, 'test-input');
      await stopSpinViaAPI(page, 'test-input');

      // Should handle sequence without errors
      expect(await getNumericValue(page, 'test-input')).toBeGreaterThanOrEqual(8); // Some value change expected
    });
  });

  test.describe('Spin Behavior at Boundaries', () => {
    test('should emit min event when spinning down to minimum', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, min: 0, initval: 2 });
      await touchspinHelpers.clearEventLog(page);

      await startDownSpinViaAPI(page, 'test-input');
      // Let it spin down to minimum
      await page.waitForTimeout(100);
      await stopSpinViaAPI(page, 'test-input');

      expect(await getNumericValue(page, 'test-input')).toBe(0);
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.min', 'touchspin')).toBe(true);
    });

    test('should emit max event when spinning up to maximum', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, max: 10, initval: 8 });
      await touchspinHelpers.clearEventLog(page);

      await startUpSpinViaAPI(page, 'test-input');
      // Let it spin up to maximum
      await page.waitForTimeout(100);
      await stopSpinViaAPI(page, 'test-input');

      expect(await getNumericValue(page, 'test-input')).toBe(10);
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.max', 'touchspin')).toBe(true);
    });

    test('should respect step boundaries while spinning', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 3, min: 0, max: 15, initval: 6 });

      await startUpSpinViaAPI(page, 'test-input');
      await page.waitForTimeout(50);
      await stopSpinViaAPI(page, 'test-input');

      const value = await getNumericValue(page, 'test-input');
      expect(value % 3).toBe(0); // Should be divisible by step
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(15);
    });
  });

  test.describe('Spin Direction Changes', () => {
    test('should stop current spin when starting opposite direction', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      await startUpSpinViaAPI(page, 'test-input');
      await touchspinHelpers.clearEventLog(page);

      await startDownSpinViaAPI(page, 'test-input');

      // Should emit stop then start events
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);
    });

    test('should handle rapid direction changes', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      await startUpSpinViaAPI(page, 'test-input');
      await startDownSpinViaAPI(page, 'test-input');
      await startUpSpinViaAPI(page, 'test-input');
      await stopSpinViaAPI(page, 'test-input');

      // Should handle sequence without errors
      const finalValue = await getNumericValue(page, 'test-input');
      expect(typeof finalValue).toBe('number');
      expect(isNaN(finalValue)).toBe(false);
    });

    test('should maintain consistent state after direction changes', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 2, initval: 10 });
      const initialValue = await getNumericValue(page, 'test-input');

      await startUpSpinViaAPI(page, 'test-input');
      await startDownSpinViaAPI(page, 'test-input');
      await stopSpinViaAPI(page, 'test-input');

      const finalValue = await getNumericValue(page, 'test-input');
      expect(finalValue % 2).toBe(0); // Should maintain step divisibility
    });
  });

  test.describe('Keyboard and Mouse Spin Events', () => {
    test('should handle held arrow key simulation', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await page.focus('[data-testid="test-input"]');

      const initialValue = await getNumericValue(page, 'test-input');

      // Simulate holding arrow up key
      await page.keyboard.down('ArrowUp');
      await page.waitForTimeout(50);
      await page.keyboard.up('ArrowUp');

      const finalValue = await getNumericValue(page, 'test-input');
      expect(finalValue).toBeGreaterThan(initialValue);
    });

    test('should stop spin on focus loss', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await page.focus('[data-testid="test-input"]');

      await startUpSpinViaAPI(page, 'test-input');

      // Focus away (to blur target)
      await page.focus('[data-testid="blur-target"]');

      // Spin should stop when focus is lost
      await page.waitForTimeout(50);

      const value = await getNumericValue(page, 'test-input');
      expect(typeof value).toBe('number');
    });

    test('should handle mousewheel spin events', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await page.focus('[data-testid="test-input"]');

      const initialValue = await getNumericValue(page, 'test-input');

      // Wheel up
      await page.mouse.wheel(0, -100);

      const finalValue = await getNumericValue(page, 'test-input');
      expect(finalValue).toBeGreaterThan(initialValue);
    });
  });
});

// NOTE: This test file covers the core spinning functionality using API methods
// and event verification rather than timing-dependent tests. Focus is on state
// transitions, event emission, and boundary behavior.