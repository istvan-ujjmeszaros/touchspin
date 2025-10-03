import type { Page } from '@playwright/test';
import { getTouchSpinElements, getTouchSpinWrapper } from '../core/elements';
import { upButtonIn, downButtonIn } from '../core/selectors';

/* ──────────────────────────
 * Button interactions
 * ────────────────────────── */

/**
 * When I click the up button on "{testId}"
 */
export async function clickUpButton(page: Page, testId: string): Promise<void> {
  const { upButton } = await getTouchSpinElements(page, testId);
  await upButton.click();
}

/**
 * When I click the down button on "{testId}"
 */
export async function clickDownButton(page: Page, testId: string): Promise<void> {
  const { downButton } = await getTouchSpinElements(page, testId);
  await downButton.click();
}

/**
 * When I hold the up button on "{testId}" for {durationMs} milliseconds
 */
export async function holdUpButton(page: Page, testId: string, durationMs: number): Promise<void> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  const btn = upButtonIn(wrapper);
  if ((await btn.count()) === 0) throw new Error(`Up button not found for "${testId}".`);
  await btn.dispatchEvent('mousedown');
  await page.waitForTimeout(durationMs);
  await btn.dispatchEvent('mouseup');
}

export async function holdDownButton(
  page: Page,
  testId: string,
  durationMs: number
): Promise<void> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  const btn = downButtonIn(wrapper);
  if ((await btn.count()) === 0) throw new Error(`Down button not found for "${testId}".`);
  await btn.dispatchEvent('mousedown');
  await page.waitForTimeout(durationMs);
  await btn.dispatchEvent('mouseup');
}

export async function focusUpButton(page: Page, testId: string): Promise<void> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  await upButtonIn(wrapper).focus();
}

export async function focusDownButton(page: Page, testId: string): Promise<void> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  await downButtonIn(wrapper).focus();
}

/** Quick "is disabled" check for the up button. */
export async function checkTouchspinUpIsDisabled(page: Page, testId: string): Promise<boolean> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  return upButtonIn(wrapper).isDisabled();
}
