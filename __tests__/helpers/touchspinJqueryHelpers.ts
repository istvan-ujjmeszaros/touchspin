/**
 * jQuery-specific TouchSpin helpers
 * Focus on jQuery events, API commands, and event subscriptions
 *
 * For DOM interactions (clicks, keyboard, etc.), use touchspinApiHelpers instead
 */

import { Page } from '@playwright/test';

// ============ Triggerable Events (Commands) ============
// jQuery events you trigger to CONTROL TouchSpin
// All prefixed with 'trigger' for autocomplete

// Update TouchSpin settings
async function triggerTouchspinUpdateSettings(page: Page, testId: string, settings: any): Promise<void> {
  await page.evaluate(({ testId, settings }) => {
    const $ = (window as any).jQuery;
    if (!$) throw new Error('jQuery not found');
    $(`[data-testid="${testId}"]`).trigger('touchspin.updatesettings', settings);
  }, { testId, settings });
}

// Increment value by one step
async function triggerTouchspinUpOnce(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const $ = (window as any).jQuery;
    if (!$) throw new Error('jQuery not found');
    $(`[data-testid="${testId}"]`).trigger('touchspin.uponce');
  }, { testId });
}

// Decrement value by one step
async function triggerTouchspinDownOnce(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const $ = (window as any).jQuery;
    if (!$) throw new Error('jQuery not found');
    $(`[data-testid="${testId}"]`).trigger('touchspin.downonce');
  }, { testId });
}

// Start continuous up spinning
async function triggerTouchspinStartUpSpin(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const $ = (window as any).jQuery;
    if (!$) throw new Error('jQuery not found');
    $(`[data-testid="${testId}"]`).trigger('touchspin.startupspin');
  }, { testId });
}

// Start continuous down spinning
async function triggerTouchspinStartDownSpin(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const $ = (window as any).jQuery;
    if (!$) throw new Error('jQuery not found');
    $(`[data-testid="${testId}"]`).trigger('touchspin.startdownspin');
  }, { testId });
}

// Stop any spinning
async function triggerTouchspinStopSpin(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const $ = (window as any).jQuery;
    if (!$) throw new Error('jQuery not found');
    $(`[data-testid="${testId}"]`).trigger('touchspin.stopspin');
  }, { testId });
}

// ============ Event Subscription Helpers ============
// Subscribe to events EMITTED BY TouchSpin
// All prefixed with 'subscribe' for autocomplete

// Subscribe to min boundary event
async function subscribeTouchspinOnMin(page: Page, testId: string, callback?: Function): Promise<void> {
  await page.evaluate(({ testId }) => {
    const $ = (window as any).jQuery;
    if (!$) throw new Error('jQuery not found');
    $(`[data-testid="${testId}"]`).on('touchspin.on.min', function(e, value) {
      // Log to event log system if available
      if ((window as any).logEvent) {
        (window as any).logEvent('touchspin.on.min', {
          target: testId,
          value: value?.toString() || '',
          type: 'touchspin'
        });
      }
    });
  }, { testId });
}

// Subscribe to max boundary event
async function subscribeTouchspinOnMax(page: Page, testId: string, callback?: Function): Promise<void> {
  await page.evaluate(({ testId }) => {
    const $ = (window as any).jQuery;
    if (!$) throw new Error('jQuery not found');
    $(`[data-testid="${testId}"]`).on('touchspin.on.max', function(e, value) {
      if ((window as any).logEvent) {
        (window as any).logEvent('touchspin.on.max', {
          target: testId,
          value: value?.toString() || '',
          type: 'touchspin'
        });
      }
    });
  }, { testId });
}

// Subscribe to start spin event
async function subscribeTouchspinOnStartSpin(page: Page, testId: string, callback?: Function): Promise<void> {
  await page.evaluate(({ testId }) => {
    const $ = (window as any).jQuery;
    if (!$) throw new Error('jQuery not found');
    $(`[data-testid="${testId}"]`).on('touchspin.on.startspin', function(e, value) {
      if ((window as any).logEvent) {
        (window as any).logEvent('touchspin.on.startspin', {
          target: testId,
          value: value?.toString() || '',
          type: 'touchspin'
        });
      }
    });
  }, { testId });
}

