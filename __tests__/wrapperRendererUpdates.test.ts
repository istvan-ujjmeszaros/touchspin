import { test, expect } from '@playwright/test';

test.describe('Wrapper renderer updates on settings change (P18)', () => {
  test('updates prefix/postfix text and extraclasses via updatesettings', async ({ page }) => {
    await page.goto('/__tests__/html-package/tailwind-renderer-jquery.html');
    await page.click('#btn-init');

    // Apply updates: add prefix/postfix text and extra classes
    await page.evaluate(() => {
      const $ = (window as any).jQuery; const $i = $('#jq-input');
      $i.trigger('touchspin.updatesettings', [{ prefix: 'USD', postfix: 'kg', prefix_extraclass: 'tw-prefix-x', postfix_extraclass: 'tw-postfix-y' }]);
    });

    // Query elements inside wrapper
    const prefix = page.locator('[data-touchspin-injected="wrapper"] [data-touchspin-injected="prefix"]');
    const postfix = page.locator('[data-touchspin-injected="wrapper"] [data-touchspin-injected="postfix"]');

    await expect(prefix).toHaveText('USD');
    await expect(postfix).toHaveText('kg');

    // Class updates applied
    const prefixClass = await prefix.evaluate(el => el.className);
    const postfixClass = await postfix.evaluate(el => el.className);
    expect(prefixClass).toContain('tw-prefix-x');
    expect(postfixClass).toContain('tw-postfix-y');

    // Change classes again to ensure removal then add works
    await page.evaluate(() => {
      const $ = (window as any).jQuery; const $i = $('#jq-input');
      $i.trigger('touchspin.updatesettings', [{ prefix_extraclass: 'tw-prefix-z', postfix_extraclass: 'tw-postfix-q' }]);
    });
    const prefixClass2 = await prefix.evaluate(el => el.className);
    const postfixClass2 = await postfix.evaluate(el => el.className);
    expect(prefixClass2).not.toContain('tw-prefix-x');
    expect(postfixClass2).not.toContain('tw-postfix-y');
    expect(prefixClass2).toContain('tw-prefix-z');
    expect(postfixClass2).toContain('tw-postfix-q');
  });
});

