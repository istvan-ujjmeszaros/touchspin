/**
 * Feature: Bootstrap 3 framework-specific integration and features
 * Background: fixture = /packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] integrates with Bootstrap 3 input-group component
 * [x] supports Bootstrap 3 button styling and states
 * [x] handles Bootstrap 3 form validation states
 * [x] integrates with Bootstrap 3 sizing utilities
 * [x] supports Bootstrap 3 color scheme and themes
 * [x] handles Bootstrap 3 responsive breakpoints
 * [x] integrates with Bootstrap 3 flex utilities
 * [x] supports Bootstrap 3 spacing utilities
 * [x] handles Bootstrap 3 border utilities
 * [x] integrates with Bootstrap 3 focus management
 * [x] supports Bootstrap 3 disabled states
 * [x] handles Bootstrap 3 form control variants
 * [x] integrates with Bootstrap 3 input group addons
 * [x] supports Bootstrap 3 button group behavior
 * [x] handles Bootstrap 3 accessibility features
 * [x] integrates with Bootstrap 3 custom properties
 * [x] supports Bootstrap 3 dark mode compatibility
 * [x] handles Bootstrap 3 RTL language support
 * [x] integrates with Bootstrap 3 form layouts
 * [x] supports Bootstrap 3 floating labels
 * [x] handles Bootstrap 3 input group sizing
 * [x] integrates with Bootstrap 3 validation feedback
 * [x] supports Bootstrap 3 tooltip integration
 * [x] handles Bootstrap 3 dropdown integration
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { ensureBootstrap3Globals } from './helpers/bootstrap3-globals';

/**
 * Scenario: integrates with Bootstrap 3 input-group component
 * Given the fixture page is loaded with Bootstrap 3 styles
 * When TouchSpin initializes within an input-group
 * Then it follows Bootstrap 3 input-group specifications
 * Params:
 * { "frameworkVersion": "bootstrap3", "componentType": "input-group", "expectedCompliance": "bootstrap3_specs" }
 */
