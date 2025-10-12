/**
 * Feature: Tailwind renderer edge cases and special scenarios
 * Background: fixture = /packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] handles null/undefined class names in updateButtonClass
 * [x] handles null/undefined text in updateButtonText
 * [x] handles null/undefined class in updateVerticalButtonClass
 * [x] handles null/undefined text in updateVerticalButtonText
 * [x] updates prefix from empty to non-empty
 * [x] updates postfix from non-empty to empty
 * [x] handles prefix_extraclass updates
 * [x] handles postfix_extraclass updates
 * [x] handles default button text for up button
 * [x] handles default button text for down button
 * [x] handles default vertical text for up button
 * [x] handles default vertical text for down button
 * [x] handles form-control class removal from input
 * [x] handles size detection with edge case classes
 * [x] handles size detection with no matching classes
 * [x] handles size detection with text-lg class
 * [x] handles focusablebuttons true and false
 * [x] updates settings multiple times rapidly
 * [x] handles updateButtonClass for down button type
 * [x] handles updateVerticalButtonClass with type=down
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { ensureTailwindGlobals } from './helpers/tailwind-globals';

/**
 * Scenario: handles null/undefined class names in updateButtonClass
 * Given TouchSpin is initialized
 * When buttonup_class or buttondown_class is set to null or undefined
 * Then default classes are applied without custom classes
 * Params:
 * { "buttonup_class": null, "buttondown_class": undefined, "defaultClasses": "applied" }
 */
test('handles null/undefined class names in updateButtonClass', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    buttonup_class: 'custom-up-class',
    buttondown_class: 'custom-down-class',
  });

  // Update to null/undefined
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: null,
    buttondown_class: undefined,
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify custom classes are removed
  const upClasses = await elements.upButton.getAttribute('class');
  const downClasses = await elements.downButton.getAttribute('class');

  expect(upClasses).not.toContain('custom-up-class');
  expect(downClasses).not.toContain('custom-down-class');

  // Verify base classes are still present
  expect(upClasses).toContain('tailwind-btn');
  expect(downClasses).toContain('tailwind-btn');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles null/undefined text in updateButtonText
 * Given TouchSpin is initialized
 * When button text is set to null or undefined
 * Then button text becomes empty (no fallback)
 * Params:
 * { "buttonup_txt": null, "buttondown_txt": undefined, "emptyText": "allowed" }
 */
test('handles null/undefined text in updateButtonText', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    buttonup_txt: 'UP',
    buttondown_txt: 'DOWN',
  });

  // Update to null/undefined
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_txt: null,
    buttondown_txt: undefined,
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify text is empty (no fallback)
  await expect(elements.upButton).toHaveText('');
  await expect(elements.downButton).toHaveText('');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles null/undefined class in updateVerticalButtonClass
 * Given TouchSpin is initialized with vertical buttons
 * When verticalupclass or verticaldownclass is set to null or undefined
 * Then default vertical classes are applied
 * Params:
 * { "verticalupclass": null, "verticaldownclass": undefined, "defaultClasses": "applied" }
 */
test('handles null/undefined class in updateVerticalButtonClass', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: true,
    verticalupclass: 'custom-v-up',
    verticaldownclass: 'custom-v-down',
  });

  // Update to null/undefined
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalupclass: null,
    verticaldownclass: undefined,
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify default classes are applied
  const upClasses = await elements.upButton.getAttribute('class');
  const downClasses = await elements.downButton.getAttribute('class');

  expect(upClasses).toContain('bg-gray-100');
  expect(downClasses).toContain('bg-gray-100');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles null/undefined text in updateVerticalButtonText
 * Given TouchSpin is initialized with vertical buttons
 * When verticalup or verticaldown text is set to null or undefined
 * Then button text becomes empty (no fallback)
 * Params:
 * { "verticalup": null, "verticaldown": undefined, "emptyText": "allowed" }
 */
test('handles null/undefined text in updateVerticalButtonText', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: true,
    verticalup: '▲',
    verticaldown: '▼',
  });

  // Update to null/undefined
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalup: null,
    verticaldown: undefined,
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify text is empty (no fallback)
  await expect(elements.upButton).toHaveText('');
  await expect(elements.downButton).toHaveText('');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates prefix from empty to non-empty
 * Given TouchSpin is initialized without prefix
 * When prefix is updated to non-empty value
 * Then prefix becomes visible with correct text
 * Params:
 * { "prefix": "", "newPrefix": "$", "visibilityToggle": "shown" }
 */
