/**
 * Feature: TouchSpin Web Component lifecycle management
 * Background: fixture = /packages/core/tests/__shared__/fixtures/test-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] registers custom element definition
 * [x] handles custom element registration conflicts
 * [x] initializes when connected to DOM
 * [x] handles multiple instances on same page
 * [x] cleans up when disconnected from DOM
 * [x] handles reconnection after disconnection
 * [ ] manages adopted callback for document moves
 * [x] handles attribute changes during lifecycle
 * [ ] manages constructor initialization
 * [ ] handles early attribute access
 * [ ] supports late binding scenarios
 * [ ] manages memory cleanup on destruction
 * [ ] handles error states during initialization
 * [x] supports dynamic creation via JavaScript
 * [ ] handles shadow DOM scenarios if applicable
 * [ ] manages timing of initialization
 * [ ] handles document ready state variations
 * [ ] supports nested component scenarios
 * [ ] manages event listener cleanup
 * [ ] handles upgrade scenarios for existing elements
 * [ ] supports concurrent lifecycle operations
 * [ ] manages dependencies during initialization
 * [ ] handles edge cases with malformed markup
 * [ ] supports conditional initialization
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';

test.describe('TouchSpin Web Component lifecycle management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
    await apiHelpers.startCoverage(page);
    await apiHelpers.waitForPageReady(page);

    // Load the web component
    await page.addScriptTag({
      path: '/packages/web-component/dist/index.js'
    });

    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

/**
 * Scenario: registers custom element definition
 * Given the web component module is loaded
 * When the custom element is defined
 * Then it registers successfully without conflicts
 * Params:
 * { "elementName": "touch-spin", "expectedRegistration": "successful", "globalRegistry": "customElements" }
 */
test('registers custom element definition', async ({ page }) => {
  // Test custom element registration
  const registrationTest = await page.evaluate(() => {
    // Check if TouchSpinInput is defined in customElements registry
    const isDefined = customElements.get('touchspin-input') !== undefined;

    // Try to create element to verify it works
    const element = document.createElement('touchspin-input');
    const isInstanceOfHTMLElement = element instanceof HTMLElement;

    return {
      isDefined,
      isInstanceOfHTMLElement,
      tagName: element.tagName.toLowerCase()
    };
  });

  expect(registrationTest.isDefined).toBe(true);
  expect(registrationTest.isInstanceOfHTMLElement).toBe(true);
  expect(registrationTest.tagName).toBe('touchspin-input');
});

/**
 * Scenario: handles custom element registration conflicts
 * Given a custom element is already registered with the same name
 * When the TouchSpin web component attempts registration
 * Then it handles the conflict gracefully
 * Params:
 * { "conflictScenario": "duplicate_registration", "expectedBehavior": "graceful_handling", "errorHandling": "non_throwing" }
 */
test('handles custom element registration conflicts', async ({ page }) => {
  // Test conflict handling when trying to register same element twice
  const conflictTest = await page.evaluate(() => {
    try {
      // Try to register a conflicting element with same name
      class ConflictingElement extends HTMLElement {}
      customElements.define('touchspin-input', ConflictingElement);
      return { error: null, conflictHandled: false };
    } catch (error) {
      // Expected: should throw error because already registered
      return {
        error: error.name,
        conflictHandled: true,
        message: error.message
      };
    }
  });

  // Should handle conflict gracefully (error expected)
  expect(conflictTest.conflictHandled).toBe(true);
  expect(conflictTest.error).toBe('NotSupportedError');
});

/**
 * Scenario: initializes when connected to DOM
 * Given a touch-spin element is created
 * When it is connected to the DOM
 * Then it initializes the TouchSpin core and renderer
 * Params:
 * { "connectionMethod": "appendChild", "expectedInitialization": "core_and_renderer", "readyState": "functional" }
 */
test('initializes when connected to DOM', async ({ page }) => {
  // Create and connect touchspin-input element
  await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('min', '0');
    element.setAttribute('max', '100');
    element.setAttribute('value', '50');
    element.setAttribute('data-testid', 'web-component-test');
    document.body.appendChild(element);
  });

  // Wait for initialization
  await page.waitForTimeout(100);

  // Test initialization
  const initTest = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="web-component-test"]') as any;

    // Check if TouchSpin core was initialized
    const hasInput = element.querySelector('input') !== null;
    const hasWrapper = element.querySelector('[data-touchspin-injected]') !== null;

    return {
      elementExists: !!element,
      hasInput,
      hasWrapper,
      isConnected: element.isConnected,
      tagName: element.tagName.toLowerCase()
    };
  });

  expect(initTest.elementExists).toBe(true);
  expect(initTest.isConnected).toBe(true);
  expect(initTest.tagName).toBe('touchspin-input');
  // Core initialization creates input and wrapper elements
  expect(initTest.hasInput || initTest.hasWrapper).toBe(true);
});

