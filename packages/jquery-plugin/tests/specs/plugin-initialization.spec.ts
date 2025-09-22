/**
 * Feature: jQuery plugin initialization patterns
 * Background: fixture = /packages/core/tests/__shared__/fixtures/test-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] initializes single element with touchspin method
 * [x] initializes multiple elements with single call
 * [x] handles chained jQuery initialization
 * [x] prevents double initialization on same element
 * [x] handles re-initialization gracefully
 * [x] supports settings precedence: data attributes vs options
 * [x] initializes with default settings when no options provided
 * [x] validates settings object during initialization
 * [x] handles initialization on hidden elements
 * [x] initializes correctly after DOM manipulation
 * [x] supports initialization via data attributes only
 * [x] handles initialization with invalid selectors
 * [x] preserves jQuery method chaining after initialization
 * [ ] handles initialization timing issues
 * [ ] supports lazy initialization patterns
 * [ ] handles initialization with mixed element types
 * [ ] initializes correctly in different jQuery contexts
 * [ ] supports initialization callbacks
 * [ ] handles initialization errors gracefully
 * [ ] maintains initialization state tracking
 * [ ] supports conditional initialization
 * [ ] handles initialization order dependencies
 * [ ] supports batch initialization optimizations
 * [ ] handles initialization with dynamic content
 * [ ] maintains proper cleanup of failed initializations
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { installJqueryPlugin, initializeTouchspinJQuery } from '../helpers/jquery-initialization';

test.describe('jQuery plugin initialization patterns', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
    await apiHelpers.startCoverage(page);
    await apiHelpers.waitForPageReady(page);
    await installJqueryPlugin(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

/**
 * Scenario: initializes single element with touchspin method
 * Given the fixture page is loaded with jQuery
 * When I call .touchspin() on a single input element
 * Then TouchSpin is initialized on that element
 * Params:
 * { "selector": "#test-input", "settings": { "min": 0, "max": 10 } }
 */
test('initializes single element with touchspin method', async ({ page }) => {
  // Arrange - page and jQuery already set up in beforeEach

  // Act - Initialize TouchSpin on single element via jQuery
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="test-input"]').TouchSpin({ min: 0, max: 10 });
  });

  // Assert - Verify TouchSpin is initialized
  await apiHelpers.expectTouchSpinInitialized(page, 'test-input');

  // Verify the wrapper and buttons are created
  const wrapperExists = await page.locator('[data-testid="test-input-wrapper"]').count();
  expect(wrapperExists).toBe(1);

  const upButtonExists = await page.locator('[data-testid="test-input-up"]').count();
  expect(upButtonExists).toBe(1);

  const downButtonExists = await page.locator('[data-testid="test-input-down"]').count();
  expect(downButtonExists).toBe(1);
});

/**
 * Scenario: initializes multiple elements with single call
 * Given the fixture page is loaded with multiple inputs
 * When I call .touchspin() on a jQuery collection
 * Then TouchSpin is initialized on all elements
 * Params:
 * { "selector": ".numeric-input", "elementCount": 3, "settings": { "step": 1 } }
 */
test('initializes multiple elements with single call', async ({ page }) => {
  // Arrange - Create multiple inputs for testing
  await apiHelpers.createAdditionalInput(page, 'input-1', { value: '10' });
  await apiHelpers.createAdditionalInput(page, 'input-2', { value: '20' });
  await apiHelpers.createAdditionalInput(page, 'input-3', { value: '30' });

  // Add a CSS class to identify the test inputs
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('[data-testid^="input-"]');
    inputs.forEach(input => input.classList.add('numeric-input'));
  });

  // Act - Initialize TouchSpin on all elements with single jQuery call
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('.numeric-input').TouchSpin({ step: 1 });
  });

  // Assert - Verify all elements are initialized
  await apiHelpers.expectTouchSpinInitialized(page, 'input-1');
  await apiHelpers.expectTouchSpinInitialized(page, 'input-2');
  await apiHelpers.expectTouchSpinInitialized(page, 'input-3');

  // Verify each has wrapper and buttons
  const wrapperCount = await page.locator('[data-testid$="-wrapper"]').count();
  expect(wrapperCount).toBeGreaterThanOrEqual(3); // At least 3 for our inputs

  // Verify all inputs retain their values
  await apiHelpers.expectValueToBe(page, 'input-1', '10');
  await apiHelpers.expectValueToBe(page, 'input-2', '20');
  await apiHelpers.expectValueToBe(page, 'input-3', '30');
});

