/**
 * @file Web Component smoke tests (Bootstrap 5)
 * Tests basic functionality of <touchspin-input> custom element
 */

import { expect, test } from '@playwright/test';

test.describe('TouchSpin Web Component - Bootstrap 5', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to fixture HTML
    await page.goto('/packages/adapters/webcomponent/tests/fixtures/smoke-test.html');

    // Wait for web component to be defined
    await page.waitForFunction(() => {
      return customElements.get('touchspin-input') !== undefined;
    });

    // Wait for TouchSpin to initialize
    await page.waitForSelector('[data-testid="wc-test-up"]');
  });

  test('1. Renders touchspin-input; inc/dec clicks update value & aria-valuenow', async ({
    page,
  }) => {
    // Given: Web component is rendered with initial value
    const input = page.getByTestId('wc-test');
    await expect(input).toHaveValue('10');

    const upButton = page.getByTestId('wc-test-up');
    const downButton = page.getByTestId('wc-test-down');

    // When: Click increment button
    await upButton.click();

    // Then: Value increases to 11
    await expect(input).toHaveValue('11');
    await expect(input).toHaveAttribute('aria-valuenow', '11');

    // When: Click decrement button twice
    await downButton.click();
    await downButton.click();

    // Then: Value decreases to 9
    await expect(input).toHaveValue('9');
    await expect(input).toHaveAttribute('aria-valuenow', '9');
  });

  test('2. Form submit includes the input name=value', async ({ page }) => {
    // Given: Web component with name="quantity"
    const form = page.getByTestId('test-form');
    const input = page.getByTestId('wc-test');

    // Verify input has correct name attribute
    await expect(input).toHaveAttribute('name', 'quantity');

    // When: Change value and submit form
    const upButton = page.getByTestId('wc-test-up');
    await upButton.click(); // 10 -> 11

    // Capture form data on submit
    const formDataPromise = page.evaluate(() => {
      return new Promise((resolve) => {
        const form = document.querySelector('[data-testid="test-form"]') as HTMLFormElement;
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(form);
          const data: Record<string, string> = {};
          formData.forEach((value, key) => {
            data[key] = value as string;
          });
          resolve(data);
        });
      });
    });

    await form.evaluate((f) => (f as HTMLFormElement).requestSubmit());

    // Then: Form data includes quantity=11
    const formData = (await formDataPromise) as Record<string, string>;
    expect(formData.quantity).toBe('11');
  });

  test('3. Idempotent define: importing WC twice does not throw', async ({ page }) => {
    // Given: Web component already loaded in beforeEach

    // Track console warnings
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    // When: Try to import the same renderer again
    await page.evaluate(() => {
      const script = document.createElement('script');
      script.src = '/devdist/adapters/webcomponent/umd/bootstrap5.global.js';
      document.body.appendChild(script);
      return new Promise((resolve) => {
        script.onload = resolve;
      });
    });

    // Then: No errors thrown (element already defined, should skip)
    // Note: customElements.define() throws if element is already defined,
    // but our auto-define logic checks first and skips

    // Verify element still works
    const input = page.getByTestId('wc-test');
    await expect(input).toHaveValue('10');

    const upButton = page.getByTestId('wc-test-up');
    await upButton.click();
    await expect(input).toHaveValue('11');

    // Note: Dev-only console.warn is not tested here as it requires NODE_ENV=development
    // In production builds, the warning is stripped out
  });
});
