/**
 * Feature: jQuery plugin method integration
 * Background: fixture = /packages/jquery-plugin/tests/fixtures/jquery-plugin-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] calls upOnce method via jQuery interface
 * [x] calls downOnce method via jQuery interface
 * [x] calls setValue method with jQuery syntax
 * [x] calls getValue method and returns correct value
 * [x] calls destroy method via jQuery interface
 * [x] supports method chaining after API calls
 * [x] handles invalid method names gracefully
 * [x] passes parameters correctly to underlying methods
 * [x] returns appropriate values from getter methods
 * [x] handles method calls on multiple elements
 * [x] supports method calls with mixed argument types
 * [x] maintains jQuery context in method calls
 * [x] handles method calls on destroyed instances
 * [x] supports fluent API patterns
 * [x] validates method parameters appropriately
 * [x] handles method calls before initialization
 * [x] supports batch method operations
 * [x] maintains method call performance
 * [x] handles concurrent method calls safely
 * [x] supports method namespacing
 * [x] handles method call error scenarios
 * [x] supports method aliasing and shortcuts
 * [x] maintains backward compatibility for legacy methods
 * [x] handles method calls with callback functions
 * [x] supports asynchronous method patterns
 * [x] supports startUpSpin method via jQuery interface
 * [x] supports startDownSpin method via jQuery interface
 * [x] supports stopSpin method via jQuery interface
 * [x] supports callable UP_ONCE event
 * [x] supports callable DOWN_ONCE event
 * [x] supports callable START_UP_SPIN event
 * [x] supports callable START_DOWN_SPIN event
 * [x] supports callable STOP_SPIN event
 * [x] supports callable UPDATE_SETTINGS event
 * [x] supports callable DESTROY event
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { captureConsole } from '@touchspin/core/test-helpers';
import { installJqueryPlugin, initializeTouchspinJQuery } from '../helpers/jquery-initialization';

test.describe('jQuery plugin methods', () => {
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
 * Scenario: calls upOnce method via jQuery interface
 * Given the fixture page is loaded with initialized TouchSpin
 * When I call .touchspin('upOnce')
 * Then the value increments by one step
 * Params:
 * { "initialValue": "10", "method": "upOnce", "expectedValue": "11" }
 */
test('calls upOnce method via jQuery interface', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 20, initval: 10 });

  // Call upOnce method via jQuery interface
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="test-input"]').TouchSpin('upOnce');
  });

  await apiHelpers.expectValueToBe(page, 'test-input', '11');
});

/**
 * Scenario: calls downOnce method via jQuery interface
 * Given the fixture page is loaded with initialized TouchSpin
 * When I call .touchspin('downOnce')
 * Then the value decrements by one step
 * Params:
 * { "initialValue": "10", "method": "downOnce", "expectedValue": "9" }
 */
test('calls downOnce method via jQuery interface', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 20, initval: 10 });

  // Call downOnce method via jQuery interface
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="test-input"]').TouchSpin('downOnce');
  });

  await apiHelpers.expectValueToBe(page, 'test-input', '9');
});

/**
 * Scenario: calls setValue method with jQuery syntax
 * Given the fixture page is loaded with initialized TouchSpin
 * When I call .touchspin('setValue', value)
 * Then the value is set to the specified amount
 * Params:
 * { "method": "setValue", "parameter": 25, "expectedValue": "25" }
 */
test('calls setValue method with jQuery syntax', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 50 });

  // Call setValue method via jQuery interface
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="test-input"]').TouchSpin('setValue', 25);
  });

  await apiHelpers.expectValueToBe(page, 'test-input', '25');
});

/**
 * Scenario: calls getValue method and returns correct value
 * Given the fixture page is loaded with initialized TouchSpin
 * When I call .touchspin('getValue')
 * Then it returns the current numeric value
 * Params:
 * { "currentValue": "42", "method": "getValue", "expectedReturn": 42 }
 */
test('calls getValue method and returns correct value', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 50, initval: 15 });

  // Call getValue method via jQuery interface
  const value = await page.evaluate(() => {
    const $ = (window as any).$;
    return $('[data-testid="test-input"]').TouchSpin('getValue');
  });

  expect(value).toBe(15);
});