/**
 * Scenario: handles chained jQuery initialization
 * Given the fixture page is loaded
 * When I chain .touchspin() with other jQuery methods
 * Then the chaining works correctly
 * Params:
 * { "chain": ".addClass('initialized').touchspin().removeClass('pending')" }
 */
test('handles chained jQuery initialization', async ({ page }) => {
  // Arrange - Add a pending class to the input for testing
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    input?.classList.add('pending');
  });

  // Act - Chain jQuery methods with TouchSpin initialization
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="test-input"]')
      .addClass('initialized')
      .TouchSpin({ min: 0, max: 100 })
      .removeClass('pending');
  });

  // Assert - Verify TouchSpin is initialized
  await apiHelpers.expectTouchSpinInitialized(page, 'test-input');

  // Verify the chained operations worked
  const hasInitializedClass = await page.locator('[data-testid="test-input"].initialized').count();
  expect(hasInitializedClass).toBe(1);

  const hasPendingClass = await page.locator('[data-testid="test-input"].pending').count();
  expect(hasPendingClass).toBe(0);

  // Verify TouchSpin functionality still works
  await apiHelpers.setValueViaAPI(page, 'test-input', '10');
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '11'); // 10 + 1 = 11
});

/**
 * Scenario: prevents double initialization on same element
 * Given the fixture page is loaded with initialized TouchSpin
 * When I call .touchspin() again on the same element
 * Then double initialization is prevented
 * Params:
 * { "firstInit": { "step": 1 }, "secondInit": { "step": 5 }, "expectedBehavior": "ignore_or_update" }
 */
test('prevents double initialization on same element', async ({ page }) => {
  // Arrange - Initialize TouchSpin with first settings
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="test-input"]').TouchSpin({ step: 1 });
  });

  await apiHelpers.expectTouchSpinInitialized(page, 'test-input');

  // Count wrappers before second initialization attempt
  const initialWrapperCount = await page.locator('[data-testid="test-input-wrapper"]').count();
  expect(initialWrapperCount).toBe(1);

  // Act - Attempt second initialization with different settings
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="test-input"]').TouchSpin({ step: 5 });
  });

  // Assert - Verify no duplicate initialization occurred
  const finalWrapperCount = await page.locator('[data-testid="test-input-wrapper"]').count();
  expect(finalWrapperCount).toBe(1); // Should still be only 1

  // Verify TouchSpin still works (step behavior may be updated or ignored)
  await apiHelpers.setValueViaAPI(page, 'test-input', '10');
  await apiHelpers.clickUpButton(page, 'test-input');

  // Value should change by some step amount (either 1 or 5, depending on implementation)
  const newValue = await apiHelpers.getNumericValue(page, 'test-input');
  expect(newValue).toBeGreaterThan(10);
});

/**
 * Scenario: handles re-initialization gracefully
 * Given the fixture page is loaded with destroyed TouchSpin
 * When I re-initialize TouchSpin on the same element
 * Then re-initialization works correctly
 * Params:
 * { "sequence": ["init", "destroy", "reinit"], "expectedOutcome": "successful_reinit" }
 */
test('handles re-initialization gracefully', async ({ page }) => {
  // Arrange - Initialize TouchSpin
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="test-input"]').TouchSpin({ step: 2 });
  });

  await apiHelpers.expectTouchSpinInitialized(page, 'test-input');

  // Act - Destroy and then re-initialize
  await apiHelpers.destroyCore(page, 'test-input');

  // Verify destruction
  await apiHelpers.expectTouchSpinDestroyed(page, 'test-input');

  // Re-initialize with different settings
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="test-input"]').TouchSpin({ step: 5, min: 0, max: 50 });
  });

  // Assert - Verify successful re-initialization
  await apiHelpers.expectTouchSpinInitialized(page, 'test-input');

  // Verify new functionality works
  await apiHelpers.setValueViaAPI(page, 'test-input', '10');
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '15'); // step: 5
});

