/**
 * Feature: Input attribute management and type enforcement
 * Background: fixture = /packages/core/tests/fixtures/core-api-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] converts number input to text with numeric inputmode for integer steps
 * [x] converts number input to text with decimal inputmode for decimal steps
 * [x] sets appropriate pattern for integer inputs, including negatives
 * [x] sets appropriate pattern for decimal inputs, including negatives
 * [x] preserves existing text input with custom inputmode and pattern
 * [x] sets pattern on text input with numeric inputmode when missing
 * [x] sets pattern on text input with decimal inputmode when missing
 * [x] restores original type on destroy
 * [x] restores original inputmode on destroy for custom value
 * [x] removes TouchSpin-added inputmode on destroy when none existed
 * [x] restores original pattern on destroy for custom value
 * [x] removes TouchSpin-added pattern on destroy when none existed
 */

import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { initializeTouchspin } from '../../test-helpers/core-adapter';

const TEST_ID = 'attributes-input';

async function createInput(
  page: Page,
  type: 'number' | 'text',
  attributes: Record<string, string> = {}
): Promise<void> {
  await page.evaluate(
    ({ type, attributes: attrs, testId }) => {
      const input = document.createElement('input');
      input.type = type;
      input.setAttribute('data-testid', testId);
      Object.entries(attrs).forEach(([key, value]) => {
        input.setAttribute(key, value);
      });
      document.body.appendChild(input);
    },
    { type, attributes, testId: TEST_ID }
  );
}

test.describe('Input attribute management and type enforcement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/fixtures/core-api-fixture.html');
    await apiHelpers.startCoverage(page);
    await apiHelpers.waitForPageReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  test('converts number input to text with numeric inputmode for integer steps', async ({
    page,
  }) => {
    await createInput(page, 'number');

    await initializeTouchspin(page, TEST_ID, { step: 1, decimals: 0 });

    const inputType = await page.getAttribute(`[data-testid="${TEST_ID}"]`, 'type');
    expect(inputType).toBe('text');

    const inputMode = await page.getAttribute(`[data-testid="${TEST_ID}"]`, 'inputmode');
    expect(inputMode).toBe('numeric');
  });

  test('converts number input to text with decimal inputmode for decimal steps', async ({
    page,
  }) => {
    await createInput(page, 'number');

    await initializeTouchspin(page, TEST_ID, { step: 0.25, decimals: 2 });

    const inputType = await page.getAttribute(`[data-testid="${TEST_ID}"]`, 'type');
    expect(inputType).toBe('text');

    const inputMode = await page.getAttribute(`[data-testid="${TEST_ID}"]`, 'inputmode');
    expect(inputMode).toBe('decimal');
  });

  test('sets appropriate pattern for integer inputs, including negatives', async ({ page }) => {
    await createInput(page, 'number');

    await initializeTouchspin(page, TEST_ID, { step: 1, decimals: 0 });

    const pattern = await page.getAttribute(`[data-testid="${TEST_ID}"]`, 'pattern');
    expect(pattern).toBe('[-]?[0-9]*');
  });

  test('sets appropriate pattern for decimal inputs, including negatives', async ({ page }) => {
    await createInput(page, 'number');

    await initializeTouchspin(page, TEST_ID, { step: 0.1, decimals: 1 });

    const pattern = await page.getAttribute(`[data-testid="${TEST_ID}"]`, 'pattern');
    expect(pattern).toBe('[-]?[0-9]*([.,][0-9]*)?');
  });

  test('preserves existing text input with custom inputmode and pattern', async ({ page }) => {
    await createInput(page, 'text', { inputmode: 'numeric', pattern: 'custom-pattern' });

    await initializeTouchspin(page, TEST_ID, {});

    const inputType = await page.getAttribute(`[data-testid="${TEST_ID}"]`, 'type');
    expect(inputType).toBe('text');

    const inputMode = await page.getAttribute(`[data-testid="${TEST_ID}"]`, 'inputmode');
    expect(inputMode).toBe('numeric');

    const pattern = await page.getAttribute(`[data-testid="${TEST_ID}"]`, 'pattern');
    expect(pattern).toBe('custom-pattern');
  });

  test('sets pattern on text input with numeric inputmode when missing', async ({ page }) => {
    await createInput(page, 'text', { inputmode: 'numeric' });

    await initializeTouchspin(page, TEST_ID, { step: 1 });

    const pattern = await page.getAttribute(`[data-testid="${TEST_ID}"]`, 'pattern');
    expect(pattern).toBe('[-]?[0-9]*');
  });

  test('sets pattern on text input with decimal inputmode when missing', async ({ page }) => {
    await createInput(page, 'text', { inputmode: 'decimal' });

    await initializeTouchspin(page, TEST_ID, { step: 0.5, decimals: 1 });

    const pattern = await page.getAttribute(`[data-testid="${TEST_ID}"]`, 'pattern');
    expect(pattern).toBe('[-]?[0-9]*([.,][0-9]*)?');
  });

  test('restores original type on destroy', async ({ page }) => {
    await createInput(page, 'number');

    const spinner = await initializeTouchspin(page, TEST_ID, {});
    await spinner.destroy();

    const inputType = await page.getAttribute(`[data-testid="${TEST_ID}"]`, 'type');
    expect(inputType).toBe('number');
  });

  test('restores original inputmode on destroy for custom value', async ({ page }) => {
    await createInput(page, 'number', { inputmode: 'original-mode' });

    const spinner = await initializeTouchspin(page, TEST_ID, {});
    await spinner.destroy();

    const inputMode = await page.getAttribute(`[data-testid="${TEST_ID}"]`, 'inputmode');
    expect(inputMode).toBe('original-mode');
  });

  test('removes TouchSpin-added inputmode on destroy when none existed', async ({ page }) => {
    await createInput(page, 'number');

    const spinner = await initializeTouchspin(page, TEST_ID, {});
    await spinner.destroy();

    const inputMode = await page.getAttribute(`[data-testid="${TEST_ID}"]`, 'inputmode');
    expect(inputMode).toBeNull();
  });

  test('restores original pattern on destroy for custom value', async ({ page }) => {
    await createInput(page, 'number', { pattern: '[A-Z]+' });

    const spinner = await initializeTouchspin(page, TEST_ID, {});
    await spinner.destroy();

    const pattern = await page.getAttribute(`[data-testid="${TEST_ID}"]`, 'pattern');
    expect(pattern).toBe('[A-Z]+');
  });

  test('removes TouchSpin-added pattern on destroy when none existed', async ({ page }) => {
    await createInput(page, 'number');

    const spinner = await initializeTouchspin(page, TEST_ID, {});
    await spinner.destroy();

    const pattern = await page.getAttribute(`[data-testid="${TEST_ID}"]`, 'pattern');
    expect(pattern).toBeNull();
  });
});
