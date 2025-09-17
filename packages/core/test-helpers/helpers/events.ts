import { Page } from '@playwright/test';

/**
 * Event verification utilities for TouchSpin Core tests
 * Works with the event logging system in test fixtures
 */

export interface EventLogEntry {
  type: 'native' | 'touchspin';
  event: string;
  timestamp: number;
  target?: string;
  value?: string | number;
  detail?: any;
}

/**
 * Clear the event log
 * @param page Playwright page object
 */
export async function clearEventLog(page: Page): Promise<void> {
  await page.evaluate(() => {
    if (typeof window.clearEventLog === 'function') {
      window.clearEventLog();
    }
  });
}

/**
 * Get the full event log
 * @param page Playwright page object
 */
export async function getEventLog(page: Page): Promise<EventLogEntry[]> {
  return await page.evaluate(() => {
    return window.eventLog || [];
  });
}

/**
 * Check if a specific event exists in the log
 * @param page Playwright page object
 * @param eventName Name of the event to check
 * @param eventType Type of event ('native' | 'touchspin' | undefined for any)
 * @param target Optional target filter
 */
export async function hasEventInLog(page: Page, eventName: string, eventType?: 'native' | 'touchspin', target?: string): Promise<boolean> {
  return await page.evaluate(({ eventName, eventType, target }) => {
    const log = window.eventLog || [];
    return log.some((entry: any) => {
      if (entry.event !== eventName) return false;
      if (eventType && entry.type !== eventType) return false;
      if (target && entry.target !== target) return false;
      return true;
    });
  }, { eventName, eventType, target });
}

/**
 * Count occurrences of a specific event in the log
 * @param page Playwright page object
 * @param eventName Name of the event to count
 * @param eventType Type of event ('native' | 'touchspin' | undefined for any)
 * @param target Optional target filter
 */
export async function countEventInLog(page: Page, eventName: string, eventType?: 'native' | 'touchspin', target?: string): Promise<number> {
  return await page.evaluate(({ eventName, eventType, target }) => {
    const log = window.eventLog || [];
    return log.filter((entry: any) => {
      if (entry.event !== eventName) return false;
      if (eventType && entry.type !== eventType) return false;
      if (target && entry.target !== target) return false;
      return true;
    }).length;
  }, { eventName, eventType, target });
}

/**
 * Get all events of a specific type
 * @param page Playwright page object
 * @param eventType Type of events to get
 */
export async function getEventsOfType(page: Page, eventType: 'native' | 'touchspin'): Promise<EventLogEntry[]> {
  return await page.evaluate(({ eventType }) => {
    const log = window.eventLog || [];
    return log.filter((entry: any) => entry.type === eventType);
  }, { eventType });
}

/**
 * Get the last event in the log
 * @param page Playwright page object
 */
export async function getLastEvent(page: Page): Promise<EventLogEntry | null> {
  return await page.evaluate(() => {
    const log = window.eventLog || [];
    return log.length > 0 ? log[log.length - 1] : null;
  });
}

/**
 * Get the last event of a specific type
 * @param page Playwright page object
 * @param eventType Type of event
 */
export async function getLastEventOfType(page: Page, eventType: 'native' | 'touchspin'): Promise<EventLogEntry | null> {
  return await page.evaluate(({ eventType }) => {
    const log = window.eventLog || [];
    const filtered = log.filter((entry: any) => entry.type === eventType);
    return filtered.length > 0 ? filtered[filtered.length - 1] : null;
  }, { eventType });
}

/**
 * Wait for a specific event to appear in the log
 * @param page Playwright page object
 * @param eventName Name of the event to wait for
 * @param options Options for waiting
 */
export async function waitForEventInLog(page: Page, eventName: string, options: {
  eventType?: 'native' | 'touchspin';
  target?: string;
  timeout?: number;
} = {}): Promise<void> {
  const { eventType, target, timeout = 5000 } = options;

  await page.waitForFunction(
    ({ eventName, eventType, target }) => {
      const log = window.eventLog || [];
      return log.some((entry: any) => {
        if (entry.event !== eventName) return false;
        if (eventType && entry.type !== eventType) return false;
        if (target && entry.target !== target) return false;
        return true;
      });
    },
    { eventName, eventType, target },
    { timeout }
  );
}

