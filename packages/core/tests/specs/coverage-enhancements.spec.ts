/**
 * Feature: Core edge-case coverage
 * Background: fixture = /packages/core/tests/fixtures/core-api-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] converts numeric input to text when formatting callback adds non-numeric characters
 * [x] sanitizePartialSettings normalizes invalid partial settings
 * [x] TouchSpin helpers expose existing instances and public APIs
 * [x] wheel events respect mousewheel setting and active element
 * [x] keyboard handlers ignore repeats and trigger spin once
 * [x] boosted step respects caps and NaN fallback uses first click value
 * [x] AbstractRendererSimple handles wrapper permutations
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { artifactUrlFor, coreUrl } from '../__shared__/helpers/runtime/paths';

const fixtureUrl = '/packages/core/tests/fixtures/core-api-fixture.html';
const coreRendererUrl =
  artifactUrlFor('packages/core', 'rendererEntry') ?? '/packages/core/devdist/renderer.js';

async function importCore(page: import('@playwright/test').Page) {
  return page.evaluateHandle(
    async ({ url }) => {
      const module = await import(new URL(url, window.location.origin).href);
      return module.TouchSpinCore as unknown;
    },
    { url: coreUrl }
  );
}

test.describe('Core edge-case coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await apiHelpers.startCoverage(page);
    await apiHelpers.waitForPageReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  /**
   * Scenario: converts numeric input to text when formatting callback adds non-numeric characters
   * Given the core API fixture is loaded
   * And formatting callbacks inject non-numeric characters into the display value
   * When TouchSpin validates callback compatibility
   * Then the input switches to type="text" and restores original number attributes on destroy
   */
  test('converts numeric input to text when formatting callback adds non-numeric characters', async ({
    page,
  }) => {
    const TouchSpinCoreHandle = await importCore(page);

    const result = await page.evaluate(
      ([core]) => {
        const TouchSpinCore = core as any;
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('min', '0');
        input.setAttribute('max', '100');
        input.setAttribute('step', '5');

        const instance = new TouchSpinCore(input, { step: 5 });
        instance.initDOMEventHandling();

        instance.settings.callback_after_calculation = (value: string) => `$${value}`;
        instance.settings.callback_before_calculation = (value: string) =>
          value.replace(/[^0-9.-]/g, '');
        (instance as any)._validateCallbacks();

        const afterInit = {
          type: input.getAttribute('type'),
          hasMin: input.hasAttribute('min'),
          hasMax: input.hasAttribute('max'),
          hasStep: input.hasAttribute('step'),
        };

        instance.destroy();

        const restored = {
          type: input.getAttribute('type'),
          min: input.getAttribute('min'),
          max: input.getAttribute('max'),
          step: input.getAttribute('step'),
        };

        return { afterInit, restored };
      },
      [TouchSpinCoreHandle]
    );

    expect(result.afterInit.type).toBe('text');
    expect(result.afterInit.hasMin).toBe(false);
    expect(result.afterInit.hasMax).toBe(false);
    expect(result.afterInit.hasStep).toBe(false);

    expect(result.restored.type).toBe('number');
    expect(result.restored.min).toBe('0');
    expect(result.restored.max).toBe('100');
    expect(result.restored.step).toBe('5');
  });

  /**
   * Scenario: sanitizePartialSettings normalizes invalid partial settings
   * Given sanitizePartialSettings receives negative, swapped, and empty values
   * When the helper processes the partial settings
   * Then it clamps the numbers, swaps min/max, and nulls empty boundaries
   */
  test('sanitizePartialSettings normalizes invalid partial settings', async ({ page }) => {
    const results = await page.evaluate(
      async ({ url }) => {
        const { TouchSpinCore } = (await import(new URL(url, window.location.origin).href)) as any;

        const swapped = TouchSpinCore.sanitizePartialSettings(
          {
            step: -2,
            decimals: -3,
            min: '10',
            max: '5',
            stepinterval: -1,
            stepintervaldelay: 'NaN',
          },
          {} as any
        );

        const cleared = TouchSpinCore.sanitizePartialSettings(
          {
            min: '',
            max: undefined,
          },
          {} as any
        );

        return { swapped, cleared };
      },
      { url: coreUrl }
    );

    expect(results.swapped.step).toBe(1);
    expect(results.swapped.decimals).toBe(0);
    expect(results.swapped.min).toBe(5);
    expect(results.swapped.max).toBe(10);
    expect(results.swapped.stepinterval).toBe(100);
    expect(results.swapped.stepintervaldelay).toBe(500);

    expect(results.cleared.min).toBeNull();
    expect(results.cleared.max).toBeNull();
  });

  /**
   * Scenario: TouchSpin helpers expose existing instances and public APIs
   * Given TouchSpin initializes on an input element
   * When helper functions fetch existing instances and create new APIs
   * Then the helpers return live instances and attach() creates a working core
   */
  test('TouchSpin helpers expose existing instances and public APIs', async ({ page }) => {
    const outcome = await page.evaluate(
      async ({ url }) => {
        const module = (await import(new URL(url, window.location.origin).href)) as any;
        const { TouchSpin, getTouchSpin, createPublicApi, attach } = module;

        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '9';
        const api = TouchSpin(input, { step: 2, initval: 9 });
        if (!api) throw new Error('TouchSpin did not return API');
        const existing = getTouchSpin(input);

        const created = createPublicApi(input, { step: 4 });
        const attached = attach(input, { step: 1 });

        const valueAfterAttach = attached.getValue();
        attached.destroy();

        return {
          existingValue: existing?.getValue?.() ?? null,
          hasDeprecatedApi: created !== null,
          valueAfterAttach,
        };
      },
      { url: coreUrl }
    );

    expect(outcome.existingValue).not.toBeNull();
    expect(outcome.hasDeprecatedApi).toBe(true);
    expect(outcome.valueAfterAttach).toBeGreaterThan(0);
  });

  /**
   * Scenario: wheel events respect mousewheel setting and active element
   * Given a core instance with mousewheel disabled by default
   * When wheel events fire before and after enabling mousewheel support
   * Then values only change when mousewheel is enabled and the input is focused
   */
  test('wheel events respect mousewheel setting and active element', async ({ page }) => {
    const TouchSpinCoreHandle = await importCore(page);

    const results = await page.evaluate(
      ([core]) => {
        const TouchSpinCore = core as any;
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.focus();
        const instance = new TouchSpinCore(input, { step: 1, mousewheel: false });
        instance.initDOMEventHandling();

        const before = instance.getValue();
        instance._handleWheel(new WheelEvent('wheel', { deltaY: -120, bubbles: true }));
        const afterDisabled = instance.getValue();

        instance.settings.mousewheel = true;
        instance._handleWheel(new WheelEvent('wheel', { deltaY: -120, bubbles: true }));
        const afterUp = instance.getValue();
        instance._handleWheel(new WheelEvent('wheel', { deltaY: 160, bubbles: true }));
        const afterDown = instance.getValue();

        instance.destroy();

        return { before, afterDisabled, afterUp, afterDown };
      },
      [TouchSpinCoreHandle]
    );

    expect(results.afterDisabled).toBe(results.before);
    expect(results.afterUp).toBe(results.before + 1);
    expect(results.afterDown).toBe(results.afterUp - 1);
  });

  /**
   * Scenario: keyboard handlers ignore repeats and trigger spin once
   * Given the core instance listens for keyboard events
   * When a repeat keydown event and a single keydown event occur
   * Then repeat events are ignored and single presses trigger one increment before keyup stops spin
   */
  test('keyboard handlers ignore repeats and trigger spin once', async ({ page }) => {
    const TouchSpinCoreHandle = await importCore(page);

    const values = await page.evaluate(
      ([core]) => {
        const TouchSpinCore = core as any;
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const instance = new TouchSpinCore(input, { step: 1 });
        instance.initDOMEventHandling();

        const repeatEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        Object.defineProperty(repeatEvent, 'keyCode', { value: 13 });
        Object.defineProperty(repeatEvent, 'repeat', { value: true });

        const before = instance.getValue();
        instance._handleUpKeyDown(repeatEvent);
        const afterRepeat = instance.getValue();

        const triggerEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        Object.defineProperty(triggerEvent, 'keyCode', { value: 13 });
        instance._handleUpKeyDown(triggerEvent);
        const afterTrigger = instance.getValue();

        const upKeyUp = new KeyboardEvent('keyup', { key: 'Enter', bubbles: true });
        Object.defineProperty(upKeyUp, 'keyCode', { value: 13 });
        instance._handleUpKeyUp(upKeyUp);

        instance.destroy();

        return { before, afterRepeat, afterTrigger };
      },
      [TouchSpinCoreHandle]
    );

    expect(values.afterRepeat).toBe(values.before);
    expect(values.afterTrigger).toBe(values.before + 1);
  });

  /**
   * Scenario: boosted step respects caps and NaN fallback uses first click value
   * Given booster settings with a capped max step and a first-click fallback value
   * When the boosted step is calculated after several spins and NaN input occurs
   * Then the step respects the cap and NaN resolves to the configured first click value
   */
  test('boosted step respects caps and NaN fallback uses first click value', async ({ page }) => {
    const TouchSpinCoreHandle = await importCore(page);

    const results = await page.evaluate(
      ([core]) => {
        const TouchSpinCore = core as any;
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const instance = new TouchSpinCore(input, {
          step: 2,
          booster: true,
          boostat: 1,
          maxboostedstep: 6,
          firstclickvalueifempty: 42,
          min: 0,
          max: 100,
        });
        instance.initDOMEventHandling();

        instance.spincount = 4;
        const boosted = instance._getBoostedStep();
        instance.settings.min = 40;
        instance.settings.max = 44;
        const nextFromNaN = instance._nextValue('up', Number.NaN);

        instance.destroy();

        return { boosted, nextFromNaN };
      },
      [TouchSpinCoreHandle]
    );

    expect(results.boosted).toBe(6);
    expect(results.nextFromNaN).toBe(42);
  });

  /**
   * Scenario: AbstractRendererSimple handles wrapper permutations
   * Given wrapper references with different attribute and parent combinations
   * When removeInjectedElements executes for each case
   * Then simple wrappers unwrap the input, advanced wrappers clear metadata, and unrelated injected nodes remain untouched
   */
  test('AbstractRendererSimple handles wrapper permutations', async ({ page }) => {
    const outcomes = await page.evaluate(
      async ({ rendererUrl }) => {
        const module = await import(new URL(rendererUrl, window.location.origin).href);
        const { AbstractRendererSimple } = module as any;

        class TestRenderer extends AbstractRendererSimple {
          init(): void {}
        }

        const coreStub = {
          attachUpEvents: () => {},
          attachDownEvents: () => {},
          observeSetting: () => () => {},
        };

        const makeHost = (id: string) => {
          const container = document.createElement('div');
          container.id = id;
          document.body.appendChild(container);
          const input = document.createElement('input');
          input.setAttribute('data-testid', id);
          container.appendChild(input);
          return { container, input };
        };

        const results: Record<string, unknown> = {};

        // No wrapper defined
        {
          const { container, input } = makeHost('no-wrapper');
          const renderer = new TestRenderer(input, {} as any, coreStub);
          renderer.removeInjectedElements();
          results.noWrapperParent = input.parentElement === container;
          container.remove();
        }

        // Wrapper without attribute should be left intact
        {
          const { container, input } = makeHost('no-attr');
          const wrapper = document.createElement('div');
          wrapper.appendChild(input);
          container.appendChild(wrapper);
          const renderer = new TestRenderer(input, {} as any, coreStub);
          renderer.wrapper = wrapper;
          renderer.removeInjectedElements();
          results.noAttrWrapperRetained = container.contains(wrapper);
          results.noAttrInputParent = input.parentElement === wrapper;
          container.remove();
        }

        // Wrapper without parent should be ignored
        {
          const { container, input } = makeHost('orphan');
          const orphanWrapper = document.createElement('div');
          const renderer = new TestRenderer(input, {} as any, coreStub);
          renderer.wrapper = orphanWrapper;
          renderer.removeInjectedElements();
          results.orphanStillDetached = orphanWrapper.parentElement === null;
          container.remove();
        }

        // Default wrapper removes itself and only related injected nodes
        {
          const { container, input } = makeHost('simple-wrapper');
          const wrapper = document.createElement('div');
          wrapper.setAttribute('data-touchspin-injected', 'wrapper');
          wrapper.appendChild(input);
          container.appendChild(wrapper);

          const related = document.createElement('span');
          related.setAttribute('data-touchspin-injected', 'prefix');
          wrapper.appendChild(related);

          const strayHolder = document.createElement('aside');
          const stray = document.createElement('div');
          stray.setAttribute('data-touchspin-injected', 'stray');
          strayHolder.appendChild(stray);
          document.body.appendChild(strayHolder);

          input.setAttribute('data-touchspin-injected', 'self');

          const renderer = new TestRenderer(input, {} as any, coreStub);
          renderer.wrapper = wrapper;
          renderer.removeInjectedElements();

          results.simpleWrapperRemoved = !container.contains(wrapper);
          results.simpleInputReparented = input.parentElement === container;
          results.relatedRemoved = !document.body.contains(related);
          results.strayRetained = strayHolder.contains(stray);

          strayHolder.remove();
          container.remove();
        }

        // Advanced wrapper keeps node but clears metadata
        {
          const { container, input } = makeHost('advanced-wrapper');
          const wrapper = document.createElement('div');
          wrapper.classList.add('bootstrap-touchspin');
          wrapper.setAttribute('data-touchspin-injected', 'wrapper-advanced');
          wrapper.appendChild(input);
          container.appendChild(wrapper);

          const renderer = new TestRenderer(input, {} as any, coreStub);
          renderer.wrapper = wrapper;
          renderer.removeInjectedElements();

          results.advancedWrapperPresent = container.contains(wrapper);
          results.advancedAttributeCleared = !wrapper.hasAttribute('data-touchspin-injected');
          results.advancedClassCleared = !wrapper.classList.contains('bootstrap-touchspin');

          container.remove();
        }

        return results;
      },
      { rendererUrl: coreRendererUrl }
    );

    expect(outcomes.noWrapperParent).toBe(true);
    expect(outcomes.noAttrWrapperRetained).toBe(true);
    expect(outcomes.noAttrInputParent).toBe(true);
    expect(outcomes.orphanStillDetached).toBe(true);
    expect(outcomes.simpleWrapperRemoved).toBe(true);
    expect(outcomes.simpleInputReparented).toBe(true);
    expect(outcomes.relatedRemoved).toBe(true);
    expect(outcomes.strayRetained).toBe(true);
    expect(outcomes.advancedWrapperPresent).toBe(true);
    expect(outcomes.advancedAttributeCleared).toBe(true);
    expect(outcomes.advancedClassCleared).toBe(true);
  });
});
