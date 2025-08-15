import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Core functionality', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/__tests__/html/index-bs4.html');
    await touchspinHelpers.waitForTouchSpinReady(page, '#testinput_default');
  });

  test('should render TouchSpin buttons and handle basic increment/decrement', async ({ page }) => {
    const selector = '#testinput_default';

    // Check buttons exist - use .first() since there are multiple TouchSpin instances on the page
    const upButton = page.locator('.bootstrap-touchspin-up').first();
    const downButton = page.locator('.bootstrap-touchspin-down').first();
    await expect(upButton).toBeVisible();
    await expect(downButton).toBeVisible();

    // Test increment
    await touchspinHelpers.touchspinClickUp(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');

    // Test decrement
    await touchspinHelpers.touchspinClickDown(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
  });

  test('should respect disabled and readonly states', async ({ page }) => {
    const selector = '#testinput_default';

    // Test disabled input
    await touchspinHelpers.setInputAttr(page, selector, 'disabled', true);
    await touchspinHelpers.touchspinClickUp(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
    expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, selector)).toBe(true);

    // Reset and test readonly
    await touchspinHelpers.setInputAttr(page, selector, 'disabled', false);
    await touchspinHelpers.setInputAttr(page, selector, 'readonly', true);
    await touchspinHelpers.touchspinClickUp(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
    expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, selector)).toBe(true);
  });

  test('should initialize with correct disabled state for pre-disabled inputs', async ({ page }) => {
    const disabledSelector = '#testinput_disabled';
    const readonlySelector = '#testinput_readonly';

    expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, disabledSelector)).toBe(true);
    expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, readonlySelector)).toBe(true);
  });

  test('should handle custom step values correctly', async ({ page }) => {
    const selector = '#testinput_individual_min_max_step_properties';

    // The initial value should be corrected to align with step=3
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');

    // Increment should increase by step amount (3)
    await touchspinHelpers.touchspinClickUp(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('54');

    // Additional increments
    await touchspinHelpers.touchspinClickUp(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('57');
  });

  test('should handle min/max boundaries', async ({ page }) => {
    const selector = '#testinput_individual_min_max_step_properties';
    
    // Test reaching max value triggers event
    const initialMaxEvents = await touchspinHelpers.countEvent(page, selector, 'touchspin.on.max');
    
    // Multiple clicks should eventually hit the max
    for (let i = 0; i < 5; i++) {
      await touchspinHelpers.touchspinClickUp(page, selector);
    }
    
    const finalMaxEvents = await touchspinHelpers.countEvent(page, selector, 'touchspin.on.max');
    expect(finalMaxEvents).toBeGreaterThan(initialMaxEvents);
  });

  test('should support keyboard navigation', async ({ page }) => {
    const selector = '#testinput_default';
    
    await page.focus(selector);
    await page.keyboard.press('ArrowUp');
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    
    await page.keyboard.press('ArrowDown');
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
  });

  test('should support mousewheel interaction', async ({ page }) => {
    const selector = '#testinput_default';
    
    await page.focus(selector);
    
    // Simulate wheel up event (should increment)
    await page.evaluate((sel) => {
      const input = document.querySelector(sel);
      const $ = (window as any).$;
      if ($ && input) {
        $(input).trigger($.Event('mousewheel', {
          originalEvent: { deltaY: -100, wheelDelta: 100 }
        }));
      }
    }, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    
    // Simulate wheel down event (should decrement)
    await page.evaluate((sel) => {
      const input = document.querySelector(sel);
      const $ = (window as any).$;
      if ($ && input) {
        $(input).trigger($.Event('mousewheel', {
          originalEvent: { deltaY: 100, wheelDelta: -100 }
        }));
      }
    }, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
  });

  test('should handle decimal values correctly', async ({ page }) => {
    const selector = '#testinput_decimals';
    
    // Test decimal increment
    await touchspinHelpers.touchspinClickUp(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50.01');
    
    // Test manual decimal input
    await touchspinHelpers.fillWithValue(page, selector, '12.34');
    await page.keyboard.press('Tab');
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('12.34');
  });
});