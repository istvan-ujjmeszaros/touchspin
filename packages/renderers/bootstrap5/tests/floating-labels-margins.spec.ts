/**
 * Feature: Bootstrap 5 renderer floating labels margin class handling
 * Background: Tests for margin class movement from .form-floating to wrapper
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] moves margin classes from .form-floating to wrapper on init
 * [x] restores margin classes to .form-floating on destroy
 * [x] handles margin classes with vertical buttons
 * [x] handles margin classes in advanced mode (input-group with prefix/postfix)
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { initializeTouchspinFromGlobals, installDomHelpers } from '@touchspin/core/test-helpers';
import { bootstrap5RendererUrl, ensureBootstrap5Globals } from './helpers/bootstrap5-globals';

// Alias for readability in renderer tests
const initializeTouchSpin = initializeTouchspinFromGlobals;

// Bootstrap 5 Renderer URL for tests
const BOOTSTRAP5_RENDERER_URL = bootstrap5RendererUrl;
const MARGINS_FIXTURE =
  '/packages/renderers/bootstrap5/tests/fixtures/floating-labels-margins.html';

/**
 * Scenario: moves margin classes from .form-floating to wrapper on init
 * Given a .form-floating with margin classes (mb-3, mt-2)
 * When TouchSpin initializes
 * Then margin classes are removed from .form-floating
 * And margin classes are added to the wrapper
 */
test('moves margin classes from .form-floating to wrapper on init', async ({ page }) => {
  await page.goto(MARGINS_FIXTURE);
  await ensureBootstrap5Globals(page);
  await installDomHelpers(page);
  await apiHelpers.startCoverage(page);

  // Before initialization - verify original structure
  const floatingContainer = page.locator('[data-testid="margin-basic"]').locator('..');
  await expect(floatingContainer).toHaveClass(/form-floating/);
  await expect(floatingContainer).toHaveClass(/mb-3/);
  await expect(floatingContainer).toHaveClass(/mt-2/);

  // Initialize TouchSpin
  await initializeTouchSpin(page, 'margin-basic', BOOTSTRAP5_RENDERER_URL);

  // After initialization - verify margins moved
  await expect(floatingContainer).not.toHaveClass(/mb-3/);
  await expect(floatingContainer).not.toHaveClass(/mt-2/);

  const wrapper = page.getByTestId('margin-basic-wrapper');
  await expect(wrapper).toHaveClass(/mb-3/);
  await expect(wrapper).toHaveClass(/mt-2/);

  await apiHelpers.collectCoverage(page, 'margin-basic-init');
});

/**
 * Scenario: restores margin classes to .form-floating on destroy
 * Given TouchSpin initialized with margin classes moved to wrapper
 * When destroy() is called
 * Then margin classes are restored to .form-floating
 * And wrapper is removed
 */
test('restores margin classes to .form-floating on destroy', async ({ page }) => {
  await page.goto(MARGINS_FIXTURE);
  await ensureBootstrap5Globals(page);
  await installDomHelpers(page);
  await apiHelpers.startCoverage(page);

  await initializeTouchSpin(page, 'margin-destroy', BOOTSTRAP5_RENDERER_URL);

  // Verify margins are on wrapper
  const wrapper = page.getByTestId('margin-destroy-wrapper');
  await expect(wrapper).toHaveClass(/mb-4/);

  // Destroy TouchSpin
  await apiHelpers.destroyCore(page, 'margin-destroy');

  // Verify wrapper is gone
  await expect(wrapper).not.toBeAttached();

  // Verify margins restored to .form-floating
  const floatingContainer = page.locator('[data-testid="margin-destroy"]').locator('..');
  await expect(floatingContainer).toHaveClass(/form-floating/);
  await expect(floatingContainer).toHaveClass(/mb-4/);

  await apiHelpers.collectCoverage(page, 'margin-destroy');
});

/**
 * Scenario: handles margin classes with vertical buttons
 * Given a .form-floating with margin classes and vertical buttons enabled
 * When TouchSpin initializes
 * Then margin classes are moved to wrapper correctly
 * And vertical button structure is correct
 */
test('handles margin classes with vertical buttons', async ({ page }) => {
  await page.goto(MARGINS_FIXTURE);
  await ensureBootstrap5Globals(page);
  await installDomHelpers(page);
  await apiHelpers.startCoverage(page);

  // Verify initial margin classes
  const floatingContainer = page.locator('[data-testid="margin-vertical"]').locator('..');
  await expect(floatingContainer).toHaveClass(/mb-3/);
  await expect(floatingContainer).toHaveClass(/mx-2/);

  await initializeTouchSpin(page, 'margin-vertical', BOOTSTRAP5_RENDERER_URL);

  // Verify margins moved to wrapper
  await expect(floatingContainer).not.toHaveClass(/mb-3/);
  await expect(floatingContainer).not.toHaveClass(/mx-2/);

  const wrapper = page.getByTestId('margin-vertical-wrapper');
  await expect(wrapper).toHaveClass(/mb-3/);
  await expect(wrapper).toHaveClass(/mx-2/);

  // Verify vertical button structure is correct
  const verticalWrapper = wrapper.locator('[data-touchspin-injected="vertical-wrapper"]');
  await expect(verticalWrapper).toBeVisible();

  await apiHelpers.collectCoverage(page, 'margin-vertical');
});

/**
 * Scenario: handles margin classes in advanced mode (input-group with prefix/postfix)
 * Given an input-group with .form-floating that has margin classes
 * When TouchSpin initializes
 * Then margin classes are moved to the existing input-group wrapper
 * And prefix/postfix are preserved
 */
test('handles margin classes in advanced mode (input-group with prefix/postfix)', async ({
  page,
}) => {
  await page.goto(MARGINS_FIXTURE);
  await ensureBootstrap5Globals(page);
  await installDomHelpers(page);
  await apiHelpers.startCoverage(page);

  // Verify initial structure
  const inputGroup = page.getByTestId('margin-advanced-wrapper');
  const floatingContainer = inputGroup.locator('.form-floating');
  await expect(floatingContainer).toHaveClass(/mb-3/);
  await expect(floatingContainer).toHaveClass(/mt-1/);

  await initializeTouchSpin(page, 'margin-advanced', BOOTSTRAP5_RENDERER_URL);

  // Verify margins moved from .form-floating to input-group
  await expect(floatingContainer).not.toHaveClass(/mb-3/);
  await expect(floatingContainer).not.toHaveClass(/mt-1/);

  await expect(inputGroup).toHaveClass(/mb-3/);
  await expect(inputGroup).toHaveClass(/mt-1/);

  // Verify prefix and postfix still present
  await expect(inputGroup.locator('.input-group-text').first()).toHaveText('$');
  await expect(inputGroup.locator('.input-group-text').last()).toHaveText('.00');

  await apiHelpers.collectCoverage(page, 'margin-advanced');
});
