import { test, expect } from '@playwright/test';
import { installDomHelpers, startCoverage, collectCoverage } from '../../__shared__/helpers';

test.describe('installDomHelpers smoke', () => {
  test.beforeEach(async ({ page }) => {
    await startCoverage(page);
  });
  test.afterEach(async ({ page }, testInfo) => {
    await collectCoverage(page, testInfo.title);
  });
  test('installs __ts namespace with required methods', async ({ page }) => {
    await page.goto('/');
    await installDomHelpers(page);
    const result = await page.evaluate(() => {
      const ns = (window as unknown as { __ts?: { requireInputByTestId?: unknown; requireCoreByTestId?: unknown } }).__ts;
      return {
        hasNs: !!ns,
        hasInput: typeof ns?.requireInputByTestId === 'function',
        hasCore: typeof ns?.requireCoreByTestId === 'function',
      };
    });
    expect(result.hasNs).toBe(true);
    expect(result.hasInput).toBe(true);
    expect(result.hasCore).toBe(true);
  });
});
