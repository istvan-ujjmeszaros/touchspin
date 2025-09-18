import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinApiHelpers';
import './coverage.hooks';

/**
 * TestID Propagation Test Suite
 *
 * This test suite verifies that TouchSpin automatically propagates data-testid
 * attributes from input elements to their generated wrapper containers.
 *
 * BEHAVIOR DESCRIPTION:
 * When TouchSpin initializes on an input element that has a data-testid attribute,
 * it should automatically create or enhance the wrapper container with a corresponding
 * data-testid attribute that appends "-wrapper" to the original testid.
 *
 * For example:
 * - Input: <input data-testid="my-input" />
 * - Generated wrapper: <div data-testid="my-input-wrapper" class="input-group bootstrap-touchspin">
 *
 * This behavior works in two scenarios:
 * 1. New wrapper creation: When TouchSpin creates a new .input-group wrapper
 * 2. Existing wrapper enhancement: When TouchSpin enhances an existing .input-group
 *
 * This feature eliminates the need for manual testid management in tests and
 * enables automatic test isolation by allowing tests to wait for the wrapper
 * to exist using the predictable testid pattern.
 */

test.describe('TestID Propagation Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/testid-propagation-test.html');
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'testidPropagation');
  });

  test('should propagate testid from input to new wrapper container', async ({ page }) => {
    // Test case 1: New wrapper creation
    const inputTestId = 'test-input-1';
    const expectedWrapperTestId = 'test-input-1-wrapper';

    // Verify the input exists with its testid
    const input = page.getByTestId(inputTestId);
    await expect(input).toBeAttached();

    // Verify TouchSpin created a wrapper with the propagated testid
    const wrapper = page.getByTestId(expectedWrapperTestId);
    await expect(wrapper).toBeAttached();

    // Verify wrapper has TouchSpin classes
    await expect(wrapper).toHaveClass(/bootstrap-touchspin/);
    await expect(wrapper).toHaveClass(/input-group/);

    // Verify the input is now inside the wrapper
    const inputInWrapper = wrapper.locator('input');
    await expect(inputInWrapper).toBeAttached();
    await expect(inputInWrapper).toHaveAttribute('data-testid', inputTestId);

    // Verify TouchSpin buttons exist within the wrapper
    await expect(wrapper.locator('.bootstrap-touchspin-up')).toBeAttached();
    await expect(wrapper.locator('.bootstrap-touchspin-down')).toBeAttached();
  });

  test('should propagate testid to existing input-group wrapper', async ({ page }) => {
    // Test case 2: Existing input-group enhancement
    const inputTestId = 'test-input-2';
    const expectedWrapperTestId = 'test-input-2-wrapper';

    // Verify the input exists with its testid
    const input = page.getByTestId(inputTestId);
    await expect(input).toBeAttached();

    // Verify the existing input-group now has the propagated testid
    const wrapper = page.getByTestId(expectedWrapperTestId);
    await expect(wrapper).toBeAttached();

    // Verify it's the same input-group that existed before (has pre/postfix)
    await expect(wrapper.locator('.input-group-text', { hasText: '$' })).toBeAttached();
    await expect(wrapper.locator('.input-group-text', { hasText: '.00' })).toBeAttached();

    // Verify TouchSpin functionality was added
    await expect(wrapper.locator('.bootstrap-touchspin-up')).toBeAttached();
    await expect(wrapper.locator('.bootstrap-touchspin-down')).toBeAttached();
  });

  test('should propagate testid for vertical buttons configuration', async ({ page }) => {
    // Test case 3: Vertical buttons
    const inputTestId = 'test-input-3';
    const expectedWrapperTestId = 'test-input-3-wrapper';

    // Verify the input exists
    const input = page.getByTestId(inputTestId);
    await expect(input).toBeAttached();

    // Verify wrapper with propagated testid exists
    const wrapper = page.getByTestId(expectedWrapperTestId);
    await expect(wrapper).toBeAttached();

    // Verify vertical buttons structure
    await expect(wrapper.locator('.bootstrap-touchspin-vertical-button-wrapper')).toBeAttached();
    await expect(wrapper.locator('.bootstrap-touchspin-up')).toBeAttached();
    await expect(wrapper.locator('.bootstrap-touchspin-down')).toBeAttached();
  });

  test('should not create wrapper testid when input has no testid', async ({ page }) => {
    // Test case 4: No testid on input
    const input = page.locator('#test-input-4');
    await expect(input).toBeAttached();

    // Verify TouchSpin wrapper was created but without testid
    const touchspinWrapper = page.locator('.bootstrap-touchspin').nth(3); // 4th instance
    await expect(touchspinWrapper).toBeAttached();

    // Verify wrapper does NOT have a data-testid attribute
    const wrapperTestId = await touchspinWrapper.getAttribute('data-testid');
    expect(wrapperTestId).toBeNull();

    // But TouchSpin functionality should still work
    await expect(touchspinWrapper.locator('.bootstrap-touchspin-up')).toBeAttached();
    await expect(touchspinWrapper.locator('.bootstrap-touchspin-down')).toBeAttached();
  });

  test('should maintain input functionality with propagated testids', async ({ page }) => {
    // Verify that the testid propagation doesn't break TouchSpin functionality
    const inputTestId = 'test-input-1';
    const wrapperTestId = 'test-input-1-wrapper';

    const wrapper = page.getByTestId(wrapperTestId);
    const input = wrapper.locator('input');
    const upButton = wrapper.locator('.bootstrap-touchspin-up');

    // Get initial value
    const initialValue = await input.inputValue();
    expect(initialValue).toBe('50');

    // Click up button and verify value changes
    await upButton.click();

    // Wait for value to update
    await page.waitForFunction(() => {
      const input = document.querySelector('[data-testid="test-input-1-wrapper"] input') as HTMLInputElement;
      return input && input.value !== '50';
    });

    const newValue = await input.inputValue();
    expect(newValue).toBe('51');
  });
});
