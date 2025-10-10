/**
 * TouchSpin Web Component - Bootstrap 5 renderer
 * Auto-defines <touchspin-input> with Bootstrap 5 styling
 */

import { Bootstrap5Renderer } from '@touchspin/renderer-bootstrap5';
import { autoDefine } from './auto-define.js';

// Auto-define the custom element with Bootstrap 5 renderer
autoDefine(Bootstrap5Renderer, 'bootstrap5');

export type { TouchSpinCoreOptions } from '@touchspin/core';
// Re-export for programmatic access
export { TouchSpinInput } from './TouchSpinInput.js';
