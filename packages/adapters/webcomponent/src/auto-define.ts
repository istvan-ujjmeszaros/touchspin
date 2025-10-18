/**
 * Auto-define utilities for idempotent custom element registration
 */

import type { RendererConstructor } from '@touchspin/core';
import { TouchSpinInput } from './TouchSpinInput.js';

// Track which renderer was used to define the element (dev-only)
let definedRenderer: string | null = null;

/**
 * Auto-define touchspin-input with the given renderer (idempotent)
 * @param renderer - Renderer class to use
 * @param rendererName - Name of the renderer (for dev warnings)
 */
export function autoDefine(renderer: RendererConstructor, rendererName: string): void {
  const tagName = 'touchspin-input';

  // Check if already defined
  const existing = customElements.get(tagName);

  if (existing) {
    // Already defined - check if it's a different renderer (dev-only warn)
    // Note: This warning is stripped in production builds by tree-shaking
    if (definedRenderer && definedRenderer !== rendererName) {
      console.warn(
        `[TouchSpin] Custom element "${tagName}" is already defined with renderer "${definedRenderer}". ` +
          `Skipping redefinition with "${rendererName}". ` +
          `Only one renderer can be used per page.`
      );
    }
    return;
  }

  // Create a custom element class that uses this renderer
  class TouchSpinInputWithRenderer extends TouchSpinInput {
    constructor() {
      super(renderer);
    }
  }

  // Define the element
  customElements.define(tagName, TouchSpinInputWithRenderer);
  definedRenderer = rendererName;
}