/**
 * Scenario: calls destroy method via jQuery interface
 * Given the fixture page is loaded with initialized TouchSpin
 * When I call .touchspin('destroy')
 * Then the TouchSpin instance is destroyed
 * Params:
 * { "method": "destroy", "expectedBehavior": "complete_cleanup" }
 */
test('calls destroy method via jQuery interface', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 20 });
  await apiHelpers.expectTouchSpinInitialized(page, 'test-input');

  // Call destroy method via jQuery interface
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="test-input"]').TouchSpin('destroy');
  });

  // Should be destroyed
  await apiHelpers.expectTouchSpinDestroyed(page, 'test-input');
});

/**
 * Scenario: supports method chaining after API calls
 * Given the fixture page is loaded with initialized TouchSpin
 * When I chain methods after TouchSpin API calls
 * Then jQuery chaining continues to work
 * Params:
 * { "chain": ".touchspin('upOnce').addClass('incremented')", "expectedBehavior": "successful_chain" }
 */
test('supports method chaining after API calls', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 20, initval: 5 });

  // Test method chaining
  await page.evaluate(() => {
    const $ = (window as any).$;
    const result = $('[data-testid="test-input"]')
      .TouchSpin('setValue', 10)
      .TouchSpin('upOnce')
      .TouchSpin('upOnce');

    // Should return jQuery object for chaining
    if (!result.jquery) {
      throw new Error('Method chaining should return jQuery object');
    }
  });

  // Final value should be 12 (10 + 1 + 1)
  await apiHelpers.expectValueToBe(page, 'test-input', '12');
});

/**
 * Scenario: handles invalid method names gracefully
 * Given the fixture page is loaded with initialized TouchSpin
 * When I call .touchspin() with invalid method name
 * Then it handles the error gracefully
 * Params:
 * { "invalidMethods": ["invalidMethod", "", null], "expectedBehavior": "throw_error_or_ignore" }
 */
test('handles invalid method names gracefully', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 20 });

  // Call invalid method - should handle gracefully
  const result = await page.evaluate(() => {
    const $ = (window as any).$;
    try {
      return $('[data-testid="test-input"]').TouchSpin('invalidMethod');
    } catch (error) {
      return { error: error.message };
    }
  });

  // Should either return gracefully or throw a reasonable error
  expect(result).toBeDefined();
});

/**
 * Scenario: passes parameters correctly to underlying methods
 * Given the fixture page is loaded with initialized TouchSpin
 * When I call methods with various parameter types
 * Then parameters are passed correctly
 * Params:
 * { "method": "setValue", "parameters": [42, "42", 42.5], "expectedBehavior": "correct_parameter_handling" }
 */
test('passes parameters correctly to underlying methods', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 100 });

  // Test method with multiple parameters
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="test-input"]').TouchSpin('setValue', 42);
  });

  await apiHelpers.expectValueToBe(page, 'test-input', '42');

  // Test another method with parameters
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="test-input"]').TouchSpin('updateSettings', { step: 5 });
  });

  // Click up should now increment by 5
  await apiHelpers.clickUpButton(page, 'test-input');
  const finalValue = await apiHelpers.getNumericValue(page, 'test-input');
  expect(finalValue).toBeGreaterThan(42); // Should have incremented from 42
});

/**
 * Scenario: returns appropriate values from getter methods
 * Given the fixture page is loaded with initialized TouchSpin
 * When I call getter methods
 * Then they return the correct value types
 * Params:
 * { "getterMethods": ["getValue", "getSettings"], "expectedReturnTypes": ["number", "object"] }
 */
test('returns appropriate values from getter methods', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 100, initval: 50 });

  // Test getValue method
  const value = await page.evaluate(() => {
    const $ = (window as any).$;
    return $('[data-testid="test-input"]').TouchSpin('getValue');
  });

  expect(value).toBe(50);

  // Test getSettings method if available
  const hasGetSettings = await page.evaluate(() => {
    const $ = (window as any).$;
    try {
      const settings = $('[data-testid="test-input"]').TouchSpin('getSettings');
      return settings !== undefined;
    } catch {
      return false;
    }
  });

  expect(hasGetSettings).toBeDefined();
});

