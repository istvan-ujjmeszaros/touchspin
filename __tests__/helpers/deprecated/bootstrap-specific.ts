import type { Page } from '@playwright/test';
import { wrapperById } from '../core/selectors';
import { getTouchSpinWrapper } from '../core/elements';
import { prefixIn, postfixIn } from '../core/selectors';

/* ──────────────────────────
 * Bootstrap-specific helpers (deprecated)
 * NOTE: These remain Bootstrap-specific; consider removing for renderer-agnostic approach
 * ────────────────────────── */

export async function getInputGroupAddons(page: Page, testId: string): Promise<string[]> {
  const wrapper = wrapperById(page, testId);
  if ((await wrapper.count()) === 0) throw new Error(`Wrapper not found for "${testId}".`);
  return wrapper.evaluate((el) =>
    Array.from(el.querySelectorAll('.input-group-addon, .input-group-text'))
      .map((n) => (n.textContent || '').trim())
      .filter(Boolean)
  );
}

export async function checkPrependExists(page: Page): Promise<boolean> {
  return (await page.locator('.input-group-prepend').count()) > 0;
}

export async function checkAppendExists(page: Page): Promise<boolean> {
  return (await page.locator('.input-group-append').count()) > 0;
}

/** Prefix/postfix helpers (renderer-agnostic via injected attributes) */
export async function hasPrefix(
  page: Page,
  testId: string,
  expectedText?: string
): Promise<boolean> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  const prefix = prefixIn(wrapper);
  const exists = (await prefix.count()) > 0;
  if (!exists) return false;
  if (expectedText == null) return true;
  return (await prefix.textContent()) === expectedText;
}

export async function hasPostfix(
  page: Page,
  testId: string,
  expectedText?: string
): Promise<boolean> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  const postfix = postfixIn(wrapper);
  const exists = (await postfix.count()) > 0;
  if (!exists) return false;
  if (expectedText == null) return true;
  return (await postfix.textContent()) === expectedText;
}