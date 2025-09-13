import { test, expect } from '@playwright/test';

test.describe('Web Component Smoke', () => {
  test('renders and injects controls', async ({ page }) => {
    await page.goto('/packages/web-component/example/index.html');

    const elements = page.locator('touchspin-element');
    await expect(elements.first()).toBeVisible();

    // Wait briefly for internal wiring
    await page.waitForTimeout(200);

    // Controls should be injected
    const upButtons = page.locator('[data-touchspin-injected="up"]');
    const count = await upButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});

