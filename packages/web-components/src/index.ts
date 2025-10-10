/**
 * TouchSpin Web Component - Main entry point
 * Standards-based custom element for framework-agnostic usage
 */

import { TouchSpinInput } from './TouchSpinInput.js';

// Register the custom element
if (!customElements.get('touchspin-input')) {
  customElements.define('touchspin-input', TouchSpinInput);
}

// Export for manual registration with different names
export { TouchSpinInput };

// Export utilities for advanced usage
export {
  attributeToSetting,
  getSettingsFromAttributes,
  OBSERVED_ATTRIBUTES,
  parseAttributeValue,
} from './attribute-mapping.js';
export { bridgeEvents, EVENT_NAME_MAP } from './event-bridge.js';

// Default export for convenience
export default TouchSpinInput;
