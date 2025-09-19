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

export async function getNumericValue(page: Page, testId: string): Promise<number> {
  const v = await readInputValue(page, testId);
  return parseFloat(v) || 0;
}

export async function setValueViaAPI(
  page: Page,
  testId: string,
  value: number | string
): Promise<void> {
  await page.evaluate(({ testId, value }) => {
    const core = window.__ts!.requireCoreByTestId(testId);
    core.setValue(value);
  }, { testId, value });
}

export async function destroyCore(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const core = window.__ts!.requireCoreByTestId(testId);
    core.destroy();
  }, { testId });
}

export async function incrementViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const core = window.__ts!.requireCoreByTestId(testId);
    core.upOnce();
  }, { testId });
}

export async function decrementViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const core = window.__ts!.requireCoreByTestId(testId);
    core.downOnce();
  }, { testId });
}

export async function startUpSpinViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const core = window.__ts!.requireCoreByTestId(testId);
    core.startUpSpin();
  }, { testId });
}

export async function startDownSpinViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const core = window.__ts!.requireCoreByTestId(testId);
    core.startDownSpin();
  }, { testId });
}

export async function stopSpinViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const core = window.__ts!.requireCoreByTestId(testId);
    core.stopSpin();
  }, { testId });
}

export async function updateSettingsViaAPI(
  page: Page,
  testId: string,
  newSettings: Partial<TouchSpinCoreOptions>
): Promise<void> {
  await page.evaluate(({ testId, newSettings }) => {
    const core = window.__ts!.requireCoreByTestId(testId);
    core.updateSettings(newSettings);
  }, { testId, newSettings });
}

export async function getPublicAPI(page: Page, testId: string): Promise<TouchSpinCorePublicAPI | null> {
  return page.evaluate(({ testId }) => {
    return window.__ts!.requireCoreByTestId(testId);
  }, { testId });
}
