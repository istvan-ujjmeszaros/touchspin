import { test } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.beforeEach(async ({ page }, testInfo) => {
  await touchspinHelpers.startCoverage(page);
});

test.afterEach(async ({ page }, testInfo) => {
  await touchspinHelpers.collectCoverage(page, testInfo.title);
});