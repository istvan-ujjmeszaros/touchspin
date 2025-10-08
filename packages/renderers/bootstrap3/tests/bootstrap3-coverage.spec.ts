/**
 * Feature: Bootstrap3 renderer coverage improvements
 * Background: fixture = /packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] updates vertical button classes via observer
 * [x] updates prefix/postfix extra classes via observer
 * [x] removes form-control class on teardown when renderer added it
 * [x] preserves form-control class on teardown when already present
 * [x] detects input-xs and applies input-group-xs
 * [x] detects input-sm and applies input-group-sm
 * [x] updates prefix value when element already exists
 * [x] removes postfix by setting value to empty
 * [x] handles advanced input-group in horizontal mode with postfix
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { ensureBootstrap3Globals } from './helpers/bootstrap3-globals';

const BOOTSTRAP3_FIXTURE = '/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html';

async function initializeTouchSpinOnCleanFixture(page, testId: string, settings = {}) {
  await page.goto(BOOTSTRAP3_FIXTURE);
  await ensureBootstrap3Globals(page);
  await page.waitForFunction(() => window.testPageReady);
  await apiHelpers.initializeTouchSpin(page, testId, settings);
}

test.describe('Bootstrap3 renderer coverage improvements', () => {
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
   * Scenario: removes form-control class on teardown when renderer added it
   * Given an input without form-control class
   * When TouchSpin initializes and then destroys
   * Then the renderer adds form-control on init and removes it on destroy
   */
  test('removes form-control class on teardown when renderer added it', async ({ page }) => {
    await page.goto(BOOTSTRAP3_FIXTURE);
    await ensureBootstrap3Globals(page);
    await page.waitForFunction(() => window.testPageReady);

    // Remove form-control class before init
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
      input.className = 'my-custom-class';
    });

    const input = page.getByTestId('test-input');
    await expect(input).not.toHaveClass(/form-control/);
    await expect(input).toHaveClass(/my-custom-class/);

    await apiHelpers.initializeTouchSpin(page, 'test-input', {});

    // Renderer should add form-control
    await expect(input).toHaveClass(/form-control/);
    await expect(input).toHaveClass(/my-custom-class/);

    // Destroy
    await page.evaluate(() => {
      const inp = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
      (inp as any)?._touchSpinCore?.destroy();
    });

    // Renderer should remove form-control since it added it
    await expect(input).not.toHaveClass(/form-control/);
    await expect(input).toHaveClass(/my-custom-class/);
  });

  /**
   * Scenario: preserves form-control class on teardown when already present
   * Given an input with form-control class already
   * When TouchSpin initializes and then destroys
   * Then the renderer preserves the existing form-control class
   */
  test('preserves form-control class on teardown when already present', async ({ page }) => {
    await page.goto(BOOTSTRAP3_FIXTURE);
    await ensureBootstrap3Globals(page);
    await page.waitForFunction(() => window.testPageReady);

    // Ensure form-control class exists before init
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
      input.className = 'form-control my-custom-class';
    });

    const input = page.getByTestId('test-input');
    await expect(input).toHaveClass(/form-control/);

    await apiHelpers.initializeTouchSpin(page, 'test-input', {});

    await expect(input).toHaveClass(/form-control/);

    // Destroy
    await page.evaluate(() => {
      const inp = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
      (inp as any)?._touchSpinCore?.destroy();
    });

    // Should preserve form-control since it was there originally
    await expect(input).toHaveClass(/form-control/);
    await expect(input).toHaveClass(/my-custom-class/);
  });

  /**
   * Scenario: detects input-xs and applies input-group-xs
   * Given an input with input-xs class
   * When TouchSpin initializes
   * Then the wrapper gets input-group-xs class
   */
  test('detects input-xs and applies input-group-xs', async ({ page }) => {
    await page.goto(BOOTSTRAP3_FIXTURE);
    await ensureBootstrap3Globals(page);
    await page.waitForFunction(() => window.testPageReady);

    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
      input.className = 'form-control input-xs';
    });

    await apiHelpers.initializeTouchSpin(page, 'test-input', {});

    const wrapper = page.getByTestId('test-input-wrapper');
    await expect(wrapper).toHaveClass(/input-group-xs/);
  });

  /**
   * Scenario: detects input-sm and applies input-group-sm
   * Given an input with input-sm class
   * When TouchSpin initializes
   * Then the wrapper gets input-group-sm class
   */
  test('detects input-sm and applies input-group-sm', async ({ page }) => {
    await page.goto(BOOTSTRAP3_FIXTURE);
    await ensureBootstrap3Globals(page);
    await page.waitForFunction(() => window.testPageReady);

    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
      input.className = 'form-control input-sm';
    });

    await apiHelpers.initializeTouchSpin(page, 'test-input', {});

    const wrapper = page.getByTestId('test-input-wrapper');
    await expect(wrapper).toHaveClass(/input-group-sm/);
  });

  /**
   * Scenario: updates prefix value when element already exists
   * Given TouchSpin with a prefix
   * When I update the prefix value
   * Then the prefix element updates without rebuilding DOM
   */
  test('updates prefix value when element already exists', async ({ page }) => {
    await initializeTouchSpinOnCleanFixture(page, 'test-input', {
      prefix: '$',
    });

    const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
    await expect(elements.prefix).toHaveText('$');

    // Update prefix value
    await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
      prefix: '€',
    });

    // Should update text without rebuild
    await expect(elements.prefix).toHaveText('€');
  });

  /**
   * Scenario: removes postfix by setting value to empty
   * Given TouchSpin with a postfix
   * When I set postfix to empty string
   * Then the postfix element is removed via DOM rebuild
   */
  test('removes postfix by setting value to empty', async ({ page }) => {
    await initializeTouchSpinOnCleanFixture(page, 'test-input', {
      postfix: 'USD',
    });

    const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
    await expect(elements.postfix).toBeVisible();
    await expect(elements.postfix).toHaveText('USD');

    // Remove postfix by setting to empty
    await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
      postfix: '',
    });

    // Should be removed
    await expect(elements.postfix).not.toBeVisible();
  });

  /**
   * Scenario: handles advanced input-group in horizontal mode with postfix
   * Given an existing input-group wrapper
   * When TouchSpin initializes in horizontal mode with postfix
   * Then postfix is inserted correctly in the existing group
   */
  test('handles advanced input-group in horizontal mode with postfix', async ({ page }) => {
    await page.goto(BOOTSTRAP3_FIXTURE);
    await ensureBootstrap3Globals(page);
    await page.waitForFunction(() => window.testPageReady);

    // Create existing input-group around the input
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
      const existingWrapper = document.createElement('div');
      existingWrapper.className = 'input-group';
      input.parentElement?.insertBefore(existingWrapper, input);
      existingWrapper.appendChild(input);
    });

    await apiHelpers.initializeTouchSpin(page, 'test-input', {
      verticalbuttons: false, // horizontal mode
      postfix: 'units',
    });

    // Verify postfix is inserted in existing group
    const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
    await expect(elements.postfix).toBeVisible();
    await expect(elements.postfix).toHaveText('units');

    // Verify wrapper is the existing input-group (has bootstrap-touchspin class added)
    await expect(elements.wrapper).toHaveClass(/bootstrap-touchspin/);
  });
});
