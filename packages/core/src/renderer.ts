import type { RendererCoreBridge } from './AbstractRendererBase.js';

export type {
  InferOptionsFromSchema,
  RendererCoreBridge,
  RendererOptionDef,
  RendererOptionKind,
  RendererOptionSchema,
} from './AbstractRendererBase.js';
export { default as AbstractRendererBase } from './AbstractRendererBase.js';
export { default as AbstractRendererSimple } from './AbstractRendererSimple.js';
export { default as AbstractRendererSurgical } from './AbstractRendererSurgical.js';

// Minimal instance surface used by core. Renderers may implement more.
export interface Renderer {
  init(): void;
  finalizeWrapperAttributes(): void;
  teardown?(): void;
}

// Type alias for backward compatibility - same as RendererCoreBridge
export type { RendererCoreBridge as CoreFacade } from './AbstractRendererBase.js';

export type RendererConstructor = new (
  inputEl: HTMLInputElement,
  settings: Readonly<Record<string, unknown>>,
  core: RendererCoreBridge
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
