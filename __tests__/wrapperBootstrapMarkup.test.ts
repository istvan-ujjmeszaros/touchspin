import { test, expect } from '@playwright/test';

test.describe('Bootstrap Wrapper Markup', () => {
  test('BS3 wrapper uses input-group-addon and input-group-btn (no BS4/5 wrappers)', async ({ page }) => {
    await page.goto('/__tests__/html-package/index-bs3-wrapper.html');
    // Initialize with prefix/postfix to render addon elements
    await page.evaluate(() => {
      const $ = (window as any).jQuery; const $i = $('#bs3-input');
      try { $i.trigger('touchspin.destroy'); } catch {}
      $i.TouchSpin({ renderer: (window as any).Bootstrap3Renderer, min: 0, max: 100, step: 1, prefix: '$', postfix: 'kg' });
    });
    const wrapper = page.locator('[data-touchspin-injected="wrapper"]');
    await expect(wrapper).toHaveCount(1);
    // BS3 container should be .input-group
    await expect(wrapper).toHaveClass(/input-group/);
    // Prefix/Postfix are input-group-addon
    await expect(wrapper.locator('[data-touchspin-injected="prefix"].input-group-addon')).toHaveCount(1);
    await expect(wrapper.locator('[data-touchspin-injected="postfix"].input-group-addon')).toHaveCount(1);
    // Buttons wrapped in .input-group-btn
    await expect(wrapper.locator('.input-group-btn [data-touchspin-injected="down"]')).toHaveCount(1);
    await expect(wrapper.locator('.input-group-btn [data-touchspin-injected="up"]')).toHaveCount(1);
    // No BS4 wrappers
    await expect(wrapper.locator('.input-group-prepend')).toHaveCount(0);
    await expect(wrapper.locator('.input-group-append')).toHaveCount(0);
  });

  test('BS4 wrapper uses prepend/append wrappers and input-group-text (no BS3 addon)', async ({ page }) => {
    await page.goto('/__tests__/html-package/index-bs4-wrapper.html');
    await page.evaluate(() => {
      const $ = (window as any).jQuery; const $i = $('#bs4-input');
      try { $i.trigger('touchspin.destroy'); } catch {}
      $i.TouchSpin({ renderer: (window as any).Bootstrap4Renderer, min: 0, max: 100, step: 1, prefix: '$', postfix: 'kg' });
    });
    const wrapper = page.locator('[data-touchspin-injected="wrapper"]');
    await expect(wrapper).toHaveCount(1);
    // BS4 container is .input-group
    await expect(wrapper).toHaveClass(/input-group/);
    // Uses input-group-prepend/append wrappers
    const prependCount = await wrapper.locator('.input-group-prepend').count();
    const appendCount = await wrapper.locator('.input-group-append').count();
    expect(prependCount).toBeGreaterThan(0);
    expect(appendCount).toBeGreaterThan(0);
    // Prefix/Postfix contain .input-group-text spans
    await expect(wrapper.locator('[data-touchspin-injected="prefix"] .input-group-text')).toHaveCount(1);
    await expect(wrapper.locator('[data-touchspin-injected="postfix"] .input-group-text')).toHaveCount(1);
    // No BS3 addon elements
    await expect(wrapper.locator('.input-group-addon')).toHaveCount(0);
  });

  test('BS5 wrapper uses input-group-text without prepend/append wrappers', async ({ page }) => {
    await page.goto('/__tests__/html-package/index-bs5-wrapper.html');
    await page.evaluate(() => {
      const $ = (window as any).jQuery; const $i = $('#bs5-input');
      try { $i.trigger('touchspin.destroy'); } catch {}
      $i.TouchSpin({ renderer: (window as any).Bootstrap5Renderer, min: 0, max: 100, step: 1, prefix: '$', postfix: 'kg' });
    });
    const wrapper = page.locator('[data-touchspin-injected="wrapper"]');
    await expect(wrapper).toHaveCount(1);
    // BS5 container is .input-group
    await expect(wrapper).toHaveClass(/input-group/);
    // Prefix/Postfix are .input-group-text directly
    await expect(wrapper.locator('[data-touchspin-injected="prefix"].input-group-text')).toHaveCount(1);
    await expect(wrapper.locator('[data-touchspin-injected="postfix"].input-group-text')).toHaveCount(1);
    // No prepend/append containers (BS4)
    await expect(wrapper.locator('.input-group-prepend')).toHaveCount(0);
    await expect(wrapper.locator('.input-group-append')).toHaveCount(0);
    // No BS3 addon
    await expect(wrapper.locator('.input-group-addon')).toHaveCount(0);
  });
});
