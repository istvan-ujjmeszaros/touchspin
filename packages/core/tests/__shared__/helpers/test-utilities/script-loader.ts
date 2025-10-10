import type { Page } from '@playwright/test';
import { artifactUrlFor, rendererArtifactUrlFor } from '../runtime/paths';

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

export interface RendererGlobalsOptions extends ScriptLoadOptions {
  /** Production or development artifacts (default devdist) */
  target?: 'devdist' | 'dist';
  /** Override package path for renderer */
  rendererPackage?: string;
  /** Load core IIFE before renderer (default true) */
  loadCore?: boolean;
  /** Load renderer CSS from manifest (default true) */
  loadCss?: boolean;
  /** Manifest key for CSS (default "css") */
  cssKey?: string;
  /** Additional scripts to load */
  extraScripts?: string[];
  /** Additional stylesheets to load */
  extraStyles?: string[];
  /** Set window.testPageReady after load (default true) */
  markReady?: boolean;
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

export async function loadStylesheet(page: Page, url: string): Promise<void> {
  await page.evaluate(
    ({ url }) =>
      new Promise<void>((resolve, reject) => {
        const existingLink = document.querySelector(`link[data-touchspin-style="${url}"]`);
        if (existingLink) {
          resolve();
          return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.dataset.touchspinStyle = url;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load stylesheet: ${url}`));
        document.head.appendChild(link);
      }),
    { url }
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

async function fetchManifest<T extends Record<string, string | undefined>>(
  page: Page,
  packageSubPath: string,
  target: string
): Promise<T> {
  return page.evaluate(
    async ({ packageSubPath, target }) => {
      // For dev builds, use single-root devdist structure
      let url: string;
      if (target === 'devdist') {
        const devdistPath = packageSubPath.replace(/^packages\//, '');
        url = `/devdist/${devdistPath}/artifacts.json`;
      } else {
        url = `/${packageSubPath}/${target}/artifacts.json`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Manifest not found: ${url} (${response.status})`);
      }
      return (await response.json()) as T;
    },
    { packageSubPath, target }
  );
}

export async function loadTouchSpinRendererGlobals(
  page: Page,
  rendererName: string,
  options: RendererGlobalsOptions = {}
): Promise<void> {
  const {
    target = 'devdist',
    rendererPackage = `packages/renderers/${rendererName}`,
    loadCore = true,
    loadCss = true,
    cssKey = 'css',
    extraScripts = [],
    extraStyles = [],
    markReady = true,
    ...scriptOptions
  } = options;

  if (loadCore) {
    const coreManifest = await fetchManifest<{ iifeEntry?: string }>(page, 'packages/core', target);
    if (coreManifest.iifeEntry) {
      const coreUrl = artifactUrlFor('packages/core', 'iifeEntry');
      if (coreUrl) {
        await loadScript(page, coreUrl, scriptOptions);
      }
    }
  }

  const rendererManifest = await fetchManifest<Record<string, string | undefined>>(
    page,
    rendererPackage,
    target
  );
  // PR#3: Removed iifeComplete bundles, use iifeEntry only
  const rendererUrl = rendererArtifactUrlFor(rendererName, 'iifeEntry');

  if (!rendererUrl) {
    throw new Error(`Renderer IIFE missing in manifest for ${rendererName}`);
  }

  if (loadCss) {
    const cssEntry = rendererManifest[cssKey];
    if (cssEntry) {
      // For dev builds, use single-root devdist structure
      const cssUrl =
        target === 'devdist'
          ? `/devdist/${rendererPackage.replace(/^packages\//, '')}/${cssEntry}`
          : `/${rendererPackage}/${target}/${cssEntry}`;
      await loadStylesheet(page, cssUrl);
    }
  }

  for (const style of extraStyles) {
    await loadStylesheet(page, style);
  }

  for (const script of extraScripts) {
    await loadScript(page, script, scriptOptions);
  }

  await loadScript(page, rendererUrl, scriptOptions);

  // PR#3: After loading renderer IIFE, set it as the default renderer
  // The renderer IIFE exposes window.Bootstrap5Renderer (or Bootstrap3Renderer, etc.)
  // Core looks for globalThis.TouchSpinDefaultRenderer
  // Handle module object shape (same as core Option A fix)
  await page.evaluate((rendererName) => {
    const capitalizedName = rendererName.charAt(0).toUpperCase() + rendererName.slice(1);
    const rendererGlobalName = `${capitalizedName}Renderer`;
    const rendererModule = (window as any)[rendererGlobalName];

    if (rendererModule) {
      // Unwrap module object: { default, Bootstrap5Renderer, ... } or direct constructor
      const RendererCtor =
        rendererModule.default ?? rendererModule[rendererGlobalName] ?? rendererModule;

      (globalThis as any).TouchSpinDefaultRenderer = RendererCtor;
    }
  }, rendererName);

  if (markReady) {
    await page.evaluate(() => {
      if (!window.testPageReady) {
        window.testPageReady = true;
      }
    });
  }
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
  const url = `${baseUrl}/packages/adapters/jquery/dist/umd/jquery-touchspin-bs5.js`;

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
