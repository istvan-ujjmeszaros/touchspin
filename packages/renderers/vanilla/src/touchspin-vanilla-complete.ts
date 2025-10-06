/**
 * TouchSpin Vanilla Complete IIFE Bundle
 *
 * Packages the TouchSpin core together with the vanilla renderer so legacy
 * integration paths can load a single global script without bundlers.
 */
import { TouchSpin } from '@touchspin/core';
import VanillaRenderer from './VanillaRenderer.js';

const globalScope: any = globalThis as any;

globalScope.TouchSpinCore = TouchSpin;
globalScope.TouchSpinVanillaRenderer = VanillaRenderer;
globalScope.TouchSpinDefaultRenderer = VanillaRenderer;
