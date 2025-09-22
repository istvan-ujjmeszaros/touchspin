import type { Page } from '@playwright/test';
import type { TouchSpinCoreOptions } from '@touchspin/core';
import { setupLogging, installDomHelpers } from '@touchspin/core/test-helpers';

/* ──────────────────────────
 * jQuery plugin bootstrap (for jQuery pages)
 * ────────────────────────── */

export async function installJqueryPlugin(page: Page): Promise<void> {
  console.log('installJqueryPlugin: Starting installation...');
  await installDomHelpers(page);
  await page.evaluate(() => { if (!window.__ts) throw new Error('__ts not installed'); });

  // Check if already installed
  const isAlreadyInstalled = await page.evaluate(() => {
    return typeof window.touchSpinReady !== 'undefined' && window.touchSpinReady;
  });

  console.log('installJqueryPlugin: Already installed check:', isAlreadyInstalled);

  if (isAlreadyInstalled) {
    console.log('jQuery plugin already installed, skipping...');
    return;
  }

  await page.evaluate(async () => {
    try {
      const offenders = Array.from(document.querySelectorAll('script[src*="/src/"]')).map(
        (s) => (s as HTMLScriptElement).src
      );
      if (offenders.length) {
        throw new Error('Tests must not load /src/. Use /dist/index.js.\n' + offenders.join('\n'));
      }

      // Load jQuery from CDN for browser testing
      if (!window.jQuery) {
        console.log('Loading jQuery from CDN...');
        const script = document.createElement('script');
        script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);

        // Wait for jQuery to load
        await new Promise((resolve, reject) => {
          script.onload = () => {
            console.log('jQuery loaded successfully');
            resolve(undefined);
          };
          script.onerror = (err) => {
            console.error('jQuery load error:', err);
            reject(new Error('Failed to load jQuery from CDN'));
          };
          // Timeout after 10 seconds
          setTimeout(() => reject(new Error('jQuery load timeout')), 10000);
        });
      } else {
        console.log('jQuery already available');
      }

      const $ = window.jQuery;
      if (!$) {
        throw new Error('jQuery not available after loading');
      }

      const w = window as unknown as Record<string, unknown>;
      if (!w['jQuery']) w['jQuery'] = $;
      if (!w['$']) w['$'] = $;

      // Load the IIFE build which includes jQuery plugin + Bootstrap5 renderer
      console.log('Loading TouchSpin plugin...');
      const pluginScript = document.createElement('script');
      pluginScript.src = '/packages/jquery-plugin/dist/jquery-touchspin-bs5.js';
      document.head.appendChild(pluginScript);

      // Wait for plugin to load
      await new Promise((resolve, reject) => {
        pluginScript.onload = () => {
          console.log('Plugin script loaded, checking TouchSpin availability...');
          // Verify TouchSpin is available on jQuery
          if ($ && $.fn && ($.fn as any).TouchSpin) {
            console.log('TouchSpin plugin installed successfully');
            resolve(undefined);
          } else {
            console.error('TouchSpin not found on jQuery.fn after loading');
            reject(new Error('TouchSpin plugin not found on jQuery after loading'));
          }
        };
        pluginScript.onerror = (err) => {
          console.error('Plugin script load error:', err);
          reject(new Error('Failed to load jQuery TouchSpin plugin'));
        };
        setTimeout(() => reject(new Error('TouchSpin plugin load timeout')), 10000);
      });

      window.touchSpinReady = true;
      console.log('TouchSpin plugin installation complete');
    } catch (err) {
      console.error('installJqueryPlugin failed:', err);
      throw err;
    }
  });

  // Centralized logging (no jQuery-specific .on wiring)
  await setupLogging(page);
}

/* ──────────────────────────
 * jQuery init for a single input
 * ────────────────────────── */

export async function initializeTouchspinJQuery(
  page: Page,
  testId: string,
  options: Partial<TouchSpinCoreOptions> = {}
): Promise<void> {
  await installDomHelpers(page);
  await page.evaluate(() => { if (!window.__ts) throw new Error('__ts not installed'); });
  await setupLogging(page);

  // Ensure jQuery plugin is installed before proceeding
  const readyState = await page.evaluate(() => {
    return {
      touchSpinReady: typeof window.touchSpinReady !== 'undefined' ? window.touchSpinReady : false,
      hasJQuery: typeof window.jQuery !== 'undefined',
      hasTouchSpin: typeof window.jQuery !== 'undefined' && typeof window.jQuery.fn.TouchSpin !== 'undefined'
    };
  });

  if (!readyState.touchSpinReady || !readyState.hasJQuery || !readyState.hasTouchSpin) {
    console.error('Plugin state check failed:', readyState);
    throw new Error(`jQuery plugin not properly installed. State: ${JSON.stringify(readyState)}`);
  }

  await page.evaluate(({ id, opts }) => {
    try {
      // Verify jQuery and TouchSpin are available
      if (typeof window.jQuery === 'undefined') {
        throw new Error('jQuery is not available on window');
      }
      if (typeof window.jQuery.fn.TouchSpin === 'undefined') {
        throw new Error('TouchSpin plugin is not available on jQuery');
      }

      const $ = window.jQuery;
      const $input = $(`[data-testid="${id}"]`);

      if ($input.length === 0) {
        throw new Error(`No element found with testid: ${id}`);
      }

      if ((opts as Record<string, unknown>).initval !== undefined) {
        $input.val((opts as Record<string, unknown>).initval);
      }

      $input.TouchSpin(opts);
    } catch (err) {
      console.error('initializeTouchspinJQuery failed:', err);
      throw err;
    }
  }, { id: testId, opts: options });

  const sel = [
    `[data-testid=\"${testId}-wrapper\"][data-touchspin-injected]`,
    `[data-testid=\"${testId}\"][data-touchspin-injected]`,
  ].join(', ');
  await page.locator(sel).first().waitFor({ timeout: 5000 });
}

