/**
 * Feature: Tailwind renderer edge-case coverage
 * Background: fixture = /packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] basic wrapper inserts input before postfix when no prefix exists
 * [x] advanced container reinstates input and supports vertical layout
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { ensureTailwindGlobals, tailwindRendererUrl } from './helpers/tailwind-globals';

const fixtureUrl = '/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html';

async function destroyRenderer(
  page: import('@playwright/test').Page,
  testId: string
): Promise<void> {
  await page.evaluate((id) => {
    const input = document.querySelector(`[data-testid="${id}"]`) as HTMLInputElement | null;
    (input as any)?._touchSpinCore?.destroy();
  }, testId);
}

test.describe('Tailwind renderer edge cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await ensureTailwindGlobals(page);
    await apiHelpers.startCoverage(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await destroyRenderer(page, 'test-input');
    await destroyRenderer(page, 'test-input-advanced');
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  /**
   * Scenario: basic wrapper inserts input before postfix when no prefix exists
   * Given the Tailwind renderer builds a fresh wrapper without a prefix
   * When the DOM structure is inspected
   * Then the input sits ahead of the postfix node to preserve expected order
   */
  test('basic wrapper inserts input before postfix when no prefix exists', async ({ page }) => {
    await apiHelpers.initializeTouchSpin(page, 'test-input', {
      prefix: '',
      postfix: 'kg',
    });

    const order = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      const elements = wrapper ? Array.from(wrapper.children) : [];
      return elements.map(
        (node) => (node as HTMLElement).getAttribute?.('data-touchspin-injected') ?? node.nodeName
      );
    });

    // Expect input to appear before postfix wrapper entry
    const inputIndex = order.indexOf('INPUT');
    const postfixIndex = order.indexOf('postfix');
    expect(inputIndex).toBeGreaterThan(-1);
    expect(postfixIndex).toBeGreaterThan(inputIndex);
  });

  /**
   * Scenario: advanced container reinstates input and supports vertical layout
   * Given an existing flex container that initially holds the input
   * And the input is moved out of the container before settings updates
   * When vertical buttons and custom classes are applied
   * Then the renderer restores the input to the flex container and applies the new classes to vertical buttons
   */
  test('advanced container reinstates input and supports vertical layout', async ({ page }) => {
    await apiHelpers.initializeTouchSpin(page, 'test-input-advanced', {
      prefix: 'TA',
      postfix: 'unit',
    });

    // Move input outside flex container to trigger ensureInputInContainer
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input-advanced"]');
      const container = document.getElementById('additional-inputs');
      if (input && container) {
        container.appendChild(input);
      }
    });

    await apiHelpers.updateSettingsViaAPI(page, 'test-input-advanced', {
      prefix: 'TAIL',
      postfix: 'updated',
      verticalbuttons: true,
      verticalupclass: 'custom-up',
      verticaldownclass: 'custom-down',
    });

    const inspection = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="test-input-advanced-wrapper"]');
      const input = document.querySelector('[data-testid="test-input-advanced"]');
      const verticalWrapper = wrapper?.querySelector(
        '[data-touchspin-injected="vertical-wrapper"]'
      );
      const upButton = verticalWrapper?.querySelector('[data-touchspin-injected="up"]');
      const downButton = verticalWrapper?.querySelector('[data-touchspin-injected="down"]');
      const parentIsFlex = input?.parentElement?.classList.contains('flex') ?? false;
      return {
        parentIsFlex,
        upClass: upButton instanceof HTMLElement ? upButton.className : null,
        downClass: downButton instanceof HTMLElement ? downButton.className : null,
      };
    });

    expect(inspection.parentIsFlex).toBe(true);
    expect(inspection.upClass).toContain('custom-up');
    expect(inspection.downClass).toContain('custom-down');
  });
});
