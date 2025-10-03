/**
 * Feature: Bootstrap 5 renderer floating labels DOM structure validation
 * Background: fixture = /packages/renderers/bootstrap5/tests/fixtures/floating-labels-dom-structure.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] validates basic floating label DOM structure
 * [x] validates advanced floating label with input group DOM structure
 * [x] validates basic floating label with vertical buttons DOM structure
 * [x] validates advanced floating label with vertical buttons DOM structure
 */

import { expect, test } from '@playwright/test';
import { installDomHelpers } from '@touchspin/core/test-helpers';

const FLOATING_LABELS_DOM_FIXTURE =
  '/packages/renderers/bootstrap5/tests/fixtures/floating-labels-dom-structure.html';

/**
 * Scenario: validates basic floating label DOM structure
 *
 * Expected DOM:
 * <div class="input-group bootstrap-touchspin" data-touchspin-injected="wrapper">
 *   <button data-touchspin-injected="down">−</button>
 *   <div class="form-floating">
 *     <input id="basic-floating">
 *     <label for="basic-floating">Amount</label>
 *   </div>
 *   <button data-touchspin-injected="up">+</button>
 * </div>
 */
test('validates basic floating label DOM structure', async ({ page }) => {
  await page.goto(FLOATING_LABELS_DOM_FIXTURE);
  await installDomHelpers(page);

  // Validate wrapper
  const wrapper = page.getByTestId('basic-floating-wrapper');
  await expect(wrapper).toHaveClass(/input-group/);
  await expect(wrapper).toHaveClass(/bootstrap-touchspin/);

  // Validate children order: down button, .form-floating, up button
  const children = await wrapper.locator('> *').all();
  expect(children.length).toBe(3);
  await expect(children[0]).toHaveAttribute('data-touchspin-injected', 'down');
  await expect(children[1]).toHaveClass(/form-floating/);
  await expect(children[2]).toHaveAttribute('data-touchspin-injected', 'up');

  // Validate .form-floating contains input then label
  const formFloating = wrapper.locator('.form-floating');
  const floatingChildren = await formFloating.locator('> *').all();
  expect(floatingChildren.length).toBe(2);
  await expect(floatingChildren[0]).toHaveAttribute('id', 'basic-floating');
  await expect(floatingChildren[1]).toHaveAttribute('for', 'basic-floating');
});

/**
 * Scenario: validates advanced floating label with input group DOM structure
 *
 * Expected DOM:
 * <div class="input-group bootstrap-touchspin" data-touchspin-injected="wrapper-advanced">
 *   <span class="input-group-text">$</span>
 *   <button data-touchspin-injected="down">−</button>
 *   <div class="form-floating">
 *     <input id="group-floating">
 *     <label for="group-floating">Price</label>
 *   </div>
 *   <button data-touchspin-injected="up">+</button>
 *   <span class="input-group-text">.00</span>
 * </div>
 */
test('validates advanced floating label with input group DOM structure', async ({ page }) => {
  await page.goto(FLOATING_LABELS_DOM_FIXTURE);
  await installDomHelpers(page);

  const wrapper = page.getByTestId('group-floating-wrapper');

  // Validate wrapper
  await expect(wrapper).toHaveClass(/input-group/);
  await expect(wrapper).toHaveClass(/bootstrap-touchspin/);

  // Validate children order: prefix, down, .form-floating, up, postfix
  const children = await wrapper.locator('> *').all();
  expect(children.length).toBe(5);

  // First: prefix
  await expect(children[0]).toHaveClass(/input-group-text/);
  await expect(children[0]).toHaveText('$');

  // Second: down button
  await expect(children[1]).toHaveAttribute('data-touchspin-injected', 'down');

  // Third: .form-floating
  await expect(children[2]).toHaveClass(/form-floating/);

  // Fourth: up button
  await expect(children[3]).toHaveAttribute('data-touchspin-injected', 'up');

  // Fifth: postfix
  await expect(children[4]).toHaveClass(/input-group-text/);
  await expect(children[4]).toHaveText('.00');

  // Validate .form-floating internal structure
  const formFloating = wrapper.locator('.form-floating');
  const floatingChildren = await formFloating.locator('> *').all();
  expect(floatingChildren.length).toBe(2);
  await expect(floatingChildren[0]).toHaveAttribute('id', 'group-floating');
  await expect(floatingChildren[1]).toHaveAttribute('for', 'group-floating');
});

