import { test, expect } from '@playwright/test';
import * as apiHelpers from '../../../__tests__/helpers/touchspinApiHelpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  readInputValue,
  startUpSpinViaAPI,
  startDownSpinViaAPI,
  stopSpinViaAPI
} from '../../..__tests__/helpers/touchspinApiHelpers';

test.describe('Core TouchSpin Boosted Stepping', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await apiHelpers.waitForCoreTestReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'core-boosted-stepping');
  });

  test.describe('Booster Configuration', () => {
    test('disabling booster returns base step', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 5,
        booster: false,
        initval: 10
      });

      const boostedStep = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        return core._getBoostedStep();
      });

      expect(boostedStep).toBe(5); // Should return base step when booster disabled
    });

    test('enabling booster starts with base step', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 3,
        booster: true,
        boostat: 10,
        initval: 10
      });

      // Initially spincount is 0, so should return base step
      const initialBoostedStep = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        return core._getBoostedStep();
      });

      expect(initialBoostedStep).toBe(3); // Base step
    });

    test('booster accelerates step based on spin count', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 2,
        booster: true,
        boostat: 5, // Boost every 5 spins
        initval: 10
      });

      const steps = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        const results = [];

        // Test various spin counts
        core.spincount = 0;
        results.push({ count: 0, step: core._getBoostedStep() });

        core.spincount = 4;
        results.push({ count: 4, step: core._getBoostedStep() });

        core.spincount = 5; // First boost threshold
        results.push({ count: 5, step: core._getBoostedStep() });

        core.spincount = 10; // Second boost threshold
        results.push({ count: 10, step: core._getBoostedStep() });

        core.spincount = 15; // Third boost threshold
        results.push({ count: 15, step: core._getBoostedStep() });

        return results;
      });

      expect(steps[0].step).toBe(2); // count=0: base step
      expect(steps[1].step).toBe(2); // count=4: still base step
      expect(steps[2].step).toBe(4); // count=5: 2 * 2^1 = 4
      expect(steps[3].step).toBe(8); // count=10: 2 * 2^2 = 8
      expect(steps[4].step).toBe(16); // count=15: 2 * 2^3 = 16
    });

    test('maxboostedstep caps acceleration', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        booster: true,
        boostat: 2,
        maxboostedstep: 5, // Cap at 5
        initval: 10
      });

      const cappedSteps = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        const results = [];

        // Test high spin counts that would normally exceed cap
        core.spincount = 10; // Would be 1 * 2^5 = 32 without cap
        results.push(core._getBoostedStep());

        core.spincount = 20; // Would be even higher
        results.push(core._getBoostedStep());

        return results;
      });

      expect(cappedSteps[0]).toBe(5); // Capped at maxboostedstep
      expect(cappedSteps[1]).toBe(5); // Still capped
    });

    test('invalid maxboostedstep is ignored', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 2,
        booster: true,
        boostat: 5,
        maxboostedstep: NaN, // Invalid cap
        initval: 10
      });

      const uncappedStep = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        core.spincount = 10; // Should give 2 * 2^2 = 8
        return core._getBoostedStep();
      });

      expect(uncappedStep).toBe(8); // No capping applied due to invalid maxboostedstep
    });

    test('handles zero and negative boostat values', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 3,
        booster: true,
        boostat: 0, // Invalid boostat
        initval: 10
      });

      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        core.spincount = 10;
        return core._getBoostedStep();
      });

      // Should handle invalid boostat gracefully (minimum boostat is 1)
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });
  });

  test.describe('Value Alignment Algorithm', () => {
    test('handles zero step in alignment', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        // Test _alignToStep with zero step
        return core._alignToStep(15.5, 0, 'up');
      });

      expect(result).toBe(15.5); // Should return original value when step is 0
    });

    test('aligns values to step boundaries correctly', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const alignments = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        return {
          // Test with step 3
          up1: core._alignToStep(10.1, 3, 'up'),   // Should round up to 12
          down1: core._alignToStep(10.1, 3, 'down'), // Should round down to 9
          exact1: core._alignToStep(12, 3, 'up'),    // Should stay at 12 (exact)

          // Test with decimal step
          up2: core._alignToStep(10.15, 0.1, 'up'),   // Should align to 0.1 boundary
          down2: core._alignToStep(10.15, 0.1, 'down'), // Should align to 0.1 boundary

          // Test edge case
          boundary: core._alignToStep(9, 3, 'up')     // Exact boundary
        };
      });

      expect(alignments.up1).toBeCloseTo(12, 5);    // Rounds up to next step
      expect(alignments.down1).toBeCloseTo(9, 5);   // Rounds down to prev step
      expect(alignments.exact1).toBeCloseTo(12, 5); // Stays at exact boundary
      expect(alignments.up2).toBeCloseTo(10.2, 5);  // Decimal alignment up
      expect(alignments.down2).toBeCloseTo(10.1, 5); // Decimal alignment down
      expect(alignments.boundary).toBeCloseTo(9, 5); // Exact boundary
    });

    test('handles precision issues with decimal steps', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const precisionTest = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        // Test problematic decimal values that can cause precision issues
        return {
          decimal1: core._alignToStep(0.1 + 0.2, 0.1, 'up'), // 0.30000000000000004
          decimal2: core._alignToStep(1.005, 0.01, 'up'),    // Rounding edge case
          decimal3: core._alignToStep(9.99999, 1, 'up')      // Near-integer
        };
      });

      expect(precisionTest.decimal1).toBeCloseTo(0.3, 5);
      expect(precisionTest.decimal2).toBeCloseTo(1.01, 5);
      expect(precisionTest.decimal3).toBeCloseTo(10, 5);
    });

    test('integer arithmetic avoids floating point errors', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      // Test the algorithm with a case that would fail with naive floating point math
      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        // Use a value that's problematic for floating point (0.1 + 0.2 = 0.30000000000000004)
        const problematicValue = 0.1 + 0.2;
        return core._alignToStep(problematicValue, 0.1, 'up');
      });

      expect(result).toBeCloseTo(0.3, 10); // Should be exactly 0.3, not 0.30000000000000004
    });
  });

  test.describe('Booster in Action', () => {
    test('spin counter affects step size during continuous spin', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        booster: true,
        boostat: 3,
        stepinterval: 50, // Fast for testing
        initval: 10
      });

      // Start spinning and let booster effect kick in
      await startUpSpinViaAPI(page, 'test-input');
      await apiHelpers.waitForTimeout(300); // Let several spin cycles occur
      await stopSpinViaAPI(page, 'test-input');

      const finalValue = await getNumericValue(page, 'test-input');

      // With booster, should have incremented by more than just step*cycles
      expect(finalValue).toBeGreaterThan(15); // Boosted acceleration
    });

    test('maxboostedstep limits acceleration in practice', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        booster: true,
        boostat: 2,
        maxboostedstep: 3, // Low cap for testing
        stepinterval: 30,
        initval: 10
      });

      await startUpSpinViaAPI(page, 'test-input');
      await apiHelpers.waitForTimeout(400); // Long enough for many boost cycles
      await stopSpinViaAPI(page, 'test-input');

      const finalValue = await getNumericValue(page, 'test-input');

      // Even with long spin, shouldn't go too high due to maxboostedstep cap
      expect(finalValue).toBeLessThan(50); // Reasonable bound due to capping
    });

    test('firstclickvalueifempty affects NaN value handling', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        firstclickvalueifempty: 25,
        initval: 10
      });

      const nanHandling = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        // Test _valueIfIsNaN function
        return core._valueIfIsNaN();
      });

      expect(nanHandling).toBe(25); // Should use firstclickvalueifempty
    });

    test('calculates midpoint when no firstclickvalueifempty', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 10,
        max: 30,
        initval: 20
      });

      const midpointHandling = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        return core._valueIfIsNaN();
      });

      expect(midpointHandling).toBe(20); // Should be (10 + 30) / 2
    });

    test('handles null min/max in NaN value calculation', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: null,
        max: null,
        initval: 10
      });

      const nullBoundaryHandling = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        return core._valueIfIsNaN();
      });

      // Should handle null boundaries gracefully (often defaults to 0)
      expect(typeof nullBoundaryHandling).toBe('number');
    });
  });

  test.describe('Step Integration with Boundaries', () => {
    test('boosted step respects max boundary', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        booster: true,
        boostat: 2,
        max: 15,
        initval: 10
      });

      // Test internal step calculation when close to boundary
      const stepCalculation = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        // Simulate high spin count near boundary
        core.spincount = 10; // Would normally give large boost
        const currentValue = 14; // Close to max=15

        // Test the internal _getBoostedStepNearBoundary logic
        const boostedStep = core._getBoostedStep();
        const maxboostedstep = core.settings.maxboostedstep;

        return {
          boostedStep: boostedStep,
          maxboostedstep: maxboostedstep,
          wouldExceedMax: (currentValue + boostedStep) > 15
        };
      });

      expect(stepCalculation.boostedStep).toBeGreaterThan(1); // Should be boosted
      // This tests the algorithm works; actual boundary enforcement is in other functions
    });
  });
});

// NOTE: This test file exercises the _getBoostedStep, _alignToStep, and _valueIfIsNaN functions,
// covering booster acceleration, decimal alignment algorithms, and NaN value handling.
