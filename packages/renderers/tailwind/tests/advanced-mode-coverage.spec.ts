/**
 * Feature: Tailwind renderer advanced mode uncovered scenarios
 * Background: fixture = /packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] buildAdvancedInputGroup creates elements in existing container
 * [x] buildAdvancedInputGroup handles vertical layout correctly
 * [x] buildAdvancedInputGroup handles horizontal layout correctly
 * [x] ensureInputInContainer appends input when parent differs
 * [x] ensureInputInContainer returns early when parent matches
 * [x] applies small size classes in advanced mode
 * [x] applies large size classes in advanced mode
 * [x] updateVerticalButtonClass updates up button class
 * [x] updateVerticalButtonClass updates down button class with border-b-0
 * [x] updateVerticalButtonClass handles null wrapper defensively
 * [x] updateVerticalButtonClass handles missing vertical wrapper
 * [x] updatePrefixClasses updates prefix element classes
 * [x] updatePostfixClasses updates postfix element classes
 * [x] advanced mode sets wrapperType to wrapper-advanced
 * [x] advanced mode adds testid to container without testid
 * [x] advanced mode preserves existing testid on container
 * [x] advanced mode removes form-control class from input
 * [x] advanced mode applies Tailwind input classes
 * [x] advanced mode hides empty prefix and postfix
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { ensureTailwindGlobals } from './helpers/tailwind-globals';

/**
 * Scenario: buildAdvancedInputGroup creates elements in existing container
 * Given input is inside a flex rounded-md container
 * When TouchSpin initializes
 * Then buttons and addons are injected into existing container
 * Params:
 * { "existingContainer": "flex rounded-md", "elementInjection": "into_container" }
 */
test('buildAdvancedInputGroup creates elements in existing container', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  // Use test-input-advanced which is in an existing flex rounded-md container
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced', {
    prefix: '$',
    postfix: 'USD',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input-advanced');

  // Verify wrapper is the existing container
  await expect(elements.wrapper).toHaveClass(/flex/);
  await expect(elements.wrapper).toHaveClass(/rounded-md/);

  // Verify buttons are injected into container
  await expect(elements.upButton).toBeVisible();
  await expect(elements.downButton).toBeVisible();

  // Verify prefix/postfix are in container
  await expect(elements.prefix).toBeVisible();
  await expect(elements.postfix).toBeVisible();

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: buildAdvancedInputGroup handles vertical layout correctly
 * Given input is inside existing container
 * When TouchSpin initializes with verticalbuttons true
 * Then vertical wrapper is created and positioned after input
 * Params:
 * { "verticalbuttons": true, "advancedMode": true, "verticalWrapper": "after_input" }
 */
test('buildAdvancedInputGroup handles vertical layout correctly', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced', {
    verticalbuttons: true,
  });

  // Verify vertical wrapper exists
  const verticalWrapperExists = await page.evaluate(() => {
    const wrapper = document.querySelector('[data-testid="test-input-advanced-wrapper"]');
    const verticalWrapper = wrapper?.querySelector('[data-touchspin-injected="vertical-wrapper"]');
    return verticalWrapper !== null;
  });
  expect(verticalWrapperExists).toBe(true);

  // Verify vertical wrapper is positioned after input
  const verticalWrapperAfterInput = await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input-advanced"]');
    const nextSibling = input?.nextElementSibling;
    return nextSibling?.getAttribute('data-touchspin-injected') === 'vertical-wrapper';
  });
  expect(verticalWrapperAfterInput).toBe(true);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: buildAdvancedInputGroup handles horizontal layout correctly
 * Given input is inside existing container
 * When TouchSpin initializes with horizontal layout
 * Then down button before input, up button after input
 * Params:
 * { "verticalbuttons": false, "advancedMode": true, "buttonOrder": "down-input-up" }
 */
