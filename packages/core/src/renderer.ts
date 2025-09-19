export { default as AbstractRenderer } from './AbstractRenderer';
export type {
  RendererOptionKind,
  RendererOptionDef,
  RendererOptionSchema,
  InferOptionsFromSchema,
} from './AbstractRenderer';

// Canonical Renderer interface and constructor type for TouchSpin
// Exposed under the subpath '@touchspin/core/renderer'
import type { TouchSpinCoreOptions, TouchSpinCore } from './index';

// Minimal instance surface used by core. Renderers may implement more.
export interface Renderer {
  init(): void;
  finalizeWrapperAttributes(): void;
  teardown?(): void;
}

// Constructor signature for renderer classes
export type RendererConstructor = new (
  inputEl: HTMLInputElement,
  settings: Readonly<TouchSpinCoreOptions>,
  core: unknown
) => Renderer;

// Optionally exposed element bag type for renderer implementations
export type RendererElements = {
  input: HTMLInputElement;
  up: HTMLButtonElement | HTMLElement;
  down: HTMLButtonElement | HTMLElement;
  container: HTMLElement;
};

// Back-compat type aliases to preserve existing imports
export type TSRenderer = RendererConstructor;
export type TSElements = RendererElements;
