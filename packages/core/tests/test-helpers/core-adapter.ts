import type { Page } from '@playwright/test';
import type { TouchSpinCoreOptions } from '@touchspin/core';
import { installDomHelpers } from '@touchspin/core/test-helpers';

// Extend window interface for TouchSpin global
declare global {
  interface Window {
    TouchSpinCore?: {
      TouchSpin: (input: HTMLInputElement, options?: Partial<TouchSpinCoreOptions>) => void;
    };
  }
}

/**
 * Initialize TouchSpin Core directly (without renderer)
 * Uses the real TouchSpin global from the IIFE bundle loaded in the fixture
 */
export async function initializeTouchspin(
  page: Page,
  testId: string,
  options: Partial<TouchSpinCoreOptions> = {}
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

      // Use the REAL TouchSpin from the IIFE bundle (TouchSpinCore.TouchSpin)
      window.TouchSpinCore!.TouchSpin(input, options);
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
  newSettings: Partial<TouchSpinCoreOptions>
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

      // Get the real TouchSpin instance using getTouchSpin
      const spinner = (window as any).TouchSpinCore.getTouchSpin(input);
      if (!spinner) {
        throw new Error(`TouchSpin instance not found for "${testId}"`);
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

      spinner.updateSettings(newSettings);
    },
    { testId, newSettings: serializedSettings }
  );
}