test('buildAdvancedInputGroup handles horizontal layout correctly', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced', {
    verticalbuttons: false,
  });

  // Verify horizontal layout with down button before input, up button after input
  const buttonOrder = await page.evaluate(() => {
    const wrapper = document.querySelector('[data-testid="test-input-advanced-wrapper"]');
    const children = Array.from(wrapper?.children || []);
    const inputIndex = children.findIndex(
      (child) => child.getAttribute('data-testid') === 'test-input-advanced'
    );
    const downIndex = children.findIndex(
      (child) => child.getAttribute('data-touchspin-injected') === 'down'
    );
    const upIndex = children.findIndex(
      (child) => child.getAttribute('data-touchspin-injected') === 'up'
    );
    return { inputIndex, downIndex, upIndex };
  });

  expect(buttonOrder.downIndex).toBeLessThan(buttonOrder.inputIndex);
  expect(buttonOrder.inputIndex).toBeLessThan(buttonOrder.upIndex);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: ensureInputInContainer appends input when parent differs
 * Given input parent is not the existing container
 * When ensureInputInContainer is called
 * Then input is appended to container
 * Params:
 * { "inputParent": "document.body", "containerParent": "flex_container", "inputMoved": true }
 */
test('ensureInputInContainer appends input when parent differs', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  // Create a scenario where input is outside its container
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.className = 'flex rounded-md shadow-sm';
    (window as any).createTestInput('orphan-input', {
      label: 'Orphaned Input',
      helpText: 'Input moved from container',
    });
    // Input is created inside an input-group, move it out temporarily
    const inputElement = document.querySelector('[data-testid="orphan-input"]') as HTMLElement;
    const body = document.body;
    body.appendChild(inputElement);
    body.appendChild(container);
  });

  // Initialize - should trigger ensureInputInContainer which moves input back
  await apiHelpers.initializeTouchspinFromGlobals(page, 'orphan-input');

  // Verify input was moved into its wrapper container
  const inputInContainer = await page.evaluate(() => {
    const input = document.querySelector('[data-testid="orphan-input"]');
    const parent = input?.parentElement;
    return parent?.getAttribute('data-testid') === 'orphan-input-wrapper';
  });
  expect(inputInContainer).toBe(true);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'orphan-input');
  await apiHelpers.expectValueToBe(page, 'orphan-input', '51');
});

/**
 * Scenario: ensureInputInContainer returns early when parent matches
 * Given input is already child of container
 * When ensureInputInContainer is called
 * Then it returns early without moving input
 * Params:
 * { "inputParent": "container", "earlyReturn": true, "noOperation": true }
 */
test('ensureInputInContainer returns early when parent matches', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  // test-input-advanced already has input as child of container
  const inputParentBefore = await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input-advanced"]');
    return input?.parentElement?.className;
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced');

  // Verify input parent didn't change (early return occurred)
  const inputParentAfter = await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input-advanced"]');
    return input?.parentElement?.getAttribute('data-testid');
  });

  expect(inputParentAfter).toBe('test-input-advanced-wrapper');

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: applies small size classes in advanced mode
 * Given input has text-sm or py-1 classes in advanced container
 * When _applySizeClasses is called
 * Then text-sm py-1 px-2 classes applied to wrapper and elements
 * Params:
 * { "inputClasses": ["text-sm", "py-1"], "sizeApplied": "text-sm py-1 px-2", "advancedMode": true }
 */
test('applies small size classes in advanced mode', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  // Create input with small size classes in advanced container
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.className = 'flex rounded-md shadow-sm border border-gray-300';
    (window as any).createTestInput('small-size-input', {
      label: 'Small Size Test',
      helpText: 'Testing small size detection',
    });
    const input = document.querySelector('[data-testid="small-size-input"]') as HTMLInputElement;
    if (input) {
      input.classList.add('text-sm', 'py-1');
      container.appendChild(input);
      const parent = input.closest('.mb-4');
      if (parent && input.closest('.mb-6')) {
        parent.replaceChild(container, input.closest('.mb-6')!);
      }
    }
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'small-size-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'small-size-input');

  // Verify small size classes applied
  await expect(elements.wrapper).toHaveClass(/text-sm/);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'small-size-input');
  await apiHelpers.expectValueToBe(page, 'small-size-input', '51');
});

