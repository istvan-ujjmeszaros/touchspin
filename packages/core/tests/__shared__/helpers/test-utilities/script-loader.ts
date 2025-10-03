import type { Page } from '@playwright/test';

/**
 * Shared script loading utilities for consistent test initialization
 */

export interface ScriptLoadOptions {
  /** Timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Cross-origin attribute */
  crossOrigin?: string;
  /** Additional attributes to set on script element */
  attributes?: Record<string, string>;
}

/**
 * When I load script from "{url}"
 * Given I need to load a script from a URL
 * @note Handles both absolute URLs and relative paths with proper error handling
 */
export async function loadScript(
  page: Page,
  url: string,
  options: ScriptLoadOptions = {}
): Promise<void> {
  const { timeout = 10000, crossOrigin, attributes = {} } = options;

  await page.evaluate(
    async ({ url, timeout, crossOrigin, attributes }) => {
      return new Promise<void>((resolve, reject) => {
        // Check if already loaded
        const existingScript = document.querySelector(`script[src="${url}"]`);
        if (existingScript) {
          console.log(`Script already loaded: ${url}`);
          resolve();
          return;
        }

        console.log(`Loading script: ${url}`);
        const script = document.createElement('script');
        script.src = url;

        if (crossOrigin) {
          script.crossOrigin = crossOrigin;
        }

        // Set additional attributes
        Object.entries(attributes).forEach(([key, value]) => {
          script.setAttribute(key, value);
        });

        script.onload = () => {
          console.log(`Script loaded successfully: ${url}`);
          resolve();
        };

        script.onerror = (err) => {
          console.error(`Script load error: ${url}`, err);
          reject(new Error(`Failed to load script: ${url}`));
        };

        // Set timeout
        const timeoutId = setTimeout(() => {
          reject(new Error(`Script load timeout: ${url} (${timeout}ms)`));
        }, timeout);

        script.onload = ((originalOnload) => () => {
          clearTimeout(timeoutId);
          if (originalOnload) originalOnload();
        })(script.onload);

        script.onerror = ((originalOnerror) => (err) => {
          clearTimeout(timeoutId);
          if (originalOnerror) originalOnerror(err);
        })(script.onerror);

        document.head.appendChild(script);
      });
    },
    { url, timeout, crossOrigin, attributes }
  );
}

/**
 * When I load TouchSpin web component
 * Given I need the web component available
 * @note Loads from local dist and waits for custom element registration
 */
export async function loadTouchSpinWebComponent(
  page: Page,
  options: ScriptLoadOptions = {}
): Promise<void> {
  const baseUrl = await page.evaluate(() => window.location.origin);
  const url = `${baseUrl}/packages/web-component/dist/index.js`;

  // Load script
  await loadScript(page, url, {
    timeout: 10000,
    ...options,
  });

  // Wait for custom element to be fully registered
  await page.waitForFunction(
    () => {
      return customElements.get('touchspin-input') !== undefined;
    },
    { timeout: 5000 }
  );
}

/**
 * When I load TouchSpin jQuery plugin
 * Given I need the jQuery plugin available
 * @note Loads the IIFE build with Bootstrap5 renderer and verifies jQuery plugin registered
 */
export async function loadTouchSpinJQueryPlugin(
  page: Page,
  options: ScriptLoadOptions = {}
): Promise<void> {
  const baseUrl = await page.evaluate(() => window.location.origin);
  const url = `${baseUrl}/packages/jquery-plugin/dist/jquery-touchspin-bs5.js`;

  await loadScript(page, url, {
    timeout: 10000,
    ...options,
  });

  // Verify jQuery plugin is registered
  await page.waitForFunction(
    () => {
      return (
        typeof window.jQuery !== 'undefined' &&
        window.jQuery.fn &&
        typeof window.jQuery.fn.TouchSpin === 'function'
      );
    },
    { timeout: 5000 }
  );
}

/**
 * When I load renderer module from "{rendererUrl}"
 * Given I need a specific renderer available
 * @note For dynamic import-based renderer loading
 */
export async function preloadRendererModule(page: Page, rendererUrl: string): Promise<void> {
  const baseUrl = await page.evaluate(() => window.location.origin);
  const fullUrl = new URL(rendererUrl, baseUrl).href;

  // Pre-fetch to verify the module exists
  await page.evaluate(async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Renderer module not found: ${url} (${response.status})`);
      }
    } catch (err) {
      throw new Error(`Failed to fetch renderer module: ${url} - ${err}`);
    }
  }, fullUrl);
}
