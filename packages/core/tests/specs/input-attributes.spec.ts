/**
 * Feature: Input attribute management and type enforcement
 * Background: fixture = /packages/core/tests/fixtures/core-api-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] converts type="number" to type="text" with inputmode="numeric" for integer steps
 * [x] converts type="number" to type="text" with inputmode="decimal" for decimal steps
 * [x] sets appropriate pattern for integer inputs
 * [x] sets appropriate pattern for decimal inputs
 * [x] preserves existing type="text" with inputmode
 * [x] preserves existing pattern when type="text" with inputmode
 * [x] restores original type on destroy
 * [x] restores original inputmode on destroy
 * [x] restores original pattern on destroy
 * [x] removes added inputmode on destroy when none existed
 * [x] removes added pattern on destroy when none existed
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { initializeTouchspin } from '../../test-helpers/core-adapter';

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

  test('converts type="number" to type="text" with inputmode="numeric" for integer steps', async ({ page }) => {
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.type = 'number';
      input.id = 'test-input';
      document.body.appendChild(input);
    });

    await initializeTouchspin(page, 'test-input', {
      step: 1,
      decimals: 0,
    });

    const inputType = await page.getAttribute('#test-input', 'type');
    const inputMode = await page.getAttribute('#test-input', 'inputmode');

    expect(inputType).toBe('text');
    expect(inputMode).toBe('numeric');
  });

  test('converts type="number" to type="text" with inputmode="decimal" for decimal steps', async ({ page }) => {
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.type = 'number';
      input.id = 'test-input';
      document.body.appendChild(input);
    });

    await initializeTouchspin(page, 'test-input', {
      step: 0.5,
      decimals: 1,
    });

    const inputType = await page.getAttribute('#test-input', 'type');
    const inputMode = await page.getAttribute('#test-input', 'inputmode');

    expect(inputType).toBe('text');
    expect(inputMode).toBe('decimal');
  });

  test('sets appropriate pattern for integer inputs', async ({ page }) => {
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.type = 'number';
      input.id = 'test-input';
      document.body.appendChild(input);
    });

    await initializeTouchspin(page, 'test-input', {
      step: 1,
      decimals: 0,
    });

    const pattern = await page.getAttribute('#test-input', 'pattern');
    expect(pattern).toBe('[0-9]*');
  });

  test('sets appropriate pattern for decimal inputs', async ({ page }) => {
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.type = 'number';
      input.id = 'test-input';
      document.body.appendChild(input);
    });

    await initializeTouchspin(page, 'test-input', {
      step: 0.1,
      decimals: 2,
    });

    const pattern = await page.getAttribute('#test-input', 'pattern');
    expect(pattern).toBe('[0-9]*[.,]?[0-9]*');
  });

  test('preserves existing type="text" with inputmode', async ({ page }) => {
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.type = 'text';
      input.setAttribute('inputmode', 'numeric');
      input.setAttribute('pattern', 'custom-pattern');
      input.id = 'test-input';
      document.body.appendChild(input);
    });

    await initializeTouchspin(page, 'test-input', {});

    const inputType = await page.getAttribute('#test-input', 'type');
    const inputMode = await page.getAttribute('#test-input', 'inputmode');
    const pattern = await page.getAttribute('#test-input', 'pattern');

    expect(inputType).toBe('text');
    expect(inputMode).toBe('numeric');
    expect(pattern).toBe('custom-pattern');
  });

  test('restores original type on destroy', async ({ page }) => {
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.type = 'number';
      input.id = 'test-input';
      document.body.appendChild(input);
    });

    const api = await initializeTouchspin(page, 'test-input', {});
    await page.evaluate((api) => api.destroy(), api);

    const inputType = await page.getAttribute('#test-input', 'type');
    expect(inputType).toBe('number');
  });

  test('restores original inputmode on destroy', async ({ page }) => {
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.type = 'number';
      input.setAttribute('inputmode', 'original-mode');
      input.id = 'test-input';
      document.body.appendChild(input);
    });

    const api = await initializeTouchspin(page, 'test-input', {});
    await page.evaluate((api) => api.destroy(), api);

    const inputMode = await page.getAttribute('#test-input', 'inputmode');
    expect(inputMode).toBe('original-mode');
  });

  test('removes added inputmode on destroy when none existed', async ({ page }) => {
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.type = 'number';
      input.id = 'test-input';
      document.body.appendChild(input);
    });

    const api = await initializeTouchspin(page, 'test-input', {});
    await page.evaluate((api) => api.destroy(), api);

    const inputMode = await page.getAttribute('#test-input', 'inputmode');
    expect(inputMode).toBeNull();
  });

  test('removes added pattern on destroy when none existed', async ({ page }) => {
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.type = 'number';
      input.id = 'test-input';
      document.body.appendChild(input);
    });

    const api = await initializeTouchspin(page, 'test-input', {});
    await page.evaluate((api) => api.destroy(), api);

    const pattern = await page.getAttribute('#test-input', 'pattern');
    expect(pattern).toBeNull();
  });
});
