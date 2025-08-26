import { test, expect } from '@playwright/test'

test.describe('ARIA sync and vertical buttons semantics', () => {
  test('aria attributes update on value change and settings updates', async ({ page }) => {
    await page.goto('/__tests__/html/destroy-test-bridge.html')

    const input = page.locator('#bridge-input')

    // Initialize via jQuery on the bridge page
    await page.evaluate(() => {
      const $ = (window as any).jQuery
      const el = document.querySelector('#bridge-input') as HTMLInputElement
      $(el).TouchSpin({ min: 0, max: 10, step: 2, decimals: 0 })
    })

    // Set a value programmatically and verify aria sync
    await page.evaluate(() => {
      const $ = (window as any).jQuery
      const el = document.querySelector('#bridge-input') as HTMLInputElement
      $(el).TouchSpin('set', 4)
    })

    await expect(input).toHaveAttribute('aria-valuemin', '0')
    await expect(input).toHaveAttribute('aria-valuemax', '10')
    await expect(input).toHaveAttribute('aria-valuetext', /4/) // may include currency or formatted text

    // Update settings and verify ARIA min/max update
    await page.evaluate(() => {
      const $ = (window as any).jQuery
      const el = document.querySelector('#bridge-input') as HTMLInputElement
      $(el).TouchSpin('updatesettings', { min: 1, max: 8 })
    })

    await expect(input).toHaveAttribute('aria-valuemin', '1')
    await expect(input).toHaveAttribute('aria-valuemax', '8')

    // Increment once and verify aria-valuenow/valuetext
    await page.evaluate(() => {
      const $ = (window as any).jQuery
      const el = document.querySelector('#bridge-input') as HTMLInputElement
      $(el).TouchSpin('uponce')
    })
    await expect(input).toHaveAttribute('aria-valuetext', /6/)
  })

  test('vertical buttons do not alter change emission semantics', async ({ page }) => {
    await page.goto('/__tests__/html/destroy-test-bridge.html')

    const input = page.locator('#bridge-input')

    // Re-init with vertical buttons and step=1 for easier assertions
    await page.evaluate(() => {
      const $ = (window as any).jQuery
      const el = document.querySelector('#bridge-input') as HTMLInputElement
      $(el).TouchSpin('destroy')
      $(el).val('0')
      $(el).TouchSpin({ min: 0, max: 3, step: 1, verticalbuttons: true })
    })

    // Count change events while performing a single upOnce and a focusout sanitation
    await page.evaluate(() => {
      const el = document.querySelector('#bridge-input') as HTMLInputElement
      ;(el as any)._changeCount = 0
      el.addEventListener('change', () => { (el as any)._changeCount++ })
    })

    // One programmatic increment
    await page.evaluate(() => {
      const $ = (window as any).jQuery
      const el = document.querySelector('#bridge-input') as HTMLInputElement
      $(el).TouchSpin('uponce')
    })

    // Trigger focusout sanitation by focusing another element on the page
    await page.locator('#legacy-events .btn-destroy').focus()

    // Read change count; should be exactly 1 (no duplicate from focusout)
    const changeCount = await page.evaluate(() => {
      const el = document.querySelector('#bridge-input') as any
      return el._changeCount
    })
    expect(changeCount).toBe(1)

    await expect(input).toHaveValue('1')
  })
})
