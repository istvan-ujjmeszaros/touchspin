import type Bootstrap5Renderer from './Bootstrap5Renderer';

declare global {
  interface Window {
    TouchSpin: typeof import('@touchspin/core').TouchSpin;
    TouchSpinCore: typeof import('@touchspin/core').TouchSpinCore;
    getTouchSpin: typeof import('@touchspin/core').getTouchSpin;
    Bootstrap5Renderer: typeof Bootstrap5Renderer;
  }
}

export {};