/**
 * Scenario: applies large size classes in advanced mode
 * Given input has text-lg or py-3 classes in advanced container
 * When _applySizeClasses is called
 * Then text-lg py-3 px-4 classes applied to wrapper and elements
 * Params:
 * { "inputClasses": ["text-lg", "py-3"], "sizeApplied": "text-lg py-3 px-4", "advancedMode": true }
 */
test('applies large size classes in advanced mode', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  // Create input with large size classes in advanced container
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.className = 'flex rounded-md shadow-sm border border-gray-300';
    (window as any).createTestInput('large-size-input', {
      label: 'Large Size Test',
      helpText: 'Testing large size detection',
    });
    const input = document.querySelector('[data-testid="large-size-input"]') as HTMLInputElement;
    if (input) {
      input.classList.add('text-lg', 'py-3');
      container.appendChild(input);
      const parent = input.closest('.mb-4');
      if (parent && input.closest('.mb-6')) {
        parent.replaceChild(container, input.closest('.mb-6')!);
      }
    }
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'large-size-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'large-size-input');

  // Verify large size classes applied
  await expect(elements.wrapper).toHaveClass(/text-lg/);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'large-size-input');
  await apiHelpers.expectValueToBe(page, 'large-size-input', '51');
});

/**
 * Scenario: updateVerticalButtonClass updates up button class
 * Given TouchSpin initialized with vertical buttons
 * When verticalupclass is updated
 * Then up button gets border-t-0 border-r-0 classes
 * Params:
 * { "type": "up", "verticalupclass": "bg-blue-500", "borderClasses": "border-t-0 border-r-0" }
 */
test('updateVerticalButtonClass updates up button class', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced', {
    verticalbuttons: true,
    verticalupclass: 'bg-blue-500',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input-advanced');

  // Verify up button has border-t-0 and border-r-0 classes
  await expect(elements.upButton).toHaveClass(/border-t-0/);
  await expect(elements.upButton).toHaveClass(/border-r-0/);
  await expect(elements.upButton).toHaveClass(/bg-blue-500/);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: updateVerticalButtonClass updates down button class with border-b-0
 * Given TouchSpin initialized with vertical buttons
 * When verticaldownclass is updated
 * Then down button gets border-t-0 border-r-0 border-b-0 classes
 * Params:
 * { "type": "down", "verticaldownclass": "bg-red-500", "borderClasses": "border-t-0 border-r-0 border-b-0" }
 */
test('updateVerticalButtonClass updates down button class with border-b-0', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced', {
    verticalbuttons: true,
    verticaldownclass: 'bg-red-500',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input-advanced');

  // Verify down button has border-t-0, border-r-0, and border-b-0 classes
  await expect(elements.downButton).toHaveClass(/border-t-0/);
  await expect(elements.downButton).toHaveClass(/border-r-0/);
  await expect(elements.downButton).toHaveClass(/border-b-0/);
  await expect(elements.downButton).toHaveClass(/bg-red-500/);

  // Verify functionality works
  await apiHelpers.clickDownButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '49');
});

/**
 * Scenario: updateVerticalButtonClass handles null wrapper defensively
 * Given wrapper is null after teardown
 * When updateVerticalButtonClass is called
 * Then it returns early without error
 * Params:
 * { "wrapperState": "null", "defensive": true }
 */
test('updateVerticalButtonClass handles null wrapper defensively', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced', {
    verticalbuttons: true,
  });

  // Manually set wrapper to null to simulate post-teardown state
  const noError = await page.evaluate(() => {
    try {
      const input = document.querySelector('[data-testid="test-input-advanced"]') as any;
      if (input && input.TouchSpin && input.TouchSpin.renderer) {
        // Simulate wrapper being null
        const originalWrapper = input.TouchSpin.renderer.wrapper;
        input.TouchSpin.renderer.wrapper = null;
        // Try to update vertical button class (should handle null defensively)
        input.TouchSpin.updateSettings({ verticalupclass: 'new-class' });
        // Restore for cleanup
        input.TouchSpin.renderer.wrapper = originalWrapper;
      }
      return true;
    } catch (e) {
      return false;
    }
  });

  // Verify no error occurred (defensive handling worked)
  expect(noError).toBe(true);
});

