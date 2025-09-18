import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinApiHelpers';
import './coverage.hooks';


async function testAdvancedExisting(page: any, url: string, ids: { group: string, initBtn: string, destroyBtn: string, input?: string }) {
  await page.goto(url);

  // Init advanced
  await page.click(`#${ids.initBtn}`);

  const group = page.locator(`#${ids.group}`);
  await expect(group).toBeVisible();

  // There should be one up and one down controller
  await expect(group.locator('.bootstrap-touchspin-down')).toHaveCount(1);
  await expect(group.locator('.bootstrap-touchspin-up')).toHaveCount(1);

  // Expect the demo’s original € and g to be present within the group
  const addonTexts = await group.evaluate((el) => Array.from(el.querySelectorAll('.input-group-addon, .input-group-text')).map(n => (n.textContent||'').trim()).filter(Boolean));
  expect(addonTexts.join('|')).toContain('€');
  expect(addonTexts.join('|')).toContain('g');

  // Destroy
  await page.click(`#${ids.destroyBtn}`);

  // Controllers removed
  await expect(group.locator('.bootstrap-touchspin-down')).toHaveCount(0);
  await expect(group.locator('.bootstrap-touchspin-up')).toHaveCount(0);

  // No leftover empty wrappers we created (BS3 labelled wrappers)
  await expect(group.locator('[data-touchspin-injected="down-wrapper"], [data-touchspin-injected="up-wrapper"]')).toHaveCount(0);
  await expect(group.locator('[data-touchspin-injected]')).toHaveCount(0);

  // Original addons still present
  const afterTexts = await group.evaluate((el) => Array.from(el.querySelectorAll('.input-group-addon, .input-group-text')).map(n => (n.textContent||'').trim()).filter(Boolean));
  expect(afterTexts.join('|')).toContain('€');
  expect(afterTexts.join('|')).toContain('g');
}

test.describe('Advanced init on existing Bootstrap input-groups', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html'); // Update URL as needed
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'wrapperAdvancedExistingGroup');
  });

  test('BS3 advanced reuses addons and cleans up on destroy', async ({ page }) => {
    await testAdvancedExisting(page, '/__tests__/html-package/index-bs3-wrapper.html', {
      group: 'bs3-adv-group', initBtn: 'btn-adv-init', destroyBtn: 'btn-adv-destroy', input: 'bs3-adv-input'
    });
  });

  test('BS4 advanced reuses prepend/append and cleans up on destroy', async ({ page }) => {
    await testAdvancedExisting(page, '/__tests__/html-package/index-bs4-wrapper.html', {
      group: 'bs4-adv-group', initBtn: 'btn-adv-init', destroyBtn: 'btn-adv-destroy', input: 'bs4-adv-input'
    });
  });

  test('BS5 advanced reuses input-group-text and cleans up on destroy', async ({ page }) => {
    await testAdvancedExisting(page, '/__tests__/html-package/index-bs5-wrapper.html', {
      group: 'bs5-adv-group', initBtn: 'btn-adv-init', destroyBtn: 'btn-adv-destroy', input: 'bs5-adv-input'
    });
  });
});
