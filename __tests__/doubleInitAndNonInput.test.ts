import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Double Initialization and Non-Input Element Tests', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'doubleInitAndNonInput');
  });

  test('should maintain first initialization settings when double initialized', async ({ page }) => {
    // The HTML already initializes this element twice - just verify first settings are kept
    const settings = await page.evaluate(() => {
      const $input = $('#double-init-input');
      return {
        alreadyinitialized: $input.data('alreadyinitialized'),
        max: $input.attr('aria-valuemax')
      };
    });

    // Should keep first initialization settings (max: 200, step: 5), not second (max: 300, step: 10)
    expect(settings.alreadyinitialized).toBe(true);
    expect(settings.max).toBe('200');

    // Verify functionality works with first settings
    await touchspinHelpers.touchspinClickUp(page, 'double-init-input');
    await touchspinHelpers.waitForTimeout(100);
    expect(await touchspinHelpers.readInputValue(page, 'double-init-input')).toBe('105'); // 100 + 5
  });

  test('should detect non-input elements and log "Must be an input" message', async ({ page }) => {
    // Set up console listener before page load to capture HTML script messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleMessages.push(msg.text());
      }
    });

    // Navigate again to trigger the HTML script execution with console listener active
    await page.goto('/__tests__/html/index-bs4.html');
    await touchspinHelpers.waitForTimeout(500);

    // Should log "Must be an input." message from HTML initialization
    expect(consoleMessages.some(msg => msg.includes('Must be an input'))).toBe(true);

    // Verify no TouchSpin wrapper was created for the non-input element
    const wrapperExists = await page.evaluate(() => {
      return !!document.querySelector('[data-testid="not-an-input-wrapper"]');
    });
    expect(wrapperExists).toBe(false);
  });
});
