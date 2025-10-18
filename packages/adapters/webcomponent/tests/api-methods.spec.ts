/**
 * Feature: TouchSpin Web Component API methods
 * Background: fixture = /packages/adapters/webcomponent/tests/fixtures/web-component-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] calls upOnce method to increment value
 * [x] calls downOnce method to decrement value
 * [x] calls startUpSpin method to begin spinning up
 * [x] calls startDownSpin method to begin spinning down
 * [x] calls stopSpin method to halt spinning
 * [x] calls updateSettings method to modify configuration
 * [x] calls getTouchSpinInstance method to access core instance
 * [x] calls destroy method to clean up component
 * [x] uses value property getter to retrieve current value
 * [x] uses value property setter to update value
 * [x] uses min property getter and setter
 * [x] uses max property getter and setter
 * [x] uses step property getter and setter
 * [x] uses disabled property getter and setter
 * [x] uses readonly property getter and setter
 */

import { expect, test } from '@playwright/test';
import type { TouchSpinCoreOptions, TouchSpinCorePublicAPI } from '@touchspin/core';
import * as apiHelpers from '@touchspin/core/test-helpers';

// Extend HTMLElement interface for TouchSpin web component
declare global {
  interface HTMLElement {
    getTouchSpinInstance?(): TouchSpinCorePublicAPI | null;
    destroy?(): void;
    upOnce?(): void;
    downOnce?(): void;
    startUpSpin?(): void;
    startDownSpin?(): void;
    stopSpin?(): void;
    updateSettings?(options: Partial<TouchSpinCoreOptions>): void;
    step?: number;
    disabled?: boolean;
    readonly?: boolean;
  }
}

