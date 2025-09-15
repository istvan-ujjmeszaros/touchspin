/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../__tests__/helpers/touchspinHelpers';

test.describe('jQuery TouchSpin Commands API', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/packages/jquery-plugin/tests/html/commands.html');

    // Wait for TouchSpin to be ready
    await page.waitForFunction(() => (window as any).touchSpinReady === true);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'jquery-commands');
  });

  test.describe('Value Operations', () => {

    test('should get value using "get" command', async ({ page }) => {
      const testId = 'value-test';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Get value using 'get' command
      const value = await page.evaluate((id) => {
        return (window as any).$(`#${id}`).TouchSpin('get');
      }, testId);

      expect(value).toBe('50');
    });

    test('should get value using "getvalue" command (alias)', async ({ page }) => {
      const testId = 'value-test';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Get value using 'getvalue' command (alias)
      const value = await page.evaluate((id) => {
        return (window as any).$(`#${id}`).TouchSpin('getvalue');
      }, testId);

      expect(value).toBe('50');
    });

    test('should get raw value even without TouchSpin instance', async ({ page }) => {
      const testId = 'non-init-test';

      // Get value without initializing TouchSpin
      const value = await page.evaluate((id) => {
        return (window as any).$(`#${id}`).TouchSpin('get');
      }, testId);

      expect(value).toBe('42');
    });

    test('should set value using "set" command', async ({ page }) => {
      const testId = 'value-test';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Set value using 'set' command
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('set', 75);
      }, testId);

      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('75');
    });

    test('should set value using "setvalue" command (alias)', async ({ page }) => {
      const testId = 'value-test';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Set value using 'setvalue' command (alias)
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('setvalue', 25);
      }, testId);

      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('25');
    });

    test('should respect min/max boundaries when setting value', async ({ page }) => {
      const testId = 'boundaries-test';

      // Initialize with boundaries
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 10, max: 90 });
      }, testId);

      // Try to set value below minimum
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('set', 5);
      }, testId);

      let value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('10'); // Should be clamped to min

      // Try to set value above maximum
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('set', 100);
      }, testId);

      value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('90'); // Should be clamped to max
    });
  });

  test.describe('Increment/Decrement', () => {

    test('should increment value using "uponce" command', async ({ page }) => {
      const testId = 'increment-test';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100, step: 5 });
      }, testId);

      // Increment once
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('uponce');
      }, testId);

      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('15'); // 10 + 5
    });

    test('should decrement value using "downonce" command', async ({ page }) => {
      const testId = 'increment-test';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100, step: 3 });
      }, testId);

      // Decrement once
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('downonce');
      }, testId);

      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('7'); // 10 - 3
    });

    test('should not increment beyond max', async ({ page }) => {
      const testId = 'boundaries-test';

      // Initialize with value near max
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 52, step: 5 });
      }, testId);

      // Increment once
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('uponce');
      }, testId);

      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('52'); // Should stop at max
    });

    test('should not decrement below min', async ({ page }) => {
      const testId = 'boundaries-test';

      // Initialize with value near min
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 48, max: 100, step: 5 });
      }, testId);

      // Decrement once
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('downonce');
      }, testId);

      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('48'); // Should stop at min
    });
  });

  test.describe('Continuous Spinning', () => {

    test('should start and stop continuous increment using "startupspin"', async ({ page }) => {
      const testId = 'spin-test';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 200, step: 10 });
      }, testId);

      const initialValue = await touchspinHelpers.readInputValue(page, testId);

      // Start continuous increment
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('startupspin');
      }, testId);

      // Wait for spinning
      await touchspinHelpers.waitForTimeout(touchspinHelpers.TOUCHSPIN_EVENT_WAIT);

      // Stop spinning
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('stopspin');
      }, testId);

      const finalValue = await touchspinHelpers.readInputValue(page, testId);
      expect(parseInt(finalValue)).toBeGreaterThan(parseInt(initialValue));
    });

    test('should start and stop continuous decrement using "startdownspin"', async ({ page }) => {
      const testId = 'spin-test';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 200, step: 10 });
      }, testId);

      const initialValue = await touchspinHelpers.readInputValue(page, testId);

      // Start continuous decrement
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('startdownspin');
      }, testId);

      // Wait for spinning
      await touchspinHelpers.waitForTimeout(touchspinHelpers.TOUCHSPIN_EVENT_WAIT);

      // Stop spinning
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('stopspin');
      }, testId);

      const finalValue = await touchspinHelpers.readInputValue(page, testId);
      expect(parseInt(finalValue)).toBeLessThan(parseInt(initialValue));
    });

    test('should stop at max during continuous increment', async ({ page }) => {
      const testId = 'spin-test';

      // Initialize with value near max
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 105, step: 10 });
      }, testId);

      // Start continuous increment
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('startupspin');
      }, testId);

      // Wait long enough to hit max
      await touchspinHelpers.waitForTimeout(1000);

      // Stop spinning
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('stopspin');
      }, testId);

      const finalValue = await touchspinHelpers.readInputValue(page, testId);
      expect(finalValue).toBe('105'); // Should stop at max
    });

    test('should stop at min during continuous decrement', async ({ page }) => {
      const testId = 'spin-test';

      // Initialize with value near min
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 95, max: 200, step: 10 });
      }, testId);

      // Start continuous decrement
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('startdownspin');
      }, testId);

      // Wait long enough to hit min
      await touchspinHelpers.waitForTimeout(1000);

      // Stop spinning
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('stopspin');
      }, testId);

      const finalValue = await touchspinHelpers.readInputValue(page, testId);
      expect(finalValue).toBe('95'); // Should stop at min
    });
  });

  test.describe('Settings Update', () => {

    test('should update settings dynamically using "updatesettings"', async ({ page }) => {
      const testId = 'settings-test';

      // Initialize with initial settings
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100, step: 5 });
      }, testId);

      // Update settings
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('updatesettings', {
          min: -50,
          max: 50,
          step: 10
        });
      }, testId);

      // Test new min
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('set', -30);
      }, testId);

      let value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('-30');

      // Test new max
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('set', 45);
      }, testId);

      value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('45');

      // Test new step
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('uponce');
      }, testId);

      value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('50'); // 45 + 10 = 55, but clamped to max 50
    });

    test('should update prefix and postfix', async ({ page }) => {
      const testId = 'settings-test';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Update prefix and postfix
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('updatesettings', {
          prefix: '$',
          postfix: ' USD'
        });
      }, testId);

      // Check that prefix exists
      const hasPrefix = await page.evaluate((id) => {
        const wrapper = document.querySelector(`#${id}`).closest('[data-touchspin-injected]');
        return wrapper?.querySelector('.bootstrap-touchspin-prefix')?.textContent === '$';
      }, testId);

      expect(hasPrefix).toBe(true);

      // Check that postfix exists
      const hasPostfix = await page.evaluate((id) => {
        const wrapper = document.querySelector(`#${id}`).closest('[data-touchspin-injected]');
        return wrapper?.querySelector('.bootstrap-touchspin-postfix')?.textContent === ' USD';
      }, testId);

      expect(hasPostfix).toBe(true);
    });

    test('should update decimals setting', async ({ page }) => {
      const testId = 'options-test';

      // Initialize with decimals
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({
          min: 0,
          max: 100,
          step: 0.25,
          decimals: 2
        });
      }, testId);

      // Update decimals
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('updatesettings', {
          decimals: 3,
          step: 0.125
        });
      }, testId);

      // Set a value with 3 decimals
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('set', 5.125);
      }, testId);

      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('5.125');
    });
  });

  test.describe('Lifecycle', () => {

    test('should destroy TouchSpin instance', async ({ page }) => {
      const testId = 'lifecycle-test';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Verify it's initialized
      let hasWrapper = await page.evaluate((id) => {
        const input = document.querySelector(`#${id}`);
        return input?.closest('[data-touchspin-injected]') !== null;
      }, testId);

      expect(hasWrapper).toBe(true);

      // Destroy TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('destroy');
      }, testId);

      // Verify it's destroyed
      hasWrapper = await page.evaluate((id) => {
        const input = document.querySelector(`#${id}`);
        return input?.closest('[data-touchspin-injected]') !== null;
      }, testId);

      expect(hasWrapper).toBe(false);
    });

    test('should reinitialize after destroy', async ({ page }) => {
      const testId = 'lifecycle-test';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100, step: 5 });
      }, testId);

      // Destroy it
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('destroy');
      }, testId);

      // Reinitialize with different settings
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: -50, max: 50, step: 10 });
      }, testId);

      // Verify new settings work
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('set', -20);
      }, testId);

      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('-20');
    });
  });

  test.describe('Case Insensitivity', () => {

    test('should accept commands in lowercase', async ({ page }) => {
      const testId = 'case-test';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Use lowercase command
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('uponce');
      }, testId);

      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('61');
    });

    test('should accept commands in uppercase', async ({ page }) => {
      const testId = 'case-test';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Use uppercase command
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('DOWNONCE');
      }, testId);

      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('59');
    });

    test('should accept commands in mixed case', async ({ page }) => {
      const testId = 'case-test';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Use mixed case commands
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('UpOnCe');
      }, testId);

      let value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('61');

      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('sEtVaLuE', 75);
      }, testId);

      value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('75');
    });
  });

  test.describe('Chaining Support', () => {

    test('should support jQuery method chaining', async ({ page }) => {
      const testId = 'chaining-test';

      // Test chaining multiple TouchSpin commands and jQuery methods
      const result = await page.evaluate((id) => {
        return (window as any).$(`#${id}`)
          .TouchSpin({ min: 0, max: 100 })
          .TouchSpin('set', 50)
          .TouchSpin('uponce')
          .addClass('test-class')
          .attr('data-test', 'chained')
          .TouchSpin('get');
      }, testId);

      expect(result).toBe('51');

      // Verify jQuery methods worked
      const hasClass = await page.evaluate((id) => {
        return (window as any).$(`#${id}`).hasClass('test-class');
      }, testId);

      expect(hasClass).toBe(true);

      const dataAttr = await page.evaluate((id) => {
        return (window as any).$(`#${id}`).attr('data-test');
      }, testId);

      expect(dataAttr).toBe('chained');
    });

    test('should chain multiple TouchSpin operations', async ({ page }) => {
      const testId = 'chaining-test';

      // Chain multiple operations
      await page.evaluate((id) => {
        (window as any).$(`#${id}`)
          .TouchSpin({ min: 0, max: 100, step: 5 })
          .TouchSpin('set', 25)
          .TouchSpin('uponce')
          .TouchSpin('uponce')
          .TouchSpin('downonce');
      }, testId);

      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('30'); // 25 + 5 + 5 - 5 = 30
    });
  });

  test.describe('Safe Command Handling', () => {

    test('should safely ignore commands on non-initialized inputs', async ({ page }) => {
      const testId = 'non-init-test';

      // Try commands on non-initialized input (should not throw)
      const noError = await page.evaluate((id) => {
        try {
          (window as any).$(`#${id}`).TouchSpin('uponce');
          (window as any).$(`#${id}`).TouchSpin('downonce');
          (window as any).$(`#${id}`).TouchSpin('stopspin');
          return true;
        } catch {
          return false;
        }
      }, testId);

      expect(noError).toBe(true);

      // Value should remain unchanged
      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('42');
    });

    test('should return raw value for get/getvalue on non-initialized inputs', async ({ page }) => {
      const testId = 'non-init-test';

      // Get value without initialization
      const getValue = await page.evaluate((id) => {
        return (window as any).$(`#${id}`).TouchSpin('get');
      }, testId);

      expect(getValue).toBe('42');

      const getValueAlias = await page.evaluate((id) => {
        return (window as any).$(`#${id}`).TouchSpin('getvalue');
      }, testId);

      expect(getValueAlias).toBe('42');
    });
  });

  test.describe('Options Initialization', () => {

    test('should initialize with decimal options', async ({ page }) => {
      const testId = 'options-test';

      // Initialize with decimals
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({
          min: 0,
          max: 10,
          step: 0.25,
          decimals: 2
        });
      }, testId);

      // Increment to test decimal handling
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('uponce');
      }, testId);

      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('5.75'); // 5.50 + 0.25
    });

    test('should initialize with prefix and postfix', async ({ page }) => {
      const testId = 'options-test';

      // Initialize with prefix/postfix
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({
          min: 0,
          max: 1000,
          prefix: '$',
          postfix: '.00'
        });
      }, testId);

      // Check prefix exists
      const hasPrefix = await page.evaluate((id) => {
        const wrapper = document.querySelector(`#${id}`).closest('[data-touchspin-injected]');
        return wrapper?.querySelector('.bootstrap-touchspin-prefix') !== null;
      }, testId);

      expect(hasPrefix).toBe(true);

      // Check postfix exists
      const hasPostfix = await page.evaluate((id) => {
        const wrapper = document.querySelector(`#${id}`).closest('[data-touchspin-injected]');
        return wrapper?.querySelector('.bootstrap-touchspin-postfix') !== null;
      }, testId);

      expect(hasPostfix).toBe(true);
    });

    test('should initialize with verticalbuttons option', async ({ page }) => {
      const testId = 'options-test';

      // Initialize with vertical buttons
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({
          min: 0,
          max: 100,
          verticalbuttons: true
        });
      }, testId);

      // Check for vertical button wrapper
      const hasVerticalButtons = await page.evaluate((id) => {
        const wrapper = document.querySelector(`#${id}`).closest('[data-touchspin-injected]');
        return wrapper?.querySelector('.bootstrap-touchspin-vertical-button-wrapper') !== null;
      }, testId);

      expect(hasVerticalButtons).toBe(true);
    });
  });
});