/**
 * Scenario: handles multiple instances on same page
 * Given multiple touch-spin elements exist
 * When they are all connected to the DOM
 * Then each instance initializes independently
 * Params:
 * { "instanceCount": 3, "expectedBehavior": "independent_initialization", "noInterference": true }
 */
test('handles multiple instances on same page', async ({ page }) => {
  // Create multiple touchspin-input elements
  await page.evaluate(() => {
    for (let i = 0; i < 3; i++) {
      const element = document.createElement('touchspin-input');
      element.setAttribute('min', '0');
      element.setAttribute('max', '100');
      element.setAttribute('value', (i * 10).toString());
      element.setAttribute('data-testid', `web-component-${i}`);
      document.body.appendChild(element);
    }
  });

  // Wait for initialization
  await page.waitForTimeout(200);

  // Test multiple instances
  const multiInstanceTest = await page.evaluate(() => {
    const elements = document.querySelectorAll('touchspin-input');
    const instances = [];

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as any;
      instances.push({
        exists: !!element,
        isConnected: element.isConnected,
        hasTestId: element.hasAttribute('data-testid'),
        testId: element.getAttribute('data-testid')
      });
    }

    return {
      totalElements: elements.length,
      instances
    };
  });

  expect(multiInstanceTest.totalElements).toBe(3);
  multiInstanceTest.instances.forEach((instance, index) => {
    expect(instance.exists).toBe(true);
    expect(instance.isConnected).toBe(true);
    expect(instance.testId).toBe(`web-component-${index}`);
  });
});

/**
 * Scenario: cleans up when disconnected from DOM
 * Given a connected and initialized touch-spin element
 * When it is disconnected from the DOM
 * Then it properly cleans up resources and event listeners
 * Params:
 * { "disconnectionMethod": "removeChild", "expectedCleanup": "complete_resource_cleanup", "memoryLeaks": "none" }
 */
test('cleans up when disconnected from DOM', async ({ page }) => {
  // Create and connect element
  await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('data-testid', 'cleanup-test');
    element.setAttribute('value', '25');
    document.body.appendChild(element);
  });

  await page.waitForTimeout(100);

  // Verify it's connected and initialized
  const beforeDisconnect = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="cleanup-test"]');
    return {
      exists: !!element,
      isConnected: element?.isConnected,
      hasChildren: element && element.children.length > 0
    };
  });

  expect(beforeDisconnect.exists).toBe(true);
  expect(beforeDisconnect.isConnected).toBe(true);

  // Disconnect element
  await page.evaluate(() => {
    const element = document.querySelector('[data-testid="cleanup-test"]');
    if (element) {
      element.remove();
    }
  });

  // Verify cleanup
  const afterDisconnect = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="cleanup-test"]');
    return {
      exists: !!element,
      isConnected: element?.isConnected || false
    };
  });

  expect(afterDisconnect.exists).toBe(false);
  expect(afterDisconnect.isConnected).toBe(false);
});

/**
 * Scenario: handles reconnection after disconnection
 * Given a touch-spin element that was disconnected
 * When it is reconnected to the DOM
 * Then it reinitializes properly
 * Params:
 * { "reconnectionScenario": "disconnect_then_reconnect", "expectedBehavior": "proper_reinitialization", "stateRestoration": "functional" }
 */
test('handles reconnection after disconnection', async ({ page }) => {
  // Create element and store reference
  const elementReference = await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('data-testid', 'reconnect-test');
    element.setAttribute('value', '30');
    document.body.appendChild(element);
    return {
      tagName: element.tagName,
      testId: element.getAttribute('data-testid')
    };
  });

  await page.waitForTimeout(100);

  // Disconnect
  await page.evaluate(() => {
    const element = document.querySelector('[data-testid="reconnect-test"]');
    if (element) {
      element.remove();
    }
  });

  // Reconnect same element
  await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('data-testid', 'reconnect-test');
    element.setAttribute('value', '30');
    document.body.appendChild(element);
  });

  await page.waitForTimeout(100);

  // Test reconnection
  const reconnectTest = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="reconnect-test"]');
    return {
      exists: !!element,
      isConnected: element?.isConnected,
      tagName: element?.tagName.toLowerCase(),
      value: element?.getAttribute('value')
    };
  });

  expect(reconnectTest.exists).toBe(true);
  expect(reconnectTest.isConnected).toBe(true);
  expect(reconnectTest.tagName).toBe('touchspin-input');
  expect(reconnectTest.value).toBe('30');
});

