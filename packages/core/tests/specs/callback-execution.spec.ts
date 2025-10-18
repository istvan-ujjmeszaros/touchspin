/**
 * Feature: Callback execution frequency and ordering
 * Background: fixture = /packages/core/tests/fixtures/core-api-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [ ] upOnce API triggers callbacks exactly once
 * [ ] downOnce API triggers callbacks exactly once
 * [ ] keyboard arrow up triggers callbacks exactly once
 * [ ] keyboard arrow down triggers callbacks exactly once
 * [ ] manual typing and blur triggers callbacks exactly once
 * [ ] setValue API triggers callbacks exactly once
 * [ ] initialization does not trigger callbacks
 * [ ] callback_before_calculation is called before callback_after_calculation
 */

import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { initializeTouchspin } from '../test-helpers/core-adapter';

// Extend window interface for callback tracking
declare global {
  interface Window {
    callbackTracker?: {
      beforeCalls: string[];
      afterCalls: string[];
    };
    callbackOrder?: string[];
  }
}

// Helper to initialize with callback tracking
async function initializeWithCallbackTracking(page: Page, testId: string) {
  await page.evaluate(() => {
    // Initialize tracker BEFORE TouchSpin initialization
    window.callbackTracker = {
      beforeCalls: [] as string[],
      afterCalls: [] as string[],
    };
  });

  await initializeTouchspin(page, testId, {
    step: 1,
    min: 0,
    max: 100,
    initval: 50,
    callback_before_calculation: (value: string) => {
      window.callbackTracker.beforeCalls.push(value);
      return value; // Return unmodified
    },
    callback_after_calculation: (value: string) => {
      window.callbackTracker.afterCalls.push(value);
      return `${value} USD`; // Append for visibility
    },
  });
}

// Helper to get callback counts
async function getCallbackCounts(page: Page) {
  return await page.evaluate(() => {
    const tracker = window.callbackTracker;
    return {
      beforeCount: tracker.beforeCalls.length,
      afterCount: tracker.afterCalls.length,
      beforeCalls: tracker.beforeCalls,
      afterCalls: tracker.afterCalls,
    };
  });
}

// Helper to reset callback tracking
async function resetCallbackTracking(page: Page) {
  await page.evaluate(() => {
    const tracker = window.callbackTracker;
    tracker.beforeCalls = [];
    tracker.afterCalls = [];
  });
}

