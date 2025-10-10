/**
 * Feature: Bootstrap 5 renderer floating labels edge cases
 * Background: Tests for malformed floating label structures
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] handles floating container without label (falls back to regular rendering)
 * [x] handles label outside floating container (falls back to regular rendering)
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { installDomHelpers } from '@touchspin/core/test-helpers';

const EDGE_CASES_FIXTURE =
  '/packages/renderers/bootstrap5/tests/fixtures/floating-labels-edge-cases.html';

/**
 * Scenario: handles floating container without label (falls back to regular rendering)
 * Given a .form-floating container with an input but no label
 * When TouchSpin initializes
 * Then regular input-group rendering is used (not floating label mode)
 * And the DOM structure uses regular Bootstrap (buttons wrap input directly)
 */
test('handles floating container without label (falls back to regular rendering)', async ({
  page,
}) => {
  await page.goto(EDGE_CASES_FIXTURE);
  await apiHelpers.startCoverage(page);
  await installDomHelpers(page);

  // Verify wrapper uses REGULAR rendering (not floating label mode)
  const wrapper = page.getByTestId('no-label-wrapper');
  await expect(wrapper).toHaveClass(/input-group/);
  await expect(wrapper).toHaveClass(/bootstrap-touchspin/);

  // Verify structure is REGULAR (buttons directly with input, no .form-floating in wrapper)
  const wrapperChildren = await wrapper.locator('> *').all();

  // Regular structure: down button, input, up button (no .form-floating)
  expect(wrapperChildren.length).toBe(3);
  await expect(wrapperChildren[0]).toHaveAttribute('data-touchspin-injected', 'down');
  await expect(wrapperChildren[1]).toHaveAttribute('data-testid', 'no-label');
  await expect(wrapperChildren[2]).toHaveAttribute('data-touchspin-injected', 'up');

  // Verify the original .form-floating is NOT inside the wrapper
  const formFloatingInWrapper = wrapper.locator('.form-floating');
  await expect(formFloatingInWrapper).toHaveCount(0);

  // Verify input was successfully extracted from malformed .form-floating
  const input = page.getByTestId('no-label');
  const inputParent = input.locator('..');
  await expect(inputParent).toHaveClass(/input-group/); // Parent is wrapper, not .form-floating

  // Verify buttons work correctly despite malformed markup
  await expect(page.getByTestId('no-label')).toHaveValue('50');
  await page.getByTestId('no-label-up').click();
  await expect(page.getByTestId('no-label')).toHaveValue('51');

  await apiHelpers.collectCoverage(page, 'floating-no-label');
});

/**
 * Scenario: handles label outside floating container (falls back to regular rendering)
 * Given a .form-floating with input inside but label outside
 * When TouchSpin initializes
 * Then regular rendering is used (guard blocks floating mode)
 * And buttons function correctly
 */
test('handles label outside floating container (falls back to regular rendering)', async ({
  page,
}) => {
  await page.goto(EDGE_CASES_FIXTURE);
  await apiHelpers.startCoverage(page);
  await installDomHelpers(page);

  // Verify wrapper uses REGULAR rendering (input extracted from .form-floating)
  const wrapper = page.getByTestId('label-outside-wrapper');
  await expect(wrapper).toBeVisible();

  // Verify structure is REGULAR (no .form-floating in wrapper)
  const formFloatingInWrapper = wrapper.locator('.form-floating');
  await expect(formFloatingInWrapper).toHaveCount(0);

  // Verify input was extracted from .form-floating
  const input = page.getByTestId('label-outside');
  const inputParent = input.locator('..');
  await expect(inputParent).toHaveClass(/input-group/); // Parent is wrapper, not .form-floating

  // Verify buttons work
  await expect(page.getByTestId('label-outside')).toHaveValue('75');
  await page.getByTestId('label-outside-down').click();
  await expect(page.getByTestId('label-outside')).toHaveValue('74');

  await apiHelpers.collectCoverage(page, 'floating-label-outside');
});
