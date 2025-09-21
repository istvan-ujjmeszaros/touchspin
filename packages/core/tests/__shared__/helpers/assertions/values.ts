import type { Page } from '@playwright/test';

/* ──────────────────────────
 * Value-based polled expectations
 * ────────────────────────── */

/**
 * Then the value of "{testId}" is "{expected}"
 */
export async function expectValueToBe(
  page: Page,
  testId: string,
  expected: string,
  timeout = 3000
): Promise<void> {
  await page.waitForFunction(
    ({ testId, expected }) => {
      const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
      return !!input && input.value === expected;
    },
    { testId, expected },
    { timeout }
  );
}

export async function expectValueToChange(
  page: Page,
  testId: string,
  from: string,
  to: string,
  timeout = 3000
): Promise<void> {
  await expectValueToBe(page, testId, from, timeout);
  await expectValueToBe(page, testId, to, timeout);
}

/**
 * Then the value of "{testId}" is greater than {value}
 */
export async function expectValueToBeGreaterThan(
  page: Page,
  testId: string,
  value: number,
  timeout = 3000
): Promise<void> {
  await page.waitForFunction(
    ({ testId, value }) => {
      const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
      return !!input && parseFloat(input.value || '0') > value;
    },
    { testId, value },
    { timeout }
  );
}

export async function expectValueToBeLessThan(
  page: Page,
  testId: string,
  value: number,
  timeout = 3000
): Promise<void> {
  await page.waitForFunction(
    ({ testId, value }) => {
      const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
      return !!input && parseFloat(input.value || '0') < value;
    },
    { testId, value },
    { timeout }
  );
}

export async function expectValueToBeBetween(
  page: Page,
  testId: string,
  min: number,
  max: number,
  timeout = 3000
): Promise<void> {
  await page.waitForFunction(
    ({ testId, min, max }) => {
      const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
      if (!input) return false;
      const val = parseFloat(input.value || '0');
      return val >= min && val <= max;
    },
    { testId, min, max },
    { timeout }
  );
}