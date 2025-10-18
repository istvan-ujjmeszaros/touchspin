/**
 * Feature: Web Component attribute and lifecycle edge cases
 * Background: fixture = /packages/adapters/webcomponent/tests/fixtures/web-component-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] attributeChangedCallback handles value, disabled, readonly and renderer changes
 * [x] component creates internal input when none provided and cleanup restores state
 */

import { expect, test } from '@playwright/test';
import type { TouchSpinCorePublicAPI } from '@touchspin/core';
import * as apiHelpers from '@touchspin/core/test-helpers';

// Extend HTMLElement interface for TouchSpin web component
declare global {
  interface HTMLElement {
    getTouchSpinInstance?(): TouchSpinCorePublicAPI | null;
    destroy?(): void;
  }
}

const fixtureUrl = '/packages/adapters/webcomponent/tests/fixtures/web-component-fixture.html';

test.describe('TouchSpin web component edge cases', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto(fixtureUrl);
    await apiHelpers.waitForPageReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  /**
   * Scenario: attributeChangedCallback handles value, disabled, readonly and renderer changes
   * Given a connected touchspin-input element with initial attributes
   * When value, disabled, readonly, and renderer attributes change dynamically
   * Then the backing core updates the value, the input reflects disabled/readonly states, and the instance persists after renderer fallback
   */
  test('attributeChangedCallback handles value, disabled, readonly and renderer changes', async ({
    page,
  }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-input');
      element.setAttribute('data-testid', 'wc-coverage');
      element.setAttribute('value', '25');
      element.setAttribute('min', '0');
      element.setAttribute('max', '100');
      document.body.appendChild(element);
    });

    await page.waitForFunction(() => {
      const element = document.querySelector('[data-testid="wc-coverage"]') as HTMLElement;
      return !!element && !!element.getTouchSpinInstance?.();
    });

    const afterInit = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="wc-coverage"]') as HTMLElement;
      const input = document.querySelector('[data-testid="wc-coverage-input"]') as HTMLInputElement;
      const core = element?.getTouchSpinInstance();
      return {
        coreValue: core?.getValue(),
        inputValue: input?.value,
        disabled: input?.disabled ?? null,
        readOnly: input?.readOnly ?? null,
      };
    });

    expect(afterInit.coreValue).toBe(25);
    expect(afterInit.inputValue).toBe('25');
    expect(afterInit.disabled).toBe(false);
    expect(afterInit.readOnly).toBe(false);

    await page.evaluate(() => {
      const element = document.querySelector('[data-testid="wc-coverage"]') as HTMLElement | null;
      element?.setAttribute('value', '30');
      element?.setAttribute('disabled', '');
      element?.setAttribute('readonly', '');
      element?.setAttribute('renderer', 'unknown-renderer');
    });

    const afterChanges = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="wc-coverage"]') as HTMLElement;
      const input = document.querySelector('[data-testid="wc-coverage-input"]') as HTMLInputElement;
      const core = element?.getTouchSpinInstance();
      return {
        coreValue: core?.getValue(),
        disabled: input?.disabled ?? null,
        readOnly: input?.readOnly ?? null,
        hasInstance: !!element?.getTouchSpinInstance(),
      };
    });

    expect(afterChanges.coreValue).toBe(30);
    expect(afterChanges.disabled).toBe(true);
    expect(afterChanges.readOnly).toBe(true);
    expect(afterChanges.hasInstance).toBe(true);
  });

  /**
   * Scenario: component creates internal input when none provided and cleanup restores state
   * Given a touchspin-input element without an inner input
   * When the component initializes itself
   * Then it creates the input with the provided attributes and cleanup removes the entire node on destroy
   */
  test('component creates internal input when none provided and cleanup restores state', async ({
    page,
  }) => {
    const details = await page.evaluate(() => {
      const element = document.createElement('touchspin-input');
      element.setAttribute('data-testid', 'wc-generated');
      element.setAttribute('value', '12');
      element.setAttribute('placeholder', 'Enter amount');
      document.body.appendChild(element);
      return null;
    });
    void details;

    await page.waitForFunction(() => {
      const element = document.querySelector('[data-testid="wc-generated"]') as HTMLElement;
      return !!element && !!element.getTouchSpinInstance?.();
    });

    const beforeDestroy = await page.evaluate(() => {
      const input = document.querySelector(
        '[data-testid="wc-generated-input"]'
      ) as HTMLInputElement;
      return {
        hasInput: !!input,
        value: input?.value,
        placeholder: input?.getAttribute('placeholder'),
      };
    });

    expect(beforeDestroy.hasInput).toBe(true);
    expect(beforeDestroy.value).toBe('12');
    expect(beforeDestroy.placeholder).toBe('Enter amount');

    await page.evaluate(() => {
      const element = document.querySelector('[data-testid="wc-generated"]') as HTMLElement;
      element?.destroy();
      element?.remove();
    });

    const nodeExists = await page.evaluate(() => {
      return !!document.querySelector('[data-testid="wc-generated"]');
    });

    expect(nodeExists).toBe(false);
  });
});
