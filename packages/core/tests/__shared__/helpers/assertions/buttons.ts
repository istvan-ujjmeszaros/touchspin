import type { Page } from '@playwright/test';
import { getTouchSpinWrapper } from '../core/elements';
import { upButtonIn, downButtonIn } from '../core/selectors';

/* ──────────────────────────
 * Button state expectations
 * ────────────────────────── */

/**
 * Then the "{button}" button on "{testId}" is disabled
 * Renderer-agnostic: button locator is based on injected attribute.
 */
export async function expectButtonToBeDisabled(
  page: Page,
  testId: string,
  button: 'up' | 'down',
  timeout = 3000
): Promise<void> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  const target = button === 'up' ? upButtonIn(wrapper) : downButtonIn(wrapper);
  await target.waitFor({ state: 'attached', timeout });
  if (!(await target.isDisabled())) {
    throw new Error(
      `Expected "${button}" button to be disabled for "${testId}", but it is enabled.`
    );
  }
}

/**
 * Then the "{button}" button on "{testId}" is enabled
 */
export async function expectButtonToBeEnabled(
  page: Page,
  testId: string,
  button: 'up' | 'down',
  timeout = 3000
): Promise<void> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  const target = button === 'up' ? upButtonIn(wrapper) : downButtonIn(wrapper);
  await target.waitFor({ state: 'attached', timeout });
  if (await target.isDisabled()) {
    throw new Error(
      `Expected "${button}" button to be enabled for "${testId}", but it is disabled.`
    );
  }
}
