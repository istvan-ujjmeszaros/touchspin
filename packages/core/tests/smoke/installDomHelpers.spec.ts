import { test } from '@playwright/test';
import { installDomHelpers } from '../../test-helpers';

test.describe('installDomHelpers smoke', () => {
  test('installs __ts namespace with required methods', async ({ page }) => {
    await page.goto('/');
    await installDomHelpers(page);
    await page.evaluate(() => {
      const ts = window.__ts!;
      if (!ts) throw new Error('missing __ts');
      if (typeof ts.requireInputByTestId !== 'function') {
        throw new Error('missing requireInputByTestId');
      }
      if (typeof ts.requireCoreByTestId !== 'function') {
        throw new Error('missing requireCoreByTestId');
      }
    });
  });
});
