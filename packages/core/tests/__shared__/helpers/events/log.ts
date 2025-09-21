import type { Page } from '@playwright/test';
import type { EventLogEntry, EventLogType } from '../types';

/* ──────────────────────────
 * Event log helpers (typed)
 *
 * LAYERING RULES:
 * - Depends on: types.ts
 * - Used by: assertions/events.ts, test scripts
 * - Do not import from: core/*, interactions/*, jquery/*
 * ────────────────────────── */

export async function getEventLog(page: Page): Promise<EventLogEntry[]> {
  return page.evaluate(() => window.eventLog || []);
}

export async function clearEventLog(page: Page): Promise<void> {
  await page.evaluate(() => {
    if (window.clearEventLog) {
      window.clearEventLog();
      return;
    }
    window.eventLog = [];
    const box = document.getElementById('event-log') as HTMLTextAreaElement | null;
    if (box) box.value = '';
  });
}

export async function hasEventInLog(
  page: Page,
  eventName: string,
  eventType?: EventLogType
): Promise<boolean> {
  const log = await getEventLog(page);
  return log.some((e) => e.event === eventName && (!eventType || e.type === eventType));
}

export async function getEventsOfType(
  page: Page,
  eventType: EventLogType
): Promise<EventLogEntry[]> {
  const log = await getEventLog(page);
  return log.filter((e) => e.type === eventType);
}

export async function countEventInLog(
  page: Page,
  eventName: string,
  eventType?: EventLogType
): Promise<number> {
  const log = await getEventLog(page);
  return log.filter((e) => e.event === eventName && (!eventType || e.type === eventType)).length;
}

export async function waitForEventInLog(
  page: Page,
  eventName: string,
  options?: { eventType?: EventLogType; timeout?: number }
): Promise<boolean> {
  const timeout = options?.timeout ?? 5000;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await hasEventInLog(page, eventName, options?.eventType)) return true;
    await page.waitForTimeout(100);
  }
  return false;
}

export async function getEventLogText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const el = document.getElementById('event-log') as HTMLTextAreaElement | null;
    return el?.value ?? '';
  });
}