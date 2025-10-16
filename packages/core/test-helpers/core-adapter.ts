import type { Page } from '@playwright/test';
import { inputById } from '../tests/__shared__/helpers/core/selectors';
import {
  initializeTouchSpin,
  initializeTouchspin,
  initializeTouchspinFromGlobals,
  isCoreInitialized,
} from '../tests/__shared__/helpers/core/initialization';

export {
  initializeTouchspin,
  initializeTouchSpin,
  initializeTouchspinFromGlobals,
  isCoreInitialized,
};

// TODO: Once all tests import directly from the shared helpers, fold this shim back into
// packages/core/tests/__shared__/helpers and delete core-adapter.ts entirely.

/**
 * Get numeric value from Core internal state (different from display value)
 * Note: Use apiHelpers.getNumericValue() for display value, this gets Core's internal value
 */
export async function getCoreNumericValue(page: Page, testId: string): Promise<number> {
  const input = inputById(page, testId);
  return await input.evaluate((inputEl: HTMLInputElement) => {
    const core = (inputEl as any)._touchSpinCore;
    if (!core) throw new Error(`Core not found for input`);
    return core.getValue();
  });
}

/**
 * Check if Core is initialized
 */
