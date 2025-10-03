import type { Page } from '@playwright/test';
import { inputById } from '../core/selectors';

/* ──────────────────────────
 * Mouse wheel helpers
 * ────────────────────────── */

/**
 * When I scroll up with the mouse wheel on "{testId}"
 */
export async function wheelUpOnInput(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.mouse.wheel(0, -100);
}

/**
 * When I scroll down with the mouse wheel on "{testId}"
 */
export async function wheelDownOnInput(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.mouse.wheel(0, 100);
}
