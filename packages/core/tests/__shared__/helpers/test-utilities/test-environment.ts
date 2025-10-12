import type { Page } from '@playwright/test';
import { setupLogging } from '../events/setup';
import { installDomHelpers } from '../runtime/installDomHelpers';
import { loadScript } from './script-loader';

export interface TestEnvironmentOptions {
  webComponent?: boolean;
  renderer?: string;
  debug?: boolean;
}

/**
 * When I initialize the test environment with {options}
 * Given I need a fully configured test environment
 * @note Single entry point for all test initialization
 */
export async function initializeTestEnvironment(
  page: Page,
  options: TestEnvironmentOptions = {}
): Promise<void> {
  const { debug = false } = options;

  if (debug) {
    console.log('Initializing test environment with options:', options);
  }

  // Load core infrastructure
  await installDomHelpers(page);
  await setupLogging(page);

  // Verify core infrastructure
  await page.evaluate(() => {
    if (!window.__ts) throw new Error('Core helpers not installed');
  });

  // Load requested components in parallel where possible
  const loadPromises: Promise<void>[] = [];

  if (options.webComponent) {
    loadPromises.push(loadWebComponentEnvironment(page, debug));
  }

  if (options.renderer) {
    loadPromises.push(loadRendererEnvironment(page, options.renderer, debug));
  }

  // Wait for all components to load
  await Promise.all(loadPromises);

  if (debug) {
    console.log('Test environment initialization complete');
  }
}

/**
 * When I load the web component environment
 * Given I need the TouchSpin web component registered
 * @note Forces registration if conditional check fails
 */
export async function loadWebComponentEnvironment(page: Page, debug = false): Promise<void> {
  if (debug) console.log('Loading web component environment...');

  const url = await page.evaluate(() => {
    return `${window.location.origin}/packages/web-component/dist/index.js`;
  });

  // First, try loading the script normally
  try {
    await loadScript(page, url, { timeout: 5000 });
  } catch (err) {
    if (debug) console.log('Script load failed, trying import fallback:', err);
  }

  // Force registration if needed
  await page.evaluate(async (debug) => {
    if (!customElements.get('touchspin-input')) {
      if (debug) console.log('Custom element not registered, forcing registration...');

      try {
        // Try dynamic import
        const module = await import('/packages/web-component/dist/index.js');

        if (module.TouchSpinInput) {
          customElements.define('touchspin-input', module.TouchSpinInput);
          if (debug) console.log('Forced registration successful');
        } else if (module.default) {
          customElements.define('touchspin-input', module.default);
          if (debug) console.log('Forced registration with default export successful');
        } else {
          throw new Error('TouchSpinInput not found in module exports');
        }
      } catch (importErr) {
        // If import fails, the script might have auto-registered
        // Check one more time
        if (!customElements.get('touchspin-input')) {
          throw new Error(`Failed to register web component: ${importErr}`);
        }
      }
    } else {
      if (debug) console.log('Custom element already registered');
    }
  }, debug);

  // Wait for custom element to be fully defined
  await page.waitForFunction(() => customElements.get('touchspin-input') !== undefined, {
    timeout: 5000,
  });

  if (debug) console.log('Web component environment loaded');
}

/**
 * When I load a renderer environment
 * Given I need a specific renderer module available
 * @note Handles ES module imports for renderers
 */
export async function loadRendererEnvironment(
  page: Page,
  rendererPath: string,
  debug = false
): Promise<void> {
  if (debug) console.log(`Loading renderer environment: ${rendererPath}`);

  await page.evaluate(
    async ({ path, debug }) => {
      try {
        const origin = window.location.origin;
        const url = new URL(path, origin).href;

        if (debug) console.log(`Importing renderer from: ${url}`);

        const module = await import(url);

        if (!module.default && !Object.keys(module).length) {
          throw new Error(`Renderer module appears to be empty: ${path}`);
        }

        // Store reference for later use
        (window as any).__loadedRenderer = module.default || module;

        if (debug) console.log('Renderer loaded successfully');
      } catch (err) {
        throw new Error(`Failed to load renderer: ${err}`);
      }
    },
    { path: rendererPath, debug }
  );
}

/**
 * When I diagnose the test environment
 * Given I need to debug loading issues
 * @note Returns detailed diagnostics about loaded components
 */
export async function diagnoseEnvironment(page: Page): Promise<{
  hasJQuery: boolean;
  has$: boolean;
  hasTouchSpinPlugin: boolean;
  customElements: string[];
  scripts: string[];
  hasLoadedRenderer: boolean;
  errors: string[];
}> {
  return page.evaluate(() => {
    const errors: string[] = [];

    // Capture any errors that occurred
    if ((window as any).__loadingErrors) {
      errors.push(...(window as any).__loadingErrors);
    }

    return {
      hasJQuery: typeof window.jQuery !== 'undefined',
      has$: typeof window.$ !== 'undefined',
      hasTouchSpinPlugin: !!(window.jQuery?.fn?.TouchSpin || window.$?.fn?.TouchSpin),
      customElements: [], // Note: customElements doesn't have enumeration API
      scripts: Array.from(document.scripts)
        .map((s) => s.src)
        .filter((src) => src && !src.includes('playwright')),
      hasLoadedRenderer: !!(window as any).__loadedRenderer,
      errors,
    };
  });
}

/**
 * When I reset the test environment
 * Given I need to clean up between tests
 * @note Cleans up loaded components for test isolation
 */
export async function resetTestEnvironment(page: Page): Promise<void> {
  await page.evaluate(() => {
    // Clear jQuery plugin state
    if (window.touchSpinReady) {
      delete window.touchSpinReady;
    }

    // Clear loaded renderer
    if ((window as any).__loadedRenderer) {
      delete (window as any).__loadedRenderer;
    }

    // Clear any error tracking
    if ((window as any).__loadingErrors) {
      delete (window as any).__loadingErrors;
    }

    // Note: We don't unregister custom elements as they cannot be removed
    // This is a browser limitation
  });
}
