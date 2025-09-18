/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../../__tests__/helpers/touchspinApiHelpers';
import '../../../__tests__/coverage.hooks';

test.describe('jQuery TouchSpin Emitted Events', () => {

  test.beforeEach(async ({ page }) => {
    // Reload page for each test to ensure clean state
    await page.goto('http://localhost:8866/packages/jquery-plugin/tests/html/test-fixture.html');
    await page.waitForFunction(() => (window as any).testPageReady === true);
    await touchspinHelpers.installJqueryPlugin(page);
    await page.waitForFunction(() => (window as any).touchSpinReady === true);
  });

  test.describe('Boundary Events', () => {

    test('should emit touchspin.on.min when reaching minimum', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', { min: 0, initval: 1 });
      await touchspinHelpers.clearEventLog(page);

      await touchspinHelpers.clickDownButton(page, 'test-input');

      // Min event should be logged
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.min', 'touchspin')).toBe(true);
      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('0'); // At minimum
    });

    test('should emit touchspin.on.max when reaching maximum', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', { max: 100, initval: 99 });
      await touchspinHelpers.clearEventLog(page);

      await touchspinHelpers.clickUpButton(page, 'test-input');

      // Max event should be logged
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.max', 'touchspin')).toBe(true);
      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('100'); // At maximum
    });

    test('should emit min event when trying to go below minimum', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', { min: 10, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await touchspinHelpers.clickDownButton(page, 'test-input');

      // Should emit min event even when already at minimum
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.min', 'touchspin')).toBe(true);
      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('10'); // Still at minimum
    });

    test('should emit max event when trying to go above maximum', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', { max: 100, initval: 100 });
      await touchspinHelpers.clearEventLog(page);

      await touchspinHelpers.clickUpButton(page, 'test-input');

      // Should emit max event even when already at maximum
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.max', 'touchspin')).toBe(true);
      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('100'); // Still at maximum
    });
  });

  test.describe('Spin Start Events', () => {

    test('should emit touchspin.on.startspin when spinning starts', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', {});
      await touchspinHelpers.clearEventLog(page);

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('startupspin');
      });

      // Allow brief time for event to be logged
      await page.waitForTimeout(100);

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('stopspin');
      });

      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);
    });

    test('should emit touchspin.on.startupspin when up spinning starts', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', {});
      await touchspinHelpers.clearEventLog(page);

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('startupspin');
      });

      await page.waitForTimeout(100);

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('stopspin');
      });

      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startupspin', 'touchspin')).toBe(true);
    });

    test('should emit touchspin.on.startdownspin when down spinning starts', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', {});
      await touchspinHelpers.clearEventLog(page);

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('startdownspin');
      });

      await page.waitForTimeout(100);

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('stopspin');
      });

      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startdownspin', 'touchspin')).toBe(true);
    });
  });

  test.describe('Spin Stop Events', () => {

    test('should emit touchspin.on.stopspin when spinning stops', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', {});

      // Start spinning first
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('startupspin');
      });

      await page.waitForTimeout(100);
      await touchspinHelpers.clearEventLog(page);

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('stopspin');
      });

      await page.waitForTimeout(100);

      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);
    });

    test('should emit touchspin.on.stopupspin when up spinning stops', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', {});

      // Start up spinning first
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('startupspin');
      });

      await page.waitForTimeout(100);
      await touchspinHelpers.clearEventLog(page);

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('stopspin');
      });

      await page.waitForTimeout(100);

      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.stopupspin', 'touchspin')).toBe(true);
    });

    test('should emit touchspin.on.stopdownspin when down spinning stops', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', {});

      // Start down spinning first
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('startdownspin');
      });

      await page.waitForTimeout(100);
      await touchspinHelpers.clearEventLog(page);

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('stopspin');
      });

      await page.waitForTimeout(100);

      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.stopdownspin', 'touchspin')).toBe(true);
    });
  });

  test.describe('Event Sequences', () => {

    test('should emit start events before stop events', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', {});
      await touchspinHelpers.clearEventLog(page);

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('startupspin');
      });

      await page.waitForTimeout(200);

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('stopspin');
      });

      await page.waitForTimeout(100);

      // Both start and stop events should be present
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startupspin', 'touchspin')).toBe(true);
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.stopupspin', 'touchspin')).toBe(true);
    });

    test('should emit correct events when switching spin direction', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', {});
      await touchspinHelpers.clearEventLog(page);

      // Start up spin
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('startupspin');
      });

      await page.waitForTimeout(200);

      // Switch to down spin
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('startdownspin');
      });

      await page.waitForTimeout(200);

      // Stop spinning
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('stopspin');
      });

      await page.waitForTimeout(100);

      // Should have events for both up and down spinning
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startupspin', 'touchspin')).toBe(true);
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.stopupspin', 'touchspin')).toBe(true);
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startdownspin', 'touchspin')).toBe(true);
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.stopdownspin', 'touchspin')).toBe(true);
    });
  });

  test.describe('Native Events', () => {

    test('should emit native change event when value changes', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', {});
      await touchspinHelpers.clearEventLog(page);

      await touchspinHelpers.clickUpButton(page, 'test-input');

      // Native change event should be logged
      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('51'); // 50 + 1
    });

    test('should NOT emit native change event when setting value via API', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', {});
      await touchspinHelpers.clearEventLog(page);

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('set', 75);
      });

      // Programmatic set → no native change
      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(false);
      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('75');
    });

    test('should emit native focus event when input receives focus', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', {});
      await touchspinHelpers.clearEventLog(page);

      await page.focus('[data-testid="test-input"]');

      expect(await touchspinHelpers.hasEventInLog(page, 'focus', 'native')).toBe(true);
    });

    test('should invoke value validation on jQuery-triggered blur', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', { min: 0, max: 100 });

      // Set value above maximum to test validation correction
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '150'; // Above max of 100
      });

      await touchspinHelpers.clearEventLog(page);

      // Trigger jQuery blur event (compatibility path)
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('blur');
      });

      // Value should be corrected to maximum
      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('100'); // Clamped to max
      expect(await touchspinHelpers.hasEventInLog(page, 'blur', 'native')).toBe(true);
    });

  });

  test.describe('Button Click Events', () => {

    test('should emit native click events when buttons are clicked', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', {});
      await touchspinHelpers.clearEventLog(page);

      await touchspinHelpers.clickUpButton(page, 'test-input');

      // Should log native click event
      expect(await touchspinHelpers.hasEventInLog(page, 'click', 'native')).toBe(true);
    });

    test('should update value with mouse wheel and emit only native change (no start/stopspin)', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', { step: 1, initval: 50 });
      await touchspinHelpers.clearEventLog(page);

      const input = page.locator('[data-testid="test-input"]');
      await input.focus();
      await input.hover();

      // Wheel up → increment
      await page.mouse.wheel(0, -100);
      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('51');

      // Wheel down → decrement
      await page.mouse.wheel(0, 100);
      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('50');

      // There should be no spin events on mouse scroll
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(false);
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(false);

      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
    });

    test('should emit events when clicking at boundaries', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', { max: 100, initval: 100 });
      await touchspinHelpers.clearEventLog(page);

      await touchspinHelpers.clickUpButton(page, 'test-input');

      // Should emit both click event and max event
      expect(await touchspinHelpers.hasEventInLog(page, 'click', 'native')).toBe(true);
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.max', 'touchspin')).toBe(true);
    });
  });

  test.describe('Multiple Event Types', () => {

    test('should emit both TouchSpin and native events together', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', { min: 40, max: 50, initval: 45 });
      await touchspinHelpers.clearEventLog(page);

      // Action that should trigger multiple event types
      await touchspinHelpers.clickDownButton(page, 'test-input'); // 45 -> 44
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('set', 40); // Set to min
      });
      await touchspinHelpers.clickDownButton(page, 'test-input'); // Try to go below min

      // Should have both native and TouchSpin events
      expect(await touchspinHelpers.hasEventInLog(page, 'click', 'native')).toBe(true);
      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.min', 'touchspin')).toBe(true);
    });

    test('should track event counts correctly', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', { step: 5 });
      await touchspinHelpers.clearEventLog(page);

      // Click multiple times
      await touchspinHelpers.clickUpButton(page, 'test-input');
      await touchspinHelpers.clickUpButton(page, 'test-input');
      await touchspinHelpers.clickUpButton(page, 'test-input');

      // Should have 3 click events and 3 change events
      expect(await touchspinHelpers.countEventInLog(page, 'click', 'native')).toBe(3);
      expect(await touchspinHelpers.countEventInLog(page, 'change', 'native')).toBe(3);
      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('65'); // 50 + 5 + 5 + 5
    });
  });

  test.describe('Event Context and Data', () => {

    test('should provide correct event target in logged events', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', {});
      await touchspinHelpers.clearEventLog(page);

      await touchspinHelpers.clickUpButton(page, 'test-input');

      // Get the event log and check target information
      const events = await touchspinHelpers.getEventsOfType(page, 'native');
      const clickEvent = events.find(e => e.event === 'click');

      expect(clickEvent).toBeDefined();
      expect(clickEvent?.target).toContain('test-input'); // Should reference the test input
    });

    test('should log value changes with events', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', {});
      await touchspinHelpers.clearEventLog(page);

      await touchspinHelpers.clickUpButton(page, 'test-input');

      // Check that change event includes value information
      const events = await touchspinHelpers.getEventsOfType(page, 'native');
      const changeEvent = events.find(e => e.event === 'change');

      expect(changeEvent).toBeDefined();
      expect(changeEvent?.value).toBe('51'); // New value after increment
    });
  });

  test.describe('Event Cleanup', () => {

    test('should stop emitting events after destroy', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', {});

      // Destroy the instance
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('destroy');
      });

      await touchspinHelpers.clearEventLog(page);

      // Try to click where button was - should not emit TouchSpin events
      await page.click('[data-testid="test-input"]'); // Just click the input itself

      // Should only have native events, no TouchSpin events
      const touchspinEvents = await touchspinHelpers.getEventsOfType(page, 'touchspin');
      const nativeEvents = await touchspinHelpers.getEventsOfType(page, 'native');

      expect(touchspinEvents.length).toBe(0); // No TouchSpin events after destroy
      expect(nativeEvents.length).toBeGreaterThan(0); // But native events still work
    });
  });
});
