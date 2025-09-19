export { default as AbstractRenderer } from './AbstractRenderer';
export type {
  RendererOptionKind,
  RendererOptionDef,
  RendererOptionSchema,
  InferOptionsFromSchema,
} from './AbstractRenderer';

// Canonical Renderer interface and constructor type for TouchSpin
// Exposed under the subpath '@touchspin/core/renderer'
import type { TouchSpinCoreOptions } from './index';

// Minimal instance surface used by core. Renderers may implement more.
export interface Renderer {
  init(): void;
  finalizeWrapperAttributes(): void;
  teardown?(): void;
}

// Constructor signature for renderer classes
export type CoreFacade = {
  attachUpEvents: (el: HTMLElement | null) => void;
  attachDownEvents: (el: HTMLElement | null) => void;
  observeSetting: (key: string, cb: (value: unknown) => void) => () => void;
};

export type RendererConstructor = new (
  inputEl: HTMLInputElement,
  settings: Readonly<Record<string, unknown>>,
  core: CoreFacade
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