test.describe('Callback execution frequency and ordering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/fixtures/core-api-fixture.html');
    await apiHelpers.startCoverage(page);
    await apiHelpers.waitForPageReady(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  /**
   * Scenario: upOnce API triggers callbacks exactly once
   * Given TouchSpin is initialized with callbacks
   * When I call upOnce via API
   * Then both callbacks are triggered exactly once
   */
  test.skip('upOnce API triggers callbacks exactly once', async ({ page }) => {
    await initializeWithCallbackTracking(page, 'test-input');
    await resetCallbackTracking(page);

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const counts = await getCallbackCounts(page);
    expect(counts.beforeCount).toBe(1);
    expect(counts.afterCount).toBe(1);
  });

  /**
   * Scenario: downOnce API triggers callbacks exactly once
   * Given TouchSpin is initialized with callbacks
   * When I call downOnce via API
   * Then both callbacks are triggered exactly once
   */
  test.skip('downOnce API triggers callbacks exactly once', async ({ page }) => {
    await initializeWithCallbackTracking(page, 'test-input');
    await resetCallbackTracking(page);

    await apiHelpers.decrementViaAPI(page, 'test-input');

    const counts = await getCallbackCounts(page);
    expect(counts.beforeCount).toBe(1);
    expect(counts.afterCount).toBe(1);
  });

  /**
   * Scenario: keyboard arrow up triggers callbacks exactly once
   * Given TouchSpin is initialized with callbacks
   * When I press the arrow up key
   * Then both callbacks are triggered exactly once
   */
  test.skip('keyboard arrow up triggers callbacks exactly once', async ({ page }) => {
    await initializeWithCallbackTracking(page, 'test-input');
    await resetCallbackTracking(page);

    const input = page.getByTestId('test-input');
    await input.focus();
    await page.keyboard.press('ArrowUp');

    const counts = await getCallbackCounts(page);
    expect(counts.beforeCount).toBe(1);
    expect(counts.afterCount).toBe(1);
  });

  /**
   * Scenario: keyboard arrow down triggers callbacks exactly once
   * Given TouchSpin is initialized with callbacks
   * When I press the arrow down key
   * Then both callbacks are triggered exactly once
   */
  test.skip('keyboard arrow down triggers callbacks exactly once', async ({ page }) => {
    await initializeWithCallbackTracking(page, 'test-input');
    await resetCallbackTracking(page);

    const input = page.getByTestId('test-input');
    await input.focus();
    await page.keyboard.press('ArrowDown');

    const counts = await getCallbackCounts(page);
    expect(counts.beforeCount).toBe(1);
    expect(counts.afterCount).toBe(1);
  });

  /**
   * Scenario: manual typing and blur triggers callbacks exactly once
   * Given TouchSpin is initialized with callbacks
   * When I type a value and blur the input
   * Then both callbacks are triggered exactly once
   */
  test.skip('manual typing and blur triggers callbacks exactly once', async ({ page }) => {
    await initializeWithCallbackTracking(page, 'test-input');
    await resetCallbackTracking(page);

    await apiHelpers.fillWithValueAndBlur(page, 'test-input', '75');

    const counts = await getCallbackCounts(page);
    expect(counts.beforeCount).toBe(1);
    expect(counts.afterCount).toBe(1);
  });

  /**
   * Scenario: setValue API triggers callbacks exactly once
   * Given TouchSpin is initialized with callbacks
   * When I call setValue via API
   * Then both callbacks are triggered exactly once
   */
  test.skip('setValue API triggers callbacks exactly once', async ({ page }) => {
    await initializeWithCallbackTracking(page, 'test-input');
    await resetCallbackTracking(page);

    await apiHelpers.setValueViaAPI(page, 'test-input', '25');

    const counts = await getCallbackCounts(page);
    expect(counts.beforeCount).toBe(1);
    expect(counts.afterCount).toBe(1);
  });

  /**
   * Scenario: initialization does not trigger callbacks
   * Given TouchSpin is not yet initialized
   * When I initialize TouchSpin with callbacks and initial value
   * Then callbacks are not triggered during initialization
   */
  test.skip('initialization does not trigger callbacks', async ({ page }) => {
    // Pre-initialize the tracking before initialization
    await page.evaluate(() => {
      window.callbackTracker = {
        beforeCalls: [] as string[],
        afterCalls: [] as string[],
      };
    });

    await initializeTouchspin(page, 'test-input', {
      step: 1,
      min: 0,
      max: 100,
      initval: 50,
      callback_before_calculation: (value: string) => {
        window.callbackTracker.beforeCalls.push(value);
        return value;
      },
      callback_after_calculation: (value: string) => {
        window.callbackTracker.afterCalls.push(value);
        return `${value} USD`;
      },
    });

    const counts = await getCallbackCounts(page);
    expect(counts.beforeCount).toBe(0);
    expect(counts.afterCount).toBe(0);
  });

  /**
   * Scenario: callback_before_calculation is called before callback_after_calculation
   * Given TouchSpin is initialized with both callbacks
   * When a value change occurs
   * Then callback_before_calculation is invoked before callback_after_calculation
   */
  test.skip('callback_before_calculation is called before callback_after_calculation', async ({
    page,
  }) => {
    // Set up ordering tracker
    await page.evaluate(() => {
      window.callbackOrder = [] as string[];
    });

    await initializeTouchspin(page, 'test-input', {
      step: 1,
      min: 0,
      max: 100,
      initval: 50,
      callback_before_calculation: (value: string) => {
        window.callbackOrder!.push('before');
        return value;
      },
      callback_after_calculation: (value: string) => {
        window.callbackOrder!.push('after');
        return value;
      },
    });

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const order = await page.evaluate(() => window.callbackOrder);
    expect(order).toEqual(['before', 'after']);
  });
});
