import AbstractRenderer from './AbstractRenderer.js';

/**
 * RawRenderer - Minimal renderer that adds no UI elements
 * Allows TouchSpin to work with just the input element (keyboard, wheel, events still work)
 * Perfect for custom implementations or when only programmatic API is needed
 */
class RawRenderer extends AbstractRenderer {
  init() {
    // Does nothing - no additional UI elements
    // Core still handles the input element directly
    // Keyboard, wheel, ARIA, and programmatic methods still work via core
  }
  
  teardown() {
    // Nothing to clean up - no UI was added
    // Core will handle input element cleanup
  }
}

export default RawRenderer;