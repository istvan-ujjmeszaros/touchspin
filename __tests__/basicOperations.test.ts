import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Core functionality', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'basicOperations');
  });

  test('should render TouchSpin buttons and handle basic increment/decrement', async ({ page }) => {
    const testid = 'touchspin-default';

    // Check buttons exist - scope to TouchSpin wrapper
    const spin = page.getByTestId(testid + '-wrapper');
    const upButton = spin.locator('.bootstrap-touchspin-up');
    const downButton = spin.locator('.bootstrap-touchspin-down');
    await expect(upButton).toBeVisible();
    await expect(downButton).toBeVisible();

    // Test increment
    await touchspinHelpers.touchspinClickUp(page, testid);
    await expect.poll(
      async () => await touchspinHelpers.readInputValue(page, testid)
    ).toBe('51');

    // Test decrement
    await touchspinHelpers.touchspinClickDown(page, testid);
    await expect.poll(
      async () => await touchspinHelpers.readInputValue(page, testid)
    ).toBe('50');
  });

  test('should respect disabled and readonly states', async ({ page }) => {
    const testid = 'touchspin-default';

    // Test disabled input
    await touchspinHelpers.setInputAttr(page, testid, 'disabled', true);
    await touchspinHelpers.touchspinClickUp(page, testid);
    expect(await touchspinHelpers.readInputValue(page, testid)).toBe('50');
    expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, testid)).toBe(true);

    // Reset and test readonly
    await touchspinHelpers.setInputAttr(page, testid, 'disabled', false);
    await touchspinHelpers.setInputAttr(page, testid, 'readonly', true);
    await touchspinHelpers.touchspinClickUp(page, testid);
    expect(await touchspinHelpers.readInputValue(page, testid)).toBe('50');
    expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, testid)).toBe(true);
  });

  test('should initialize with correct disabled state for pre-disabled inputs', async ({ page }) => {
    const disabledTestid = 'touchspin-disabled';
    const readonlyTestid = 'touchspin-readonly';

    expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, disabledTestid)).toBe(true);
    expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, readonlyTestid)).toBe(true);
  });

  test('should handle custom step values correctly', async ({ page }) => {
    const testid = 'touchspin-individual-props';

    // The initial value should be corrected to align with step=3
    expect(await touchspinHelpers.readInputValue(page, testid)).toBe('51');

    // Increment should increase by step amount (3)
    await touchspinHelpers.touchspinClickUp(page, testid);
    await expect.poll(
      async () => await touchspinHelpers.readInputValue(page, testid)
    ).toBe('54');

    // Additional increments
    await touchspinHelpers.touchspinClickUp(page, testid);
    await expect.poll(
      async () => await touchspinHelpers.readInputValue(page, testid)
    ).toBe('57');
  });

  test('should handle min/max boundaries', async ({ page }) => {
    const testid = 'touchspin-individual-props';
    
    // Get element ID for event counting (events are logged with element ID, not testid)
    const elementId = await touchspinHelpers.getElementIdFromTestId(page, testid);
    
    // Test reaching max value triggers event
    const initialMaxEvents = await touchspinHelpers.countEvent(page, elementId, 'touchspin.on.max');
    
    // Multiple clicks should eventually hit the max
    for (let i = 0; i < 5; i++) {
      await touchspinHelpers.touchspinClickUp(page, testid);
    }
    
    const finalMaxEvents = await touchspinHelpers.countEvent(page, elementId, 'touchspin.on.max');
    expect(finalMaxEvents).toBeGreaterThan(initialMaxEvents);
  });

  test('should support keyboard navigation', async ({ page }) => {
    const testid = 'touchspin-default';
    
    const input = page.getByTestId(testid);
    await input.focus();
    await page.keyboard.press('ArrowUp');
    await expect.poll(
      async () => await touchspinHelpers.readInputValue(page, testid)
    ).toBe('51');
    
    await page.keyboard.press('ArrowDown');
    await expect.poll(
      async () => await touchspinHelpers.readInputValue(page, testid)
    ).toBe('50');
  });

  test('should support mousewheel interaction', async ({ page }) => {
    const testid = 'touchspin-default';
    
    const input = page.getByTestId(testid);
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
      async () => await touchspinHelpers.readInputValue(page, testid)
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
      async () => await touchspinHelpers.readInputValue(page, testid)
    ).toBe('50');
  });

  test('should handle decimal values correctly', async ({ page }) => {
    const testid = 'touchspin-decimals';
    
    // Test decimal increment
    await touchspinHelpers.touchspinClickUp(page, testid);
    await expect.poll(
      async () => await touchspinHelpers.readInputValue(page, testid)
    ).toBe('50.01');
    
    // Test manual decimal input
    await touchspinHelpers.fillWithValue(page, testid, '12.34');
    await page.keyboard.press('Tab');
    await expect.poll(
      async () => await touchspinHelpers.readInputValue(page, testid)
    ).toBe('12.34');
  });
});