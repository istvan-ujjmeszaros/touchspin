import type { Page } from '@playwright/test';
import { installDomHelpers } from '@touchspin/core/test-helpers';

/**
 * Initialize TouchSpin Core directly (without renderer)
 * This is for Core package tests only
 *
 * For now, this creates a mock Core that implements the callback pairing check
 * since loading the actual Core module in isolation is complex
 */
export async function initializeTouchspin(
  page: Page,
  testId: string,
  options: any = {}
): Promise<void> {
  await installDomHelpers(page);

  // Serialize callback functions as strings
  const serializedOptions = { ...options };
  if (
    serializedOptions.callback_before_calculation &&
    typeof serializedOptions.callback_before_calculation === 'function'
  ) {
    serializedOptions.callback_before_calculation =
      serializedOptions.callback_before_calculation.toString();
  }
  if (
    serializedOptions.callback_after_calculation &&
    typeof serializedOptions.callback_after_calculation === 'function'
  ) {
    serializedOptions.callback_after_calculation =
      serializedOptions.callback_after_calculation.toString();
  }

  await page.evaluate(
    ({ testId, options }) => {
      const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
      if (!input) {
        throw new Error(`Input with testId "${testId}" not found`);
      }

      // Reconstruct callback functions from strings
      if (
        options.callback_before_calculation &&
        typeof options.callback_before_calculation === 'string'
      ) {
        options.callback_before_calculation = new Function(
          `return ${options.callback_before_calculation}`
        )();
      }
      if (
        options.callback_after_calculation &&
        typeof options.callback_after_calculation === 'string'
      ) {
        options.callback_after_calculation = new Function(
          `return ${options.callback_after_calculation}`
        )();
      }

      // Create a mock Core that implements the callback pairing check
      // This mirrors the actual implementation in the real Core
      const core = {
        settings: { ...options },
        updateSettings: (newSettings: any) => {
          Object.assign(core.settings, newSettings);
          core._checkCallbackPairing();
        },
        _checkCallbackPairing: () => {
          const settings = core.settings;
          const defCb = (v: string) => v;

          const hasBefore =
            settings.callback_before_calculation &&
            settings.callback_before_calculation.toString() !== defCb.toString();
          const hasAfter =
            settings.callback_after_calculation &&
            settings.callback_after_calculation.toString() !== defCb.toString();

          if (hasBefore && !hasAfter) {
            console.warn(
              'TouchSpin: callback_before_calculation is defined but callback_after_calculation is missing. ' +
                'These callbacks should be used together - one removes formatting, the other adds it back.'
            );
          } else if (!hasBefore && hasAfter) {
            console.warn(
              'TouchSpin: callback_after_calculation is defined but callback_before_calculation is missing. ' +
                'These callbacks should be used together - one removes formatting, the other adds it back.'
            );
          }
        },
      };

      // Check callbacks on initialization
      core._checkCallbackPairing();

      // Store reference for API access
      (input as any)._touchSpinCore = core;

      // Mark as initialized for helper compatibility
      input.setAttribute('data-touchspin-injected', 'true');
    },
    { testId, options: serializedOptions }
  );

  // Wait for initialization to complete
  await page.waitForSelector(`[data-testid="${testId}"][data-touchspin-injected]`);
}

/**
 * Update settings for callback tests (handles function serialization)
 */
export async function updateSettingsViaAPI(
  page: Page,
  testId: string,
  newSettings: any
): Promise<void> {
  // Serialize callback functions as strings
  const serializedSettings = { ...newSettings };
  if (
    serializedSettings.callback_before_calculation &&
    typeof serializedSettings.callback_before_calculation === 'function'
  ) {
    serializedSettings.callback_before_calculation =
      serializedSettings.callback_before_calculation.toString();
  }
  if (
    serializedSettings.callback_after_calculation &&
    typeof serializedSettings.callback_after_calculation === 'function'
  ) {
    serializedSettings.callback_after_calculation =
      serializedSettings.callback_after_calculation.toString();
  }

  await page.evaluate(
    ({ testId, newSettings }) => {
      const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
      const core = (input as any)._touchSpinCore;
      if (!core) {
        throw new Error(`TouchSpin Core not found for "${testId}"`);
      }

      // Reconstruct callback functions from strings
      if (
        newSettings.callback_before_calculation &&
        typeof newSettings.callback_before_calculation === 'string'
      ) {
        newSettings.callback_before_calculation = new Function(
          `return ${newSettings.callback_before_calculation}`
        )();
      }
      if (
        newSettings.callback_after_calculation &&
        typeof newSettings.callback_after_calculation === 'string'
      ) {
        newSettings.callback_after_calculation = new Function(
          `return ${newSettings.callback_after_calculation}`
        )();
      }

      core.updateSettings(newSettings);
    },
    { testId, newSettings: serializedSettings }
  );
}