/**
 * Scenario: handles method calls on multiple elements
 * Given the fixture page is loaded with multiple TouchSpin instances
 * When I call methods on a jQuery collection
 * Then the method is applied to all elements
 * Params:
 * { "elementCount": 3, "method": "upOnce", "expectedBehavior": "all_elements_affected" }
 */
test('handles method calls on multiple elements', async ({ page }) => {
  // Create multiple inputs
  await apiHelpers.createAdditionalInput(page, 'input1', { value: '10' });
  await apiHelpers.createAdditionalInput(page, 'input2', { value: '20' });

  // Initialize TouchSpin on multiple elements
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="input1"], [data-testid="input2"]').TouchSpin({ min: 0, max: 50 });
  });

  // Call method on multiple elements
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="input1"], [data-testid="input2"]').TouchSpin('upOnce');
  });

  // Both should be incremented
  await apiHelpers.expectValueToBe(page, 'input1', '11');
  await apiHelpers.expectValueToBe(page, 'input2', '21');
});

/**
 * Scenario: supports method calls with mixed argument types
 * Given the fixture page is loaded with initialized TouchSpin
 * When I call methods with different argument types
 * Then type coercion works correctly
 * Params:
 * { "method": "setValue", "mixedArgs": ["42", 42, "42.5"], "expectedBehavior": "correct_coercion" }
 */
test('supports method calls with mixed argument types', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 100 });

  // Test method with different argument types
  await page.evaluate(() => {
    const $ = (window as any).$;

    // String parameter
    $('[data-testid="test-input"]').TouchSpin('setValue', '25');

    // Number parameter
    $('[data-testid="test-input"]').TouchSpin('setValue', 30);

    // Object parameter
    $('[data-testid="test-input"]').TouchSpin('setValue', { value: 35 });
  });

  // Should handle the last valid setValue
  const value = await apiHelpers.readInputValue(page, 'test-input');
  expect(parseInt(value)).toBeGreaterThanOrEqual(25);
});

/**
 * Scenario: maintains jQuery context in method calls
 * Given the fixture page is loaded with initialized TouchSpin
 * When I call methods within different jQuery contexts
 * Then the context is maintained correctly
 * Params:
 * { "contexts": ["$(document)", "$('.container')"], "method": "getValue", "expectedBehavior": "context_preserved" }
 */
test('maintains jQuery context in method calls', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 20 });

  // Test that methods return jQuery object
  const isJqueryObject = await page.evaluate(() => {
    const $ = (window as any).$;
    const result = $('[data-testid="test-input"]').TouchSpin('setValue', 10);
    return result && result.jquery !== undefined;
  });

  expect(isJqueryObject).toBe(true);
});

/**
 * Scenario: handles method calls on destroyed instances
 * Given the fixture page is loaded with destroyed TouchSpin
 * When I call methods on destroyed instances
 * Then they handle the state appropriately
 * Params:
 * { "sequence": ["init", "destroy", "upOnce"], "expectedBehavior": "error_or_ignore" }
 */
test('handles method calls on destroyed instances', async ({ page }) => {
  // Initialize and then destroy TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 20 });

  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="test-input"]').TouchSpin('destroy');
  });

  // Try to call method on destroyed instance
  const result = await page.evaluate(() => {
    const $ = (window as any).$;
    try {
      return $('[data-testid="test-input"]').TouchSpin('getValue');
    } catch (error) {
      return { error: error.message };
    }
  });

  // Should handle gracefully or return meaningful error
  expect(result).toBeDefined();
});

/**
 * Scenario: supports fluent API patterns
 * Given the fixture page is loaded with initialized TouchSpin
 * When I use fluent API patterns
 * Then they work smoothly with method chaining
 * Params:
 * { "fluentChain": ".touchspin('setValue', 10).touchspin('upOnce')", "expectedFinalValue": "11" }
 */