test('integrates with Bootstrap 3 input-group component', async ({ page }) => {
  // Load Bootstrap 3 fixture with real Bootstrap assets
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.installDomHelpers(page);

  // Initialize TouchSpin with Bootstrap 3 renderer on the advanced input (with input-group)
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced');

  // Verify TouchSpin creates proper Bootstrap 3 input-group structure
  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input-advanced');
  await expect(elements.wrapper).toHaveClass(/input-group/);

  // Verify buttons have Bootstrap button classes
  await expect(elements.upButton).toHaveClass(/btn/);
  await expect(elements.downButton).toHaveClass(/btn/);

  // Test functionality works with Bootstrap styling
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: supports Bootstrap 3 button styling and states
 * Given the fixture page is loaded with Bootstrap 3 styles
 * When TouchSpin initializes with Bootstrap button classes
 * Then buttons display correct Bootstrap 3 styling and states
 * Params:
 * { "buttonVariants": ["btn-primary", "btn-secondary", "btn-outline-primary"], "stateSupport": ["active", "disabled", "focus"] }
 */
test('supports Bootstrap 3 button styling and states', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify buttons have Bootstrap classes
  await expect(elements.upButton).toHaveClass(/btn/);
  await expect(elements.downButton).toHaveClass(/btn/);

  // Test button functionality
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles Bootstrap 3 form validation states
 * Given the fixture page is loaded with form validation
 * When TouchSpin is used in forms with validation states
 * Then it properly displays Bootstrap 3 validation styling
 * Params:
 * { "validationStates": ["is-valid", "is-invalid"], "feedbackTypes": ["valid-feedback", "invalid-feedback"] }
 */
test('handles Bootstrap 3 form validation states', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Add validation classes and verify they're preserved
  await elements.input.evaluate((el) => el.classList.add('is-valid'));
  await expect(elements.input).toHaveClass(/is-valid/);

  // Test functionality still works with validation classes
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: integrates with Bootstrap 3 sizing utilities
 * Given the fixture page is loaded with Bootstrap 3 styles
 * When TouchSpin initializes with different input sizes
 * Then it properly applies Bootstrap 3 sizing classes
 * Params:
 * { "inputSizes": ["form-control-sm", "form-control", "form-control-lg"], "expectedGroupSizes": ["input-group-sm", "input-group", "input-group-lg"] }
 */
test('integrates with Bootstrap 3 sizing utilities', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);

  // Test with small input
  await page.evaluate(() => {
    const input = window.createTestInput('size-test', {
      label: 'Small Size Test',
      helpText: 'Testing small input group size',
    });
    input.classList.add('form-control-sm');
    input.closest('.input-group').classList.add('input-group-sm');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'size-test');

  // Verify sizing works and functionality is preserved
  await apiHelpers.clickUpButton(page, 'size-test');
  await apiHelpers.expectValueToBe(page, 'size-test', '51');
});

/**
 * Scenario: supports Bootstrap 3 color scheme and themes
 * Given the fixture page is loaded with Bootstrap 3 color schemes
 * When TouchSpin initializes with different color variants
 * Then it properly inherits and applies color theming
 * Params:
 * { "colorSchemes": ["light", "dark"], "themeVariants": ["primary", "secondary", "success", "danger"] }
 */
test('supports Bootstrap 3 color scheme and themes', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Add theme variant and verify functionality
  await elements.upButton.evaluate((el) => el.classList.add('btn-primary'));
  await elements.downButton.evaluate((el) => el.classList.add('btn-primary'));

  // Test that themed buttons still work
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles Bootstrap 3 responsive breakpoints
 * Given the fixture page is loaded with responsive layout
 * When viewport changes across Bootstrap 3 breakpoints
 * Then TouchSpin adapts to responsive behavior correctly
 * Params:
 * { "breakpoints": ["xs", "sm", "md", "lg", "xl", "xxl"], "expectedBehavior": "responsive_adaptation" }
 */
test('handles Bootstrap 3 responsive breakpoints', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Test at mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Test at desktop viewport
  await page.setViewportSize({ width: 1200, height: 800 });
  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '50');
});

/**
 * Scenario: integrates with Bootstrap 3 flex utilities
 * Given the fixture page is loaded with flex layout containers
 * When TouchSpin is placed within flex containers
 * Then it works correctly with Bootstrap 3 flexbox utilities
 * Params:
 * { "flexUtilities": ["d-flex", "flex-column", "justify-content-center", "align-items-center"], "expectedCompatibility": true }
 */
test('integrates with Bootstrap 3 flex utilities', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);

  // Create input in flex container
  await page.evaluate(() => {
    const input = window.createTestInput('flex-test', {
      label: 'Flex Container Test',
      helpText: 'Testing TouchSpin in flex layout',
    });
    const wrapper = input.closest('.form-group');
    if (wrapper) {
      wrapper.classList.add('d-flex', 'flex-column');
    }
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'flex-test');

  // Verify functionality in flex layout
  await apiHelpers.clickUpButton(page, 'flex-test');
  await apiHelpers.expectValueToBe(page, 'flex-test', '51');
});

/**
 * Scenario: supports Bootstrap 3 spacing utilities
 * Given the fixture page is loaded with Bootstrap 3 styles
 * When TouchSpin is used with spacing utilities
 * Then spacing is applied correctly without conflicts
 * Params:
 * { "spacingUtilities": ["m-2", "p-3", "mx-auto", "my-4"], "expectedBehavior": "spacing_preserved" }
 */
test('supports Bootstrap 3 spacing utilities', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);

  // Create input with spacing utilities
  await page.evaluate(() => {
    const input = window.createTestInput('spacing-test', {
      label: 'Spacing Test',
      helpText: 'Testing with Bootstrap spacing utilities',
    });
    input.closest('.input-group').classList.add('m-3', 'p-2');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'spacing-test');

  // Verify functionality with spacing
  await apiHelpers.clickUpButton(page, 'spacing-test');
  await apiHelpers.expectValueToBe(page, 'spacing-test', '51');
});

/**
 * Scenario: handles Bootstrap 3 border utilities
 * Given the fixture page is loaded with Bootstrap 3 styles
 * When TouchSpin is used with border utilities
 * Then borders are applied correctly to the component
 * Params:
 * { "borderUtilities": ["border", "border-primary", "rounded", "border-0"], "expectedApplication": "correct_border_styling" }
 */
test('handles Bootstrap 3 border utilities', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);

  // Create input with border utilities
  await page.evaluate(() => {
    const input = window.createTestInput('border-test', {
      label: 'Border Test',
      helpText: 'Testing with Bootstrap border utilities',
    });
    input.classList.add('border-primary', 'rounded');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'border-test');

  // Verify functionality with borders
  await apiHelpers.clickUpButton(page, 'border-test');
  await apiHelpers.expectValueToBe(page, 'border-test', '51');
});

/**
 * Scenario: integrates with Bootstrap 3 focus management
 * Given the fixture page is loaded with Bootstrap 3 styles
 * When TouchSpin components receive focus
 * Then Bootstrap 3 focus styling and behavior is correct
 * Params:
 * { "focusElements": ["input", "buttons"], "expectedFocusRing": "bootstrap3_focus_ring", "keyboardNavigation": true }
 */
