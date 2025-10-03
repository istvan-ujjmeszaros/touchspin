/**
 * TouchSpin Bootstrap 3 Complete IIFE Bundle
 *
 * All-in-one bundle including:
 * - TouchSpin Core
 * - Bootstrap 3 renderer
 * - Auto-setup for test fixtures
 * - No jQuery dependency
 */

import { TouchSpin } from '@touchspin/core';
import Bootstrap3Renderer from './Bootstrap3Renderer.js';

// Auto-install renderer as default (README-recommended approach)
(globalThis as any).TouchSpinDefaultRenderer = Bootstrap3Renderer;

// Expose everything needed for tests
(window as any).TouchSpinCore = TouchSpin;
(window as any).Bootstrap3Renderer = Bootstrap3Renderer;
(window as any).testPageReady = true;
