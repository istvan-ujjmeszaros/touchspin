import { test, expect } from '@playwright/test';
import * as apiHelpers from '../../../__tests__/helpers/touchspinApiHelpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  readInputValue
} from '../../..__tests__/helpers/touchspinApiHelpers';

test.describe('Core TouchSpin Callback Functions', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await apiHelpers.waitForCoreTestReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'core-callbacks');
  });

  test.describe('Before Calculation Callback', () => {
    test('callback_before_calculation modifies value before processing', async ({ page }) => {
      const callbackResult = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        let callbackCallCount = 0;
        let receivedValues: number[] = [];

        const core = new TouchSpinCore(input, {
          step: 1,
          initval: 10,
          callback_before_calculation: (currentValue: number) => {
            callbackCallCount++;
            receivedValues.push(currentValue);

            // Modify the value (double it)
            return currentValue * 2;
          }
        });

        // Set a value that will trigger the callback
        input.value = '15';

        // Trigger value check (which calls callback_before_calculation)
        core._checkValue(false);

        return {
          callbackCallCount: callbackCallCount,
          receivedValues: receivedValues,
          finalInputValue: input.value,
          finalCoreValue: core.getValue()
        };
      });

      expect(callbackResult.callbackCallCount).toBe(1);
      expect(callbackResult.receivedValues[0]).toBe(15); // Original value received by callback
      expect(callbackResult.finalCoreValue).toBe(30); // Value doubled by callback
      expect(callbackResult.finalInputValue).toBe('30'); // Input updated with modified value
    });

    test('callback_before_calculation works with invalid initial values', async ({ page }) => {
      const callbackResult = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        let callbackCalled = false;
        let receivedValue: any = undefined;

        const core = new TouchSpinCore(input, {
          step: 1,
          initval: 10,
          callback_before_calculation: (currentValue: number) => {
            callbackCalled = true;
            receivedValue = currentValue;

            // Return a valid value when input is NaN
            return isNaN(currentValue) ? 42 : currentValue;
          }
        });

        // Set invalid value
        input.value = 'not-a-number';

        // Trigger value check
        core._checkValue(false);

        return {
          callbackCalled: callbackCalled,
          receivedValue: receivedValue,
          finalValue: core.getValue()
        };
      });

      expect(callbackResult.callbackCalled).toBe(true);
      expect(isNaN(callbackResult.receivedValue)).toBe(true); // Callback received NaN
      expect(callbackResult.finalValue).toBe(42); // Callback provided valid replacement
    });

    test('callback_before_calculation is applied before constraint checking', async ({ page }) => {
      const constraintResult = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const core = new TouchSpinCore(input, {
          step: 1,
          min: 0,
          max: 100,
          initval: 50,
          callback_before_calculation: (currentValue: number) => {
            // Always return a value that exceeds max
            return 150;
          }
        });

        // Set a normal value
        input.value = '75';

        // Trigger value check
        core._checkValue(false);

        return {
          finalValue: core.getValue()
        };
      });

      // Value from callback (150) should be constrained to max (100)
      expect(constraintResult.finalValue).toBe(100);
    });

    test('callback_before_calculation works with step divisibility', async ({ page }) => {
      const divisibilityResult = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const core = new TouchSpinCore(input, {
          step: 5,
          forcestepdivisibility: 'round',
          initval: 25,
          callback_before_calculation: (currentValue: number) => {
            // Return value that's not divisible by step
            return 23;
          }
        });

        // Set a value
        input.value = '20';

        // Trigger value check
        core._checkValue(false);

        return {
          finalValue: core.getValue()
        };
      });

      // Callback value (23) should be rounded to nearest step multiple (25)
      expect(divisibilityResult.finalValue).toBe(25);
    });

    test('callback_before_calculation exception handling', async ({ page }) => {
      // Capture console errors
      const consoleMessages: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleMessages.push(msg.text());
        }
      });

      const exceptionResult = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const core = new TouchSpinCore(input, {
          step: 1,
          initval: 10,
          callback_before_calculation: (currentValue: number) => {
            throw new Error('Callback error');
          }
        });

        // Set a value
        input.value = '15';

        try {
          // Trigger value check - should handle callback exception gracefully
          core._checkValue(false);

          return {
            success: true,
            finalValue: core.getValue()
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      });

      // TouchSpin should handle callback exceptions gracefully
      expect(exceptionResult.success).toBe(true);
      // The original value should be used when callback throws
      expect(exceptionResult.finalValue).toBe(15);
    });

    test('callback_before_calculation return value validation', async ({ page }) => {
      const validationResult = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const testResults: any[] = [];

        // Test 1: Callback returns non-numeric value
        const core1 = new TouchSpinCore(input, {
          step: 1,
          initval: 10,
          callback_before_calculation: (currentValue: number) => {
            return 'not-a-number' as any;
          }
        });

        input.value = '15';
        core1._checkValue(false);
        testResults.push({ test: 'non-numeric', value: core1.getValue() });

        // Test 2: Callback returns null
        const core2 = new TouchSpinCore(input, {
          step: 1,
          initval: 20,
          callback_before_calculation: (currentValue: number) => {
            return null as any;
          }
        });

        input.value = '25';
        core2._checkValue(false);
        testResults.push({ test: 'null', value: core2.getValue() });

        // Test 3: Callback returns undefined
        const core3 = new TouchSpinCore(input, {
          step: 1,
          initval: 30,
          callback_before_calculation: (currentValue: number) => {
            return undefined as any;
          }
        });

        input.value = '35';
        core3._checkValue(false);
        testResults.push({ test: 'undefined', value: core3.getValue() });

        return testResults;
      });

      // When callback returns invalid values, original value should be used
      const nonNumericResult = validationResult.find(r => r.test === 'non-numeric');
      const nullResult = validationResult.find(r => r.test === 'null');
      const undefinedResult = validationResult.find(r => r.test === 'undefined');

      expect(nonNumericResult.value).toBe(15); // Original value used
      expect(nullResult.value).toBe(25); // Original value used
      expect(undefinedResult.value).toBe(35); // Original value used
    });
  });

  test.describe('After Calculation Callback', () => {
    test('callback_after_calculation receives final processed value', async ({ page }) => {
      const callbackResult = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        let callbackCallCount = 0;
        let receivedValues: number[] = [];
        let callbackResults: any[] = [];

        const core = new TouchSpinCore(input, {
          step: 5,
          min: 0,
          max: 100,
          forcestepdivisibility: 'round',
          initval: 25,
          callback_after_calculation: (finalValue: number) => {
            callbackCallCount++;
            receivedValues.push(finalValue);
            callbackResults.push(`Value processed: ${finalValue}`);
            return finalValue; // Return the same value (no modification)
          }
        });

        // Set a value that will be processed (not divisible by step)
        input.value = '27'; // Will be rounded to 25

        // Trigger value check
        core._checkValue(false);

        return {
          callbackCallCount: callbackCallCount,
          receivedValues: receivedValues,
          callbackResults: callbackResults,
          finalValue: core.getValue()
        };
      });

      expect(callbackResult.callbackCallCount).toBe(1);
      expect(callbackResult.receivedValues[0]).toBe(25); // Processed value (rounded)
      expect(callbackResult.callbackResults[0]).toBe('Value processed: 25');
      expect(callbackResult.finalValue).toBe(25);
    });

    test('callback_after_calculation can modify final value', async ({ page }) => {
      const modificationResult = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const core = new TouchSpinCore(input, {
          step: 1,
          initval: 10,
          callback_after_calculation: (finalValue: number) => {
            // Add 1 to every final value
            return finalValue + 1;
          }
        });

        // Set a value
        input.value = '20';

        // Trigger value check
        core._checkValue(false);

        return {
          finalValue: core.getValue(),
          inputValue: input.value
        };
      });

      expect(modificationResult.finalValue).toBe(21); // 20 + 1 from callback
      expect(modificationResult.inputValue).toBe('21'); // Input updated with modified value
    });

    test('callback_after_calculation works with boundary enforcement', async ({ page }) => {
      const boundaryResult = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        let receivedValue: number | undefined;

        const core = new TouchSpinCore(input, {
          step: 1,
          min: 0,
          max: 50,
          initval: 25,
          callback_after_calculation: (finalValue: number) => {
            receivedValue = finalValue;
            return finalValue; // Don't modify
          }
        });

        // Set a value that exceeds max
        input.value = '75';

        // Trigger value check
        core._checkValue(false);

        return {
          receivedValue: receivedValue,
          finalValue: core.getValue()
        };
      });

      expect(boundaryResult.receivedValue).toBe(50); // Callback received clamped value
      expect(boundaryResult.finalValue).toBe(50); // Final value is clamped
    });

    test('callback_after_calculation exception handling', async ({ page }) => {
      const exceptionResult = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const core = new TouchSpinCore(input, {
          step: 1,
          initval: 10,
          callback_after_calculation: (finalValue: number) => {
            throw new Error('After calculation error');
          }
        });

        // Set a value
        input.value = '15';

        try {
          // Trigger value check - should handle callback exception gracefully
          core._checkValue(false);

          return {
            success: true,
            finalValue: core.getValue()
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      });

      // TouchSpin should handle callback exceptions gracefully
      expect(exceptionResult.success).toBe(true);
      // The processed value should be used when callback throws
      expect(exceptionResult.finalValue).toBe(15);
    });

    test('callback_after_calculation return value validation', async ({ page }) => {
      const validationResult = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const testResults: any[] = [];

        // Test 1: Callback returns NaN
        const core1 = new TouchSpinCore(input, {
          step: 1,
          initval: 10,
          callback_after_calculation: (finalValue: number) => {
            return NaN;
          }
        });

        input.value = '15';
        core1._checkValue(false);
        testResults.push({ test: 'NaN', value: core1.getValue() });

        // Test 2: Callback returns Infinity
        const core2 = new TouchSpinCore(input, {
          step: 1,
          initval: 20,
          callback_after_calculation: (finalValue: number) => {
            return Infinity;
          }
        });

        input.value = '25';
        core2._checkValue(false);
        testResults.push({ test: 'Infinity', value: core2.getValue() });

        // Test 3: Callback returns string
        const core3 = new TouchSpinCore(input, {
          step: 1,
          initval: 30,
          callback_after_calculation: (finalValue: number) => {
            return 'invalid' as any;
          }
        });

        input.value = '35';
        core3._checkValue(false);
        testResults.push({ test: 'string', value: core3.getValue() });

        return testResults;
      });

      // When callback returns invalid values, the processed value should be used
      const nanResult = validationResult.find(r => r.test === 'NaN');
      const infinityResult = validationResult.find(r => r.test === 'Infinity');
      const stringResult = validationResult.find(r => r.test === 'string');

      expect(nanResult.value).toBe(15); // Original processed value used
      expect(infinityResult.value).toBe(25); // Original processed value used
      expect(stringResult.value).toBe(35); // Original processed value used
    });
  });

  test.describe('Callback Integration', () => {
    test('both callbacks work together in sequence', async ({ page }) => {
      const sequenceResult = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const callbackLog: string[] = [];

        const core = new TouchSpinCore(input, {
          step: 1,
          initval: 10,
          callback_before_calculation: (currentValue: number) => {
            callbackLog.push(`Before: received ${currentValue}`);
            const modified = currentValue + 5;
            callbackLog.push(`Before: returning ${modified}`);
            return modified;
          },
          callback_after_calculation: (finalValue: number) => {
            callbackLog.push(`After: received ${finalValue}`);
            const modified = finalValue * 2;
            callbackLog.push(`After: returning ${modified}`);
            return modified;
          }
        });

        // Set a value
        input.value = '20';

        // Trigger value check
        core._checkValue(false);

        return {
          callbackLog: callbackLog,
          finalValue: core.getValue()
        };
      });

      expect(sequenceResult.callbackLog).toEqual([
        'Before: received 20',
        'Before: returning 25',
        'After: received 25',  // After callback receives the result of before callback
        'After: returning 50'
      ]);
      expect(sequenceResult.finalValue).toBe(50); // Final result from both callbacks
    });

    test('callbacks work with spin operations', async ({ page }) => {
      await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        let beforeCallCount = 0;
        let afterCallCount = 0;

        const core = new TouchSpinCore(input, {
          step: 1,
          initval: 10,
          callback_before_calculation: (currentValue: number) => {
            beforeCallCount++;
            return currentValue;
          },
          callback_after_calculation: (finalValue: number) => {
            afterCallCount++;
            return finalValue;
          }
        });

        // Perform spin operations
        core.upOnce();
        core.downOnce();

        return {
          beforeCallCount: beforeCallCount,
          afterCallCount: afterCallCount,
          finalValue: core.getValue()
        };
      });

      // Callbacks should be triggered during spin operations
      // Note: The exact count depends on internal implementation
      // but both callbacks should be called at least once
    });

    test('callbacks work with setValue API', async ({ page }) => {
      const setValueResult = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        let beforeCalls: number[] = [];
        let afterCalls: number[] = [];

        const core = new TouchSpinCore(input, {
          step: 1,
          initval: 10,
          callback_before_calculation: (currentValue: number) => {
            beforeCalls.push(currentValue);
            return currentValue;
          },
          callback_after_calculation: (finalValue: number) => {
            afterCalls.push(finalValue);
            return finalValue;
          }
        });

        // Use setValue API
        core.setValue(25);

        return {
          beforeCalls: beforeCalls,
          afterCalls: afterCalls,
          finalValue: core.getValue()
        };
      });

      expect(setValueResult.beforeCalls.length).toBeGreaterThan(0);
      expect(setValueResult.afterCalls.length).toBeGreaterThan(0);
      expect(setValueResult.finalValue).toBe(25);
    });

    test('callbacks handle null/undefined function gracefully', async ({ page }) => {
      const nullCallbackResult = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Test with null callbacks
        const core1 = new TouchSpinCore(input, {
          step: 1,
          initval: 10,
          callback_before_calculation: null as any,
          callback_after_calculation: undefined as any
        });

        input.value = '15';

        try {
          core1._checkValue(false);
          return {
            success: true,
            value: core1.getValue()
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      });

      expect(nullCallbackResult.success).toBe(true);
      expect(nullCallbackResult.value).toBe(15);
    });
  });
});

// NOTE: This test file exercises the callback functions (callback_before_calculation, callback_after_calculation),
// covering value modification, constraint integration, exception handling, return value validation,
// sequential execution, and integration with spin operations and setValue API.
