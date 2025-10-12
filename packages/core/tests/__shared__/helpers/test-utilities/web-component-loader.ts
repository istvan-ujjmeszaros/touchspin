import type { Page } from '@playwright/test';

/**
 * When I load the web component with bundled dependencies
 * Given I need TouchSpin web component with all dependencies resolved
 * @note Assumes fixture already has static import map configured
 */
export async function loadWebComponentWithDependencies(page: Page, debug = false): Promise<void> {
  if (debug) console.log('Loading web component with dependencies...');

  await page.evaluate(async (debug) => {
    try {
      // Simply import the web component - fixture should have static import map
      await import('@touchspin/web-component');

      if (debug) console.log('Web component loaded and registered successfully');
    } catch (err) {
      console.error('Failed to load web component with dependencies:', err);
      throw err;
    }
  }, debug);

  // Final verification
  await page.waitForFunction(() => customElements.get('touchspin-input') !== undefined, {
    timeout: 5000,
  });
}

/**
 * When I initialize a web component test environment
 * Given I need a complete web component testing setup
 * @note Simplified initialization for web component tests
 */
export async function initializeWebComponentTest(page: Page, debug = false): Promise<void> {
  // Load the fixture page
  await page.goto('/packages/web-component/tests/fixtures/web-component-fixture.html');

  // Install DOM helpers
  await page.evaluate(() => {
    if (!window.__ts) {
      window.__ts = {
        byId: (id: string) => document.querySelector(`[data-testid="${id}"]`),
        require: (id: string) => {
          const el = document.querySelector(`[data-testid="${id}"]`);
          if (!el) throw new Error(`Element not found: ${id}`);
          return el;
        },
        requireCoreByTestId: (id: string) => {
          const input = document.querySelector(`[data-testid="${id}"]`) as any;
          if (!input?._touchSpinCore) throw new Error(`TouchSpin not initialized on: ${id}`);
          return input._touchSpinCore;
        },
      };
    }
  });

  // Load web component with dependencies
  await loadWebComponentWithDependencies(page, debug);

  // Set up event logging
  await page.evaluate(() => {
    if (!window.__eventLog) {
      window.__eventLog = [];

      // Capture TouchSpin events
      document.addEventListener(
        'touchspin-change',
        (e) => {
          window.__eventLog.push({
            type: 'touchspin',
            event: 'change',
            target: (e.target as any)?.dataset?.testid,
            value: (e as CustomEvent).detail?.value,
          });
        },
        true
      );

      // Capture native events
      document.addEventListener(
        'change',
        (e) => {
          const target = e.target as HTMLInputElement;
          if (target.tagName === 'INPUT') {
            window.__eventLog.push({
              type: 'native',
              event: 'change',
              target: target.dataset?.testid,
              value: target.value,
            });
          }
        },
        true
      );
    }
  });

  if (debug) console.log('Web component test environment initialized');
}
