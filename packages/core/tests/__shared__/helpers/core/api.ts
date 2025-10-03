import type { Page } from '@playwright/test';
import type { TouchSpinCoreOptions, TouchSpinCorePublicAPI } from '../types';
import { readInputValue } from '../interactions/input';

/* ──────────────────────────
 * Core API operations
 *
 * LAYERING RULES:
 * - Depends on: types.ts, interactions/input.ts
 * - Used by: test scripts (optional surface)
 * - Do not import from: events/*, jquery/*, assertions/*
 * ────────────────────────── */

/**
 * When I get the numeric value of "{testId}"
 */
export async function getNumericValue(page: Page, testId: string): Promise<number> {
  const v = await readInputValue(page, testId);
  return parseFloat(v) || 0;
}

/**
 * When I set the value of "{testId}" to "{value}" via API
 */
export async function setValueViaAPI(
  page: Page,
  testId: string,
  value: number | string
): Promise<void> {
  await page.evaluate(
    ({ testId, value }) => {
      const core = window.__ts?.requireCoreByTestId(testId);
      core.setValue(value);
    },
    { testId, value }
  );
}

/**
 * When I destroy the TouchSpin instance on "{testId}"
 */
export async function destroyCore(page: Page, testId: string): Promise<void> {
  await page.evaluate(
    ({ testId }) => {
      const core = window.__ts?.requireCoreByTestId(testId);
      core.destroy();
    },
    { testId }
  );
}

/**
 * When I increment "{testId}" via API
 */
export async function incrementViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(
    ({ testId }) => {
      const core = window.__ts?.requireCoreByTestId(testId);
      core.upOnce();
    },
    { testId }
  );
}

/**
 * When I decrement "{testId}" via API
 */
export async function decrementViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(
    ({ testId }) => {
      const core = window.__ts?.requireCoreByTestId(testId);
      core.downOnce();
    },
    { testId }
  );
}

/**
 * When I start up spin on "{testId}" via API
 */
export async function startUpSpinViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(
    ({ testId }) => {
      const core = window.__ts?.requireCoreByTestId(testId);
      core.startUpSpin();
    },
    { testId }
  );
}

/**
 * When I start down spin on "{testId}" via API
 */
export async function startDownSpinViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(
    ({ testId }) => {
      const core = window.__ts?.requireCoreByTestId(testId);
      core.startDownSpin();
    },
    { testId }
  );
}

/**
 * When I stop spin on "{testId}" via API
 */
export async function stopSpinViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(
    ({ testId }) => {
      const core = window.__ts?.requireCoreByTestId(testId);
      core.stopSpin();
    },
    { testId }
  );
}

/**
 * When I update settings on "{testId}" via API
 */
export async function updateSettingsViaAPI(
  page: Page,
  testId: string,
  newSettings: Partial<TouchSpinCoreOptions>
): Promise<void> {
  await page.evaluate(
    ({ testId, newSettings }) => {
      const core = window.__ts?.requireCoreByTestId(testId);
      core.updateSettings(newSettings);
    },
    { testId, newSettings }
  );
}

/**
 * When I get the public API for "{testId}"
 */
export async function getPublicAPI(
  page: Page,
  testId: string
): Promise<TouchSpinCorePublicAPI | null> {
  return page.evaluate(
    ({ testId }) => {
      return window.__ts?.requireCoreByTestId(testId);
    },
    { testId }
  );
}

/**
 * When I read the applied settings for "{testId}"
 */
export async function getAppliedSettings(
  page: Page,
  testId: string
): Promise<TouchSpinCoreOptions> {
  return page.evaluate(
    ({ testId }) => {
      const input = window.__ts?.requireInputByTestId(testId) as HTMLInputElement & {
        _touchSpinCore?: { settings: TouchSpinCoreOptions };
      };
      const core = input._touchSpinCore;
      if (!core) throw new Error(`TouchSpinCore not found for "${testId}"`);
      return JSON.parse(JSON.stringify(core.settings)) as TouchSpinCoreOptions;
    },
    { testId }
  );
}
