import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../../__tests__/helpers/touchspinHelpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  isCoreInitialized,
  incrementViaAPI,
  decrementViaAPI,
  incrementViaKeyboard,
  decrementViaKeyboard,
  incrementViaWheel,
  decrementViaWheel,
  startUpSpinViaAPI,
  startDownSpinViaAPI,
  stopSpinViaAPI
} from '../test-helpers/core-adapter';

// Use original battle-tested helpers
const {
  clickUpButton,      // was: coreUpOnce
  clickDownButton,    // was: coreDownOnce
  readInputValue,     // was: getInputValue
  fillWithValue,      // was: setInputValue
  setInputAttr        // was: setInputAttribute
} = touchspinHelpers;

test.describe('Core TouchSpin Events', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await page.waitForFunction(() => (window as any).coreTestReady === true);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'core-events');
  });

  test.describe('Single Step Operations', () => {
    test('should not emit spin events for single increment via API', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await incrementViaAPI(page, 'test-input');

      // Single steps don't emit startspin/stopspin in Core (unlike jQuery plugin)
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(false);
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(false);
      // But should emit change event
      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
    });

    test('should not emit spin events for single decrement via API', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await decrementViaAPI(page, 'test-input');

      // Single steps don't emit startspin/stopspin in Core
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(false);
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(false);
      // But should emit change event
      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
    });

    test('should emit change event when value changes via increment', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await incrementViaAPI(page, 'test-input');

      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
      expect(await getNumericValue(page, 'test-input')).toBe(11);
    });

    test('should emit change event when value changes via decrement', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await decrementViaAPI(page, 'test-input');

      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
      expect(await getNumericValue(page, 'test-input')).toBe(9);
    });
  });

  test.describe('Boundary Events', () => {
    test('should emit touchspin.on.min when reaching minimum via decrement', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, min: 0, initval: 1 });
      await touchspinHelpers.clearEventLog(page);

      await decrementViaAPI(page, 'test-input');

      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.min', 'touchspin')).toBe(true);
      expect(await getNumericValue(page, 'test-input')).toBe(0);
    });

    test('should emit touchspin.on.max when reaching maximum via increment', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, max: 10, initval: 9 });
      await touchspinHelpers.clearEventLog(page);

      await incrementViaAPI(page, 'test-input');

      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.max', 'touchspin')).toBe(true);
      expect(await getNumericValue(page, 'test-input')).toBe(10);
    });

    test('should not emit min event when not at minimum', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, min: 0, initval: 5 });
      await touchspinHelpers.clearEventLog(page);

      await decrementViaAPI(page, 'test-input');

      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.min', 'touchspin')).toBe(false);
      expect(await getNumericValue(page, 'test-input')).toBe(4);
    });

    test('should not emit max event when not at maximum', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, max: 10, initval: 5 });
      await touchspinHelpers.clearEventLog(page);

      await incrementViaAPI(page, 'test-input');

      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.max', 'touchspin')).toBe(false);
      expect(await getNumericValue(page, 'test-input')).toBe(6);
    });
  });

  test.describe('Keyboard Events', () => {
    test('should emit spin events for arrow up key press', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await incrementViaKeyboard(page, 'test-input');

      // Keyboard events DO emit startspin/stopspin in Core (unlike API calls)
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);
      // And should emit change event
      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
    });

    test('should emit spin events for arrow down key press', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await decrementViaKeyboard(page, 'test-input');

      // Keyboard events DO emit startspin/stopspin in Core (unlike API calls)
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);
      // And should emit change event
      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
    });

    test('should emit min event when arrow down reaches minimum', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, min: 0, initval: 1 });
      await touchspinHelpers.clearEventLog(page);

      await decrementViaKeyboard(page, 'test-input');

      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.min', 'touchspin')).toBe(true);
      expect(await getNumericValue(page, 'test-input')).toBe(0);
    });

    test('should emit max event when arrow up reaches maximum', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, max: 10, initval: 9 });
      await touchspinHelpers.clearEventLog(page);

      await incrementViaKeyboard(page, 'test-input');

      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.max', 'touchspin')).toBe(true);
      expect(await getNumericValue(page, 'test-input')).toBe(10);
    });
  });

  test.describe('Mouse Wheel Events', () => {
    test('should not emit spin events for single wheel up', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await incrementViaWheel(page, 'test-input');

      // Single wheel events don't emit startspin/stopspin in Core
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(false);
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(false);
      // But should emit change event
      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
    });

    test('should not emit spin events for single wheel down', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await decrementViaWheel(page, 'test-input');

      // Single wheel events don't emit startspin/stopspin in Core
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(false);
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(false);
      // But should emit change event
      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
    });

    test('should emit min event when wheel down reaches minimum', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, min: 0, initval: 1 });
      await touchspinHelpers.clearEventLog(page);

      await decrementViaWheel(page, 'test-input');

      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.min', 'touchspin')).toBe(true);
      expect(await getNumericValue(page, 'test-input')).toBe(0);
    });

    test('should emit max event when wheel up reaches maximum', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, max: 10, initval: 9 });
      await touchspinHelpers.clearEventLog(page);

      await incrementViaWheel(page, 'test-input');

      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.max', 'touchspin')).toBe(true);
      expect(await getNumericValue(page, 'test-input')).toBe(10);
    });
  });

  test.describe('Continuous Spinning Events', () => {
    test('should emit touchspin.on.startspin when starting up spin', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await startUpSpinViaAPI(page, 'test-input');

      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);
    });

    test('should emit touchspin.on.startspin when starting down spin', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await startDownSpinViaAPI(page, 'test-input');

      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);
    });

    test('should emit touchspin.on.stopspin when stopping spin', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await startUpSpinViaAPI(page, 'test-input');
      await touchspinHelpers.clearEventLog(page);

      await stopSpinViaAPI(page, 'test-input');

      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);
    });
  });

  test.describe('setValue API Events', () => {
    test('should not emit change event for programmatic setValue without sanitization', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await setValueViaAPI(page, 'test-input', 15);

      // Core only emits change for setValue when value is sanitized by constraints
      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(false);
      expect(await getNumericValue(page, 'test-input')).toBe(15);
    });

    test('should not emit change event when setValue results in same value', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await setValueViaAPI(page, 'test-input', 10); // Same value

      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(false);
    });

    test('should emit change event when setValue is sanitized by constraints', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, min: 0, max: 50, initval: 25 });
      await touchspinHelpers.clearEventLog(page);

      await setValueViaAPI(page, 'test-input', 100); // Will be clamped to 50

      expect(await touchspinHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
      expect(await getNumericValue(page, 'test-input')).toBe(50);
    });
  });

  test.describe('Event Count Verification', () => {
    test('should emit exactly one startspin and one stopspin per continuous spin', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await startUpSpinViaAPI(page, 'test-input');
      await stopSpinViaAPI(page, 'test-input');

      const startCount = await touchspinHelpers.countEventInLog(page, 'touchspin.on.startspin', 'touchspin');
      const stopCount = await touchspinHelpers.countEventInLog(page, 'touchspin.on.stopspin', 'touchspin');
      expect(startCount).toBe(1);
      expect(stopCount).toBe(1);
    });

    test('should emit exactly one change event per value change', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await incrementViaAPI(page, 'test-input');

      const changeCount = await touchspinHelpers.countEventInLog(page, 'change', 'native');
      expect(changeCount).toBe(1);
    });

    test('should emit min event every time minimum boundary is hit', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, min: 0, initval: 0 });
      await touchspinHelpers.clearEventLog(page);

      await decrementViaAPI(page, 'test-input');
      await decrementViaAPI(page, 'test-input');

      const minCount = await touchspinHelpers.countEventInLog(page, 'touchspin.on.min', 'touchspin');
      expect(minCount).toBe(2); // Each attempt triggers min event
    });

    test('should emit max event every time maximum boundary is hit', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, max: 10, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await incrementViaAPI(page, 'test-input');
      await incrementViaAPI(page, 'test-input');

      const maxCount = await touchspinHelpers.countEventInLog(page, 'touchspin.on.max', 'touchspin');
      expect(maxCount).toBe(2); // Each attempt triggers max event
    });
  });

  test.describe('Event Order Verification', () => {
    test('should emit events in correct order for continuous spinning', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await startUpSpinViaAPI(page, 'test-input');
      await stopSpinViaAPI(page, 'test-input');

      const eventLog = await touchspinHelpers.getEventLog(page);
      const touchspinEvents = eventLog.filter(entry => entry.type === 'touchspin');

      // Should have startspin before stopspin
      expect(touchspinEvents.some(entry => entry.event === 'touchspin.on.startspin')).toBe(true);
      expect(touchspinEvents.some(entry => entry.event === 'touchspin.on.stopspin')).toBe(true);

      const startIndex = touchspinEvents.findIndex(entry => entry.event === 'touchspin.on.startspin');
      const stopIndex = touchspinEvents.findIndex(entry => entry.event === 'touchspin.on.stopspin');
      expect(startIndex).toBeLessThan(stopIndex);
    });

    test('should emit change event for value changes', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await touchspinHelpers.clearEventLog(page);

      await incrementViaAPI(page, 'test-input');

      const eventLog = await touchspinHelpers.getEventLog(page);
      const changeEvents = eventLog.filter(entry => entry.type === 'native' && entry.event === 'change');

      expect(changeEvents.length).toBe(1);
      expect(changeEvents[0].target).toBe('test-input');
      expect(changeEvents[0].value).toBe('11');
    });
  });
});

// NOTE: This test file focuses exclusively on event verification using the event log
// system. No renderer is needed - all tests use Core API methods and keyboard/wheel
// interactions. Event timing and order are verified through the centralized event log.