/**
 * TouchSpin Web Component - Bootstrap 4 renderer
 * Auto-defines <touchspin-input> with Bootstrap 4 styling
 */

import { Bootstrap4Renderer } from '@touchspin/renderer-bootstrap4';
import { autoDefine } from './auto-define.js';

// Auto-define the custom element with Bootstrap 4 renderer
autoDefine(Bootstrap4Renderer, 'bootstrap4');

export type { TouchSpinCoreOptions } from '@touchspin/core';
// Re-export for programmatic access
export { TouchSpinInput } from './TouchSpinInput.js';
