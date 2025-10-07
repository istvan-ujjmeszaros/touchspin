/**
 * Feature: Bootstrap5 renderer coverage improvements
 * Background: fixture = /packages/renderers/bootstrap5/tests/fixtures/bootstrap5-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] updates vertical button classes via observer
 * [x] updates vertical button text via observer
 * [x] updates prefix/postfix extra classes via observer
 * [x] builds basic floating label layout
 * [x] builds floating label in existing input group
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { ensureBootstrap5Globals } from './helpers/bootstrap5-globals';

const BOOTSTRAP5_FIXTURE = '/packages/renderers/bootstrap5/tests/fixtures/bootstrap5-fixture.html';

async function initializeTouchSpinOnCleanFixture(page, testId: string, settings = {}) {
  await page.goto(BOOTSTRAP5_FIXTURE);
  await ensureBootstrap5Globals(page);
  await page.waitForFunction(() => window.testPageReady);
  await apiHelpers.initializeTouchspinFromGlobals(page, testId, settings);
}

test.describe('Bootstrap5 renderer coverage improvements', () => {
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
      buttonup_class: 'btn btn-primary',
      buttondown_class: 'btn btn-primary',
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
    expect(classes.up).toContain('bootstrap-touchspin-up');
    expect(classes.down).toContain('bootstrap-touchspin-down');

    await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
      verticalupclass: 'updated-up-class',
      verticaldownclass: 'updated-down-class',
    });

    classes = await getVerticalClasses();
    expect(classes.up).toContain('updated-up-class');
    expect(classes.down).toContain('updated-down-class');
    expect(classes.up).toContain('btn btn-primary');
    expect(classes.down).toContain('btn btn-primary');
    expect(classes.up).not.toContain('initial-up-class');
    expect(classes.down).not.toContain('initial-down-class');
  });

  /**
   * Scenario: updates vertical button text via observer
   * Given vertical layout with custom button text
   * When I change verticalup and verticaldown via API
   * Then both vertical buttons reflect the new text
   */
  test('updates vertical button text via observer', async ({ page }) => {
    await initializeTouchSpinOnCleanFixture(page, 'test-input', {
      verticalbuttons: true,
      verticalup: '▲',
      verticaldown: '▼',
    });

    const getVerticalText = async () =>
      page.evaluate(() => {
        const wrapper = document.querySelector('[data-touchspin-injected="vertical-wrapper"]');
        const up = wrapper?.querySelector('[data-touchspin-injected="up"]');
        const down = wrapper?.querySelector('[data-touchspin-injected="down"]');
        return {
          up: up?.textContent ?? null,
          down: down?.textContent ?? null,
        };
      });

    let text = await getVerticalText();
    expect(text.up).toBe('▲');
    expect(text.down).toBe('▼');

    await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
      verticalup: '↑',
      verticaldown: '↓',
    });

    text = await getVerticalText();
    expect(text.up).toBe('↑');
    expect(text.down).toBe('↓');
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
   * Scenario: builds basic floating label layout
   * Given an input inside a .form-floating container
   * When TouchSpin is initialized
   * Then it creates basic floating label structure
   */
  test('builds basic floating label layout', async ({ page }) => {
    await page.goto(BOOTSTRAP5_FIXTURE);
    await ensureBootstrap5Globals(page);
    await page.waitForFunction(() => window.testPageReady);

    // Create floating label structure
    await page.evaluate(() => {
      const floatingDiv = document.createElement('div');
      floatingDiv.className = 'form-floating';

      const input = document.createElement('input');
      input.type = 'number';
      input.id = 'floating-input';
      input.setAttribute('data-testid', 'floating-input');
      input.className = 'form-control';
      input.value = '50';
      input.placeholder = 'Amount';

      const label = document.createElement('label');
      label.setAttribute('for', 'floating-input');
      label.textContent = 'Amount';

      floatingDiv.appendChild(input);
      floatingDiv.appendChild(label);
      document.body.appendChild(floatingDiv);
    });

    await apiHelpers.initializeTouchspinFromGlobals(page, 'floating-input', {
      min: 0,
      max: 100,
    });

    const structure = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="floating-input-wrapper"]');
      const floatingContainer = wrapper?.querySelector('.form-floating');
      const input = document.querySelector('[data-testid="floating-input"]');
      const upButton = wrapper?.querySelector('[data-touchspin-injected="up"]');
      return {
        wrapperExists: !!wrapper,
        wrapperHasFloating: !!floatingContainer,
        floatingHasInput: floatingContainer?.contains(input as Node) ?? false,
        hasUpButton: !!upButton,
      };
    });

    expect(structure.wrapperExists).toBe(true);
    expect(structure.wrapperHasFloating).toBe(true);
    expect(structure.floatingHasInput).toBe(true);
    expect(structure.hasUpButton).toBe(true);
  });

  /**
   * Scenario: builds floating label in existing input group
   * Given an input in .form-floating inside .input-group
   * When TouchSpin is initialized
   * Then it preserves existing input-group structure
   */
  test('builds floating label in existing input group', async ({ page }) => {
    await page.goto(BOOTSTRAP5_FIXTURE);
    await ensureBootstrap5Globals(page);
    await page.waitForFunction(() => window.testPageReady);

    // Create advanced floating label structure
    await page.evaluate(() => {
      const inputGroup = document.createElement('div');
      inputGroup.className = 'input-group';

      const prefix = document.createElement('span');
      prefix.className = 'input-group-text';
      prefix.textContent = '$';

      const floatingDiv = document.createElement('div');
      floatingDiv.className = 'form-floating';

      const input = document.createElement('input');
      input.type = 'number';
      input.id = 'advanced-floating-input';
      input.setAttribute('data-testid', 'advanced-floating-input');
      input.className = 'form-control';
      input.value = '50';
      input.placeholder = 'Amount';

      const label = document.createElement('label');
      label.setAttribute('for', 'advanced-floating-input');
      label.textContent = 'Amount';

      floatingDiv.appendChild(input);
      floatingDiv.appendChild(label);

      inputGroup.appendChild(prefix);
      inputGroup.appendChild(floatingDiv);
      document.body.appendChild(inputGroup);
    });

    await apiHelpers.initializeTouchspinFromGlobals(page, 'advanced-floating-input', {
      min: 0,
      max: 100,
    });

    const structure = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="advanced-floating-input-wrapper"]');
      const floatingContainer = wrapper?.querySelector('.form-floating');
      const input = document.querySelector('[data-testid="advanced-floating-input"]');
      const upButton = wrapper?.querySelector('[data-touchspin-injected="up"]');
      const prefix = wrapper?.querySelector('.input-group-text');
      return {
        wrapperExists: !!wrapper,
        wrapperIsInputGroup: wrapper?.classList.contains('input-group') ?? false,
        hasFloating: !!floatingContainer,
        floatingHasInput: floatingContainer?.contains(input as Node) ?? false,
        hasUpButton: !!upButton,
        hasPrefix: !!prefix,
      };
    });

    expect(structure.wrapperExists).toBe(true);
    expect(structure.wrapperIsInputGroup).toBe(true);
    expect(structure.hasFloating).toBe(true);
    expect(structure.floatingHasInput).toBe(true);
    expect(structure.hasUpButton).toBe(true);
    expect(structure.hasPrefix).toBe(true);
  });
});
