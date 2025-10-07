/**
 * Feature: Tailwind renderer coverage improvements
 * Background: fixture = /packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] updates vertical button classes via observer
 * [x] updates prefix/postfix extra classes via observer
 * [x] builds advanced input group with existing container
 * [x] places input before postfix when prefix is empty
 * [x] handles small input size detection and styling
 * [x] builds advanced input group with vertical layout
 * [x] ensures input is moved into container when outside
 * [x] moves input to container when wrapped in intermediate element
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

  /**
   * Scenario: places input before postfix when prefix is empty
   * Given basic input group with postfix but no prefix
   * When TouchSpin is initialized
   * Then input is placed before postfix element
   */
  test('places input before postfix when prefix is empty', async ({ page }) => {
    await initializeTouchSpinOnCleanFixture(page, 'test-input', {
      prefix: '', // Empty prefix
      postfix: 'units',
    });

    const elementOrder = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
      if (!wrapper) return [];
      return Array.from(wrapper.children).map(
        (el) =>
          (el as HTMLElement).getAttribute('data-touchspin-injected') ||
          (el as HTMLElement).tagName.toLowerCase()
      );
    });

    const inputIndex = elementOrder.indexOf('input');
    const postfixIndex = elementOrder.indexOf('postfix');
    expect(inputIndex).toBeGreaterThanOrEqual(0);
    expect(postfixIndex).toBeGreaterThan(inputIndex);
  });

  /**
   * Scenario: handles small input size detection and styling
   * Given an input with text-sm class
   * When TouchSpin is initialized
   * Then wrapper and buttons receive small size classes
   */
  test('handles small input size detection and styling', async ({ page }) => {
    await page.goto(TAILWIND_FIXTURE);
    await ensureTailwindGlobals(page);
    await page.waitForFunction(() => window.testPageReady);

    // Create input with small size class
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.type = 'number';
      input.value = '50';
      input.className = 'text-sm py-1';
      input.setAttribute('data-testid', 'small-input');
      document.body.appendChild(input);
    });

    await apiHelpers.initializeTouchSpin(page, 'small-input', {
      min: 0,
      max: 100,
    });

    const sizeClasses = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="small-input-wrapper"]');
      const upButton = wrapper?.querySelector('[data-touchspin-injected="up"]');
      return {
        wrapperHasSmall: wrapper?.classList.contains('text-sm') ?? false,
        buttonHasSmall: upButton?.classList.contains('text-sm') ?? false,
        buttonHasPy1: upButton?.classList.contains('py-1') ?? false,
      };
    });

    expect(sizeClasses.wrapperHasSmall).toBe(true);
    expect(sizeClasses.buttonHasSmall).toBe(true);
    expect(sizeClasses.buttonHasPy1).toBe(true);
  });

  /**
   * Scenario: builds advanced input group with vertical layout
   * Given an input inside a .flex.rounded-md container
   * When TouchSpin is initialized with vertical buttons
   * Then it uses advanced mode with vertical button layout
   */
  test('builds advanced input group with vertical layout', async ({ page }) => {
    await page.goto(TAILWIND_FIXTURE);
    await ensureTailwindGlobals(page);
    await page.waitForFunction(() => window.testPageReady);

    // Create input inside advanced container
    await page.evaluate(() => {
      const container = document.createElement('div');
      container.className = 'flex rounded-md';

      const input = document.createElement('input');
      input.type = 'number';
      input.value = '50';
      input.setAttribute('data-testid', 'advanced-vertical-input');

      container.appendChild(input);
      document.body.appendChild(container);
    });

    // Initialize with vertical layout
    await apiHelpers.initializeTouchSpin(page, 'advanced-vertical-input', {
      verticalbuttons: true,
      min: 0,
      max: 100,
    });

    const layoutInfo = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="advanced-vertical-input-wrapper"]');
      const verticalWrapper = wrapper?.querySelector(
        '[data-touchspin-injected="vertical-wrapper"]'
      );
      return {
        wrapperExists: !!wrapper,
        hasVerticalWrapper: !!verticalWrapper,
        wrapperIsFlexRounded:
          wrapper?.classList.contains('flex') && wrapper?.classList.contains('rounded-md'),
      };
    });

    expect(layoutInfo.wrapperExists).toBe(true);
    expect(layoutInfo.hasVerticalWrapper).toBe(true);
    expect(layoutInfo.wrapperIsFlexRounded).toBe(true);
  });

  /**
   * Scenario: ensures input is moved into container when outside
   * Given an input outside a .flex.rounded-md container
   * When ensureInputInContainer is called
   * Then input is moved into the container
   */
  test('ensures input is moved into container when outside', async ({ page }) => {
    await page.goto(TAILWIND_FIXTURE);
    await ensureTailwindGlobals(page);
    await page.waitForFunction(() => window.testPageReady);

    // Create container and input separately (input outside container initially)
    const initialState = await page.evaluate(() => {
      const container = document.createElement('div');
      container.className = 'flex rounded-md';
      container.setAttribute('data-testid', 'separate-container');

      const input = document.createElement('input');
      input.type = 'number';
      input.value = '50';
      input.setAttribute('data-testid', 'separate-input');

      // Append them separately - input NOT in container
      document.body.appendChild(container);
      document.body.appendChild(input);

      const containerEl = document.querySelector('[data-testid="separate-container"]');
      const inputEl = document.querySelector('[data-testid="separate-input"]');
      return {
        inputInContainer: containerEl?.contains(inputEl as Node) ?? false,
      };
    });

    expect(initialState.inputInContainer).toBe(false);

    // Now initialize TouchSpin - it should detect the container and move input into it
    await apiHelpers.initializeTouchSpin(page, 'separate-input', {
      min: 0,
      max: 100,
    });

    const finalState = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="separate-input-wrapper"]');
      const input = document.querySelector('[data-testid="separate-input"]');
      return {
        inputInWrapper: wrapper?.contains(input as Node) ?? false,
        wrapperIsFlexRounded:
          wrapper?.classList.contains('flex') && wrapper?.classList.contains('rounded-md'),
      };
    });

    expect(finalState.inputInWrapper).toBe(true);
    expect(finalState.wrapperIsFlexRounded).toBe(true);
  });

  /**
   * Scenario: moves input to container when wrapped in intermediate element
   * Given an input wrapped in a div inside a .flex.rounded-md container
   * When TouchSpin is initialized
   * Then input is moved to be a direct child of the container
   */
  test('moves input to container when wrapped in intermediate element', async ({ page }) => {
    await page.goto(TAILWIND_FIXTURE);
    await ensureTailwindGlobals(page);
    await page.waitForFunction(() => window.testPageReady);

    // Create container with input wrapped in intermediate element
    const initialState = await page.evaluate(() => {
      const container = document.createElement('div');
      container.className = 'flex rounded-md';
      // No testid on container - it will get one from the input

      const intermediateDiv = document.createElement('div');
      const input = document.createElement('input');
      input.type = 'number';
      input.value = '50';
      input.setAttribute('data-testid', 'nested-input');

      intermediateDiv.appendChild(input);
      container.appendChild(intermediateDiv);
      document.body.appendChild(container);

      const inputEl = document.querySelector('[data-testid="nested-input"]') as HTMLElement;
      const closestFlex = inputEl?.closest('.flex.rounded-md');
      return {
        inputParentIsFlex: (inputEl?.parentElement as HTMLElement)?.classList.contains('flex'),
        inputInsideFlex: !!closestFlex,
      };
    });

    expect(initialState.inputInsideFlex).toBe(true);
    expect(initialState.inputParentIsFlex).toBe(false);

    // Initialize TouchSpin
    await apiHelpers.initializeTouchSpin(page, 'nested-input', {
      min: 0,
      max: 100,
    });

    const finalState = await page.evaluate(() => {
      const input = document.querySelector('[data-testid="nested-input"]') as HTMLElement;
      const wrapper = document.querySelector('[data-testid="nested-input-wrapper"]') as HTMLElement;
      return {
        wrapperExists: !!wrapper,
        wrapperIsFlexRounded:
          wrapper?.classList.contains('flex') && wrapper?.classList.contains('rounded-md'),
        wrapperHasInput: wrapper?.contains(input) ?? false,
        wrapperHasButtons: !!wrapper?.querySelector('[data-touchspin-injected="up"]'),
      };
    });

    expect(finalState.wrapperExists).toBe(true);
    expect(finalState.wrapperIsFlexRounded).toBe(true);
    expect(finalState.wrapperHasInput).toBe(true);
    expect(finalState.wrapperHasButtons).toBe(true);
  });
});
