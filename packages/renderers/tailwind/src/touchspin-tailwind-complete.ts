/**
 * TouchSpin Tailwind Complete IIFE Bundle
 *
 * All-in-one bundle including:
 * - TouchSpin Core
 * - Tailwind renderer
 * - Auto-setup for test fixtures
 * - No jQuery dependency
 */

import { TouchSpin } from '@touchspin/core';
import TailwindRenderer from './TailwindRenderer.js';

// Auto-install renderer as default (README-recommended approach)
(globalThis as any).TouchSpinDefaultRenderer = TailwindRenderer;

// Expose everything needed for tests
(window as any).TouchSpinCore = TouchSpin;
(window as any).TailwindRenderer = TailwindRenderer;
(window as any).testPageReady = true;
