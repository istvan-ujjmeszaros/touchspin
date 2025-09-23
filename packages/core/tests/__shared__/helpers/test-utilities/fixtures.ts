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
    type?: string;
    dataAttributes?: Record<string, string>;
  } = {}
): Promise<void> {
  await page.evaluate(({ id, opts }) => {
    window.createTestInput?.(id, opts);
  }, { id: testId, opts: options });
}

export async function setDataAttributes(
  page: Page,
  testId: string,
  dataAttributes: Record<string, string>
): Promise<void> {
  await page.evaluate(({ id, attrs }) => {
    const el = document.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
    if (!el) throw new Error(`Element with testId "${id}" not found`);
    Object.entries(attrs).forEach(([name, value]) => {
      el.setAttribute(name, value);
    });
  }, { id: testId, attrs: dataAttributes });
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
