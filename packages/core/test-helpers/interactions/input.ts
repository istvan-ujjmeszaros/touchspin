import type { Page } from '@playwright/test';
import { inputById } from '../core/selectors';
import { waitForTouchspinInitialized } from '../core/elements';

/* ──────────────────────────
 * Input interactions
 * ────────────────────────── */

export async function typeInInput(page: Page, testId: string, text: string): Promise<void> {
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.keyboard.type(text);
}

export async function selectAllInInput(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.keyboard.press('Control+a');
}

export async function readInputValue(page: Page, testId: string): Promise<string> {
  await waitForTouchspinInitialized(page, testId);
  return inputById(page, testId).inputValue();
}

export async function fillWithValue(page: Page, testId: string, value: string): Promise<void> {
  await waitForTouchspinInitialized(page, testId);
  const input = inputById(page, testId);
  await input.focus();
  await input.click({ clickCount: 3 });
  await input.fill(value);
  await page.waitForTimeout(10); // short settle
}

export async function fillWithValueAndBlur(
  page: Page,
  testId: string,
  value: string
): Promise<void> {
  await fillWithValue(page, testId, value);
  const before = await readInputValue(page, testId);
  await page.keyboard.press('Tab');
  try {
    await page.waitForFunction(
      ({ testId, before }) => {
        const el = document.querySelector(
          `[data-testid="${testId}"]`
        ) as HTMLInputElement | null;
        return !!el && el.value !== before;
      },
      { testId, before },
      { timeout: 1000 }
    );
  } catch {
    await page.waitForTimeout(100);
  }
}

/** Set the input value without dispatching input/change events (direct property set), then blur. */
export async function setValueSilentlyAndBlur(
  page: Page,
  testId: string,
  value: string
): Promise<void> {
  await waitForTouchspinInitialized(page, testId);
  // Focus input so that a subsequent Tab will blur it
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.evaluate(({ testId, value }) => {
    const el = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    if (el) el.value = value;
  }, { testId, value });
  await page.keyboard.press('Tab');
}

export async function focusOutside(page: Page, outsideTestId: string): Promise<void> {
  await inputById(page, outsideTestId).focus();
}

export async function blurAway(page: Page): Promise<void> {
  await page.click('#blur-target');
}

/** Enable/disable boolean attributes on input (`disabled` / `readonly`). */
export async function setInputAttribute(
  page: Page,
  testId: string,
  attributeName: 'disabled' | 'readonly',
  attributeValue: boolean
): Promise<void> {
  await waitForTouchspinInitialized(page, testId);
  const input = inputById(page, testId);
  if (attributeValue) {
    await input.evaluate((el, attr) => el.setAttribute(attr, ''), attributeName);
  } else {
    await input.evaluate((el, attr) => el.removeAttribute(attr), attributeName);
  }
}

export async function getInputAttribute(
  page: Page,
  testId: string,
  attributeName: string
): Promise<string | null> {
  await waitForTouchspinInitialized(page, testId);
  return inputById(page, testId).getAttribute(attributeName);
}