// Subscribe to stop spin event
async function subscribeTouchspinOnStopSpin(page: Page, testId: string, callback?: Function): Promise<void> {
  await page.evaluate(({ testId }) => {
    const $ = (window as any).jQuery;
    if (!$) throw new Error('jQuery not found');
    $(`[data-testid="${testId}"]`).on('touchspin.on.stopspin', function(e, value) {
      if ((window as any).logEvent) {
        (window as any).logEvent('touchspin.on.stopspin', {
          target: testId,
          value: value?.toString() || '',
          type: 'touchspin'
        });
      }
    });
  }, { testId });
}

// Subscribe to start up spin event
async function subscribeTouchspinOnStartUpSpin(page: Page, testId: string, callback?: Function): Promise<void> {
  await page.evaluate(({ testId }) => {
    const $ = (window as any).jQuery;
    if (!$) throw new Error('jQuery not found');
    $(`[data-testid="${testId}"]`).on('touchspin.on.startupspin', function(e, value) {
      if ((window as any).logEvent) {
        (window as any).logEvent('touchspin.on.startupspin', {
          target: testId,
          value: value?.toString() || '',
          type: 'touchspin'
        });
      }
    });
  }, { testId });
}

// Subscribe to start down spin event
async function subscribeTouchspinOnStartDownSpin(page: Page, testId: string, callback?: Function): Promise<void> {
  await page.evaluate(({ testId }) => {
    const $ = (window as any).jQuery;
    if (!$) throw new Error('jQuery not found');
    $(`[data-testid="${testId}"]`).on('touchspin.on.startdownspin', function(e, value) {
      if ((window as any).logEvent) {
        (window as any).logEvent('touchspin.on.startdownspin', {
          target: testId,
          value: value?.toString() || '',
          type: 'touchspin'
        });
      }
    });
  }, { testId });
}

// Subscribe to stop up spin event
async function subscribeTouchspinOnStopUpSpin(page: Page, testId: string, callback?: Function): Promise<void> {
  await page.evaluate(({ testId }) => {
    const $ = (window as any).jQuery;
    if (!$) throw new Error('jQuery not found');
    $(`[data-testid="${testId}"]`).on('touchspin.on.stopupspin', function(e, value) {
      if ((window as any).logEvent) {
        (window as any).logEvent('touchspin.on.stopupspin', {
          target: testId,
          value: value?.toString() || '',
          type: 'touchspin'
        });
      }
    });
  }, { testId });
}

// Subscribe to stop down spin event
async function subscribeTouchspinOnStopDownSpin(page: Page, testId: string, callback?: Function): Promise<void> {
  await page.evaluate(({ testId }) => {
    const $ = (window as any).jQuery;
    if (!$) throw new Error('jQuery not found');
    $(`[data-testid="${testId}"]`).on('touchspin.on.stopdownspin', function(e, value) {
      if ((window as any).logEvent) {
        (window as any).logEvent('touchspin.on.stopdownspin', {
          target: testId,
          value: value?.toString() || '',
          type: 'touchspin'
        });
      }
    });
  }, { testId });
}

// Subscribe to change event
async function subscribeTouchspinChange(page: Page, testId: string, callback?: Function): Promise<void> {
  await page.evaluate(({ testId }) => {
    const $ = (window as any).jQuery;
    if (!$) throw new Error('jQuery not found');
    $(`[data-testid="${testId}"]`).on('change', function(e) {
      if ((window as any).logEvent) {
        const value = (e.target as HTMLInputElement).value;
        (window as any).logEvent('change', {
          target: testId,
          value: value,
          type: 'native'
        });
      }
    });
  }, { testId });
}

// ============ jQuery API Command Helpers ============
// Direct jQuery API calls (alternative to trigger events)