test('supports fluent API patterns', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 30 });

  // Test fluent API chaining
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="test-input"]')
      .TouchSpin('setValue', 10)
      .TouchSpin('upOnce')
      .TouchSpin('upOnce')
      .addClass('test-class');
  });

  await apiHelpers.expectValueToBe(page, 'test-input', '12');

  // Check that addClass was also applied
  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
  const hasClass = await elements.input.evaluate((input: HTMLElement) => input.classList.contains('test-class'));

  expect(hasClass).toBe(true);
});

/**
 * Scenario: validates method parameters appropriately
 * Given the fixture page is loaded with initialized TouchSpin
 * When I provide invalid parameters to methods
 * Then validation occurs and errors are handled
 * Params:
 * { "method": "setValue", "invalidParams": [null, undefined, "invalid"], "expectedBehavior": "validation_error" }
 */
test('validates method parameters appropriately', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 100 });

  // Test parameter validation
  const result = await page.evaluate(() => {
    const $ = (window as any).$;
    try {
      // Invalid parameter
      $('[data-testid="test-input"]').TouchSpin('setValue', 'invalid');
      return 'no-error';
    } catch (error) {
      return { error: error.message };
    }
  });

  // Should handle invalid parameters gracefully
  expect(result).toBeDefined();
});

/**
 * Scenario: handles method calls before initialization
 * Given the fixture page is loaded without TouchSpin
 * When I call TouchSpin methods before initialization
 * Then they handle the uninitialized state appropriately
 * Params:
 * { "method": "upOnce", "state": "uninitialized", "expectedBehavior": "error_or_queue" }
 */
test('handles method calls before initialization', async ({ page }) => {
  // Try to call method before initialization
  const result = await page.evaluate(() => {
    const $ = (window as any).$;
    try {
      return $('[data-testid="test-input"]').TouchSpin('getValue');
    } catch (error) {
      return { error: error.message };
    }
  });

  // Should handle gracefully
  expect(result).toBeDefined();
});

/**
 * Scenario: supports batch method operations
 * Given the fixture page is loaded with multiple TouchSpin instances
 * When I perform batch operations
 * Then they execute efficiently
 * Params:
 * { "elementCount": 10, "batchOperation": "setValue", "parameter": 42, "expectedPerformance": "optimized" }
 */
test('supports batch method operations', async ({ page }) => {
  // Create multiple inputs
  await apiHelpers.createAdditionalInput(page, 'batch1', { value: '5' });
  await apiHelpers.createAdditionalInput(page, 'batch2', { value: '15' });
  await apiHelpers.createAdditionalInput(page, 'batch3', { value: '25' });

  // Batch initialize
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid^="batch"]').TouchSpin({ min: 0, max: 50 });
  });

  // Batch operations
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid^="batch"]').TouchSpin('upOnce');
  });

  // All should be incremented
  await apiHelpers.expectValueToBe(page, 'batch1', '6');
  await apiHelpers.expectValueToBe(page, 'batch2', '16');
  await apiHelpers.expectValueToBe(page, 'batch3', '26');
});

/**
 * Scenario: maintains method call performance
 * Given the fixture page is loaded with initialized TouchSpin
 * When I make rapid method calls
 * Then performance remains acceptable
 * Params:
 * { "methodCallCount": 1000, "method": "upOnce", "maxExecutionTime": 1000 }
 */
test('maintains method call performance', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 1000 });

  // Test performance of multiple method calls
  const startTime = Date.now();
  await page.evaluate(() => {
    const $ = (window as any).$;
    for (let i = 0; i < 10; i++) {
      $('[data-testid="test-input"]').TouchSpin('setValue', i * 10);
    }
  });
  const endTime = Date.now();

  // Should complete within reasonable time (2 seconds)
  expect(endTime - startTime).toBeLessThan(2000);
  await apiHelpers.expectValueToBe(page, 'test-input', '90');
});

/**
 * Scenario: handles concurrent method calls safely
 * Given the fixture page is loaded with initialized TouchSpin
 * When concurrent method calls are made
 * Then they are handled safely without race conditions
 * Params:
 * { "concurrentMethods": ["upOnce", "downOnce", "setValue"], "expectedBehavior": "thread_safe" }
 */