/**
 * Scenario: updateVerticalButtonClass handles missing vertical wrapper
 * Given wrapper exists but has no vertical-wrapper child
 * When updateVerticalButtonClass is called
 * Then it returns early without error
 * Params:
 * { "verticalWrapperMissing": true, "defensive": true }
 */
test('updateVerticalButtonClass handles missing vertical wrapper', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  // Initialize without vertical buttons (horizontal layout)
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced', {
    verticalbuttons: false,
  });

  // Try to update vertical button class when no vertical wrapper exists
  const noError = await page.evaluate(() => {
    try {
      const input = document.querySelector('[data-testid="test-input-advanced"]') as any;
      // This should handle missing vertical wrapper defensively
      if (input && input.TouchSpin) {
        input.TouchSpin.updateSettings({ verticalupclass: 'new-class' });
      }
      return true;
    } catch (e) {
      return false;
    }
  });

  // Verify no error occurred (defensive handling worked)
  expect(noError).toBe(true);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: updatePrefixClasses updates prefix element classes
 * Given TouchSpin initialized with prefix
 * When prefix_extraclass setting changes
 * Then prefix className is rebuilt with new extra classes
 * Params:
 * { "prefix": "$", "prefix_extraclass": "font-bold text-xl", "classRebuild": true }
 */
test('updatePrefixClasses updates prefix element classes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced', {
    prefix: '$',
    prefix_extraclass: 'text-sm',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input-advanced');

  // Verify initial prefix class
  await expect(elements.prefix).toHaveClass(/text-sm/);

  // Update prefix_extraclass
  await apiHelpers.updateSettingsViaAPI(page, 'test-input-advanced', {
    prefix_extraclass: 'font-bold text-xl',
  });

  // Verify prefix class was rebuilt with new classes
  await expect(elements.prefix).toHaveClass(/font-bold/);
  await expect(elements.prefix).toHaveClass(/text-xl/);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: updatePostfixClasses updates postfix element classes
 * Given TouchSpin initialized with postfix
 * When postfix_extraclass setting changes
 * Then postfix className is rebuilt with new extra classes
 * Params:
 * { "postfix": "kg", "postfix_extraclass": "font-light text-xs", "classRebuild": true }
 */
test('updatePostfixClasses updates postfix element classes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced', {
    postfix: 'kg',
    postfix_extraclass: 'text-sm',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input-advanced');

  // Verify initial postfix class
  await expect(elements.postfix).toHaveClass(/text-sm/);

  // Update postfix_extraclass
  await apiHelpers.updateSettingsViaAPI(page, 'test-input-advanced', {
    postfix_extraclass: 'font-light text-xs',
  });

  // Verify postfix class was rebuilt with new classes
  await expect(elements.postfix).toHaveClass(/font-light/);
  await expect(elements.postfix).toHaveClass(/text-xs/);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: advanced mode sets wrapperType to wrapper-advanced
 * Given input in existing flex rounded-md container
 * When buildAdvancedInputGroup runs
 * Then this.wrapperType is set to wrapper-advanced
 * Params:
 * { "wrapperType": "wrapper-advanced", "advancedModeMarker": true }
 */
test('advanced mode sets wrapperType to wrapper-advanced', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced');

  // Verify wrapperType is set to wrapper-advanced
  const wrapperType = await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input-advanced"]') as any;
    return input?.TouchSpin?.renderer?.wrapperType;
  });

  expect(wrapperType).toBe('wrapper-advanced');

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: advanced mode adds testid to container without testid
 * Given container has no data-testid but input has one
 * When buildAdvancedInputGroup runs
 * Then container gets input-wrapper testid
 * Params:
 * { "inputTestId": "my-input", "containerTestId": null, "resultTestId": "my-input-wrapper" }
 */
test('advanced mode adds testid to container without testid', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  // Create input in container without testid
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.className = 'flex rounded-md shadow-sm';
    (window as any).createTestInput('testid-input', {
      label: 'TestID Test',
      helpText: 'Testing testid addition',
    });
    const input = document.querySelector('[data-testid="testid-input"]') as HTMLInputElement;
    if (input) {
      container.appendChild(input);
      const parent = input.closest('.mb-4');
      if (parent && input.closest('.mb-6')) {
        parent.replaceChild(container, input.closest('.mb-6')!);
      }
    }
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'testid-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'testid-input');

  // Verify container got testid added
  await expect(elements.wrapper).toHaveAttribute('data-testid', 'testid-input-wrapper');

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'testid-input');
  await apiHelpers.expectValueToBe(page, 'testid-input', '51');
});

/**
 * Scenario: advanced mode preserves existing testid on container
 * Given container already has data-testid
 * When buildAdvancedInputGroup runs
 * Then existing testid is not overwritten
 * Params:
 * { "containerTestId": "custom-wrapper", "preserveTestId": true }
 */
test('advanced mode preserves existing testid on container', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  // Create input in container with existing testid
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.className = 'flex rounded-md shadow-sm';
    container.setAttribute('data-testid', 'custom-wrapper');
    (window as any).createTestInput('preserve-testid-input', {
      label: 'Preserve TestID Test',
      helpText: 'Testing testid preservation',
    });
    const input = document.querySelector(
      '[data-testid="preserve-testid-input"]'
    ) as HTMLInputElement;
    if (input) {
      container.appendChild(input);
      const parent = input.closest('.mb-4');
      if (parent && input.closest('.mb-6')) {
        parent.replaceChild(container, input.closest('.mb-6')!);
      }
    }
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'preserve-testid-input');

  // Verify container testid was preserved
  const containerTestId = await page.evaluate(() => {
    const input = document.querySelector('[data-testid="preserve-testid-input"]');
    return input?.parentElement?.getAttribute('data-testid');
  });

  expect(containerTestId).toBe('custom-wrapper');

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'preserve-testid-input');
  await apiHelpers.expectValueToBe(page, 'preserve-testid-input', '51');
});

