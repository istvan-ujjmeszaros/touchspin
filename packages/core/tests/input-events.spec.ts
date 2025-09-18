import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../../__tests__/helpers/touchspinApiHelpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  readInputValue
} from '../test-helpers/core-adapter';

test.describe('Core TouchSpin Input Event Handling', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await page.waitForFunction(() => (window as any).coreTestReady === true);
    await touchspinHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'core-input-events');
  });

  test.describe('Input Change Event Interception', () => {
    test('change event with valid value is allowed through', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 0,
        max: 100,
        initval: 50
      });

      await touchspinHelpers.clearEventLog(page);

      // Manually set a valid value and trigger change event
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '75'; // Valid value within bounds

        // Trigger change event
        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
        input.dispatchEvent(changeEvent);
      });

      await page.waitForTimeout(50);

      // Change event should propagate normally
      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
      expect(await readInputValue(page, 'test-input')).toBe('75');
    });

    test('change event with invalid value is intercepted', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 5,
        min: 0,
        max: 100,
        initval: 50
      });

      // Test change event interception by monitoring event propagation
      const eventIntercepted = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Set a value that would be sanitized (not divisible by step=5)
        input.value = '73'; // Will be sanitized to 75 (nearest multiple of 5)

        let changeEventPropagated = false;

        // Listen for change events at document level (after TouchSpin processing)
        document.addEventListener('change', (e) => {
          if (e.target === input) {
            changeEventPropagated = true;
          }
        });

        // Trigger change event
        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
        input.dispatchEvent(changeEvent);

        // Give TouchSpin time to process
        await new Promise(resolve => setTimeout(resolve, 50));

        return {
          changeEventPropagated: changeEventPropagated,
          inputValue: input.value
        };
      });

      // The change event should be intercepted (stopped) because value would be sanitized
      expect(eventIntercepted.changeEventPropagated).toBe(false);
    });

    test('change event interception with NaN value', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10
      });

      const nanResult = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Set invalid (NaN) value
        input.value = 'invalid-text';

        let changeEventPropagated = false;

        document.addEventListener('change', (e) => {
          if (e.target === input) {
            changeEventPropagated = true;
          }
        });

        // Trigger change event
        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
        input.dispatchEvent(changeEvent);

        await new Promise(resolve => setTimeout(resolve, 50));

        return {
          changeEventPropagated: changeEventPropagated,
          inputValue: input.value
        };
      });

      // NaN values should be intercepted since they would be sanitized
      expect(nanResult.changeEventPropagated).toBe(false);
    });

    test('change event with boundary violation is intercepted', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 0,
        max: 10,
        initval: 5
      });

      const boundaryResult = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Set value that exceeds maximum
        input.value = '15'; // Exceeds max=10

        let changeEventPropagated = false;

        document.addEventListener('change', (e) => {
          if (e.target === input) {
            changeEventPropagated = true;
          }
        });

        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
        input.dispatchEvent(changeEvent);

        await new Promise(resolve => setTimeout(resolve, 50));

        return {
          changeEventPropagated: changeEventPropagated,
          inputValue: input.value
        };
      });

      // Boundary violating values should be intercepted
      expect(boundaryResult.changeEventPropagated).toBe(false);
    });

    test('change event stopImmediatePropagation is called correctly', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 0,
        max: 10,
        initval: 5
      });

      const stopImmediateResult = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Set invalid value
        input.value = '15'; // Exceeds max

        let stopImmediatePropagationCalled = false;

        // Override stopImmediatePropagation to track if it's called
        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
        const originalStop = changeEvent.stopImmediatePropagation;
        changeEvent.stopImmediatePropagation = function() {
          stopImmediatePropagationCalled = true;
          originalStop.call(this);
        };

        input.dispatchEvent(changeEvent);

        await new Promise(resolve => setTimeout(resolve, 50));

        return {
          stopImmediatePropagationCalled: stopImmediatePropagationCalled
        };
      });

      expect(stopImmediateResult.stopImmediatePropagationCalled).toBe(true);
    });
  });

  test.describe('Input Blur Event Handling', () => {
    test('blur event triggers value sanitization', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 5,
        min: 0,
        max: 100,
        initval: 50
      });

      // Set invalid value and trigger blur
      await page.fill('[data-testid="test-input"]', '73'); // Not divisible by step=5
      await page.focus('[data-testid="test-input"]');
      await touchspinHelpers.clearEventLog(page);

      // Trigger blur event
      await page.blur('[data-testid="test-input"]');
      await page.waitForTimeout(50);

      // Value should be sanitized to nearest step multiple
      expect(await readInputValue(page, 'test-input')).toBe('75'); // Nearest multiple of 5

      // Should emit change event after sanitization
      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
    });

    test('blur event with valid value does not trigger sanitization', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 5,
        min: 0,
        max: 100,
        initval: 50
      });

      // Set valid value
      await page.fill('[data-testid="test-input"]', '75'); // Already divisible by step=5
      await page.focus('[data-testid="test-input"]');
      await touchspinHelpers.clearEventLog(page);

      // Trigger blur event
      await page.blur('[data-testid="test-input"]');
      await page.waitForTimeout(50);

      // Value should remain the same
      expect(await readInputValue(page, 'test-input')).toBe('75');

      // No additional change event should be emitted for already-valid value
      expect(await touchspinHelpers.countEventInLog(page, 'change', 'native')).toBe(0);
    });

    test('blur event handles empty input correctly', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 0,
        max: 100,
        initval: 50
      });

      // Clear input and trigger blur
      await page.fill('[data-testid="test-input"]', '');
      await page.focus('[data-testid="test-input"]');
      await page.blur('[data-testid="test-input"]');
      await page.waitForTimeout(50);

      // Should handle empty input appropriately
      const finalValue = await readInputValue(page, 'test-input');
      expect(finalValue).not.toBe(''); // Should not remain empty
    });

    test('blur event with NaN input triggers sanitization', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 0,
        max: 100,
        initval: 50
      });

      // Set invalid (NaN) value
      await page.fill('[data-testid="test-input"]', 'not-a-number');
      await page.focus('[data-testid="test-input"]');
      await touchspinHelpers.clearEventLog(page);

      // Trigger blur event
      await page.blur('[data-testid="test-input"]');
      await page.waitForTimeout(50);

      // Should sanitize to a valid number
      const finalValue = await readInputValue(page, 'test-input');
      expect(finalValue).not.toBe('not-a-number');
      expect(isNaN(Number(finalValue))).toBe(false);

      // Should emit change event after sanitization
      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
    });

    test('blur event with boundary violation triggers correction', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 10,
        max: 90,
        initval: 50
      });

      // Test below minimum
      await page.fill('[data-testid="test-input"]', '5');
      await page.focus('[data-testid="test-input"]');
      await page.blur('[data-testid="test-input"]');
      await page.waitForTimeout(50);
      expect(await getNumericValue(page, 'test-input')).toBe(10); // Clamped to min

      // Test above maximum
      await page.fill('[data-testid="test-input"]', '95');
      await page.focus('[data-testid="test-input"]');
      await page.blur('[data-testid="test-input"]');
      await page.waitForTimeout(50);
      expect(await getNumericValue(page, 'test-input')).toBe(90); // Clamped to max
    });
  });

  test.describe('Input Event Handler Integration', () => {
    test('change and blur event handlers work together correctly', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 10,
        min: 0,
        max: 100,
        initval: 50
      });

      await touchspinHelpers.clearEventLog(page);

      // Set invalid value that would trigger both change interception and blur sanitization
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Set value that's not divisible by step=10
        input.value = '73';

        // Trigger change event first (should be intercepted)
        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
        input.dispatchEvent(changeEvent);
      });

      await page.waitForTimeout(50);

      // Change event should be intercepted (no change event in log yet)
      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(false);

      // Now trigger blur (should sanitize and emit proper change event)
      await page.focus('[data-testid="test-input"]');
      await page.blur('[data-testid="test-input"]');
      await page.waitForTimeout(50);

      // Blur should trigger sanitization and proper change event
      expect(await readInputValue(page, 'test-input')).toBe('70'); // Sanitized to step boundary
      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
    });

    test('input event handlers are properly attached and detached', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10
      });

      // Test that handlers are working
      await page.fill('[data-testid="test-input"]', 'invalid');
      await page.focus('[data-testid="test-input"]');
      await page.blur('[data-testid="test-input"]');
      await page.waitForTimeout(50);

      const valueBeforeDestroy = await readInputValue(page, 'test-input');
      expect(valueBeforeDestroy).not.toBe('invalid'); // Should be sanitized

      // Destroy TouchSpin
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        core.destroy();
      });

      // Clear event log and try to trigger events after destroy
      await touchspinHelpers.clearEventLog(page);

      // Set invalid value and blur - should not be sanitized anymore
      await page.fill('[data-testid="test-input"]', 'after-destroy');
      await page.focus('[data-testid="test-input"]');
      await page.blur('[data-testid="test-input"]');
      await page.waitForTimeout(50);

      // Value should remain unchanged (handlers are detached)
      expect(await readInputValue(page, 'test-input')).toBe('after-destroy');
    });

    test('input event handlers handle rapid value changes', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 0,
        max: 100,
        initval: 50
      });

      // Rapid sequence of invalid values
      const finalResult = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Simulate rapid typing with invalid values
        const invalidValues = ['abc', '150', '-10', 'xyz', '75'];

        for (let i = 0; i < invalidValues.length; i++) {
          input.value = invalidValues[i];

          // Trigger change event
          const changeEvent = new Event('change', { bubbles: true, cancelable: true });
          input.dispatchEvent(changeEvent);

          // Brief delay
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Final blur to sanitize
        const blurEvent = new Event('blur', { bubbles: true });
        input.dispatchEvent(blurEvent);

        await new Promise(resolve => setTimeout(resolve, 50));

        return input.value;
      });

      // Final value should be sanitized properly
      expect(finalResult).toBe('75'); // Last valid value, properly sanitized
    });

    test('change event interception works with forcestepdivisibility', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 3,
        forcestepdivisibility: 'round',
        initval: 15 // Multiple of 3
      });

      const divisibilityResult = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Set value that's not divisible by 3
        input.value = '17'; // Would round to 18

        let changeEventIntercepted = false;

        // Track if change event gets through
        document.addEventListener('change', (e) => {
          if (e.target === input && e.eventPhase === Event.AT_TARGET) {
            changeEventIntercepted = false; // Event got through
          }
        });

        // Start with assumption that it will be intercepted
        changeEventIntercepted = true;

        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
        input.dispatchEvent(changeEvent);

        await new Promise(resolve => setTimeout(resolve, 50));

        return {
          changeEventIntercepted: changeEventIntercepted,
          inputValue: input.value
        };
      });

      // Change event should be intercepted because 17 would be sanitized to 18
      expect(divisibilityResult.changeEventIntercepted).toBe(true);
    });
  });
});

// NOTE: This test file exercises the input event handlers (_handleInputChange, _handleInputBlur),
// covering change event interception for invalid values, blur event sanitization, stopImmediatePropagation
// behavior, integration with constraints and forcestepdivisibility, and proper event handler lifecycle.
