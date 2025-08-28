import { test, expect } from '@playwright/test';

test.describe('Tailwind advanced container', () => {
  test('enhances [data-touchspin-advanced] and cleans up on destroy', async ({ page }) => {
    await page.goto('/__tests__/html-package/tailwind-renderer-jquery.html');

    const container = page.locator('#tw-adv-container');
    const input = page.locator('#tw-adv-input');

    await expect(container).toBeVisible();
    await expect(input).toBeVisible();

    // Initialize advanced widget
    await page.click('#btn-adv-init');

    // The container should be marked as enhanced and have one up/down button
    await expect(container).toHaveAttribute('data-touchspin-injected', 'enhanced-wrapper');
    await expect(container.locator('.bootstrap-touchspin-down')).toHaveCount(1);
    await expect(container.locator('.bootstrap-touchspin-up')).toHaveCount(1);

    // Prefix/Postfix should be injected when provided in settings
    await expect(container.locator('[data-touchspin-injected="prefix"]')).toHaveCount(1);
    await expect(container.locator('[data-touchspin-injected="postfix"]')).toHaveCount(1);

    // Destroy should remove injected elements but leave container and input intact
    await page.click('#btn-adv-destroy');

    await expect(container).toBeVisible();
    await expect(input).toBeVisible();
    await expect(container.locator('[data-touchspin-injected]')).toHaveCount(0);
    await expect(container.locator('.bootstrap-touchspin-down')).toHaveCount(0);
    await expect(container.locator('.bootstrap-touchspin-up')).toHaveCount(0);
  });
});

