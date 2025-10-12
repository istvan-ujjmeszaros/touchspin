import type { Page } from '@playwright/test';

/* ──────────────────────────
 * Page readiness and wait utilities
 * ────────────────────────── */

/**
 * When I wait for the page to be ready
 */
export async function waitForPageReady(
  page: Page,
  readyFlag = 'testPageReady',
  timeout = 5000
): Promise<void> {
  await page.waitForFunction(
    (flag: string) => (window as unknown as Record<string, unknown>)[flag] === true,
    readyFlag,
    { timeout }
  );
}

/**
 * When I wait for value sanitization to complete
 */
export async function waitForSanitization(page: Page, _testId: string): Promise<void> {
  // Keep simple; wire a deterministic hook here if you add one in the app.
  await page.waitForTimeout(100);
}
