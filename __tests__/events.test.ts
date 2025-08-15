import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Events', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test('should increase value by 1 when clicking the + button', async ({ page }) => {
    const testid: string = 'touchspin-default';

    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, testid);

    expect(await touchspinHelpers.readInputValue(page, testid)).toBe('51');
  });

  test('should fire the change event only once when updating the value', async ({ page }) => {
    const testid: string = 'touchspin-default';

    // Trigger the TouchSpin button
    await touchspinHelpers.touchspinClickUp(page, testid);

    // Wait for a period to ensure all events are processed (the click event is waiting for 200ms, so we are using a larger value to be on the safe side)
    await touchspinHelpers.waitForTimeout(300);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
  });

  test('should fire the change event exactly once when entering a proper value and pressing TAB', async ({ page }) => {
    const testid: string = 'touchspin-default';

    await touchspinHelpers.fillWithValue(page, testid, '67');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Tab');

    // Wait for a short period to ensure all events are processed
    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
  });

  test('Should fire the change event only once when correcting the value according to step after pressing TAB', async ({ page }) => {
    const testid: string = 'touchspin-step10-min';

    await touchspinHelpers.fillWithValue(page, testid, '67');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Tab');

    // Wait for a short period to ensure all events are processed
    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
  });

  test('Should fire the change event only once when correcting the value according to step after pressing Enter', async ({ page }) => {
    const testid: string = 'touchspin-step10-min';

    await touchspinHelpers.fillWithValue(page, testid, '67');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Enter');

    // Wait for a short period to ensure all events are processed
    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
  });

  test('Should not fire change event when already at max value and entering a higher value', async ({ page }) => {
    const testid: string = 'touchspin-step10-max';

    await touchspinHelpers.fillWithValue(page, testid, '117');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Enter');

    // Wait for a short period to ensure all events are processed
    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(0);
    expect(await touchspinHelpers.countChangeWithValue(page, "100")).toBe(0);
  });

  test('Should not fire change event when already at min value and entering a lower value', async ({ page }) => {
    const testid: string = 'touchspin-step10-min';

    await touchspinHelpers.fillWithValue(page, testid, '-55');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Enter');

    // Wait for a short period to ensure all events are processed
    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(0);
    expect(await touchspinHelpers.countChangeWithValue(page, "0")).toBe(0);
  });

  test('Should use the callback on the initial value', async ({ page }) => {
    // TODO: Add testid to input_callbacks in HTML files
    const selector: string = '#input_callbacks';

    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('$5,000.00');
  });

  test('Should have the decorated value when firing the change event', async ({ page }) => {
    // TODO: Add testid to input_callbacks in HTML files
    const selector: string = '#input_callbacks';

    await touchspinHelpers.fillWithValue(page, selector, '1000');

    await page.keyboard.press('Enter');

    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.countChangeWithValue(page, '$1,000.00')).toBe(1);
  });

  test('Should have the decorated value on blur', async ({ page }) => {
    // TODO: Add testid to input_callbacks in HTML files
    const selector: string = '#input_callbacks';

    await touchspinHelpers.fillWithValue(page, selector, '1000');

    // TODO: Add testid to input_group_lg in HTML files
    await page.click('#input_group_lg', { clickCount: 1 });

    expect(await touchspinHelpers.countChangeWithValue(page, '1000')).toBe(0);
    expect(await touchspinHelpers.countChangeWithValue(page, '$1,000.00')).toBe(1);
  });

  test('The touchspin.on.min and touchspin.on.max events should fire as soon as the value reaches the minimum or maximum value', async ({ page }) => {
    const testid: string = 'touchspin-default';

    await touchspinHelpers.fillWithValue(page, testid, '1');
    await page.keyboard.press('ArrowDown');
    expect(await touchspinHelpers.countEvent(page, testid, 'touchspin.on.min')).toBe(1);

    await touchspinHelpers.fillWithValue(page, testid, '99');
    await page.keyboard.press('ArrowUp');
    expect(await touchspinHelpers.countEvent(page, testid, 'touchspin.on.max')).toBe(1);
  });

});
