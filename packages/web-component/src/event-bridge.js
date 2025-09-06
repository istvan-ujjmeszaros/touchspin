/**
 * Event bridging utilities for TouchSpin Web Component
 * Converts TouchSpin core events to CustomEvents
 */

import { CORE_EVENTS } from '@touchspin/core';

/**
 * Map core event names to custom event names
 */
export const EVENT_NAME_MAP = {
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
 * @returns {Function[]} - Array of unsubscribe functions
 */
export function bridgeEvents(touchspinInstance, element) {
  const unsubscribers = [];
  
  // Bridge all core events
  for (const [coreEvent, customEventName] of Object.entries(EVENT_NAME_MAP)) {
    const unsubscribe = touchspinInstance.on(coreEvent, () => {
      const customEvent = new CustomEvent(customEventName, {
        detail: { 
          value: touchspinInstance.getValue(),
          instance: touchspinInstance 
        },
        bubbles: true,
        cancelable: true
      });
      
      element.dispatchEvent(customEvent);
    });
    
    unsubscribers.push(unsubscribe);
  }
  
  // Bridge input change events
  const input = element.querySelector('input');
  if (input) {
    const handleInputChange = (e) => {
      const customEvent = new CustomEvent('touchspin-change', {
        detail: {
          value: e.target.value,
          originalEvent: e,
          instance: touchspinInstance
        },
        bubbles: true,
        cancelable: true
      });
      
      element.dispatchEvent(customEvent);
    };
    
    input.addEventListener('change', handleInputChange);
    
    // Return cleanup function that includes input listener cleanup
    const originalCleanup = () => {
      unsubscribers.forEach(unsub => unsub());
    };
    
    unsubscribers.push(() => {
      input.removeEventListener('change', handleInputChange);
    });
  }
  
  return unsubscribers;
}

/**
 * Get all available TouchSpin event names for documentation
 * @returns {string[]} - Array of custom event names
 */
export function getAvailableEvents() {
  return [
    ...Object.values(EVENT_NAME_MAP),
    'touchspin-change' // Input change event
  ];
}