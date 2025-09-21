import type { Page, Locator } from '@playwright/test';
import type { InjectedRole } from '../types';

/* ──────────────────────────
 * Renderer-agnostic selector builders
 *
 * LAYERING RULES:
 * - This module has no dependencies (leaf level)
 * - Used by: core/elements.ts, interactions/*, assertions/*
 * - Do not import from other helper modules
 * ────────────────────────── */

export const inputById = (page: Page, testId: string): Locator =>
  page.locator(`[data-testid="${testId}"]`);

export const wrapperById = (page: Page, testId: string): Locator =>
  page.getByTestId(`${testId}-wrapper`);

export const injected = (
  wrapper: Locator,
  role: InjectedRole
): Locator => wrapper.locator(`[data-touchspin-injected="${role}"]`).first();

export const upButtonIn = (wrapper: Locator): Locator => injected(wrapper, 'up');
export const downButtonIn = (wrapper: Locator): Locator => injected(wrapper, 'down');
export const prefixIn = (wrapper: Locator): Locator => injected(wrapper, 'prefix');
export const postfixIn = (wrapper: Locator): Locator => injected(wrapper, 'postfix');