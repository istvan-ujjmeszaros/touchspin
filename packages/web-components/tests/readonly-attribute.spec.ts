/**
 * Feature: TouchSpin Web Component readonly attribute handling
 * Background: fixture = /packages/web-components/tests/fixtures/web-component-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] handles readonly attribute change to enable readonly mode
 * [x] handles readonly attribute change to disable readonly mode
 * [x] applies readonly to input element when attribute is set
 * [x] removes readonly from input element when attribute is removed
 * [x] handles readonly attribute during initialization
 * [x] updates input readonly state reactively on attribute change
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';

test.describe('TouchSpin Web Component readonly attribute handling', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);

    // Load self-contained fixture with web component dependencies
    await page.goto('/packages/web-components/tests/fixtures/web-component-fixture.html');
    await apiHelpers.waitForPageReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  /**
   * Scenario: handles readonly attribute change to enable readonly mode
   * Given a touchspin-vanilla element without readonly attribute
   * When readonly attribute is added
   * Then the input element becomes readonly
   * Params:
   * { "initialReadonly": false, "finalReadonly": true }
   */
  test('handles readonly attribute change to enable readonly mode', async ({ page }) => {
    // Create element without readonly
    await page.evaluate(() => {
      const element = document.createElement('touchspin-vanilla');
      element.setAttribute('data-testid', 'readonly-enable-test');
      element.setAttribute('min', '0');
      element.setAttribute('max', '100');
      element.setAttribute('value', '50');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    // Add readonly attribute
    await page.evaluate(() => {
      const element = document.querySelector('[data-testid="readonly-enable-test"]');
      element?.setAttribute('readonly', '');
    });

    await page.waitForTimeout(50);

    // Check readonly state
    const result = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="readonly-enable-test"]');
      const input = element?.querySelector('input');

      return {
        elementHasAttribute: element?.hasAttribute('readonly'),
        inputReadOnly: input?.readOnly,
      };
    });

    expect(result.elementHasAttribute).toBe(true);
    expect(result.inputReadOnly).toBe(true);
  });

  /**
   * Scenario: handles readonly attribute change to disable readonly mode
   * Given a touchspin-vanilla element with readonly attribute
   * When readonly attribute is removed
   * Then the input element becomes editable
   * Params:
   * { "initialReadonly": true, "finalReadonly": false }
   */
  test('handles readonly attribute change to disable readonly mode', async ({ page }) => {
    // Create element with readonly
    await page.evaluate(() => {
      const element = document.createElement('touchspin-vanilla');
      element.setAttribute('data-testid', 'readonly-disable-test');
      element.setAttribute('min', '0');
      element.setAttribute('max', '100');
      element.setAttribute('value', '50');
      element.setAttribute('readonly', '');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    // Remove readonly attribute
    await page.evaluate(() => {
      const element = document.querySelector('[data-testid="readonly-disable-test"]');
      element?.removeAttribute('readonly');
    });

    await page.waitForTimeout(50);

    // Check readonly state
    const result = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="readonly-disable-test"]');
      const input = element?.querySelector('input');

      return {
        elementHasAttribute: element?.hasAttribute('readonly'),
        inputReadOnly: input?.readOnly,
      };
    });

    expect(result.elementHasAttribute).toBe(false);
    expect(result.inputReadOnly).toBe(false);
  });

  /**
   * Scenario: applies readonly to input element when attribute is set
   * Given a touchspin-vanilla element
   * When readonly attribute is set during initialization
   * Then the input element has readonly property
   * Params:
   * { "readonly": true }
   */
  test('applies readonly to input element when attribute is set', async ({ page }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-vanilla');
      element.setAttribute('data-testid', 'readonly-init-test');
      element.setAttribute('readonly', '');
      element.setAttribute('min', '0');
      element.setAttribute('max', '100');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="readonly-init-test"]');
      const input = element?.querySelector('input');

      return {
        inputExists: !!input,
        inputReadOnly: input?.readOnly,
        elementHasAttribute: element?.hasAttribute('readonly'),
      };
    });

    expect(result.inputExists).toBe(true);
    expect(result.elementHasAttribute).toBe(true);
    expect(result.inputReadOnly).toBe(true);
  });

  /**
   * Scenario: removes readonly from input element when attribute is removed
   * Given a touchspin-vanilla element with readonly
   * When readonly attribute is removed programmatically
   * Then the input element readonly property is removed
   * Params:
   * { "initialReadonly": true, "finalReadonly": false }
   */
  test('removes readonly from input element when attribute is removed', async ({ page }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-vanilla');
      element.setAttribute('data-testid', 'readonly-remove-test');
      element.setAttribute('readonly', 'true');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    const beforeRemove = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="readonly-remove-test"]');
      const input = element?.querySelector('input');
      return {
        inputReadOnly: input?.readOnly,
        hasAttribute: element?.hasAttribute('readonly'),
      };
    });

    expect(beforeRemove.hasAttribute).toBe(true);

    await page.evaluate(() => {
      const element = document.querySelector('[data-testid="readonly-remove-test"]');
      element?.removeAttribute('readonly');
    });

    await page.waitForTimeout(50);

    const afterRemove = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="readonly-remove-test"]');
      const input = element?.querySelector('input');
      return {
        inputReadOnly: input?.readOnly,
        hasAttribute: element?.hasAttribute('readonly'),
      };
    });

    expect(afterRemove.hasAttribute).toBe(false);
    expect(afterRemove.inputReadOnly).toBe(false);
  });

  /**
   * Scenario: handles readonly attribute during initialization
   * Given a touchspin-vanilla element with readonly in markup
   * When the element is connected to DOM
   * Then readonly is applied during initialization
   * Params:
   * { "readonly": "readonly" }
   */
  test('handles readonly attribute during initialization', async ({ page }) => {
    const result = await page.evaluate(() => {
      const element = document.createElement('touchspin-vanilla');
      element.setAttribute('data-testid', 'readonly-markup-test');
      element.setAttribute('readonly', 'readonly');
      element.setAttribute('min', '0');
      element.setAttribute('max', '100');
      element.setAttribute('value', '25');

      document.body.appendChild(element);

      // Check immediately after append
      return {
        elementHasAttribute: element.hasAttribute('readonly'),
        tagName: element.tagName.toLowerCase(),
      };
    });

    await page.waitForTimeout(100);

    const afterInit = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="readonly-markup-test"]');
      const input = element?.querySelector('input');

      return {
        inputExists: !!input,
        inputReadOnly: input?.readOnly,
      };
    });

    expect(result.elementHasAttribute).toBe(true);
    expect(afterInit.inputExists).toBe(true);
    expect(afterInit.inputReadOnly).toBe(true);
  });

  /**
   * Scenario: updates input readonly state reactively on attribute change
   * Given a touchspin-vanilla element
   * When readonly attribute is toggled multiple times
   * Then input readonly state updates each time
   * Params:
   * { "toggleCount": 3 }
   */
  test('updates input readonly state reactively on attribute change', async ({ page }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-vanilla');
      element.setAttribute('data-testid', 'readonly-reactive-test');
      element.setAttribute('min', '0');
      element.setAttribute('max', '100');
      document.body.appendChild(element);
    });

    await page.waitForTimeout(100);

    const toggleResults = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="readonly-reactive-test"]');
      const input = element?.querySelector('input');
      const results = [];

      // Toggle 1: Set readonly
      element?.setAttribute('readonly', '');
      results.push({
        toggle: 1,
        hasAttribute: element?.hasAttribute('readonly'),
        inputReadOnly: input?.readOnly,
      });

      // Toggle 2: Remove readonly
      element?.removeAttribute('readonly');
      results.push({
        toggle: 2,
        hasAttribute: element?.hasAttribute('readonly'),
        inputReadOnly: input?.readOnly,
      });

      // Toggle 3: Set readonly again
      element?.setAttribute('readonly', 'true');
      results.push({
        toggle: 3,
        hasAttribute: element?.hasAttribute('readonly'),
        inputReadOnly: input?.readOnly,
      });

      return results;
    });

    // Verify each toggle worked correctly
    expect(toggleResults[0].hasAttribute).toBe(true);
    expect(toggleResults[0].inputReadOnly).toBe(true);

    expect(toggleResults[1].hasAttribute).toBe(false);
    expect(toggleResults[1].inputReadOnly).toBe(false);

    expect(toggleResults[2].hasAttribute).toBe(true);
    expect(toggleResults[2].inputReadOnly).toBe(true);
  });
});