/**
 * Wait for multiple events to appear in the log
 * @param page Playwright page object
 * @param eventNames Names of events to wait for
 * @param options Options for waiting
 */
export async function waitForEventsInLog(page: Page, eventNames: string[], options: {
  eventType?: 'native' | 'touchspin';
  target?: string;
  timeout?: number;
} = {}): Promise<void> {
  const { eventType, target, timeout = 5000 } = options;

  await page.waitForFunction(
    ({ eventNames, eventType, target }) => {
      const log = window.eventLog || [];
      return eventNames.every((eventName: string) => {
        return log.some((entry: any) => {
          if (entry.event !== eventName) return false;
          if (eventType && entry.type !== eventType) return false;
          if (target && entry.target !== target) return false;
          return true;
        });
      });
    },
    { eventNames, eventType, target },
    { timeout }
  );
}

/**
 * Wait for an event sequence to appear in the log (in order)
 * @param page Playwright page object
 * @param eventSequence Sequence of events to wait for
 * @param options Options for waiting
 */
export async function waitForEventSequence(page: Page, eventSequence: string[], options: {
  eventType?: 'native' | 'touchspin';
  target?: string;
  timeout?: number;
} = {}): Promise<void> {
  const { eventType, target, timeout = 5000 } = options;

  await page.waitForFunction(
    ({ eventSequence, eventType, target }) => {
      const log = window.eventLog || [];
      const filteredLog = log.filter((entry: any) => {
        if (eventType && entry.type !== eventType) return false;
        if (target && entry.target !== target) return false;
        return true;
      });

      let sequenceIndex = 0;
      for (const entry of filteredLog) {
        if (entry.event === eventSequence[sequenceIndex]) {
          sequenceIndex++;
          if (sequenceIndex >= eventSequence.length) {
            return true;
          }
        }
      }
      return false;
    },
    { eventSequence, eventType, target },
    { timeout }
  );
}

/**
 * Get events between two timestamps
 * @param page Playwright page object
 * @param startTime Start timestamp
 * @param endTime End timestamp
 */
export async function getEventsBetween(page: Page, startTime: number, endTime: number): Promise<EventLogEntry[]> {
  return await page.evaluate(({ startTime, endTime }) => {
    const log = window.eventLog || [];
    return log.filter((entry: any) => entry.timestamp >= startTime && entry.timestamp <= endTime);
  }, { startTime, endTime });
}

/**
 * Get current timestamp for event filtering
 * @param page Playwright page object
 */
export async function getCurrentTimestamp(page: Page): Promise<number> {
  return await page.evaluate(() => Date.now());
}

/**
 * Manually log an event (useful for test markers)
 * @param page Playwright page object
 * @param eventName Event name
 * @param details Event details
 */
export async function logEvent(page: Page, eventName: string, details: any = {}): Promise<void> {
  await page.evaluate(({ eventName, details }) => {
    if (typeof window.logEvent === 'function') {
      window.logEvent(eventName, details);
    }
  }, { eventName, details });
}

/**
 * Assert that TouchSpin events are emitted in correct order
 * @param page Playwright page object
 * @param expectedSequence Expected event sequence
 * @param target Target element
 */
export async function assertTouchSpinEventSequence(page: Page, expectedSequence: string[], target?: string): Promise<void> {
  const touchspinEvents = await getEventsOfType(page, 'touchspin');
  const filteredEvents = target
    ? touchspinEvents.filter(e => e.target === target)
    : touchspinEvents;

  const eventNames = filteredEvents.map(e => e.event);

  // Check if the expected sequence exists in the actual events
  let sequenceIndex = 0;
  for (const eventName of eventNames) {
    if (eventName === expectedSequence[sequenceIndex]) {
      sequenceIndex++;
      if (sequenceIndex >= expectedSequence.length) {
        return; // Found complete sequence
      }
    }
  }

  throw new Error(`Expected TouchSpin event sequence ${expectedSequence.join(' -> ')} not found. Actual events: ${eventNames.join(' -> ')}`);
}

export default {
  clearEventLog,
  getEventLog,
  hasEventInLog,
  countEventInLog,
  getEventsOfType,
  getLastEvent,
  getLastEventOfType,
  waitForEventInLog,
  waitForEventsInLog,
  waitForEventSequence,
  getEventsBetween,
  getCurrentTimestamp,
  logEvent,
  assertTouchSpinEventSequence
};