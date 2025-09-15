import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';


test.describe('Vanilla Renderer Smoke', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html'); // Update URL as needed
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'vanilla.smoke');
  });

  test('renders and injects controls', async ({ page }) => {
    await page.goto('/packages/vanilla-renderer/example/index.html');

    const basic = page.locator('#basic');
    await expect(basic).toBeVisible();

    // Wait for injected up/down controls to appear
    const upButtons = page.locator('[data-touchspin-injected="up"]');
    await expect(upButtons.first()).toBeVisible();

    // Sanity: some injected controls exist on the page
    const count = await upButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});

