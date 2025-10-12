/**
 * Feature: Vanilla renderer coverage improvements
 * Background: fixture = /packages/renderers/vanilla/tests/fixtures/vanilla-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] updates vertical button classes via observer
 * [x] updates prefix/postfix extra classes via observer
 * [x] applies theme variables including prefixed keys
 * [x] teardown removes wrapper and ts-input class
 * [x] falls back to placing input before up button when postfix is missing
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { ensureVanillaGlobals } from './helpers/vanilla-globals';

const VANILLA_FIXTURE = '/packages/renderers/vanilla/tests/fixtures/vanilla-fixture.html';

async function initializeTouchSpinOnCleanFixture(page, testId: string, settings = {}) {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await page.waitForFunction(() => window.testPageReady);
  await apiHelpers.initializeTouchSpin(page, testId, settings);
}

test.describe('Vanilla renderer coverage improvements', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  /**
   * Scenario: updates vertical button classes via observer
   * Given vertical layout with custom classes
   * When I change verticalupclass and verticaldownclass via API
   * Then both vertical buttons reflect the new classes while keeping base styles
   */
  test('updates vertical button classes via observer', async ({ page }) => {
    await initializeTouchSpinOnCleanFixture(page, 'test-input', {
      verticalbuttons: true,
      verticalupclass: 'initial-up-class',
      verticaldownclass: 'initial-down-class',
      buttonup_class: 'shared-button-class',
    });

    const getVerticalClasses = async () =>
      page.evaluate(() => {
        const wrapper = document.querySelector('[data-touchspin-injected="vertical-wrapper"]');
        const up = wrapper?.querySelector('[data-touchspin-injected="up"]');
        const down = wrapper?.querySelector('[data-touchspin-injected="down"]');
        return {
          up: up instanceof HTMLElement ? up.className : null,
          down: down instanceof HTMLElement ? down.className : null,
        };
      });

    let classes = await getVerticalClasses();
    expect(classes.up).toContain('initial-up-class');
    expect(classes.down).toContain('initial-down-class');
    expect(classes.up).toContain('ts-btn--vertical');
    expect(classes.down).toContain('ts-btn--vertical');

    await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
      verticalupclass: 'updated-up-class',
      verticaldownclass: 'updated-down-class',
    });

    classes = await getVerticalClasses();
    expect(classes.up).toContain('updated-up-class');
    expect(classes.down).toContain('updated-down-class');
    expect(classes.up).toContain('shared-button-class');
    expect(classes.down).toContain('shared-button-class');
    expect(classes.up).not.toContain('initial-up-class');
    expect(classes.down).not.toContain('initial-down-class');
  });

  /**
   * Scenario: updates prefix/postfix extra classes via observer
   * Given prefix and postfix with initial extra classes
   * When I change prefix_extraclass and postfix_extraclass via API
   * Then the respective elements reflect the new classes while keeping their text
   */
  test('updates prefix/postfix extra classes via observer', async ({ page }) => {
    await initializeTouchSpinOnCleanFixture(page, 'test-input', {
      prefix: '$',
      postfix: 'USD',
      prefix_extraclass: 'prefix-initial',
      postfix_extraclass: 'postfix-initial',
    });

    const getAddonState = async () =>
      page.evaluate(() => {
        const prefix = document.querySelector('[data-touchspin-injected="prefix"]');
        const postfix = document.querySelector('[data-touchspin-injected="postfix"]');
        return {
          prefixClass: prefix instanceof HTMLElement ? prefix.className : null,
          postfixClass: postfix instanceof HTMLElement ? postfix.className : null,
          prefixText: prefix?.textContent ?? null,
          postfixText: postfix?.textContent ?? null,
        };
      });

    let addonState = await getAddonState();
    expect(addonState.prefixClass).toContain('prefix-initial');
    expect(addonState.postfixClass).toContain('postfix-initial');
    expect(addonState.prefixText).toBe('$');
    expect(addonState.postfixText).toBe('USD');

    await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
      prefix_extraclass: 'prefix-updated',
      postfix_extraclass: 'postfix-updated',
    });

    addonState = await getAddonState();
    expect(addonState.prefixClass).toContain('prefix-updated');
    expect(addonState.postfixClass).toContain('postfix-updated');
    expect(addonState.prefixClass).not.toContain('prefix-initial');
    expect(addonState.postfixClass).not.toContain('postfix-initial');
    expect(addonState.prefixText).toBe('$');
    expect(addonState.postfixText).toBe('USD');
  });

  /**
   * Scenario: applies theme variables including prefixed keys
   * Given a renderer instance
   * When I call setTheme with regular and pre-prefixed keys
   * Then the wrapper receives both --ts-* variables and untouched prefixed keys
   */
  test('applies theme variables including prefixed keys', async ({ page }) => {
    await initializeTouchSpinOnCleanFixture(page, 'test-input');

    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]');
      const core = (input as any)?._touchSpinCore;
      core?.renderer?.setTheme({
        'primary-color': '#ff0000',
        '--custom-gap': '12px',
      });
      core?.renderer?.setTheme(null as any);
    });

    const themeValues = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      return {
        primary:
          wrapper instanceof HTMLElement
            ? wrapper.style.getPropertyValue('--ts-primary-color')
            : null,
        custom:
          wrapper instanceof HTMLElement ? wrapper.style.getPropertyValue('--custom-gap') : null,
      };
    });

    expect(themeValues.primary).toBe('#ff0000');
    expect(themeValues.custom).toBe('12px');
  });

  /**
   * Scenario: teardown removes wrapper and ts-input class
   * Given an initialized TouchSpin instance
   * When I call destroy on the core
   * Then the wrapper is removed and the input loses ts-input class
   */
  test('teardown removes wrapper and ts-input class', async ({ page }) => {
    await initializeTouchSpinOnCleanFixture(page, 'test-input');

    const inputSelector = '[data-testid="test-input"]';
    const wrapperSelector = '[data-testid="test-input-wrapper"]';

    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement | null;
      const core = (input as any)?._touchSpinCore;
      core?.destroy();
    });

    const inputHasClass = await page.$eval(inputSelector, (input) =>
      (input as HTMLInputElement).classList.contains('ts-input')
    );
    expect(inputHasClass).toBe(false);

    const wrapperExists = await page.evaluate(
      (selector) => !!document.querySelector(selector),
      wrapperSelector
    );
    expect(wrapperExists).toBe(false);
  });

  /**
   * Scenario: falls back to placing input before up button when postfix is missing
   * Given I intercept the postfix lookup during initialization
   * When postfix lookup returns null
   * Then the fallback branch inserts the input before the up button
   */
  test('falls back to placing input before up button when postfix is missing', async ({ page }) => {
    await page.goto(VANILLA_FIXTURE);
    await ensureVanillaGlobals(page);
    await page.waitForFunction(() => window.testPageReady);

    await page.evaluate(() => {
      const originalQuerySelector = Element.prototype.querySelector;
      (window as any).__vanillaOriginalQuerySelector = originalQuerySelector;
      Element.prototype.querySelector = function patchedQuerySelector(
        this: Element,
        selector: string
      ) {
        if (
          selector === '[data-touchspin-injected="postfix"]' &&
          this instanceof HTMLElement &&
          this.getAttribute('data-touchspin-injected') === 'wrapper' &&
          !(this as any).__fallbackHandled
        ) {
          (this as any).__fallbackHandled = true;
          (window as any).__vanillaPostfixFallbackHit = true;
          return null;
        }
        return originalQuerySelector.call(this, selector);
      };
    });

    try {
      await apiHelpers.initializeTouchSpin(page, 'test-input');
    } finally {
      await page.evaluate(() => {
        const original = (window as any).__vanillaOriginalQuerySelector;
        if (original) {
          Element.prototype.querySelector = original;
          delete (window as any).__vanillaOriginalQuerySelector;
        }
      });
    }

    const fallbackTriggered = await page.evaluate(
      () => !!(window as any).__vanillaPostfixFallbackHit
    );
    expect(fallbackTriggered).toBe(true);

    const order = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      if (!wrapper) return [];
      return Array.from(wrapper.children).map(
        (el) =>
          (el as HTMLElement).getAttribute('data-touchspin-injected') || el.tagName.toLowerCase()
      );
    });

    const inputIndex = order.indexOf('input');
    const upIndex = order.indexOf('up');
    expect(inputIndex).toBeGreaterThanOrEqual(0);
    expect(upIndex).toBeGreaterThanOrEqual(0);
    expect(inputIndex).toBeLessThan(upIndex);

    await page.evaluate(() => {
      delete (window as any).__vanillaPostfixFallbackHit;
    });
  });
});
