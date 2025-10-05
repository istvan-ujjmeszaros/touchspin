import { expect, test } from '@playwright/test';
import {
  collectCoverage,
  initializeTouchspinFromGlobals,
  installDomHelpers,
  startCoverage,
} from '@touchspin/core/test-helpers';
import { ensureBootstrap3Globals } from './helpers/bootstrap3-globals';

test.describe('renderer-b3: vertical layout', () => {
  test.beforeEach(async ({ page }) => {
    await startCoverage(page);
  });
  test.afterEach(async ({ page }, testInfo) => {
    await collectCoverage(page, testInfo.title);
  });
  test('vertical texts and classes applied', async ({ page }) => {
    await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
    await ensureBootstrap3Globals(page);
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
