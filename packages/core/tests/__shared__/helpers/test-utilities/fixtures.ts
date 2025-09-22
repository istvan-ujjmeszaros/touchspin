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
    window.createTestInput?.(id, opts);
  }, { id: testId, opts: options });
}

export async function clearAdditionalInputs(page: Page): Promise<void> {
  await page.evaluate(() => window.clearAdditionalInputs?.());
}

/**
 * Disable event log textarea to skip DOM writes while keeping event listeners
 */
export async function disableEventLogging(page: Page): Promise<void> {
  await page.evaluate(() => {
    const textarea = document.getElementById('event-log') as HTMLTextAreaElement | null;
    if (textarea) {
      textarea.disabled = true;
    }
  });
}

/**
 * Enable event log textarea to resume DOM writes
 */
export async function enableEventLogging(page: Page): Promise<void> {
  await page.evaluate(() => {
    const textarea = document.getElementById('event-log') as HTMLTextAreaElement | null;
    if (textarea) {
      textarea.disabled = false;
    }
  });
}

/**
 * Remove event log textarea completely to prevent event listener registration
 */
export async function removeEventLogTextarea(page: Page): Promise<void> {
  await page.evaluate(() => {
    const textarea = document.getElementById('event-log');
    if (textarea) {
      textarea.remove();
    }
  });
}