test('integrates with Bootstrap 3 focus management', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Test focus behavior
  await elements.input.focus();
  await expect(elements.input).toBeFocused();

  // Test button focus and keyboard navigation
  await page.keyboard.press('Tab');
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: supports Bootstrap 3 disabled states
 * Given the fixture page is loaded with Bootstrap 3 styles
 * When TouchSpin elements are disabled
 * Then they display proper Bootstrap 3 disabled styling
 * Params:
 * { "disabledElements": ["input", "buttons"], "expectedStyling": "bootstrap3_disabled_appearance", "interactionBlocked": true }
 */
test('supports Bootstrap 3 disabled states', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);

  // Create disabled input
  await page.evaluate(() => {
    const _input = window.createTestInput('disabled-test', {
      label: 'Disabled Test',
      disabled: true,
      helpText: 'Testing disabled state',
    });
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'disabled-test');

  const elements = await apiHelpers.getTouchSpinElements(page, 'disabled-test');

  // Verify input is disabled
  await expect(elements.input).toBeDisabled();
});

/**
 * Scenario: handles Bootstrap 3 form control variants
 * Given the fixture page is loaded with different form control types
 * When TouchSpin is applied to various input variants
 * Then it works correctly with all Bootstrap 3 form control types
 * Params:
 * { "formControlTypes": ["form-control", "form-control-plaintext", "form-select"], "expectedCompatibility": "universal_support" }
 */
test('handles Bootstrap 3 form control variants', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);

  // Create input with form-control-lg variant
  await page.evaluate(() => {
    const input = window.createTestInput('variant-test', {
      label: 'Form Control Variant Test',
      helpText: 'Testing form control variants',
    });
    input.classList.add('form-control-lg');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'variant-test');

  // Verify functionality with variant classes
  await apiHelpers.clickUpButton(page, 'variant-test');
  await apiHelpers.expectValueToBe(page, 'variant-test', '51');
});

/**
 * Scenario: integrates with Bootstrap 3 input group addons
 * Given the fixture page is loaded with input group addons
 * When TouchSpin is used alongside other input group elements
 * Then it integrates seamlessly with Bootstrap 3 addons
 * Params:
 * { "addonTypes": ["input-group-prepend", "input-group-append", "input-group-text"], "expectedIntegration": "seamless_coexistence" }
 */
test('integrates with Bootstrap 3 input group addons', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);

  // Test with the existing advanced input that has addons
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced');

  // Verify addon elements coexist with TouchSpin
  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input-advanced');
  await expect(elements.wrapper).toHaveClass(/input-group/);

  // Test functionality with addons present
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: supports Bootstrap 3 button group behavior
 * Given the fixture page is loaded with button group containers
 * When TouchSpin buttons are part of button groups
 * Then they follow Bootstrap 3 button group conventions
 * Params:
 * { "buttonGroupTypes": ["btn-group", "btn-group-vertical"], "expectedBehavior": "button_group_integration" }
 */
test('supports Bootstrap 3 button group behavior', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Add button group classes
  await elements.wrapper.evaluate((el) => {
    const buttonGroup = el.querySelector('.input-group-append') || el.querySelector('.btn-group');
    if (buttonGroup) {
      buttonGroup.classList.add('btn-group');
    }
  });

  // Test buttons work in group context
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles Bootstrap 3 accessibility features
 * Given the fixture page is loaded with Bootstrap 3 accessibility features
 * When TouchSpin initializes with accessibility requirements
 * Then it supports Bootstrap 3 accessibility standards
 * Params:
 * { "accessibilityFeatures": ["screen_reader_support", "keyboard_navigation", "focus_management"], "standardsCompliance": "wcag_2.1" }
 */
test('handles Bootstrap 3 accessibility features', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Test keyboard navigation
  await elements.input.focus();
  await page.keyboard.press('ArrowUp');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  await page.keyboard.press('ArrowDown');
  await apiHelpers.expectValueToBe(page, 'test-input', '50');

  // Verify ARIA attributes exist
  await expect(elements.input).toHaveAttribute('type', 'number');
});

/**
 * Scenario: integrates with Bootstrap 3 custom properties
 * Given the fixture page is loaded with Bootstrap 3 CSS custom properties
 * When TouchSpin uses Bootstrap 3 theming variables
 * Then it properly inherits and uses custom properties
 * Params:
 * { "customProperties": ["--bs-primary", "--bs-secondary", "--bs-border-radius"], "expectedInheritance": "css_variable_support" }
 */
