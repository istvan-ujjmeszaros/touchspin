/**
 * Feature: Core helpers installation (sample spec)
 * Background: fixture = /packages/core/tests/__shared__/fixtures/test-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] installs DOM helpers
 */

import { test } from '@playwright/test';
import { installDomHelpers } from '../__shared__/helpers/runtime/installDomHelpers';
import { initializeTouchspinWithVanilla } from '../__shared__/helpers/core/initialization';
import { expectValueToBe } from '../__shared__/helpers/assertions/values';

 /**
  * Scenario: installs DOM helpers
  * Given the fixture page is loaded
  * When DOM helpers are installed
  * Then TouchSpin can be initialized without errors
  */
test('installs DOM helpers', async ({ page }) => {
  const testFixtureUrl = '/packages/core/tests/__shared__/fixtures/test-fixture.html';
  await page.goto(testFixtureUrl);
  await installDomHelpers(page);
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 1, initval: '0' });
  await expectValueToBe(page, 'test-input', '0'); // sanity that helpers didn't break anything
});