/**
 * Scenario: advanced mode removes form-control class from input
 * Given input has form-control class in advanced container
 * When buildAdvancedInputGroup runs
 * Then form-control class is removed from input
 * Params:
 * { "inputClass": "form-control", "classRemoval": "form-control" }
 */
test('advanced mode removes form-control class from input', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  // Create input with form-control class in advanced container
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.className = 'flex rounded-md shadow-sm';
    (window as any).createTestInput('form-control-input', {
      label: 'Form Control Test',
      helpText: 'Testing form-control removal',
    });
    const input = document.querySelector('[data-testid="form-control-input"]') as HTMLInputElement;
    if (input) {
      input.classList.add('form-control');
      container.appendChild(input);
      const parent = input.closest('.mb-4');
      if (parent && input.closest('.mb-6')) {
        parent.replaceChild(container, input.closest('.mb-6')!);
      }
    }
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'form-control-input');

  // Verify form-control class was removed
  const hasFormControl = await page.evaluate(() => {
    const input = document.querySelector('[data-testid="form-control-input"]');
    return input?.classList.contains('form-control');
  });

  expect(hasFormControl).toBe(false);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'form-control-input');
  await apiHelpers.expectValueToBe(page, 'form-control-input', '51');
});

/**
 * Scenario: advanced mode applies Tailwind input classes
 * Given input in advanced container
 * When buildAdvancedInputGroup runs
 * Then Tailwind classes (flex-1, px-3, py-2, etc.) are added
 * Params:
 * { "tailwindClasses": ["flex-1", "px-3", "py-2", "border-0"], "classAddition": true }
 */
test('advanced mode applies Tailwind input classes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await ensureTailwindGlobals(page);

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced');

  // Verify Tailwind classes were added to input
  const hasClasses = await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input-advanced"]');
    return {
      hasFlex1: input?.classList.contains('flex-1'),
      hasBorder0: input?.classList.contains('border-0'),
    };
  });

  expect(hasClasses.hasFlex1).toBe(true);
  expect(hasClasses.hasBorder0).toBe(true);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: advanced mode hides empty prefix and postfix
 * Given prefix and postfix are empty in advanced mode
 * When buildAdvancedInputGroup completes
 * Then prefix and postfix elements have display none
 * Params:
 * { "prefix": "", "postfix": "", "hiddenElements": true }
 */
test('advanced mode hides empty prefix and postfix', async ({ page }) => {
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
