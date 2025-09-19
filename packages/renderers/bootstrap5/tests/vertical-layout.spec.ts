import { test, expect } from '@playwright/test';
import { installDomHelpers, startCoverage, collectCoverage } from '@touchspin/core/test-helpers';
import { initializeTouchspinWithBootstrap5 } from './helpers/initialization';

test.describe('renderer-b5: vertical layout', () => {
  test.beforeEach(async ({ page }) => {
    await startCoverage(page);
  });
  test.afterEach(async ({ page }, testInfo) => {
    await collectCoverage(page, testInfo.title);
  });
  test('vertical texts and classes applied', async ({ page }) => {
    await page.goto('/packages/core/tests/html/test-fixture.html');
    await installDomHelpers(page);

    await initializeTouchspinWithBootstrap5(page, 'test-input', {
      verticalbuttons: true,
      verticalup: '▲',
      verticaldown: '▼',
      verticalupclass: 'v-up',
      verticaldownclass: 'v-down',
      buttonup_class: 'btn btn-success',
      buttondown_class: 'btn btn-warning',
    });

    const w = page.getByTestId('test-input-wrapper');
    const up = w.locator('[data-touchspin-injected="up"]');
    const down = w.locator('[data-touchspin-injected="down"]');

    await expect(up).toHaveText('▲');
    await expect(down).toHaveText('▼');
    await expect(up).toHaveClass(/btn-success/);
    await expect(up).toHaveClass(/v-up/);
    await expect(down).toHaveClass(/btn-warning/);
    await expect(down).toHaveClass(/v-down/);
  });
});
