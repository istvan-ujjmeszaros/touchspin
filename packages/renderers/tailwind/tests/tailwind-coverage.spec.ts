/**
 * Feature: Tailwind renderer coverage improvements
 * Background: fixture = /packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] updates vertical button classes via observer
 * [x] updates prefix/postfix extra classes via observer
 * [x] builds advanced input group with existing container
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { ensureTailwindGlobals } from './helpers/tailwind-globals';

const TAILWIND_FIXTURE = '/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html';

async function initializeTouchSpinOnCleanFixture(page, testId: string, settings = {}) {
  await page.goto(TAILWIND_FIXTURE);
  await ensureTailwindGlobals(page);
  await page.waitForFunction(() => window.testPageReady);
  await apiHelpers.initializeTouchSpin(page, testId, settings);
}

test.describe('Tailwind renderer coverage improvements', () => {
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
    expect(classes.up).toContain('tailwind-btn');
    expect(classes.down).toContain('tailwind-btn');

    await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
      verticalupclass: 'updated-up-class',
      verticaldownclass: 'updated-down-class',
    });

    classes = await getVerticalClasses();
    expect(classes.up).toContain('updated-up-class');
    expect(classes.down).toContain('updated-down-class');
    expect(classes.up).toContain('tailwind-btn');
    expect(classes.down).toContain('tailwind-btn');
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
   * Scenario: builds advanced input group with existing container
   * Given an input inside a .flex.rounded-md container
   * When TouchSpin is initialized
   * Then it uses advanced mode and ensures input is in the container
   */
  test('builds advanced input group with existing container', async ({ page }) => {
    await page.goto(TAILWIND_FIXTURE);
    await ensureTailwindGlobals(page);
    await page.waitForFunction(() => window.testPageReady);

    // Create input inside advanced container (no testid on container)
    await page.evaluate(() => {
      const container = document.createElement('div');
      container.className = 'flex rounded-md';

      const input = document.createElement('input');
      input.type = 'number';
      input.value = '50';
      input.setAttribute('data-testid', 'advanced-input');

      container.appendChild(input);
      document.body.appendChild(container);
    });

    // Initialize TouchSpin - should detect advanced mode
    await apiHelpers.initializeTouchSpin(page, 'advanced-input', {
      min: 0,
      max: 100,
      step: 1,
    });

    // Verify advanced mode was used
    const containerInfo = await page.evaluate(() => {
      const input = document.querySelector('[data-testid="advanced-input"]') as HTMLElement;
      const wrapper = document.querySelector(
        '[data-testid="advanced-input-wrapper"]'
      ) as HTMLElement;
      const originalContainer = input?.closest('.flex.rounded-md');
      return {
        wrapperExists: !!wrapper,
        wrapperIsOriginalContainer: wrapper === originalContainer,
        wrapperHasInput: wrapper?.contains(input) ?? false,
        wrapperHasButtons: !!wrapper?.querySelector('[data-touchspin-injected="up"]'),
      };
    });

    expect(containerInfo.wrapperExists).toBe(true);
    expect(containerInfo.wrapperIsOriginalContainer).toBe(true);
    expect(containerInfo.wrapperHasInput).toBe(true);
    expect(containerInfo.wrapperHasButtons).toBe(true);

    // Verify functionality works
    await apiHelpers.clickUpButton(page, 'advanced-input');
    await apiHelpers.expectValueToBe(page, 'advanced-input', '51');
  });
});