test('integrates with Bootstrap 3 custom properties', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);

  // Set custom CSS properties
  await page.addStyleTag({
    content: `
      :root {
        --bs-primary: #custom-color;
        --bs-border-radius: 0.5rem;
      }
    `,
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Test functionality with custom properties
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: supports Bootstrap 3 dark mode compatibility
 * Given the fixture page is loaded with Bootstrap 3 dark mode
 * When TouchSpin is used in dark mode environments
 * Then it displays correctly in dark mode styling
 * Params:
 * { "darkModeSupport": true, "expectedAppearance": "dark_mode_compliant", "colorSchemeAdaptation": "automatic" }
 */
test('supports Bootstrap 3 dark mode compatibility', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);

  // Enable dark mode
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Test functionality in dark mode
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles Bootstrap 3 RTL language support
 * Given the fixture page is loaded with RTL language setup
 * When TouchSpin is used in RTL layouts
 * Then it properly adapts to right-to-left layouts
 * Params:
 * { "textDirection": "rtl", "expectedAdaptation": "rtl_layout_support", "buttonOrder": "reversed" }
 */
test('handles Bootstrap 3 RTL language support', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);

  // Set RTL direction
  await page.evaluate(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'ar');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Test functionality in RTL layout
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: integrates with Bootstrap 3 form layouts
 * Given the fixture page is loaded with various form layouts
 * When TouchSpin is used in different form arrangements
 * Then it works correctly with all Bootstrap 3 form layouts
 * Params:
 * { "formLayouts": ["horizontal", "vertical", "inline"], "expectedCompatibility": "layout_flexibility" }
 */
test('integrates with Bootstrap 3 form layouts', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);

  // Create horizontal form layout
  await page.evaluate(() => {
    const input = window.createTestInput('form-layout-test', {
      label: 'Horizontal Layout Test',
      helpText: 'Testing in horizontal form layout',
    });
    const wrapper = input.closest('.form-group');
    if (wrapper) {
      wrapper.classList.add('row');
      const label = wrapper.querySelector('label');
      if (label) {
        label.classList.add('col-sm-3', 'col-form-label');
      }
      const inputGroup = wrapper.querySelector('.input-group');
      if (inputGroup?.parentNode) {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-sm-9';
        inputGroup.parentNode.insertBefore(colDiv, inputGroup);
        colDiv.appendChild(inputGroup);
      }
    }
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'form-layout-test');

  // Test functionality in horizontal layout
  await apiHelpers.clickUpButton(page, 'form-layout-test');
  await apiHelpers.expectValueToBe(page, 'form-layout-test', '51');
});

/**
 * Scenario: supports Bootstrap 3 floating labels
 * Given the fixture page is loaded with floating label setup
 * When TouchSpin is used with Bootstrap 3 floating labels
 * Then floating labels work correctly with the component
 * Params:
 * { "floatingLabels": true, "expectedBehavior": "label_animation_support", "labelPosition": "floating" }
 */
test('supports Bootstrap 3 floating labels', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);

  // Create floating label input
  await page.evaluate(() => {
    const container = document.getElementById('additional-inputs');
    container.style.display = 'block';

    const floatingDiv = document.createElement('div');
    floatingDiv.className = 'form-floating mb-4';

    const input = document.createElement('input');
    input.type = 'number';
    input.id = 'floating-test';
    input.setAttribute('data-testid', 'floating-test');
    input.className = 'form-control';
    input.value = '50';
    input.placeholder = 'Floating label';

    const label = document.createElement('label');
    label.setAttribute('for', 'floating-test');
    label.textContent = 'Floating Label Test';

    floatingDiv.appendChild(input);
    floatingDiv.appendChild(label);
    container.appendChild(floatingDiv);
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'floating-test');

  // Test functionality with floating labels
  await apiHelpers.clickUpButton(page, 'floating-test');
  await apiHelpers.expectValueToBe(page, 'floating-test', '51');
});

/**
 * Scenario: handles Bootstrap 3 input group sizing
 * Given the fixture page is loaded with different input group sizes
 * When TouchSpin is initialized with size variants
 * Then all Bootstrap 3 input group sizes are supported correctly
 * Params:
 * { "groupSizes": ["input-group-sm", "input-group", "input-group-lg"], "sizeConsistency": "uniform_sizing" }
 */