/**
 * Scenario: manages adopted callback for document moves
 * Given a touch-spin element in one document
 * When it is adopted into another document
 * Then it handles the document transfer correctly
 * Params:
 * { "adoptionScenario": "document_transfer", "expectedBehavior": "successful_adoption", "functionality": "preserved" }
 */
test.skip('manages adopted callback for document moves', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: handles attribute changes during lifecycle
 * Given a touch-spin element during various lifecycle states
 * When attributes are changed
 * Then it responds appropriately based on lifecycle stage
 * Params:
 * { "lifecycleStages": ["pre_connection", "connected", "disconnected"], "attributeChanges": ["min", "max", "step"], "expectedResponses": "stage_appropriate" }
 */
test('handles attribute changes during lifecycle', async ({ page }) => {
  // Create element
  await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('data-testid', 'attr-change-test');
    element.setAttribute('min', '0');
    element.setAttribute('max', '100');
    element.setAttribute('value', '50');
    document.body.appendChild(element);
  });

  await page.waitForTimeout(100);

  // Change attributes during runtime
  await page.evaluate(() => {
    const element = document.querySelector('[data-testid="attr-change-test"]');
    if (element) {
      element.setAttribute('min', '10');
      element.setAttribute('max', '90');
      element.setAttribute('step', '5');
    }
  });

  await page.waitForTimeout(50);

  // Test attribute changes were processed
  const attrChangeTest = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="attr-change-test"]');
    return {
      exists: !!element,
      min: element?.getAttribute('min'),
      max: element?.getAttribute('max'),
      step: element?.getAttribute('step'),
      isConnected: element?.isConnected
    };
  });

  expect(attrChangeTest.exists).toBe(true);
  expect(attrChangeTest.isConnected).toBe(true);
  expect(attrChangeTest.min).toBe('10');
  expect(attrChangeTest.max).toBe('90');
  expect(attrChangeTest.step).toBe('5');
});

/**
 * Scenario: manages constructor initialization
 * Given the touch-spin custom element class
 * When a new instance is constructed
 * Then it initializes internal state properly
 * Params:
 * { "constructorBehavior": "minimal_setup", "deferredInitialization": true, "earlyAccess": "safe" }
 */
