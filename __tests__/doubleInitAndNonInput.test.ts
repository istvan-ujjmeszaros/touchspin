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


  test('should detect non-input elements and log "Must be an input" message', async ({ page }) => {
    // Set up console listener before page load to capture HTML script messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'warning') {
        consoleMessages.push(msg.text());
      }
    });

    // Navigate again to trigger the HTML script execution with console listener active
    await page.goto('/__tests__/html/index-bs4.html');

    // Should log "Must be an input." message from HTML initialization
    await expect.poll(
      () => consoleMessages.some(msg => msg.includes('Must be an input'))
    ).toBe(true);

    // Verify no TouchSpin wrapper was created for the non-input element
    const wrapperExists = await page.evaluate(() => {
      return !!document.querySelector('[data-testid="not-an-input-wrapper"]');
    });
    expect(wrapperExists).toBe(false);
  });
});
