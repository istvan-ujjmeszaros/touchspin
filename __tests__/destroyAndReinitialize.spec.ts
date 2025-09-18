import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinApiHelpers';
import './coverage.hooks';

test.describe('TouchSpin Destroy and Reinitialize', () => {

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'destroyAndReinitialize');
  });


  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/destroy-test.html');
    await page.waitForLoadState('networkidle');
  });

  test('Test 1: New Container Creation - destroy and reinitialize', async ({ page }) => {
    const input = page.getByTestId('test-input-new');
    const initBtn = page.getByTestId('init-new-btn');
    const destroyBtn = page.getByTestId('destroy-new-btn');
    const reinitBtn = page.getByTestId('reinit-new-btn');
    const status = page.locator('#status-new');

    // Initial state
    await expect(input).toHaveValue('10');
    await expect(status).toHaveText('Status: Not initialized');

    // Initialize TouchSpin
    await initBtn.click();

    // Wait for TouchSpin to be fully initialized
    const wrapper = await touchspinHelpers.getWrapperInstanceWhenReady(page, 'test-input-new');

    await expect(status).toHaveText('Status: Initialized ($ prefix, .00 postfix)');

    // Verify TouchSpin UI elements are present
    const container = input.locator('xpath=..');
    await expect(container).toHaveClass(/bootstrap-touchspin/);
    await expect(wrapper.locator('[data-touchspin-injected="up"]')).toBeVisible();
    await expect(wrapper.locator('[data-touchspin-injected="down"]')).toBeVisible();
    await expect(wrapper.locator('[data-touchspin-injected="prefix"]').first()).toHaveText('$');
    await expect(wrapper.locator('[data-touchspin-injected="postfix"]').first()).toHaveText('.00');

    // Test functionality - increment
    await wrapper.locator('[data-touchspin-injected="up"]').click();
    await expect(input).toHaveValue('11');

    // Destroy TouchSpin
    await destroyBtn.click();
    await expect(status).toHaveText('Status: Destroyed');

    // Verify TouchSpin UI elements are removed (wrapper should be gone)
    await expect(page.locator('[data-testid="test-input-new-wrapper"][data-touchspin-injected]')).toHaveCount(0);

    // Verify original structure is restored (input should not be in bootstrap-touchspin container)
    const parentAfterDestroy = input.locator('xpath=..');
    await expect(parentAfterDestroy).not.toHaveClass(/bootstrap-touchspin/);

    // Reinitialize with different settings
    await reinitBtn.click();

    // Wait for TouchSpin to be fully reinitialized
    const reinitWrapper = await touchspinHelpers.getWrapperInstanceWhenReady(page, 'test-input-new');

    await expect(status).toHaveText('Status: Reinitialized (€ prefix, EUR postfix, step 5)');

    // Verify new settings are applied
    await expect(reinitWrapper.locator('[data-touchspin-injected="prefix"]').first()).toHaveText('€');
    await expect(reinitWrapper.locator('[data-touchspin-injected="postfix"]').first()).toHaveText(' EUR');

    // Test new step value
    const initialValue = await input.inputValue();
    await reinitWrapper.locator('[data-touchspin-injected="up"]').click();
    const newValue = await input.inputValue();
    expect(parseInt(newValue) - parseInt(initialValue)).toBe(5);
  });

  test('Test 2: Existing Container Enhancement - destroy and reinitialize', async ({ page }) => {
    const input = page.getByTestId('test-input-existing');
    const initBtn = page.getByTestId('init-existing-btn');
    const destroyBtn = page.getByTestId('destroy-existing-btn');
    const reinitBtn = page.getByTestId('reinit-existing-btn');
    const status = page.locator('#status-existing');

    // Use ID selector instead of testid since testid might change
    const existingContainer = page.locator('#existing-container');

    // Initial state - verify existing structure
    await expect(input).toHaveValue('42');
    await expect(status).toHaveText('Status: Not initialized');
    await expect(existingContainer).toHaveClass(/input-group/);
    await expect(existingContainer).toHaveClass(/existing-container/);
    await expect(page.locator('.input-group-prepend .input-group-text')).toHaveText('Pre');
    await expect(page.locator('.input-group-append .input-group-text')).toHaveText('Post');

    // Initialize TouchSpin
    await initBtn.click();

    // Wait for TouchSpin to be fully initialized on existing container
    const existWrapper = await touchspinHelpers.getWrapperInstanceWhenReady(page, 'existing-container');

    await expect(status).toHaveText('Status: Enhanced existing input-group ($ prefix, .00 postfix)');

    // Verify TouchSpin elements are added to existing container
    await expect(existingContainer).toHaveClass(/bootstrap-touchspin/);
    await expect(existWrapper.locator('[data-touchspin-injected="up"]')).toBeVisible();
    await expect(existWrapper.locator('[data-touchspin-injected="down"]')).toBeVisible();
    await expect(page.locator('[data-touchspin-injected="prefix"]')).toHaveText('$');
    await expect(page.locator('[data-touchspin-injected="postfix"]')).toHaveText('.00');

    // Verify original elements are still present alongside TouchSpin elements
    await expect(page.locator('.input-group-prepend').first().locator('.input-group-text')).toHaveText('Pre');
    await expect(page.locator('.input-group-append').last().locator('.input-group-text')).toHaveText('Post');

    // Test functionality
    await page.locator('.bootstrap-touchspin-up').click();
    await expect(input).toHaveValue('43');

    // Destroy TouchSpin
    await destroyBtn.click();
    await expect(status).toHaveText('Status: Destroyed (should restore original structure)');

    // Verify TouchSpin elements are removed
    await expect(page.locator('.bootstrap-touchspin-up')).not.toBeVisible();
    await expect(page.locator('.bootstrap-touchspin-down')).not.toBeVisible();
    await expect(page.locator('[data-touchspin-injected="prefix"]')).not.toBeVisible();
    await expect(page.locator('[data-touchspin-injected="postfix"]')).not.toBeVisible();

    // Verify original structure is restored
    await expect(existingContainer).toHaveClass(/input-group/);
    await expect(existingContainer).toHaveClass(/existing-container/);
    await expect(existingContainer).not.toHaveClass(/bootstrap-touchspin/);
    await expect(page.locator('.input-group-prepend').first().locator('.input-group-text')).toHaveText('Pre');
    await expect(page.locator('.input-group-append').last().locator('.input-group-text')).toHaveText('Post');

    // Reinitialize with different settings
    await reinitBtn.click();

    // Wait for TouchSpin to be fully reinitialized on existing container
    const existReinitWrapper = await touchspinHelpers.getWrapperInstanceWhenReady(page, 'existing-container');

    await expect(status).toHaveText('Status: Reinitialized (€ prefix, EUR postfix, step 10)');

    // Verify new settings are applied
    await expect(existReinitWrapper.locator('[data-touchspin-injected="prefix"]').first()).toHaveText('€');
    await expect(existReinitWrapper.locator('[data-touchspin-injected="postfix"]').first()).toHaveText(' EUR');

    // Test new step value
    const initialValue = await input.inputValue();
    await existReinitWrapper.locator('[data-touchspin-injected="up"]').click();
    const newValue = await input.inputValue();
    expect(parseInt(newValue) - parseInt(initialValue)).toBe(10);
  });

  test('Test 3: Vertical Buttons - destroy and reinitialize', async ({ page }) => {
    const input = page.getByTestId('test-input-vertical');
    const initBtn = page.getByTestId('init-vertical-btn');
    const destroyBtn = page.getByTestId('destroy-vertical-btn');
    const reinitBtn = page.getByTestId('reinit-vertical-btn');
    const status = page.locator('#status-vertical');

    // Initial state
    await expect(input).toHaveValue('15');
    await expect(status).toHaveText('Status: Not initialized');

    // Initialize TouchSpin with vertical buttons
    await initBtn.click();

    // Wait for TouchSpin to be fully initialized with vertical buttons
    const vWrapper = await touchspinHelpers.getWrapperInstanceWhenReady(page, 'test-input-vertical');

    await expect(status).toHaveText('Status: Initialized (vertical buttons ▲/▼)');

    // Verify vertical button elements are present
    const container = input.locator('xpath=..');
    await expect(container).toHaveClass(/bootstrap-touchspin/);
    await expect(vWrapper.locator('[data-touchspin-injected="up"]')).toBeVisible();
    await expect(vWrapper.locator('[data-touchspin-injected="down"]')).toBeVisible();
    await expect(vWrapper.locator('[data-touchspin-injected="up"]').first()).toHaveText('▲');
    await expect(vWrapper.locator('[data-touchspin-injected="down"]').first()).toHaveText('▼');

    // Test functionality
    await vWrapper.locator('[data-touchspin-injected="up"]').click();
    await expect(input).toHaveValue('16');
    await vWrapper.locator('[data-touchspin-injected="down"]').click();
    await expect(input).toHaveValue('15');

    // Destroy TouchSpin
    await destroyBtn.click();
    await expect(status).toHaveText('Status: Destroyed');

    // Verify vertical button elements are removed (wrapper should be gone)
    await expect(page.locator('[data-testid="test-input-vertical-wrapper"][data-touchspin-injected]')).toHaveCount(0);

    // Verify original structure is restored
    const parentAfterDestroy = input.locator('xpath=..');
    await expect(parentAfterDestroy).not.toHaveClass(/bootstrap-touchspin/);

    // Reinitialize with different vertical buttons
    await reinitBtn.click();

    // Wait for TouchSpin to be fully reinitialized with vertical buttons
    const vReinitWrapper = await touchspinHelpers.getWrapperInstanceWhenReady(page, 'test-input-vertical');

    await expect(status).toHaveText('Status: Reinitialized (vertical buttons ↑/↓, step 5)');

    // Verify new settings are applied
    await expect(vReinitWrapper.locator('[data-touchspin-injected="up"]').first()).toHaveText('↑');
    await expect(vReinitWrapper.locator('[data-touchspin-injected="down"]').first()).toHaveText('↓');

    // Test new step value
    const initialValue = await input.inputValue();
    await vReinitWrapper.locator('[data-touchspin-injected="up"]').click();
    const newValue = await input.inputValue();
    expect(parseInt(newValue) - parseInt(initialValue)).toBe(5);
  });

  test('Event handlers are properly cleaned up after destroy', async ({ page }) => {
    const input = page.getByTestId('test-input-new');
    const initBtn = page.getByTestId('init-new-btn');
    const destroyBtn = page.getByTestId('destroy-new-btn');

    // Initialize TouchSpin
    await initBtn.click();

    // Wait for TouchSpin to be fully initialized
    await touchspinHelpers.getWrapperInstanceWhenReady(page, 'test-input-new');

    // Test that keyboard events work
    await input.focus();
    await page.keyboard.press('ArrowUp');
    await expect(input).toHaveValue('11');

    // Destroy TouchSpin
    await destroyBtn.click();

    // Test that keyboard events no longer trigger TouchSpin behavior
    await input.focus();
    await input.fill('20');
    await page.keyboard.press('ArrowUp');
    // Should not increment - value should remain 20
    await expect(input).toHaveValue('20');
  });

  test('Multiple destroy calls should not cause errors', async ({ page }) => {
    const input = page.getByTestId('test-input-new');
    const initBtn = page.getByTestId('init-new-btn');
    const destroyBtn = page.getByTestId('destroy-new-btn');

    // Initialize TouchSpin
    await initBtn.click();

    // Wait for TouchSpin to be fully initialized
    await expect.poll(async () => {
      const wrapper = page.locator('[data-testid="test-input-new-wrapper"][data-touchspin-injected]');
      return await wrapper.count() > 0;
    }).toBe(true);

    // Destroy multiple times
    await destroyBtn.click();
    await destroyBtn.click();
    await destroyBtn.click();

    // Should not cause any errors and input should still be functional
    await input.fill('25');
    await expect(input).toHaveValue('25');
  });
});
