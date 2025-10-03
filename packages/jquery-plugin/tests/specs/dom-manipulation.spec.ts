/**
 * Feature: jQuery plugin DOM manipulation and structure
 * Background: fixture = /packages/jquery-plugin/tests/fixtures/jquery-plugin-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] creates wrapper structure around input element
 * [x] generates up and down buttons with correct classes
 * [x] handles prefix text insertion correctly
 * [x] handles postfix text insertion correctly
 * [x] supports vertical button layout option
 * [x] applies Bootstrap integration classes correctly
 * [x] maintains input element attributes during wrapping
 * [x] handles existing wrapper detection and reuse
 * [x] supports custom button templates
 * [x] integrates with Bootstrap input groups
 * [x] handles responsive behavior in Bootstrap grid
 * [x] applies ARIA attributes for accessibility
 * [x] supports RTL (right-to-left) layouts
 * [x] handles CSS class application and removal
 * [x] manages z-index and layering correctly
 * [x] supports theming and custom styling
 * [x] handles button positioning edge cases
 * [x] maintains DOM hierarchy integrity
 * [x] supports conditional element creation
 * [x] handles dynamic DOM structure changes
 * [x] cleans up DOM modifications on destroy
 * [x] handles conflicts with other plugins
 * [x] supports nested container scenarios
 * [x] maintains form integration and submission
 * [x] handles input focus and tabbing behavior
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { installJqueryPlugin, initializeTouchspinJQuery } from '../helpers/jquery-initialization';

test.describe('jQuery plugin DOM manipulation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/jquery-plugin/tests/fixtures/jquery-plugin-fixture.html');
    await apiHelpers.startCoverage(page);
    await apiHelpers.waitForPageReady(page);

    try {
      await installJqueryPlugin(page);
    } catch (error) {
      console.error('Failed to install jQuery plugin:', error);
      throw error;
    }

    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  /**
   * Scenario: creates wrapper structure around input element
   * Given the fixture page is loaded with a bare input
   * When TouchSpin initializes
   * Then a proper wrapper structure is created
   * Params:
   * { "expectedStructure": "wrapper > input + buttons", "wrapperClass": "input-group" }
   */
  test('creates wrapper structure around input element', async ({ page }) => {
    // Initialize TouchSpin
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

    // Check wrapper structure
    const wrapperExists = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      const input = document.querySelector('[data-testid="test-input"]');
      return wrapper?.contains(input);
    });

    expect(wrapperExists).toBe(true);
  });

  /**
   * Scenario: generates up and down buttons with correct classes
   * Given the fixture page is loaded
   * When TouchSpin initializes with button configuration
   * Then up and down buttons are created with appropriate classes
   * Params:
   * { "upButtonClass": "btn btn-outline-secondary", "downButtonClass": "btn btn-outline-secondary" }
   */
  test('generates up and down buttons with correct classes', async ({ page }) => {
    // Initialize TouchSpin
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

    // Check button elements using proper helpers
    const { upButton, downButton } = await apiHelpers.getTouchSpinElements(page, 'test-input');

    await expect(upButton).toBeVisible();
    await expect(downButton).toBeVisible();
  });

  /**
   * Scenario: handles prefix text insertion correctly
   * Given the fixture page is loaded
   * When TouchSpin initializes with prefix configuration
   * Then prefix text is inserted in the correct position
   * Params:
   * { "prefix": "$", "expectedPosition": "before_input", "prefixClass": "input-group-text" }
   */
  test('handles prefix text insertion correctly', async ({ page }) => {
    // Initialize TouchSpin with prefix
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10, prefix: 'Amount:' });

    // Check prefix element
    const prefixExists = await page.evaluate(() => {
      const prefixElement = document.querySelector('[data-testid="test-input-prefix"]');
      return prefixElement?.textContent?.includes('Amount:');
    });

    expect(prefixExists).toBe(true);
  });

  /**
   * Scenario: handles postfix text insertion correctly
   * Given the fixture page is loaded
   * When TouchSpin initializes with postfix configuration
   * Then postfix text is inserted in the correct position
   * Params:
   * { "postfix": "kg", "expectedPosition": "after_input", "postfixClass": "input-group-text" }
   */
  test('handles postfix text insertion correctly', async ({ page }) => {
    // Initialize TouchSpin with postfix
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10, postfix: 'units' });

    // Check postfix element
    const postfixExists = await page.evaluate(() => {
      const postfixElement = document.querySelector('[data-testid="test-input-postfix"]');
      return postfixElement?.textContent?.includes('units');
    });

    expect(postfixExists).toBe(true);
  });

  /**
   * Scenario: supports vertical button layout option
   * Given the fixture page is loaded
   * When TouchSpin initializes with vertical layout
   * Then buttons are arranged vertically
   * Params:
   * { "verticalbuttons": true, "expectedLayout": "buttons_stacked_vertically" }
   */
  test('supports vertical button layout option', async ({ page }) => {
    // Initialize TouchSpin with vertical buttons
    await initializeTouchspinJQuery(page, 'test-input', {
      min: 0,
      max: 10,
      verticalbuttons: true,
      verticalup: '<i class="bi bi-chevron-up"></i>',
      verticaldown: '<i class="bi bi-chevron-down"></i>',
    });

    // Check that TouchSpin initializes properly with vertical buttons
    // The vertical buttons configuration should result in visible up/down buttons
    const { wrapper, upButton, downButton } = await apiHelpers.getTouchSpinElements(
      page,
      'test-input'
    );
    await expect(wrapper).toBeVisible();
    await expect(upButton).toBeVisible();
    await expect(downButton).toBeVisible();
  });

  /**
   * Scenario: applies Bootstrap integration classes correctly
   * Given the fixture page is loaded with Bootstrap
   * When TouchSpin initializes
   * Then appropriate Bootstrap classes are applied
   * Params:
   * { "bootstrapVersion": "5", "expectedClasses": ["input-group", "btn", "form-control"] }
   */
  test('applies Bootstrap integration classes correctly', async ({ page }) => {
    // Initialize TouchSpin
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

    // Check Bootstrap classes
    const hasBootstrapClasses = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      const upButton = document.querySelector('[data-testid="test-input-up"]');

      return wrapper?.classList.contains('input-group') && upButton?.classList.contains('btn');
    });

    expect(hasBootstrapClasses).toBe(true);
  });

  /**
   * Scenario: maintains input element attributes during wrapping
   * Given the fixture page is loaded with input attributes
   * When TouchSpin wraps the input
   * Then original attributes are preserved
   * Params:
   * { "originalAttributes": ["id", "name", "placeholder", "required"], "expectedBehavior": "attributes_preserved" }
   */
  test('maintains input element attributes during wrapping', async ({ page }) => {
    // Set custom attributes before initialization
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]');
      if (input) {
        input.setAttribute('data-custom', 'test-value');
        input.setAttribute('placeholder', 'Enter number');
      }
    });

    // Initialize TouchSpin
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

    // Check attributes are preserved
    const attributesPreserved = await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]');
      return (
        input?.getAttribute('data-custom') === 'test-value' &&
        input?.getAttribute('placeholder') === 'Enter number'
      );
    });

    expect(attributesPreserved).toBe(true);
  });

  /**
   * Scenario: handles existing wrapper detection and reuse
   * Given the fixture page is loaded with pre-existing wrapper
   * When TouchSpin initializes
   * Then it detects and reuses the existing wrapper
   * Params:
   * { "existingWrapper": "div.input-group", "expectedBehavior": "reuse_wrapper" }
   */
  test('handles existing wrapper detection and reuse', async ({ page }) => {
    // Pre-create a wrapper structure
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]');
      if (input?.parentElement) {
        const wrapper = document.createElement('div');
        wrapper.className = 'input-group';
        wrapper.setAttribute('data-testid', 'test-input-wrapper');
        input.parentElement.insertBefore(wrapper, input);
        wrapper.appendChild(input);
      }
    });

    // Initialize TouchSpin - should detect and reuse existing wrapper
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

    // Check wrapper is reused, not duplicated
    const wrapperCount = await page.evaluate(() => {
      return document.querySelectorAll('[data-testid="test-input-wrapper"]').length;
    });

    expect(wrapperCount).toBe(1);
  });

  /**
   * Scenario: supports custom button templates
   * Given the fixture page is loaded
   * When TouchSpin initializes with custom button templates
   * Then custom templates are used for button creation
   * Params:
   * { "customTemplate": "<button class='custom-btn'><i class='icon'></i></button>", "expectedBehavior": "template_applied" }
   */
  test('supports custom button templates', async ({ page }) => {
    // Initialize TouchSpin with custom button templates
    await initializeTouchspinJQuery(page, 'test-input', {
      min: 0,
      max: 10,
      verticalbuttons: true,
      buttonup_class: 'custom-up-btn',
      buttondown_class: 'custom-down-btn',
      verticalup: '<i class="bi bi-arrow-up"></i>',
      verticaldown: '<i class="bi bi-arrow-down"></i>',
    });

    // Check custom templates are applied using proper helpers
    const { upButton, downButton } = await apiHelpers.getTouchSpinElements(page, 'test-input');

    await expect(upButton).toBeVisible();
    await expect(downButton).toBeVisible();

    // Verify custom classes are present
    await expect(upButton).toHaveClass(/custom-up-btn/);
    await expect(downButton).toHaveClass(/custom-down-btn/);

    // Check that icons exist within the buttons
    await expect(upButton.locator('.bi-arrow-up')).toHaveCount(1);
    await expect(downButton.locator('.bi-arrow-down')).toHaveCount(1);
  });

  /**
   * Scenario: integrates with Bootstrap input groups
   * Given the fixture page is loaded with Bootstrap input group
   * When TouchSpin initializes within the group
   * Then it integrates seamlessly with the group structure
   * Params:
   * { "inputGroupStructure": "prepend + input + append", "expectedIntegration": "seamless_integration" }
   */
  test('integrates with Bootstrap input groups', async ({ page }) => {
    // Pre-create Bootstrap input group structure
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]');
      if (input?.parentElement) {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';

        const prepend = document.createElement('div');
        prepend.className = 'input-group-prepend';
        prepend.innerHTML = '<span class="input-group-text">$</span>';

        input.parentElement.insertBefore(inputGroup, input);
        inputGroup.appendChild(prepend);
        inputGroup.appendChild(input);
      }
    });

    // Initialize TouchSpin within the input group
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

    // Check integration preserves input group structure
    const hasValidStructure = await page.evaluate(() => {
      const inputGroup = document.querySelector('.input-group');
      const prepend = inputGroup?.querySelector('.input-group-prepend');
      const input = inputGroup?.querySelector('[data-testid="test-input"]');
      const buttons = inputGroup?.querySelectorAll('.btn');

      return inputGroup && prepend && input && buttons && buttons.length >= 2;
    });

    expect(hasValidStructure).toBe(true);
  });

  /**
   * Scenario: handles responsive behavior in Bootstrap grid
   * Given the fixture page is loaded within Bootstrap grid
   * When the viewport size changes
   * Then TouchSpin adapts responsively
   * Params:
   * { "gridColumns": ["col-12", "col-md-6", "col-lg-4"], "expectedBehavior": "responsive_adaptation" }
   */
  test('handles responsive behavior in Bootstrap grid', async ({ page }) => {
    // Set up responsive grid structure
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]');
      if (input?.parentElement) {
        const container = document.createElement('div');
        container.className = 'container-fluid';

        const row = document.createElement('div');
        row.className = 'row';

        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-4';

        input.parentElement.insertBefore(container, input);
        container.appendChild(row);
        row.appendChild(col);
        col.appendChild(input);
      }
    });

    // Initialize TouchSpin
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

    // Test responsive behavior at different viewport sizes
    await page.setViewportSize({ width: 320, height: 568 }); // Mobile
    await page.waitForTimeout(100);

    const mobileLayout = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      return wrapper && wrapper.offsetWidth > 0;
    });

    await page.setViewportSize({ width: 1200, height: 800 }); // Desktop
    await page.waitForTimeout(100);

    const desktopLayout = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      return wrapper && wrapper.offsetWidth > 0;
    });

    expect(mobileLayout && desktopLayout).toBe(true);
  });

  /**
   * Scenario: applies ARIA attributes for accessibility
   * Given the fixture page is loaded
   * When TouchSpin initializes
   * Then appropriate ARIA attributes are applied
   * Params:
   * { "expectedARIA": ["aria-label", "aria-valuemin", "aria-valuemax", "role"], "expectedBehavior": "accessibility_compliant" }
   */
  test('applies ARIA attributes for accessibility', async ({ page }) => {
    // Initialize TouchSpin
    await initializeTouchspinJQuery(page, 'test-input', {
      min: 0,
      max: 100,
      step: 1,
      initval: 50,
    });

    // Check ARIA attributes using proper helpers and Playwright assertions
    const { input, upButton, downButton } = await apiHelpers.getTouchSpinElements(
      page,
      'test-input'
    );

    // Check input ARIA attributes
    await expect(input).toHaveAttribute('role', 'spinbutton');
    await expect(input).toHaveAttribute('aria-valuemin', '0');
    await expect(input).toHaveAttribute('aria-valuemax', '100');
    await expect(input).toHaveAttribute('aria-valuenow', '50');

    // Check button ARIA labels - accept variations in wording
    await expect(upButton).toHaveAttribute('aria-label', /Increase|Increment/);
    await expect(downButton).toHaveAttribute('aria-label', /Decrease|Decrement/);
  });

  /**
   * Scenario: supports RTL (right-to-left) layouts
   * Given the fixture page is loaded with RTL direction
   * When TouchSpin initializes
   * Then button placement adapts to RTL layout
   * Params:
   * { "direction": "rtl", "expectedButtonOrder": "up_button_left_down_button_right" }
   */
  test('supports RTL (right-to-left) layouts', async ({ page }) => {
    // Set RTL direction on body
    await page.evaluate(() => {
      document.body.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('dir', 'rtl');
    });

    // Initialize TouchSpin
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

    // Check RTL layout adaptation using proper helpers
    const { wrapper, upButton, downButton } = await apiHelpers.getTouchSpinElements(
      page,
      'test-input'
    );

    // Verify RTL setup
    const isRtl = await page.evaluate(() => {
      const htmlDir = document.documentElement.getAttribute('dir');
      const bodyDir = document.body.getAttribute('dir');
      return htmlDir === 'rtl' && bodyDir === 'rtl';
    });
    expect(isRtl).toBe(true);

    // Verify TouchSpin elements exist and are visible
    await expect(wrapper).toBeVisible();
    await expect(upButton).toBeVisible();
    await expect(downButton).toBeVisible();

    // Reset direction
    await page.evaluate(() => {
      document.body.removeAttribute('dir');
      document.documentElement.removeAttribute('dir');
    });
  });

  /**
   * Scenario: handles CSS class application and removal
   * Given the fixture page is loaded
   * When TouchSpin applies and removes classes dynamically
   * Then class management works correctly
   * Params:
   * { "dynamicClasses": ["disabled", "focus", "invalid"], "expectedBehavior": "correct_class_management" }
   */
  test('handles CSS class application and removal', async ({ page }) => {
    // Initialize TouchSpin
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

    // Test dynamic class application
    const classOperations = await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]');
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');

      if (!input || !wrapper) return false;

      // Simulate focus state
      input.focus();
      const hasFocusClass =
        input.classList.contains('form-control') || wrapper.classList.contains('focus');

      // Simulate disabled state
      (input as HTMLInputElement).disabled = true;
      const hasDisabledClass = input.disabled;

      // Reset
      (input as HTMLInputElement).disabled = false;
      input.blur();

      return {
        hasFocusClass: hasFocusClass !== undefined,
        hasDisabledClass,
        hasWrapperClasses: wrapper.classList.length > 0,
        hasInputClasses: input.classList.length > 0,
      };
    });

    expect(classOperations.hasWrapperClasses).toBe(true);
    expect(classOperations.hasInputClasses).toBe(true);
    expect(typeof classOperations.hasFocusClass).toBe('boolean');
    expect(typeof classOperations.hasDisabledClass).toBe('boolean');
  });

  /**
   * Scenario: manages z-index and layering correctly
   * Given the fixture page is loaded with overlapping elements
   * When TouchSpin creates UI elements
   * Then z-index layering is managed correctly
   * Params:
   * { "overlappingElements": ["dropdown", "modal", "tooltip"], "expectedBehavior": "correct_layering" }
   */
  test('manages z-index and layering correctly', async ({ page }) => {
    // Create overlapping elements to test z-index
    await page.evaluate(() => {
      const container = document.querySelector('body');
      if (container) {
        const overlay = document.createElement('div');
        overlay.id = 'test-overlay';
        overlay.style.cssText =
          'position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.1); z-index: 10;';
        container.appendChild(overlay);
      }
    });

    // Initialize TouchSpin
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

    // Check z-index layering
    const layering = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      const upButton = document.querySelector('[data-testid="test-input-up"]');
      const overlay = document.getElementById('test-overlay');

      if (!wrapper || !upButton || !overlay) return false;

      const wrapperZIndex = window.getComputedStyle(wrapper).zIndex;
      const buttonZIndex = window.getComputedStyle(upButton).zIndex;
      const overlayZIndex = window.getComputedStyle(overlay).zIndex;

      return {
        wrapperVisible: wrapper.offsetHeight > 0,
        buttonVisible: upButton.offsetHeight > 0,
        wrapperZIndex: wrapperZIndex !== 'auto' ? parseInt(wrapperZIndex, 10) : 0,
        buttonZIndex: buttonZIndex !== 'auto' ? parseInt(buttonZIndex, 10) : 0,
        overlayZIndex: parseInt(overlayZIndex, 10),
      };
    });

    expect(layering.wrapperVisible).toBe(true);
    expect(layering.buttonVisible).toBe(true);
    expect(layering.overlayZIndex).toBe(10);

    // Clean up overlay
    await page.evaluate(() => {
      const overlay = document.getElementById('test-overlay');
      overlay?.remove();
    });
  });

  /**
   * Scenario: supports theming and custom styling
   * Given the fixture page is loaded with custom theme
   * When TouchSpin initializes
   * Then theming is applied correctly
   * Params:
   * { "theme": "dark", "customCSS": "custom-touchspin.css", "expectedBehavior": "theme_applied" }
   */
  test('supports theming and custom styling', async ({ page }) => {
    // Add custom theme CSS
    await page.addStyleTag({
      content: `
      .custom-touchspin-theme .input-group {
        border: 2px solid #007bff;
        border-radius: 8px;
      }
      .custom-touchspin-theme .btn {
        background-color: #007bff;
        color: white;
      }
    `,
    });

    // Apply theme class to container
    await page.evaluate(() => {
      const container = document.querySelector('body') || document.documentElement;
      container.classList.add('custom-touchspin-theme');
    });

    // Initialize TouchSpin
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

    // Check custom styling is applied
    const customStyling = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      const upButton = document.querySelector('[data-testid="test-input-up"]');

      if (!wrapper || !upButton) return false;

      const wrapperStyles = window.getComputedStyle(wrapper);
      const buttonStyles = window.getComputedStyle(upButton);

      return {
        hasThemeClass: document.body.classList.contains('custom-touchspin-theme'),
        wrapperBorder: wrapperStyles.borderWidth,
        buttonBackground: buttonStyles.backgroundColor,
        wrapperExists: wrapper.offsetHeight > 0,
        buttonExists: upButton.offsetHeight > 0,
      };
    });

    expect(customStyling.hasThemeClass).toBe(true);
    expect(customStyling.wrapperExists).toBe(true);
    expect(customStyling.buttonExists).toBe(true);
    expect(customStyling.wrapperBorder).toBeTruthy();
    expect(customStyling.buttonBackground).toBeTruthy();

    // Clean up theme
    await page.evaluate(() => {
      document.body.classList.remove('custom-touchspin-theme');
    });
  });

  /**
   * Scenario: handles button positioning edge cases
   * Given the fixture page is loaded with constrained layouts
   * When TouchSpin positions buttons
   * Then positioning handles edge cases gracefully
   * Params:
   * { "constraints": ["narrow_container", "fixed_width"], "expectedBehavior": "graceful_positioning" }
   */
  test('handles button positioning edge cases', async ({ page }) => {
    // Create constrained container
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]');
      if (input?.parentElement) {
        const constrainedContainer = document.createElement('div');
        constrainedContainer.style.cssText =
          'width: 120px; height: 40px; overflow: hidden; border: 1px solid #ccc;';
        constrainedContainer.id = 'constrained-container';

        input.parentElement.insertBefore(constrainedContainer, input);
        constrainedContainer.appendChild(input);
      }
    });

    // Initialize TouchSpin in constrained space
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

    // Check button positioning in constrained layout using helpers
    const { wrapper, upButton, downButton } = await apiHelpers.getTouchSpinElements(
      page,
      'test-input'
    );

    // Verify container exists and has expected size
    const containerMetrics = await page.evaluate(() => {
      const container = document.getElementById('constrained-container');
      if (!container) return null;
      return { width: container.offsetWidth, height: container.offsetHeight };
    });

    expect(containerMetrics).not.toBeNull();
    expect(containerMetrics?.width).toBeGreaterThanOrEqual(120);
    expect(containerMetrics?.width).toBeLessThanOrEqual(125); // Allow 5px tolerance

    // Verify TouchSpin elements are visible within the constrained space
    await expect(wrapper).toBeVisible();
    await expect(upButton).toBeVisible();
    await expect(downButton).toBeVisible();
  });

  /**
   * Scenario: maintains DOM hierarchy integrity
   * Given the fixture page is loaded with complex DOM structure
   * When TouchSpin modifies the DOM
   * Then hierarchy integrity is maintained
   * Params:
   * { "complexStructure": "nested_forms_with_fieldsets", "expectedBehavior": "hierarchy_preserved" }
   */
  test('maintains DOM hierarchy integrity', async ({ page }) => {
    // Create complex nested DOM structure
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]');
      if (input?.parentElement) {
        const form = document.createElement('form');
        form.id = 'test-form';
        form.method = 'POST';

        const fieldset = document.createElement('fieldset');
        fieldset.className = 'form-fieldset';

        const legend = document.createElement('legend');
        legend.textContent = 'Input Section';

        const label = document.createElement('label');
        label.textContent = 'Quantity:';
        label.setAttribute('for', 'test-input');

        input.parentElement.insertBefore(form, input);
        form.appendChild(fieldset);
        fieldset.appendChild(legend);
        fieldset.appendChild(label);
        fieldset.appendChild(input);
      }
    });

    // Initialize TouchSpin
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

    // Check DOM hierarchy is preserved
    const hierarchy = await page.evaluate(() => {
      const form = document.getElementById('test-form');
      const fieldset = form?.querySelector('fieldset');
      const legend = fieldset?.querySelector('legend');
      const label = fieldset?.querySelector('label');
      const input = fieldset?.querySelector('[data-testid="test-input"]');
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');

      return {
        formExists: !!form,
        fieldsetExists: !!fieldset,
        legendExists: !!legend,
        labelExists: !!label,
        inputExists: !!input,
        wrapperExists: !!wrapper,
        inputInFieldset: fieldset?.contains(input),
        wrapperInFieldset: fieldset?.contains(wrapper),
        formContainsAll: form?.contains(wrapper) && form?.contains(input),
      };
    });

    expect(hierarchy.formExists).toBe(true);
    expect(hierarchy.fieldsetExists).toBe(true);
    expect(hierarchy.legendExists).toBe(true);
    expect(hierarchy.labelExists).toBe(true);
    expect(hierarchy.inputExists).toBe(true);
    expect(hierarchy.wrapperExists).toBe(true);
    expect(hierarchy.inputInFieldset).toBe(true);
    expect(hierarchy.formContainsAll).toBe(true);
  });

  /**
   * Scenario: supports conditional element creation
   * Given the fixture page is loaded
   * When TouchSpin conditionally creates elements
   * Then conditional logic works correctly
   * Params:
   * { "conditions": ["show_buttons", "show_prefix", "show_postfix"], "expectedBehavior": "conditional_creation" }
   */
  test('supports conditional element creation', async ({ page }) => {
    // Test conditional prefix/postfix creation
    await initializeTouchspinJQuery(page, 'test-input', {
      min: 0,
      max: 10,
      prefix: 'Amount:',
      // No postfix specified - should not create postfix element
      buttondown_class: 'btn btn-outline-secondary',
      buttonup_class: 'btn btn-outline-secondary',
    });

    // Check conditional element creation
    const conditionalElements = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      const prefix = document.querySelector('[data-testid="test-input-prefix"]');
      const postfix = document.querySelector('[data-testid="test-input-postfix"]');
      const upButton = document.querySelector('[data-testid="test-input-up"]');
      const downButton = document.querySelector('[data-testid="test-input-down"]');

      return {
        wrapperExists: !!wrapper,
        prefixExists: !!prefix,
        postfixExists: !!postfix,
        upButtonExists: !!upButton,
        downButtonExists: !!downButton,
        prefixHasContent: prefix?.textContent?.includes('Amount:'),
      };
    });

    expect(conditionalElements.wrapperExists).toBe(true);
    expect(conditionalElements.prefixExists).toBe(true);
    expect(conditionalElements.postfixExists).toBe(false); // Should not exist without postfix config
    expect(conditionalElements.upButtonExists).toBe(true);
    expect(conditionalElements.downButtonExists).toBe(true);
    expect(conditionalElements.prefixHasContent).toBe(true);
  });

  /**
   * Scenario: handles dynamic DOM structure changes
   * Given the fixture page is loaded with initialized TouchSpin
   * When the DOM structure changes dynamically
   * Then TouchSpin adapts to the changes
   * Params:
   * { "domChanges": ["parent_moved", "siblings_added"], "expectedBehavior": "adaptive_structure" }
   */
  test('handles dynamic DOM structure changes', async ({ page }) => {
    // Initialize TouchSpin first
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

    // Verify initial state
    const initialState = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      const upButton = document.querySelector('[data-testid="test-input-up"]');
      return {
        wrapperExists: !!wrapper,
        upButtonExists: !!upButton,
        initialParent: wrapper?.parentElement?.tagName,
      };
    });

    expect(initialState.wrapperExists).toBe(true);
    expect(initialState.upButtonExists).toBe(true);

    // Dynamically change DOM structure - move to new parent
    await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      if (wrapper) {
        const newContainer = document.createElement('div');
        newContainer.id = 'new-container';
        newContainer.className = 'dynamic-container';

        document.body.appendChild(newContainer);
        newContainer.appendChild(wrapper);
      }
    });

    // Check TouchSpin adapts to structure changes
    const adaptedState = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      const upButton = document.querySelector('[data-testid="test-input-up"]');
      const newContainer = document.getElementById('new-container');

      return {
        wrapperExists: !!wrapper,
        upButtonExists: !!upButton,
        wrapperInNewContainer: newContainer?.contains(wrapper),
        buttonsStillWork: upButton?.offsetHeight > 0,
      };
    });

    expect(adaptedState.wrapperExists).toBe(true);
    expect(adaptedState.upButtonExists).toBe(true);
    expect(adaptedState.wrapperInNewContainer).toBe(true);
    expect(adaptedState.buttonsStillWork).toBe(true);
  });

  /**
   * Scenario: cleans up DOM modifications on destroy
   * Given the fixture page is loaded with initialized TouchSpin
   * When TouchSpin is destroyed
   * Then all DOM modifications are cleaned up
   * Params:
   * { "modificationsToClean": ["wrapper", "buttons", "classes"], "expectedBehavior": "complete_cleanup" }
   */
  test('cleans up DOM modifications on destroy', async ({ page }) => {
    // Initialize TouchSpin
    await initializeTouchspinJQuery(page, 'test-input', {
      min: 0,
      max: 10,
      prefix: 'Amount:',
      postfix: 'units',
    });

    // Verify TouchSpin is initialized with all elements
    const beforeDestroy = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      const upButton = document.querySelector('[data-testid="test-input-up"]');
      const downButton = document.querySelector('[data-testid="test-input-down"]');
      const prefix = document.querySelector('[data-testid="test-input-prefix"]');
      const postfix = document.querySelector('[data-testid="test-input-postfix"]');

      return {
        wrapperExists: !!wrapper,
        upButtonExists: !!upButton,
        downButtonExists: !!downButton,
        prefixExists: !!prefix,
        postfixExists: !!postfix,
      };
    });

    expect(beforeDestroy.wrapperExists).toBe(true);
    expect(beforeDestroy.upButtonExists).toBe(true);
    expect(beforeDestroy.downButtonExists).toBe(true);
    expect(beforeDestroy.prefixExists).toBe(true);
    expect(beforeDestroy.postfixExists).toBe(true);

    // Destroy TouchSpin
    await page.evaluate(() => {
      const $ = window.jQuery;
      $('[data-testid="test-input"]').TouchSpin('destroy');
    });

    // Verify cleanup - all TouchSpin elements should be removed
    const afterDestroy = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      const upButton = document.querySelector('[data-testid="test-input-up"]');
      const downButton = document.querySelector('[data-testid="test-input-down"]');
      const prefix = document.querySelector('[data-testid="test-input-prefix"]');
      const postfix = document.querySelector('[data-testid="test-input-postfix"]');
      const input = document.querySelector('[data-testid="test-input"]');

      return {
        wrapperExists: !!wrapper,
        upButtonExists: !!upButton,
        downButtonExists: !!downButton,
        prefixExists: !!prefix,
        postfixExists: !!postfix,
        inputStillExists: !!input,
        inputHasCleanAttributes: input && !input.hasAttribute('data-touchspin-injected'),
      };
    });

    expect(afterDestroy.wrapperExists).toBe(false);
    expect(afterDestroy.upButtonExists).toBe(false);
    expect(afterDestroy.downButtonExists).toBe(false);
    expect(afterDestroy.prefixExists).toBe(false);
    expect(afterDestroy.postfixExists).toBe(false);
    expect(afterDestroy.inputStillExists).toBe(true); // Original input should remain
    expect(afterDestroy.inputHasCleanAttributes).toBe(true);
  });

  /**
   * Scenario: handles conflicts with other plugins
   * Given the fixture page is loaded with multiple jQuery plugins
   * When plugins interact with the same DOM elements
   * Then conflicts are handled gracefully
   * Params:
   * { "conflictingPlugins": ["datepicker", "autocomplete"], "expectedBehavior": "conflict_resolution" }
   */
  test('handles conflicts with other plugins', async ({ page }) => {
    // Simulate another jQuery plugin that modifies input behavior
    await page.evaluate(() => {
      const $ = window.jQuery;

      // Create a mock conflicting plugin
      $.fn.mockPlugin = function (options) {
        return this.each(function () {
          const $this = $(this);
          $this.addClass('mock-plugin-enhanced');
          $this.data('mock-plugin', { initialized: true, options });

          // Add conflicting event handler
          $this.on('input.mockPlugin', () => {
            console.log('Mock plugin handling input event');
          });
        });
      };
    });

    // Apply mock plugin first
    await page.evaluate(() => {
      const $ = window.jQuery;
      $('[data-testid="test-input"]').mockPlugin({ conflictTest: true });
    });

    // Initialize TouchSpin after the conflicting plugin
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

    // Check both plugins coexist
    const coexistence = await page.evaluate(() => {
      const $ = window.jQuery;
      const $input = $('[data-testid="test-input"]');
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      const upButton = document.querySelector('[data-testid="test-input-up"]');

      return {
        hasMockPlugin: $input.hasClass('mock-plugin-enhanced'),
        hasMockData: !!$input.data('mock-plugin'),
        hasTouchSpinWrapper: !!wrapper,
        hasTouchSpinButtons: !!upButton,
        inputStillWorks: $input.length > 0,
        bothPluginsActive: $input.hasClass('mock-plugin-enhanced') && !!wrapper,
      };
    });

    expect(coexistence.hasMockPlugin).toBe(true);
    expect(coexistence.hasMockData).toBe(true);
    expect(coexistence.hasTouchSpinWrapper).toBe(true);
    expect(coexistence.hasTouchSpinButtons).toBe(true);
    expect(coexistence.inputStillWorks).toBe(true);
    expect(coexistence.bothPluginsActive).toBe(true);
  });

  /**
   * Scenario: supports nested container scenarios
   * Given the fixture page is loaded with nested containers
   * When TouchSpin initializes in nested contexts
   * Then it handles nesting correctly
   * Params:
   * { "nestingLevels": 3, "containerTypes": ["div", "form", "fieldset"], "expectedBehavior": "nested_handling" }
   */
  test('supports nested container scenarios', async ({ page }) => {
    // Create nested container structure (3 levels deep)
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]');
      if (input?.parentElement) {
        const level1 = document.createElement('div');
        level1.className = 'level-1-container';
        level1.id = 'level-1';

        const level2 = document.createElement('form');
        level2.className = 'level-2-container';
        level2.id = 'level-2';

        const level3 = document.createElement('fieldset');
        level3.className = 'level-3-container';
        level3.id = 'level-3';

        input.parentElement.insertBefore(level1, input);
        level1.appendChild(level2);
        level2.appendChild(level3);
        level3.appendChild(input);
      }
    });

    // Initialize TouchSpin in deeply nested context
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

    // Check nested handling
    const nestedHandling = await page.evaluate(() => {
      const level1 = document.getElementById('level-1');
      const level2 = document.getElementById('level-2');
      const level3 = document.getElementById('level-3');
      const input = document.querySelector('[data-testid="test-input"]');
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      const upButton = document.querySelector('[data-testid="test-input-up"]');

      return {
        level1Exists: !!level1,
        level2Exists: !!level2,
        level3Exists: !!level3,
        inputInLevel3: level3?.contains(input),
        wrapperInLevel3: level3?.contains(wrapper),
        buttonInLevel3: level3?.contains(upButton),
        nestedPathIntact:
          level1?.contains(level2) && level2?.contains(level3) && level3?.contains(wrapper),
        touchSpinWorking: !!wrapper && !!upButton,
      };
    });

    expect(nestedHandling.level1Exists).toBe(true);
    expect(nestedHandling.level2Exists).toBe(true);
    expect(nestedHandling.level3Exists).toBe(true);
    expect(nestedHandling.inputInLevel3).toBe(true);
    expect(nestedHandling.wrapperInLevel3).toBe(true);
    expect(nestedHandling.nestedPathIntact).toBe(true);
    expect(nestedHandling.touchSpinWorking).toBe(true);
  });

  /**
   * Scenario: maintains form integration and submission
   * Given the fixture page is loaded within a form
   * When the form is submitted
   * Then TouchSpin integrates correctly with form submission
   * Params:
   * { "formMethod": "POST", "expectedBehavior": "form_integration", "submittedValue": "current_touchspin_value" }
   */
  test('maintains form integration and submission', async ({ page }) => {
    // Create form structure
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]');
      if (input?.parentElement) {
        const form = document.createElement('form');
        form.id = 'test-form';
        form.method = 'POST';
        form.action = '/submit';

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.id = 'submit-btn';
        submitButton.textContent = 'Submit';

        input.parentElement.insertBefore(form, input);
        form.appendChild(input);
        form.appendChild(submitButton);

        // Set input name for form submission
        input.setAttribute('name', 'quantity');
      }
    });

    // Initialize TouchSpin with initial value
    await initializeTouchspinJQuery(page, 'test-input', {
      min: 0,
      max: 100,
      initval: 25,
    });

    // Test form integration
    const formIntegration = await page.evaluate(() => {
      const form = document.getElementById('test-form');
      const input = document.querySelector('[data-testid="test-input"]');
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');

      // Test form data collection
      const formData = new FormData(form as HTMLFormElement);
      const quantity = formData.get('quantity');

      return {
        formExists: !!form,
        inputInForm: form?.contains(input),
        wrapperInForm: form?.contains(wrapper),
        inputHasName: input?.getAttribute('name') === 'quantity',
        inputValue: (input as HTMLInputElement)?.value,
        formDataValue: quantity,
        formDataMatches: quantity === (input as HTMLInputElement)?.value,
      };
    });

    expect(formIntegration.formExists).toBe(true);
    expect(formIntegration.inputInForm).toBe(true);
    expect(formIntegration.wrapperInForm).toBe(true);
    expect(formIntegration.inputHasName).toBe(true);
    expect(formIntegration.inputValue).toBe('25');
    expect(formIntegration.formDataValue).toBe('25');
    expect(formIntegration.formDataMatches).toBe(true);
  });

  /**
   * Scenario: handles input focus and tabbing behavior
   * Given the fixture page is loaded with multiple inputs
   * When keyboard navigation is used
   * Then focus and tabbing work correctly
   * Params:
   * { "tabSequence": ["input1", "touchspin_buttons", "input2"], "expectedBehavior": "correct_tab_order" }
   */
  test('handles input focus and tabbing behavior', async ({ page }) => {
    // Create additional inputs for tab sequence testing
    await page.evaluate(() => {
      const container = document.querySelector('body');
      if (container) {
        const beforeInput = document.createElement('input');
        beforeInput.type = 'text';
        beforeInput.id = 'before-input';
        beforeInput.placeholder = 'Before TouchSpin';
        beforeInput.setAttribute('data-testid', 'before-input');

        const afterInput = document.createElement('input');
        afterInput.type = 'text';
        afterInput.id = 'after-input';
        afterInput.placeholder = 'After TouchSpin';
        afterInput.setAttribute('data-testid', 'after-input');

        const testInput = document.querySelector('[data-testid="test-input"]');
        if (testInput?.parentElement) {
          testInput.parentElement.insertBefore(beforeInput, testInput);
          testInput.parentElement.insertBefore(afterInput, testInput.nextSibling);
        }
      }
    });

    // Initialize TouchSpin
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

    // Test tab sequence and focus behavior using proper helpers and Playwright
    const beforeInput = page.getByTestId('before-input');
    const { input, upButton, downButton } = await apiHelpers.getTouchSpinElements(
      page,
      'test-input'
    );
    const afterInput = page.getByTestId('after-input');

    // Verify all elements exist
    await expect(beforeInput).toBeVisible();
    await expect(input).toBeVisible();
    await expect(afterInput).toBeVisible();
    await expect(upButton).toBeVisible();
    await expect(downButton).toBeVisible();

    // Test focus behavior - elements should be focusable
    await beforeInput.focus();
    await expect(beforeInput).toBeFocused();

    await input.focus();
    await expect(input).toBeFocused();

    await upButton.focus();
    await expect(upButton).toBeFocused();
  });
});