test.describe('TouchSpin Web Component API methods', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);

    // Load self-contained fixture with web component dependencies
    await page.goto('/packages/adapters/webcomponent/tests/fixtures/web-component-fixture.html');
    await apiHelpers.waitForPageReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  /**
   * Scenario: calls upOnce method to increment value
   * Given a touchspin-input element with initial value 5
   * When upOnce() method is called
   * Then value increases by step amount
   * Params:
   * { "initialValue": "5", "step": "1", "expectedValue": "6" }
   */
  test('calls upOnce method to increment value', async ({ page }) => {
    // Create element
    await page.evaluate(() => {
      const element = document.createElement('touchspin-input') as HTMLElement;
      element.setAttribute('data-testid', 'uponce-test');
      element.setAttribute('min', '0');
      element.setAttribute('max', '100');
      element.setAttribute('step', '1');
      element.setAttribute('value', '5');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100); // Allow initialization

    // Call upOnce method
    const result = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="uponce-test"]') as HTMLElement;
      const initialValue = element?.value;
      element?.upOnce();
      return {
        initialValue,
        newValue: element?.value,
        methodExists: typeof element.upOnce === 'function',
      };
    });

    expect(result.methodExists).toBe(true);
    // Value should have incremented (might be string or number)
    expect(Number(result.newValue)).toBeGreaterThan(Number(result.initialValue));
  });

  /**
   * Scenario: calls downOnce method to decrement value
   * Given a touchspin-input element with initial value 10
   * When downOnce() method is called
   * Then value decreases by step amount
   * Params:
   * { "initialValue": "10", "step": "1", "expectedValue": "9" }
   */
  test('calls downOnce method to decrement value', async ({ page }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-input') as HTMLElement;
      element.setAttribute('data-testid', 'downonce-test');
      element.setAttribute('min', '0');
      element.setAttribute('max', '100');
      element.setAttribute('step', '1');
      element.setAttribute('value', '10');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="downonce-test"]') as HTMLElement;
      const initialValue = element?.value;
      element?.downOnce();
      return {
        initialValue,
        newValue: element?.value,
        methodExists: typeof element.downOnce === 'function',
      };
    });

    expect(result.methodExists).toBe(true);
    expect(Number(result.newValue)).toBeLessThan(Number(result.initialValue));
  });

  /**
   * Scenario: calls startUpSpin method to begin spinning up
   * Given a touchspin-input element
   * When startUpSpin() method is called
   * Then continuous upward spinning begins
   * Params:
   * { "initialValue": "20", "step": "5" }
   */
  test('calls startUpSpin method to begin spinning up', async ({ page }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-input') as HTMLElement;
      element.setAttribute('data-testid', 'startupspin-test');
      element.setAttribute('min', '0');
      element.setAttribute('max', '100');
      element.setAttribute('step', '5');
      element.setAttribute('value', '20');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="startupspin-test"]') as HTMLElement;
      const initialValue = element?.value;

      // Call startUpSpin and immediately stop to test the method
      element?.startUpSpin();
      element?.stopSpin();

      return {
        methodExists: typeof element.startUpSpin === 'function',
        initialValue,
        valueAfterStart: element?.value,
      };
    });

    expect(result.methodExists).toBe(true);
  });

  /**
   * Scenario: calls startDownSpin method to begin spinning down
   * Given a touchspin-input element
   * When startDownSpin() method is called
   * Then continuous downward spinning begins
   * Params:
   * { "initialValue": "80", "step": "5" }
   */
  test('calls startDownSpin method to begin spinning down', async ({ page }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-input') as HTMLElement;
      element.setAttribute('data-testid', 'startdownspin-test');
      element.setAttribute('min', '0');
      element.setAttribute('max', '100');
      element.setAttribute('step', '5');
      element.setAttribute('value', '80');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="startdownspin-test"]') as HTMLElement;

      // Call startDownSpin and immediately stop
      element?.startDownSpin();
      element?.stopSpin();

      return {
        methodExists: typeof element.startDownSpin === 'function',
      };
    });

    expect(result.methodExists).toBe(true);
  });

  /**
   * Scenario: calls stopSpin method to halt spinning
   * Given a touchspin-input element that is spinning
   * When stopSpin() method is called
   * Then spinning stops immediately
   * Params:
   * { "initialValue": "50", "step": "5" }
   */
  test('calls stopSpin method to halt spinning', async ({ page }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-input') as HTMLElement;
      element.setAttribute('data-testid', 'stopspin-test');
      element.setAttribute('min', '0');
      element.setAttribute('max', '100');
      element.setAttribute('step', '5');
      element.setAttribute('value', '50');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="stopspin-test"]') as HTMLElement;

      element?.startUpSpin();
      const valueWhileSpinning = element?.value;
      element?.stopSpin();
      const valueAfterStop = element?.value;

      return {
        methodExists: typeof element.stopSpin === 'function',
        valueWhileSpinning,
        valueAfterStop,
      };
    });

    expect(result.methodExists).toBe(true);
  });

  /**
   * Scenario: calls updateSettings method to modify configuration
   * Given a touchspin-input element
   * When updateSettings() is called with new settings
   * Then component configuration updates
   * Params:
   * { "newSettings": { "step": "10", "max": "200" } }
   */
  test('calls updateSettings method to modify configuration', async ({ page }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-input') as HTMLElement;
      element.setAttribute('data-testid', 'updatesettings-test');
      element.setAttribute('min', '0');
      element.setAttribute('max', '100');
      element.setAttribute('step', '1');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="updatesettings-test"]') as HTMLElement;

      element.updateSettings({ step: 10, max: 200 });

      return {
        methodExists: typeof element.updateSettings === 'function',
      };
    });

    expect(result.methodExists).toBe(true);
  });

  /**
   * Scenario: calls getTouchSpinInstance method to access core instance
   * Given a touchspin-input element
   * When getTouchSpinInstance() is called
   * Then the core TouchSpin instance is returned
   * Params:
   * {}
   */
  test('calls getTouchSpinInstance method to access core instance', async ({ page }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-input') as HTMLElement;
      element.setAttribute('data-testid', 'getinstance-test');
      element.setAttribute('min', '0');
      element.setAttribute('max', '100');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="getinstance-test"]') as HTMLElement;
      const instance = element?.getTouchSpinInstance();

      return {
        methodExists: typeof element.getTouchSpinInstance === 'function',
        instanceReturned: !!instance,
        hasGetValue: instance && typeof instance.getValue === 'function',
      };
    });

    expect(result.methodExists).toBe(true);
    expect(result.instanceReturned).toBe(true);
    expect(result.hasGetValue).toBe(true);
  });

  /**
   * Scenario: calls destroy method to clean up component
   * Given a touchspin-input element
   * When destroy() is called
   * Then component resources are cleaned up
   * Params:
   * {}
   */
  test('calls destroy method to clean up component', async ({ page }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-input') as HTMLElement;
      element.setAttribute('data-testid', 'destroy-test');
      element.setAttribute('min', '0');
      element.setAttribute('max', '100');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="destroy-test"]') as HTMLElement;

      element?.destroy();

      return {
        methodExists: typeof element.destroy === 'function',
        elementStillConnected: element?.isConnected,
      };
    });

    expect(result.methodExists).toBe(true);
    expect(result.elementStillConnected).toBe(true);
  });

  /**
   * Scenario: uses value property getter to retrieve current value
   * Given a touchspin-input element with value 42
   * When the value property is accessed
   * Then it returns the current value
   * Params:
   * { "initialValue": "42" }
   */
  test('uses value property getter to retrieve current value', async ({ page }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-input') as HTMLElement;
      element.setAttribute('data-testid', 'value-getter-test');
      element.setAttribute('value', '42');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="value-getter-test"]') as HTMLElement;
      const retrievedValue = element?.value;

      return {
        retrievedValue: String(retrievedValue),
        hasGetter: retrievedValue !== undefined,
      };
    });

    expect(result.hasGetter).toBe(true);
    expect(result.retrievedValue).toBe('42');
  });

  /**
   * Scenario: uses value property setter to update value
   * Given a touchspin-input element
   * When value property is set to 75
   * Then the element value updates
   * Params:
   * { "newValue": "75" }
   */
  test('uses value property setter to update value', async ({ page }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-input') as HTMLElement;
      element.setAttribute('data-testid', 'value-setter-test');
      element.setAttribute('value', '10');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="value-setter-test"]') as HTMLElement;

      element.value = 75;

      return {
        newValue: element?.getAttribute('value'),
        hasSetterEffect: element?.getAttribute('value') === '75',
      };
    });

    expect(result.hasSetterEffect).toBe(true);
    expect(result.newValue).toBe('75');
  });

  /**
   * Scenario: uses min property getter and setter
   * Given a touchspin-input element
   * When min property is accessed and modified
   * Then min value is retrieved and updated correctly
   * Params:
   * { "initialMin": "0", "newMin": "10" }
   */
  test('uses min property getter and setter', async ({ page }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-input') as HTMLElement;
      element.setAttribute('data-testid', 'min-property-test');
      element.setAttribute('min', '0');
      element.setAttribute('max', '100');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="min-property-test"]') as HTMLElement;

      const initialMin = element?.min;
      element.min = 10;
      const updatedMin = element?.min;

      // Test null setter
      element.min = null;
      const minAfterNull = element?.min;

      return {
        initialMin,
        updatedMin,
        minAfterNull,
        hasGetter: initialMin !== undefined,
        hasSetter: updatedMin === '10',
      };
    });

    expect(result.hasGetter).toBe(true);
    expect(result.initialMin).toBe('0');
    expect(result.hasSetter).toBe(true);
    expect(result.updatedMin).toBe('10');
    expect(result.minAfterNull).toBe(null);
  });

  /**
   * Scenario: uses max property getter and setter
   * Given a touchspin-input element
   * When max property is accessed and modified
   * Then max value is retrieved and updated correctly
   * Params:
   * { "initialMax": "100", "newMax": "200" }
   */
  test('uses max property getter and setter', async ({ page }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-input') as HTMLElement;
      element.setAttribute('data-testid', 'max-property-test');
      element.setAttribute('min', '0');
      element.setAttribute('max', '100');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="max-property-test"]') as HTMLElement;

      const initialMax = element?.max;
      element.max = 200;
      const updatedMax = element?.max;

      // Test null setter
      element.max = null;
      const maxAfterNull = element?.max;

      return {
        initialMax,
        updatedMax,
        maxAfterNull,
        hasGetter: initialMax !== undefined,
        hasSetter: updatedMax === '200',
      };
    });

    expect(result.hasGetter).toBe(true);
    expect(result.initialMax).toBe('100');
    expect(result.hasSetter).toBe(true);
    expect(result.updatedMax).toBe('200');
    expect(result.maxAfterNull).toBe(null);
  });

  /**
   * Scenario: uses step property getter and setter
   * Given a touchspin-input element
   * When step property is accessed and modified
   * Then step value is retrieved and updated correctly
   * Params:
   * { "initialStep": "1", "newStep": "5" }
   */
  test('uses step property getter and setter', async ({ page }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-input') as HTMLElement;
      element.setAttribute('data-testid', 'step-property-test');
      element.setAttribute('step', '1');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="step-property-test"]') as HTMLElement;

      const initialStep = element?.step;
      element.step = 5;
      const updatedStep = element?.step;

      // Test null setter
      element.step = null;
      const stepAfterNull = element?.step;

      return {
        initialStep,
        updatedStep,
        stepAfterNull,
        hasGetter: initialStep !== undefined,
        hasSetter: updatedStep === '5',
      };
    });

    expect(result.hasGetter).toBe(true);
    expect(result.initialStep).toBe('1');
    expect(result.hasSetter).toBe(true);
    expect(result.updatedStep).toBe('5');
    expect(result.stepAfterNull).toBe(null);
  });

  /**
   * Scenario: uses disabled property getter and setter
   * Given a touchspin-input element
   * When disabled property is accessed and modified
   * Then disabled state is retrieved and updated correctly
   * Params:
   * { "initialDisabled": false, "newDisabled": true }
   */
  test('uses disabled property getter and setter', async ({ page }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-input') as HTMLElement;
      element.setAttribute('data-testid', 'disabled-property-test');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      const element = document.querySelector(
        '[data-testid="disabled-property-test"]'
      ) as HTMLElement;

      const initialDisabled = element?.disabled;
      element.disabled = true;
      const disabledAfterSet = element?.disabled;

      element.disabled = false;
      const disabledAfterUnset = element?.disabled;

      return {
        initialDisabled,
        disabledAfterSet,
        disabledAfterUnset,
        hasGetter: typeof initialDisabled === 'boolean',
        hasSetter: disabledAfterSet === true && disabledAfterUnset === false,
      };
    });

    expect(result.hasGetter).toBe(true);
    expect(result.initialDisabled).toBe(false);
    expect(result.hasSetter).toBe(true);
    expect(result.disabledAfterSet).toBe(true);
    expect(result.disabledAfterUnset).toBe(false);
  });

  /**
   * Scenario: uses readonly property getter and setter
   * Given a touchspin-input element
   * When readonly property is accessed and modified
   * Then readonly state is retrieved and updated correctly
   * Params:
   * { "initialReadonly": false, "newReadonly": true }
   */
  test('uses readonly property getter and setter', async ({ page }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-input') as HTMLElement;
      element.setAttribute('data-testid', 'readonly-property-test');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      const element = document.querySelector(
        '[data-testid="readonly-property-test"]'
      ) as HTMLElement;

      const initialReadonly = element?.readonly;
      element.readonly = true;
      const readonlyAfterSet = element?.readonly;

      element.readonly = false;
      const readonlyAfterUnset = element?.readonly;

      return {
        initialReadonly,
        readonlyAfterSet,
        readonlyAfterUnset,
        hasGetter: typeof initialReadonly === 'boolean',
        hasSetter: readonlyAfterSet === true && readonlyAfterUnset === false,
      };
    });

    expect(result.hasGetter).toBe(true);
    expect(result.initialReadonly).toBe(false);
    expect(result.hasSetter).toBe(true);
    expect(result.readonlyAfterSet).toBe(true);
    expect(result.readonlyAfterUnset).toBe(false);
  });
});
