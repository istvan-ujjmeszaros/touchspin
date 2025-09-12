/**
 * TouchSpin Web Component - Main entry point
 * Standards-based custom element for framework-agnostic usage
 */

import { TouchSpinElement } from './TouchSpinElement';

// Register the custom element
if (!customElements.get('touchspin-element')) {
  customElements.define('touchspin-element', TouchSpinElement);
}

// Export for manual registration with different names
export { TouchSpinElement };

// Export utilities for advanced usage
export { getSettingsFromAttributes, attributeToSetting, parseAttributeValue, OBSERVED_ATTRIBUTES } from './attribute-mapping';
export { bridgeEvents, EVENT_NAME_MAP, getAvailableEvents } from './event-bridge';

// Default export for convenience
export default TouchSpinElement;
