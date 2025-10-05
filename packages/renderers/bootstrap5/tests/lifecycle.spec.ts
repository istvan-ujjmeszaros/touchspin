/**
 * Feature: Bootstrap 5 renderer lifecycle (destroy/reinit)
 * Background: fixture = /packages/renderers/bootstrap5/tests/fixtures/bootstrap5-fixture.html
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import {
  initializeTouchspinFromGlobals,
  installDomHelpers,
  rendererClassUrlFor,
  waitForPageReady,
} from '@touchspin/core/test-helpers';
import { lifecycleRendererSuite } from '@touchspin/core/test-helpers/renderers';
import { ensureBootstrap5Globals } from './helpers/bootstrap5-globals';

const BOOTSTRAP5_FIXTURE = '/packages/renderers/bootstrap5/tests/fixtures/bootstrap5-fixture.html';
const FLOATING_LABELS_FIXTURE =
  '/packages/renderers/bootstrap5/tests/fixtures/floating-labels-fixture.html';

// Run shared lifecycle suite
lifecycleRendererSuite('bootstrap5', rendererClassUrlFor('bootstrap5'), BOOTSTRAP5_FIXTURE, {
  setupGlobals: ensureBootstrap5Globals,
});

// Bootstrap5-specific lifecycle tests
test.describe('Bootstrap 5 Lifecycle: Floating Labels', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FLOATING_LABELS_FIXTURE);
    await ensureBootstrap5Globals(page);
    await waitForPageReady(page);
    await installDomHelpers(page);
  });

  test('preserves floating label structure across destroy/reinit', async ({ page }) => {
    // Verify initial floating label structure
    // eslint-disable-next-line playwright/no-page-locator
    const floatingContainer = page.locator('.form-floating').first();
    // eslint-disable-next-line playwright/no-page-locator
    const label = page.locator('.form-floating label[for="basic-floating"]');

    await expect(floatingContainer).toBeVisible();
    await expect(label).toBeVisible();
    await expect(label).toHaveText('Amount');

    // Initialize TouchSpin
    await initializeTouchspinFromGlobals(page, 'basic-floating', {
      buttonup_txt: 'UP1',
    });

    // Verify TouchSpin initialized
    expect(await apiHelpers.isTouchSpinInitialized(page, 'basic-floating')).toBe(true);

    // Floating label structure should still be intact
    await expect(floatingContainer).toBeVisible();
    await expect(label).toBeVisible();
    await expect(label).toHaveText('Amount');

    // Destroy
    await page.evaluate((testId) => {
      window.__ts?.requireCoreByTestId(testId).destroy();
    }, 'basic-floating');

    // Verify destroyed
    expect(await apiHelpers.isTouchSpinInitialized(page, 'basic-floating')).toBe(false);

    // Floating label structure should STILL be intact
    await expect(floatingContainer).toBeVisible();
    await expect(label).toBeVisible();
    await expect(label).toHaveText('Amount');

    // Verify input is back in floating container
    const input = page.getByTestId('basic-floating');
    const inputParent = await input.evaluate((el) =>
      el.parentElement?.classList.contains('form-floating')
    );
    expect(inputParent).toBe(true);

    // Reinitialize with different settings
    await initializeTouchspinFromGlobals(page, 'basic-floating', {
      buttonup_txt: 'UP2',
    });

    // Verify reinitialized
    expect(await apiHelpers.isTouchSpinInitialized(page, 'basic-floating')).toBe(true);

    // Floating label structure should STILL be intact
    await expect(floatingContainer).toBeVisible();
    await expect(label).toBeVisible();
    await expect(label).toHaveText('Amount');
  });

  test('preserves input-group with floating labels across destroy/reinit', async ({ page }) => {
    // Verify initial structure
    // eslint-disable-next-line playwright/no-page-locator
    const floatingContainer = page.locator('.form-floating').nth(1); // Second one is the input-group variant
    // eslint-disable-next-line playwright/no-page-locator
    const label = page.locator('.form-floating label[for="group-floating"]');

    await expect(floatingContainer).toBeVisible();
    await expect(label).toBeVisible();
    await expect(label).toHaveText('Price');

    // Initialize TouchSpin
    await initializeTouchspinFromGlobals(page, 'group-floating', {
      prefix: '$',
      postfix: '.00',
    });

    // Verify TouchSpin initialized with prefix/postfix
    expect(await apiHelpers.isTouchSpinInitialized(page, 'group-floating')).toBe(true);
    const wrapper = page.getByTestId('group-floating-wrapper');
    await expect(wrapper.locator('.input-group-text').first()).toHaveText('$');
    await expect(wrapper.locator('.input-group-text').last()).toHaveText('.00');

    // Floating label should still be intact
    await expect(floatingContainer).toBeVisible();
    await expect(label).toBeVisible();
    await expect(label).toHaveText('Price');

    // Destroy
    await page.evaluate((testId) => {
      window.__ts?.requireCoreByTestId(testId).destroy();
    }, 'group-floating');

    // Verify destroyed
    expect(await apiHelpers.isTouchSpinInitialized(page, 'group-floating')).toBe(false);

    // Floating label structure should STILL be intact
    await expect(floatingContainer).toBeVisible();
    await expect(label).toBeVisible();
    await expect(label).toHaveText('Price');

    // Prefix/postfix should STILL be visible (they're user elements from fixture)
    // The fixture has <span class="input-group-text">$</span> and <span class="input-group-text">.00</span>
    // TouchSpin duplicated them, destroy removed duplicates, originals remain
    // eslint-disable-next-line playwright/no-page-locator
    const inputGroupWrapper = page.locator('.input-group').first();
    await expect(inputGroupWrapper.locator('.input-group-text').first()).toHaveText('$');
    await expect(inputGroupWrapper.locator('.input-group-text').last()).toHaveText('.00');

    // Reinitialize (without specifying prefix/postfix - use existing ones)
    await initializeTouchspinFromGlobals(page, 'group-floating', {});

    // Verify reinitialized
    expect(await apiHelpers.isTouchSpinInitialized(page, 'group-floating')).toBe(true);

    // Original prefix/postfix from fixture should still be there
    await expect(inputGroupWrapper.locator('.input-group-text').first()).toHaveText('$');
    await expect(inputGroupWrapper.locator('.input-group-text').last()).toHaveText('.00');

    // Floating label should STILL be intact
    await expect(floatingContainer).toBeVisible();
    await expect(label).toBeVisible();
    await expect(label).toHaveText('Price');
  });

  test('multiple floating label inputs preserve structure independently', async ({ page }) => {
    // Initialize all three multi inputs
    await initializeTouchspinFromGlobals(page, 'multi-1', {});
    await initializeTouchspinFromGlobals(page, 'multi-2', {});
    await initializeTouchspinFromGlobals(page, 'multi-3', {});

    // Verify all initialized
    expect(await apiHelpers.isTouchSpinInitialized(page, 'multi-1')).toBe(true);
    expect(await apiHelpers.isTouchSpinInitialized(page, 'multi-2')).toBe(true);
    expect(await apiHelpers.isTouchSpinInitialized(page, 'multi-3')).toBe(true);

    // Destroy only the middle one
    await page.evaluate((testId) => {
      window.__ts?.requireCoreByTestId(testId).destroy();
    }, 'multi-2');

    // Verify only multi-2 is destroyed
    expect(await apiHelpers.isTouchSpinInitialized(page, 'multi-1')).toBe(true);
    expect(await apiHelpers.isTouchSpinInitialized(page, 'multi-2')).toBe(false);
    expect(await apiHelpers.isTouchSpinInitialized(page, 'multi-3')).toBe(true);

    // Verify all labels still intact
    // eslint-disable-next-line playwright/no-page-locator
    const label1 = page.locator('.form-floating label[for="multi-1"]');
    // eslint-disable-next-line playwright/no-page-locator
    const label2 = page.locator('.form-floating label[for="multi-2"]');
    // eslint-disable-next-line playwright/no-page-locator
    const label3 = page.locator('.form-floating label[for="multi-3"]');

    await expect(label1).toHaveText('Quantity');
    await expect(label2).toHaveText('Rate');
    await expect(label3).toHaveText('Total');

    // Reinitialize multi-2
    await initializeTouchspinFromGlobals(page, 'multi-2', {});

    // Verify all initialized again
    expect(await apiHelpers.isTouchSpinInitialized(page, 'multi-1')).toBe(true);
    expect(await apiHelpers.isTouchSpinInitialized(page, 'multi-2')).toBe(true);
    expect(await apiHelpers.isTouchSpinInitialized(page, 'multi-3')).toBe(true);

    // Verify all labels STILL intact
    await expect(label1).toHaveText('Quantity');
    await expect(label2).toHaveText('Rate');
    await expect(label3).toHaveText('Total');
  });

  test('floating label functionality persists after destroy/reinit', async ({ page }) => {
    // Initialize
    await initializeTouchspinFromGlobals(page, 'basic-floating', {
      step: 5,
      initval: 50,
    });

    // Test functionality
    await apiHelpers.incrementViaAPI(page, 'basic-floating');
    await apiHelpers.expectValueToBe(page, 'basic-floating', '55');

    // Destroy
    await page.evaluate((testId) => {
      window.__ts?.requireCoreByTestId(testId).destroy();
    }, 'basic-floating');

    // Reinitialize with different settings (use valid values within constraints)
    await initializeTouchspinFromGlobals(page, 'basic-floating', {
      step: 10,
      initval: 70,
    });

    // Test functionality with new settings
    await apiHelpers.incrementViaAPI(page, 'basic-floating');
    await apiHelpers.expectValueToBe(page, 'basic-floating', '80');

    await apiHelpers.clickUpButton(page, 'basic-floating');
    await apiHelpers.expectValueToBe(page, 'basic-floating', '90');

    // Verify floating label still works
    // eslint-disable-next-line playwright/no-page-locator
    const label = page.locator('.form-floating label[for="basic-floating"]');
    await expect(label).toBeVisible();
    await expect(label).toHaveText('Amount');
  });
});
