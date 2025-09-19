import * as apiHelpers from './helpers/touchspinApiHelpers';

import './coverage.hooks';
import { test, expect } from '@playwright/test'

test.describe('ARIA sync and vertical buttons semantics', () => {

  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html'); // Update URL as needed
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'aria-sync');
  });

  test('aria attributes update on value change and settings updates', async ({ page }) => {
    await page.goto('/__tests__/html/destroy-test-bridge.html')

    const input = page.locator('#test-input-callback')

    // Initialize via jQuery on the bridge page
    await page.evaluate(() => {
      const $ = (window as any).jQuery
      const el = document.querySelector('#test-input-callback') as HTMLInputElement
      $(el).TouchSpin({ min: 0, max: 10, step: 2, decimals: 0 })
    })

    // Set a value programmatically and verify aria sync
    await page.evaluate(() => {
      const $ = (window as any).jQuery
      const el = document.querySelector('#test-input-callback') as HTMLInputElement
      $(el).TouchSpin('set', 4)
    })

    await expect(input).toHaveAttribute('aria-valuemin', '0')
    await expect(input).toHaveAttribute('aria-valuemax', '10')
    await expect(input).toHaveAttribute('aria-valuetext', /4/) // may include currency or formatted text

    // Update settings and verify ARIA min/max update
    await page.evaluate(() => {
      const $ = (window as any).jQuery
      const el = document.querySelector('#test-input-callback') as HTMLInputElement
      $(el).TouchSpin('updatesettings', { min: 1, max: 8 })
    })

    // With step=2, effective reachable min aligns to 2
    await expect(input).toHaveAttribute('aria-valuemin', '2')
    await expect(input).toHaveAttribute('aria-valuemax', '8')

    // Increment once and verify aria-valuenow/valuetext
    await page.evaluate(() => {
      const $ = (window as any).jQuery
      const el = document.querySelector('#test-input-callback') as HTMLInputElement
      $(el).TouchSpin('uponce')
    })
    await expect(input).toHaveAttribute('aria-valuetext', /6/)
  })

  test('vertical buttons do not alter change emission semantics', async ({ page }) => {
    await page.goto('/__tests__/html/index-bs5.html')

    const input = page.getByTestId('touchspin-vertical')

    // Ensure known starting state
    await input.evaluate((el: HTMLInputElement) => { el.value = '0' })

    // Reset events log for reliable counting
    await page.evaluate(() => {
      const log = document.getElementById('events_log')
      if (log) log.textContent = ''
    })

    // One programmatic increment via command API
    await page.evaluate(() => {
      const $ = (window as any).jQuery
      const el = document.querySelector('[data-testid="touchspin-vertical"]') as HTMLInputElement
      $(el).TouchSpin('uponce')
    })

    // Trigger focusout sanitation by focusing the blur target
    await page.locator('#blur-target').focus()

    // Count change events from the events log
    const changeCount = await page.evaluate(() => {
      const log = document.getElementById('events_log')
      const txt = (log && log.textContent) || ''
      const matches = txt.match(/change\[/g) || []
      return matches.length
    })
    expect(changeCount).toBe(1)

    await expect(input).toHaveValue('1')
  })
})