test('updates prefix from empty to non-empty', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    prefix: '',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify prefix is hidden initially
  const prefixDisplayBefore = await elements.prefix.evaluate(
    (el) => window.getComputedStyle(el).display
  );
  expect(prefixDisplayBefore).toBe('none');

  // Update to non-empty
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    prefix: '$',
  });

  // Verify prefix is now visible
  const prefixDisplayAfter = await elements.prefix.evaluate(
    (el) => window.getComputedStyle(el).display
  );
  expect(prefixDisplayAfter).not.toBe('none');
  await expect(elements.prefix).toHaveText('$');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates postfix from non-empty to empty
 * Given TouchSpin is initialized with postfix
 * When postfix is updated to empty string
 * Then postfix becomes hidden
 * Params:
 * { "postfix": "USD", "newPostfix": "", "visibilityToggle": "hidden" }
 */
test('updates postfix from non-empty to empty', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    postfix: 'USD',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify postfix is visible initially
  await expect(elements.postfix).toBeVisible();
  await expect(elements.postfix).toHaveText('USD');

  // Update to empty
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    postfix: '',
  });

  // Verify postfix is now hidden
  const postfixDisplay = await elements.postfix.evaluate(
    (el) => window.getComputedStyle(el).display
  );
  expect(postfixDisplay).toBe('none');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles prefix_extraclass updates
 * Given TouchSpin is initialized with prefix
 * When prefix_extraclass is updated
 * Then prefix classes are rebuilt with new extra class
 * Params:
 * { "prefix": "$", "prefix_extraclass": "custom-prefix-class", "classUpdate": "applied" }
 */
test('handles prefix_extraclass updates', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    prefix: '$',
  });

  // Update prefix_extraclass
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    prefix_extraclass: 'custom-prefix-class text-red-500',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify extra classes applied
  await expect(elements.prefix).toHaveClass(/custom-prefix-class/);
  await expect(elements.prefix).toHaveClass(/text-red-500/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles postfix_extraclass updates
 * Given TouchSpin is initialized with postfix
 * When postfix_extraclass is updated
 * Then postfix classes are rebuilt with new extra class
 * Params:
 * { "postfix": "USD", "postfix_extraclass": "custom-postfix-class", "classUpdate": "applied" }
 */
test('handles postfix_extraclass updates', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    postfix: 'USD',
  });

  // Update postfix_extraclass
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    postfix_extraclass: 'custom-postfix-class text-blue-500',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify extra classes applied
  await expect(elements.postfix).toHaveClass(/custom-postfix-class/);
  await expect(elements.postfix).toHaveClass(/text-blue-500/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles default button text for up button
 * Given TouchSpin is initialized without buttonup_txt
 * When updateButtonText is called with null/undefined
 * Then default '+' is used
 * Params:
 * { "buttonup_txt": undefined, "defaultText": "+", "textFallback": "correct" }
 */
test('handles default button text for up button', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify default text
  await expect(elements.upButton).toHaveText('+');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles default button text for down button
 * Given TouchSpin is initialized without buttondown_txt
 * When updateButtonText is called with null/undefined
 * Then default '−' is used
 * Params:
 * { "buttondown_txt": undefined, "defaultText": "−", "textFallback": "correct" }
 */
test('handles default button text for down button', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify default text
  await expect(elements.downButton).toHaveText('−');

  // Verify functionality still works
  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '49');
});

/**
 * Scenario: handles default vertical text for up button
 * Given TouchSpin is initialized with vertical buttons without verticalup text
 * When updateVerticalButtonText is called with null/undefined
 * Then default '+' is used
 * Params:
 * { "verticalbuttons": true, "verticalup": undefined, "defaultText": "+", "textFallback": "correct" }
 */
test('handles default vertical text for up button', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: true,
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify default text
  await expect(elements.upButton).toHaveText('+');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles default vertical text for down button
 * Given TouchSpin is initialized with vertical buttons without verticaldown text
 * When updateVerticalButtonText is called with null/undefined
 * Then default '−' is used
 * Params:
 * { "verticalbuttons": true, "verticaldown": undefined, "defaultText": "−", "textFallback": "correct" }
 */
test('handles default vertical text for down button', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: true,
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify default text
  await expect(elements.downButton).toHaveText('−');

  // Verify functionality still works
  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '49');
});

/**
 * Scenario: handles form-control class removal from input
 * Given input has form-control class from Bootstrap
 * When TouchSpin initializes
 * Then form-control class is removed and Tailwind classes are added
 * Params:
 * { "inputClass": "form-control", "classRemoval": "form-control", "classAddition": "tailwind_classes" }
 */