// Generic jQuery TouchSpin command executor
async function jQueryTouchSpin(page: Page, testId: string, command: string, ...args: any[]): Promise<any> {
  return await page.evaluate(({ testId, command, args }) => {
    const $ = (window as any).jQuery;
    if (!$) throw new Error('jQuery not found');
    const $input = $(`[data-testid="${testId}"]`);
    if ($input.length === 0) {
      throw new Error(`Input element not found for testId: ${testId}`);
    }
    return $input.TouchSpin(command, ...args);
  }, { testId, command, args });
}

// Get value using jQuery API
async function jQueryGetValue(page: Page, testId: string): Promise<number> {
  return await jQueryTouchSpin(page, testId, 'get');
}

// Set value using jQuery API
async function jQuerySetValue(page: Page, testId: string, value: number | string): Promise<void> {
  await jQueryTouchSpin(page, testId, 'set', value);
}

// Increment once using jQuery API
async function jQueryUpOnce(page: Page, testId: string): Promise<void> {
  await jQueryTouchSpin(page, testId, 'uponce');
}

// Decrement once using jQuery API
async function jQueryDownOnce(page: Page, testId: string): Promise<void> {
  await jQueryTouchSpin(page, testId, 'downonce');
}

// Start up spin using jQuery API
async function jQueryStartUpSpin(page: Page, testId: string): Promise<void> {
  await jQueryTouchSpin(page, testId, 'startupspin');
}

// Start down spin using jQuery API
async function jQueryStartDownSpin(page: Page, testId: string): Promise<void> {
  await jQueryTouchSpin(page, testId, 'startdownspin');
}

// Stop spinning using jQuery API
async function jQueryStopSpin(page: Page, testId: string): Promise<void> {
  await jQueryTouchSpin(page, testId, 'stopspin');
}

// Update settings using jQuery API
async function jQueryUpdateSettings(page: Page, testId: string, settings: any): Promise<void> {
  await jQueryTouchSpin(page, testId, 'updatesettings', settings);
}

// Destroy TouchSpin using jQuery API
async function jQueryDestroy(page: Page, testId: string): Promise<void> {
  await jQueryTouchSpin(page, testId, 'destroy');
}

// Initialize TouchSpin using jQuery API
async function jQueryInitialize(page: Page, testId: string, options: any = {}): Promise<void> {
  await page.evaluate(({ testId, options }) => {
    const $ = (window as any).jQuery;
    if (!$) throw new Error('jQuery not found');
    const $input = $(`[data-testid="${testId}"]`);
    if ($input.length === 0) {
      throw new Error(`Input element not found for testId: ${testId}`);
    }
    // If initval is specified, set the input value before initializing TouchSpin
    if (options.initval !== undefined) {
      $input.val(options.initval);
    }
    $input.TouchSpin(options);
  }, { testId, options });
}

export {
  // ============ Triggerable Events (Commands) ============
  triggerTouchspinUpdateSettings,
  triggerTouchspinUpOnce,
  triggerTouchspinDownOnce,
  triggerTouchspinStartUpSpin,
  triggerTouchspinStartDownSpin,
  triggerTouchspinStopSpin,

  // ============ Event Subscription Helpers ============
  subscribeTouchspinOnMin,
  subscribeTouchspinOnMax,
  subscribeTouchspinOnStartSpin,
  subscribeTouchspinOnStopSpin,
  subscribeTouchspinOnStartUpSpin,
  subscribeTouchspinOnStartDownSpin,
  subscribeTouchspinOnStopUpSpin,
  subscribeTouchspinOnStopDownSpin,
  subscribeTouchspinChange,

  // ============ jQuery API Command Helpers ============
  jQueryTouchSpin,
  jQueryGetValue,
  jQuerySetValue,
  jQueryUpOnce,
  jQueryDownOnce,
  jQueryStartUpSpin,
  jQueryStartDownSpin,
  jQueryStopSpin,
  jQueryUpdateSettings,
  jQueryDestroy,
  jQueryInitialize
};