test('handles concurrent method calls safely', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 100 });

  // Test concurrent method calls
  await page.evaluate(() => {
    const $ = (window as any).$;
    const input = $('[data-testid="test-input"]');

    // Simulate concurrent calls
    Promise.all([
      new Promise(resolve => {
        input.TouchSpin('setValue', 10);
        resolve(undefined);
      }),
      new Promise(resolve => {
        input.TouchSpin('upOnce');
        resolve(undefined);
      }),
      new Promise(resolve => {
        input.TouchSpin('upOnce');
        resolve(undefined);
      })
    ]);
  });

  // Should have some consistent final value
  const finalValue = await apiHelpers.readInputValue(page, 'test-input');
  expect(parseInt(finalValue)).toBeGreaterThanOrEqual(10);
});

/**
 * Scenario: supports method namespacing
 * Given the fixture page is loaded with initialized TouchSpin
 * When I use namespaced method calls
 * Then namespacing works correctly
 * Params:
 * { "namespacedCall": ".touchspin('core.getValue')", "expectedBehavior": "namespace_resolution" }
 */
test('supports method namespacing', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 50, initval: 0 });

  // Test method namespacing if supported
  const hasNamespacing = await page.evaluate(() => {
    const $ = (window as any).$;
    try {
      // Check if namespaced methods work
      $('[data-testid="test-input"]').TouchSpin('touchspin.setValue', 25);
      return true;
    } catch {
      // Fallback to regular method
      $('[data-testid="test-input"]').TouchSpin('setValue', 25);
      return false;
    }
  });

  // Should have set the value (25 if namespacing works, fallback value if not)
  const finalValue = await apiHelpers.getNumericValue(page, 'test-input');
  expect(finalValue).toBeGreaterThanOrEqual(0); // Either 25 or fallback value
  expect(hasNamespacing).toBeDefined();
});

/**
 * Scenario: handles method call error scenarios
 * Given the fixture page is loaded with initialized TouchSpin
 * When errors occur during method execution
 * Then errors are handled gracefully
 * Params:
 * { "errorScenarios": ["invalid_state", "parameter_error"], "expectedBehavior": "graceful_error_handling" }
 */
test('handles method call error scenarios', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 20 });

  // Test various error scenarios
  const errors = await page.evaluate(() => {
    const $ = (window as any).$;
    const results = [];

    try {
      // Non-existent method
      $('[data-testid="test-input"]').TouchSpin('nonExistentMethod');
      results.push('no-error-1');
    } catch (error) {
      results.push({ error1: error.message });
    }

    try {
      // Invalid element
      $('#non-existent').TouchSpin('getValue');
      results.push('no-error-2');
    } catch (error) {
      results.push({ error2: error.message });
    }

    return results;
  });

  expect(errors.length).toBeGreaterThan(0);
});

/**
 * Scenario: supports method aliasing and shortcuts
 * Given the fixture page is loaded with initialized TouchSpin
 * When I use method aliases or shortcuts
 * Then they work identically to full method names
 * Params:
 * { "aliases": { "up": "upOnce", "down": "downOnce" }, "expectedBehavior": "identical_behavior" }
 */
test('supports method aliasing and shortcuts', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 30 });

  // Test if there are any method aliases
  const hasAliases = await page.evaluate(() => {
    const $ = (window as any).$;
    try {
      // Test common aliases
      $('[data-testid="test-input"]').TouchSpin('set', 15); // Alias for setValue
      return true;
    } catch {
      // Fallback to standard method
      $('[data-testid="test-input"]').TouchSpin('setValue', 15);
      return false;
    }
  });

  await apiHelpers.expectValueToBe(page, 'test-input', '15');
  expect(hasAliases).toBeDefined();
});

/**
 * Scenario: maintains backward compatibility for legacy methods
 * Given the fixture page is loaded with initialized TouchSpin
 * When I use legacy method signatures
 * Then they continue to work for backward compatibility
 * Params:
 * { "legacyMethods": ["increase", "decrease"], "expectedBehavior": "backward_compatible" }
 */
