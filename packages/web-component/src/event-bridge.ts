/**
 * Event bridging utilities for TouchSpin Web Component
 * Converts TouchSpin core events to CustomEvents
 */

import { CORE_EVENTS } from '@touchspin/core';

/**
 * Map core event names to custom event names
 */
export const EVENT_NAME_MAP: Record<(typeof CORE_EVENTS)[keyof typeof CORE_EVENTS], string> = {
  [CORE_EVENTS.MIN]: 'touchspin-min',
  [CORE_EVENTS.MAX]: 'touchspin-max',
  [CORE_EVENTS.START_SPIN]: 'touchspin-start-spin',
  [CORE_EVENTS.START_UP]: 'touchspin-start-up',
  [CORE_EVENTS.START_DOWN]: 'touchspin-start-down',
  [CORE_EVENTS.STOP_SPIN]: 'touchspin-stop-spin',
  [CORE_EVENTS.STOP_UP]: 'touchspin-stop-up',
  [CORE_EVENTS.STOP_DOWN]: 'touchspin-stop-down'
};

/**
 * Bridge TouchSpin core events to CustomEvents
 * @param {Object} touchspinInstance - TouchSpin core instance
 * @param {HTMLElement} element - Custom element to dispatch events from
 * @returns {Function[]} - Array of cleanup functions
 */
export function bridgeEvents(
  touchspinInstance: { getValue: () => number },
  element: HTMLElement
): Array<() => void> {
  const cleanupFunctions: Array<() => void> = [];

  // Core DOM event name to web-component event name mapping
  const domToCustomEventMap: Record<string, string> = {
    'touchspin.on.min': 'touchspin-min',
    'touchspin.on.max': 'touchspin-max',
    'touchspin.on.startspin': 'touchspin-start-spin',
    'touchspin.on.startupspin': 'touchspin-start-up',
    'touchspin.on.startdownspin': 'touchspin-start-down',
    'touchspin.on.stopspin': 'touchspin-stop-spin',
    'touchspin.on.stopupspin': 'touchspin-stop-up',
    'touchspin.on.stopdownspin': 'touchspin-stop-down'
  };

  // Listen for Core DOM CustomEvents and re-dispatch with web-component naming
  Object.entries(domToCustomEventMap).forEach(([domEventName, customEventName]) => {
    const handler = (e: Event) => {
      const customEvent = new CustomEvent(customEventName, {
        detail: {
          value: touchspinInstance.getValue(),
          instance: touchspinInstance,
          originalEvent: e
        },
        bubbles: true,
        cancelable: true
      });

      element.dispatchEvent(customEvent);
    };

    // Listen for DOM events dispatched by TouchSpin Core
    const input = element.querySelector('input');
    if (input) {
      input.addEventListener(domEventName, handler);
      cleanupFunctions.push(() => input.removeEventListener(domEventName, handler));
    }
  });

  // Bridge input change events
  const input = element.querySelector('input');
  if (input) {
    const handleInputChange = (e: Event) => {
      const customEvent = new CustomEvent('touchspin-change', {
        detail: {
          value: (e.target as HTMLInputElement).value,
          originalEvent: e,
          instance: touchspinInstance
        },
        bubbles: true,
        cancelable: true
      });

      element.dispatchEvent(customEvent);
    };

    input.addEventListener('change', handleInputChange);
    cleanupFunctions.push(() => input.removeEventListener('change', handleInputChange));
  }

  return cleanupFunctions;
}

/**
 * Get all available TouchSpin event names for documentation
 * @returns {string[]} - Array of custom event names
 */
export function getAvailableEvents(): string[] {
  return [
    ...Object.values(EVENT_NAME_MAP),
    'touchspin-change' // Input change event
  ];
}