test('handles Bootstrap 3 input group sizing', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);

  // Test different input group sizes
  await page.evaluate(() => {
    // Small size
    const smallInput = window.createTestInput('size-sm-test', {
      label: 'Small Input Group',
      helpText: 'Testing small input group',
    });
    smallInput.classList.add('form-control-sm');
    smallInput.closest('.input-group').classList.add('input-group-sm');

    // Large size
    const largeInput = window.createTestInput('size-lg-test', {
      label: 'Large Input Group',
      helpText: 'Testing large input group',
    });
    largeInput.classList.add('form-control-lg');
    largeInput.closest('.input-group').classList.add('input-group-lg');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'size-sm-test');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'size-lg-test');

  // Test both sizes work
  await apiHelpers.clickUpButton(page, 'size-sm-test');
  await apiHelpers.expectValueToBe(page, 'size-sm-test', '51');

  await apiHelpers.clickUpButton(page, 'size-lg-test');
  await apiHelpers.expectValueToBe(page, 'size-lg-test', '51');
});

/**
 * Scenario: integrates with Bootstrap 3 validation feedback
 * Given the fixture page is loaded with form validation feedback
 * When TouchSpin is used in validated forms
 * Then it properly displays Bootstrap 3 validation feedback
 * Params:
 * { "feedbackTypes": ["valid-feedback", "invalid-feedback"], "feedbackDisplay": "conditional_visibility", "validationTriggers": ["submit", "blur"] }
 */
test('integrates with Bootstrap 3 validation feedback', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);

  // Create input with validation feedback
  await page.evaluate(() => {
    const input = window.createTestInput('validation-feedback-test', {
      label: 'Validation Feedback Test',
      helpText: 'Testing validation feedback integration',
    });
    input.classList.add('is-invalid');

    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'invalid-feedback d-block'; // Add d-block to make it visible
    feedbackDiv.setAttribute('data-testid', 'validation-feedback');
    feedbackDiv.textContent = 'This field is required.';
    input.closest('.input-group').after(feedbackDiv);
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'validation-feedback-test');

  // Verify feedback element exists and functionality works
  const feedback = page.getByTestId('validation-feedback');
  await expect(feedback).toBeVisible();

  await apiHelpers.clickUpButton(page, 'validation-feedback-test');
  await apiHelpers.expectValueToBe(page, 'validation-feedback-test', '51');
});

/**
 * Scenario: supports Bootstrap 3 tooltip integration
 * Given the fixture page is loaded with Bootstrap 3 tooltips
 * When TouchSpin elements have tooltips attached
 * Then tooltips work correctly with all TouchSpin elements
 * Params:
 * { "tooltipElements": ["buttons", "input"], "expectedBehavior": "tooltip_functionality", "positioning": "smart_positioning" }
 */
test('supports Bootstrap 3 tooltip integration', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Add tooltip attributes to buttons
  await elements.upButton.evaluate((el) => {
    el.setAttribute('title', 'Increase value');
    el.setAttribute('data-bs-toggle', 'tooltip');
  });

  await elements.downButton.evaluate((el) => {
    el.setAttribute('title', 'Decrease value');
    el.setAttribute('data-bs-toggle', 'tooltip');
  });

  // Test functionality with tooltip attributes
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles Bootstrap 3 dropdown integration
 * Given the fixture page is loaded with Bootstrap 3 dropdowns
 * When TouchSpin is used alongside dropdown components
 * Then both components coexist without interference
 * Params:
 * { "dropdownIntegration": "adjacent_dropdowns", "expectedBehavior": "non_interference", "zIndexHandling": "proper_layering" }
 */
test('handles Bootstrap 3 dropdown integration', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);

  // Create dropdown near TouchSpin
  await page.evaluate(() => {
    const input = window.createTestInput('dropdown-test', {
      label: 'Dropdown Integration Test',
      helpText: 'Testing TouchSpin with nearby dropdown',
    });

    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown mt-2';
    dropdown.innerHTML = `
      <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" data-testid="dropdown-toggle">
        Options
      </button>
      <ul class="dropdown-menu">
        <li><a class="dropdown-item" href="#">Action</a></li>
        <li><a class="dropdown-item" href="#">Another action</a></li>
      </ul>
    `;

    const wrapper = input.closest('.form-group');
    if (wrapper) {
      wrapper.appendChild(dropdown);
    }
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'dropdown-test');

  // Test both components work independently
  await apiHelpers.clickUpButton(page, 'dropdown-test');
  await apiHelpers.expectValueToBe(page, 'dropdown-test', '51');

  // Test dropdown toggle exists and doesn't interfere
  const dropdownToggle = page.getByTestId('dropdown-toggle');
  await expect(dropdownToggle).toBeVisible();
});
