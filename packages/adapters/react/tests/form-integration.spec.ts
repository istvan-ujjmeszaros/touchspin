/**
 * Feature: TouchSpin React Adapter - Form Integration
 * Background: fixture = /packages/adapters/react/tests/fixtures/react-bootstrap5-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] component with name attribute integrates with form
 * [x] form submission includes TouchSpin value
 * [x] hidden input gets correct value for form data
 * [x] value updates are reflected in form data
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import * as reactHelpers from './helpers/react-helpers.js';

test.describe('TouchSpin React - Form Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/adapters/react/tests/fixtures/react-bootstrap5-fixture.html');

    // Wait for React to mount
    await apiHelpers.waitForTouchspinInitialized(page, 'form-input-input', 5000);
  });

  /**
   * Scenario: component with name attribute integrates with form
   * Given a TouchSpin component with name="quantity"
   * When the component is rendered inside a form
   * Then the input has the correct name attribute
   */
  test('component with name attribute integrates with form', async ({ page }) => {
    // Given: Form with TouchSpin component
    const { input: formInput } = await apiHelpers.getTouchSpinElements(page, 'form-input-input');

    // Then: Input has name attribute
    await expect(formInput).toHaveAttribute('name', 'quantity');
  });

  /**
   * Scenario: form submission includes TouchSpin value
   * Given a form containing TouchSpin component with name="quantity"
   * When the form is submitted
   * Then form data includes quantity value
   */
  test('form submission includes TouchSpin value', async ({ page }) => {
    // Given: Form with TouchSpin at value 10
    const { input: formInput } = await apiHelpers.getTouchSpinElements(page, 'form-input-input');
    await expect(formInput).toHaveValue('10');

    // When: Submit form
    const submitBtn = await page.getByTestId('submit-btn');
    await submitBtn.click();

    // Then: Form data captured includes quantity
    const formData = await page.evaluate(() => (window as any).lastFormData);
    expect(formData).toHaveProperty('quantity');
    expect(formData.quantity).toBe('10');
  });

  /**
   * Scenario: hidden input gets correct value for form data
   * Given a TouchSpin component with name attribute
   * When the component renders
   * Then a hidden input with name_display is created
   */
  test('hidden input gets correct value for form data', async ({ page }) => {
    // Given: Form with TouchSpin component
    const { input: formInput } = await apiHelpers.getTouchSpinElements(page, 'form-input-input');
    await expect(formInput).toHaveValue('10');

    // Then: Hidden input exists with correct name
    const reactElements = await reactHelpers.getReactTouchSpinElements(page, 'form-input-input');
    const hiddenInput = await reactElements.getHiddenInput('quantity');
    await expect(hiddenInput).toHaveAttribute('type', 'hidden');
    await expect(hiddenInput).toHaveValue('10');
  });

  /**
   * Scenario: value updates are reflected in form data
   * Given a form with TouchSpin component
   * When the value is changed via button click
   * Then the form data reflects the updated value
   */
  test('value updates are reflected in form data', async ({ page }) => {
    // Given: Form with TouchSpin at value 10
    const { input: formInput } = await apiHelpers.getTouchSpinElements(page, 'form-input-input');
    await expect(formInput).toHaveValue('10');

    // When: Increment value to 11
    await apiHelpers.clickUpButton(page, 'form-input-input');
    await expect(formInput).toHaveValue('11');

    // Then: Submit form and verify updated value
    const submitBtn = await page.getByTestId('submit-btn');
    await submitBtn.click();

    const formData = await page.evaluate(() => (window as any).lastFormData);
    expect(formData.quantity).toBe('11');
  });
});
