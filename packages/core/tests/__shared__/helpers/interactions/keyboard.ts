import type { Page } from '@playwright/test';
import { inputById } from '../core/selectors';

/* ──────────────────────────
 * Keyboard interactions
 * ────────────────────────── */

/**
 * When I press the up arrow key on "{testId}"
 */
export async function pressUpArrowKeyOnInput(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.keyboard.press('ArrowUp');
}

/**
 * When I press the down arrow key on "{testId}"
 */
export async function pressDownArrowKeyOnInput(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.keyboard.press('ArrowDown');
}

/**
 * When I hold the up arrow key on "{testId}" for {durationMs} milliseconds
 */
export async function holdUpArrowKeyOnInput(
  page: Page,
  testId: string,
  durationMs: number
): Promise<void> {
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(durationMs);
  await page.keyboard.up('ArrowUp');
}

/**
 * When I hold the down arrow key on "{testId}" for {durationMs} milliseconds
 */
export async function holdDownArrowKeyOnInput(
  page: Page,
  testId: string,
  durationMs: number
): Promise<void> {
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(durationMs);
  await page.keyboard.up('ArrowDown');
}