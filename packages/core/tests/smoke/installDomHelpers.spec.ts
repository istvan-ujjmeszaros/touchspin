import { test } from '@playwright/test';
import { installDomHelpers } from '../../test-helpers';

test.describe('installDomHelpers smoke', () => {
  test('installs __ts namespace with required methods', async ({ page }) => {
    await page.goto('/');
    await installDomHelpers(page);
    await page.evaluate(() => {
      if (!window.__ts) throw new Error('missing __ts');
      if (typeof window.__ts.requireInputByTestId !== 'function') {
        throw new Error('missing requireInputByTestId');
      }
      if (typeof window.__ts.requireCoreByTestId !== 'function') {
        throw new Error('missing requireCoreByTestId');
      }
    });
  });
});