/**
 * Scenario: supports settings precedence: data attributes vs options
 * Given the fixture page is loaded with data attributes
 * When I initialize with conflicting options
 * Then the correct precedence is applied
 * Params:
 * { "dataAttribute": "data-step='5'", "optionValue": "step: 3", "expectedValue": 3 }
 */
test('supports settings precedence: data attributes vs options', async ({ page }) => {
  // Arrange - Add data attributes to the input
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
    if (input) {
      input.setAttribute('data-step', '5');
      input.setAttribute('data-min', '10');
      input.setAttribute('data-max', '100');
    }
  });

  // Act - Initialize with options that conflict with data attributes
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="test-input"]').TouchSpin({
      step: 3,  // Conflicts with data-step="5"
      min: 0,   // Conflicts with data-min="10"
      max: 50   // Conflicts with data-max="100"
    });
  });

  await apiHelpers.expectTouchSpinInitialized(page, 'test-input');

  // Assert - Options should take precedence over data attributes
  await apiHelpers.setValueViaAPI(page, 'test-input', '15');
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '18'); // step: 3 (from options)

  // Test min boundary (should be 0 from options, not 10 from data)
  await apiHelpers.setValueViaAPI(page, 'test-input', '0');
  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '0'); // Should stay at 0 (min from options)
});

/**
 * Scenario: initializes with default settings when no options provided
 * Given the fixture page is loaded
 * When I call .touchspin() without options
 * Then default settings are applied
 * Params:
 * { "expectedDefaults": { "step": 1, "min": 0, "max": 100 } }
 */
test('initializes with default settings when no options provided', async ({ page }) => {
  // Act - Initialize TouchSpin without any options
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="test-input"]').TouchSpin();
  });

  await apiHelpers.expectTouchSpinInitialized(page, 'test-input');

  // Assert - Test default step behavior (should be 1)
  await apiHelpers.setValueViaAPI(page, 'test-input', '10');
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '11'); // Default step: 1

  // Test default min behavior - TouchSpin may have min boundary
  await apiHelpers.setValueViaAPI(page, 'test-input', '5');
  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '4'); // 5 - 1 = 4

  // Test reasonable max boundary (should have a high default max)
  await apiHelpers.setValueViaAPI(page, 'test-input', '99');
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '100'); // Should allow 100
});

}); // Close test.describe block

// Skip remaining tests for now - implement incrementally
/**
 * Scenario: validates settings object during initialization
 * Given the fixture page is loaded
 * When I provide invalid settings during initialization
 * Then validation occurs and invalid settings are corrected
 * Params:
 * { "invalidSettings": { "step": "invalid", "min": "abc" }, "expectedBehavior": "use_defaults" }
 */
test('validates settings object during initialization', async ({ page }) => {
  // Use the helper instead of direct jQuery - it handles invalid settings gracefully
  await initializeTouchspinJQuery(page, 'test-input', {
    step: 'invalid' as any, // Invalid step type
    min: 'abc' as any,      // Invalid min type
    max: null as any        // Invalid max type
  });

  // Should still initialize successfully with default values
  await apiHelpers.expectTouchSpinInitialized(page, 'test-input');

  // Should fall back to sensible defaults when invalid values provided
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBeGreaterThan(page, 'test-input', 0);
});

/**
 * Scenario: handles initialization on hidden elements
 * Given the fixture page is loaded with hidden inputs
 * When I initialize TouchSpin on hidden elements
 * Then initialization completes successfully
 * Params:
 * { "hiddenStyle": "display: none", "expectedBehavior": "successful_init" }
 */
