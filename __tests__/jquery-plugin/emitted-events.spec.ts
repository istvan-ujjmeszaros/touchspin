/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../__tests__/helpers/touchspinHelpers';

test.describe('jQuery TouchSpin Emitted Events', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/packages/jquery-plugin/tests/html/emitted-events.html');

    // Wait for TouchSpin to be ready
    await page.waitForFunction(() => (window as any).touchSpinReady === true);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'jquery-emitted-events');
  });

  test.describe('Boundary Events', () => {

    test('should emit touchspin.on.min when minimum value is reached', async ({ page }) => {
      const testId = 'boundary-min';

      // Initialize TouchSpin with value near min
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100, step: 1 });
      }, testId);

      // Set up event listener
      const eventFired = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let fired = false;
          (window as any).$(`#${id}`).on('touchspin.on.min', () => {
            fired = true;
          });

          // Try to decrement below min
          (window as any).$(`#${id}`).TouchSpin('downonce');
          (window as any).$(`#${id}`).TouchSpin('downonce');

          setTimeout(() => resolve(fired), 100);
        });
      }, testId);

      expect(eventFired).toBe(true);

      // Verify value is at min
      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('0');
    });

    test('should emit touchspin.on.max when maximum value is reached', async ({ page }) => {
      const testId = 'boundary-max';

      // Initialize TouchSpin with value near max
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100, step: 1 });
      }, testId);

      // Set up event listener
      const eventFired = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let fired = false;
          (window as any).$(`#${id}`).on('touchspin.on.max', () => {
            fired = true;
          });

          // Try to increment above max
          (window as any).$(`#${id}`).TouchSpin('uponce');
          (window as any).$(`#${id}`).TouchSpin('uponce');

          setTimeout(() => resolve(fired), 100);
        });
      }, testId);

      expect(eventFired).toBe(true);

      // Verify value is at max
      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('100');
    });

    test('should emit min event when setting value to minimum', async ({ page }) => {
      const testId = 'boundary-min';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 10, max: 100 });
      }, testId);

      // Set up event listener and set to min
      const eventFired = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let fired = false;
          (window as any).$(`#${id}`).on('touchspin.on.min', () => {
            fired = true;
          });

          // Set value to min
          (window as any).$(`#${id}`).TouchSpin('set', 10);

          setTimeout(() => resolve(fired), 100);
        });
      }, testId);

      expect(eventFired).toBe(true);
    });

    test('should emit max event when setting value to maximum', async ({ page }) => {
      const testId = 'boundary-max';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Set up event listener and set to max
      const eventFired = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let fired = false;
          (window as any).$(`#${id}`).on('touchspin.on.max', () => {
            fired = true;
          });

          // Set value to max
          (window as any).$(`#${id}`).TouchSpin('set', 100);

          setTimeout(() => resolve(fired), 100);
        });
      }, testId);

      expect(eventFired).toBe(true);
    });
  });

  test.describe('Start Spin Events', () => {

    test('should emit touchspin.on.startspin when any spinning starts', async ({ page }) => {
      const testId = 'startspin-events';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Test up spin triggers startspin
      let eventFired = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let fired = false;
          (window as any).$(`#${id}`).on('touchspin.on.startspin', () => {
            fired = true;
          });

          (window as any).$(`#${id}`).TouchSpin('startupspin');

          setTimeout(() => {
            (window as any).$(`#${id}`).TouchSpin('stopspin');
            (window as any).$(`#${id}`).off('touchspin.on.startspin');
            resolve(fired);
          }, 100);
        });
      }, testId);

      expect(eventFired).toBe(true);

      // Test down spin also triggers startspin
      eventFired = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let fired = false;
          (window as any).$(`#${id}`).on('touchspin.on.startspin', () => {
            fired = true;
          });

          (window as any).$(`#${id}`).TouchSpin('startdownspin');

          setTimeout(() => {
            (window as any).$(`#${id}`).TouchSpin('stopspin');
            resolve(fired);
          }, 100);
        });
      }, testId);

      expect(eventFired).toBe(true);
    });

    test('should emit touchspin.on.startupspin when increment spinning starts', async ({ page }) => {
      const testId = 'startspin-events';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Set up event listener
      const eventFired = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let fired = false;
          (window as any).$(`#${id}`).on('touchspin.on.startupspin', () => {
            fired = true;
          });

          (window as any).$(`#${id}`).TouchSpin('startupspin');

          setTimeout(() => {
            (window as any).$(`#${id}`).TouchSpin('stopspin');
            resolve(fired);
          }, 100);
        });
      }, testId);

      expect(eventFired).toBe(true);
    });

    test('should emit touchspin.on.startdownspin when decrement spinning starts', async ({ page }) => {
      const testId = 'startspin-events';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Set up event listener
      const eventFired = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let fired = false;
          (window as any).$(`#${id}`).on('touchspin.on.startdownspin', () => {
            fired = true;
          });

          (window as any).$(`#${id}`).TouchSpin('startdownspin');

          setTimeout(() => {
            (window as any).$(`#${id}`).TouchSpin('stopspin');
            resolve(fired);
          }, 100);
        });
      }, testId);

      expect(eventFired).toBe(true);
    });
  });

  test.describe('Stop Spin Events', () => {

    test('should emit touchspin.on.stopspin when any spinning stops', async ({ page }) => {
      const testId = 'stopspin-events';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Test stopping up spin
      const eventFired = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let fired = false;

          (window as any).$(`#${id}`).TouchSpin('startupspin');

          (window as any).$(`#${id}`).on('touchspin.on.stopspin', () => {
            fired = true;
          });

          setTimeout(() => {
            (window as any).$(`#${id}`).TouchSpin('stopspin');
            setTimeout(() => resolve(fired), 50);
          }, 200);
        });
      }, testId);

      expect(eventFired).toBe(true);
    });

    test('should emit touchspin.on.stopupspin when increment spinning stops', async ({ page }) => {
      const testId = 'stopspin-events';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Set up event listener
      const eventFired = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let fired = false;

          (window as any).$(`#${id}`).TouchSpin('startupspin');

          (window as any).$(`#${id}`).on('touchspin.on.stopupspin', () => {
            fired = true;
          });

          setTimeout(() => {
            (window as any).$(`#${id}`).TouchSpin('stopspin');
            setTimeout(() => resolve(fired), 50);
          }, 200);
        });
      }, testId);

      expect(eventFired).toBe(true);
    });

    test('should emit touchspin.on.stopdownspin when decrement spinning stops', async ({ page }) => {
      const testId = 'stopspin-events';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Set up event listener
      const eventFired = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let fired = false;

          (window as any).$(`#${id}`).TouchSpin('startdownspin');

          (window as any).$(`#${id}`).on('touchspin.on.stopdownspin', () => {
            fired = true;
          });

          setTimeout(() => {
            (window as any).$(`#${id}`).TouchSpin('stopspin');
            setTimeout(() => resolve(fired), 50);
          }, 200);
        });
      }, testId);

      expect(eventFired).toBe(true);
    });
  });

  test.describe('All Spin Events Together', () => {

    test('should emit correct sequence of events during spin cycle', async ({ page }) => {
      const testId = 'all-spin-events';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Track event sequence
      const eventSequence = await page.evaluate((id) => {
        return new Promise((resolve) => {
          const events: string[] = [];

          const $input = (window as any).$(`#${id}`);

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
      }, testId);

      // Should have start events followed by stop events
      expect(eventSequence).toContain('startspin');
      expect(eventSequence).toContain('startupspin');
      expect(eventSequence).toContain('stopspin');
      expect(eventSequence).toContain('stopupspin');
    });

    test('should emit events when switching spin direction', async ({ page }) => {
      const testId = 'all-spin-events';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Track events when switching direction
      const events = await page.evaluate((id) => {
        return new Promise((resolve) => {
          const eventList: string[] = [];

          const $input = (window as any).$(`#${id}`);

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
      }, testId);

      // Should stop up before starting down
      expect(events).toContain('startupspin');
      expect(events).toContain('stopupspin');
      expect(events).toContain('startdownspin');
      expect(events).toContain('stopdownspin');
    });
  });

  test.describe('Event Order', () => {

    test('should fire events in correct order', async ({ page }) => {
      const testId = 'event-order';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Test that start events fire before stop events
      const orderCorrect = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let startFired = false;
          let stopFired = false;
          let orderOk = true;

          const $input = (window as any).$(`#${id}`);

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
      }, testId);

      expect(orderCorrect).toBe(true);
    });
  });

  test.describe('Multiple Listeners', () => {

    test('should support multiple listeners for the same event', async ({ page }) => {
      const testId = 'multiple-listeners';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Add multiple listeners
      const counts = await page.evaluate((id) => {
        return new Promise<{ count1: number; count2: number; count3: number }>((resolve) => {
          let count1 = 0;
          let count2 = 0;
          let count3 = 0;

          const $input = (window as any).$(`#${id}`);

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
      }, testId);

      // All listeners should have been called
      expect(counts.count1).toBe(1);
      expect(counts.count2).toBe(1);
      expect(counts.count3).toBe(1);
    });

    test('should handle listener for multiple events', async ({ page }) => {
      const testId = 'multiple-listeners';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Add listener for multiple events
      const eventsFired = await page.evaluate((id) => {
        return new Promise((resolve) => {
          const events: string[] = [];

          const $input = (window as any).$(`#${id}`);

          // Listen to multiple events with single handler
          $input.on('touchspin.on.startspin touchspin.on.stopspin', (e) => {
            events.push(e.type.replace('touchspin.on.', ''));
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
      }, testId);

      expect(eventsFired).toContain('startspin');
      expect(eventsFired).toContain('stopspin');
    });
  });

  test.describe('Event Removal', () => {

    test('should allow removing event listeners', async ({ page }) => {
      const testId = 'event-removal';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Add and remove listener
      const counts = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let count = 0;

          const $input = (window as any).$(`#${id}`);

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
      }, testId);

      // Should have only counted once
      expect(counts).toBe(1);
    });

    test('should support removing all listeners with off()', async ({ page }) => {
      const testId = 'event-removal';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Add listeners then remove all
      const eventFired = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let fired = false;

          const $input = (window as any).$(`#${id}`);

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
      }, testId);

      expect(eventFired).toBe(false);
    });
  });

  test.describe('Native Change Event', () => {

    test('should fire native change event when value changes', async ({ page }) => {
      const testId = 'native-change';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Listen for native change event
      const changeFired = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let fired = false;

          const $input = (window as any).$(`#${id}`);

          // Listen to native change event
          $input.on('change', () => {
            fired = true;
          });

          // Change value via TouchSpin
          $input.TouchSpin('uponce');

          setTimeout(() => resolve(fired), 100);
        });
      }, testId);

      expect(changeFired).toBe(true);
    });

    test('should fire change event when setting value', async ({ page }) => {
      const testId = 'native-change';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Track change events
      const changeCount = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let count = 0;

          const $input = (window as any).$(`#${id}`);

          $input.on('change', () => count++);

          // Set value multiple times
          $input.TouchSpin('set', 70);
          $input.TouchSpin('set', 80);
          $input.TouchSpin('set', 90);

          setTimeout(() => resolve(count), 100);
        });
      }, testId);

      expect(changeCount).toBeGreaterThan(0);
    });
  });

  test.describe('Button Click Events', () => {

    test('should emit events when clicking spinner buttons', async ({ page }) => {
      const testId = 'button-click';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Set up event listener
      const eventFired = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let fired = false;

          (window as any).$(`#${id}`).on('touchspin.on.startspin', () => {
            fired = true;
          });

          // Click the up button
          const wrapper = document.querySelector(`#${id}`).closest('[data-touchspin-injected]');
          const upButton = wrapper?.querySelector('.bootstrap-touchspin-up') as HTMLElement;
          if (upButton) {
            upButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            setTimeout(() => {
              upButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            }, 100);
          }

          setTimeout(() => resolve(fired), 200);
        });
      }, testId);

      expect(eventFired).toBe(true);
    });

    test('should emit min/max events when clicking buttons at boundaries', async ({ page }) => {
      const testId = 'button-click';

      // Initialize TouchSpin at max
      await page.evaluate((id) => {
        (window as any).$(`#${id}`)
          .TouchSpin({ min: 30, max: 40 })
          .TouchSpin('set', 40);
      }, testId);

      // Try to click up at max
      const maxEventFired = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let fired = false;

          (window as any).$(`#${id}`).on('touchspin.on.max', () => {
            fired = true;
          });

          // Click the up button
          const wrapper = document.querySelector(`#${id}`).closest('[data-touchspin-injected]');
          const upButton = wrapper?.querySelector('.bootstrap-touchspin-up') as HTMLElement;
          if (upButton) {
            upButton.click();
          }

          setTimeout(() => resolve(fired), 100);
        });
      }, testId);

      expect(maxEventFired).toBe(true);
    });
  });

  test.describe('Combined Events', () => {

    test('should handle multiple event types together', async ({ page }) => {
      const testId = 'combined-events';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 40, max: 50, step: 5 });
      }, testId);

      // Track various events
      const eventData = await page.evaluate((id) => {
        return new Promise<{ min: number; max: number; startspin: number; stopspin: number; change: number }>((resolve) => {
          const events = {
            min: 0,
            max: 0,
            startspin: 0,
            stopspin: 0,
            change: 0
          };

          const $input = (window as any).$(`#${id}`);

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
      }, testId);

      // Should have triggered various events
      expect(eventData.min).toBeGreaterThan(0);
      expect(eventData.max).toBeGreaterThan(0);
      expect(eventData.startspin).toBeGreaterThan(0);
      expect(eventData.stopspin).toBeGreaterThan(0);
      expect(eventData.change).toBeGreaterThan(0);
    });

    test('should emit events during complex interaction sequence', async ({ page }) => {
      const testId = 'combined-events';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100, step: 10 });
      }, testId);

      // Complex interaction with event tracking
      const eventLog = await page.evaluate((id) => {
        return new Promise((resolve) => {
          const log: string[] = [];

          const $input = (window as any).$(`#${id}`);

          // Set up all event listeners
          $input.on('touchspin.on.min', () => log.push('min'));
          $input.on('touchspin.on.max', () => log.push('max'));
          $input.on('touchspin.on.startspin', () => log.push('startspin'));
          $input.on('touchspin.on.startupspin', () => log.push('startupspin'));
          $input.on('touchspin.on.startdownspin', () => log.push('startdownspin'));
          $input.on('touchspin.on.stopspin', () => log.push('stopspin'));
          $input.on('touchspin.on.stopupspin', () => log.push('stopupspin'));
          $input.on('touchspin.on.stopdownspin', () => log.push('stopdownspin'));

          // Complex sequence
          $input.TouchSpin('set', 0); // Trigger min
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
      }, testId);

      // Should have a rich event log
      expect(eventLog).toContain('min');
      expect(eventLog).toContain('max');
      expect(eventLog).toContain('startspin');
      expect(eventLog).toContain('startupspin');
      expect(eventLog).toContain('startdownspin');
      expect(eventLog).toContain('stopspin');
    });
  });

  test.describe('Event Context', () => {

    test('should provide correct context (this) in event handlers', async ({ page }) => {
      const testId = 'event-order';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Check event context
      const contextCorrect = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let isCorrect = false;

          const $input = (window as any).$(`#${id}`);

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
      }, testId);

      expect(contextCorrect).toBe(true);
    });

    test('should pass jQuery event object to handlers', async ({ page }) => {
      const testId = 'event-order';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Check event object
      const eventValid = await page.evaluate((id) => {
        return new Promise((resolve) => {
          let hasEventObject = false;
          let correctType = false;

          const $input = (window as any).$(`#${id}`);

          $input.on('touchspin.on.startspin', (e) => {
            hasEventObject = e !== undefined;
            correctType = e.type === 'touchspin.on.startspin';
          });

          $input.TouchSpin('startupspin');

          setTimeout(() => {
            $input.TouchSpin('stopspin');
            resolve(hasEventObject && correctType);
          }, 100);
        });
      }, testId);

      expect(eventValid).toBe(true);
    });
  });
});