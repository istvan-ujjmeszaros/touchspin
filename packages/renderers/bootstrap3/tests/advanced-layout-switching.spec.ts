import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { ensureBootstrap3Globals } from './helpers/bootstrap3-globals';

const BOOTSTRAP3_FIXTURE = '/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html';

/**
 * Scenario: rebuilds DOM correctly when switching layouts in advanced mode
 * Given input is initialized in advanced mode (existing .input-group) with horizontal layout
 * When I switch to vertical layout and back to horizontal
 * Then element order should be correct: down-wrapper -> prefix -> input -> postfix -> up-wrapper
 */
test('rebuilds DOM correctly when switching layouts in advanced mode', async ({ page }) => {
  await page.goto(BOOTSTRAP3_FIXTURE);
  await ensureBootstrap3Globals(page);

  // Initialize in advanced mode (input-group fixture) with horizontal layout
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced', {
    verticalbuttons: false,
    prefix: '$',
    postfix: '.00',
  });

  // Helper to get element order
  const getElementOrder = () =>
    page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="test-input-advanced-wrapper"]');
      if (!wrapper) return [];
      return Array.from(wrapper.children).map((el) => {
        const injected = (el as HTMLElement).getAttribute('data-touchspin-injected');
        if (injected) return injected;
        if (el.tagName.toLowerCase() === 'input') return 'input';
        return 'unknown';
      });
    });

  // Verify initial horizontal order: down-wrapper -> prefix -> input -> postfix -> up-wrapper
  const initialOrder = await getElementOrder();
  expect(initialOrder).toEqual(['down-wrapper', 'prefix', 'input', 'postfix', 'up-wrapper']);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');

  // Switch to vertical layout
  await apiHelpers.updateSettingsViaAPI(page, 'test-input-advanced', {
    verticalbuttons: true,
  });

  // Verify vertical wrapper exists
  const verticalWrapperExists = await page.evaluate(() => {
    const wrapper = document.querySelector('[data-testid="test-input-advanced-wrapper"]');
    const verticalWrapper = wrapper?.querySelector('[data-touchspin-injected="vertical-wrapper"]');
    return verticalWrapper !== null;
  });
  expect(verticalWrapperExists).toBe(true);

  // Switch back to horizontal
  await apiHelpers.updateSettingsViaAPI(page, 'test-input-advanced', {
    verticalbuttons: false,
  });

  // Verify vertical wrapper is gone
  const verticalWrapperAfter = await page.evaluate(() => {
    const wrapper = document.querySelector('[data-testid="test-input-advanced-wrapper"]');
    const verticalWrapper = wrapper?.querySelector('[data-touchspin-injected="vertical-wrapper"]');
    return verticalWrapper !== null;
  });
  expect(verticalWrapperAfter).toBe(false);

  // Verify element order is restored: down-wrapper -> prefix -> input -> postfix -> up-wrapper
  const finalOrder = await getElementOrder();
  expect(finalOrder).toEqual(['down-wrapper', 'prefix', 'input', 'postfix', 'up-wrapper']);

  // Verify functionality still works
  await apiHelpers.clickDownButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '50');
});
