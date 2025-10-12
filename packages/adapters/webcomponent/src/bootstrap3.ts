/**
 * TouchSpin Web Component - Bootstrap 3 renderer
 * Auto-defines <touchspin-input> with Bootstrap 3 styling
 */

import { Bootstrap3Renderer } from '@touchspin/renderer-bootstrap3';
import { autoDefine } from './auto-define.js';

// Auto-define the custom element with Bootstrap 3 renderer
autoDefine(Bootstrap3Renderer, 'bootstrap3');

export type { TouchSpinCoreOptions } from '@touchspin/core';
// Re-export for programmatic access
export { TouchSpinInput } from './TouchSpinInput.js';
