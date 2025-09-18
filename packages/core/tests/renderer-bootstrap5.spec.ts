import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../../__tests__/helpers/touchspinApiHelpers';

test.describe('Bootstrap5 Renderer Core Integration', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await page.waitForFunction(() => (window as any).coreTestReady === true);
    await touchspinHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'core-renderer-bootstrap5');
  });

  test.describe('Renderer UI Components', () => {
    test('creates wrapper with testid and data-touchspin-injected attributes', async ({ page }) => {
      // Initialize WITH renderer explicitly
      await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const { Bootstrap5Renderer } = await import('http://localhost:8866/packages/renderers/bootstrap5/dist/index.js');

        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        if (!input) {
          throw new Error('Input with testId "test-input" not found');
        }

        input.value = '10';
        const core = new TouchSpinCore(input, { step: 1, initval: 10, renderer: Bootstrap5Renderer });
        input._touchSpinCore = core;
        core.initDOMEventHandling();
      });

      // Wait for initialization to complete
      await page.waitForSelector('[data-testid="test-input"][data-touchspin-injected]', {
        timeout: 5000
      });

      // Assert wrapper exists with correct attributes
      const wrapper = await page.locator('[data-testid="test-input-wrapper"][data-touchspin-injected]');
      await expect(wrapper).toHaveCount(1);

      // Assert buttons exist with correct testids
      await expect(page.locator('[data-testid="test-input-up"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="test-input-down"]')).toHaveCount(1);
    });

    test('supports prefix and postfix elements', async ({ page }) => {
      await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const { Bootstrap5Renderer } = await import('http://localhost:8866/packages/renderers/bootstrap5/dist/index.js');

        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '25';
        const core = new TouchSpinCore(input, {
          step: 1,
          initval: 25,
          prefix: '$',
          postfix: '.00',
          renderer: Bootstrap5Renderer
        });
        input._touchSpinCore = core;
        core.initDOMEventHandling();
      });

      await page.waitForSelector('[data-testid="test-input"][data-touchspin-injected]', {
        timeout: 5000
      });

      // Assert prefix and postfix elements exist
      await expect(page.locator('[data-testid="test-input-prefix"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="test-input-postfix"]')).toHaveCount(1);

      // Assert they have correct content
      await expect(page.locator('[data-testid="test-input-prefix"]')).toHaveText('$');
      await expect(page.locator('[data-testid="test-input-postfix"]')).toHaveText('.00');
    });

    test('supports vertical buttons configuration', async ({ page }) => {
      await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const { Bootstrap5Renderer } = await import('http://localhost:8866/packages/renderers/bootstrap5/dist/index.js');

        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '15';
        const core = new TouchSpinCore(input, {
          step: 1,
          initval: 15,
          verticalbuttons: true,
          renderer: Bootstrap5Renderer
        });
        input._touchSpinCore = core;
        core.initDOMEventHandling();
      });

      await page.waitForSelector('[data-testid="test-input"][data-touchspin-injected]', {
        timeout: 5000
      });

      // Assert vertical wrapper exists
      const verticalWrapper = page.locator('[data-touchspin-injected="vertical-wrapper"]');
      await expect(verticalWrapper).toHaveCount(1);

      // Assert buttons are inside vertical wrapper
      const upButton = verticalWrapper.locator('[data-testid="test-input-up"]');
      const downButton = verticalWrapper.locator('[data-testid="test-input-down"]');
      await expect(upButton).toHaveCount(1);
      await expect(downButton).toHaveCount(1);
    });

    test('finalizeWrapperAttributes sets correct attributes', async ({ page }) => {
      await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const { Bootstrap5Renderer } = await import('http://localhost:8866/packages/renderers/bootstrap5/dist/index.js');

        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '5';
        const core = new TouchSpinCore(input, { step: 1, initval: 5, renderer: Bootstrap5Renderer });
        input._touchSpinCore = core;
        core.initDOMEventHandling();
      });

      await page.waitForSelector('[data-testid="test-input"][data-touchspin-injected]', {
        timeout: 5000
      });

      // Check wrapper has both testid and touchspin-injected attributes
      const wrapper = await page.evaluate(() => {
        const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
        return {
          hasTestId: wrapper?.hasAttribute('data-testid'),
          testIdValue: wrapper?.getAttribute('data-testid'),
          hasInjected: wrapper?.hasAttribute('data-touchspin-injected'),
          injectedValue: wrapper?.getAttribute('data-touchspin-injected')
        };
      });

      expect(wrapper.hasTestId).toBe(true);
      expect(wrapper.testIdValue).toBe('test-input-wrapper');
      expect(wrapper.hasInjected).toBe(true);
      expect(wrapper.injectedValue).toBeTruthy();
    });

    test('cleanup on destroy removes all injected elements', async ({ page }) => {
      // Initialize with renderer
      await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const { Bootstrap5Renderer } = await import('http://localhost:8866/packages/renderers/bootstrap5/dist/index.js');

        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '8';
        const core = new TouchSpinCore(input, {
          step: 1,
          initval: 8,
          prefix: 'Pre',
          postfix: 'Post',
          renderer: Bootstrap5Renderer
        });
        input._touchSpinCore = core;
        core.initDOMEventHandling();
      });

      await page.waitForSelector('[data-testid="test-input"][data-touchspin-injected]', {
        timeout: 5000
      });

      // Verify UI exists
      await expect(page.locator('[data-testid="test-input-wrapper"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="test-input-up"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="test-input-down"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="test-input-prefix"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="test-input-postfix"]')).toHaveCount(1);

      // Destroy
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        if (core) {
          core.destroy();
        }
      });

      // Verify all UI elements are removed
      await expect(page.locator('[data-testid="test-input-wrapper"]')).toHaveCount(0);
      await expect(page.locator('[data-testid="test-input-up"]')).toHaveCount(0);
      await expect(page.locator('[data-testid="test-input-down"]')).toHaveCount(0);
      await expect(page.locator('[data-testid="test-input-prefix"]')).toHaveCount(0);
      await expect(page.locator('[data-testid="test-input-postfix"]')).toHaveCount(0);

      // Verify input still exists and lost injected marker
      await expect(page.locator('[data-testid="test-input"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="test-input"][data-touchspin-injected]')).toHaveCount(0);
    });
  });
});

// NOTE: This test file focuses on Bootstrap5 renderer integration with Core,
// covering UI creation, configuration options, and cleanup behavior.