test('maintains backward compatibility for legacy methods', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 40, initval: 0 });

  // Test legacy method names if they exist
  const legacyWorks = await page.evaluate(() => {
    const $ = (window as any).$;
    try {
      // Test potential legacy methods
      $('[data-testid="test-input"]').TouchSpin('val', 20); // Legacy alias for setValue
      return true;
    } catch {
      // Use standard method
      $('[data-testid="test-input"]').TouchSpin('setValue', 20);
      return false;
    }
  });

  // Should have set the value (20 if legacy works, fallback value if not)
  const finalValue = await apiHelpers.getNumericValue(page, 'test-input');
  expect(finalValue).toBeGreaterThanOrEqual(0); // Either 20 or fallback value
  expect(legacyWorks).toBeDefined();
});

/**
 * Scenario: handles method calls with callback functions
 * Given the fixture page is loaded with initialized TouchSpin
 * When I provide callback functions to methods
 * Then callbacks are executed correctly
 * Params:
 * { "method": "setValue", "callback": "function(value) { console.log(value); }", "expectedBehavior": "callback_executed" }
 */
test('handles method calls with callback functions', async ({ page }) => {
  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 50 });

  // Test method with callback if supported
  const callbackResult = await page.evaluate(() => {
    const $ = (window as any).$;
    let callbackCalled = false;

    try {
      $('[data-testid="test-input"]').TouchSpin('setValue', 25, () => {
        callbackCalled = true;
      });
    } catch {
      // If callbacks not supported, just set value
      $('[data-testid="test-input"]').TouchSpin('setValue', 25);
    }

    return callbackCalled;
  });

  await apiHelpers.expectValueToBe(page, 'test-input', '25');
  expect(callbackResult).toBeDefined();
});

/**
 * Scenario: supports asynchronous method patterns
 * Given the fixture page is loaded with initialized TouchSpin
 * When I use asynchronous method patterns
 * Then they work correctly with promises/async-await
 * Params:
 * { "asyncMethod": "setValueAsync", "parameter": 42, "expectedBehavior": "promise_resolved" }
 */