/**
 * Scenario: validates basic floating label with vertical buttons DOM structure
 *
 * Expected DOM:
 * <div class="input-group bootstrap-touchspin" data-touchspin-injected="wrapper">
 *   <div class="form-floating">
 *     <input id="vertical-basic">
 *     <label for="vertical-basic">Vertical (Basic)</label>
 *   </div>
 *   <span class="input-group-text bootstrap-touchspin-vertical-button-wrapper">
 *     <span class="input-group-btn-vertical">
 *       <button data-touchspin-injected="up">▲</button>
 *       <button data-touchspin-injected="down">▼</button>
 *     </span>
 *   </span>
 * </div>
 */
test('validates basic floating label with vertical buttons DOM structure', async ({ page }) => {
  await page.goto(FLOATING_LABELS_DOM_FIXTURE);
  await installDomHelpers(page);

  const wrapper = page.getByTestId('vertical-basic-wrapper');

  // Validate wrapper
  await expect(wrapper).toHaveClass(/input-group/);
  await expect(wrapper).toHaveClass(/bootstrap-touchspin/);

  // Validate children: .form-floating, vertical-wrapper
  const children = await wrapper.locator('> *').all();
  expect(children.length).toBe(2);
  await expect(children[0]).toHaveClass(/form-floating/);
  await expect(children[1]).toHaveClass(/bootstrap-touchspin-vertical-button-wrapper/);

  // Validate vertical wrapper structure
  const verticalWrapper = children[1];
  const btnVertical = verticalWrapper.locator('.input-group-btn-vertical');
  await expect(btnVertical).toBeVisible();

  const buttons = await btnVertical.locator('button').all();
  expect(buttons.length).toBe(2);
  await expect(buttons[0]).toHaveAttribute('data-touchspin-injected', 'up');
  await expect(buttons[1]).toHaveAttribute('data-touchspin-injected', 'down');

  // Validate .form-floating internal structure
  const formFloating = wrapper.locator('.form-floating');
  const floatingChildren = await formFloating.locator('> *').all();
  expect(floatingChildren.length).toBe(2);
  await expect(floatingChildren[0]).toHaveAttribute('id', 'vertical-basic');
  await expect(floatingChildren[1]).toHaveAttribute('for', 'vertical-basic');
});

/**
 * Scenario: validates advanced floating label with vertical buttons DOM structure
 *
 * Expected DOM:
 * <div class="input-group bootstrap-touchspin" data-touchspin-injected="wrapper-advanced">
 *   <span class="input-group-text">€</span>
 *   <div class="form-floating">
 *     <input id="vertical-advanced">
 *     <label for="vertical-advanced">Vertical (Advanced)</label>
 *   </div>
 *   <span class="input-group-text bootstrap-touchspin-vertical-button-wrapper">
 *     <span class="input-group-btn-vertical">
 *       <button data-touchspin-injected="up">▲</button>
 *       <button data-touchspin-injected="down">▼</button>
 *     </span>
 *   </span>
 *   <span class="input-group-text">.00</span>
 * </div>
 */
test('validates advanced floating label with vertical buttons DOM structure', async ({ page }) => {
  await page.goto(FLOATING_LABELS_DOM_FIXTURE);
  await installDomHelpers(page);

  const wrapper = page.getByTestId('vertical-advanced-wrapper');

  // Validate wrapper
  await expect(wrapper).toHaveClass(/input-group/);
  await expect(wrapper).toHaveClass(/bootstrap-touchspin/);

  // Validate children: prefix, .form-floating, vertical-wrapper, postfix
  const children = await wrapper.locator('> *').all();
  expect(children.length).toBe(4);

  // First: prefix
  await expect(children[0]).toHaveClass(/input-group-text/);
  await expect(children[0]).toHaveText('€');

  // Second: .form-floating
  await expect(children[1]).toHaveClass(/form-floating/);

  // Third: vertical wrapper
  await expect(children[2]).toHaveClass(/bootstrap-touchspin-vertical-button-wrapper/);

  // Fourth: postfix
  await expect(children[3]).toHaveClass(/input-group-text/);
  await expect(children[3]).toHaveText('.00');

  // Validate vertical wrapper structure
  const verticalWrapper = children[2];
  const btnVertical = verticalWrapper.locator('.input-group-btn-vertical');
  await expect(btnVertical).toBeVisible();

  const buttons = await btnVertical.locator('button').all();
  expect(buttons.length).toBe(2);
  await expect(buttons[0]).toHaveAttribute('data-touchspin-injected', 'up');
  await expect(buttons[1]).toHaveAttribute('data-touchspin-injected', 'down');

  // Validate .form-floating internal structure
  const formFloating = wrapper.locator('.form-floating');
  const floatingChildren = await formFloating.locator('> *').all();
  expect(floatingChildren.length).toBe(2);
  await expect(floatingChildren[0]).toHaveAttribute('id', 'vertical-advanced');
  await expect(floatingChildren[1]).toHaveAttribute('for', 'vertical-advanced');
});
