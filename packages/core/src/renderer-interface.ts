// Renderer Interfaces for TouchSpin Core (Transitional + Future)
// This module provides shared TypeScript types for renderer contracts.

export type TSJQueryElements = {
  input: JQuery<HTMLInputElement>;
  up: JQuery<HTMLButtonElement>;
  down: JQuery<HTMLButtonElement>;
};

export type TSJQueryRenderer = {
  buildInputGroup: () => JQuery<unknown>;
  buildAdvancedInputGroup: (originalinput: JQuery<unknown>) => JQuery<unknown>;
  initElements: (container: JQuery<unknown>) => TSJQueryElements;
  hideEmptyPrefixPostfix: () => { _detached_prefix: JQuery<unknown> | null; _detached_postfix: JQuery<unknown> | null };
  // TODO: refine type for newsettings
  updatePrefixPostfix: (newsettings: Partial<unknown>, detached: { _detached_prefix: JQuery<unknown> | null; _detached_postfix: JQuery<unknown> | null }) => void;
};

export type TSJQueryRendererFactory = (
  jQuery: JQueryStatic,
  // TODO: refine type for settings
  settings: unknown,
  originalinput: JQuery<unknown>
) => TSJQueryRenderer;

export type TSElements = {
  input: HTMLInputElement;
  up: HTMLButtonElement;
  down: HTMLButtonElement;
  container: HTMLElement;
};

export type TSRenderer = {
  buildInputGroup: (inputEl: HTMLInputElement) => HTMLElement;
  initElements: (containerEl: HTMLElement) => TSElements;
  hideEmptyPrefixPostfix: () => { _detached_prefix: HTMLElement | null; _detached_postfix: HTMLElement | null };
  // TODO: refine type for newsettings
  updatePrefixPostfix: (newsettings: Partial<unknown>, detached: { _detached_prefix: HTMLElement | null; _detached_postfix: HTMLElement | null }) => void;
};
