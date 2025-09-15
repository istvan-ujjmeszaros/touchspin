// @ts-check
import { test, expect } from '@playwright/test';

test.describe('jQuery Event Cleanup', () => {

  const getJQueryEventCount = async (page, inputId: string) => {
    return await page.evaluate((id) => {
      const input = document.getElementById(id);
      if (!input) return 0;

      const $ = window.jQuery;
      const events = $._data ? $._data(input, 'events') : $(input).data('events');

      if (!events) return 0;

      return Object.keys(events).reduce((sum, type) => {
        return sum + events[type].length;
      }, 0);
    }, inputId);
  };

  test('should clean up jQuery events on destroy', async ({ page }) => {
    await page.goto('/__tests__/html-package/jquery-plugin-smoke.html');

    const initButton = page.locator('#btn-init');
    const destroyButton = page.locator('#btn-destroy');
    const input = page.locator('#jq-input');

    const beforeInit = await getJQueryEventCount(page, 'jq-input');

    await initButton.click();
    const afterInit = await getJQueryEventCount(page, 'jq-input');

    // Verify plugin is functional
    const initialValue = await input.inputValue();
    await page.evaluate(() => {
      $('#jq-input').trigger('touchspin.uponce');
    });
    const newValue = await input.inputValue();
    expect(Number(newValue)).toBe(Number(initialValue) + 1);

    await destroyButton.click();
    const afterDestroy = await getJQueryEventCount(page, 'jq-input');

    expect(afterInit).toBeGreaterThan(beforeInit);
    expect(afterDestroy).toBe(7);
  });
});