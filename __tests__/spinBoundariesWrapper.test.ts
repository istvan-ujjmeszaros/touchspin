import { test, expect } from '@playwright/test';

test.describe('Wrapper: spin stops at bounds', () => {
  test('stops at max and allows downOnce', async ({ page }) => {
    await page.goto('/__tests__/html-package/tailwind-renderer-jquery.html');

    // Initialize with tight bounds and fast spin timings
    await page.evaluate(() => {
      const $ = (window as any).jQuery;
      const $input = $('#jq-input');
      $input.TouchSpin({ min: 0, max: 3, step: 1, stepinterval: 20, stepintervaldelay: 20 });
    });

    // Start spinning up to reach max quickly
    await page.evaluate(() => {
      const $ = (window as any).jQuery;
      const $input = $('#jq-input');
      $input.TouchSpin('startupspin');
    });

    // Wait until the value reaches the max
    await page.waitForFunction(() => {
      const el = document.getElementById('jq-input') as HTMLInputElement | null;
      return el && el.value === '3';
    }, { timeout: 2000 });

    // Issue a single downOnce step and ensure it decrements immediately
    await page.evaluate(() => {
      const $ = (window as any).jQuery;
      const $input = $('#jq-input');
      $input.TouchSpin('downonce');
    });

    await page.waitForFunction(() => {
      const el = document.getElementById('jq-input') as HTMLInputElement | null;
      return el && el.value === '2';
    }, { timeout: 500 });
    expect(await page.inputValue('#jq-input')).toBe('2');
  });

  test('stops at min and allows upOnce', async ({ page }) => {
    await page.goto('/__tests__/html-package/tailwind-renderer-jquery.html');

    // Initialize with tight bounds and fast spin timings
    await page.evaluate(() => {
      const $ = (window as any).jQuery;
      const $input = $('#jq-input');
      $input.TouchSpin({ min: 0, max: 3, step: 1, stepinterval: 20, stepintervaldelay: 20 });
      $input.val('2');
    });

    // Start spinning down to reach min quickly
    await page.evaluate(() => {
      const $ = (window as any).jQuery;
      const $input = $('#jq-input');
      $input.TouchSpin('startdownspin');
    });

    // Wait until the value reaches the min
    await page.waitForFunction(() => {
      const el = document.getElementById('jq-input') as HTMLInputElement | null;
      return el && el.value === '0';
    }, { timeout: 2000 });

    // Issue a single upOnce step and ensure it increments immediately
    await page.evaluate(() => {
      const $ = (window as any).jQuery;
      const $input = $('#jq-input');
      $input.TouchSpin('uponce');
    });

    await page.waitForFunction(() => {
      const el = document.getElementById('jq-input') as HTMLInputElement | null;
      return el && el.value === '1';
    }, { timeout: 500 });
    expect(await page.inputValue('#jq-input')).toBe('1');
  });
});
