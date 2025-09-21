import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { installDomHelpers } from '../runtime/installDomHelpers';
import { initializeTouchspinWithRenderer } from '../core/initialization';

export function defineSharedRendererTests(name: string, rendererUrl: string) {
  test.describe(`Shared renderer behavior: ${name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/packages/core/tests/html/test-fixture.html');
      await installDomHelpers(page);
    });

    test('horizontal: buttons/prefix/postfix render with texts/classes and focusability', async ({ page }) => {
      await initializeTouchspinWithRenderer(page, 'test-input', rendererUrl, {
        prefix: '$', postfix: 'kg',
        prefix_extraclass: 'x-prefix', postfix_extraclass: 'x-postfix',
        buttonup_txt: 'UP', buttondown_txt: 'DOWN',
        buttonup_class: 'u-class', buttondown_class: 'd-class',
        focusablebuttons: true,
      });

      const w = page.getByTestId('test-input-wrapper');
      await expect(w.locator('[data-touchspin-injected="up"]')).toHaveText(/UP|\+/);
      await expect(w.locator('[data-touchspin-injected="down"]')).toHaveText(/DOWN|−/);
      await expect(w.locator('[data-touchspin-injected="prefix"]')).toHaveText('$');
      await expect(w.locator('[data-touchspin-injected="prefix"]')).toHaveClass(/x-prefix/);
      await expect(w.locator('[data-touchspin-injected="postfix"]')).toHaveText('kg');
      await expect(w.locator('[data-touchspin-injected="postfix"]')).toHaveClass(/x-postfix/);

      // focusablebuttons true → tabindex=0 on both
      await expect(w.locator('[data-touchspin-injected="up"]').first()).toHaveAttribute('tabindex', '0');
      await expect(w.locator('[data-touchspin-injected="down"]').first()).toHaveAttribute('tabindex', '0');
    });

    test('vertical: wrapper and button texts/classes; focusability toggle', async ({ page }) => {
      await initializeTouchspinWithRenderer(page, 'test-input', rendererUrl, {
        verticalbuttons: true,
        verticalup: '▲', verticaldown: '▼',
        verticalupclass: 'v-up', verticaldownclass: 'v-down',
        buttonup_class: 'btn-up', buttondown_class: 'btn-down',
        focusablebuttons: false,
      });

      const w = page.getByTestId('test-input-wrapper');
      const up = w.locator('[data-touchspin-injected="up"]');
      const down = w.locator('[data-touchspin-injected="down"]');
      await expect(w.locator('[data-touchspin-injected="vertical-wrapper"]').first()).toBeVisible();
      await expect(up).toHaveText(/▲|\+/);
      await expect(down).toHaveText(/▼|−/);

      // focusablebuttons false → tabindex=-1
      await expect(up.first()).toHaveAttribute('tabindex', '-1');
      await expect(down.first()).toHaveAttribute('tabindex', '-1');

      // Toggle focusability true
      await page.evaluate(() => window.__ts!.requireCoreByTestId('test-input').updateSettings({ focusablebuttons: true }));
      await expect(up.first()).toHaveAttribute('tabindex', '0');
      await expect(down.first()).toHaveAttribute('tabindex', '0');
    });

    test('rebuilds on prefix/postfix toggles', async ({ page }) => {
      await initializeTouchspinWithRenderer(page, 'test-input', rendererUrl, {
        prefix: '$', postfix: 'kg',
      });
      const w = page.getByTestId('test-input-wrapper');
      const prefix = w.locator('[data-touchspin-injected="prefix"]');
      const postfix = w.locator('[data-touchspin-injected="postfix"]');
      await expect(prefix).toBeVisible();
      await expect(postfix).toBeVisible();

      // Remove both → renderer should rebuild or hide appropriately
      await page.evaluate(() => window.__ts!.requireCoreByTestId('test-input').updateSettings({ prefix: '', postfix: '' }));
      // Either hidden or removed; assert not visible
      await expect(prefix).toBeHidden();
      await expect(postfix).toBeHidden();
    });
  });
}

