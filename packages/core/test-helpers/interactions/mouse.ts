import type { Page } from '@playwright/test';
import { inputById } from '../core/selectors';

/* ──────────────────────────
 * Mouse wheel helpers
 * ────────────────────────── */

export async function wheelUpOnInput(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.mouse.wheel(0, -100);
}

export async function wheelDownOnInput(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.mouse.wheel(0, 100);
}