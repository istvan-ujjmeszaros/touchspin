import type { Page, Locator } from '@playwright/test';
import type { TouchSpinElements } from '../types';
import { inputById, wrapperById, upButtonIn, downButtonIn, prefixIn, postfixIn } from './selectors';

/* ──────────────────────────
 * Readiness / initialization
 * ────────────────────────── */

/** True if wrapper with injection marker exists. */
export async function isTouchSpinInitialized(page: Page, testId: string): Promise<boolean> {
  return (await wrapperById(page, testId).locator('[data-touchspin-injected]').count()) > 0;
}

/** Throws a clear error if not initialized. */
export async function expectTouchSpinInitialized(page: Page, testId: string): Promise<void> {
  if (!(await isTouchSpinInitialized(page, testId))) {
    throw new Error(
      `TouchSpin not initialized for "${testId}". Expected [data-testid="${testId}-wrapper"][data-touchspin-injected].`
    );
  }
}

/** True if wrapper (with injection marker) no longer exists. */
export async function isTouchSpinDestroyed(page: Page, testId: string): Promise<boolean> {
  return (await wrapperById(page, testId).locator('[data-touchspin-injected]').count()) === 0;
}

/** Throws if still initialized. */
export async function expectTouchSpinDestroyed(page: Page, testId: string): Promise<void> {
  if (!(await isTouchSpinDestroyed(page, testId))) {
    throw new Error(
      `TouchSpin still initialized for "${testId}". Expected no [data-testid="${testId}-wrapper"].`
    );
  }
}

/** Wait until the input is marked as injected by TouchSpin. */
export async function waitForTouchspinInitialized(
  page: Page,
  testId: string,
  timeout = 5000
): Promise<void> {
  try {
    await inputById(page, testId).locator('[data-touchspin-injected]').waitFor({
      state: 'attached',
      timeout,
    });
  } catch {
    throw new Error(`TouchSpin failed to initialize within ${timeout}ms for testId "${testId}".`);
  }
}

/* ──────────────────────────
 * Element bundles / element ops
 * ────────────────────────── */

export async function getTouchSpinWrapper(page: Page, testId: string): Promise<Locator> {
  await waitForTouchspinInitialized(page, testId);
  const wrapper = wrapperById(page, testId);
  if ((await wrapper.count()) === 0) {
    throw new Error(`TouchSpin wrapper not found for "${testId}".`);
  }
  return wrapper;
}

/** Returns all key locators, throws if critical parts are missing. */
export async function getTouchSpinElements(page: Page, testId: string): Promise<TouchSpinElements> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  const input = inputById(page, testId);
  const upButton = upButtonIn(wrapper);
  const downButton = downButtonIn(wrapper);
  const prefix = prefixIn(wrapper);
  const postfix = postfixIn(wrapper);

  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  if ((await upButton.count()) === 0) throw new Error(`Up button not found for "${testId}".`);
  if ((await downButton.count()) === 0) throw new Error(`Down button not found for "${testId}".`);

  return { wrapper, input, upButton, downButton, prefix, postfix };
}

export function getElement(page: Page, testId: string): Locator {
  return inputById(page, testId);
}

export async function clickElement(page: Page, testId: string): Promise<void> {
  const el = inputById(page, testId);
  if ((await el.count()) === 0) throw new Error(`Element not found for "${testId}".`);
  await el.click();
}