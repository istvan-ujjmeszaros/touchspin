import { test, expect } from '@playwright/test';
import {
  installDomHelpers,
  startCoverage,
  collectCoverage,
  initializeTouchspinFromGlobals,
} from '@touchspin/core/test-helpers';

test.describe('renderer-b4: vertical layout', () => {
  test.beforeEach(async ({ page }) => {
    await startCoverage(page);
  });
  test.afterEach(async ({ page }, testInfo) => {
    await collectCoverage(page, testInfo.title);
  });
  test('vertical texts and classes applied', async ({ page }) => {
    await page.goto('/packages/renderers/bootstrap4/tests/fixtures/bootstrap4-fixture.html');
    await installDomHelpers(page);

    await initializeTouchspinFromGlobals(page, 'test-input', {
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
