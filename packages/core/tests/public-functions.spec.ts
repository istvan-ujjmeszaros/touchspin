import { test, expect } from '@playwright/test';
import * as apiHelpers from '../../../__tests__/helpers/touchspinApiHelpers';

test.describe('Core TouchSpin Public Functions', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await apiHelpers.waitForCoreTestReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'core-public-functions');
  });

  test.describe('attach() Function', () => {
    test('attach function creates TouchSpinCore instance', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { attach } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const core = attach(input, {
          step: 1,
          initval: 50
        });

        return {
          isInstance: core && typeof core === 'object',
          hasUpOnce: typeof core?.upOnce === 'function',
          hasDownOnce: typeof core?.downOnce === 'function',
          hasGetValue: typeof core?.getValue === 'function',
          hasSetValue: typeof core?.setValue === 'function',
          initialValue: core?.getValue()
        };
      });

      expect(result.isInstance).toBe(true);
      expect(result.hasUpOnce).toBe(true);
      expect(result.hasDownOnce).toBe(true);
      expect(result.hasGetValue).toBe(true);
      expect(result.hasSetValue).toBe(true);
      expect(result.initialValue).toBe(50);
    });

    test('attach function with null options uses empty object', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { attach } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Pass null as options - should use empty object
        const core = attach(input, null as any);

        return {
          success: core !== null,
          hasSettings: core && typeof core.settings === 'object'
        };
      });

      expect(result.success).toBe(true);
      expect(result.hasSettings).toBe(true);
    });

    test('attach function with undefined options uses empty object', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { attach } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Pass undefined as options - should use empty object
        const core = attach(input, undefined);

        return {
          success: core !== null,
          value: core?.getValue()
        };
      });

      expect(result.success).toBe(true);
      expect(typeof result.value).toBe('number');
    });

    test('attach function returns actual TouchSpinCore instance', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { attach, TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const core = attach(input, { step: 2 });

        return {
          isCore: core instanceof TouchSpinCore,
          canUpOnce: typeof core?.upOnce === 'function',
          settingsAccessible: core?.settings?.step === 2
        };
      });

      expect(result.isCore).toBe(true);
      expect(result.canUpOnce).toBe(true);
      expect(result.settingsAccessible).toBe(true);
    });
  });

  test.describe('createPublicApi() Deprecated Function', () => {
    test('createPublicApi function creates public API', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { createPublicApi } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const api = createPublicApi(input, {
          step: 1,
          initval: 25
        });

        return {
          isObject: api && typeof api === 'object',
          hasUpOnce: typeof api?.upOnce === 'function',
          hasDownOnce: typeof api?.downOnce === 'function',
          hasGetValue: typeof api?.getValue === 'function',
          hasSetValue: typeof api?.setValue === 'function',
          hasDestroy: typeof api?.destroy === 'function',
          hasOn: typeof api?.on === 'function',
          initialValue: api?.getValue()
        };
      });

      expect(result.isObject).toBe(true);
      expect(result.hasUpOnce).toBe(true);
      expect(result.hasDownOnce).toBe(true);
      expect(result.hasGetValue).toBe(true);
      expect(result.hasSetValue).toBe(true);
      expect(result.hasDestroy).toBe(true);
      expect(result.hasOn).toBe(true);
      expect(result.initialValue).toBe(25);
    });

    test('createPublicApi function is equivalent to TouchSpin function', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { createPublicApi, TouchSpin } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input1 = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const input2 = document.createElement('input');
        input2.setAttribute('data-testid', 'test-input-2');
        document.body.appendChild(input2);

        const api1 = createPublicApi(input1, { step: 1, initval: 10 });
        const api2 = TouchSpin(input2, { step: 1, initval: 10 });

        return {
          api1Type: typeof api1,
          api2Type: typeof api2,
          api1HasMethods: api1 && typeof api1.upOnce === 'function' && typeof api1.getValue === 'function',
          api2HasMethods: api2 && typeof api2.upOnce === 'function' && typeof api2.getValue === 'function',
          api1Value: api1?.getValue(),
          api2Value: api2?.getValue()
        };
      });

      expect(result.api1Type).toBe(result.api2Type);
      expect(result.api1HasMethods).toBe(true);
      expect(result.api2HasMethods).toBe(true);
      expect(result.api1Value).toBe(result.api2Value);
    });

    test('createPublicApi function with null options', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { createPublicApi } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const api = createPublicApi(input, null as any);

        return {
          success: api !== null,
          canGetValue: typeof api?.getValue === 'function'
        };
      });

      expect(result.success).toBe(true);
      expect(result.canGetValue).toBe(true);
    });
  });

  test.describe('getTouchSpin() Function', () => {
    test('getTouchSpin retrieves existing instance', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpin, getTouchSpin } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // First create an instance
        const api1 = TouchSpin(input, { step: 1, initval: 42 });

        // Then retrieve it
        const api2 = getTouchSpin(input);

        return {
          api1Exists: api1 !== null,
          api2Exists: api2 !== null,
          bothHaveGetValue: api1 && api2 && typeof api1.getValue === 'function' && typeof api2.getValue === 'function',
          sameValue: api1?.getValue() === api2?.getValue(),
          value: api2?.getValue()
        };
      });

      expect(result.api1Exists).toBe(true);
      expect(result.api2Exists).toBe(true);
      expect(result.bothHaveGetValue).toBe(true);
      expect(result.sameValue).toBe(true);
      expect(result.value).toBe(42);
    });

    test('getTouchSpin returns null for non-initialized input', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { getTouchSpin } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Don't initialize TouchSpin, just try to retrieve it
        const api = getTouchSpin(input);

        return {
          isNull: api === null
        };
      });

      expect(result.isNull).toBe(true);
    });

    test('getTouchSpin retrieves instance after destruction returns null', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpin, getTouchSpin } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Create instance
        const api1 = TouchSpin(input, { step: 1, initval: 10 });
        const beforeDestroy = getTouchSpin(input);

        // Destroy it
        api1?.destroy();

        // Try to retrieve after destruction
        const afterDestroy = getTouchSpin(input);

        return {
          beforeDestroyExists: beforeDestroy !== null,
          afterDestroyExists: afterDestroy !== null
        };
      });

      expect(result.beforeDestroyExists).toBe(true);
      expect(result.afterDestroyExists).toBe(false); // Should be null after destroy
    });

    test('getTouchSpin works with multiple instances', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpin, getTouchSpin } = await import('http://localhost:8866/packages/core/dist/index.js');

        // Create multiple inputs
        const input1 = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const input2 = document.createElement('input');
        input2.setAttribute('data-testid', 'test-input-2');
        document.body.appendChild(input2);

        // Initialize both
        const api1 = TouchSpin(input1, { step: 1, initval: 10 });
        const api2 = TouchSpin(input2, { step: 2, initval: 20 });

        // Retrieve both
        const retrieved1 = getTouchSpin(input1);
        const retrieved2 = getTouchSpin(input2);

        return {
          retrieved1Value: retrieved1?.getValue(),
          retrieved2Value: retrieved2?.getValue(),
          differentInstances: retrieved1 !== retrieved2
        };
      });

      expect(result.retrieved1Value).toBe(10);
      expect(result.retrieved2Value).toBe(20);
      expect(result.differentInstances).toBe(true);
    });
  });

  test.describe('CORE_EVENTS Constant', () => {
    test('CORE_EVENTS constant exports all expected events', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { CORE_EVENTS } = await import('http://localhost:8866/packages/core/dist/index.js');

        return {
          hasMin: CORE_EVENTS.MIN === 'min',
          hasMax: CORE_EVENTS.MAX === 'max',
          hasStartSpin: CORE_EVENTS.START_SPIN === 'startspin',
          hasStartUp: CORE_EVENTS.START_UP === 'startupspin',
          hasStartDown: CORE_EVENTS.START_DOWN === 'startdownspin',
          hasStopSpin: CORE_EVENTS.STOP_SPIN === 'stopspin',
          hasStopUp: CORE_EVENTS.STOP_UP === 'stopupspin',
          hasStopDown: CORE_EVENTS.STOP_DOWN === 'stopdownspin',
          isFrozen: Object.isFrozen(CORE_EVENTS)
        };
      });

      expect(result.hasMin).toBe(true);
      expect(result.hasMax).toBe(true);
      expect(result.hasStartSpin).toBe(true);
      expect(result.hasStartUp).toBe(true);
      expect(result.hasStartDown).toBe(true);
      expect(result.hasStopSpin).toBe(true);
      expect(result.hasStopUp).toBe(true);
      expect(result.hasStopDown).toBe(true);
      expect(result.isFrozen).toBe(true); // Should be frozen
    });

    test('CORE_EVENTS can be used to subscribe to events', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpin, CORE_EVENTS } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const api = TouchSpin(input, { step: 1, min: 0, max: 10, initval: 5 });

        let minEventFired = false;
        let maxEventFired = false;

        // Use CORE_EVENTS constants
        api?.on(CORE_EVENTS.MIN, () => { minEventFired = true; });
        api?.on(CORE_EVENTS.MAX, () => { maxEventFired = true; });

        // Trigger events
        api?.setValue(0); // Should trigger min event
        api?.setValue(10); // Should trigger max event

        return {
          minEventFired: minEventFired,
          maxEventFired: maxEventFired
        };
      });

      expect(result.minEventFired).toBe(true);
      expect(result.maxEventFired).toBe(true);
    });
  });

  test.describe('Main TouchSpin() Function', () => {
    test('TouchSpin function creates and returns public API', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpin } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const api = TouchSpin(input, { step: 1, initval: 15 });

        return {
          isObject: api && typeof api === 'object',
          hasUpOnce: typeof api?.upOnce === 'function',
          hasDownOnce: typeof api?.downOnce === 'function',
          hasStartUpSpin: typeof api?.startUpSpin === 'function',
          hasStopSpin: typeof api?.stopSpin === 'function',
          hasGetValue: typeof api?.getValue === 'function',
          hasSetValue: typeof api?.setValue === 'function',
          hasUpdateSettings: typeof api?.updateSettings === 'function',
          hasDestroy: typeof api?.destroy === 'function',
          hasOn: typeof api?.on === 'function',
          hasOff: typeof api?.off === 'function',
          initialValue: api?.getValue()
        };
      });

      expect(result.isObject).toBe(true);
      expect(result.hasUpOnce).toBe(true);
      expect(result.hasDownOnce).toBe(true);
      expect(result.hasStartUpSpin).toBe(true);
      expect(result.hasStopSpin).toBe(true);
      expect(result.hasGetValue).toBe(true);
      expect(result.hasSetValue).toBe(true);
      expect(result.hasUpdateSettings).toBe(true);
      expect(result.hasDestroy).toBe(true);
      expect(result.hasOn).toBe(true);
      expect(result.hasOff).toBe(true);
      expect(result.initialValue).toBe(15);
    });

    test('TouchSpin function returns null on error', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpin } = await import('http://localhost:8866/packages/core/dist/index.js');

        try {
          // Pass null as input element (invalid)
          const api = TouchSpin(null as any, { step: 1 });
          return {
            success: false,
            result: api
          };
        } catch (error) {
          return {
            success: true,
            error: error.message,
            result: null
          };
        }
      });

      // Should handle invalid input gracefully (either return null or throw)
      expect(result.success || result.result === null).toBe(true);
    });

    test('TouchSpin function works with no options', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpin } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const api = TouchSpin(input); // No options provided

        return {
          success: api !== null,
          canGetValue: typeof api?.getValue === 'function',
          value: api?.getValue()
        };
      });

      expect(result.success).toBe(true);
      expect(result.canGetValue).toBe(true);
      expect(typeof result.value).toBe('number');
    });

    test('TouchSpin function with null options', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpin } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const api = TouchSpin(input, null as any);

        return {
          success: api !== null,
          hasFunction: typeof api?.upOnce === 'function'
        };
      });

      expect(result.success).toBe(true);
      expect(result.hasFunction).toBe(true);
    });
  });

  test.describe('Default Export', () => {
    test('default export is TouchSpinCore class', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const TouchSpinCore = (await import('http://localhost:8866/packages/core/dist/index.js')).default;
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Check it's a constructor function/class
        const isFunction = typeof TouchSpinCore === 'function';
        const hasPrototype = TouchSpinCore && typeof TouchSpinCore.prototype === 'object';

        let instance = null;
        try {
          instance = new TouchSpinCore(input, { step: 1, initval: 30 });
        } catch (error) {
          // Handle any construction errors
        }

        return {
          isFunction: isFunction,
          hasPrototype: hasPrototype,
          canInstantiate: instance !== null,
          instanceValue: instance?.getValue()
        };
      });

      expect(result.isFunction).toBe(true);
      expect(result.hasPrototype).toBe(true);
      expect(result.canInstantiate).toBe(true);
      expect(result.instanceValue).toBe(30);
    });
  });

  test.describe('Function Integration', () => {
    test('all public functions work together', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpin, getTouchSpin, attach, createPublicApi, CORE_EVENTS } =
          await import('http://localhost:8866/packages/core/dist/index.js');

        // Create inputs
        const input1 = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const input2 = document.createElement('input');
        const input3 = document.createElement('input');
        const input4 = document.createElement('input');
        input2.setAttribute('data-testid', 'test-input-2');
        input3.setAttribute('data-testid', 'test-input-3');
        input4.setAttribute('data-testid', 'test-input-4');
        document.body.appendChild(input2);
        document.body.appendChild(input3);
        document.body.appendChild(input4);

        // Use different functions
        const api1 = TouchSpin(input1, { step: 1, initval: 10 });
        const api2 = getTouchSpin(input1); // Should retrieve same instance
        const core3 = attach(input3, { step: 2, initval: 20 });
        const api4 = createPublicApi(input4, { step: 3, initval: 30 });

        return {
          api1Value: api1?.getValue(),
          api2Value: api2?.getValue(),
          api1EqualsApi2: api1 === api2,
          core3Value: core3?.getValue(),
          api4Value: api4?.getValue(),
          allHaveUpOnce: (
            typeof api1?.upOnce === 'function' &&
            typeof api2?.upOnce === 'function' &&
            typeof core3?.upOnce === 'function' &&
            typeof api4?.upOnce === 'function'
          ),
          eventConstantExists: typeof CORE_EVENTS.MIN === 'string'
        };
      });

      expect(result.api1Value).toBe(10);
      expect(result.api2Value).toBe(10);
      expect(result.api1EqualsApi2).toBe(true); // Should be same instance
      expect(result.core3Value).toBe(20);
      expect(result.api4Value).toBe(30);
      expect(result.allHaveUpOnce).toBe(true);
      expect(result.eventConstantExists).toBe(true);
    });
  });
});

// NOTE: This test file exercises the exported public functions (attach, createPublicApi, getTouchSpin, TouchSpin),
// the CORE_EVENTS constant, and the default export, covering function creation, instance retrieval,
// deprecated function equivalence, event constants usage, and integration between all public functions.