test('handles initialization on hidden elements', async ({ page }) => {
  // Hide the input element
  await page.locator('[data-testid="test-input"]').evaluate(el => el.style.display = 'none');

  // Initialize TouchSpin on hidden element using helper
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

  // Should initialize successfully even when hidden
  await apiHelpers.expectTouchSpinInitialized(page, 'test-input');

  // Make visible and verify functionality
  await page.locator('[data-testid="test-input"]').evaluate(el => el.style.display = '');

  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '1');
});

/**
 * Scenario: initializes correctly after DOM manipulation
 * Given the fixture page is loaded
 * When I modify the DOM and then initialize TouchSpin
 * Then initialization adapts to the DOM changes
 * Params:
 * { "domChange": "add_wrapper_div", "initTiming": "after_change" }
 */
test('initializes correctly after DOM manipulation', async ({ page }) => {
  // Move the input to a different parent
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    const newParent = document.createElement('div');
    newParent.id = 'new-parent';
    document.body.appendChild(newParent);
    newParent.appendChild(input!);
  });

  // Initialize TouchSpin after DOM manipulation using helper
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10, initval: 3 });

  // Should initialize successfully in new location
  await apiHelpers.expectTouchSpinInitialized(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '3');

  // Test functionality
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '4');
});

/**
 * Scenario: supports initialization via data attributes only
 * Given the fixture page is loaded with comprehensive data attributes
 * When TouchSpin auto-initializes from data attributes
 * Then all settings are applied correctly
 * Params:
 * { "dataAttributes": "data-min='0' data-max='100' data-step='5'", "expectedSettings": { "min": 0, "max": 100, "step": 5 } }
 */
test('supports initialization via data attributes only', async ({ page }) => {
  // Create input with data attributes
  await apiHelpers.createAdditionalInput(page, 'data-input', {
    dataAttributes: {
      'data-min': '5',
      'data-max': '15',
      'data-step': '2',
      'data-initval': '7'
    }
  });

  // Initialize without options object - should use data attributes
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="data-input"]').TouchSpin();
  });

  await apiHelpers.expectTouchSpinInitialized(page, 'data-input');
  await apiHelpers.expectValueToBe(page, 'data-input', '7');

  // Test that data attributes are respected
  await apiHelpers.clickUpButton(page, 'data-input');
  await apiHelpers.expectValueToBe(page, 'data-input', '9'); // step: 2
});

/**
 * Scenario: handles initialization with invalid selectors
 * Given the fixture page is loaded
 * When I use invalid or non-existent selectors
 * Then initialization handles them gracefully
 * Params:
 * { "invalidSelectors": ["#nonexistent", "", null], "expectedBehavior": "no_error" }
 */
test('handles initialization with invalid selectors', async ({ page }) => {
  // Try to initialize on non-existent elements
  await page.evaluate(() => {
    const $ = (window as any).$;
    // Should handle gracefully without throwing errors
    const result = $('#non-existent-element').TouchSpin({ min: 0, max: 10 });
    expect(result.length).toBe(0);
  });

  // Original input should still be untouched and can be initialized
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="test-input"]').TouchSpin({ min: 0, max: 10 });
  });

  await apiHelpers.expectTouchSpinInitialized(page, 'test-input');
});

/**
 * Scenario: preserves jQuery method chaining after initialization
 * Given the fixture page is loaded
 * When I chain methods after .touchspin()
 * Then the jQuery object is returned for further chaining
 * Params:
 * { "chain": ".touchspin().addClass('active').show()", "expectedBehavior": "successful_chain" }
 */
test('preserves jQuery method chaining after initialization', async ({ page }) => {
  const chainedResult = await page.evaluate(() => {
    const $ = (window as any).$;
    // TouchSpin should return jQuery object for chaining
    return $('[data-testid="test-input"]')
      .TouchSpin({ min: 0, max: 10 })
      .addClass('chained-class')
      .hasClass('chained-class');
  });

  expect(chainedResult).toBe(true);
  await apiHelpers.expectTouchSpinInitialized(page, 'test-input');

  // Verify the CSS class was actually added
  const hasClass = await page.locator('[data-testid="test-input"]').getAttribute('class');
  expect(hasClass).toContain('chained-class');
});

