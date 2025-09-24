import type { Page } from '@playwright/test';
import type { TouchSpinCoreOptions } from '@touchspin/core';
import { setupLogging, installDomHelpers, initializeTestEnvironment, diagnoseEnvironment } from '@touchspin/core/test-helpers';

/* ──────────────────────────
 * jQuery plugin bootstrap (for jQuery pages)
 * ────────────────────────── */

export async function installJqueryPlugin(page: Page): Promise<void> {
  console.log('installJqueryPlugin: Starting installation...');

  // Check if already installed
  const isAlreadyInstalled = await page.evaluate(() => {
    return typeof window.touchSpinReady !== 'undefined' && window.touchSpinReady;
  });

  console.log('installJqueryPlugin: Already installed check:', isAlreadyInstalled);

  if (isAlreadyInstalled) {
    console.log('jQuery plugin already installed, skipping...');
    return;
  }

  // Verify no /src/ scripts are loaded
  await page.evaluate(() => {
    const offenders = Array.from(document.querySelectorAll('script[src*="/src/"]')).map(
      (s) => (s as HTMLScriptElement).src
    );
    if (offenders.length) {
      throw new Error('Tests must not load /src/. Use /dist/index.js.\n' + offenders.join('\n'));
    }
  });

  try {
    // Use the new centralized test environment initializer
    await initializeTestEnvironment(page, {
      jquery: true,
      debug: true  // Enable debug for better error reporting
    });

    console.log('TouchSpin plugin installation complete');
  } catch (err) {
    // Get diagnostics for better error reporting
    const diagnostics = await diagnoseEnvironment(page);
    console.error('Installation diagnostics:', diagnostics);
    console.error('installJqueryPlugin failed:', err);
    throw err;
  }
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

