import { test, expect } from '@playwright/test';
import * as apiHelpers from './helpers/touchspinApiHelpers';
import './coverage.hooks';

test.describe('Core functionality', () => {

  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
    await page.waitForLoadState('domcontentloaded');
    await apiHelpers.waitForTimeout(1000); // Give TouchSpin time to initialize
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'basicOperations');
  });

  test('should render TouchSpin buttons and handle basic increment/decrement', async ({ page }) => {
    const testid = 'touchspin-default';

    // Check buttons exist - scope to TouchSpin wrapper
    const spin = await apiHelpers.getElement(page, testid + '-wrapper');
    const upButton = spin.locator('.bootstrap-touchspin-up');
    const downButton = spin.locator('.bootstrap-touchspin-down');
    await expect(upButton).toBeVisible();
    await expect(downButton).toBeVisible();

    // Test increment
    await apiHelpers.clickUpButton(page, testid);
    await expect.poll(
      async () => await apiHelpers.readInputValue(page, testid)
    ).toBe('51');

    // Test decrement
    await apiHelpers.clickDownButton(page, testid);
    await expect.poll(
      async () => await apiHelpers.readInputValue(page, testid)
    ).toBe('50');
  });

  test('should respect disabled and readonly states', async ({ page }) => {
    const testid = 'touchspin-default';

    // Test disabled input
    await apiHelpers.setInputAttr(page, testid, 'disabled', true);
    await apiHelpers.clickUpButton(page, testid);
    expect(await apiHelpers.readInputValue(page, testid)).toBe('50');
    expect(await apiHelpers.checkTouchspinUpIsDisabled(page, testid)).toBe(true);

    // Reset and test readonly
    await apiHelpers.setInputAttr(page, testid, 'disabled', false);
    await apiHelpers.setInputAttr(page, testid, 'readonly', true);
    await apiHelpers.clickUpButton(page, testid);
    expect(await apiHelpers.readInputValue(page, testid)).toBe('50');
    expect(await apiHelpers.checkTouchspinUpIsDisabled(page, testid)).toBe(true);
  });

  test('should initialize with correct disabled state for pre-disabled inputs', async ({ page }) => {
    const disabledTestid = 'touchspin-disabled';
    const readonlyTestid = 'touchspin-readonly';

    expect(await apiHelpers.checkTouchspinUpIsDisabled(page, disabledTestid)).toBe(true);
    expect(await apiHelpers.checkTouchspinUpIsDisabled(page, readonlyTestid)).toBe(true);
  });

  test('should handle custom step values correctly', async ({ page }) => {
    const testid = 'touchspin-individual-props';

    // The initial value should be corrected to align with step=3
    expect(await apiHelpers.readInputValue(page, testid)).toBe('51');

    // Increment should increase by step amount (3)
    await apiHelpers.clickUpButton(page, testid);
    await expect.poll(
      async () => await apiHelpers.readInputValue(page, testid)
    ).toBe('54');

    // Additional increments
    await apiHelpers.clickUpButton(page, testid);
    await expect.poll(
      async () => await apiHelpers.readInputValue(page, testid)
    ).toBe('57');
  });

  test('should handle min/max boundaries', async ({ page }) => {
    const testid = 'touchspin-individual-props';

    // Get element ID for event counting (events are logged with element ID, not testid)
    const elementId = await apiHelpers.getElementIdFromTestId(page, testid);

    // Test reaching max value triggers event
    const initialMaxEvents = await apiHelpers.countEvent(page, elementId, 'touchspin.on.max');

    // Multiple clicks should eventually hit the max
    for (let i = 0; i < 5; i++) {
      await apiHelpers.clickUpButton(page, testid);
    }

    const finalMaxEvents = await apiHelpers.countEvent(page, elementId, 'touchspin.on.max');
    expect(finalMaxEvents).toBeGreaterThan(initialMaxEvents);
  });

  test('should support keyboard navigation', async ({ page }) => {
    const testid = 'touchspin-default';

    const input = await apiHelpers.getElement(page, testid);
    await input.focus();
    await apiHelpers.pressUpArrowKeyOnInput(page, testid);
    await expect.poll(
      async () => await apiHelpers.readInputValue(page, testid)
    ).toBe('51');

    await apiHelpers.pressDownArrowKeyOnInput(page, testid);
    await expect.poll(
      async () => await apiHelpers.readInputValue(page, testid)
    ).toBe('50');
  });

  test('should support mousewheel interaction', async ({ page }) => {
    const testid = 'touchspin-default';

    const input = await apiHelpers.getElement(page, testid);
    await input.focus();

    // Simulate wheel up event (should increment)
    await page.evaluate((testId) => {
      const input = document.querySelector(`[data-testid="${testId}"]`);
      if (input) {
        const ev = new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true });
        Object.defineProperty(ev, 'wheelDelta', { value: 100 });
        input.dispatchEvent(ev);
      }
    }, testid);
    await expect.poll(
      async () => await apiHelpers.readInputValue(page, testid)
    ).toBe('51');

    // Simulate wheel down event (should decrement)
    await page.evaluate((testId) => {
      const input = document.querySelector(`[data-testid="${testId}"]`);
      if (input) {
        const ev = new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true });
        Object.defineProperty(ev, 'wheelDelta', { value: -100 });
        input.dispatchEvent(ev);
      }
    }, testid);
    await expect.poll(
      async () => await apiHelpers.readInputValue(page, testid)
    ).toBe('50');
  });

  test('should handle decimal values correctly', async ({ page }) => {
    const testid = 'touchspin-decimals';

    // Test decimal increment
    await apiHelpers.clickUpButton(page, testid);
    await expect.poll(
      async () => await apiHelpers.readInputValue(page, testid)
    ).toBe('50.01');

    // Test manual decimal input
    await apiHelpers.fillWithValue(page, testid, '12.34');
    await page.keyboard.press('Tab');
    await expect.poll(
      async () => await apiHelpers.readInputValue(page, testid)
    ).toBe('12.34');
  });
});
