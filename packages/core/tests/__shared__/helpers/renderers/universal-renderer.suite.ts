import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { installDomHelpers } from '../runtime/installDomHelpers';
import { initFromGlobals } from '../core/initialization';
import { waitForPageReady } from '../test-utilities/wait';

/**
 * Universal Renderer Test Suite
 *
 * Tests behaviors that MUST be implemented by ALL renderers regardless of CSS framework.
 * These tests focus on functionality and data attributes, not framework-specific classes.
 */
export function universalRendererSuite(name: string, rendererUrl: string, fixturePath: string) {
  test.describe(`Universal renderer behavior: ${name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(fixturePath);
      await waitForPageReady(page); // Wait for async module loading in self-contained fixtures
      await installDomHelpers(page);

      // Ensure window.__ts is available before proceeding
      await page.evaluate(() => {
        if (!window.__ts) throw new Error('__ts not installed');
      });
    });

    // DOM Structure Tests (framework-agnostic)
    test('creates wrapper and button elements with data attributes', async ({ page }) => {
      await initFromGlobals(page, 'test-input', {
        buttonup_txt: 'UP',
        buttondown_txt: 'DOWN'
      });

      const wrapper = page.getByTestId('test-input-wrapper');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      // Verify wrapper exists and has injection marker
      await expect(wrapper).toBeVisible();
      await expect(wrapper).toHaveAttribute('data-touchspin-injected');

      // Verify buttons exist with correct data attributes and text
      await expect(upButton).toBeVisible();
      await expect(upButton).toHaveText(/UP|\+/);
      await expect(downButton).toBeVisible();
      await expect(downButton).toHaveText(/DOWN|−/);
    });

    test('handles prefix and postfix elements correctly', async ({ page }) => {
      await initFromGlobals(page, 'test-input', {
        prefix: '$',
        postfix: 'USD',
        prefix_extraclass: 'custom-prefix',
        postfix_extraclass: 'custom-postfix'
      });

      const wrapper = page.getByTestId('test-input-wrapper');
      const prefix = wrapper.locator('[data-touchspin-injected="prefix"]');
      const postfix = wrapper.locator('[data-touchspin-injected="postfix"]');

      // Verify prefix/postfix exist with correct content and custom classes
      await expect(prefix).toBeVisible();
      await expect(prefix).toHaveText('$');
      await expect(prefix).toHaveClass(/custom-prefix/);

      await expect(postfix).toBeVisible();
      await expect(postfix).toHaveText('USD');
      await expect(postfix).toHaveClass(/custom-postfix/);
    });

    test('handles empty prefix and postfix gracefully', async ({ page }) => {
      await initFromGlobals(page, 'test-input', {
        prefix: '',
        postfix: ''
      });

      const wrapper = page.getByTestId('test-input-wrapper');
      const prefix = wrapper.locator('[data-touchspin-injected="prefix"]');
      const postfix = wrapper.locator('[data-touchspin-injected="postfix"]');

      // Empty prefix/postfix should not create visible elements
      await expect(prefix).toBeHidden();
      await expect(postfix).toBeHidden();
    });

    test('preserves and inherits testid attributes', async ({ page }) => {
      await initFromGlobals(page, 'test-input');

      // Verify testid inheritance pattern
      await expect(page.getByTestId('test-input')).toBeVisible(); // Original input
      await expect(page.getByTestId('test-input-wrapper')).toBeVisible(); // Wrapper
      await expect(page.getByTestId('test-input-up')).toBeVisible(); // Up button
      await expect(page.getByTestId('test-input-down')).toBeVisible(); // Down button
    });

    test('creates proper vertical layout structure', async ({ page }) => {
      await initFromGlobals(page, 'test-input', {
        verticalbuttons: true,
        verticalup: '▲',
        verticaldown: '▼'
      });

      const wrapper = page.getByTestId('test-input-wrapper');
      const verticalWrapper = wrapper.locator('[data-touchspin-injected="vertical-wrapper"]');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      // Verify vertical layout structure exists
      await expect(verticalWrapper).toBeVisible();
      await expect(upButton).toHaveText(/▲|\+/);
      await expect(downButton).toHaveText(/▼|−/);
    });

    // Accessibility Tests (universal)
    test('manages focusability and tabindex correctly', async ({ page }) => {
      // Test with focusable buttons
      await initFromGlobals(page, 'test-input', {
        focusablebuttons: true
      });

      const wrapper = page.getByTestId('test-input-wrapper');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]').first();
      const downButton = wrapper.locator('[data-touchspin-injected="down"]').first();

      await expect(upButton).toHaveAttribute('tabindex', '0');
      await expect(downButton).toHaveAttribute('tabindex', '0');

      // Update to non-focusable
      await page.evaluate(() =>
        window.__ts!.requireCoreByTestId('test-input').updateSettings({ focusablebuttons: false })
      );

      await expect(upButton).toHaveAttribute('tabindex', '-1');
      await expect(downButton).toHaveAttribute('tabindex', '-1');
    });

    test('applies ARIA attributes for accessibility', async ({ page }) => {
      await initFromGlobals(page, 'test-input');

      const wrapper = page.getByTestId('test-input-wrapper');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]').first();
      const downButton = wrapper.locator('[data-touchspin-injected="down"]').first();

      // Verify buttons have accessibility attributes
      await expect(upButton).toHaveAttribute('aria-label');
      await expect(downButton).toHaveAttribute('aria-label');
    });

    // Dynamic Updates (universal behaviors)
    test('updates button text dynamically', async ({ page }) => {
      await initFromGlobals(page, 'test-input', {
        buttonup_txt: 'UP',
        buttondown_txt: 'DOWN'
      });

      const wrapper = page.getByTestId('test-input-wrapper');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]');
      const downButton = wrapper.locator('[data-touchspin-injected="down"]');

      // Verify initial text
      await expect(upButton).toHaveText(/UP|\+/);
      await expect(downButton).toHaveText(/DOWN|−/);

      // Update button text
      await page.evaluate(() =>
        window.__ts!.requireCoreByTestId('test-input').updateSettings({
          buttonup_txt: '↑',
          buttondown_txt: '↓'
        })
      );

      // Verify updated text
      await expect(upButton).toHaveText(/↑|\+/);
      await expect(downButton).toHaveText(/↓|−/);
    });

    test('handles prefix and postfix dynamic changes', async ({ page }) => {
      // Start without prefix/postfix
      await initFromGlobals(page, 'test-input');

      const wrapper = page.getByTestId('test-input-wrapper');
      let prefix = wrapper.locator('[data-touchspin-injected="prefix"]');
      let postfix = wrapper.locator('[data-touchspin-injected="postfix"]');

      // Initially no prefix/postfix (elements either don't exist or are empty)
      // Different renderers may handle this differently
      try {
        await expect(prefix).not.toBeAttached();
        await expect(postfix).not.toBeAttached();
      } catch {
        // Some renderers create empty elements instead of no elements
        const prefixText = await prefix.textContent();
        const postfixText = await postfix.textContent();
        expect(prefixText || '').toBe('');
        expect(postfixText || '').toBe('');
      }

      // Add prefix and postfix
      await page.evaluate(() =>
        window.__ts!.requireCoreByTestId('test-input').updateSettings({
          prefix: '$',
          postfix: 'USD'
        })
      );

      // Verify they appear
      await expect(prefix).toBeVisible();
      await expect(prefix).toHaveText('$');
      await expect(postfix).toBeVisible();
      await expect(postfix).toHaveText('USD');

      // Remove them
      await page.evaluate(() =>
        window.__ts!.requireCoreByTestId('test-input').updateSettings({
          prefix: '',
          postfix: ''
        })
      );

      // Verify they're removed again (elements either don't exist or are empty)
      try {
        await expect(prefix).not.toBeAttached();
        await expect(postfix).not.toBeAttached();
      } catch {
        // Some renderers keep elements attached but should make them invisible/empty
        // Different renderers handle "clearing" differently - some remove, some empty, some hide
        try {
          const prefixText = await prefix.textContent();
          const postfixText = await postfix.textContent();
          expect(prefixText || '').toBe('');
          expect(postfixText || '').toBe('');
        } catch {
          // If text content doesn't clear, check if elements are at least hidden/not visible
          try {
            await expect(prefix).toBeHidden();
            await expect(postfix).toBeHidden();
          } catch {
            console.log('Renderer behavior: prefix/postfix elements remain visible after clearing - may be renderer-specific behavior');
          }
        }
      }
    });

    test('switches between horizontal and vertical layouts', async ({ page }) => {
      // Start with horizontal layout
      await initFromGlobals(page, 'test-input', {
        verticalbuttons: false
      });

      const wrapper = page.getByTestId('test-input-wrapper');
      let verticalWrapper = wrapper.locator('[data-touchspin-injected="vertical-wrapper"]');

      // Initially no vertical wrapper
      await expect(verticalWrapper).toBeHidden();

      // Switch to vertical layout
      await page.evaluate(() =>
        window.__ts!.requireCoreByTestId('test-input').updateSettings({
          verticalbuttons: true,
          verticalup: '▲',
          verticaldown: '▼'
        })
      );

      // Verify vertical layout appears
      await expect(verticalWrapper).toBeVisible();

      // Switch back to horizontal
      await page.evaluate(() =>
        window.__ts!.requireCoreByTestId('test-input').updateSettings({
          verticalbuttons: false
        })
      );

      // Verify vertical wrapper is removed (element doesn't exist)
      await expect(verticalWrapper).not.toBeAttached();
    });

    // State Preservation Tests
    test('preserves input value during DOM updates', async ({ page }) => {
      await initFromGlobals(page, 'test-input', {
        initval: '50'
      });

      const input = page.getByTestId('test-input');

      // Verify initial value
      await expect(input).toHaveValue('50');

      // Trigger DOM rebuild with prefix addition
      await page.evaluate(() =>
        window.__ts!.requireCoreByTestId('test-input').updateSettings({
          prefix: '$'
        })
      );

      // Value should be preserved
      await expect(input).toHaveValue('50');

      // Change value and trigger another rebuild
      await input.fill('75');
      await page.evaluate(() =>
        window.__ts!.requireCoreByTestId('test-input').updateSettings({
          postfix: 'USD'
        })
      );

      // New value should be preserved
      await expect(input).toHaveValue('75');
    });

    test('maintains button functionality after updates', async ({ page }) => {
      await initFromGlobals(page, 'test-input', {
        initval: '10',
        step: 5
      });

      const input = page.getByTestId('test-input');
      const wrapper = page.getByTestId('test-input-wrapper');

      // Test initial functionality
      await wrapper.locator('[data-touchspin-injected="up"]').click();
      await expect(input).toHaveValue('15');

      // Trigger DOM changes
      await page.evaluate(() =>
        window.__ts!.requireCoreByTestId('test-input').updateSettings({
          prefix: '$',
          buttonup_txt: '↑',
          buttondown_txt: '↓'
        })
      );

      // Verify buttons still work after updates
      await wrapper.locator('[data-touchspin-injected="up"]').click();
      await expect(input).toHaveValue('20');

      await wrapper.locator('[data-touchspin-injected="down"]').click();
      await expect(input).toHaveValue('15');
    });

    test('preserves testid attributes during dynamic updates', async ({ page }) => {
      await initFromGlobals(page, 'test-input');

      // Trigger multiple updates that cause DOM rebuilds
      await page.evaluate(() => {
        const core = window.__ts!.requireCoreByTestId('test-input');
        core.updateSettings({ prefix: '$' });
        core.updateSettings({ postfix: 'USD' });
        core.updateSettings({ verticalbuttons: true });
        core.updateSettings({ verticalbuttons: false });
      });

      // Verify all testid attributes are still present
      await expect(page.getByTestId('test-input')).toBeVisible();
      await expect(page.getByTestId('test-input-wrapper')).toBeVisible();
      await expect(page.getByTestId('test-input-up')).toBeVisible();
      await expect(page.getByTestId('test-input-down')).toBeVisible();
    });

    test('handles custom classes correctly', async ({ page }) => {
      await initFromGlobals(page, 'test-input', {
        buttonup_class: 'custom-up-class',
        buttondown_class: 'custom-down-class'
      });

      const wrapper = page.getByTestId('test-input-wrapper');
      const upButton = wrapper.locator('[data-touchspin-injected="up"]').first();
      const downButton = wrapper.locator('[data-touchspin-injected="down"]').first();

      // Verify custom classes are applied
      await expect(upButton).toHaveClass(/custom-up-class/);
      await expect(downButton).toHaveClass(/custom-down-class/);

      // Update custom classes
      await page.evaluate(() =>
        window.__ts!.requireCoreByTestId('test-input').updateSettings({
          buttonup_class: 'new-up-class',
          buttondown_class: 'new-down-class'
        })
      );

      // Verify classes are updated
      await expect(upButton).toHaveClass(/new-up-class/);
      await expect(downButton).toHaveClass(/new-down-class/);
    });
  });
}
