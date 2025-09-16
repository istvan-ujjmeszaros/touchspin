/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../../__tests__/helpers/touchspinHelpers';

test.describe('jQuery TouchSpin Commands API', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    // Reload page for each test to ensure clean state
    await page.goto('http://localhost:8866/packages/jquery-plugin/tests/html/test-fixture.html');
    await page.waitForFunction(() => (window as any).testPageReady === true);
    await touchspinHelpers.installJqueryPlugin(page);
    await page.waitForFunction(() => (window as any).touchSpinReady === true);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'jquery-commands');
  });

  test.describe('Value Operations', () => {

    test('should get value using "get" command', async ({ page }) => {
      // Initialize TouchSpin on the default test input
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Get value using 'get' command
      const value = await page.evaluate(() => {
        return (window as any).$('[data-testid="test-input"]').TouchSpin('get');
      });

      expect(value).toBe(50);
    });

    test('should get value using "getvalue" command (alias)', async ({ page }) => {
      // Initialize TouchSpin on the default test input
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Get value using 'getvalue' command (alias)
      const value = await page.evaluate(() => {
        return (window as any).$('[data-testid="test-input"]').TouchSpin('getvalue');
      });

      expect(value).toBe(50);
    });

    test('should get raw value even without TouchSpin instance', async ({ page }) => {
      // Don't initialize TouchSpin, just try to get value
      const value = await page.evaluate(() => {
        return (window as any).$('[data-testid="test-input"]').TouchSpin('get');
      });

      // Should return the raw input value
      expect(value).toBe('50');
    });

    test('should set value using "set" command', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Set value using 'set' command
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('set', 75);
      });

      // Verify value was set
      const value = await page.evaluate(() => {
        return (window as any).$('[data-testid="test-input"]').val();
      });

      expect(value).toBe('75');
    });

    test('should set value using "setvalue" command (alias)', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Set value using 'setvalue' command (alias)
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('setvalue', 25);
      });

      // Verify value was set
      const value = await page.evaluate(() => {
        return (window as any).$('[data-testid="test-input"]').val();
      });

      expect(value).toBe('25');
    });

    test('should respect min/max boundaries when setting value', async ({ page }) => {
      // Initialize TouchSpin with boundaries
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 10, max: 90 });

      // Try to set value below minimum
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('set', 5);
      });

      let value = await page.evaluate(() => {
        return (window as any).$('[data-testid="test-input"]').val();
      });
      expect(value).toBe('10'); // Should be clamped to min

      // Try to set value above maximum
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('set', 100);
      });

      value = await page.evaluate(() => {
        return (window as any).$('[data-testid="test-input"]').val();
      });
      expect(value).toBe('90'); // Should be clamped to max
    });
  });

  test.describe('Increment/Decrement', () => {

    test('should increment value using "uponce" command', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 0,
        max: 100,
        step: 5,
        initval: 50
      });

      // Increment using 'uponce' command
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('uponce');
      });

      const value = await page.evaluate(() => {
        return (window as any).$('[data-testid="test-input"]').val();
      });

      expect(value).toBe('55');
    });

    test('should decrement value using "downonce" command', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 0,
        max: 100,
        step: 5,
        initval: 50
      });

      // Decrement using 'downonce' command
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('downonce');
      });

      const value = await page.evaluate(() => {
        return (window as any).$('[data-testid="test-input"]').val();
      });

      expect(value).toBe('45');
    });

    test('should not increment beyond max', async ({ page }) => {
      // Initialize TouchSpin at max value
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 0,
        max: 100,
        step: 5,
        initval: 100
      });

      // Try to increment
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('uponce');
      });

      const value = await page.evaluate(() => {
        return (window as any).$('[data-testid="test-input"]').val();
      });

      expect(value).toBe('100'); // Should stay at max
    });

    test('should not decrement below min', async ({ page }) => {
      // Initialize TouchSpin at min value
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 10,
        max: 100,
        step: 5,
        initval: 10
      });

      // Try to decrement
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('downonce');
      });

      const value = await page.evaluate(() => {
        return (window as any).$('[data-testid="test-input"]').val();
      });

      expect(value).toBe('10'); // Should stay at min
    });

    test('should handle multiple increment/decrement operations', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 0,
        max: 100,
        step: 10,
        initval: 50
      });

      // Multiple increments
      await page.evaluate(() => {
        const $input = (window as any).$('[data-testid="test-input"]');
        $input.TouchSpin('uponce');
        $input.TouchSpin('uponce');
        $input.TouchSpin('uponce');
      });

      let value = await page.evaluate(() => {
        return (window as any).$('[data-testid="test-input"]').val();
      });
      expect(value).toBe('80');

      // Multiple decrements
      await page.evaluate(() => {
        const $input = (window as any).$('[data-testid="test-input"]');
        $input.TouchSpin('downonce');
        $input.TouchSpin('downonce');
      });

      value = await page.evaluate(() => {
        return (window as any).$('[data-testid="test-input"]').val();
      });
      expect(value).toBe('60');
    });
  });

  test.describe('Continuous Spinning', () => {

    test('should start up spin using "startupspin" command', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 0,
        max: 1000,
        step: 1,
        initval: 50
      });

      // Start up spin
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('startupspin');
      });

      // Wait a bit for spinning
      await page.waitForTimeout(300);

      // Stop spinning
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('stopspin');
      });

      const value = await page.evaluate(() => {
        return parseInt((window as any).$('[data-testid="test-input"]').val());
      });

      expect(value).toBeGreaterThan(50);
    });

    test('should start down spin using "startdownspin" command', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 0,
        max: 1000,
        step: 1,
        initval: 50
      });

      // Start down spin
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('startdownspin');
      });

      // Wait a bit for spinning
      await page.waitForTimeout(300);

      // Stop spinning
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('stopspin');
      });

      const value = await page.evaluate(() => {
        return parseInt((window as any).$('[data-testid="test-input"]').val());
      });

      expect(value).toBeLessThan(50);
    });

    test('should stop spinning using "stopspin" command', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 0,
        max: 1000,
        step: 1,
        initval: 100
      });

      // Start up spin
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('startupspin');
      });

      await page.waitForTimeout(100);

      // Stop spinning and capture value
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('stopspin');
      });

      const valueAfterStop = await page.evaluate(() => {
        return parseInt((window as any).$('[data-testid="test-input"]').val());
      });

      // Wait more to ensure it really stopped
      await page.waitForTimeout(200);

      const valueAfterWait = await page.evaluate(() => {
        return parseInt((window as any).$('[data-testid="test-input"]').val());
      });

      // Value should not have changed after stop
      expect(valueAfterWait).toBe(valueAfterStop);
    });
  });

  test.describe('Settings Update', () => {

    test('should update settings dynamically using "updatesettings"', async ({ page }) => {
      // Initialize TouchSpin with initial settings
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 0,
        max: 100,
        step: 1,
        initval: 50
      });

      // Update settings
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('updatesettings', {
          min: 20,
          max: 80,
          step: 10
        });
      });

      // Try to set value below new minimum
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('set', 10);
      });

      let value = await page.evaluate(() => {
        return (window as any).$('[data-testid="test-input"]').val();
      });
      expect(value).toBe('20'); // Should be clamped to new min

      // Try to set value above new maximum
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('set', 90);
      });

      value = await page.evaluate(() => {
        return (window as any).$('[data-testid="test-input"]').val();
      });
      expect(value).toBe('80'); // Should be clamped to new max
    });

    test('should update prefix and postfix', async ({ page }) => {
      // Initialize TouchSpin without prefix/postfix
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 0,
        max: 100,
        initval: 50
      });

      // Update to add prefix and postfix
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('updatesettings', {
          prefix: '$',
          postfix: '.00'
        });
      });

      // Check if prefix exists
      const hasPrefix = await page.evaluate(() => {
        return (window as any).$('.bootstrap-touchspin-prefix').length > 0 &&
               (window as any).$('.bootstrap-touchspin-prefix').text() === '$';
      });
      expect(hasPrefix).toBeTruthy();

      // Check if postfix exists
      const hasPostfix = await page.evaluate(() => {
        return (window as any).$('.bootstrap-touchspin-postfix').length > 0 &&
               (window as any).$('.bootstrap-touchspin-postfix').text() === '.00';
      });
      expect(hasPostfix).toBeTruthy();
    });

    test('should update button texts', async ({ page }) => {
      // Initialize TouchSpin with default button texts
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 0,
        max: 100,
        initval: 50
      });

      // Update button texts
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('updatesettings', {
          buttondown_txt: 'Less',
          buttonup_txt: 'More'
        });
      });

      // Check if button texts were updated
      const downButtonText = await page.evaluate(() => {
        return (window as any).$('.bootstrap-touchspin-down').text().trim();
      });
      expect(downButtonText).toBe('Less');

      const upButtonText = await page.evaluate(() => {
        return (window as any).$('.bootstrap-touchspin-up').text().trim();
      });
      expect(upButtonText).toBe('More');
    });
  });

  test.describe('Destroy/Reinitialize', () => {

    test('should destroy TouchSpin instance using "destroy" command', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 0,
        max: 100,
        initval: 50
      });

      // Verify TouchSpin is initialized (buttons exist)
      let hasButtons = await page.evaluate(() => {
        return (window as any).$('.bootstrap-touchspin-up').length > 0;
      });
      expect(hasButtons).toBeTruthy();

      // Destroy TouchSpin
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('destroy');
      });

      // Verify TouchSpin is destroyed (buttons removed)
      hasButtons = await page.evaluate(() => {
        return (window as any).$('.bootstrap-touchspin-up').length > 0;
      });
      expect(hasButtons).toBeFalsy();

      // Input should still exist and retain its value
      const inputExists = await page.evaluate(() => {
        return (window as any).$('[data-testid="test-input"]').length > 0;
      });
      expect(inputExists).toBeTruthy();
    });

    test('should reinitialize after destroy', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 0,
        max: 100,
        initval: 50
      });

      // Destroy it
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('destroy');
      });

      // Reinitialize with different settings
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 10,
        max: 90,
        initval: 60,
        prefix: 'NEW'
      });

      // Verify reinitialization worked
      const hasPrefix = await page.evaluate(() => {
        return (window as any).$('.bootstrap-touchspin-prefix').text() === 'NEW';
      });
      expect(hasPrefix).toBeTruthy();

      const value = await page.evaluate(() => {
        return (window as any).$('[data-testid="test-input"]').val();
      });
      expect(value).toBe('60');
    });
  });

  test.describe('Chainability', () => {

    test('should support method chaining', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 0,
        max: 100,
        initval: 50
      });

      // Chain multiple commands
      const result = await page.evaluate(() => {
        const $input = (window as any).$('[data-testid="test-input"]');

        // Chain commands and check if jQuery object is returned
        const chainResult = $input
          .TouchSpin('set', 60)
          .TouchSpin('uponce')
          .TouchSpin('uponce');

        // Check if we can still use jQuery methods
        return {
          isJQuery: chainResult instanceof (window as any).$,
          value: chainResult.val()
        };
      });

      expect(result.isJQuery).toBeTruthy();
      expect(result.value).toBe('62'); // 60 + 1 + 1 (default step is 1)
    });
  });

  test.describe('Error Handling', () => {

    test('should handle invalid commands gracefully', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 0,
        max: 100,
        initval: 50
      });

      // Try invalid command (should not throw)
      const result = await page.evaluate(() => {
        try {
          (window as any).$('[data-testid="test-input"]').TouchSpin('invalidcommand');
          return 'no-error';
        } catch (e) {
          return 'error';
        }
      });

      expect(result).toBe('no-error');
    });

    test('should handle commands on non-initialized inputs', async ({ page }) => {
      // Don't initialize TouchSpin, just try commands
      const result = await page.evaluate(() => {
        try {
          const $input = (window as any).$('[data-testid="test-input"]');
          $input.TouchSpin('uponce'); // Should do nothing
          $input.TouchSpin('destroy'); // Should do nothing
          return $input.val(); // Should still return original value
        } catch (e) {
          return 'error';
        }
      });

      expect(result).toBe('50'); // Original value unchanged
    });
  });

  test.describe('Options Initialization', () => {

    test('should initialize with decimal options', async ({ page }) => {
      // Initialize with decimal settings
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 0,
        max: 10,
        step: 0.1,
        decimals: 2,
        initval: 5.5
      });

      // Increment once
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('uponce');
      });

      const value = await page.evaluate(() => {
        return (window as any).$('[data-testid="test-input"]').val();
      });

      expect(value).toBe('5.60');
    });

    test('should initialize with mousewheel support', async ({ page }) => {
      // Initialize with mousewheel enabled
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 0,
        max: 100,
        mousewheel: true,
        initval: 50
      });

      // Focus the input first (required for mousewheel events)
      const elements = await touchspinHelpers.getTouchSpinElementsStrict(page, 'test-input');
      await elements.input.focus();

      // Clear event log to track only this test's events
      await touchspinHelpers.clearEventLog(page);

      // Simulate mousewheel up
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]');
        // No need for null check - getTouchSpinElementsStrict already verified it exists
        const event = new WheelEvent('wheel', {
          deltaY: -1,
          bubbles: true
        });
        input!.dispatchEvent(event);
      });

      await page.waitForTimeout(100);

      // Verify wheel event was logged
      expect(await touchspinHelpers.hasEventInLog(page, 'wheel', 'native')).toBe(true);

      const value = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(parseInt(value)).toBeGreaterThanOrEqual(51);
    });
  });

  test.describe('Multiple Instances', () => {

    test('should handle multiple instances independently', async ({ page }) => {
      // Create additional inputs
      await touchspinHelpers.createAdditionalInput(page, 'input-2', { value: '30' });
      await touchspinHelpers.createAdditionalInput(page, 'input-3', { value: '70' });

      // Initialize all three with different settings
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 0,
        max: 100,
        step: 5
      });

      await touchspinHelpers.initializeTouchSpin(page, 'input-2', {
        min: 10,
        max: 50,
        step: 2
      });

      await touchspinHelpers.initializeTouchSpin(page, 'input-3', {
        min: 50,
        max: 150,
        step: 10
      });

      // Operate on each independently
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('uponce');
        (window as any).$('[data-testid="input-2"]').TouchSpin('uponce');
        (window as any).$('[data-testid="input-3"]').TouchSpin('downonce');
      });

      const values = await page.evaluate(() => {
        return {
          input1: (window as any).$('[data-testid="test-input"]').val(),
          input2: (window as any).$('[data-testid="input-2"]').val(),
          input3: (window as any).$('[data-testid="input-3"]').val()
        };
      });

      expect(values.input1).toBe('55'); // 50 + 5
      expect(values.input2).toBe('32'); // 30 + 2
      expect(values.input3).toBe('60'); // 70 - 10
    });

    test('should destroy specific instance without affecting others', async ({ page }) => {
      // Create additional input
      await touchspinHelpers.createAdditionalInput(page, 'input-2', { value: '30' });

      // Initialize both
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });
      await touchspinHelpers.initializeTouchSpin(page, 'input-2', { min: 0, max: 100 });

      // Destroy first one
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('destroy');
      });

      // Check first is destroyed but second still works
      const results = await page.evaluate(() => {
        const firstHasButtons = (window as any).$('[data-testid="test-input"]')
          .parent().find('.bootstrap-touchspin-up').length > 0;

        const secondHasButtons = (window as any).$('[data-testid="input-2"]')
          .parent().find('.bootstrap-touchspin-up').length > 0;

        // Try to operate on second one
        (window as any).$('[data-testid="input-2"]').TouchSpin('uponce');

        return {
          firstHasButtons,
          secondHasButtons,
          secondValue: (window as any).$('[data-testid="input-2"]').val()
        };
      });

      expect(results.firstHasButtons).toBeFalsy();
      expect(results.secondHasButtons).toBeTruthy();
      expect(results.secondValue).toBe('31');
    });
  });
});