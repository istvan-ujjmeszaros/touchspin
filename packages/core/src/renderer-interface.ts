// Renderer Interfaces for TouchSpin Core (DOM-only)
// This module provides shared TypeScript types for renderer contracts.

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
  updatePrefixPostfix: (newsettings: Partial<Record<string, unknown>>, detached: { _detached_prefix: HTMLElement | null; _detached_postfix: HTMLElement | null }) => void;
};
