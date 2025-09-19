import type { Page } from '@playwright/test';

/* ──────────────────────────
 * Event-based expectations
 * ────────────────────────── */

export async function expectEventFired(
  page: Page,
  eventName: string,
  timeout = 3000
): Promise<void> {
  await page.waitForFunction(
    (eventName) => {
      const log = (window as any).eventLog || [];
      return log.some((e: any) => e.event === eventName);
    },
    eventName,
    { timeout }
  );
}

export async function expectNoEvent(
  page: Page,
  eventName: string,
  timeout = 1000
): Promise<void> {
  try {
    await expectEventFired(page, eventName, timeout);
    throw new Error(`Expected event '${eventName}' NOT to be fired, but it appeared in the log.`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!/Timeout/i.test(msg)) throw err; // timeout = success
  }
}

export async function expectEventCount(
  page: Page,
  eventName: string,
  count: number,
  timeout = 3000
): Promise<void> {
  await page.waitForFunction(
    ({ eventName, count }) => {
      const log = (window as any).eventLog || [];
      return log.filter((e: any) => e.event === eventName).length === count;
    },
    { eventName, count },
    { timeout }
  );
}