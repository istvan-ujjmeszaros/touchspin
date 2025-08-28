import { test, expect } from '@playwright/test';

test.describe('Wrapper parity: attribute sync', () => {
  test('disabled/readonly stop spin and prevent changes', async ({ page }) => {
    await page.goto('/__tests__/html/tailwind-renderer-jquery.html');
    await page.click('#btn-init');
    await page.focus('#jq-input');

    // Set disabled and try keyboard
    await page.evaluate(() => {
      const $ = (window as any).jQuery; $('#jq-input').attr('disabled', '');
    });
    const before = await page.inputValue('#jq-input');
    await page.keyboard.press('ArrowUp');
    const after = await page.inputValue('#jq-input');
    expect(after).toBe(before);

    // Clear disabled, set readonly
    await page.evaluate(() => {
      const $ = (window as any).jQuery; $('#jq-input').removeAttr('disabled').attr('readonly', '');
    });
    await page.keyboard.press('ArrowUp');
    const after2 = await page.inputValue('#jq-input');
    expect(after2).toBe(before);
  });

  test('min/max/step sync via native attrs', async ({ page }) => {
    await page.goto('/__tests__/html/tailwind-renderer-jquery.html');
    await page.click('#btn-init');
    await page.focus('#jq-input');

    // Set step to 2 and min to current value + 2, then ArrowUp should increment by 2
    await page.evaluate(() => {
      const $ = (window as any).jQuery; const el = $('#jq-input');
      const v = Number(el.val());
      el.attr('step','2');
      el.attr('min', String(v));
    });
    const before = await page.inputValue('#jq-input');
    await page.keyboard.press('ArrowUp');
    const after = await page.inputValue('#jq-input');
    expect(Number(after)).toBe(Number(before) + 2);
  });
});