test('handles form-control class removal from input', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  // Add form-control class before initialization
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    input?.classList.add('form-control');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify form-control is removed
  const inputClasses = await elements.input.getAttribute('class');
  expect(inputClasses).not.toContain('form-control');

  // Verify Tailwind classes are present
  expect(inputClasses).toContain('flex-1');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles size detection with edge case classes
 * Given input has both text-sm and py-1 classes
 * When size is detected
 * Then small size is correctly identified
 * Params:
 * { "inputClasses": ["text-sm", "py-1"], "detectedSize": "text-sm py-1 px-2", "sizeDetection": "correct" }
 */
test('handles size detection with edge case classes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  // Create input with size classes
  await page.evaluate(() => {
    const input = window.createTestInput('size-edge-test', {
      label: 'Size Edge Test',
      helpText: 'Testing size detection edge cases',
    });
    input.classList.add('text-sm', 'py-1');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'size-edge-test');

  const elements = await apiHelpers.getTouchSpinElements(page, 'size-edge-test');

  // Verify size class applied to wrapper
  await expect(elements.wrapper).toHaveClass(/text-sm/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'size-edge-test');
  await apiHelpers.expectValueToBe(page, 'size-edge-test', '51');
});

/**
 * Scenario: handles size detection with no matching classes
 * Given input has no size-specific classes
 * When size is detected
 * Then default size (text-base py-2 px-3) is used
 * Params:
 * { "inputClasses": [], "detectedSize": "text-base py-2 px-3", "sizeDetection": "default" }
 */
test('handles size detection with no matching classes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Verify functionality works with default size
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles focusablebuttons true and false
 * Given TouchSpin is initialized
 * When focusablebuttons is toggled between true and false
 * Then tabindex is updated correctly on all buttons
 * Params:
 * { "focusablebuttons": true, "tabindex": "0", "focusabilityToggle": "correct" }
 */
test('handles focusablebuttons true and false', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    focusablebuttons: true,
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify tabindex is 0 initially
  await expect(elements.upButton).toHaveAttribute('tabindex', '0');
  await expect(elements.downButton).toHaveAttribute('tabindex', '0');

  // Update to false
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    focusablebuttons: false,
  });

  // Verify tabindex is -1
  await expect(elements.upButton).toHaveAttribute('tabindex', '-1');
  await expect(elements.downButton).toHaveAttribute('tabindex', '-1');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates settings multiple times rapidly
 * Given TouchSpin is initialized
 * When multiple setting updates occur rapidly
 * Then all updates are processed correctly
 * Params:
 * { "rapidUpdates": 5, "updateSpeed": "rapid", "finalState": "correct" }
 */
test('updates settings multiple times rapidly', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Rapid updates
  for (let i = 0; i < 5; i++) {
    await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
      buttonup_txt: `U${i}`,
      buttondown_txt: `D${i}`,
      prefix: `$${i}`,
      postfix: `P${i}`,
    });
  }

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify final state
  await expect(elements.upButton).toHaveText('U4');
  await expect(elements.downButton).toHaveText('D4');
  await expect(elements.prefix).toHaveText('$4');
  await expect(elements.postfix).toHaveText('P4');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles size detection with text-lg class
 * Given input has text-lg or py-3 classes
 * When size is detected
 * Then large size is correctly identified
 * Params:
 * { "inputClasses": ["text-lg", "py-3"], "detectedSize": "text-lg py-3 px-4", "sizeDetection": "correct" }
 */
test('handles size detection with text-lg class', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  // Create input with large size classes
  await page.evaluate(() => {
    const input = window.createTestInput('size-lg-test', {
      label: 'Size Large Test',
      helpText: 'Testing large size detection',
    });
    input.classList.add('text-lg', 'py-3');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'size-lg-test');

  const elements = await apiHelpers.getTouchSpinElements(page, 'size-lg-test');

  // Verify large size class applied to wrapper
  await expect(elements.wrapper).toHaveClass(/text-lg/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'size-lg-test');
  await apiHelpers.expectValueToBe(page, 'size-lg-test', '51');
});

/**
 * Scenario: handles updateButtonClass for down button type
 * Given TouchSpin is initialized
 * When updateButtonClass is called with type='down'
 * Then down button classes are updated correctly with RTL border classes
 * Params:
 * { "type": "down", "borderClass": "border-y-0 border-r border-l-0 rtl:border-l rtl:border-r-0", "classUpdate": "correct" }
 */
test('handles updateButtonClass for down button type', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Update down button class
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttondown_class: 'bg-custom-down text-white',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify down button has RTL border classes
  const downClasses = await elements.downButton.getAttribute('class');
  expect(downClasses).toContain('border-r');
  expect(downClasses).toContain('rtl:border-l');
  expect(downClasses).toContain('bg-custom-down');

  // Verify functionality still works
  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '49');
});

/**
 * Scenario: handles updateVerticalButtonClass with type='down'
 * Given TouchSpin is initialized with vertical buttons
 * When updateVerticalButtonClass is called with type='down'
 * Then down button gets correct border classes (border-b-0)
 * Params:
 * { "type": "down", "verticalbuttons": true, "borderClass": "border-t-0 border-r-0 border-b-0", "classUpdate": "correct" }
 */
test('handles updateVerticalButtonClass with type=down', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: true,
  });

  // Update down button class
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticaldownclass: 'bg-custom-v-down text-white',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify down button has correct border classes
  const downClasses = await elements.downButton.getAttribute('class');
  expect(downClasses).toContain('border-b-0');
  expect(downClasses).toContain('bg-custom-v-down');

  // Verify functionality still works
  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '49');
});
