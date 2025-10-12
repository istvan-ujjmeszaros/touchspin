import { test as base } from '@playwright/test';
import {
  collectCoverage,
  startCoverage,
} from './packages/core/tests/__shared__/helpers/test-utilities/coverage';

/**
 * Global test fixture that automatically handles coverage collection
 * for all tests when PW_COVERAGE=1
 */
export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    // Start coverage before each test
    await startCoverage(page);

    // Run the test
    await use(page);

    // Collect coverage after each test
    await collectCoverage(page, testInfo.title);
  },
});

export { expect } from '@playwright/test';