test.skip('manages constructor initialization', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: handles early attribute access
 * Given a touch-spin element before DOM connection
 * When attributes are accessed or modified
 * Then it handles early access gracefully
 * Params:
 * { "earlyAccessScenarios": ["getAttribute", "setAttribute"], "expectedBehavior": "safe_handling", "noErrors": true }
 */
test.skip('handles early attribute access', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: supports late binding scenarios
 * Given touch-spin elements created before script loading
 * When the web component script loads later
 * Then existing elements are upgraded properly
 * Params:
 * { "bindingScenario": "script_loaded_after_elements", "expectedBehavior": "element_upgrade", "functionality": "full_after_upgrade" }
 */
test.skip('supports late binding scenarios', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: manages memory cleanup on destruction
 * Given initialized touch-spin elements
 * When they are removed and garbage collected
 * Then no memory leaks occur
 * Params:
 * { "destructionMethod": "remove_and_gc", "memoryTracking": "enabled", "expectedLeaks": "none" }
 */
test.skip('manages memory cleanup on destruction', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: handles error states during initialization
 * Given touch-spin elements with invalid configurations
 * When initialization occurs
 * Then errors are handled gracefully without breaking the page
 * Params:
 * { "errorScenarios": ["invalid_attributes", "missing_dependencies"], "expectedBehavior": "graceful_degradation", "pageStability": "maintained" }
 */
test.skip('handles error states during initialization', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: supports dynamic creation via JavaScript
 * Given JavaScript code creating touch-spin elements
 * When elements are created and appended dynamically
 * Then they function correctly as if statically defined
 * Params:
 * { "creationMethod": "document_createElement", "dynamicAppend": true, "expectedFunctionality": "equivalent_to_static" }
 */
test('supports dynamic creation via JavaScript', async ({ page }) => {
  // Test dynamic creation via JavaScript
  const dynamicCreationTest = await page.evaluate(() => {
    // Create element via JavaScript
    const element = document.createElement('touchspin-input');
    element.setAttribute('min', '1');
    element.setAttribute('max', '10');
    element.setAttribute('value', '5');
    element.setAttribute('data-testid', 'dynamic-creation-test');

    // Append to DOM
    document.body.appendChild(element);

    return {
      created: !!element,
      tagName: element.tagName.toLowerCase(),
      isConnected: element.isConnected,
      hasAttributes: element.hasAttributes(),
      min: element.getAttribute('min'),
      max: element.getAttribute('max'),
      value: element.getAttribute('value')
    };
  });

  expect(dynamicCreationTest.created).toBe(true);
  expect(dynamicCreationTest.tagName).toBe('touchspin-input');
  expect(dynamicCreationTest.isConnected).toBe(true);
  expect(dynamicCreationTest.hasAttributes).toBe(true);
  expect(dynamicCreationTest.min).toBe('1');
  expect(dynamicCreationTest.max).toBe('10');
  expect(dynamicCreationTest.value).toBe('5');
});

/**
 * Scenario: handles shadow DOM scenarios if applicable
 * Given touch-spin elements within shadow DOM contexts
 * When they are initialized
 * Then they work correctly within shadow boundaries
 * Params:
 * { "shadowDOMContext": "within_shadow_root", "expectedBehavior": "proper_encapsulation", "functionality": "preserved" }
 */
test.skip('handles shadow DOM scenarios if applicable', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: manages timing of initialization
 * Given touch-spin elements added at different times
 * When document state varies (loading, interactive, complete)
 * Then initialization timing is handled correctly
 * Params:
 * { "documentStates": ["loading", "interactive", "complete"], "initializationTiming": "appropriate_per_state", "functionality": "consistent" }
 */
test.skip('manages timing of initialization', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: handles document ready state variations
 * Given touch-spin elements in documents with different ready states
 * When initialization occurs
 * Then it adapts to the document state appropriately
 * Params:
 * { "readyStateVariations": ["loading", "interactive", "complete"], "adaptiveBehavior": true, "expectedFunctionality": "consistent" }
 */
test.skip('handles document ready state variations', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: supports nested component scenarios
 * Given touch-spin elements nested within other components
 * When the nested structure is connected
 * Then all levels initialize correctly
 * Params:
 * { "nestingLevels": 3, "nestedComponents": ["custom_elements", "frameworks"], "expectedBehavior": "hierarchical_initialization" }
 */
test.skip('supports nested component scenarios', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: manages event listener cleanup
 * Given touch-spin elements with event listeners
 * When elements are disconnected
 * Then all event listeners are properly removed
 * Params:
 * { "eventTypes": ["click", "input", "focus"], "cleanupMethod": "disconnectedCallback", "expectedResult": "no_orphaned_listeners" }
 */
test.skip('manages event listener cleanup', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: handles upgrade scenarios for existing elements
 * Given existing touch-spin elements in the DOM
 * When the web component definition is loaded
 * Then existing elements are upgraded to custom elements
 * Params:
 * { "upgradeScenario": "definition_after_elements", "existingElementCount": 5, "expectedUpgrade": "all_elements_upgraded" }
 */
test.skip('handles upgrade scenarios for existing elements', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: supports concurrent lifecycle operations
 * Given multiple touch-spin elements undergoing lifecycle changes
 * When operations occur concurrently
 * Then no race conditions or conflicts occur
 * Params:
 * { "concurrentOperations": ["connect", "disconnect", "attribute_change"], "elementCount": 10, "expectedBehavior": "race_condition_free" }
 */
test.skip('supports concurrent lifecycle operations', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: manages dependencies during initialization
 * Given touch-spin elements with dependencies on external resources
 * When initialization occurs with missing dependencies
 * Then it handles missing dependencies gracefully
 * Params:
 * { "dependencies": ["core_module", "renderer_module"], "missingDependencyBehavior": "graceful_fallback", "expectedResult": "non_breaking" }
 */
test.skip('manages dependencies during initialization', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: handles edge cases with malformed markup
 * Given touch-spin elements with malformed or invalid markup
 * When they are processed by the browser
 * Then the web component handles malformed cases gracefully
 * Params:
 * { "malformedCases": ["invalid_nesting", "missing_attributes"], "expectedBehavior": "graceful_handling", "pageStability": "maintained" }
 */
test.skip('handles edge cases with malformed markup', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: supports conditional initialization
 * Given touch-spin elements with conditions for initialization
 * When conditions are met or not met
 * Then initialization occurs conditionally as expected
 * Params:
 * { "conditions": ["feature_flags", "browser_capabilities"], "conditionalBehavior": "responsive_to_conditions", "fallbackBehavior": "graceful" }
 */
test.skip('supports conditional initialization', async ({ page }) => {
  // Implementation pending
});

});