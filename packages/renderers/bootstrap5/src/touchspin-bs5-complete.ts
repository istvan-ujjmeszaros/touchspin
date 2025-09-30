/**
 * TouchSpin Bootstrap 5 Complete IIFE Bundle
 *
 * All-in-one bundle including:
 * - TouchSpin Core
 * - Bootstrap 5 renderer
 * - Auto-setup for test fixtures
 * - No jQuery dependency
 */

import { TouchSpin } from '@touchspin/core';
import Bootstrap5Renderer from './Bootstrap5Renderer.js';

// Auto-install renderer as default (README-recommended approach)
(globalThis as any).TouchSpinDefaultRenderer = Bootstrap5Renderer;

// Expose everything needed for tests
(window as any).TouchSpinCore = TouchSpin;
(window as any).Bootstrap5Renderer = Bootstrap5Renderer;
(window as any).testPageReady = true;