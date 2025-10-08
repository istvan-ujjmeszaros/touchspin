/**
 * Feature: Bootstrap 4 renderer edge-case coverage
 * Background: fixture = /packages/renderers/bootstrap4/tests/fixtures/bootstrap4-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] advanced input group rebuild preserves Bootstrap 4 structure
 * [x] teardown removes form-control class only when added by renderer
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { bootstrap4RendererUrl, ensureBootstrap4Globals } from './helpers/bootstrap4-globals';

const fixtureUrl = '/packages/renderers/bootstrap4/tests/fixtures/bootstrap4-fixture.html';

async function destroyRenderer(
  page: import('@playwright/test').Page,
  testId: string
): Promise<void> {
  await page.evaluate((id) => {
    const input = document.querySelector(`[data-testid="${id}"]`) as HTMLInputElement | null;
    (input as any)?._touchSpinCore?.destroy();
  }, testId);
}

test.describe('Bootstrap 4 renderer edge cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await ensureBootstrap4Globals(page);
    await apiHelpers.startCoverage(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await destroyRenderer(page, 'test-input');
    await destroyRenderer(page, 'test-input-advanced');
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  /**
   * Scenario: advanced input group rebuild preserves Bootstrap 4 structure
   * Given a Bootstrap 4 input-group with prepend and append elements
   * And the input is unintentionally moved outside the group
   * When settings updates trigger a rebuild
   * Then the renderer restores prepend/append wrappers and exposes vertical buttons when enabled
   */
  test('advanced input group rebuild preserves Bootstrap 4 structure', async ({ page }) => {
    await apiHelpers.initializeTouchSpin(page, 'test-input-advanced', {
      prefix: '#',
      postfix: 'units',
    });

    // Remove input from input-group to force ensureInputInGroup branch
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input-advanced"]');
      const container = document.getElementById('additional-inputs');
      if (input && container) {
        container.appendChild(input);
      }
    });

    await apiHelpers.updateSettingsViaAPI(page, 'test-input-advanced', {
      prefix: 'ADV',
      postfix: 'bundle',
    });

    const structure = await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input-advanced"]');
      const parent = input?.parentElement;
      const hasPrepend = !!parent?.querySelector(
        '.input-group-prepend [data-touchspin-injected="down-wrapper"]'
      );
      const hasAppend = !!parent?.querySelector(
        '.input-group-append [data-touchspin-injected="up-wrapper"]'
      );
      return { parentClass: parent?.className ?? '', hasPrepend, hasAppend };
    });

    expect(structure.parentClass).toContain('input-group');
    expect(structure.hasPrepend).toBe(true);
    expect(structure.hasAppend).toBe(true);

    await apiHelpers.updateSettingsViaAPI(page, 'test-input-advanced', {
      verticalbuttons: true,
    });

    const hasVerticalWrapper = await page.evaluate(() => {
      const element = document.querySelector(
        '[data-testid="test-input-advanced-wrapper"] [data-touchspin-injected="vertical-wrapper"]'
      );
      if (!(element instanceof HTMLElement)) return false;
      return element.offsetParent !== null;
    });
    expect(hasVerticalWrapper).toBe(true);
  });

  /**
   * Scenario: teardown removes form-control class only when added by renderer
   * Given the renderer adds form-control to the input during initialization
   * When TouchSpin is destroyed
   * Then the additional class is removed leaving the original input untouched
   */
  test('teardown removes form-control class only when added by renderer', async ({ page }) => {
    await apiHelpers.initializeTouchSpin(page, 'test-input', {});

    const hasClassAfterInit = await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]');
      return input?.classList.contains('form-control') ?? false;
    });
    expect(hasClassAfterInit).toBe(true);

    await destroyRenderer(page, 'test-input');

    const hasClassAfterDestroy = await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]');
      return input?.classList.contains('form-control') ?? false;
    });
    expect(hasClassAfterDestroy).toBe(false);
  });
});
