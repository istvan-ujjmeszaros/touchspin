/**
 * Feature: Bootstrap 5 renderer edge-case coverage
 * Background: fixture = /packages/renderers/bootstrap5/tests/fixtures/bootstrap5-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] floating label input group migrates margin classes and supports rebuild
 * [x] advanced input group rebuild keeps prefix/postfix placement
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { bootstrap5RendererUrl, ensureBootstrap5Globals } from './helpers/bootstrap5-globals';

const fixtureUrl = '/packages/renderers/bootstrap5/tests/fixtures/bootstrap5-fixture.html';

async function destroyRenderer(
  page: import('@playwright/test').Page,
  testId: string
): Promise<void> {
  await page.evaluate((id) => {
    const input = document.querySelector(`[data-testid="${id}"]`) as HTMLInputElement | null;
    (input as any)?._touchSpinCore?.destroy();
  }, testId);
}

test.describe('Bootstrap 5 renderer edge cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await ensureBootstrap5Globals(page);
    await apiHelpers.startCoverage(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await destroyRenderer(page, 'test-input');
    await destroyRenderer(page, 'test-input-advanced');
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  /**
   * Scenario: floating label input group migrates margin classes and supports rebuild
   * Given a floating label input-group with Bootstrap margin utilities
   * When the renderer rebuilds with new prefix, postfix, and vertical buttons
   * Then margin classes move from the floating container to the wrapper and the vertical wrapper appears
   */
  test('floating label input group migrates margin classes and supports rebuild', async ({
    page,
  }) => {
    // Add floating label structure with margin classes
    await page.goto('/packages/renderers/bootstrap5/tests/fixtures/floating-labels-fixture.html');
    await ensureBootstrap5Globals(page);
    await apiHelpers.startCoverage(page);

    await apiHelpers.initializeTouchSpin(page, 'group-floating', {
      prefix: '$',
      postfix: '.00',
    });

    const beforeUpdate = await page.evaluate(() => {
      const container = document.querySelector('.form-floating') as HTMLElement | null;
      if (container) {
        container.classList.add('mt-3');
      }
      return container?.className ?? '';
    });
    expect(beforeUpdate).toContain('mt-3');

    await apiHelpers.updateSettingsViaAPI(page, 'group-floating', {
      prefix: '€',
      postfix: 'EUR',
      verticalbuttons: true,
    });

    const inspection = await page.evaluate(() => {
      const inputGroup = document.querySelector('[data-testid="group-floating-wrapper"]');
      const floating = document.querySelector('.form-floating');
      const verticalWrapper = inputGroup?.querySelector(
        '[data-touchspin-injected="vertical-wrapper"]'
      );
      const movedMargins = floating?.dataset.movedMargins ?? null;
      const wrapperMargins = inputGroup instanceof HTMLElement ? inputGroup.className : '';
      return {
        hasVerticalWrapper: !!verticalWrapper,
        movedMargins,
        wrapperMargins,
      };
    });

    expect(inspection.hasVerticalWrapper).toBe(true);
    expect(inspection.movedMargins).toBeNull();
    expect(inspection.wrapperMargins).toContain('mt-3');
  });

  /**
   * Scenario: advanced input group rebuild keeps prefix/postfix placement
   * Given an existing input-group that already provides structure
   * And the input is temporarily moved outside of the group
   * When settings updates trigger a rebuild
   * Then prefix, postfix, up, and down elements are restored around the input in their expected order
   */
  test('advanced input group rebuild keeps prefix/postfix placement', async ({ page }) => {
    await apiHelpers.initializeTouchSpin(page, 'test-input-advanced', {
      prefix: '#',
      postfix: 'units',
    });

    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input-advanced"]');
      const container = document.getElementById('additional-inputs');
      if (input && container) {
        container.appendChild(input);
      }
    });

    await apiHelpers.updateSettingsViaAPI(page, 'test-input-advanced', {
      prefix: 'PRE',
      postfix: 'POST',
    });

    const placement = await page.evaluate(() => {
      const inputGroup = document.querySelector('[data-testid="test-input-advanced-wrapper"]');
      const prefix = inputGroup?.querySelector('[data-touchspin-injected="prefix"]');
      const postfix = inputGroup?.querySelector('[data-touchspin-injected="postfix"]');
      const up = inputGroup?.querySelector('[data-touchspin-injected="up"]');
      const down = inputGroup?.querySelector('[data-touchspin-injected="down"]');
      return {
        prefixSibling: prefix?.nextElementSibling?.getAttribute('data-touchspin-injected') ?? null,
        postfixSibling:
          postfix?.previousElementSibling?.getAttribute('data-touchspin-injected') ?? null,
        upExists: !!up,
        downExists: !!down,
      };
    });

    expect(placement.prefixSibling).toBe('down-wrapper');
    expect(placement.postfixSibling).toBe('up-wrapper');
    expect(placement.upExists).toBe(true);
    expect(placement.downExists).toBe(true);
  });
});
