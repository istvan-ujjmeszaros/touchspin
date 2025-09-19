import type { Page } from '@playwright/test';

/* ──────────────────────────
 * Page readiness and wait utilities
 * ────────────────────────── */

export async function waitForPageReady(
  page: Page,
  readyFlag = 'testPageReady',
  timeout = 5000
): Promise<void> {
  await page.waitForFunction((flag) => (window as any)[flag] === true, readyFlag, { timeout });
}

export async function waitForSanitization(page: Page, _testId: string): Promise<void> {
  // Keep simple; wire a deterministic hook here if you add one in the app.
  await page.waitForTimeout(100);
}