import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';
import './coverage.hooks';

test.describe('Cross-Version Renderer Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'cross-version-consistency');
  });

  const buttonBehaviorCases = [
    { name: 'Bootstrap 3', html: 'index-bs3.html' },
    { name: 'Bootstrap 4', html: 'index-bs4.html' },
    { name: 'Bootstrap 5', html: 'index-bs5.html' }
  ] as const;

  for (const { name, html } of buttonBehaviorCases) {
    test(`should maintain consistent button behavior (${name})`, async ({ page }, testInfo) => {
      testInfo.setTimeout(30000);
      await page.goto(`/__tests__/html/${html}`);
      await touchspinHelpers.getWrapperInstanceWhenReady(page, 'touchspin-default');

      // Reset value and test increment
      await touchspinHelpers.fillWithValue(page, 'touchspin-default', '50');
      await touchspinHelpers.touchspinClickUp(page, 'touchspin-default');

      await expect.poll(
        async () => await touchspinHelpers.readInputValue(page, 'touchspin-default')
      ).toBe('51');
    });
  }

  const structureCases = ['index-bs3.html', 'index-bs4.html', 'index-bs5.html'] as const;
  for (const html of structureCases) {
    test(`should generate valid HTML structure (${html})`, async ({ page }, testInfo) => {
      testInfo.setTimeout(20000);
      await page.goto(`/__tests__/html/${html}`);
      const wrapper = await touchspinHelpers.getWrapperInstanceWhenReady(page, 'touchspin-default');

      // Validate basic structure exists using data-testid selectors (consistent across versions)
      const hasUpButton = wrapper.getByTestId('touchspin-default-up');
      const hasDownButton = wrapper.getByTestId('touchspin-default-down');

      await expect(hasUpButton).toBeVisible();
      await expect(hasDownButton).toBeVisible();
      await expect(wrapper).toBeVisible();
    });
  }

  for (const html of structureCases) {
    test(`should maintain consistent data-touchspin-injected attributes (${html})`, async ({ page }, testInfo) => {
      testInfo.setTimeout(20000);
      await page.goto(`/__tests__/html/${html}`);

      const wrapper = await touchspinHelpers.getWrapperInstanceWhenReady(page, 'touchspin-default');
      await expect(wrapper).toHaveAttribute('data-touchspin-injected', 'wrapper');
      await expect(wrapper.getByTestId('touchspin-default-up')).toBeVisible();
      await expect(wrapper.getByTestId('touchspin-default-down')).toBeVisible();

      await expect(wrapper.getByTestId('touchspin-default-prefix')).toHaveCount(0);
      await expect(wrapper.getByTestId('touchspin-default-postfix')).toHaveCount(0);
    });
  }

  const ppVersions = ['index-bs3.html', 'index-bs4.html', 'index-bs5.html'] as const;
  for (const html of ppVersions) {
    test(`should maintain consistent prefix/postfix elements when initialized with values (${html})`, async ({ page }, testInfo) => {
      testInfo.setTimeout(20000);
      await page.goto(`/__tests__/html/${html}`);

      // Initialize the test input with prefix and postfix values (fresh init per page)
      await page.evaluate(() => {
        const $ = (window as any).jQuery;
        try { $('#testinput_prefix_postfix').trigger('touchspin.destroy'); } catch {}
        $('#testinput_prefix_postfix').TouchSpin({ prefix: '$', postfix: '.00' });
      });

      // Wait for wrapper fully injected
      const wrapper = await touchspinHelpers.getWrapperInstanceWhenReady(page, 'prefix-postfix-wrapper');

      // Prefer role-based selectors to avoid relying on testid propagation timing
      const prefixEl = wrapper.locator('[data-touchspin-injected="prefix"]').first();
      const postfixEl = wrapper.locator('[data-touchspin-injected="postfix"]').first();

      await expect(prefixEl).toBeVisible();
      await expect(postfixEl).toBeVisible();
      await expect(prefixEl).toHaveText('$');
      await expect(postfixEl).toHaveText('.00');
    });
  }

  const functionalCases = [
    { name: 'Bootstrap 3', html: 'index-bs3.html' },
    { name: 'Bootstrap 4', html: 'index-bs4.html' },
    { name: 'Bootstrap 5', html: 'index-bs5.html' },
    { name: 'Tailwind', html: 'index-tailwind.html' }
  ] as const;

  for (const { name, html } of functionalCases) {
    test(`should maintain consistent functional behavior (${name})`, async ({ page }, testInfo) => {
      testInfo.setTimeout(30000);
      await page.goto(`/__tests__/html/${html}`);

      const wrapper = page.locator('[data-testid$="-wrapper"][data-touchspin-injected]').first();
      await expect(wrapper).toBeAttached();
      const input = wrapper.locator('input');
      const upButton = wrapper.locator('[data-testid$="-up"]');
      const downButton = wrapper.locator('[data-testid$="-down"]');

      // Reset to known state
      await input.fill('10');

      // Test increment
      await upButton.click();
      expect(await input.inputValue()).toBe('11');

      // Test decrement
      await downButton.click();
      expect(await input.inputValue()).toBe('10');

      // Test that prefix/postfix are visible only when they have content
      const prefix = wrapper.locator('[data-testid$="-prefix"]');
      const postfix = wrapper.locator('[data-testid$="-postfix"]');

      if (await prefix.count() > 0) {
        const prefixText = await prefix.evaluate(el => (el.textContent || '').trim());
        if (prefixText.length > 0) {
          await expect(prefix).toBeVisible();
        }
      }
      if (await postfix.count() > 0) {
        const postfixText = await postfix.evaluate(el => (el.textContent || '').trim());
        if (postfixText.length > 0) {
          await expect(postfix).toBeVisible();
        }
      }
    });
  }
});