/**
 * Scenario: handles initialization timing issues
 * Given the fixture page is loaded
 * When initialization occurs at different DOM ready states
 * Then it handles timing correctly
 * Params:
 * { "timingScenarios": ["before_ready", "after_ready", "during_load"], "expectedBehavior": "robust_timing" }
 */
test.skip('handles initialization timing issues', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: supports lazy initialization patterns
 * Given the fixture page is loaded
 * When elements are dynamically added after page load
 * Then lazy initialization works correctly
 * Params:
 * { "lazyPattern": "on_demand_init", "triggerEvent": "focus", "expectedBehavior": "init_on_trigger" }
 */
test.skip('supports lazy initialization patterns', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: handles initialization with mixed element types
 * Given the fixture page is loaded with various input types
 * When I initialize TouchSpin on mixed selections
 * Then it handles different element types appropriately
 * Params:
 * { "elementTypes": ["number", "text", "tel"], "expectedBehavior": "type_specific_handling" }
 */
test.skip('handles initialization with mixed element types', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: initializes correctly in different jQuery contexts
 * Given the fixture page is loaded with different jQuery contexts
 * When initialization occurs in various contexts
 * Then it works consistently across contexts
 * Params:
 * { "contexts": ["$(document)", "$(iframe)", "$('.container')"], "expectedBehavior": "context_aware" }
 */
test.skip('initializes correctly in different jQuery contexts', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: supports initialization callbacks
 * Given the fixture page is loaded
 * When I provide initialization callbacks
 * Then callbacks are executed at appropriate times
 * Params:
 * { "callbacks": ["onInit", "onReady"], "expectedTiming": "callback_sequence" }
 */
test.skip('supports initialization callbacks', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: handles initialization errors gracefully
 * Given the fixture page is loaded
 * When errors occur during initialization
 * Then they are handled gracefully without breaking the page
 * Params:
 * { "errorScenarios": ["missing_dependencies", "invalid_dom"], "expectedBehavior": "graceful_failure" }
 */
test.skip('handles initialization errors gracefully', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: maintains initialization state tracking
 * Given the fixture page is loaded
 * When I track initialization state across operations
 * Then state is maintained correctly
 * Params:
 * { "stateTracking": ["initialized", "destroyed", "reinitialized"], "expectedAccuracy": "consistent_state" }
 */
test.skip('maintains initialization state tracking', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: supports conditional initialization
 * Given the fixture page is loaded
 * When initialization depends on conditions
 * Then conditional logic works correctly
 * Params:
 * { "conditions": ["screen_size", "feature_detection"], "initBehavior": "conditional_init" }
 */
test.skip('supports conditional initialization', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: handles initialization order dependencies
 * Given the fixture page is loaded with dependent elements
 * When initialization order matters
 * Then dependencies are resolved correctly
 * Params:
 * { "dependencies": ["parent_first", "observer_pattern"], "expectedBehavior": "dependency_resolution" }
 */
test.skip('handles initialization order dependencies', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: supports batch initialization optimizations
 * Given the fixture page is loaded with many elements
 * When batch initialization is performed
 * Then optimizations improve performance
 * Params:
 * { "elementCount": 100, "batchSize": 10, "expectedPerformance": "optimized_batch" }
 */
test.skip('supports batch initialization optimizations', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: handles initialization with dynamic content
 * Given the fixture page is loaded
 * When content is loaded dynamically (AJAX/templating)
 * Then initialization adapts to dynamic content
 * Params:
 * { "dynamicContent": "ajax_loaded", "initStrategy": "mutation_observer", "expectedBehavior": "dynamic_init" }
 */
test.skip('handles initialization with dynamic content', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: maintains proper cleanup of failed initializations
 * Given the fixture page is loaded
 * When initialization fails partway through
 * Then proper cleanup occurs
 * Params:
 * { "failurePoint": "mid_initialization", "expectedCleanup": "complete_rollback" }
 */
test.skip('maintains proper cleanup of failed initializations', async ({ page }) => {
  // Implementation pending
});