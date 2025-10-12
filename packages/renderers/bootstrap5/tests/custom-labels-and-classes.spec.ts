import { expect, test } from '@playwright/test';
import {
  collectCoverage,
  initializeTouchspinFromGlobals,
  installDomHelpers,
  startCoverage,
} from '@touchspin/core/test-helpers';
import { ensureBootstrap5Globals } from './helpers/bootstrap5-globals';

test.describe('renderer-b5: custom labels/classes render', () => {
  test.beforeEach(async ({ page }) => {
    await startCoverage(page);
  });
  test.afterEach(async ({ page }, testInfo) => {
    await collectCoverage(page, testInfo.title);
  });
  test('programmatic init applies texts and classes', async ({ page }) => {
    await page.goto('/packages/renderers/bootstrap5/tests/fixtures/bootstrap5-fixture.html');
    await ensureBootstrap5Globals(page);
    await installDomHelpers(page);

    await initializeTouchspinFromGlobals(page, 'test-input', {
      buttonup_txt: 'UP',
      buttondown_txt: 'DOWN',
      buttonup_class: 'btn btn-primary',
      buttondown_class: 'btn btn-danger',
      prefix: '$',
      prefix_extraclass: 'fx-prefix',
      postfix: 'kg',
      postfix_extraclass: 'fx-postfix',
    });

    const w = page.getByTestId('test-input-wrapper');
    await expect(w.locator('[data-touchspin-injected="up"]')).toHaveText('UP');
    await expect(w.locator('[data-touchspin-injected="down"]')).toHaveText('DOWN');
    await expect(w.locator('[data-touchspin-injected="up"]')).toHaveClass(/btn-primary/);
    await expect(w.locator('[data-touchspin-injected="down"]')).toHaveClass(/btn-danger/);
    await expect(w.locator('[data-touchspin-injected="prefix"]')).toHaveText('$');
    await expect(w.locator('[data-touchspin-injected="prefix"]')).toHaveClass(/fx-prefix/);
    await expect(w.locator('[data-touchspin-injected="postfix"]')).toHaveText('kg');
    await expect(w.locator('[data-touchspin-injected="postfix"]')).toHaveClass(/fx-postfix/);
  });
});
