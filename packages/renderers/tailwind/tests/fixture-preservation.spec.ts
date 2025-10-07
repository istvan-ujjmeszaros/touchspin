import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { ensureTailwindGlobals } from './helpers/tailwind-globals';

const TAILWIND_FIXTURE = '/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html';

/**
 * TEST: Fixture elements must be preserved through init, layout changes, and destroy
 *
 * This test ensures TouchSpin NEVER removes user-provided fixture elements.
 * Only TouchSpin-injected elements (marked with data-touchspin-injected) should be removed.
 */
test('preserves fixture elements through lifecycle', async ({ page }) => {
  await page.goto(TAILWIND_FIXTURE);
  await ensureTailwindGlobals(page);

  // Helper to get all elements in the advanced container
  const getContainerElements = () =>
    page.evaluate(() => {
      const container = document.querySelector('.flex.rounded-md');
      if (!container) return { fixture: [], injected: [], input: false };

      const children = Array.from(container.children);
      const fixture: string[] = [];
      const injected: string[] = [];
      let hasInput = false;

      children.forEach((child) => {
        const el = child as HTMLElement;
        const injectedType = el.getAttribute('data-touchspin-injected');

        if (el.tagName.toLowerCase() === 'input') {
          hasInput = true;
        } else if (injectedType) {
          injected.push(injectedType);
        } else {
          // Fixture element - capture its text content to identify it
          fixture.push(el.textContent?.trim() || 'empty');
        }
      });

      return { fixture, injected, input: hasInput };
    });

  // STEP 1: Check fixture BEFORE initialization
  const beforeInit = await getContainerElements();
  console.log('BEFORE INIT:', beforeInit);
  expect(beforeInit.fixture.length).toBeGreaterThan(0); // Should have fixture elements (# and units)
  expect(beforeInit.injected.length).toBe(0); // No TouchSpin elements yet
  expect(beforeInit.input).toBe(true); // Input exists

  // STEP 2: Initialize with horizontal layout
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced', {
    verticalbuttons: false,
  });

  const afterInit = await getContainerElements();
  console.log('AFTER INIT:', afterInit);
  expect(afterInit.fixture).toEqual(beforeInit.fixture); // ❌ FAILS - fixture elements destroyed!
  expect(afterInit.injected.length).toBeGreaterThan(0); // Should have TouchSpin buttons
  expect(afterInit.input).toBe(true);

  // STEP 3: Switch to vertical layout
  await apiHelpers.updateSettingsViaAPI(page, 'test-input-advanced', {
    verticalbuttons: true,
  });

  const afterVertical = await getContainerElements();
  console.log('AFTER VERTICAL:', afterVertical);
  expect(afterVertical.fixture).toEqual(beforeInit.fixture); // ❌ FAILS - fixture elements destroyed!
  expect(afterVertical.input).toBe(true);

  // STEP 4: Switch back to horizontal
  await apiHelpers.updateSettingsViaAPI(page, 'test-input-advanced', {
    verticalbuttons: false,
  });

  const afterHorizontal = await getContainerElements();
  console.log('AFTER HORIZONTAL:', afterHorizontal);
  expect(afterHorizontal.fixture).toEqual(beforeInit.fixture); // ❌ FAILS - fixture elements destroyed!
  expect(afterHorizontal.input).toBe(true);

  // STEP 5: Destroy TouchSpin
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input-advanced"]') as HTMLInputElement;
    const wrapper = document.querySelector('[data-testid="test-input-advanced-wrapper"]');
    console.log(
      '[BEFORE DESTROY] wrapper has attribute:',
      wrapper?.getAttribute('data-touchspin-injected')
    );
    console.log(
      '[BEFORE DESTROY] injected elements count:',
      wrapper?.querySelectorAll('[data-touchspin-injected]').length
    );

    if (input && (window as any).TouchSpin) {
      (window as any).TouchSpin.getInstance(input)?.destroy();
    }

    console.log(
      '[AFTER DESTROY] wrapper has attribute:',
      wrapper?.getAttribute('data-touchspin-injected')
    );
    console.log(
      '[AFTER DESTROY] injected elements count:',
      wrapper?.querySelectorAll('[data-touchspin-injected]').length
    );
  });

  const afterDestroy = await getContainerElements();
  console.log('AFTER DESTROY:', afterDestroy);
  expect(afterDestroy.fixture).toEqual(beforeInit.fixture); // Fixture elements still there
  expect(afterDestroy.injected.length).toBe(0); // All TouchSpin elements removed
  expect(afterDestroy.input).toBe(true); // Input still there
});
