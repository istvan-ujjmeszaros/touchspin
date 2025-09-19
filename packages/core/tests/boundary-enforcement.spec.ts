import { test, expect } from '@playwright/test';
import * as apiHelpers from '../../../__tests__/helpers/touchspinApiHelpers';
import {
  initializeTouchspin,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  isCoreInitialized,
  incrementViaAPI,
  decrementViaAPI,
  incrementViaKeyboard,
  decrementViaKeyboard
} from '../../../__tests__/helpers/touchspinApiHelpers';

// Use original battle-tested helpers
const {
  clickUpButton,      // was: coreUpOnce
  clickDownButton,    // was: coreDownOnce
  readInputValue,     // was: getInputValue
  fillWithValue,      // was: setInputValue
  setInputAttribute        // was: setInputAttribute
} = apiHelpers;

test.describe('Core TouchSpin Boundary Enforcement', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'core-boundary-enforcement');
  });

  test.describe('Minimum Boundary Enforcement', () => {
    test('should not decrement below minimum value', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { min: 10, step: 2, initval: 10 });

      await decrementViaAPI(page, 'test-input');

      expect(await getNumericValue(page, 'test-input')).toBe(10); // Cannot go below min
    });

    test('should emit min event when at minimum boundary', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { min: 0, step: 1, initval: 0 });
      await apiHelpers.clearEventLog(page);

      await decrementViaAPI(page, 'test-input');

      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.min', 'touchspin')).toBe(true);
      expect(await getNumericValue(page, 'test-input')).toBe(0);
    });

    test('should emit min event when reaching minimum boundary', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { min: 5, step: 1, initval: 6 });
      await apiHelpers.clearEventLog(page);

      await decrementViaAPI(page, 'test-input');

      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.min', 'touchspin')).toBe(true);
      expect(await getNumericValue(page, 'test-input')).toBe(5);
    });

    test('should handle negative minimum values', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { min: -10, step: 2, initval: -8 });

      await decrementViaAPI(page, 'test-input');

      expect(await getNumericValue(page, 'test-input')).toBe(-10); // Clamped to negative min
    });

    test('should clamp programmatically set value below minimum', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { min: 10, step: 1, initval: 15 });

      await setValueViaAPI(page, 'test-input', 5); // Below min

      expect(await getNumericValue(page, 'test-input')).toBe(10); // Clamped to min
    });
  });

  test.describe('Maximum Boundary Enforcement', () => {
    test('should not increment above maximum value', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { max: 20, step: 2, initval: 20 });

      await incrementViaAPI(page, 'test-input');

      expect(await getNumericValue(page, 'test-input')).toBe(20); // Cannot go above max
    });

    test('should emit max event when at maximum boundary', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { max: 10, step: 1, initval: 10 });
      await apiHelpers.clearEventLog(page);

      await incrementViaAPI(page, 'test-input');

      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.max', 'touchspin')).toBe(true);
      expect(await getNumericValue(page, 'test-input')).toBe(10);
    });

    test('should emit max event when reaching maximum boundary', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { max: 15, step: 1, initval: 14 });
      await apiHelpers.clearEventLog(page);

      await incrementViaAPI(page, 'test-input');

      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.max', 'touchspin')).toBe(true);
      expect(await getNumericValue(page, 'test-input')).toBe(15);
    });

    test('should clamp programmatically set value above maximum', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { max: 50, step: 1, initval: 25 });

      await setValueViaAPI(page, 'test-input', 100); // Above max

      expect(await getNumericValue(page, 'test-input')).toBe(50); // Clamped to max
    });
  });

  test.describe('Null Boundaries (No Limits)', () => {
    test('should allow values below zero when min is null', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { min: null, max: 100, step: 5, initval: 0 });

      for (let i = 0; i < 4; i++) {
        await decrementViaAPI(page, 'test-input');
      }

      expect(await getNumericValue(page, 'test-input')).toBe(-20); // Should go negative
    });

    test('should allow values above default max when max is null', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { min: 0, max: null, step: 5, initval: 100 });

      for (let i = 0; i < 4; i++) {
        await incrementViaAPI(page, 'test-input');
      }

      expect(await getNumericValue(page, 'test-input')).toBe(120); // Should exceed 100
    });

    test('should allow unlimited range when both boundaries are null', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { min: null, max: null, step: 10, initval: 0 });

      // Go to large positive
      for (let i = 0; i < 10; i++) {
        await incrementViaAPI(page, 'test-input');
      }
      expect(await getNumericValue(page, 'test-input')).toBe(100);

      // Go to large negative
      for (let i = 0; i < 20; i++) {
        await decrementViaAPI(page, 'test-input');
      }
      expect(await getNumericValue(page, 'test-input')).toBe(-100);
    });

    test('should not emit boundary events when boundaries are null', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { min: null, max: null, step: 1, initval: 0 });
      await apiHelpers.clearEventLog(page);

      await decrementViaAPI(page, 'test-input');
      await incrementViaAPI(page, 'test-input');
      await incrementViaAPI(page, 'test-input');

      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.min', 'touchspin')).toBe(false);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.max', 'touchspin')).toBe(false);
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle when min equals max', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { min: 50, max: 50, step: 1, initval: 50 });

      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(50); // Cannot increment

      await decrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(50); // Cannot decrement
    });

    test('should handle decimal boundaries', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { min: 5.75, max: 10.25, step: 0.25, decimals: 2, initval: 6.25 }); // Step-aligned boundaries

      await decrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(6.00); // Decrements by step

      await decrementViaAPI(page, 'test-input'); // Try to go below min boundary
      expect(await getNumericValue(page, 'test-input')).toBe(5.75); // Clamped to min boundary

      await setValueViaAPI(page, 'test-input', 15.7); // Above max
      expect(await getNumericValue(page, 'test-input')).toBe(10.25); // Clamped to max
    });

    test('should handle zero as a boundary value', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { min: 0, max: 0, step: 1, initval: 0 });

      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(0); // Pinned at zero

      await decrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(0); // Still pinned at zero
    });
  });

  test.describe('Boundary with Step Interaction', () => {
    test('should respect boundaries when step would exceed them', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { min: 10, max: 25, step: 7, initval: 14 }); // 14 + 7 = 21, 21 + 7 = 28 > max

      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(21); // Within bounds

      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(25); // Clamped to max, not 28
    });

    test('should handle step larger than boundary range', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { min: 10, max: 12, step: 5, initval: 10 }); // Step 5 is larger than range 2

      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(12); // Clamped to max

      await decrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(10); // Back to min
    });
  });

  test.describe('Disabled and Readonly States', () => {
    test('should not change value when input is disabled', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { step: 1, initval: 10 });

      // Disable the input
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.disabled = true;
      });

      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(10); // No change

      await decrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(10); // No change
    });

    test('should not change value when input is readonly', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { step: 1, initval: 15 });

      // Make the input readonly
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.readOnly = true;
      });

      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(15); // No change

      await decrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(15); // No change
    });
  });

  test.describe('Initialization Clamping', () => {
    test('should clamp init value below minimum', async ({ page }) => {
      // Test clamping during initialization (_applyConstraints called internally)
      await initializeTouchspin(page, 'test-input', { min: 20, max: 50, step: 1, initval: 5 }); // Below min

      expect(await getNumericValue(page, 'test-input')).toBe(20); // Clamped to min
    });

    test('should clamp init value above maximum', async ({ page }) => {
      // Test clamping during initialization (_applyConstraints called internally)
      await initializeTouchspin(page, 'test-input', { min: 10, max: 30, step: 1, initval: 75 }); // Above max

      expect(await getNumericValue(page, 'test-input')).toBe(30); // Clamped to max
    });

    test('should not clamp when init value is within bounds', async ({ page }) => {
      // Test no clamping when value is valid
      await initializeTouchspin(page, 'test-input', { min: 10, max: 50, step: 1, initval: 25 }); // Within bounds

      expect(await getNumericValue(page, 'test-input')).toBe(25); // No clamping needed
    });

    test('should handle null boundaries during initialization', async ({ page }) => {
      // Test that null boundaries don't cause clamping
      await initializeTouchspin(page, 'test-input', { min: null, max: null, step: 1, initval: -100 });

      expect(await getNumericValue(page, 'test-input')).toBe(-100); // No clamping with null boundaries
    });

    test('should clamp to boundary even if not step-aligned', async ({ page }) => {
      // Test that boundary clamping takes precedence over step alignment
      await initializeTouchspin(page, 'test-input', { min: 12, max: 30, step: 5, initval: 8 }); // 8 < 12, should clamp to min

      const value = await getNumericValue(page, 'test-input');
      expect(value).toBe(12); // Clamped to min (12 is not divisible by 5, but boundary takes precedence)
    });
  });
});

// NOTE: This test file covers boundary enforcement for TouchSpin core.
// Proper boundary handling is critical for data validation and user experience.