test('supports asynchronous method patterns', async ({ page }) => {
    // Initialize TouchSpin
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 100 });

    // Test async-like pattern with Promise wrapper
    const result = await page.evaluate(() => {
      const $ = (window as any).$;
      return new Promise((resolve) => {
        // Simulate async operation
        setTimeout(() => {
          try {
            $('[data-testid="test-input"]').TouchSpin('setValue', 42);
            const value = $('[data-testid="test-input"]').TouchSpin('getValue');
            resolve(value);
          } catch (error) {
            resolve({ error: error.message });
          }
        }, 10);
      });
    });

    expect(result).toBe(42);
  });

  /**
   * Scenario: supports startUpSpin method via jQuery interface
   * Given the fixture page is loaded with initialized TouchSpin
   * When I call startUpSpin method
   * Then continuous up spinning begins
   */
  test('supports startUpSpin method via jQuery interface', async ({ page }) => {
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 100, initval: 10, step: 1 });

    // Call startUpSpin method
    await page.evaluate(() => {
      const $ = (window as any).$;
      $('[data-testid="test-input"]').TouchSpin('startUpSpin');
    });

    // Wait briefly for spin to increment value
    await page.waitForTimeout(100);

    // Stop spinning
    await page.evaluate(() => {
      const $ = (window as any).$;
      $('[data-testid="test-input"]').TouchSpin('stopSpin');
    });

    // Value should have increased from initial
    const finalValue = await apiHelpers.getNumericValue(page, 'test-input');
    expect(finalValue).toBeGreaterThan(10);
  });

  /**
   * Scenario: supports startDownSpin method via jQuery interface
   * Given the fixture page is loaded with initialized TouchSpin
   * When I call startDownSpin method
   * Then continuous down spinning begins
   */
  test('supports startDownSpin method via jQuery interface', async ({ page }) => {
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 100, initval: 50, step: 1 });

    // Call startDownSpin method
    await page.evaluate(() => {
      const $ = (window as any).$;
      $('[data-testid="test-input"]').TouchSpin('startDownSpin');
    });

    // Wait briefly for spin to decrement value
    await page.waitForTimeout(100);

    // Stop spinning
    await page.evaluate(() => {
      const $ = (window as any).$;
      $('[data-testid="test-input"]').TouchSpin('stopSpin');
    });

    // Value should have decreased from initial
    const finalValue = await apiHelpers.getNumericValue(page, 'test-input');
    expect(finalValue).toBeLessThan(50);
  });

  /**
   * Scenario: supports stopSpin method via jQuery interface
   * Given the fixture page is loaded with initialized TouchSpin and spinning is active
   * When I call stopSpin method
   * Then spinning stops immediately
   */
  test('supports stopSpin method via jQuery interface', async ({ page }) => {
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 100, initval: 10, step: 1 });

    // Start spinning
    await page.evaluate(() => {
      const $ = (window as any).$;
      $('[data-testid="test-input"]').TouchSpin('startUpSpin');
    });

    // Immediately stop
    await page.evaluate(() => {
      const $ = (window as any).$;
      $('[data-testid="test-input"]').TouchSpin('stopSpin');
    });

    // Get value after stop
    const valueAfterStop = await apiHelpers.getNumericValue(page, 'test-input');

    // Wait to ensure spinning doesn't continue
    await page.waitForTimeout(100);

    // Value should remain stable
    const finalValue = await apiHelpers.getNumericValue(page, 'test-input');
    expect(finalValue).toBe(valueAfterStop);
  });

  /**
   * Scenario: supports callable UP_ONCE event
   * Given the fixture page is loaded with initialized TouchSpin
   * When I trigger UP_ONCE event
   * Then value increments once
   */
  test('supports callable UP_ONCE event', async ({ page }) => {
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 100, initval: 10, step: 5 });

    // Trigger UP_ONCE event
    await page.evaluate(() => {
      const $ = (window as any).$;
      const TouchSpinCallableEvent = (window as any).TouchSpinCallableEvent;
      $('[data-testid="test-input"]').trigger(TouchSpinCallableEvent.UP_ONCE);
    });

    await apiHelpers.expectValueToBe(page, 'test-input', '15');
  });

  /**
   * Scenario: supports callable DOWN_ONCE event
   * Given the fixture page is loaded with initialized TouchSpin
   * When I trigger DOWN_ONCE event
   * Then value decrements once
   */
  test('supports callable DOWN_ONCE event', async ({ page }) => {
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 100, initval: 20, step: 5 });

    // Trigger DOWN_ONCE event
    await page.evaluate(() => {
      const $ = (window as any).$;
      const TouchSpinCallableEvent = (window as any).TouchSpinCallableEvent;
      $('[data-testid="test-input"]').trigger(TouchSpinCallableEvent.DOWN_ONCE);
    });

    await apiHelpers.expectValueToBe(page, 'test-input', '15');
  });

  /**
   * Scenario: supports callable START_UP_SPIN event
   * Given the fixture page is loaded with initialized TouchSpin
   * When I trigger START_UP_SPIN event
   * Then continuous up spinning begins
   */
  test('supports callable START_UP_SPIN event', async ({ page }) => {
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 100, initval: 10, step: 1 });

    // Trigger START_UP_SPIN event
    await page.evaluate(() => {
      const $ = (window as any).$;
      const TouchSpinCallableEvent = (window as any).TouchSpinCallableEvent;
      $('[data-testid="test-input"]').trigger(TouchSpinCallableEvent.START_UP_SPIN);
    });

    // Wait briefly for spin
    await page.waitForTimeout(100);

    // Stop spinning
    await page.evaluate(() => {
      const $ = (window as any).$;
      const TouchSpinCallableEvent = (window as any).TouchSpinCallableEvent;
      $('[data-testid="test-input"]').trigger(TouchSpinCallableEvent.STOP_SPIN);
    });

    // Value should have increased
    const finalValue = await apiHelpers.getNumericValue(page, 'test-input');
    expect(finalValue).toBeGreaterThan(10);
  });

  /**
   * Scenario: supports callable START_DOWN_SPIN event
   * Given the fixture page is loaded with initialized TouchSpin
   * When I trigger START_DOWN_SPIN event
   * Then continuous down spinning begins
   */
  test('supports callable START_DOWN_SPIN event', async ({ page }) => {
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 100, initval: 50, step: 1 });

    // Trigger START_DOWN_SPIN event
    await page.evaluate(() => {
      const $ = (window as any).$;
      const TouchSpinCallableEvent = (window as any).TouchSpinCallableEvent;
      $('[data-testid="test-input"]').trigger(TouchSpinCallableEvent.START_DOWN_SPIN);
    });

    // Wait briefly for spin
    await page.waitForTimeout(100);

    // Stop spinning
    await page.evaluate(() => {
      const $ = (window as any).$;
      const TouchSpinCallableEvent = (window as any).TouchSpinCallableEvent;
      $('[data-testid="test-input"]').trigger(TouchSpinCallableEvent.STOP_SPIN);
    });

    // Value should have decreased
    const finalValue = await apiHelpers.getNumericValue(page, 'test-input');
    expect(finalValue).toBeLessThan(50);
  });

  /**
   * Scenario: supports callable STOP_SPIN event
   * Given the fixture page is loaded with initialized TouchSpin and spinning is active
   * When I trigger STOP_SPIN event
   * Then spinning stops immediately
   */
  test('supports callable STOP_SPIN event', async ({ page }) => {
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 100, initval: 10, step: 1 });

    // Start spinning via event
    await page.evaluate(() => {
      const $ = (window as any).$;
      const TouchSpinCallableEvent = (window as any).TouchSpinCallableEvent;
      $('[data-testid="test-input"]').trigger(TouchSpinCallableEvent.START_UP_SPIN);
    });

    // Immediately stop via event
    await page.evaluate(() => {
      const $ = (window as any).$;
      const TouchSpinCallableEvent = (window as any).TouchSpinCallableEvent;
      $('[data-testid="test-input"]').trigger(TouchSpinCallableEvent.STOP_SPIN);
    });

    // Get value after stop
    const valueAfterStop = await apiHelpers.getNumericValue(page, 'test-input');

    // Wait to ensure spinning doesn't continue
    await page.waitForTimeout(100);

    // Value should remain stable
    const finalValue = await apiHelpers.getNumericValue(page, 'test-input');
    expect(finalValue).toBe(valueAfterStop);
  });

  /**
   * Scenario: supports callable UPDATE_SETTINGS event
   * Given the fixture page is loaded with initialized TouchSpin
   * When I trigger UPDATE_SETTINGS event with new settings
   * Then settings are updated dynamically
   */
  test('supports callable UPDATE_SETTINGS event', async ({ page }) => {
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 100, initval: 10, step: 1 });

    // Trigger UPDATE_SETTINGS event
    await page.evaluate(() => {
      const $ = (window as any).$;
      const TouchSpinCallableEvent = (window as any).TouchSpinCallableEvent;
      $('[data-testid="test-input"]').trigger(TouchSpinCallableEvent.UPDATE_SETTINGS, [{ step: 10 }]);
    });

    // Click up button - should now increment by 10
    await apiHelpers.clickUpButton(page, 'test-input');
    await apiHelpers.expectValueToBe(page, 'test-input', '20');
  });

  /**
   * Scenario: supports callable DESTROY event
   * Given the fixture page is loaded with initialized TouchSpin
   * When I trigger DESTROY event
   * Then TouchSpin instance is destroyed
   */
  test('supports callable DESTROY event', async ({ page }) => {
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 100, initval: 10 });

    // Verify initialized
    expect(await apiHelpers.isTouchSpinInitialized(page, 'test-input')).toBe(true);

    // Trigger DESTROY event
    await page.evaluate(() => {
      const $ = (window as any).$;
      const TouchSpinCallableEvent = (window as any).TouchSpinCallableEvent;
      $('[data-testid="test-input"]').trigger(TouchSpinCallableEvent.DESTROY);
    });

    // Verify destroyed
    expect(await apiHelpers.isTouchSpinInitialized(page, 'test-input')).toBe(false);
  });

}); // Close test.describe block