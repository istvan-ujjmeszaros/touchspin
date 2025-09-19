import { test } from '@playwright/test';
import * as touchspinHelpers from './helpers/touchspinApiHelpers';

test.beforeEach(async ({ page }, testInfo) => {
  await touchspinHelpers.startCoverage(page);
});

test.afterEach(async ({ page }, testInfo) => {
  await touchspinHelpers.collectCoverage(page, testInfo.title);
});
