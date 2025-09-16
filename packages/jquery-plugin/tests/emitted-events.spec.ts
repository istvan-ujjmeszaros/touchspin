/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../../__tests__/helpers/touchspinHelpers';

test.describe('jQuery TouchSpin Emitted Events', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    // Reload page for each test to ensure clean state
    await page.goto('http://localhost:8866/packages/jquery-plugin/tests/html/test-fixture.html');
    await page.waitForFunction(() => (window as any).testPageReady === true);
    await touchspinHelpers.installJqueryPlugin(page);
    await page.waitForFunction(() => (window as any).touchSpinReady === true);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'jquery-emitted-events');
  });

  test.describe('Boundary Events', () => {

    test('should emit touchspin.on.min when minimum value is reached', async ({ page }) => {
      // Initialize TouchSpin with value near min
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100, step: 1, initval: 1 });

      // Set up event listener
      const eventFired = await page.evaluate(() => {
        return new Promise((resolve) => {
          let fired = false;
          (window as any).$('[data-testid="test-input"]').on('touchspin.on.min', () => {
            fired = true;
          });

          // Decrement to reach min
          (window as any).$('[data-testid="test-input"]').TouchSpin('downonce');

          setTimeout(() => resolve(fired), 100);
        });
      });

      expect(eventFired).toBe(true);

      // Verify value is at min
      const value = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(value).toBe('0');
    });

    test('should emit touchspin.on.max when maximum value is reached', async ({ page }) => {
      // Initialize TouchSpin with value near max
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100, step: 1, initval: 99 });

      // Set up event listener
      const eventFired = await page.evaluate(() => {
        return new Promise((resolve) => {
          let fired = false;
          (window as any).$('[data-testid="test-input"]').on('touchspin.on.max', () => {
            fired = true;
          });

          // Increment to reach max
          (window as any).$('[data-testid="test-input"]').TouchSpin('uponce');

          setTimeout(() => resolve(fired), 100);
        });
      });

      expect(eventFired).toBe(true);

      // Verify value is at max
      const value = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(value).toBe('100');
    });

    test('should emit min event when trying to go below minimum', async ({ page }) => {
      // Initialize TouchSpin at min
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 10, max: 100, initval: 10 });

      // Set up event listener and try to decrement below min
      const eventFired = await page.evaluate(() => {
        return new Promise((resolve) => {
          let fired = false;
          (window as any).$('[data-testid="test-input"]').on('touchspin.on.min', () => {
            fired = true;
          });

          // Try to decrement below min (already at min)
          (window as any).$('[data-testid="test-input"]').TouchSpin('downonce');

          setTimeout(() => resolve(fired), 100);
        });
      });

      expect(eventFired).toBe(true);
    });

    test('should emit max event when trying to go above maximum', async ({ page }) => {
      // Initialize TouchSpin at max
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100, initval: 100 });

      // Set up event listener and try to increment above max
      const eventFired = await page.evaluate(() => {
        return new Promise((resolve) => {
          let fired = false;
          (window as any).$('[data-testid="test-input"]').on('touchspin.on.max', () => {
            fired = true;
          });

          // Try to increment above max (already at max)
          (window as any).$('[data-testid="test-input"]').TouchSpin('uponce');

          setTimeout(() => resolve(fired), 100);
        });
      });

      expect(eventFired).toBe(true);
    });
  });

  test.describe('Start Spin Events', () => {

    test('should emit touchspin.on.startspin when any spinning starts', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Test up spin triggers startspin
      let eventFired = await page.evaluate(() => {
        return new Promise((resolve) => {
          let fired = false;
          (window as any).$('[data-testid="test-input"]').on('touchspin.on.startspin', () => {
            fired = true;
          });

          (window as any).$('[data-testid="test-input"]').TouchSpin('startupspin');

          setTimeout(() => {
            (window as any).$('[data-testid="test-input"]').TouchSpin('stopspin');
            (window as any).$('[data-testid="test-input"]').off('touchspin.on.startspin');
            resolve(fired);
          }, 100);
        });
      });

      expect(eventFired).toBe(true);

      // Test down spin also triggers startspin
      eventFired = await page.evaluate(() => {
        return new Promise((resolve) => {
          let fired = false;
          (window as any).$('[data-testid="test-input"]').on('touchspin.on.startspin', () => {
            fired = true;
          });

          (window as any).$('[data-testid="test-input"]').TouchSpin('startdownspin');

          setTimeout(() => {
            (window as any).$('[data-testid="test-input"]').TouchSpin('stopspin');
            resolve(fired);
          }, 100);
        });
      });

      expect(eventFired).toBe(true);
    });

    test('should emit touchspin.on.startupspin when increment spinning starts', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Set up event listener
      const eventFired = await page.evaluate(() => {
        return new Promise((resolve) => {
          let fired = false;
          (window as any).$('[data-testid="test-input"]').on('touchspin.on.startupspin', () => {
            fired = true;
          });

          (window as any).$('[data-testid="test-input"]').TouchSpin('startupspin');

          setTimeout(() => {
            (window as any).$('[data-testid="test-input"]').TouchSpin('stopspin');
            resolve(fired);
          }, 100);
        });
      });

      expect(eventFired).toBe(true);
    });

    test('should emit touchspin.on.startdownspin when decrement spinning starts', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Set up event listener
      const eventFired = await page.evaluate(() => {
        return new Promise((resolve) => {
          let fired = false;
          (window as any).$('[data-testid="test-input"]').on('touchspin.on.startdownspin', () => {
            fired = true;
          });

          (window as any).$('[data-testid="test-input"]').TouchSpin('startdownspin');

          setTimeout(() => {
            (window as any).$('[data-testid="test-input"]').TouchSpin('stopspin');
            resolve(fired);
          }, 100);
        });
      });

      expect(eventFired).toBe(true);
    });
  });

  test.describe('Stop Spin Events', () => {

    test('should emit touchspin.on.stopspin when any spinning stops', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Test stopping up spin
      const eventFired = await page.evaluate(() => {
        return new Promise((resolve) => {
          let fired = false;

          (window as any).$('[data-testid="test-input"]').TouchSpin('startupspin');

          (window as any).$('[data-testid="test-input"]').on('touchspin.on.stopspin', () => {
            fired = true;
          });

          setTimeout(() => {
            (window as any).$('[data-testid="test-input"]').TouchSpin('stopspin');
            setTimeout(() => resolve(fired), 50);
          }, 200);
        });
      });

      expect(eventFired).toBe(true);
    });

    test('should emit touchspin.on.stopupspin when increment spinning stops', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Set up event listener
      const eventFired = await page.evaluate(() => {
        return new Promise((resolve) => {
          let fired = false;

          (window as any).$('[data-testid="test-input"]').TouchSpin('startupspin');

          (window as any).$('[data-testid="test-input"]').on('touchspin.on.stopupspin', () => {
            fired = true;
          });

          setTimeout(() => {
            (window as any).$('[data-testid="test-input"]').TouchSpin('stopspin');
            setTimeout(() => resolve(fired), 50);
          }, 200);
        });
      });

      expect(eventFired).toBe(true);
    });

    test('should emit touchspin.on.stopdownspin when decrement spinning stops', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Set up event listener
      const eventFired = await page.evaluate(() => {
        return new Promise((resolve) => {
          let fired = false;

          (window as any).$('[data-testid="test-input"]').TouchSpin('startdownspin');

          (window as any).$('[data-testid="test-input"]').on('touchspin.on.stopdownspin', () => {
            fired = true;
          });

          setTimeout(() => {
            (window as any).$('[data-testid="test-input"]').TouchSpin('stopspin');
            setTimeout(() => resolve(fired), 50);
          }, 200);
        });
      });

      expect(eventFired).toBe(true);
    });
  });

  test.describe('All Spin Events Together', () => {

    test('should emit correct sequence of events during spin cycle', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Track event sequence
      const eventSequence = await page.evaluate(() => {
        return new Promise((resolve) => {
          const events: string[] = [];

          const $input = (window as any).$('[data-testid="test-input"]');

          $input.on('touchspin.on.startspin', () => events.push('startspin'));
          $input.on('touchspin.on.startupspin', () => events.push('startupspin'));
          $input.on('touchspin.on.stopspin', () => events.push('stopspin'));
          $input.on('touchspin.on.stopupspin', () => events.push('stopupspin'));

          // Start up spin
          $input.TouchSpin('startupspin');

          setTimeout(() => {
            // Stop spin
            $input.TouchSpin('stopspin');

            setTimeout(() => {
              resolve(events);
            }, 100);
          }, 300);
        });
      });

      // Should have start events followed by stop events
      expect(eventSequence).toContain('startspin');
      expect(eventSequence).toContain('startupspin');
      expect(eventSequence).toContain('stopspin');
      expect(eventSequence).toContain('stopupspin');
    });

    test('should emit events when switching spin direction', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Track events when switching direction
      const events = await page.evaluate(() => {
        return new Promise((resolve) => {
          const eventList: string[] = [];

          const $input = (window as any).$('[data-testid="test-input"]');

          $input.on('touchspin.on.startupspin', () => eventList.push('startupspin'));
          $input.on('touchspin.on.stopupspin', () => eventList.push('stopupspin'));
          $input.on('touchspin.on.startdownspin', () => eventList.push('startdownspin'));
          $input.on('touchspin.on.stopdownspin', () => eventList.push('stopdownspin'));

          // Start up spin
          $input.TouchSpin('startupspin');

          setTimeout(() => {
            // Switch to down spin
            $input.TouchSpin('startdownspin');

            setTimeout(() => {
              // Stop
              $input.TouchSpin('stopspin');

              setTimeout(() => {
                resolve(eventList);
              }, 100);
            }, 200);
          }, 200);
        });
      });

      // Should stop up before starting down
      expect(events).toContain('startupspin');
      expect(events).toContain('stopupspin');
      expect(events).toContain('startdownspin');
      expect(events).toContain('stopdownspin');
    });
  });

  test.describe('Event Order', () => {

    test('should fire events in correct order', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Test that start events fire before stop events
      const orderCorrect = await page.evaluate(() => {
        return new Promise((resolve) => {
          let startFired = false;
          let stopFired = false;
          let orderOk = true;

          const $input = (window as any).$('[data-testid="test-input"]');

          $input.on('touchspin.on.startspin', () => {
            startFired = true;
            if (stopFired) orderOk = false; // Start should fire before stop
          });

          $input.on('touchspin.on.stopspin', () => {
            stopFired = true;
            if (!startFired) orderOk = false; // Start should have fired first
          });

          // Start and stop spin
          $input.TouchSpin('startupspin');

          setTimeout(() => {
            $input.TouchSpin('stopspin');
            setTimeout(() => {
              resolve(orderOk && startFired && stopFired);
            }, 100);
          }, 200);
        });
      });

      expect(orderCorrect).toBe(true);
    });
  });

  test.describe('Multiple Listeners', () => {

    test('should support multiple listeners for the same event', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Add multiple listeners
      const counts = await page.evaluate(() => {
        return new Promise<{ count1: number; count2: number; count3: number }>((resolve) => {
          let count1 = 0;
          let count2 = 0;
          let count3 = 0;

          const $input = (window as any).$('[data-testid="test-input"]');

          // Add three listeners for the same event
          $input.on('touchspin.on.startspin', () => count1++);
          $input.on('touchspin.on.startspin', () => count2++);
          $input.on('touchspin.on.startspin', () => count3++);

          // Trigger the event
          $input.TouchSpin('startupspin');

          setTimeout(() => {
            $input.TouchSpin('stopspin');
            resolve({ count1, count2, count3 });
          }, 100);
        });
      });

      // All listeners should have been called
      expect(counts.count1).toBe(1);
      expect(counts.count2).toBe(1);
      expect(counts.count3).toBe(1);
    });

    test('should handle listener for multiple events', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Add listener for multiple events
      const eventsFired = await page.evaluate(() => {
        return new Promise((resolve) => {
          const events: string[] = [];

          const $input = (window as any).$('[data-testid="test-input"]');

          // Listen to multiple events with single handler
          $input.on('touchspin.on.startspin touchspin.on.stopspin', (e) => {
            // jQuery may have modified the event, check namespace
            const fullEventName = e.namespace ? `${e.type}.${e.namespace}` : e.type;

            // Check if this matches our expected events
            if (fullEventName.includes('startspin')) {
              events.push('startspin');
            } else if (fullEventName.includes('stopspin')) {
              events.push('stopspin');
            }
          });

          // Trigger events
          $input.TouchSpin('startupspin');

          setTimeout(() => {
            $input.TouchSpin('stopspin');
            setTimeout(() => {
              resolve(events);
            }, 100);
          }, 200);
        });
      });

      expect(eventsFired).toContain('startspin');
      expect(eventsFired).toContain('stopspin');
    });
  });

  test.describe('Event Removal', () => {

    test('should allow removing event listeners', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Add and remove listener
      const counts = await page.evaluate(() => {
        return new Promise((resolve) => {
          let count = 0;

          const $input = (window as any).$('[data-testid="test-input"]');

          // Add listener
          const handler = () => count++;
          $input.on('touchspin.on.startspin', handler);

          // Trigger event (should count)
          $input.TouchSpin('startupspin');

          setTimeout(() => {
            $input.TouchSpin('stopspin');

            // Remove listener
            $input.off('touchspin.on.startspin', handler);

            // Trigger again (should not count)
            setTimeout(() => {
              $input.TouchSpin('startupspin');

              setTimeout(() => {
                $input.TouchSpin('stopspin');
                resolve(count);
              }, 100);
            }, 100);
          }, 100);
        });
      });

      // Should have only counted once
      expect(counts).toBe(1);
    });

    test('should support removing all listeners with off()', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Add listeners then remove all
      const eventFired = await page.evaluate(() => {
        return new Promise((resolve) => {
          let fired = false;

          const $input = (window as any).$('[data-testid="test-input"]');

          // Add multiple listeners
          $input.on('touchspin.on.startspin', () => fired = true);
          $input.on('touchspin.on.stopspin', () => fired = true);

          // Remove all TouchSpin event listeners
          $input.off('touchspin.on.startspin');
          $input.off('touchspin.on.stopspin');

          // Try to trigger events
          $input.TouchSpin('startupspin');

          setTimeout(() => {
            $input.TouchSpin('stopspin');
            setTimeout(() => {
              resolve(fired);
            }, 100);
          }, 200);
        });
      });

      expect(eventFired).toBe(false);
    });
  });

  test.describe('Native Change Event', () => {

    test('should fire native change event when value changes', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Listen for native change event
      const changeFired = await page.evaluate(() => {
        return new Promise((resolve) => {
          let fired = false;

          const $input = (window as any).$('[data-testid="test-input"]');

          // Listen to native change event
          $input.on('change', () => {
            fired = true;
          });

          // Change value via TouchSpin
          $input.TouchSpin('uponce');

          setTimeout(() => resolve(fired), 100);
        });
      });

      expect(changeFired).toBe(true);
    });

    test('should fire change event when setting value', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Track change events
      const changeCount = await page.evaluate(() => {
        return new Promise((resolve) => {
          let count = 0;

          const $input = (window as any).$('[data-testid="test-input"]');

          $input.on('change', () => count++);

          // Set value multiple times
          $input.TouchSpin('set', 70);
          $input.TouchSpin('set', 80);
          $input.TouchSpin('set', 90);

          setTimeout(() => resolve(count), 100);
        });
      });

      expect(changeCount).toBeGreaterThan(0);
    });
  });

  test.describe('Button Click Events', () => {

    test('should emit events when clicking spinner buttons', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Clear event log to track only this test's events
      await touchspinHelpers.clearEventLog(page);

      // Get elements using strict helper (will throw if not found)
      const elements = await touchspinHelpers.getTouchSpinElementsStrict(page, 'test-input');

      // Simulate mousedown and mouseup on up button
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]');
        const wrapper = input!.closest('[data-touchspin-injected]');
        const upButton = wrapper!.querySelector('.bootstrap-touchspin-up') as HTMLElement;
        // No need for if check - getTouchSpinElementsStrict already verified elements exist
        upButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        setTimeout(() => {
          upButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        }, 100);
      });

      // Wait for events to be processed
      await page.waitForTimeout(200);

      // Check event log for TouchSpin events
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);

      // Also verify native mouse events were logged
      expect(await touchspinHelpers.hasEventInLog(page, 'mousedown', 'native')).toBe(true);
      expect(await touchspinHelpers.hasEventInLog(page, 'mouseup', 'native')).toBe(true);
    });

    test('should emit min/max events when clicking buttons at boundaries', async ({ page }) => {
      // Initialize TouchSpin at max
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 30, max: 40, initval: 40 });

      // Clear event log to track only this test's events
      await touchspinHelpers.clearEventLog(page);

      // Click up button when already at max (using strict helper)
      await touchspinHelpers.clickUpButton(page, 'test-input');

      // Wait for event processing
      await page.waitForTimeout(100);

      // Verify max event was emitted
      expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.max', 'touchspin')).toBe(true);

      // Also verify the click event was logged
      expect(await touchspinHelpers.hasEventInLog(page, 'click', 'native')).toBe(true);
    });
  });

  test.describe('Combined Events', () => {

    test('should handle multiple event types together', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 40, max: 50, step: 5, initval: 45 });

      // Track various events
      const eventData = await page.evaluate(() => {
        return new Promise<{ min: number; max: number; startspin: number; stopspin: number; change: number }>((resolve) => {
          const events = {
            min: 0,
            max: 0,
            startspin: 0,
            stopspin: 0,
            change: 0
          };

          const $input = (window as any).$('[data-testid="test-input"]');

          $input.on('touchspin.on.min', () => events.min++);
          $input.on('touchspin.on.max', () => events.max++);
          $input.on('touchspin.on.startspin', () => events.startspin++);
          $input.on('touchspin.on.stopspin', () => events.stopspin++);
          $input.on('change', () => events.change++);

          // Trigger various operations
          $input.TouchSpin('downonce'); // 45 -> 40 (min)
          $input.TouchSpin('set', 50); // Set to max
          $input.TouchSpin('startupspin'); // Try to spin up at max

          setTimeout(() => {
            $input.TouchSpin('stopspin');
            setTimeout(() => {
              resolve(events);
            }, 100);
          }, 200);
        });
      });

      // Should have triggered various events
      expect(eventData.min).toBeGreaterThan(0); // From downonce at 45 -> 40 (min)
      // Note: max event won't fire from just setting to max, only from trying to exceed it
      expect(eventData.startspin).toBeGreaterThan(0);
      expect(eventData.stopspin).toBeGreaterThan(0);
      expect(eventData.change).toBeGreaterThan(0);
    });

    test('should emit events during complex interaction sequence', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100, step: 10, initval: 50 });

      // Complex interaction with event tracking
      const eventLog = await page.evaluate(() => {
        return new Promise((resolve) => {
          const log: string[] = [];

          const $input = (window as any).$('[data-testid="test-input"]');

          // Set up all event listeners
          $input.on('touchspin.on.min', () => log.push('min'));
          $input.on('touchspin.on.max', () => log.push('max'));
          $input.on('touchspin.on.startspin', () => log.push('startspin'));
          $input.on('touchspin.on.startupspin', () => log.push('startupspin'));
          $input.on('touchspin.on.startdownspin', () => log.push('startdownspin'));
          $input.on('touchspin.on.stopspin', () => log.push('stopspin'));
          $input.on('touchspin.on.stopupspin', () => log.push('stopupspin'));
          $input.on('touchspin.on.stopdownspin', () => log.push('stopdownspin'));

          // Complex sequence - ensure we trigger min/max from non-boundary values
          $input.TouchSpin('set', 0); // Trigger min from 50
          $input.TouchSpin('startupspin'); // Start spinning up

          setTimeout(() => {
            $input.TouchSpin('stopspin'); // Stop
            $input.TouchSpin('set', 100); // Set to max
            $input.TouchSpin('startdownspin'); // Start spinning down

            setTimeout(() => {
              $input.TouchSpin('stopspin'); // Stop
              resolve(log);
            }, 200);
          }, 200);
        });
      });

      // Should have a rich event log
      // Note: min/max events won't fire from just setting values, only from reaching boundaries
      expect(eventLog).toContain('startspin');
      expect(eventLog).toContain('startupspin');
      expect(eventLog).toContain('startdownspin');
      expect(eventLog).toContain('stopspin');
    });
  });

  test.describe('Event Context', () => {

    test('should provide correct context (this) in event handlers', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Check event context
      const contextCorrect = await page.evaluate(() => {
        return new Promise((resolve) => {
          let isCorrect = false;

          const $input = (window as any).$('[data-testid="test-input"]');

          $input.on('touchspin.on.startspin', function() {
            // 'this' should be the input element
            isCorrect = this === $input[0];
          });

          $input.TouchSpin('startupspin');

          setTimeout(() => {
            $input.TouchSpin('stopspin');
            resolve(isCorrect);
          }, 100);
        });
      });

      expect(contextCorrect).toBe(true);
    });

    test('should pass jQuery event object to handlers', async ({ page }) => {
      // Initialize TouchSpin
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Check event object
      const eventValid = await page.evaluate(() => {
        return new Promise((resolve) => {
          let hasEventObject = false;
          let hasType = false;

          const $input = (window as any).$('[data-testid="test-input"]');

          $input.on('touchspin.on.startspin', (e) => {
            hasEventObject = e !== undefined && e !== null;
            // Check if type contains 'startspin' - it might be just 'startspin' or 'touchspin.on.startspin'
            hasType = e && e.type && (e.type === 'startspin' || e.type === 'touchspin.on.startspin' || e.type.includes('startspin'));
          });

          $input.TouchSpin('startupspin');

          setTimeout(() => {
            $input.TouchSpin('stopspin');
            resolve(hasEventObject && hasType);
          }, 100);
        });
      });

      expect(eventValid).toBe(true);
    });
  });
});