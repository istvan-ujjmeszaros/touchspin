/**
 * TouchSpin Web Component - Tailwind renderer
 * Auto-defines <touchspin-input> with Tailwind CSS styling
 */

import { TailwindRenderer } from '@touchspin/renderer-tailwind';
import { autoDefine } from './auto-define.js';

// Auto-define the custom element with Tailwind renderer
autoDefine(TailwindRenderer, 'tailwind');

export type { TouchSpinCoreOptions } from '@touchspin/core';
// Re-export for programmatic access
export { TouchSpinInput } from './TouchSpinInput.js';
