/**
 * TouchSpin Bootstrap 4 Complete IIFE Bundle
 *
 * All-in-one bundle including:
 * - TouchSpin Core
 * - Bootstrap 4 renderer
 * - Auto-setup for test fixtures
 * - No jQuery dependency
 */

import { TouchSpin } from '@touchspin/core';
import Bootstrap4Renderer from './Bootstrap4Renderer.js';

// Auto-install renderer as default (README-recommended approach)
(globalThis as any).TouchSpinDefaultRenderer = Bootstrap4Renderer;

// Expose everything needed for tests
(window as any).TouchSpinCore = TouchSpin;
(window as any).Bootstrap4Renderer = Bootstrap4Renderer;
(window as any).testPageReady = true;