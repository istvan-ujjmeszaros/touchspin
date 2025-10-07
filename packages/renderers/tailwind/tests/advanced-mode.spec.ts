/**
 * Feature: Tailwind renderer advanced mode (existing container) behavior
 * Background: fixture = /packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] detects and uses existing flex container with rounded-md class
 * [x] adds testid to existing container when input has testid
 * [x] preserves existing container classes and attributes
 * [x] handles vertical layout in advanced mode
 * [x] ensures input is child of container before operations
 * [x] injects elements in correct order in advanced mode
 * [x] handles prefix and postfix in advanced mode
 * [x] applies size classes to existing container
 * [x] hides empty prefix/postfix in advanced mode
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { ensureTailwindGlobals } from './helpers/tailwind-globals';

/**
 * Scenario: detects and uses existing flex container with rounded-md class
 * Given the fixture page has an input inside a flex rounded-md container
 * When TouchSpin initializes
 * Then it uses the existing container instead of creating a new wrapper
 * Params:
 * { "existingContainer": "flex rounded-md", "wrapperReuse": true, "wrapperType": "wrapper-advanced" }
 */
test('detects and uses existing flex container with rounded-md class', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  // test-input-advanced is in an existing flex rounded-md container
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input-advanced');

  // Verify existing container is used (has both flex and rounded-md)
  await expect(elements.wrapper).toHaveClass(/flex/);
  await expect(elements.wrapper).toHaveClass(/rounded-md/);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: adds testid to existing container when input has testid
 * Given the fixture page has an input with testid inside a container without testid
 * When TouchSpin initializes
 * Then it adds wrapper testid to the existing container
 * Params:
 * { "inputTestId": "test-input-advanced", "wrapperTestId": "test-input-advanced-wrapper", "testidInheritance": true }
 */
test('adds testid to existing container when input has testid', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input-advanced');

  // Verify wrapper has testid added
  await expect(elements.wrapper).toHaveAttribute('data-testid', 'test-input-advanced-wrapper');

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: preserves existing container classes and attributes
 * Given the fixture page has a container with existing classes
 * When TouchSpin initializes in advanced mode
 * Then existing classes and attributes are preserved
 * Params:
 * { "preserveClasses": true, "preserveAttributes": true, "nonDestructive": true }
 */
test('preserves existing container classes and attributes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  // Get classes before initialization
  const classesBefore = await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input-advanced"]');
    const container = input?.closest('.flex.rounded-md');
    return container?.className;
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input-advanced');

  // Verify original classes are still present
  const classesAfter = await elements.wrapper.getAttribute('class');
  expect(classesAfter).toContain('flex');
  expect(classesAfter).toContain('rounded-md');

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: handles vertical layout in advanced mode
 * Given the fixture page has input in existing container
 * When TouchSpin initializes with vertical buttons in advanced mode
 * Then vertical layout is created within existing container
 * Params:
 * { "verticalbuttons": true, "advancedMode": true, "layoutCorrect": true }
 */
test('handles vertical layout in advanced mode', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced', {
    verticalbuttons: true,
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input-advanced');

  // Verify vertical wrapper exists within advanced container
  const verticalWrapperExists = await page.evaluate(() => {
    const wrapper = document.querySelector('[data-testid="test-input-advanced-wrapper"]');
    const verticalWrapper = wrapper?.querySelector('[data-touchspin-injected="vertical-wrapper"]');
    return verticalWrapper !== null;
  });
  expect(verticalWrapperExists).toBe(true);

  // Verify buttons are in vertical wrapper
  await expect(elements.upButton).toBeVisible();
  await expect(elements.downButton).toBeVisible();

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: ensures input is child of container before operations
 * Given the input might be detached during initialization
 * When ensureInputInContainer is called
 * Then input is properly appended to container if needed
 * Params:
 * { "ensureParent": true, "domIntegrity": "maintained", "insertionCorrect": true }
 */
test('ensures input is child of container before operations', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  // Initialize in advanced mode (which triggers ensureInputInContainer)
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced');

  // Verify input is properly in the container
  const inputParent = await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input-advanced"]');
    const container = input?.parentElement;
    return container?.getAttribute('data-testid');
  });

  expect(inputParent).toBe('test-input-advanced-wrapper');

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: injects elements in correct order in advanced mode
 * Given TouchSpin uses advanced mode with existing container
 * When elements are injected
 * Then order is: prefix, down-button, input, up-button, postfix (horizontal)
 * Params:
 * { "elementOrder": "prefix-down-input-up-postfix", "orderCorrect": true, "advancedMode": true }
 */
test('injects elements in correct order in advanced mode', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced', {
    prefix: '$',
    postfix: 'USD',
  });

  // Verify element order in DOM
  const elementOrder = await page.evaluate(() => {
    const wrapper = document.querySelector('[data-testid="test-input-advanced-wrapper"]');
    const children = Array.from(wrapper?.children || []);
    return children.map(
      (child) =>
        child.getAttribute('data-touchspin-injected') ||
        child.getAttribute('data-testid') ||
        child.tagName
    );
  });

  // Expected order for horizontal: prefix, down, input, up, postfix
  expect(elementOrder).toContain('prefix');
  expect(elementOrder).toContain('down');
  expect(elementOrder).toContain('input');
  expect(elementOrder).toContain('up');
  expect(elementOrder).toContain('postfix');

  // Verify correct order
  const prefixIndex = elementOrder.indexOf('prefix');
  const downIndex = elementOrder.indexOf('down');
  const inputIndex = elementOrder.indexOf('input');
  const upIndex = elementOrder.indexOf('up');
  const postfixIndex = elementOrder.indexOf('postfix');

  expect(prefixIndex).toBeLessThan(inputIndex);
  expect(downIndex).toBeLessThan(inputIndex);
  expect(inputIndex).toBeLessThan(upIndex);
  expect(upIndex).toBeLessThan(postfixIndex);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: handles prefix and postfix in advanced mode
 * Given TouchSpin uses advanced mode
 * When prefix and postfix are set
 * Then they are properly injected into existing container
 * Params:
 * { "prefix": "$", "postfix": "USD", "advancedMode": true }
 */
test('handles prefix and postfix in advanced mode', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced', {
    prefix: '$',
    postfix: 'USD',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input-advanced');

  // Verify prefix and postfix are visible
  await expect(elements.prefix).toBeVisible();
  await expect(elements.prefix).toHaveText('$');
  await expect(elements.postfix).toBeVisible();
  await expect(elements.postfix).toHaveText('USD');

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: applies size classes to existing container
 * Given input has size classes (text-sm or text-lg)
 * When TouchSpin initializes in advanced mode
 * Then size classes are applied to existing container and elements
 * Params:
 * { "sizeDetection": true, "sizeApplication": "container_and_elements", "advancedMode": true }
 */
test('applies size classes to existing container', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  // Add size classes to existing test-input-advanced
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input-advanced"]') as HTMLInputElement;
    if (input) {
      input.classList.add('text-sm', 'py-1');
    }
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input-advanced');

  // Verify size classes applied to container
  await expect(elements.wrapper).toHaveClass(/text-sm/);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: hides empty prefix/postfix in advanced mode
 * Given TouchSpin uses advanced mode without prefix/postfix
 * When initialization completes
 * Then empty prefix/postfix elements are hidden
 * Params:
 * { "prefix": "", "postfix": "", "hideEmpty": true, "advancedMode": true }
 */
test('hides empty prefix/postfix in advanced mode', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced', {
    prefix: '',
    postfix: '',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input-advanced');

  // Verify prefix and postfix are hidden (display: none)
  const prefixDisplay = await elements.prefix.evaluate((el) => window.getComputedStyle(el).display);
  const postfixDisplay = await elements.postfix.evaluate(
    (el) => window.getComputedStyle(el).display
  );

  expect(prefixDisplay).toBe('none');
  expect(postfixDisplay).toBe('none');

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});
