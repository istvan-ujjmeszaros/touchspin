import { test, expect } from '@playwright/test';

test.describe('Tailwind TouchSpin Visual Regression', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/__tests__/visual/tailwind-visual.html');
    // Wait for TouchSpin initialization and Tailwind to apply styles
    await page.waitForTimeout(500);
  });

  test.describe('Basic States', () => {
    test('default state', async ({ page }) => {
      const spinner = page.locator('[data-testid="basic-default-wrapper"]');
      await expect(spinner).toHaveScreenshot('basic-default.png');
    });

    test('focused state', async ({ page }) => {
      const input = page.locator('[data-testid="basic-focus"]');
      await input.focus();
      const spinner = page.locator('[data-testid="basic-focus-wrapper"]');
      await expect(spinner).toHaveScreenshot('basic-focused.png');
    });

    test('disabled state', async ({ page }) => {
      const spinner = page.locator('[data-testid="basic-disabled-wrapper"]');
      await expect(spinner).toHaveScreenshot('basic-disabled.png');
    });

    test('readonly state', async ({ page }) => {
      const spinner = page.locator('[data-testid="basic-readonly-wrapper"]');
      await expect(spinner).toHaveScreenshot('basic-readonly.png');
    });

    test('hover on up button', async ({ page }) => {
      const spinner = page.locator('[data-testid="basic-default-wrapper"]');
      const upButton = spinner.locator('[data-touchspin-injected="up"]');
      await upButton.hover();
      await expect(spinner).toHaveScreenshot('basic-hover-up.png');
    });

    test('hover on down button', async ({ page }) => {
      const spinner = page.locator('[data-testid="basic-default-wrapper"]');
      const downButton = spinner.locator('[data-touchspin-injected="down"]');
      await downButton.hover();
      await expect(spinner).toHaveScreenshot('basic-hover-down.png');
    });

    test('active up button', async ({ page }) => {
      const spinner = page.locator('[data-testid="basic-default-wrapper"]');
      const upButton = spinner.locator('[data-touchspin-injected="up"]');
      await upButton.dispatchEvent('mousedown');
      await expect(spinner).toHaveScreenshot('basic-active-up.png');
    });

    test('active down button', async ({ page }) => {
      const spinner = page.locator('[data-testid="basic-default-wrapper"]');
      const downButton = spinner.locator('[data-touchspin-injected="down"]');
      await downButton.dispatchEvent('mousedown');
      await expect(spinner).toHaveScreenshot('basic-active-down.png');
    });
  });

  test.describe('Size Variations', () => {
    test('small size', async ({ page }) => {
      const spinner = page.locator('[data-testid="size-small-wrapper"]');
      await expect(spinner).toHaveScreenshot('size-small.png');
    });

    test('default size', async ({ page }) => {
      const spinner = page.locator('[data-testid="size-default-wrapper"]');
      await expect(spinner).toHaveScreenshot('size-default.png');
    });

    test('large size', async ({ page }) => {
      const spinner = page.locator('[data-testid="size-large-wrapper"]');
      await expect(spinner).toHaveScreenshot('size-large.png');
    });

    test('extra large size', async ({ page }) => {
      const spinner = page.locator('[data-testid="size-xlarge-wrapper"]');
      await expect(spinner).toHaveScreenshot('size-xlarge.png');
    });

    test('all sizes comparison', async ({ page }) => {
      const section = page.locator('[data-testid="size-variations-section"]');
      await expect(section).toHaveScreenshot('sizes-all.png');
    });
  });

  test.describe('Prefix and Postfix', () => {
    test('with currency prefix', async ({ page }) => {
      const spinner = page.locator('[data-testid="with-prefix-wrapper"]');
      await expect(spinner).toHaveScreenshot('prefix-currency.png');
    });

    test('with unit postfix', async ({ page }) => {
      const spinner = page.locator('[data-testid="with-postfix-wrapper"]');
      await expect(spinner).toHaveScreenshot('postfix-unit.png');
    });

    test('with both prefix and postfix', async ({ page }) => {
      const spinner = page.locator('[data-testid="with-both-wrapper"]');
      await expect(spinner).toHaveScreenshot('prefix-postfix-both.png');
    });

    test('all prefix/postfix comparison', async ({ page }) => {
      const section = page.locator('[data-testid="prefix-postfix-section"]');
      await expect(section).toHaveScreenshot('prefix-postfix-all.png');
    });
  });

  test.describe('Button Layouts', () => {
    test('horizontal buttons', async ({ page }) => {
      const spinner = page.locator('[data-testid="horizontal-buttons-wrapper"]');
      await expect(spinner).toHaveScreenshot('buttons-horizontal.png');
    });

    test('vertical buttons', async ({ page }) => {
      const spinner = page.locator('[data-testid="vertical-buttons-wrapper"]');
      await expect(spinner).toHaveScreenshot('buttons-vertical.png');
    });

    test('custom button text', async ({ page }) => {
      const spinner = page.locator('[data-testid="custom-buttons-wrapper"]');
      await expect(spinner).toHaveScreenshot('buttons-custom-text.png');
    });

    test('all button layouts comparison', async ({ page }) => {
      const section = page.locator('[data-testid="button-layouts-section"]');
      await expect(section).toHaveScreenshot('buttons-all.png');
    });
  });

  test.describe('Decimal Values', () => {
    test('2 decimal places', async ({ page }) => {
      const spinner = page.locator('[data-testid="decimal-2-wrapper"]');
      await expect(spinner).toHaveScreenshot('decimal-2-places.png');
    });

    test('4 decimal places', async ({ page }) => {
      const spinner = page.locator('[data-testid="decimal-4-wrapper"]');
      await expect(spinner).toHaveScreenshot('decimal-4-places.png');
    });

    test('all decimal variations', async ({ page }) => {
      const section = page.locator('[data-testid="decimal-section"]');
      await expect(section).toHaveScreenshot('decimal-all.png');
    });
  });

  test.describe('Min/Max States', () => {
    test('at minimum value', async ({ page }) => {
      const spinner = page.locator('[data-testid="at-minimum-wrapper"]');
      await expect(spinner).toHaveScreenshot('minmax-at-minimum.png');

      // Visual test captures the state at minimum - button may or may not be disabled
      // depending on TouchSpin implementation
    });

    test('at maximum value', async ({ page }) => {
      const spinner = page.locator('[data-testid="at-maximum-wrapper"]');
      await expect(spinner).toHaveScreenshot('minmax-at-maximum.png');

      // Visual test captures the state at maximum - button may or may not be disabled
      // depending on TouchSpin implementation
    });

    test('all min/max states', async ({ page }) => {
      const section = page.locator('[data-testid="minmax-section"]');
      await expect(section).toHaveScreenshot('minmax-all.png');
    });
  });

  test.describe('Full Page Sections', () => {
    test('basic states section', async ({ page }) => {
      const section = page.locator('[data-testid="basic-states-section"]');
      await expect(section).toHaveScreenshot('section-basic-states.png');
    });

    test('full page snapshot', async ({ page }) => {
      await expect(page).toHaveScreenshot('full-page.png', {
        fullPage: true,
        maxDiffPixels: 100 // Allow small differences for full page
      });
    });
  });

  test.describe('Responsive Viewports', () => {
    test('mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForTimeout(500);

      const basicSpinner = page.locator('[data-testid="basic-default-wrapper"]');
      await expect(basicSpinner).toHaveScreenshot('responsive-mobile.png');
    });

    test('tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await page.waitForTimeout(500);

      const basicSpinner = page.locator('[data-testid="basic-default-wrapper"]');
      await expect(basicSpinner).toHaveScreenshot('responsive-tablet.png');
    });

    test('desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();
      await page.waitForTimeout(500);

      const basicSpinner = page.locator('[data-testid="basic-default-wrapper"]');
      await expect(basicSpinner).toHaveScreenshot('responsive-desktop.png');
    });
  });

  test.describe('Interactive States', () => {
    test('after increment', async ({ page }) => {
      const spinner = page.locator('[data-testid="basic-default-wrapper"]');
      const upButton = spinner.locator('[data-touchspin-injected="up"]');

      await upButton.click();
      await page.waitForTimeout(100);

      await expect(spinner).toHaveScreenshot('interactive-after-increment.png');

      // Verify value changed
      const input = page.locator('[data-testid="basic-default"]');
      const value = await input.inputValue();
      expect(value).toBe('51');
    });

    test('after decrement', async ({ page }) => {
      const spinner = page.locator('[data-testid="basic-default-wrapper"]');
      const downButton = spinner.locator('[data-touchspin-injected="down"]');

      await downButton.click();
      await page.waitForTimeout(100);

      await expect(spinner).toHaveScreenshot('interactive-after-decrement.png');

      // Verify value changed
      const input = page.locator('[data-testid="basic-default"]');
      const value = await input.inputValue();
      expect(value).toBe('49');
    });

    test('manual value entry', async ({ page }) => {
      const input = page.locator('[data-testid="basic-default"]');

      await input.click({ clickCount: 3 }); // Select all
      await input.type('75');
      await input.press('Tab');
      await page.waitForTimeout(100);

      const spinner = page.locator('[data-testid="basic-default-wrapper"]');
      await expect(spinner).toHaveScreenshot('interactive-manual-entry.png');

      // Verify value
      const value = await input.inputValue();
      expect(value).toBe('75');
    });
  });

  test.describe('Error States', () => {
    test('invalid manual entry - corrected to max', async ({ page }) => {
      const input = page.locator('[data-testid="basic-default"]');

      await input.click({ clickCount: 3 });
      await input.type('999'); // Above max of 100
      await input.press('Tab');
      await page.waitForTimeout(100);

      const spinner = page.locator('[data-testid="basic-default-wrapper"]');
      await expect(spinner).toHaveScreenshot('error-corrected-to-max.png');

      // Verify corrected to max
      const value = await input.inputValue();
      expect(value).toBe('100');
    });

    test('invalid manual entry - corrected to min', async ({ page }) => {
      const input = page.locator('[data-testid="basic-default"]');

      await input.click({ clickCount: 3 });
      await input.type('-10'); // Below min of 0
      await input.press('Tab');
      await page.waitForTimeout(100);

      const spinner = page.locator('[data-testid="basic-default-wrapper"]');
      await expect(spinner).toHaveScreenshot('error-corrected-to-min.png');

      // Verify corrected to min
      const value = await input.inputValue();
      expect(value).toBe('0');
    });
  });
});