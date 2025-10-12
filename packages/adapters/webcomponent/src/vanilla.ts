/**
 * TouchSpin Web Component - Vanilla renderer
 * Auto-defines <touchspin-input> with Vanilla CSS styling
 */

import { VanillaRenderer } from '@touchspin/renderer-vanilla';
import { autoDefine } from './auto-define.js';

// Auto-define the custom element with Vanilla renderer
autoDefine(VanillaRenderer, 'vanilla');

export type { TouchSpinCoreOptions } from '@touchspin/core';
// Re-export for programmatic access
export { TouchSpinInput } from './TouchSpinInput.js';
