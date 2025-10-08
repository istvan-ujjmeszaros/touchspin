/**
 * Feature: Bootstrap 3 renderer edge-case coverage
 * Background: fixture = /packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] advanced input group keeps input inside group when rebuilding
 * [x] teardown only removes form-control when added by renderer
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { bootstrap3RendererUrl, ensureBootstrap3Globals } from './helpers/bootstrap3-globals';

const fixtureUrl = '/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html';

async function destroyRenderer(
  page: import('@playwright/test').Page,
  testId: string
): Promise<void> {
  await page.evaluate((id) => {
    const input = document.querySelector(`[data-testid="${id}"]`) as HTMLInputElement | null;
    (input as any)?._touchSpinCore?.destroy();
  }, testId);
}

test.describe('Bootstrap 3 renderer edge cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await ensureBootstrap3Globals(page);
    await apiHelpers.startCoverage(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await destroyRenderer(page, 'test-input');
    await destroyRenderer(page, 'test-input-advanced');
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  /**
   * Scenario: advanced input group keeps input inside group when rebuilding
   * Given a Bootstrap 3 input already wrapped in an input-group
   * And the input is accidentally moved outside the group
   * When settings updates rebuild the DOM
   * Then the renderer restores the input inside the group and shows the vertical wrapper when enabled
   */
  test('advanced input group keeps input inside group when rebuilding', async ({ page }) => {
    await apiHelpers.initializeTouchSpin(page, 'test-input-advanced', {
      prefix: '#',
      postfix: 'units',
    });

    // Force the input to move outside the input-group before an update
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input-advanced"]');
      const container = document.getElementById('additional-inputs');
      if (input && container) {
        container.appendChild(input);
      }
    });

    // Trigger a rebuild that should call ensureInputInGroup and restore placement
    await apiHelpers.updateSettingsViaAPI(page, 'test-input-advanced', {
      prefix: 'ADV',
      postfix: 'rebuild',
    });

    const parentClass = await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input-advanced"]');
      return input?.parentElement?.className ?? '';
    });

    expect(parentClass).toContain('input-group');

    // Toggle vertical buttons to cover alternate branch
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
   * Scenario: teardown only removes form-control when added by renderer
   * Given the renderer adds the form-control class to the input
   * When TouchSpin is destroyed
   * Then the added class is removed and no residue remains on the original input
   */
  test('teardown only removes form-control when added by renderer', async ({ page }) => {
    await apiHelpers.initializeTouchSpin(page, 'test-input', {});

    const hadFormControl = await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]');
      return input?.classList.contains('form-control') ?? false;
    });
    expect(hadFormControl).toBe(true);

    await destroyRenderer(page, 'test-input');

    const hasFormControlAfter = await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]');
      return input?.classList.contains('form-control') ?? false;
    });
    expect(hasFormControlAfter).toBe(false);
  });
});
