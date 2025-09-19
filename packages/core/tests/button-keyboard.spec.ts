import { test, expect } from '@playwright/test';
import * as apiHelpers from '../../../__tests__/helpers/touchspinApiHelpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  readInputValue
} from '../test-helpers/core-adapter';

test.describe('Core TouchSpin Button Keyboard Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await apiHelpers.waitForCoreTestReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'core-button-keyboard');
  });

  test.describe('Up Button Keyboard Interaction', () => {
    test('Space key on up button starts and stops spin', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10,
        focusablebuttons: true
      });

      const upButton = page.locator('[data-testid="test-input-up"]');
      await upButton.focus();
      await apiHelpers.clearEventLog(page);

      // Press Space key to start spinning
      await upButton.press('Space');
      await apiHelpers.waitForTimeout(50);

      // Should increment immediately
      expect(await getNumericValue(page, 'test-input')).toBeGreaterThan(10);

      // Should emit start spin events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startupspin', 'touchspin')).toBe(true);

      await apiHelpers.clearEventLog(page);

      // Release Space key to stop spinning
      await page.keyboard.up('Space');
      await apiHelpers.waitForTimeout(50);

      // Should emit stop spin events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopupspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);
    });

    test('Enter key on up button starts and stops spin', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 2,
        initval: 20,
        focusablebuttons: true
      });

      const upButton = page.locator('[data-testid="test-input-up"]');
      await upButton.focus();
      await apiHelpers.clearEventLog(page);

      // Press Enter key
      await upButton.press('Enter');
      await apiHelpers.waitForTimeout(50);

      // Should increment by step amount
      expect(await getNumericValue(page, 'test-input')).toBe(22); // 20 + 2

      // Should emit start events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startupspin', 'touchspin')).toBe(true);

      // Release Enter key
      await page.keyboard.up('Enter');
      await apiHelpers.waitForTimeout(50);

      // Should emit stop events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopupspin', 'touchspin')).toBe(true);
    });

    test('other keys on up button are ignored', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10,
        focusablebuttons: true
      });

      const upButton = page.locator('[data-testid="test-input-up"]');
      await upButton.focus();
      await apiHelpers.clearEventLog(page);

      // Press various other keys - should be ignored
      await upButton.press('Tab');
      await upButton.press('Escape');
      await upButton.press('ArrowUp');
      await apiHelpers.waitForTimeout(50);

      // Value should not change
      expect(await getNumericValue(page, 'test-input')).toBe(10);

      // No spin events should be emitted
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(false);
    });

    test('auto-repeat keydown events are ignored', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10,
        focusablebuttons: true
      });

      const upButton = page.locator('[data-testid="test-input-up"]');
      await upButton.focus();

      // Simulate repeated keydown events (auto-repeat)
      const startCount = await page.evaluate(async () => {
        const upBtn = document.querySelector('[data-testid="test-input-up"]') as HTMLElement;
        let startEventCount = 0;

        // Listen for start events
        const core = ((document.querySelector('[data-testid="test-input"]') as any)._touchSpinCore);
        core.on('startspin', () => startEventCount++);

        // Simulate initial keydown (not a repeat)
        const keydownEvent1 = new KeyboardEvent('keydown', {
          key: 'Space',
          keyCode: 32,
          repeat: false
        });
        upBtn.dispatchEvent(keydownEvent1);

        // Simulate repeated keydown events (auto-repeat)
        const keydownEvent2 = new KeyboardEvent('keydown', {
          key: 'Space',
          keyCode: 32,
          repeat: true // This should be ignored
        });
        upBtn.dispatchEvent(keydownEvent2);

        const keydownEvent3 = new KeyboardEvent('keydown', {
          key: 'Space',
          keyCode: 32,
          repeat: true // This should also be ignored
        });
        upBtn.dispatchEvent(keydownEvent3);

        await new Promise(resolve => setTimeout(resolve, 50));
        return startEventCount;
      });

      // Should only handle the first keydown (non-repeat), ignore the rest
      expect(startCount).toBe(1);
    });

    test('Space preventDefault behavior on up button', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10,
        focusablebuttons: true
      });

      const preventedEvents = await page.evaluate(async () => {
        const upBtn = document.querySelector('[data-testid="test-input-up"]') as HTMLElement;
        const preventedKeys: string[] = [];

        // Listen for keydown and check if preventDefault was called
        upBtn.addEventListener('keydown', (e) => {
          const originalPreventDefault = e.preventDefault;
          let prevented = false;
          e.preventDefault = function() {
            prevented = true;
            originalPreventDefault.call(e);
          };

          // Trigger the TouchSpin handler
          setTimeout(() => {
            if (prevented) preventedKeys.push(e.key);
          }, 1);
        });

        // Test Space key
        const spaceEvent = new KeyboardEvent('keydown', {
          key: 'Space',
          keyCode: 32,
          repeat: false
        });
        upBtn.dispatchEvent(spaceEvent);

        // Test Enter key
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          keyCode: 13,
          repeat: false
        });
        upBtn.dispatchEvent(enterEvent);

        // Test other key (should not be prevented)
        const tabEvent = new KeyboardEvent('keydown', {
          key: 'Tab',
          keyCode: 9,
          repeat: false
        });
        upBtn.dispatchEvent(tabEvent);

        await new Promise(resolve => setTimeout(resolve, 50));
        return preventedKeys;
      });

      // Space and Enter should be prevented, Tab should not
      expect(preventedEvents).toContain('Space');
      expect(preventedEvents).toContain('Enter');
      expect(preventedEvents).not.toContain('Tab');
    });
  });

  test.describe('Down Button Keyboard Interaction', () => {
    test('Space key on down button starts and stops spin', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10,
        focusablebuttons: true
      });

      const downButton = page.locator('[data-testid="test-input-down"]');
      await downButton.focus();
      await apiHelpers.clearEventLog(page);

      // Press Space key to start spinning
      await downButton.press('Space');
      await apiHelpers.waitForTimeout(50);

      // Should decrement immediately
      expect(await getNumericValue(page, 'test-input')).toBeLessThan(10);

      // Should emit start spin events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startdownspin', 'touchspin')).toBe(true);

      await apiHelpers.clearEventLog(page);

      // Release Space key to stop spinning
      await page.keyboard.up('Space');
      await apiHelpers.waitForTimeout(50);

      // Should emit stop spin events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopdownspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);
    });

    test('Enter key on down button starts and stops spin', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 3,
        initval: 30,
        focusablebuttons: true
      });

      const downButton = page.locator('[data-testid="test-input-down"]');
      await downButton.focus();

      // Press and release Enter key
      await downButton.press('Enter');
      await apiHelpers.waitForTimeout(50);

      // Should decrement by step amount
      expect(await getNumericValue(page, 'test-input')).toBe(27); // 30 - 3

      // Release Enter key
      await page.keyboard.up('Enter');
      await apiHelpers.waitForTimeout(50);

      // Should emit appropriate events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startdownspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopdownspin', 'touchspin')).toBe(true);
    });

    test('non-focusable buttons ignore keyboard events', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10,
        focusablebuttons: false // Disabled focusable buttons
      });

      const downButton = page.locator('[data-testid="test-input-down"]');
      await apiHelpers.clearEventLog(page);

      // Try to press keys on non-focusable button
      await downButton.press('Space');
      await downButton.press('Enter');
      await apiHelpers.waitForTimeout(50);

      // Value should not change since buttons are not focusable
      expect(await getNumericValue(page, 'test-input')).toBe(10);

      // No spin events should be emitted
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(false);
    });
  });

  test.describe('Input Element Arrow Key Handling', () => {
    test('Arrow up key on input starts up spin', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10
      });

      await page.focus('[data-testid="test-input"]');
      await apiHelpers.clearEventLog(page);

      // Press Arrow Up key
      await page.keyboard.press('ArrowUp');
      await apiHelpers.waitForTimeout(50);

      // Should start up spin
      expect(await getNumericValue(page, 'test-input')).toBeGreaterThan(10);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startupspin', 'touchspin')).toBe(true);
    });

    test('Arrow down key on input starts down spin', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 2,
        initval: 20
      });

      await page.focus('[data-testid="test-input"]');
      await apiHelpers.clearEventLog(page);

      // Press Arrow Down key
      await page.keyboard.press('ArrowDown');
      await apiHelpers.waitForTimeout(50);

      // Should start down spin
      expect(await getNumericValue(page, 'test-input')).toBeLessThan(20);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startdownspin', 'touchspin')).toBe(true);
    });

    test('Arrow key release stops spinning', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10,
        stepinterval: 50 // Fast for testing
      });

      await page.focus('[data-testid="test-input"]');
      await apiHelpers.clearEventLog(page);

      // Hold Arrow Up key
      await page.keyboard.down('ArrowUp');
      await apiHelpers.waitForTimeout(150); // Let it spin multiple times

      const valueBeforeRelease = await getNumericValue(page, 'test-input');
      await apiHelpers.clearEventLog(page);

      // Release Arrow Up key
      await page.keyboard.up('ArrowUp');
      await apiHelpers.waitForTimeout(100);

      // Should stop spinning
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopupspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);

      // Value should not change after release
      const valueAfterRelease = await getNumericValue(page, 'test-input');
      await apiHelpers.waitForTimeout(100);
      expect(await getNumericValue(page, 'test-input')).toBe(valueAfterRelease);
    });

    test('Arrow key auto-repeat is ignored', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10
      });

      await page.focus('[data-testid="test-input"]');

      const spinStartCount = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        let startEventCount = 0;

        core.on('startspin', () => startEventCount++);

        // Simulate initial arrow keydown (not a repeat)
        const keydownEvent1 = new KeyboardEvent('keydown', {
          key: 'ArrowUp',
          repeat: false
        });
        input.dispatchEvent(keydownEvent1);

        // Simulate repeated keydown events (auto-repeat) - should be ignored
        const keydownEvent2 = new KeyboardEvent('keydown', {
          key: 'ArrowUp',
          repeat: true
        });
        input.dispatchEvent(keydownEvent2);

        await new Promise(resolve => setTimeout(resolve, 50));
        return startEventCount;
      });

      // Should only handle the first keydown (non-repeat)
      expect(spinStartCount).toBe(1);
    });

    test('Enter key on input triggers value check', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10
      });

      // Set an invalid value first
      await page.focus('[data-testid="test-input"]');
      await page.fill('[data-testid="test-input"]', 'invalid');
      await apiHelpers.clearEventLog(page);

      // Press Enter key
      await page.keyboard.press('Enter');
      await apiHelpers.waitForTimeout(50);

      // Should trigger value sanitization
      const finalValue = await readInputValue(page, 'test-input');
      expect(finalValue).not.toBe('invalid'); // Should be sanitized
    });

    test('Arrow keys prevent default behavior', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10
      });

      await page.focus('[data-testid="test-input"]');

      const preventedKeys = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const prevented: string[] = [];

        input.addEventListener('keydown', (e) => {
          const originalPreventDefault = e.preventDefault;
          let wasPrevented = false;
          e.preventDefault = function() {
            wasPrevented = true;
            originalPreventDefault.call(e);
          };

          // Let the TouchSpin handler run
          setTimeout(() => {
            if (wasPrevented) prevented.push(e.key);
          }, 1);
        });

        // Test Arrow Up
        const arrowUpEvent = new KeyboardEvent('keydown', {
          key: 'ArrowUp',
          repeat: false
        });
        input.dispatchEvent(arrowUpEvent);

        // Test Arrow Down
        const arrowDownEvent = new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          repeat: false
        });
        input.dispatchEvent(arrowDownEvent);

        // Test other key (should not be prevented)
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          repeat: false
        });
        input.dispatchEvent(enterEvent);

        await new Promise(resolve => setTimeout(resolve, 50));
        return prevented;
      });

      // Arrow keys should be prevented, Enter should not
      expect(preventedKeys).toContain('ArrowUp');
      expect(preventedKeys).toContain('ArrowDown');
      expect(preventedKeys).not.toContain('Enter');
    });
  });

  test.describe('Keyboard Integration with Boundaries', () => {
    test('keyboard spin stops at boundaries', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 0,
        max: 2,
        initval: 1
      });

      await page.focus('[data-testid="test-input"]');

      // Spin up to max boundary
      await page.keyboard.press('ArrowUp');
      await apiHelpers.waitForTimeout(50);
      expect(await getNumericValue(page, 'test-input')).toBe(2); // At max

      await page.keyboard.up('ArrowUp');
      await apiHelpers.clearEventLog(page);

      // Spin down to min boundary
      await page.keyboard.down('ArrowDown');
      await apiHelpers.waitForTimeout(150); // Let it spin through boundaries
      await page.keyboard.up('ArrowDown');

      expect(await getNumericValue(page, 'test-input')).toBe(0); // At min

      // Should emit boundary events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.min', 'touchspin')).toBe(true);
    });
  });
});

// NOTE: This test file exercises the button keyboard event handlers (_handleUpKeyDown, _handleUpKeyUp,
// _handleDownKeyDown, _handleDownKeyUp) and input keyboard handlers (_handleKeyDown, _handleKeyUp),
// covering Space/Enter key handling, preventDefault behavior, auto-repeat prevention, and arrow key spin control.
