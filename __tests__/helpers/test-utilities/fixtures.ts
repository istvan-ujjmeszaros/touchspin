import type { Page } from '@playwright/test';

/* ──────────────────────────
 * Dynamic test inputs (fixture helpers)
 * ────────────────────────── */

export async function createAdditionalInput(
  page: Page,
  testId: string,
  options: {
    value?: string;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    readonly?: boolean;
    label?: string;
  } = {}
): Promise<void> {
  await page.evaluate(({ id, opts }) => {
    (window as any).createTestInput(id, opts);
  }, { id: testId, opts: options });
}

export async function clearAdditionalInputs(page: Page): Promise<void> {
  await page.evaluate(() => (window as any).clearAdditionalInputs());
}